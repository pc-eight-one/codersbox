---
title: "Spring Boot Reactive Programming - Part 8: Testing, Debugging, and Production"
description: "Master testing reactive code with StepVerifier and WebTestClient, debug reactive applications, implement monitoring and observability, and deploy production-ready reactive microservices."
publishDate: 2025-10-06
publishedAt: 2025-10-06
tags: ["Spring Boot", "Testing", "StepVerifier", "WebTestClient", "Debugging", "Production", "Monitoring"]
difficulty: "advanced"
series: "Spring Boot Reactive Programming"
part: 8
estimatedTime: "95 minutes"
totalParts: 8
featured: true
---

# Spring Boot Reactive Programming - Part 8: Testing, Debugging, and Production

In this final part, we'll master testing reactive code, debugging techniques, production monitoring, and deployment strategies for reactive Spring Boot applications.

## Testing with StepVerifier

StepVerifier is the primary tool for testing reactive publishers.

### Basic Testing

```java
@SpringBootTest
public class UserServiceTest {

    @Autowired
    private UserService userService;

    @Test
    public void testGetUserById() {
        Mono<User> userMono = userService.getUserById(1L);

        StepVerifier.create(userMono)
            .assertNext(user -> {
                assertThat(user.getId()).isEqualTo(1L);
                assertThat(user.getName()).isNotNull();
                assertThat(user.getEmail()).contains("@");
            })
            .verifyComplete();
    }

    @Test
    public void testGetAllUsers() {
        Flux<User> users = userService.getAllUsers();

        StepVerifier.create(users)
            .expectNextCount(10)
            .verifyComplete();
    }

    @Test
    public void testGetUserNotFound() {
        Mono<User> userMono = userService.getUserById(999L);

        StepVerifier.create(userMono)
            .expectError(NotFoundException.class)
            .verify();
    }

    @Test
    public void testCreateUser() {
        UserDto dto = new UserDto("John Doe", "john@example.com");
        Mono<User> created = userService.createUser(dto);

        StepVerifier.create(created)
            .assertNext(user -> {
                assertThat(user.getId()).isNotNull();
                assertThat(user.getName()).isEqualTo("John Doe");
                assertThat(user.getEmail()).isEqualTo("john@example.com");
            })
            .verifyComplete();
    }

    @Test
    public void testUpdateUser() {
        UserDto dto = new UserDto("Jane Doe", "jane@example.com");
        Mono<User> updated = userService.updateUser(1L, dto);

        StepVerifier.create(updated)
            .assertNext(user -> {
                assertThat(user.getName()).isEqualTo("Jane Doe");
                assertThat(user.getEmail()).isEqualTo("jane@example.com");
            })
            .verifyComplete();
    }
}
```

### Advanced StepVerifier

```java
public class AdvancedStepVerifierTest {

    @Test
    public void testMultipleElements() {
        Flux<Integer> flux = Flux.just(1, 2, 3, 4, 5);

        StepVerifier.create(flux)
            .expectNext(1)
            .expectNext(2)
            .expectNext(3)
            .expectNext(4)
            .expectNext(5)
            .verifyComplete();
    }

    @Test
    public void testExpectNextMatches() {
        Flux<User> users = userService.getActiveUsers();

        StepVerifier.create(users)
            .expectNextMatches(user -> user.isActive())
            .expectNextMatches(user -> user.isActive())
            .expectNextMatches(user -> user.isActive())
            .verifyComplete();
    }

    @Test
    public void testConsumeNextWith() {
        Flux<Order> orders = orderService.getOrders();

        StepVerifier.create(orders)
            .consumeNextWith(order -> {
                assertThat(order.getTotal()).isGreaterThan(BigDecimal.ZERO);
                assertThat(order.getStatus()).isNotNull();
            })
            .thenConsumeWhile(
                order -> order.getTotal().compareTo(BigDecimal.valueOf(1000)) < 0
            )
            .verifyComplete();
    }

    @Test
    public void testWithVirtualTime() {
        // Test time-based operations without waiting
        VirtualTimeScheduler.getOrSet();

        Flux<Long> flux = Flux.interval(Duration.ofHours(1))
            .take(3);

        StepVerifier.withVirtualTime(() -> flux)
            .expectSubscription()
            .expectNoEvent(Duration.ofHours(1))
            .expectNext(0L)
            .thenAwait(Duration.ofHours(1))
            .expectNext(1L)
            .thenAwait(Duration.ofHours(1))
            .expectNext(2L)
            .verifyComplete();
    }

    @Test
    public void testErrorRecovery() {
        Flux<Integer> flux = Flux.range(1, 10)
            .map(i -> {
                if (i == 5) throw new RuntimeException("Error at 5");
                return i;
            })
            .onErrorResume(e -> Flux.just(-1));

        StepVerifier.create(flux)
            .expectNext(1, 2, 3, 4)
            .expectNext(-1)
            .verifyComplete();
    }

    @Test
    public void testBackpressure() {
        Flux<Integer> flux = Flux.range(1, 100);

        StepVerifier.create(flux, 10)  // Request 10 initially
            .expectNextCount(10)
            .thenRequest(20)  // Request 20 more
            .expectNextCount(20)
            .thenRequest(70)  // Request remaining
            .expectNextCount(70)
            .verifyComplete();
    }

    @Test
    public void testVerifyTimeout() {
        Mono<String> mono = Mono.delay(Duration.ofSeconds(2))
            .then(Mono.just("Done"));

        StepVerifier.create(mono)
            .expectNext("Done")
            .verifyComplete(Duration.ofSeconds(3));  // Timeout after 3s
    }

    @Test
    public void testRecordWith() {
        Flux<User> users = userService.getAllUsers();

        StepVerifier.create(users)
            .recordWith(ArrayList::new)
            .thenConsumeWhile(user -> true)
            .consumeRecordedWith(list -> {
                assertThat(list).hasSize(10);
                assertThat(list).allMatch(User::isActive);
            })
            .verifyComplete();
    }
}
```

## Testing Controllers with WebTestClient

```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureWebTestClient
public class ProductControllerTest {

    @Autowired
    private WebTestClient webTestClient;

    @MockBean
    private ProductService productService;

    @Test
    public void testGetProduct() {
        Product product = new Product(1L, "Laptop", new BigDecimal("999.99"));

        when(productService.findById(1L))
            .thenReturn(Mono.just(product));

        webTestClient.get()
            .uri("/api/products/1")
            .exchange()
            .expectStatus().isOk()
            .expectHeader().contentType(MediaType.APPLICATION_JSON)
            .expectBody(Product.class)
            .value(p -> {
                assertThat(p.getId()).isEqualTo(1L);
                assertThat(p.getName()).isEqualTo("Laptop");
                assertThat(p.getPrice()).isEqualTo(new BigDecimal("999.99"));
            });
    }

    @Test
    public void testGetAllProducts() {
        Flux<Product> products = Flux.just(
            new Product(1L, "Laptop", new BigDecimal("999.99")),
            new Product(2L, "Mouse", new BigDecimal("29.99")),
            new Product(3L, "Keyboard", new BigDecimal("79.99"))
        );

        when(productService.findAll())
            .thenReturn(products);

        webTestClient.get()
            .uri("/api/products")
            .exchange()
            .expectStatus().isOk()
            .expectBodyList(Product.class)
            .hasSize(3)
            .value(list -> {
                assertThat(list.get(0).getName()).isEqualTo("Laptop");
                assertThat(list.get(1).getName()).isEqualTo("Mouse");
                assertThat(list.get(2).getName()).isEqualTo("Keyboard");
            });
    }

    @Test
    public void testCreateProduct() {
        ProductDto dto = new ProductDto("Laptop", new BigDecimal("999.99"));
        Product created = new Product(1L, "Laptop", new BigDecimal("999.99"));

        when(productService.create(any(ProductDto.class)))
            .thenReturn(Mono.just(created));

        webTestClient.post()
            .uri("/api/products")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(dto)
            .exchange()
            .expectStatus().isCreated()
            .expectBody(Product.class)
            .value(p -> {
                assertThat(p.getId()).isEqualTo(1L);
                assertThat(p.getName()).isEqualTo("Laptop");
            });
    }

    @Test
    public void testUpdateProduct() {
        ProductDto dto = new ProductDto("Updated", new BigDecimal("1099.99"));
        Product updated = new Product(1L, "Updated", new BigDecimal("1099.99"));

        when(productService.update(eq(1L), any(ProductDto.class)))
            .thenReturn(Mono.just(updated));

        webTestClient.put()
            .uri("/api/products/1")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(dto)
            .exchange()
            .expectStatus().isOk()
            .expectBody(Product.class)
            .value(p -> assertThat(p.getName()).isEqualTo("Updated"));
    }

    @Test
    public void testDeleteProduct() {
        when(productService.delete(1L))
            .thenReturn(Mono.empty());

        webTestClient.delete()
            .uri("/api/products/1")
            .exchange()
            .expectStatus().isNoContent();
    }

    @Test
    public void testNotFound() {
        when(productService.findById(999L))
            .thenReturn(Mono.error(new NotFoundException("Product not found")));

        webTestClient.get()
            .uri("/api/products/999")
            .exchange()
            .expectStatus().isNotFound();
    }

    @Test
    public void testValidationError() {
        ProductDto invalid = new ProductDto("", null);  // Invalid

        webTestClient.post()
            .uri("/api/products")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(invalid)
            .exchange()
            .expectStatus().isBadRequest()
            .expectBody()
            .jsonPath("$.status").isEqualTo(400)
            .jsonPath("$.message").exists();
    }

    @Test
    public void testWithHeaders() {
        when(productService.findById(1L))
            .thenReturn(Mono.just(new Product(1L, "Test", BigDecimal.TEN)));

        webTestClient.get()
            .uri("/api/products/1")
            .header("X-Request-Id", "test-123")
            .header("X-User-Id", "user-456")
            .exchange()
            .expectStatus().isOk()
            .expectHeader().exists("Content-Type")
            .expectBody(Product.class);
    }
}
```

## Mocking Reactive Dependencies

```java
@ExtendWith(MockitoExtension.class)
public class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private UserService userService;

    @Mock
    private PaymentService paymentService;

    @InjectMocks
    private OrderService orderService;

    @Test
    public void testCreateOrder() {
        User user = new User(1L, "John", "john@example.com");
        Order order = new Order(1L, 1L, BigDecimal.valueOf(100));
        Payment payment = new Payment(1L, BigDecimal.valueOf(100));

        when(userService.getUserById(1L))
            .thenReturn(Mono.just(user));

        when(paymentService.processPayment(any()))
            .thenReturn(Mono.just(payment));

        when(orderRepository.save(any(Order.class)))
            .thenReturn(Mono.just(order));

        Mono<Order> result = orderService.createOrder(1L, BigDecimal.valueOf(100));

        StepVerifier.create(result)
            .assertNext(o -> {
                assertThat(o.getId()).isEqualTo(1L);
                assertThat(o.getTotal()).isEqualTo(BigDecimal.valueOf(100));
            })
            .verifyComplete();

        verify(userService).getUserById(1L);
        verify(paymentService).processPayment(any());
        verify(orderRepository).save(any());
    }

    @Test
    public void testCreateOrderUserNotFound() {
        when(userService.getUserById(999L))
            .thenReturn(Mono.error(new NotFoundException("User not found")));

        Mono<Order> result = orderService.createOrder(999L, BigDecimal.valueOf(100));

        StepVerifier.create(result)
            .expectError(NotFoundException.class)
            .verify();

        verify(userService).getUserById(999L);
        verify(paymentService, never()).processPayment(any());
        verify(orderRepository, never()).save(any());
    }
}
```

## Debugging Reactive Code

### Hooks for Debugging

```java
@SpringBootApplication
public class Application {

    public static void main(String[] args) {
        // Enable debug mode for detailed stack traces
        Hooks.onOperatorDebug();

        // Or use checkpoint for production (less overhead)
        // ReactorDebugAgent.init();

        SpringApplication.run(Application.class, args);
    }
}
```

### Checkpoints

```java
@Service
public class DebuggableService {

    public Flux<Data> processData(Flux<Input> input) {
        return input
            .checkpoint("After receiving input")
            .map(this::transform)
            .checkpoint("After transformation")
            .filter(this::isValid)
            .checkpoint("After validation")
            .flatMap(this::enrich)
            .checkpoint("After enrichment");
    }

    // Detailed checkpoint
    public Mono<User> getUser(Long id) {
        return userRepository.findById(id)
            .checkpoint("Fetching user from database", true)  // Include stack trace
            .flatMap(this::enrichUser)
            .checkpoint("User enrichment completed");
    }
}
```

### Logging

```java
@Service
@Slf4j
public class LoggingService {

    public Flux<Product> getProducts() {
        return productRepository.findAll()
            .doOnSubscribe(sub ->
                log.info("Subscribed to product stream")
            )
            .doOnNext(product ->
                log.debug("Processing product: {}", product.getId())
            )
            .doOnError(error ->
                log.error("Error in product stream", error)
            )
            .doOnComplete(() ->
                log.info("Product stream completed")
            )
            .doFinally(signal ->
                log.info("Stream finished with signal: {}", signal)
            )
            .log();  // Log all signals
    }

    // Custom logging
    public Mono<Order> processOrder(Order order) {
        return Mono.just(order)
            .doOnNext(o -> log.info("Processing order: {}", o.getId()))
            .flatMap(this::validateOrder)
            .doOnNext(o -> log.info("Validation passed"))
            .flatMap(this::saveOrder)
            .doOnSuccess(o -> log.info("Order saved: {}", o.getId()))
            .doOnError(e -> log.error("Order processing failed", e));
    }
}
```

## Production Monitoring

### Metrics with Micrometer

```java
@Configuration
public class MetricsConfig {

    @Bean
    public MeterRegistry meterRegistry() {
        return new SimpleMeterRegistry();
    }
}

@Service
public class MetricsService {

    private final Counter orderCounter;
    private final Timer orderProcessingTimer;
    private final Gauge activeOrders;
    private final AtomicInteger activeOrderCount = new AtomicInteger(0);

    public MetricsService(MeterRegistry meterRegistry) {
        this.orderCounter = Counter.builder("orders.created")
            .description("Number of orders created")
            .tag("type", "ecommerce")
            .register(meterRegistry);

        this.orderProcessingTimer = Timer.builder("orders.processing.time")
            .description("Order processing time")
            .register(meterRegistry);

        this.activeOrders = Gauge.builder("orders.active", activeOrderCount, AtomicInteger::get)
            .description("Number of active orders")
            .register(meterRegistry);
    }

    public Mono<Order> processOrder(Order order) {
        return Mono.just(order)
            .doOnSubscribe(s -> activeOrderCount.incrementAndGet())
            .flatMap(o -> Timer.Sample.start()
                .record(() -> actualProcessing(o), orderProcessingTimer))
            .doOnSuccess(o -> {
                orderCounter.increment();
                activeOrderCount.decrementAndGet();
            })
            .doFinally(signal -> activeOrderCount.decrementAndGet());
    }

    private Mono<Order> actualProcessing(Order order) {
        // Processing logic
        return Mono.just(order);
    }
}
```

### Health Checks

```java
@Component
public class DatabaseHealthIndicator implements ReactiveHealthIndicator {

    @Autowired
    private DatabaseClient databaseClient;

    @Override
    public Mono<Health> health() {
        return databaseClient.sql("SELECT 1")
            .fetch()
            .one()
            .map(row -> Health.up()
                .withDetail("database", "reachable")
                .build())
            .timeout(Duration.ofSeconds(2))
            .onErrorResume(e -> Mono.just(
                Health.down()
                    .withDetail("database", "unreachable")
                    .withException(e)
                    .build()
            ));
    }
}

@Component
public class ExternalApiHealthIndicator implements ReactiveHealthIndicator {

    @Autowired
    private WebClient externalApiClient;

    @Override
    public Mono<Health> health() {
        return externalApiClient.get()
            .uri("/health")
            .retrieve()
            .toBodilessEntity()
            .map(response -> Health.up()
                .withDetail("external-api", "healthy")
                .withDetail("status", response.getStatusCode())
                .build())
            .timeout(Duration.ofSeconds(3))
            .onErrorResume(e -> Mono.just(
                Health.down()
                    .withDetail("external-api", "unhealthy")
                    .withException(e)
                    .build()
            ));
    }
}
```

### Distributed Tracing

```java
// application.yml
/*
management:
  tracing:
    sampling:
      probability: 1.0  # Sample all requests in dev
  endpoints:
    web:
      exposure:
        include: health,info,metrics,prometheus
*/

@Configuration
public class TracingConfig {

    @Bean
    public ObservationHandler<?> tracingHandler() {
        return new ObservationHandler<>() {
            @Override
            public void onStart(Observation.Context context) {
                // Start span
            }

            @Override
            public void onStop(Observation.Context context) {
                // End span
            }

            @Override
            public boolean supportsContext(Observation.Context context) {
                return true;
            }
        };
    }
}
```

## Production Configuration

### application.yml

```yaml
spring:
  r2dbc:
    url: r2dbc:postgresql://${DB_HOST:localhost}:${DB_PORT:5432}/${DB_NAME:productdb}
    username: ${DB_USER:postgres}
    password: ${DB_PASSWORD:password}
    pool:
      initial-size: ${DB_POOL_INITIAL:20}
      max-size: ${DB_POOL_MAX:50}
      max-idle-time: 30m
      validation-query: SELECT 1

  webflux:
    base-path: /api

  redis:
    host: ${REDIS_HOST:localhost}
    port: ${REDIS_PORT:6379}
    password: ${REDIS_PASSWORD:}
    timeout: 2000ms
    lettuce:
      pool:
        max-active: 8
        max-idle: 8
        min-idle: 2

server:
  port: ${PORT:8080}
  netty:
    connection-timeout: 5s
    idle-timeout: 60s

logging:
  level:
    root: INFO
    com.example: DEBUG
    io.r2dbc: DEBUG
    reactor.netty: INFO

management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,prometheus
  metrics:
    export:
      prometheus:
        enabled: true
```

## Deployment Best Practices

### Docker Configuration

```dockerfile
# Dockerfile
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

COPY target/*.jar app.jar

# Non-root user
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health || exit 1

EXPOSE 8080

ENTRYPOINT ["java", \
  "-XX:+UseContainerSupport", \
  "-XX:MaxRAMPercentage=75.0", \
  "-XX:InitialRAMPercentage=50.0", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "-jar", "app.jar"]
```

### Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: product-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: product-service
  template:
    metadata:
      labels:
        app: product-service
    spec:
      containers:
      - name: product-service
        image: product-service:latest
        ports:
        - containerPort: 8080
        env:
        - name: DB_HOST
          value: postgres-service
        - name: REDIS_HOST
          value: redis-service
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /actuator/health/liveness
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /actuator/health/readiness
            port: 8080
          initialDelaySeconds: 10
          periodSeconds: 5
```

## Performance Tuning

```java
@Configuration
public class PerformanceConfig {

    @Bean
    public ReactorResourceFactory reactorResourceFactory() {
        ReactorResourceFactory factory = new ReactorResourceFactory();
        factory.setUseGlobalResources(false);

        // Custom event loop
        factory.setLoopResources(LoopResources.create(
            "http-nio",
            Runtime.getRuntime().availableProcessors() * 2,  // Worker threads
            true  // Daemon threads
        ));

        return factory;
    }

    // Tune connection pool
    @Bean
    public ConnectionPool connectionPool() {
        ConnectionFactoryOptions options = /* ... */;
        ConnectionFactory connectionFactory = ConnectionFactories.get(options);

        ConnectionPoolConfiguration config =
            ConnectionPoolConfiguration.builder(connectionFactory)
                .maxIdleTime(Duration.ofMinutes(30))
                .maxLifeTime(Duration.ofHours(2))
                .maxAcquireTime(Duration.ofSeconds(3))
                .maxCreateConnectionTime(Duration.ofSeconds(5))
                .initialSize(20)
                .maxSize(50)
                .validationQuery("SELECT 1")
                .build();

        return new ConnectionPool(config);
    }
}
```

## Key Takeaways

- **StepVerifier** is essential for testing reactive publishers
- **WebTestClient** for integration testing controllers
- Use **checkpoints** and **logging** for debugging
- **Hooks.onOperatorDebug()** for development, avoid in production
- **Metrics and monitoring** are critical for reactive apps
- **Health checks** ensure service reliability
- **Connection pooling** is crucial for performance
- **Docker and Kubernetes** for scalable deployment

## Series Conclusion

Congratulations! You've completed the entire Spring Boot Reactive Programming series. You now have:

- ✅ Deep understanding of Project Reactor (Mono, Flux)
- ✅ Mastery of operators and transformations
- ✅ Knowledge of schedulers and threading
- ✅ Expertise in backpressure handling
- ✅ Advanced error handling and resilience patterns
- ✅ Production-ready WebFlux applications
- ✅ Reactive data access with R2DBC
- ✅ Comprehensive testing and debugging skills

**Next Steps:**
1. Build a complete microservice using all concepts
2. Explore Kotlin Coroutines with Spring WebFlux
3. Implement event-driven architecture with Kafka
4. Study reactive patterns in distributed systems

**Thank you for following this series!** Happy reactive programming! 🚀
