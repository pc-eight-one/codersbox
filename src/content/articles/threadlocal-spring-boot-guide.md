---
title: "ThreadLocal in Spring Boot: Solving Real-World Problems with Thread-Confined Storage"
description: "Master ThreadLocal in Spring Boot applications. Learn how to handle user context, distributed tracing, transaction management, and tenant isolation with practical examples and best practices."
publishDate: 2025-01-08
author: "codersbox"
tags: ["Java", "Spring Boot", "ThreadLocal", "Concurrency", "Multi-threading", "Backend", "Best Practices"]
readTime: "25 min read"
difficulty: "intermediate"
estimatedTime: "60 minutes"
featured: true
---

# ThreadLocal in Spring Boot: Solving Real-World Problems

ThreadLocal gives each thread its own copy of a variable. In Spring Boot, this solves real problems: user context, distributed tracing, multi-tenancy, and request-scoped caching—all without passing objects through every method call.

This guide shows practical uses and, more importantly, how to avoid the memory leaks that destroy production applications.

## Table of Contents

1. [What is ThreadLocal?](#what-is-threadlocal)
2. [The Problem ThreadLocal Solves](#the-problem-threadlocal-solves)
3. [Real-World Spring Boot Use Cases](#real-world-spring-boot-use-cases)
4. [User Context Management](#user-context-management)
5. [Distributed Tracing Implementation](#distributed-tracing-implementation)
6. [Multi-Tenancy with ThreadLocal](#multi-tenancy-with-threadlocal)
7. [Request Scoped Caching](#request-scoped-caching)
8. [Transaction Context Propagation](#transaction-context-propagation)
9. [Security Context Handling](#security-context-handling)
10. [Common Pitfalls and Memory Leaks](#common-pitfalls-and-memory-leaks)
11. [Best Practices](#best-practices)
12. [Testing ThreadLocal Code](#testing-threadlocal-code)

---

## What is ThreadLocal?

A ThreadLocal variable gives each thread its own independent copy. Thread 1 sets "alice", Thread 2 sets "bob"—neither sees the other's value.

```java
public class UserContext {
    private static ThreadLocal<String> user = new ThreadLocal<>();

    public static void setUser(String username) {
        user.set(username);
    }

    public static String getUser() {
        return user.get();
    }

    public static void clear() {
        user.remove();
    }
}
```

The `clear()` method matters. Without it, you leak memory. More on that later.

---

## The Problem ThreadLocal Solves

Suppose you need the current user in a service method deep in your call stack. You could pass it through every method, but that's tedious:

```java
public void processOrder(Order order, User user) {
    validateOrder(order, user);
    calculateTotal(order, user);
    applyDiscounts(order, user);
}
```

Every method needs the user parameter. With ThreadLocal:

```java
public void processOrder(Order order) {
    User user = UserContext.getCurrentUser();
    validateOrder(order);
    calculateTotal(order);
    applyDiscounts(order);
}
```

The user comes from thread-local storage. Any method can retrieve it without parameters.

---

## Real-World Spring Boot Use Cases

### 1. User Context Management
**Problem:** Need current user info in service layer without passing through every method
**Solution:** ThreadLocal-based UserContext

### 2. Distributed Tracing
**Problem:** Correlate logs across services for a single request
**Solution:** ThreadLocal correlation ID storage

### 3. Multi-Tenancy
**Problem:** Isolate data for different tenants in shared application
**Solution:** ThreadLocal tenant identifier

### 4. Request-Scoped Caching
**Problem:** Cache data for request duration without Spring's RequestScope complexity
**Solution:** ThreadLocal cache map

### 5. Transaction Context
**Problem:** Propagate transaction metadata without Spring's TransactionSynchronizationManager
**Solution:** ThreadLocal transaction holder

Let's dive into each use case with practical implementations.

---

## User Context Management

Store the current user in a ThreadLocal so any method can access it:

```java
@Component
public class UserContext {
    private static final ThreadLocal<UserDetails> currentUser = new ThreadLocal<>();

    public static void setCurrentUser(UserDetails user) {
        currentUser.set(user);
    }

    public static UserDetails getCurrentUser() {
        UserDetails user = currentUser.get();
        if (user == null) {
            throw new IllegalStateException("No user in context");
        }
        return user;
    }

    public static void clear() {
        currentUser.remove();
    }
}
```

A filter sets the user at the start of each request and cleans up afterward:

```java
@Component
@Order(1)
public class UserContextFilter extends OncePerRequestFilter {

    @Autowired
    private UserService userService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {
        try {
            String username = extractUsername(request);
            UserDetails user = userService.loadUserByUsername(username);
            UserContext.setCurrentUser(user);
            filterChain.doFilter(request, response);
        } finally {
            UserContext.clear();
        }
    }

    private String extractUsername(HttpServletRequest request) {
        String token = request.getHeader("Authorization");
        return jwtUtils.extractUsername(token);
    }
}
```

Now any service can access the user:

```java
@Service
public class OrderService {

    public Order createOrder(OrderRequest request) {
        UserDetails user = UserContext.getCurrentUser();

        Order order = new Order();
        order.setUserId(user.getUserId());
        order.setItems(request.getItems());

        return orderRepository.save(order);
    }
}
```

No user parameter needed. The audit service gets it the same way:

```java
@Service
public class AuditService {

    public void logOrderCreation(Order order) {
        UserDetails user = UserContext.getCurrentUser();

        AuditLog log = new AuditLog("ORDER_CREATED",
            user.getUserId(), order.getId(), Instant.now());

        auditRepository.save(log);
    }
}
```

---

## Distributed Tracing

Tracking requests across microservices needs correlation IDs. The ID must travel with the request through all services and appear in every log entry. ThreadLocal handles this elegantly.

**Store the correlation ID per thread:**

```java
@Component
public class CorrelationIdContext {
    private static final ThreadLocal<String> correlationId = new ThreadLocal<>();

    public static void setCorrelationId(String id) {
        correlationId.set(id);
    }

    public static String getCorrelationId() {
        return correlationId.get();
    }

    public static void clear() {
        correlationId.remove();
    }
}
```

**Extract or generate the ID in a filter:**

The filter runs first (`@Order(0)`), before other filters. It checks for an existing correlation ID in the request header. If absent, it generates one. The ID goes into ThreadLocal and also into SLF4J's MDC (Mapped Diagnostic Context) for automatic logging.

```java
@Component
@Order(0)
public class CorrelationIdFilter extends OncePerRequestFilter {

    private static final String HEADER = "X-Correlation-ID";

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain)
            throws ServletException, IOException {
        try {
            String id = request.getHeader(HEADER);
            if (id == null) {
                id = UUID.randomUUID().toString();
            }

            CorrelationIdContext.setCorrelationId(id);
            response.setHeader(HEADER, id);
            MDC.put("correlationId", id);

            chain.doFilter(request, response);
        } finally {
            MDC.remove("correlationId");
            CorrelationIdContext.clear();
        }
    }
}
```

**Propagate to downstream services:**

When calling other services, add an interceptor to RestTemplate. It reads the correlation ID from ThreadLocal and adds it to outgoing requests.

```java
@Configuration
public class RestTemplateConfig {

    @Bean
    public RestTemplate restTemplate() {
        RestTemplate template = new RestTemplate();

        template.getInterceptors().add((request, body, execution) -> {
            String id = CorrelationIdContext.getCorrelationId();
            if (id != null) {
                request.getHeaders().add("X-Correlation-ID", id);
            }
            return execution.execute(request, body);
        });

        return template;
    }
}
```

### Logging Configuration

```xml
<!-- logback-spring.xml -->
<configuration>
    <appender name="CONSOLE" class="ch.qos.logback.core.ConsoleAppender">
        <encoder>
            <pattern>
                %d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level [%X{correlationId}] %logger{36} - %msg%n
            </pattern>
        </encoder>
    </appender>

    <root level="INFO">
        <appender-ref ref="CONSOLE"/>
    </root>
</configuration>
```

### Async Method Support

```java
@Configuration
@EnableAsync
public class AsyncConfig implements AsyncConfigurer {

    @Override
    public Executor getAsyncExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(10);
        executor.setMaxPoolSize(20);
        executor.setQueueCapacity(500);

        // Decorate to propagate ThreadLocal
        executor.setTaskDecorator(runnable -> {
            String correlationId = CorrelationIdContext.getCorrelationId();
            return () -> {
                try {
                    CorrelationIdContext.setCorrelationId(correlationId);
                    runnable.run();
                } finally {
                    CorrelationIdContext.clear();
                }
            };
        });

        executor.initialize();
        return executor;
    }
}
```

### Usage Example

```java
@Service
@Slf4j
public class PaymentService {

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private NotificationService notificationService;

    public PaymentResponse processPayment(PaymentRequest request) {
        // Correlation ID automatically in logs
        log.info("Processing payment for amount: {}", request.getAmount());

        // Call external payment gateway (correlation ID propagated)
        PaymentResponse response = restTemplate.postForObject(
            "https://payment-gateway.com/api/charge",
            request,
            PaymentResponse.class
        );

        // Async notification (correlation ID propagated)
        notificationService.sendPaymentConfirmation(response);

        return response;
    }
}

@Service
@Slf4j
public class NotificationService {

    @Async
    public void sendPaymentConfirmation(PaymentResponse payment) {
        // Same correlation ID even in async method!
        log.info("Sending confirmation email for payment: {}", payment.getId());

        // Email sending logic
    }
}
```

### Log Output

```
2025-01-08 10:15:23 [http-nio-8080-exec-1] INFO [a1b2c3d4-e5f6-4789-a0b1-c2d3e4f5g6h7] PaymentService - Processing payment for amount: 100.00
2025-01-08 10:15:24 [http-nio-8080-exec-1] INFO [a1b2c3d4-e5f6-4789-a0b1-c2d3e4f5g6h7] RestTemplate - Calling payment gateway
2025-01-08 10:15:25 [task-1] INFO [a1b2c3d4-e5f6-4789-a0b1-c2d3e4f5g6h7] NotificationService - Sending confirmation email
```

---

## Multi-Tenancy with ThreadLocal

### The Problem

In a multi-tenant SaaS application, you need to:
- Identify which tenant is making the request
- Automatically filter database queries by tenant
- Prevent cross-tenant data leakage
- Apply tenant-specific configurations

### The Solution

```java
@Component
public class TenantContext {
    private static final ThreadLocal<String> currentTenant = new ThreadLocal<>();

    public static void setTenantId(String tenantId) {
        currentTenant.set(tenantId);
    }

    public static String getTenantId() {
        String tenantId = currentTenant.get();
        if (tenantId == null) {
            throw new IllegalStateException("No tenant context available");
        }
        return tenantId;
    }

    public static void clear() {
        currentTenant.remove();
    }
}
```

### Tenant Resolution Filter

```java
@Component
@Order(1)
public class TenantFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {
        try {
            // Extract tenant from subdomain, header, or JWT
            String tenantId = resolveTenant(request);

            if (tenantId == null) {
                response.sendError(HttpServletResponse.SC_BAD_REQUEST,
                    "Tenant identifier is required");
                return;
            }

            TenantContext.setTenantId(tenantId);
            filterChain.doFilter(request, response);
        } finally {
            TenantContext.clear();
        }
    }

    private String resolveTenant(HttpServletRequest request) {
        // Option 1: From subdomain
        String host = request.getServerName();
        if (host.contains(".")) {
            return host.split("\\.")[0]; // tenant.app.com -> tenant
        }

        // Option 2: From header
        String tenantHeader = request.getHeader("X-Tenant-ID");
        if (tenantHeader != null) {
            return tenantHeader;
        }

        // Option 3: From JWT claims
        String token = request.getHeader("Authorization");
        if (token != null) {
            return jwtUtils.extractTenantId(token);
        }

        return null;
    }
}
```

### Hibernate Interceptor for Automatic Filtering

```java
@Component
public class TenantInterceptor extends EmptyInterceptor {

    @Override
    public String onPrepareStatement(String sql) {
        // Automatically add tenant filter to queries
        String tenantId = TenantContext.getTenantId();

        if (sql.toLowerCase().contains("select") &&
            sql.toLowerCase().contains("from")) {
            // Simple approach: add WHERE clause
            // Production: use Hibernate filters
            sql = sql.replace("WHERE", "WHERE tenant_id = '" + tenantId + "' AND");
        }

        return sql;
    }

    @Override
    public boolean onSave(Object entity, Serializable id,
                          Object[] state, String[] propertyNames,
                          Type[] types) {
        // Automatically set tenant on save
        if (entity instanceof TenantAware) {
            ((TenantAware) entity).setTenantId(TenantContext.getTenantId());
        }
        return false;
    }
}
```

### Entity with Tenant Awareness

```java
@Entity
@Table(name = "orders")
public class Order implements TenantAware {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tenant_id", nullable = false)
    private String tenantId;

    private String customerName;
    private BigDecimal amount;

    @Override
    public void setTenantId(String tenantId) {
        this.tenantId = tenantId;
    }

    @Override
    public String getTenantId() {
        return tenantId;
    }
}

public interface TenantAware {
    void setTenantId(String tenantId);
    String getTenantId();
}
```

### Repository with Manual Filtering

```java
@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    // Manual tenant filtering
    @Query("SELECT o FROM Order o WHERE o.tenantId = :tenantId")
    List<Order> findByTenantId(@Param("tenantId") String tenantId);

    default List<Order> findAllForCurrentTenant() {
        return findByTenantId(TenantContext.getTenantId());
    }
}
```

### Service Layer Usage

```java
@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    public List<Order> getAllOrders() {
        // Automatically filtered by tenant
        return orderRepository.findAllForCurrentTenant();
    }

    public Order createOrder(OrderRequest request) {
        Order order = new Order();
        order.setCustomerName(request.getCustomerName());
        order.setAmount(request.getAmount());
        // Tenant ID set automatically by interceptor

        return orderRepository.save(order);
    }
}
```

---

## Request-Scoped Caching

Sometimes you call the same method multiple times in a single request. Instead of hitting the database each time, cache the result for the request duration. ThreadLocal provides a simple solution without Spring's `@RequestScope` complexity.

**Create a request-scoped cache:**

The cache is a `Map` stored in ThreadLocal. Use `withInitial()` to create an empty map for each thread automatically.

```java
@Component
public class RequestCache {
    private static final ThreadLocal<Map<String, Object>> cache =
        ThreadLocal.withInitial(HashMap::new);

    public static <T> T getOrCompute(String key, Class<T> type, Supplier<T> supplier) {
        Map<String, Object> map = cache.get();
        if (!map.containsKey(key)) {
            T value = supplier.get();
            map.put(key, value);
            return value;
        }
        return type.cast(map.get(key));
    }

    public static void clear() {
        cache.get().clear();
        cache.remove();
    }
}
```

**Clear the cache after each request:**

Run this filter last (`@Order(100)`) to clean up after all processing finishes.

```java
@Component
@Order(100)
public class RequestCacheFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {
        try {
            filterChain.doFilter(request, response);
        } finally {
            RequestCache.clear();
        }
    }
}
```

### Usage in Services

```java
@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public User getCurrentUser() {
        String userId = UserContext.getCurrentUser().getUserId();

        // Cache user for request duration
        return RequestCache.getOrCompute(
            "current_user",
            User.class,
            () -> userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId))
        );
    }
}

@Service
public class OrderService {

    @Autowired
    private UserService userService;

    @Autowired
    private DiscountService discountService;

    public Order createOrder(OrderRequest request) {
        // First call - fetches from DB
        User user = userService.getCurrentUser();

        // Apply business logic
        Order order = buildOrder(request, user);

        // Second call - returns cached instance (same request)
        User userAgain = userService.getCurrentUser();
        // userAgain == user (same instance)

        return orderRepository.save(order);
    }
}
```

### Advanced Caching with TTL

```java
@Component
public class AdvancedRequestCache {

    static class CacheEntry {
        Object value;
        long expiryTime;

        CacheEntry(Object value, long ttlMillis) {
            this.value = value;
            this.expiryTime = System.currentTimeMillis() + ttlMillis;
        }

        boolean isExpired() {
            return System.currentTimeMillis() > expiryTime;
        }
    }

    private static final ThreadLocal<Map<String, CacheEntry>> cache =
        ThreadLocal.withInitial(HashMap::new);

    public static <T> T getOrCompute(String key, Class<T> type,
                                      Supplier<T> supplier, long ttlMillis) {
        Map<String, CacheEntry> map = cache.get();
        CacheEntry entry = map.get(key);

        if (entry == null || entry.isExpired()) {
            T value = supplier.get();
            map.put(key, new CacheEntry(value, ttlMillis));
            return value;
        }

        return type.cast(entry.value);
    }

    public static void clear() {
        cache.get().clear();
        cache.remove();
    }
}
```

---

## Transaction Context Propagation

### The Problem

Need to store transaction metadata (ID, start time, isolation level) accessible throughout the transaction without modifying method signatures.

### The Solution

```java
@Component
public class TransactionContext {

    static class TransactionMetadata {
        private final String transactionId;
        private final Instant startTime;
        private final String isolationLevel;
        private final Map<String, Object> attributes;

        TransactionMetadata(String transactionId, String isolationLevel) {
            this.transactionId = transactionId;
            this.isolationLevel = isolationLevel;
            this.startTime = Instant.now();
            this.attributes = new HashMap<>();
        }

        // Getters and attribute methods
        public void setAttribute(String key, Object value) {
            attributes.put(key, value);
        }

        public <T> T getAttribute(String key, Class<T> type) {
            return type.cast(attributes.get(key));
        }
    }

    private static final ThreadLocal<TransactionMetadata> context = new ThreadLocal<>();

    public static void begin(String isolationLevel) {
        String txId = "TX-" + UUID.randomUUID().toString().substring(0, 8);
        context.set(new TransactionMetadata(txId, isolationLevel));
    }

    public static TransactionMetadata getCurrent() {
        return context.get();
    }

    public static void end() {
        context.remove();
    }
}
```

### Transaction Aspect

```java
@Aspect
@Component
@Slf4j
public class TransactionContextAspect {

    @Around("@annotation(transactional)")
    public Object aroundTransactional(ProceedingJoinPoint pjp,
                                     Transactional transactional) throws Throwable {
        try {
            // Begin transaction context
            TransactionContext.begin(transactional.isolation().name());
            TransactionMetadata tx = TransactionContext.getCurrent();

            log.info("Starting transaction {} with isolation {}",
                tx.getTransactionId(), tx.getIsolationLevel());

            // Execute transactional method
            Object result = pjp.proceed();

            long duration = Duration.between(tx.getStartTime(), Instant.now()).toMillis();
            log.info("Transaction {} completed in {}ms", tx.getTransactionId(), duration);

            return result;
        } finally {
            TransactionContext.end();
        }
    }
}
```

### Usage Example

```java
@Service
public class PaymentService {

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private AuditService auditService;

    @Transactional(isolation = Isolation.SERIALIZABLE)
    public void transferFunds(String fromAccount, String toAccount, BigDecimal amount) {
        TransactionMetadata tx = TransactionContext.getCurrent();
        tx.setAttribute("operation", "FUND_TRANSFER");
        tx.setAttribute("amount", amount);

        // Business logic
        Account from = accountRepository.findById(fromAccount)
            .orElseThrow(() -> new AccountNotFoundException(fromAccount));
        Account to = accountRepository.findById(toAccount)
            .orElseThrow(() -> new AccountNotFoundException(toAccount));

        from.debit(amount);
        to.credit(amount);

        accountRepository.save(from);
        accountRepository.save(to);

        // Audit with transaction context
        auditService.logTransfer(tx, from, to, amount);
    }
}

@Service
@Slf4j
public class AuditService {

    public void logTransfer(TransactionMetadata tx, Account from,
                           Account to, BigDecimal amount) {
        log.info("Transaction {}: Transferred {} from {} to {}",
            tx.getTransactionId(), amount, from.getId(), to.getId());

        AuditLog auditLog = AuditLog.builder()
            .transactionId(tx.getTransactionId())
            .operation(tx.getAttribute("operation", String.class))
            .fromAccount(from.getId())
            .toAccount(to.getId())
            .amount(amount)
            .timestamp(tx.getStartTime())
            .build();

        auditRepository.save(auditLog);
    }
}
```

---

## Security Context Handling

### The Problem

Spring Security's `SecurityContextHolder` uses ThreadLocal internally, but you might need custom security context for:
- API key validation
- Custom authentication schemes
- Multi-factor authentication state
- Permission caching

### The Solution

```java
@Component
public class CustomSecurityContext {

    static class SecurityInfo {
        private final String apiKey;
        private final Set<String> permissions;
        private final boolean mfaVerified;
        private final Instant authTime;

        SecurityInfo(String apiKey, Set<String> permissions, boolean mfaVerified) {
            this.apiKey = apiKey;
            this.permissions = new HashSet<>(permissions);
            this.mfaVerified = mfaVerified;
            this.authTime = Instant.now();
        }

        public boolean hasPermission(String permission) {
            return permissions.contains(permission);
        }
    }

    private static final ThreadLocal<SecurityInfo> securityContext = new ThreadLocal<>();

    public static void setSecurityInfo(String apiKey, Set<String> permissions,
                                       boolean mfaVerified) {
        securityContext.set(new SecurityInfo(apiKey, permissions, mfaVerified));
    }

    public static SecurityInfo getSecurityInfo() {
        SecurityInfo info = securityContext.get();
        if (info == null) {
            throw new SecurityException("No security context available");
        }
        return info;
    }

    public static void clear() {
        securityContext.remove();
    }
}
```

### Security Filter

```java
@Component
@Order(2)
public class ApiKeyAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private ApiKeyService apiKeyService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {
        try {
            String apiKey = request.getHeader("X-API-Key");

            if (apiKey == null) {
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED);
                return;
            }

            // Validate API key and load permissions
            ApiKeyDetails details = apiKeyService.validate(apiKey);

            // Check if MFA is required and verified
            boolean mfaVerified = checkMfaStatus(request, details);

            CustomSecurityContext.setSecurityInfo(
                apiKey,
                details.getPermissions(),
                mfaVerified
            );

            filterChain.doFilter(request, response);
        } finally {
            CustomSecurityContext.clear();
        }
    }

    private boolean checkMfaStatus(HttpServletRequest request, ApiKeyDetails details) {
        if (!details.requiresMfa()) {
            return true;
        }
        String mfaToken = request.getHeader("X-MFA-Token");
        return mfaToken != null && mfaService.verify(mfaToken, details.getUserId());
    }
}
```

### Permission Checking Annotation

```java
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface RequirePermission {
    String value();
}

@Aspect
@Component
public class PermissionCheckAspect {

    @Before("@annotation(requirePermission)")
    public void checkPermission(RequirePermission requirePermission) {
        SecurityInfo security = CustomSecurityContext.getSecurityInfo();

        if (!security.hasPermission(requirePermission.value())) {
            throw new AccessDeniedException(
                "Missing required permission: " + requirePermission.value()
            );
        }

        if (!security.isMfaVerified()) {
            throw new MfaRequiredException("MFA verification required");
        }
    }
}
```

### Usage in Controllers

```java
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @PostMapping("/users")
    @RequirePermission("user.create")
    public ResponseEntity<User> createUser(@RequestBody UserRequest request) {
        // Permission automatically checked
        // No need to manually verify

        User user = userService.createUser(request);
        return ResponseEntity.ok(user);
    }

    @DeleteMapping("/users/{id}")
    @RequirePermission("user.delete")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        SecurityInfo security = CustomSecurityContext.getSecurityInfo();

        // Additional custom checks
        if (!security.isMfaVerified()) {
            throw new MfaRequiredException("Deletion requires MFA");
        }

        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}
```

---

## Common Pitfalls and Memory Leaks

### The Forgotten Cleanup

Application servers like Tomcat use thread pools. A thread serves Request A, then Request B, then Request C. If you forget to clear ThreadLocal, Request B sees data from Request A. Worse, memory leaks until the JVM crashes.

**The mistake:**

```java
public class UserContext {
    private static ThreadLocal<User> user = new ThreadLocal<>();

    public static void setUser(User u) {
        user.set(u);
    }
}
```

No `clear()` method. The data stays forever.

**The fix:**

Always use a finally block in your filter:

```java
@Component
public class CleanupFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain)
            throws ServletException, IOException {
        try {
            chain.doFilter(request, response);
        } finally {
            UserContext.clear();
            TenantContext.clear();
            CorrelationIdContext.clear();
            RequestCache.clear();
        }
    }
}
```

The finally block runs even if the request throws an exception. Every ThreadLocal gets cleaned.

### Async Methods Lose Context

Spring's `@Async` runs methods in a different thread. ThreadLocal doesn't transfer automatically—the new thread sees null.

**The problem:**

```java
@Service
public class NotificationService {

    @Async
    public void sendEmail() {
        User user = UserContext.getCurrentUser();  // Returns null!
    }
}
```

**The solution:**

Use a TaskDecorator to capture and restore ThreadLocal values:

```java
@Configuration
@EnableAsync
public class AsyncConfig implements AsyncConfigurer {

    @Override
    public Executor getAsyncExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();

        executor.setTaskDecorator(runnable -> {
            User currentUser = UserContext.getCurrentUser();
            String tenantId = TenantContext.getTenantId();

            return () -> {
                try {
                    UserContext.setCurrentUser(currentUser);
                    TenantContext.setTenantId(tenantId);
                    runnable.run();
                } finally {
                    // Clean up in new thread
                    UserContext.clear();
                    TenantContext.clear();
                    CorrelationIdContext.clear();
                }
            };
        });

        return executor;
    }
}
```

### Pitfall 3: ThreadLocal with Virtual Threads (Java 21+)

**Problem:**
Virtual threads are lightweight and numerous. ThreadLocal can cause:
- High memory usage (millions of virtual threads = millions of copies)
- Performance degradation

**Solution: ScopedValue (Java 21+)**
```java
// Preferred for virtual threads
public class ModernContext {
    private static final ScopedValue<User> USER = ScopedValue.newInstance();

    public static void runWithUser(User user, Runnable action) {
        ScopedValue.where(USER, user).run(action);
    }

    public static User getCurrentUser() {
        return USER.get();
    }
}
```

### Pitfall 4: Storing Large Objects

**Problem:**
```java
// Bad - storing large object
private static ThreadLocal<List<Order>> orderCache = new ThreadLocal<>();

public void processOrders() {
    List<Order> orders = loadAllOrders(); // 10,000 orders
    orderCache.set(orders); // Memory waste!
}
```

**Solution: Store Only References**
```java
// Good - store only IDs
private static ThreadLocal<Set<Long>> orderIds = new ThreadLocal<>();

public void processOrders() {
    Set<Long> ids = loadOrderIds();
    orderIds.set(ids); // Minimal memory
}
```

---

## Best Practices

### Use try-finally Every Time

Never set a ThreadLocal without a corresponding clear() in a finally block. This isn't optional—it's mandatory.

```java
@Component
public class ContextFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain)
            throws ServletException, IOException {
        try {
            UserContext.setCurrentUser(user);
            chain.doFilter(request, response);
        } finally {
            UserContext.clear();
        }
    }
}
```

### Initialize with Defaults

Use `withInitial()` to avoid null checks:

```java
private static ThreadLocal<Map<String, Object>> cache =
    ThreadLocal.withInitial(HashMap::new);
```

Now `cache.get()` never returns null—it creates an empty map automatically.

### Document the Lifecycle

Future maintainers need to know when the value gets set and cleared:

```java
/**
 * Stores tenant ID for the current request.
 *
 * Set by: TenantFilter at request start
 * Cleared by: TenantFilter in finally block
 * Thread-safe: Yes (ThreadLocal)
 */
@Component
public class TenantContext {
    private static final ThreadLocal<String> tenantId = new ThreadLocal<>();

    public static void setTenantId(String id) {
        tenantId.set(id);
    }

    public static String getTenantId() {
        return tenantId.get();
    }

    public static void clear() {
        tenantId.remove();
    }
}
```

---

## Testing ThreadLocal Code

Set up and tear down ThreadLocal in test methods:

```java
@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserService userService;

    @BeforeEach
    void setUp() {
        UserDetails user = new UserDetails("testuser", "test@example.com");
        UserContext.setCurrentUser(user);
    }

    @AfterEach
    void tearDown() {
        UserContext.clear();
    }

    @Test
    void shouldCreateOrderWithCurrentUser() {
        OrderRequest request = new OrderRequest();
        request.setItems(List.of("item1", "item2"));

        Order order = userService.createOrder(request);

        assertThat(order.getUserId()).isEqualTo("testuser");
    }
}
```

For integration tests, the filter handles setup and cleanup automatically:

```java
@SpringBootTest
@AutoConfigureMockMvc
class OrderControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void shouldHandleTenantContext() throws Exception {
        mockMvc.perform(post("/api/orders")
                .header("X-Tenant-ID", "tenant-123")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"items\": [\"item1\"]}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.tenantId").value("tenant-123"));
    }
}
```

### Concurrent Test

```java
@Test
void shouldIsolateThreadLocalAcrossThreads() throws Exception {
    int threadCount = 10;
    ExecutorService executor = Executors.newFixedThreadPool(threadCount);
    CountDownLatch latch = new CountDownLatch(threadCount);

    for (int i = 0; i < threadCount; i++) {
        final String tenantId = "tenant-" + i;
        executor.submit(() -> {
            try {
                TenantContext.setTenantId(tenantId);

                // Simulate work
                Thread.sleep(100);

                // Verify isolation
                String retrievedTenant = TenantContext.getTenantId();
                assertThat(retrievedTenant).isEqualTo(tenantId);
            } finally {
                TenantContext.clear();
                latch.countDown();
            }
        });
    }

    latch.await(5, TimeUnit.SECONDS);
    executor.shutdown();
}
```

---

## Conclusion

ThreadLocal is a powerful tool in Spring Boot applications for managing request-scoped context without polluting method signatures. When used correctly, it enables clean, maintainable code for:

ThreadLocal solves real problems: user context, distributed tracing, multi-tenancy, request caching, and transaction propagation. It keeps code clean—no parameter drilling through every method.

But it demands discipline. Always clean up in a finally block. Every time. No exceptions. Forget once and you leak memory. In a thread pool, that leak compounds until the JVM dies.

For async methods, use a TaskDecorator to propagate values. For Java 21's virtual threads, consider ScopedValue instead—it's designed for lightweight threads.

Don't use ThreadLocal to share data across threads. Don't use it in long-lived background threads. Don't use it to avoid proper dependency injection.

**The rule:** Every `set()` needs a `remove()` in a finally block.

Follow that rule and ThreadLocal becomes a precise tool for elegant solutions.
