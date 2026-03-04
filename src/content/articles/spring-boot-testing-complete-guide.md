---
title: "Spring Boot Testing: From Mock Confusion to Production Confidence"
description: "Follow Alex's journey from production bugs to testing mastery. Learn when to use @Mock vs @MockBean, optimize @SpringBootTest, master @DataJpaTest, and choose between WebTestClient and MockMvc with practical, battle-tested examples."
publishDate: 2026-02-15
author: "Prashant Chaturvedi"
tags: ["Spring Boot", "Testing", "JUnit", "Mockito", "Integration Testing", "Java", "Kotlin"]
readTime: "35 min read"
---

# Spring Boot Testing: From Mock Confusion to Production Confidence

## Prologue: The Breaking Point

The alert came at 3:47 AM. Alex's phone buzzed with the dreaded PagerDuty notification: "Payment service down. 500 errors spiking."

Alex stumbled to the laptop, coffee forgotten. The logs told a story he'd seen too many times. The `PaymentGatewayClient`—the one he'd mocked in unit tests—was throwing `NullPointerException` in production. But wait. The unit tests passed. All 47 of them. Green checkmarks mocking him from the CI dashboard.

The bug? A subtle difference between how he'd mocked the client's response and how the actual service behaved. His `@Mock` annotation had created a perfect stunt double. Too perfect. It performed exactly as scripted, never questioning the script. The real service had validation Alex never tested. Boundary conditions his mocks happily ignored.

Three hours later, the rollback completed. Alex sat in the gray dawn, staring at the test suite that betrayed him. Forty-seven tests. Zero confidence.

That morning, Alex made a decision. He would understand Spring Boot testing—not just copy annotations from Stack Overflow. He would know when to mock and when to integrate. When to slice the context and when to load the full orchestra.

This is Alex's journey. It might be yours too.

The core question that haunted him: **Unit or integration—when does mocking betray you?**

## Chapter 1: The Mock Identity Crisis

Alex started where most developers do: confused about three annotations that looked identical but behaved like strangers.

His first attempt after the incident was textbook. He opened `PaymentServiceTest.java` and typed:

```java
@ExtendWith(MockitoExtension.class)
class PaymentServiceTest {
    
    @Mock
    private PaymentGatewayClient gatewayClient;
    
    @InjectMocks
    private PaymentService paymentService;
    
    @Test
    void shouldProcessPayment() {
        when(gatewayClient.charge(any()))
            .thenReturn(new ChargeResponse("SUCCESS", "txn-123"));
        
        PaymentResult result = paymentService.process(new PaymentRequest("card-123", 99.99));
        
        assertThat(result.status()).isEqualTo("SUCCESS");
        verify(gatewayClient).charge(any());
    }
}
```

The test passed. Alex smiled. Then he remembered the 3 AM incident.

The problem wasn't the test. It was what the test didn't test. `@Mock` creates a Mockito mock. Plain, simple, no Spring involved. Alex's `PaymentService` was a plain Java class with dependencies injected via constructor. `@InjectMocks` instantiated it and shoved mocks into those constructor parameters.

But what if `PaymentService` was a `@Service` with `@Autowired` fields? Alex tried:

```java
@Service
public class PaymentService {
    @Autowired  // Field injection—Spring's doing
    private PaymentGatewayClient gatewayClient;
    
    public PaymentResult process(PaymentRequest request) {
        ChargeResponse response = gatewayClient.charge(request);
        return new PaymentResult(response.status(), response.transactionId());
    }
}
```

Same test. Same `@Mock`. Different result.

```
java.lang.NullPointerException: Cannot invoke "PaymentGatewayClient.charge(...)"
```

Alex stared at the stack trace. The mock existed. He could verify it. But `paymentService.gatewayClient` was null.

The revelation hit: `@InjectMocks` calls the constructor. If there is no constructor—if Spring uses field injection via reflection—`@InjectMocks` can't help. It doesn't have Spring's magic. It doesn't have the context.

Alex refactored to constructor injection, disgusted with himself for using field injection in the first place. But the doubt remained. Was he testing Spring or his code?

He tried `@MockBean` next:

```java
@SpringBootTest
class PaymentServiceIntegrationTest {
    
    @MockBean
    private PaymentGatewayClient gatewayClient;
    
    @Autowired
    private PaymentService paymentService;
    
    @Test
    void shouldProcessPaymentWithContext() {
        when(gatewayClient.charge(any()))
            .thenReturn(new ChargeResponse("SUCCESS", "txn-123"));
        
        PaymentResult result = paymentService.process(new PaymentRequest("card-123", 99.99));
        
        assertThat(result.status()).isEqualTo("SUCCESS");
    }
}
```

The context loaded. Slowly. Alex watched the console scroll through bean initialization. 8 seconds. For one test.

But it worked. `@MockBean` replaced the real `PaymentGatewayClient` bean in Spring's context. When `PaymentService` asked for its dependency, Spring handed it the mock. Field injection, constructor injection—Spring didn't care. The mock was the bean.

Alex realized the distinction:

- `@Mock` = Mockito creates a fake object. You manually inject it. No Spring. Fast. Brittle if you don't match Spring's injection style.
- `@MockBean` = Spring replaces a bean with a mock. Full context. Slower. Tests the wiring.

Then he found the third option, the one that made him feel foolish:

```java
class PaymentServicePlainTest {
    
    @Test
    void shouldProcessPayment() {
        PaymentGatewayClient mockGateway = Mockito.mock(PaymentGatewayClient.class);
        PaymentService service = new PaymentService(mockGateway);
        
        when(mockGateway.charge(any()))
            .thenReturn(new ChargeResponse("SUCCESS", "txn-123"));
        
        PaymentResult result = service.process(new PaymentRequest("card-123", 99.99));
        
        assertThat(result.status()).isEqualTo("SUCCESS");
        verify(mockGateway).charge(any());
    }
}
```

No annotations. No extension. Just `Mockito.mock()`. Alex had forgotten you could test without JUnit extensions. The simplest approach. The fastest. The one that required constructor injection and discipline.

His testing strategy crystallized:

1. **Plain `Mockito.mock()`** for pure unit tests—no Spring, no annotations, just logic
2. **`@Mock`** with `@ExtendWith(MockitoExtension.class)` for slightly cleaner syntax, still no context
3. **`@MockBean`** only when you must test Spring's wiring—transactional behavior, AOP, `@Async`

The 3 AM bug? It needed `@MockBean` or an integration test. Alex's unit test proved his logic worked. It didn't prove Spring wired it correctly.

## Chapter 2: The Context Load Tax

Alex's test suite grew. Fifty tests. Then eighty. CI times ballooned from 2 minutes to 12.

The culprit: `@SpringBootTest` loading the full context for every test class. Each test spun up the orchestra just to check one violin's tuning.

He profiled. The `PaymentServiceIntegrationTest` took 8 seconds. The `OrderServiceIntegrationTest` took 9. The `InventoryServiceIntegrationTest` took 7. Each loaded the entire application. Each created the same beans. Each paid the context tax.

Alex discovered `@TestConfiguration`:

```java
@TestConfiguration
public class TestConfig {
    
    @Bean
    @Primary
    public PaymentGatewayClient mockPaymentGateway() {
        PaymentGatewayClient mock = Mockito.mock(PaymentGatewayClient.class);
        when(mock.charge(any()))
            .thenReturn(new ChargeResponse("SUCCESS", "test-txn"));
        return mock;
    }
}
```

Used with `@Import(TestConfig.class)` on specific tests, it replaced beans without `@MockBean`'s magic. More explicit. More control.

But the real breakthrough was profiles:

```java
@SpringBootTest
@ActiveProfiles("test")
class OrderServiceTest {
    // Loads application-test.yml
    // Disables real payment gateway
    // Uses in-memory queues
}
```

`application-test.yml`:

```yaml
spring:
  datasource:
    url: jdbc:h2:mem:testdb
  jpa:
    hibernate:
      ddl-auto: create-drop
  
payment:
  gateway:
    enabled: false
    mock-responses: true
```

The test profile became Alex's safety net. Real database? Disabled. External APIs? Mocked. Async processing? Synchronous.

Then he found the nuclear option for speed:

```java
@SpringBootTest(properties = {
    "spring.main.lazy-initialization=true",
    "spring.jmx.enabled=false",
    "spring.sql.init.mode=never"
})
class FastIntegrationTest {
    // Beans initialize only when accessed
    // No JMX overhead
    // No data.sql/schema.sql execution
}
```

Lazy initialization cut his context load time from 8 seconds to 3. But Alex knew the trade-off: lazy beans hide initialization errors. Better for tests, risky for production.

The real solution was slicing. Why load the web layer when testing repositories? Why load JPA when testing controllers?

But some tests needed reality. Alex introduced Testcontainers:

```java
@Testcontainers
@SpringBootTest
class OrderRepositoryIntegrationTest {
    
    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15")
        .withDatabaseName("testdb")
        .withUsername("test")
        .withPassword("test");
    
    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }
    
    @Autowired
    private OrderRepository orderRepository;
    
    @Test
    void shouldPersistOrderWithRealDatabase() {
        Order order = new Order("customer-123", List.of(new OrderItem("SKU-1", 2)));
        
        Order saved = orderRepository.save(order);
        
        assertThat(saved.getId()).isNotNull();
        
        Order retrieved = orderRepository.findById(saved.getId()).orElseThrow();
        assertThat(retrieved.getItems()).hasSize(1);
    }
}
```

Real PostgreSQL. Real transactions. Real constraints. Alex finally trusted his repository tests.

The context load tax wasn't eliminated—it was optimized. Full context for integration flows. Slices for focused tests. Testcontainers for reality checks.

## Chapter 3: Repository Reality Check

Alex's repository tests were fast. Too fast. H2 in-memory, `@DataJpaTest`, sub-second execution. And completely misleading.

The bug appeared in staging. A native query using PostgreSQL's `jsonb` operators. H2 doesn't support `jsonb`. Alex's tests passed because H2 silently ignored the query or returned wrong results.

He stared at the passing test:

```java
@DataJpaTest
class ProductRepositoryTest {
    
    @Autowired
    private ProductRepository repository;
    
    @Test
    void shouldFindByCategory() {
        repository.save(new Product("Laptop", "Electronics", new BigDecimal("999.99")));
        
        List<Product> products = repository.findByCategory("Electronics");
        
        assertThat(products).hasSize(1);
    }
}
```

Fast. Isolated. Useless for PostgreSQL-specific features.

Alex learned `@DataJpaTest` loads only JPA components. No web layer. No security. Just repositories, entities, and an embedded database. It's a slice—a focused test with minimal context.

The annotation's power:

```java
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Testcontainers
class RealProductRepositoryTest {
    
    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15");
    
    @Autowired
    private ProductRepository repository;
    
    @Autowired
    private TestEntityManager entityManager;
    
    @Test
    void shouldQueryJsonbField() {
        Product product = new Product("Laptop", "Electronics", 
            Map.of("specs", "16GB RAM, 512GB SSD"));
        
        repository.save(product);
        
        // Force flush to database
        entityManager.flush();
        entityManager.clear();
        
        List<Product> found = repository.findBySpecsContaining("16GB");
        
        assertThat(found).hasSize(1);
    }
}
```

`TestEntityManager` was Alex's secret weapon. Unlike `EntityManager`, it exposed methods for testing: `flush()`, `clear()`, `getId()`. It let him simulate the production JPA lifecycle—persistence context clearing, lazy loading failures, transaction boundaries.

The `@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)` told Spring: "Don't swap my DataSource for H2. I brought my own."

Alex's repository testing strategy evolved:

1. **Pure `@DataJpaTest` with H2**: For basic CRUD, standard queries, entity mappings
2. **`@DataJpaTest` + Testcontainers**: For native queries, database-specific features, complex transactions
3. **Full `@SpringBootTest`**: Only when repositories interact with services, caching, or events

The transaction rollback saved him repeatedly:

```java
@DataJpaTest
class TransactionalTest {
    
    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private AuditLogRepository auditLogRepository;
    
    @Test
    void shouldRollbackOnFailure() {
        assertThatThrownBy(() -> {
            // Service method that saves order then audit log
            // Audit log fails, should rollback order
        }).isInstanceOf(RuntimeException.class);
        
        // Both repositories empty due to @Transactional rollback
        assertThat(orderRepository.count()).isZero();
        assertThat(auditLogRepository.count()).isZero();
    }
}
```

`@DataJpaTest` wraps tests in `@Transactional` by default. Each test runs, then rolls back. The database remains pristine. No cleanup code. No `@BeforeEach` deleting rows.

But Alex needed to test the commit. Some bugs only appeared after flush:

```java
@Test
void shouldFailOnConstraintViolation() {
    repository.save(new Product("SKU-123", "Name"));
    
    // Constraint violation only caught on flush/commit
    assertThatThrownBy(() -> entityManager.flush())
        .isInstanceOf(PersistenceException.class)
        .hasMessageContaining("constraint");
}
```

Repository testing wasn't about speed. It was about confidence. H2 for velocity. PostgreSQL for reality. `TestEntityManager` for control.

## Chapter 4: The Reactive Divide

Alex's team adopted WebFlux. Non-blocking. Reactive. Fast. And his `MockMvc` tests broke completely.

```java
@WebMvcTest(OrderController.class)
class OrderControllerTest {
    
    @Autowired
    private MockMvc mockMvc;
    
    @MockBean
    private OrderService orderService;
    
    @Test
    void shouldReturnOrder() throws Exception {
        when(orderService.findById("123"))
            .thenReturn(Mono.just(new Order("123", "PENDING")));
        
        mockMvc.perform(get("/orders/123"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value("123"));
    }
}
```

The test hung. Indefinitely. `MockMvc` was built for Servlet-based Spring MVC. It blocked. It waited for a response that never came because WebFlux used a different threading model.

Alex needed `WebTestClient`:

```java
@WebFluxTest(OrderController.class)
class ReactiveOrderControllerTest {
    
    @Autowired
    private WebTestClient webClient;
    
    @MockBean
    private OrderService orderService;
    
    @Test
    void shouldReturnOrderReactive() {
        when(orderService.findById("123"))
            .thenReturn(Mono.just(new Order("123", "PENDING")));
        
        webClient.get()
            .uri("/orders/123")
            .exchange()
            .expectStatus().isOk()
            .expectBody()
            .jsonPath("$.id").isEqualTo("123");
    }
}
```

The client was reactive-native. It understood `Mono` and `Flux`. It didn't block waiting for a Servlet response. It subscribed to the reactive stream.

Alex compared his options:

| Tool | Use Case | Blocking | Context |
|------|----------|----------|---------|
| MockMvc | MVC controllers with Servlet stack | Yes | Minimal web context |
| WebTestClient | WebFlux reactive endpoints | No | Reactive context |
| TestRestTemplate | Full HTTP stack testing | Yes | Full server context |

But `WebTestClient` had another mode. It could test MVC too:

```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class HttpLevelTest {
    
    @Autowired
    private WebTestClient webClient;
    
    @Test
    void shouldTestAtHttpLevel() {
        // Real HTTP calls to embedded server
        // Tests filters, interceptors, converters
        webClient.get()
            .uri("/orders/123")
            .header("Authorization", "Bearer token")
            .exchange()
            .expectStatus().isOk()
            .expectHeader().contentType(MediaType.APPLICATION_JSON);
    }
}
```

With `WebEnvironment.RANDOM_PORT`, `WebTestClient` became an HTTP client. It tested the full stack—filters, converters, exception handlers. Not just the controller.

Alex's reactive testing strategy:

1. **`@WebFluxTest` + `WebTestClient`**: For reactive controller logic, fast, no server
2. **`@SpringBootTest` + `WebTestClient`**: For HTTP-level integration, real server, full stack
3. **Avoid `MockMvc`**: For reactive applications entirely

The blocking vs non-blocking distinction mattered. `MockMvc` blocked the test thread. WebFlux needed the reactive scheduler. They were incompatible worlds.

## Epilogue: Your Testing Odyssey

Alex's legacy codebase had 200 tests. Eighty used `@SpringBootTest`. Forty used `@Mock` on field-injected services. Twenty tested H2 but deployed to PostgreSQL.

He refactored systematically.

First, the test pyramid:

```mermaid
graph TD
    A[Test Pyramid] --> B[Unit Tests 70%]
    A --> C[Integration Tests 20%]
    A --> D[E2E Tests 10%]
    
    B --> B1[Plain Mockito<br/>No Spring Context<br/>Fast, Isolated]
    
    C --> C1[@DataJpaTest<br/>Repository Slice]
    C --> C2[@WebMvcTest/@WebFluxTest<br/>Controller Slice]
    C --> C3[@SpringBootTest<br/>Full Context]
    
    D --> D1[Testcontainers<br/>Real Database]
    D --> D2[HTTP Tests<br/>Full Stack]
```

Seventy percent unit tests with plain `Mockito.mock()`. Constructor injection mandatory. No Spring. Sub-millisecond execution.

Twenty percent integration tests. Sliced where possible—`@DataJpaTest` for repositories, `@WebMvcTest` for controllers. Full `@SpringBootTest` only for service orchestration.

Ten percent reality checks. Testcontainers with PostgreSQL. HTTP-level tests hitting real endpoints.

Alex's checklist for every new test:

**Before writing:**
- [ ] What am I testing? Logic, wiring, or integration?
- [ ] Do I need Spring's context?
- [ ] Can I use a slice instead of full boot?
- [ ] Does my database match production?

**While writing:**
- [ ] Constructor injection only
- [ ] `@Mock` for unit, `@MockBean` for integration
- [ ] One assertion per test
- [ ] Descriptive test names: `shouldRejectInvalidPayment`

**After writing:**
- [ ] Test fails when code breaks?
- [ ] Test passes when code works?
- [ ] Test runs in under 100ms?
- [ ] No external dependencies?

The 3 AM incident taught Alex that tests are insurance. Cheap tests that lie are worse than no tests. Expensive tests that catch bugs save sleep.

Your journey starts now. Open your test suite. Find one `@SpringBootTest` that could be a unit test. Convert it. Feel the speed. Build the confidence.

The orchestra plays only when every instrument is tuned. Your tests are the tuning fork.

---

**Challenge:** Take your slowest test. Profile it. Is it loading the full context unnecessarily? Convert it to a slice or plain unit test. Measure the improvement. Share your results.

**GitHub Repository:** [Complete examples from this article](https://github.com/yourusername/spring-boot-testing-guide) with working code for each chapter.
