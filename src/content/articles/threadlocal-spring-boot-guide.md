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

# ThreadLocal in Spring Boot: Solving Real-World Problems with Thread-Confined Storage

ThreadLocal is one of Java's most powerful yet misunderstood concurrency utilities. In Spring Boot applications, it's the secret weapon for managing request-scoped data, implementing distributed tracing, handling multi-tenancy, and solving numerous other challenges where you need thread-confined storage.

This comprehensive guide explores ThreadLocal through real-world Spring Boot problems, showing you when to use it, how to implement it correctly, and—crucially—how to avoid the memory leaks that have plagued countless production applications.

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

ThreadLocal provides thread-confined variables—each thread accessing a ThreadLocal variable has its own, independently initialized copy of the variable.

### Basic Concept

```java
public class ThreadLocalExample {
    private static ThreadLocal<String> userContext = new ThreadLocal<>();

    public static void setUser(String username) {
        userContext.set(username);
    }

    public static String getUser() {
        return userContext.get();
    }

    public static void clear() {
        userContext.remove(); // Critical: prevents memory leaks
    }
}
```

**How it works:**
- Each thread gets its own copy of the variable
- Setting a value in one thread doesn't affect other threads
- Values are isolated per thread
- Memory is reclaimed when thread dies (if properly cleaned)

### Visual Representation

```
Thread-1                    Thread-2                    Thread-3
┌──────────┐               ┌──────────┐               ┌──────────┐
│ User:    │               │ User:    │               │ User:    │
│ "alice"  │               │ "bob"    │               │ "charlie"│
└──────────┘               └──────────┘               └──────────┘
     ↓                          ↓                          ↓
ThreadLocal<String>        ThreadLocal<String>        ThreadLocal<String>
     ↓                          ↓                          ↓
  Same variable, different values per thread
```

---

## The Problem ThreadLocal Solves

### The Challenge

In Spring Boot applications, you often need to:
- Track which user made a request
- Propagate correlation IDs for logging
- Manage tenant context in multi-tenant apps
- Store transaction metadata
- Cache data for the request lifecycle

**Without ThreadLocal**, you'd have to:
1. Pass context objects through every method
2. Store in servlet request attributes (limited to web layer)
3. Use global static variables (not thread-safe)

### The Solution

ThreadLocal provides clean, thread-safe context propagation without method parameter pollution.

**Problem: Passing user context everywhere**
```java
// Without ThreadLocal - Parameter drilling
public void processOrder(Order order, User user) {
    validateOrder(order, user);
    calculateTotal(order, user);
    applyDiscounts(order, user);
    saveOrder(order, user);
}

private void applyDiscounts(Order order, User user) {
    // Need user in every method
    if (user.isPremium()) {
        order.applyDiscount(10);
    }
}
```

**Solution: ThreadLocal context**
```java
// With ThreadLocal - Clean methods
public void processOrder(Order order) {
    User user = UserContext.getCurrentUser();
    validateOrder(order);
    calculateTotal(order);
    applyDiscounts(order);
    saveOrder(order);
}

private void applyDiscounts(Order order) {
    User user = UserContext.getCurrentUser();
    if (user.isPremium()) {
        order.applyDiscount(10);
    }
}
```

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

### The Problem

In a typical Spring Boot REST API, you need the authenticated user's information across service layers, repositories, and even utilities. Passing `User` or `Authentication` objects through every method is verbose and pollutes your code.

### The Solution

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

### Implementation with Filter

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
            // Extract user from JWT/session/header
            String username = extractUsername(request);
            UserDetails user = userService.loadUserByUsername(username);

            // Set in ThreadLocal
            UserContext.setCurrentUser(user);

            // Continue filter chain
            filterChain.doFilter(request, response);
        } finally {
            // CRITICAL: Clean up
            UserContext.clear();
        }
    }

    private String extractUsername(HttpServletRequest request) {
        // Extract from JWT token, session, or header
        String token = request.getHeader("Authorization");
        return jwtUtils.extractUsername(token);
    }
}
```

### Usage in Service Layer

```java
@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private AuditService auditService;

    public Order createOrder(OrderRequest request) {
        // No need to pass user as parameter
        UserDetails currentUser = UserContext.getCurrentUser();

        Order order = new Order();
        order.setUserId(currentUser.getUserId());
        order.setItems(request.getItems());

        Order saved = orderRepository.save(order);

        // Audit log automatically knows the user
        auditService.logOrderCreation(saved);

        return saved;
    }
}

@Service
public class AuditService {

    public void logOrderCreation(Order order) {
        UserDetails user = UserContext.getCurrentUser();

        AuditLog log = AuditLog.builder()
            .action("ORDER_CREATED")
            .userId(user.getUserId())
            .username(user.getUsername())
            .orderId(order.getId())
            .timestamp(Instant.now())
            .build();

        auditRepository.save(log);
    }
}
```

### Benefits

✅ **Clean Code**: No user parameter in every method
✅ **Layer Independence**: Service doesn't depend on web layer
✅ **Easy Testing**: Mock UserContext in tests
✅ **Audit Trail**: Automatic user tracking

---

## Distributed Tracing Implementation

### The Problem

In microservices, tracking a request across multiple services requires correlation IDs. You need to:
1. Generate correlation ID for incoming requests
2. Include it in all logs
3. Pass it to downstream services
4. Maintain it through async operations

### The Solution

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

    public static String getOrGenerate() {
        String id = correlationId.get();
        if (id == null) {
            id = UUID.randomUUID().toString();
            correlationId.set(id);
        }
        return id;
    }

    public static void clear() {
        correlationId.remove();
    }
}
```

### Filter Implementation

```java
@Component
@Order(0) // Execute before other filters
public class CorrelationIdFilter extends OncePerRequestFilter {

    private static final String CORRELATION_ID_HEADER = "X-Correlation-ID";

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {
        try {
            // Get from header or generate new
            String correlationId = request.getHeader(CORRELATION_ID_HEADER);
            if (correlationId == null) {
                correlationId = UUID.randomUUID().toString();
            }

            CorrelationIdContext.setCorrelationId(correlationId);

            // Add to response for client tracking
            response.setHeader(CORRELATION_ID_HEADER, correlationId);

            // Add to MDC for logging
            MDC.put("correlationId", correlationId);

            filterChain.doFilter(request, response);
        } finally {
            MDC.remove("correlationId");
            CorrelationIdContext.clear();
        }
    }
}
```

### RestTemplate Integration

```java
@Configuration
public class RestTemplateConfig {

    @Bean
    public RestTemplate restTemplate() {
        RestTemplate restTemplate = new RestTemplate();

        // Add interceptor to propagate correlation ID
        restTemplate.getInterceptors().add((request, body, execution) -> {
            String correlationId = CorrelationIdContext.getCorrelationId();
            if (correlationId != null) {
                request.getHeaders().add("X-Correlation-ID", correlationId);
            }
            return execution.execute(request, body);
        });

        return restTemplate;
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

## Request Scoped Caching

### The Problem

You need to cache data for the duration of a request to avoid repeated database queries, but:
- Spring's `@RequestScope` is complex
- Don't want to use servlet request attributes
- Need to work outside web layer

### The Solution

```java
@Component
public class RequestCache {
    private static final ThreadLocal<Map<String, Object>> cache =
        ThreadLocal.withInitial(HashMap::new);

    public static <T> T get(String key, Class<T> type) {
        return type.cast(cache.get().get(key));
    }

    public static void put(String key, Object value) {
        cache.get().put(key, value);
    }

    public static <T> T getOrCompute(String key, Class<T> type,
                                      Supplier<T> supplier) {
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

### Filter to Clear Cache

```java
@Component
@Order(100) // Execute last
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

### Pitfall 1: Not Cleaning Up ThreadLocal

**Problem:**
```java
// DANGEROUS - Memory leak!
public class UserContext {
    private static ThreadLocal<User> user = new ThreadLocal<>();

    public static void setUser(User u) {
        user.set(u);
        // No cleanup method!
    }
}
```

**In application servers (Tomcat, Jetty), threads are pooled. If you don't clean ThreadLocal:**
- Old data persists across requests
- Memory leak grows over time
- Can cause `OutOfMemoryError`

**Solution:**
```java
@Component
public class CleanupFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {
        try {
            filterChain.doFilter(request, response);
        } finally {
            // Clean ALL ThreadLocals
            UserContext.clear();
            TenantContext.clear();
            CorrelationIdContext.clear();
            RequestCache.clear();
            // ... clean all contexts
        }
    }
}
```

### Pitfall 2: ThreadLocal in Async Methods

**Problem:**
```java
@Service
public class NotificationService {

    @Async
    public void sendEmail() {
        // NULL! ThreadLocal doesn't propagate to new thread
        User user = UserContext.getCurrentUser();
    }
}
```

**Solution: Task Decorator**
```java
@Configuration
@EnableAsync
public class AsyncConfig implements AsyncConfigurer {

    @Override
    public Executor getAsyncExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();

        executor.setTaskDecorator(runnable -> {
            // Capture ThreadLocal values
            User currentUser = UserContext.getCurrentUser();
            String tenantId = TenantContext.getTenantId();
            String correlationId = CorrelationIdContext.getCorrelationId();

            return () -> {
                try {
                    // Restore in new thread
                    UserContext.setCurrentUser(currentUser);
                    TenantContext.setTenantId(tenantId);
                    CorrelationIdContext.setCorrelationId(correlationId);

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

### 1. Always Clean Up

```java
// Pattern: try-finally in filters
@Component
public class ContextFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(...) {
        try {
            // Set context
            UserContext.setCurrentUser(user);
            filterChain.doFilter(request, response);
        } finally {
            // ALWAYS clean up
            UserContext.clear();
        }
    }
}
```

### 2. Use `withInitial()` for Default Values

```java
// Good - prevents NPE
private static ThreadLocal<Map<String, Object>> cache =
    ThreadLocal.withInitial(HashMap::new);

// Bad - can return null
private static ThreadLocal<Map<String, Object>> cache = new ThreadLocal<>();
```

### 3. Create Wrapper Classes

```java
// Encapsulate ThreadLocal logic
@Component
public class RequestContext {
    private static final ThreadLocal<Map<String, Object>> attributes =
        ThreadLocal.withInitial(HashMap::new);

    public static <T> void setAttribute(String key, T value) {
        attributes.get().put(key, value);
    }

    public static <T> T getAttribute(String key, Class<T> type) {
        return type.cast(attributes.get().get(key));
    }

    public static void clear() {
        attributes.get().clear();
        attributes.remove();
    }
}
```

### 4. Document Lifecycle

```java
/**
 * Stores tenant context for current request.
 *
 * Lifecycle:
 * - Set by TenantFilter at request start
 * - Available throughout request processing
 * - Cleared by TenantFilter in finally block
 *
 * Thread Safety: Yes (ThreadLocal)
 * Memory: Cleaned per request
 */
@Component
public class TenantContext {
    // ...
}
```

### 5. Monitor for Leaks

```java
@Component
@Slf4j
public class ThreadLocalMonitor {

    @Scheduled(fixedRate = 60000) // Every minute
    public void checkForLeaks() {
        // Use tools like JProfiler, YourKit, or custom logic
        int threadCount = Thread.activeCount();

        if (threadCount > 1000) {
            log.warn("High thread count: {}. Check for ThreadLocal leaks!", threadCount);
        }
    }
}
```

---

## Testing ThreadLocal Code

### Unit Tests

```java
@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserService userService;

    @BeforeEach
    void setUp() {
        // Set up ThreadLocal before each test
        UserDetails user = new UserDetails("testuser", "test@example.com");
        UserContext.setCurrentUser(user);
    }

    @AfterEach
    void tearDown() {
        // Clean up after each test
        UserContext.clear();
    }

    @Test
    void shouldCreateOrderWithCurrentUser() {
        // Arrange
        OrderRequest request = new OrderRequest();
        request.setItems(List.of("item1", "item2"));

        // Act
        Order order = userService.createOrder(request);

        // Assert
        assertThat(order.getUserId()).isEqualTo("testuser");
    }
}
```

### Integration Tests

```java
@SpringBootTest
@AutoConfigureMockMvc
class OrderControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void shouldHandleRequestWithTenantContext() throws Exception {
        mockMvc.perform(post("/api/orders")
                .header("X-Tenant-ID", "tenant-123")
                .header("Authorization", "Bearer token")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"items\": [\"item1\"]}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.tenantId").value("tenant-123"));
    }

    @Test
    void shouldClearContextAfterRequest() throws Exception {
        // First request
        mockMvc.perform(get("/api/orders")
                .header("X-Tenant-ID", "tenant-123"))
            .andExpect(status().isOk());

        // Verify context is cleared (second request with different tenant)
        mockMvc.perform(get("/api/orders")
                .header("X-Tenant-ID", "tenant-456"))
            .andExpect(status().isOk());

        // Should not have data from previous request
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

✅ **User context management** - Access current user anywhere
✅ **Distributed tracing** - Correlation IDs across services
✅ **Multi-tenancy** - Automatic tenant isolation
✅ **Request caching** - Avoid repeated queries
✅ **Transaction context** - Propagate metadata
✅ **Security context** - Custom authentication schemes

### Key Takeaways

1. **Always clean up** - Use try-finally blocks
2. **Handle async carefully** - Use TaskDecorator
3. **Document lifecycle** - Make it clear when context is set/cleared
4. **Monitor for leaks** - Use profiling tools
5. **Test thoroughly** - Unit and integration tests
6. **Consider alternatives** - ScopedValue for virtual threads (Java 21+)

### When NOT to Use ThreadLocal

❌ Don't use for:
- Sharing data across threads
- Long-lived background threads
- Replacing proper dependency injection
- Avoiding proper architecture

### Final Thoughts

ThreadLocal is like a sharp knife—incredibly useful when wielded correctly, dangerous when misused. Master the cleanup patterns, understand the pitfalls, and you'll have a powerful tool for building clean, maintainable Spring Boot applications.

Remember: **Every `ThreadLocal.set()` must have a corresponding `ThreadLocal.remove()`** in a finally block. Make this your mantra, and you'll avoid 99% of ThreadLocal-related issues.

---

## Additional Resources

- [Java ThreadLocal Documentation](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/lang/ThreadLocal.html)
- [Spring Security SecurityContextHolder](https://docs.spring.io/spring-security/reference/servlet/authentication/architecture.html)
- [JEP 429: Scoped Values (Java 21)](https://openjdk.org/jeps/429)
- [Hunting ThreadLocal Memory Leaks in Java](https://www.baeldung.com/java-memory-leaks)

Happy coding! 🚀
