---
title: "Spring Boot Reactive Programming - Part 5: Advanced Error Handling and Resilience"
description: "Build resilient reactive microservices with advanced error handling, retry policies, circuit breakers, fallback strategies, and timeouts. Learn production-ready patterns for handling failures gracefully."
publishDate: 2025-10-06
publishedAt: 2025-10-06
tags: ["Spring Boot", "Reactor", "Error Handling", "Resilience4j", "Circuit Breaker", "Retry"]
difficulty: "advanced"
series: "Spring Boot Reactive Programming"
part: 5
estimatedTime: "90 minutes"
totalParts: 8
featured: true
---

# Spring Boot Reactive Programming - Part 5: Advanced Error Handling and Resilience

Building resilient microservices requires sophisticated error handling. In this part, we'll master error recovery, retry policies, circuit breakers, and fallback strategies to build production-ready reactive applications.

## Error Propagation in Reactive Streams

### How Errors Flow

```java
public class ErrorPropagation {

    public void demonstrateErrorFlow() {
        Flux.just(1, 2, 3, 4, 5)
            .map(i -> {
                log.info("Map: {}", i);
                if (i == 3) {
                    throw new RuntimeException("Error at 3!");
                }
                return i * 2;
            })
            .filter(i -> {
                log.info("Filter: {}", i);
                return i > 0;
            })
            .subscribe(
                value -> log.info("Value: {}", value),
                error -> log.error("Error: {}", error.getMessage()),
                () -> log.info("Complete")
            );

        /* Output:
         * Map: 1
         * Filter: 2
         * Value: 2
         * Map: 2
         * Filter: 4
         * Value: 4
         * Map: 3
         * Error: Error at 3!
         *
         * Stream terminates! Items 4 and 5 are NEVER processed.
         */
    }
}
```

**Key Point:** An error **terminates the stream**. No more items are emitted.

## Basic Error Handling

### onErrorReturn() - Fallback Value

```java
@Service
public class FallbackService {

    // Return default value on error
    public Mono<User> getUserWithDefault(Long id) {
        return userRepository.findById(id)
            .onErrorReturn(new User(0L, "Guest User"));
    }

    // Conditional fallback
    public Mono<Product> getProductWithFallback(Long id) {
        return productRepository.findById(id)
            .onErrorReturn(NotFoundException.class,
                new Product(0L, "Product Not Available")
            );
    }

    // Predicate-based fallback
    public Mono<Price> getPriceWithFallback(String symbol) {
        return priceService.getPrice(symbol)
            .onErrorReturn(
                error -> error instanceof TimeoutException,
                new Price(symbol, BigDecimal.ZERO)
            );
    }
}
```

### onErrorResume() - Fallback Publisher

```java
@Service
public class FallbackPublisherService {

    @Autowired private PrimaryDataSource primarySource;
    @Autowired private BackupDataSource backupSource;
    @Autowired private CacheService cacheService;

    // Fallback to alternative source
    public Mono<Data> getDataWithFallback(String id) {
        return primarySource.getData(id)
            .onErrorResume(error -> {
                log.warn("Primary source failed, trying backup: {}",
                    error.getMessage());
                return backupSource.getData(id);
            });
    }

    // Multiple fallbacks (waterfall pattern)
    public Mono<User> getUserWithMultipleFallbacks(Long id) {
        return userRepository.findById(id)
            .doOnError(e -> log.warn("Database failed: {}", e.getMessage()))
            .onErrorResume(DatabaseException.class, e ->
                cacheService.getUser(id)
                    .doOnError(err -> log.warn("Cache failed: {}", err.getMessage()))
            )
            .onErrorResume(CacheException.class, e ->
                legacyService.getUser(id)
                    .doOnError(err -> log.warn("Legacy service failed: {}", err.getMessage()))
            )
            .onErrorReturn(new User(id, "Unknown User"));
    }

    // Real-world: Payment processing with fallback
    public Mono<PaymentResult> processPayment(Payment payment) {
        return primaryPaymentGateway.process(payment)
            .timeout(Duration.ofSeconds(5))
            .onErrorResume(TimeoutException.class, e -> {
                log.error("Primary gateway timeout, using backup");
                return backupPaymentGateway.process(payment);
            })
            .onErrorResume(PaymentException.class, e -> {
                log.error("Payment failed: {}", e.getMessage());
                return Mono.just(PaymentResult.failed(e.getMessage()));
            });
    }
}
```

### onErrorMap() - Transform Errors

```java
@Service
public class ErrorTransformationService {

    // Map technical error to business error
    public Mono<Order> getOrder(Long id) {
        return orderRepository.findById(id)
            .switchIfEmpty(Mono.error(
                new OrderNotFoundException("Order not found: " + id)
            ))
            .onErrorMap(R2dbcException.class, e ->
                new DatabaseException("Failed to retrieve order", e)
            );
    }

    // Add context to errors
    public Mono<User> getUserWithContext(Long id) {
        return userRepository.findById(id)
            .onErrorMap(error ->
                new UserServiceException(
                    String.format("Failed to get user %d: %s",
                        id, error.getMessage()),
                    error
                )
            );
    }

    // Conditional error mapping
    public Flux<Product> getProducts() {
        return productRepository.findAll()
            .onErrorMap(
                error -> error.getMessage().contains("timeout"),
                error -> new TimeoutException("Database timeout", error)
            );
    }
}
```

### onErrorContinue() - Skip Errors, Continue Stream

```java
@Service
public class ErrorSkippingService {

    // Continue processing even if some items fail
    public Flux<ProcessedData> processDataWithSkip(Flux<RawData> data) {
        return data
            .onErrorContinue((error, item) -> {
                log.error("Failed to process item: {}, error: {}",
                    item, error.getMessage());
                metrics.incrementSkipped();
            })
            .map(this::processItem);
    }

    // Real-world: Batch import with error tolerance
    public Mono<ImportResult> importUsers(Flux<UserDto> users) {
        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger errorCount = new AtomicInteger(0);

        return users
            .onErrorContinue((error, user) -> {
                log.error("Failed to import user: {}", user, error);
                errorCount.incrementAndGet();
            })
            .flatMap(this::saveUser)
            .doOnNext(saved -> successCount.incrementAndGet())
            .then(Mono.fromCallable(() ->
                new ImportResult(successCount.get(), errorCount.get())
            ));
    }

    private Mono<User> saveUser(UserDto dto) {
        return userRepository.save(toEntity(dto));
    }

    private User toEntity(UserDto dto) {
        return new User(null, dto.getName(), dto.getEmail());
    }

    private ProcessedData processItem(RawData raw) {
        return new ProcessedData(raw);
    }
}
```

## Retry Strategies

### Simple Retry

```java
@Service
public class RetryService {

    // Retry up to 3 times
    public Mono<Data> getDataWithRetry(String id) {
        return dataService.getData(id)
            .retry(3)
            .doOnError(e ->
                log.error("Failed after 3 retries: {}", e.getMessage())
            );
    }

    // Retry only specific errors
    public Mono<User> getUserWithConditionalRetry(Long id) {
        return userRepository.findById(id)
            .retryWhen(Retry.max(3)
                .filter(error -> error instanceof TransientException)
                .doBeforeRetry(signal ->
                    log.warn("Retry attempt {}: {}",
                        signal.totalRetries() + 1,
                        signal.failure().getMessage())
                )
            );
    }
}
```

### Exponential Backoff

```java
@Service
@Slf4j
public class ExponentialBackoffService {

    // Retry with exponential backoff
    public Mono<ApiResponse> callExternalApi(Request request) {
        return webClient.post()
            .uri("/api/endpoint")
            .body(Mono.just(request), Request.class)
            .retrieve()
            .bodyToMono(ApiResponse.class)
            .retryWhen(
                Retry.backoff(5, Duration.ofSeconds(1))
                    .maxBackoff(Duration.ofSeconds(30))
                    .jitter(0.5)  // Add randomness to prevent thundering herd
                    .doBeforeRetry(signal ->
                        log.warn("Retry {} after {}ms: {}",
                            signal.totalRetries() + 1,
                            signal.totalRetriesInARow() * 1000,
                            signal.failure().getMessage())
                    )
                    .onRetryExhaustedThrow((spec, signal) ->
                        new ExternalServiceException(
                            "API call failed after " + signal.totalRetries() + " retries",
                            signal.failure()
                        )
                    )
            );
    }

    // Advanced retry configuration
    public Mono<Payment> processPaymentWithRetry(Payment payment) {
        return paymentGateway.process(payment)
            .retryWhen(
                Retry.backoff(3, Duration.ofSeconds(2))
                    .maxBackoff(Duration.ofSeconds(10))
                    .filter(error ->
                        // Only retry transient errors
                        error instanceof NetworkException ||
                        error instanceof TimeoutException
                    )
                    .doBeforeRetry(signal -> {
                        log.warn("Retrying payment {} (attempt {}): {}",
                            payment.getId(),
                            signal.totalRetries() + 1,
                            signal.failure().getMessage());
                        metrics.incrementRetryCount();
                    })
                    .onRetryExhaustedThrow((spec, signal) -> {
                        log.error("Payment {} failed after {} retries",
                            payment.getId(), signal.totalRetries());
                        return new PaymentFailedException(
                            "Payment processing failed permanently",
                            signal.failure()
                        );
                    })
            );
    }
}
```

### Custom Retry Logic

```java
@Service
public class CustomRetryService {

    // Retry with custom logic
    public <T> Mono<T> retryWithCustomLogic(Mono<T> source) {
        return source
            .retryWhen(Retry.from(companion ->
                companion.flatMap(signal -> {
                    long attempt = signal.totalRetries();
                    Throwable error = signal.failure();

                    // Don't retry after 5 attempts
                    if (attempt >= 5) {
                        return Mono.error(error);
                    }

                    // Don't retry client errors (4xx)
                    if (error instanceof ClientException) {
                        return Mono.error(error);
                    }

                    // Exponential backoff: 1s, 2s, 4s, 8s, 16s
                    long delayMs = (long) Math.pow(2, attempt) * 1000;

                    log.warn("Retry attempt {} after {}ms",
                        attempt + 1, delayMs);

                    return Mono.delay(Duration.ofMillis(delayMs));
                })
            ));
    }

    // Retry with increasing timeout
    public Mono<Data> getDataWithIncreasingTimeout(String id) {
        AtomicInteger attemptCount = new AtomicInteger(0);

        return Mono.defer(() -> {
            int attempt = attemptCount.incrementAndGet();
            Duration timeout = Duration.ofSeconds(attempt * 2);

            return dataService.getData(id)
                .timeout(timeout)
                .doOnError(e ->
                    log.warn("Attempt {} failed with timeout {}s",
                        attempt, timeout.getSeconds())
                );
        })
        .retry(3);
    }
}
```

## Circuit Breaker with Resilience4j

### Configuration

```java
@Configuration
public class ResilienceConfig {

    @Bean
    public CircuitBreakerRegistry circuitBreakerRegistry() {
        CircuitBreakerConfig config = CircuitBreakerConfig.custom()
            .slidingWindowType(SlidingWindowType.COUNT_BASED)
            .slidingWindowSize(10)  // Last 10 calls
            .failureRateThreshold(50)  // Open if 50% fail
            .waitDurationInOpenState(Duration.ofSeconds(30))
            .permittedNumberOfCallsInHalfOpenState(5)
            .slowCallRateThreshold(50)  // Slow if 50% > duration threshold
            .slowCallDurationThreshold(Duration.ofSeconds(2))
            .recordExceptions(
                NetworkException.class,
                TimeoutException.class
            )
            .ignoreExceptions(
                BusinessException.class,
                ValidationException.class
            )
            .build();

        return CircuitBreakerRegistry.of(config);
    }

    @Bean
    public CircuitBreaker paymentCircuitBreaker(
            CircuitBreakerRegistry registry) {
        return registry.circuitBreaker("payment-service");
    }
}
```

### Using Circuit Breaker

```java
@Service
@Slf4j
public class ResilientPaymentService {

    @Autowired private CircuitBreaker paymentCircuitBreaker;
    @Autowired private PaymentGateway paymentGateway;
    @Autowired private MetricsService metrics;

    public Mono<PaymentResult> processPayment(Payment payment) {
        return Mono.fromCallable(() ->
            paymentCircuitBreaker.executeCallable(() ->
                blockingPaymentCall(payment)
            )
        )
        .subscribeOn(Schedulers.boundedElastic())
        .doOnSuccess(result -> {
            log.info("Payment processed: {}", result.getTransactionId());
            metrics.incrementSuccess();
        })
        .onErrorResume(CallNotPermittedException.class, e -> {
            // Circuit breaker is OPEN
            log.error("Circuit breaker open for payment service");
            metrics.incrementCircuitBreakerOpen();
            return Mono.just(PaymentResult.circuitBreakerOpen());
        })
        .onErrorResume(Exception.class, e -> {
            log.error("Payment failed: {}", e.getMessage());
            metrics.incrementFailure();
            return Mono.just(PaymentResult.failed(e.getMessage()));
        });
    }

    // Reactive circuit breaker
    public Mono<User> getUserReactive(Long id) {
        return Mono.defer(() -> userService.getUser(id))
            .transformDeferred(
                CircuitBreakerOperator.of(paymentCircuitBreaker)
            )
            .onErrorResume(CallNotPermittedException.class, e -> {
                log.error("Circuit breaker open");
                return cacheService.getUser(id);  // Fallback to cache
            });
    }

    // Monitor circuit breaker state
    @PostConstruct
    public void monitorCircuitBreaker() {
        paymentCircuitBreaker.getEventPublisher()
            .onStateTransition(event -> {
                CircuitBreaker.State from = event.getStateTransition().getFromState();
                CircuitBreaker.State to = event.getStateTransition().getToState();

                log.warn("Circuit breaker state change: {} -> {}", from, to);

                if (to == CircuitBreaker.State.OPEN) {
                    alertService.sendAlert(
                        "Payment service circuit breaker OPEN"
                    );
                }
            })
            .onError(event ->
                log.error("Circuit breaker error: {}", event.getThrowable())
            )
            .onSuccess(event ->
                log.debug("Circuit breaker success")
            );
    }

    private PaymentResult blockingPaymentCall(Payment payment) {
        // Blocking payment gateway call
        return paymentGateway.processSync(payment);
    }
}
```

## Timeout Handling

```java
@Service
public class TimeoutService {

    // Simple timeout
    public Mono<Data> getDataWithTimeout(String id) {
        return dataService.getData(id)
            .timeout(Duration.ofSeconds(5))
            .onErrorResume(TimeoutException.class, e -> {
                log.error("Request timeout after 5s");
                return Mono.empty();
            });
    }

    // Timeout with fallback
    public Mono<User> getUserWithTimeoutFallback(Long id) {
        return userService.getUser(id)
            .timeout(
                Duration.ofSeconds(2),
                cacheService.getUser(id)  // Fallback Mono
            );
    }

    // Different timeouts for different operations
    public Mono<OrderDetails> getOrderDetails(Long orderId) {
        Mono<Order> orderMono = orderService.getOrder(orderId)
            .timeout(Duration.ofSeconds(5));

        Mono<List<Item>> itemsMono = itemService.getItems(orderId)
            .timeout(Duration.ofSeconds(10));

        Mono<ShippingInfo> shippingMono = shippingService.getInfo(orderId)
            .timeout(Duration.ofSeconds(3));

        return Mono.zip(orderMono, itemsMono, shippingMono)
            .map(tuple -> new OrderDetails(
                tuple.getT1(),
                tuple.getT2(),
                tuple.getT3()
            ))
            .timeout(Duration.ofSeconds(15));  // Overall timeout
    }
}
```

## Rate Limiting

```java
@Configuration
public class RateLimiterConfig {

    @Bean
    public RateLimiterRegistry rateLimiterRegistry() {
        RateLimiterConfig config = RateLimiterConfig.custom()
            .limitForPeriod(100)  // 100 calls
            .limitRefreshPeriod(Duration.ofSeconds(1))  // per second
            .timeoutDuration(Duration.ofMillis(500))  // Wait max 500ms
            .build();

        return RateLimiterRegistry.of(config);
    }

    @Bean
    public RateLimiter apiRateLimiter(RateLimiterRegistry registry) {
        return registry.rateLimiter("external-api");
    }
}

@Service
public class RateLimitedService {

    @Autowired private RateLimiter apiRateLimiter;

    public Mono<ApiResponse> callExternalApi(Request request) {
        return Mono.fromCallable(() ->
            apiRateLimiter.executeCallable(() ->
                blockingApiCall(request)
            )
        )
        .subscribeOn(Schedulers.boundedElastic())
        .onErrorResume(RequestNotPermitted.class, e -> {
            log.warn("Rate limit exceeded");
            return Mono.error(new RateLimitException("Too many requests"));
        });
    }

    // Reactive rate limiter
    public Flux<Data> processWithRateLimit(Flux<Request> requests) {
        return requests
            .flatMap(request ->
                Mono.defer(() -> processRequest(request))
                    .transformDeferred(
                        RateLimiterOperator.of(apiRateLimiter)
                    )
                    .onErrorResume(RequestNotPermitted.class, e -> {
                        log.warn("Rate limited request: {}", request.getId());
                        return Mono.empty();  // Skip this request
                    })
            );
    }

    private ApiResponse blockingApiCall(Request request) {
        // Blocking API call
        return new ApiResponse();
    }

    private Mono<Data> processRequest(Request request) {
        return Mono.just(new Data());
    }
}
```

## Complete Production Example

```java
@Service
@Slf4j
public class ProductionOrderService {

    @Autowired private OrderRepository orderRepository;
    @Autowired private InventoryService inventoryService;
    @Autowired private PaymentGateway paymentGateway;
    @Autowired private CircuitBreaker paymentCircuitBreaker;
    @Autowired private RateLimiter inventoryRateLimiter;
    @Autowired private MetricsService metrics;

    public Mono<OrderResult> processOrder(Order order) {
        return Mono.just(order)
            // 1. Validate order
            .flatMap(this::validateOrder)
            .doOnError(ValidationException.class, e ->
                log.error("Validation failed: {}", e.getMessage())
            )

            // 2. Check inventory with rate limiting
            .flatMap(validOrder ->
                checkInventoryWithRateLimit(validOrder)
                    .timeout(Duration.ofSeconds(5))
                    .retryWhen(
                        Retry.backoff(3, Duration.ofSeconds(1))
                            .filter(e -> !(e instanceof OutOfStockException))
                    )
                    .onErrorResume(TimeoutException.class, e -> {
                        log.error("Inventory check timeout");
                        return Mono.error(new ServiceUnavailableException(
                            "Inventory service timeout"
                        ));
                    })
                    .zipWith(Mono.just(validOrder))
            )

            // 3. Process payment with circuit breaker
            .flatMap(tuple -> {
                InventoryReservation reservation = tuple.getT1();
                Order validOrder = tuple.getT2();

                return processPaymentWithCircuitBreaker(validOrder)
                    .timeout(Duration.ofSeconds(10))
                    .doOnError(e -> {
                        // Rollback inventory reservation
                        inventoryService.release(reservation)
                            .subscribe();
                    })
                    .zipWith(Mono.just(validOrder))
                    .zipWith(Mono.just(reservation));
            })

            // 4. Create order record
            .flatMap(tuple -> {
                Payment payment = tuple.getT1().getT1();
                Order validOrder = tuple.getT1().getT2();
                InventoryReservation reservation = tuple.getT2();

                validOrder.setPaymentId(payment.getId());
                validOrder.setStatus(OrderStatus.CONFIRMED);

                return orderRepository.save(validOrder)
                    .retryWhen(Retry.max(2))
                    .onErrorResume(e -> {
                        // Rollback payment and inventory
                        rollbackTransaction(payment, reservation);
                        return Mono.error(new OrderProcessingException(
                            "Failed to save order", e
                        ));
                    });
            })

            // 5. Build result
            .map(savedOrder -> new OrderResult(
                savedOrder.getId(),
                OrderStatus.CONFIRMED,
                "Order processed successfully"
            ))

            // 6. Error handling
            .onErrorResume(ValidationException.class, e ->
                Mono.just(OrderResult.validationError(e.getMessage()))
            )
            .onErrorResume(OutOfStockException.class, e ->
                Mono.just(OrderResult.outOfStock())
            )
            .onErrorResume(PaymentFailedException.class, e ->
                Mono.just(OrderResult.paymentFailed(e.getMessage()))
            )
            .onErrorResume(ServiceUnavailableException.class, e ->
                Mono.just(OrderResult.serviceUnavailable())
            )
            .onErrorResume(Exception.class, e -> {
                log.error("Unexpected error processing order", e);
                metrics.incrementUnexpectedErrors();
                return Mono.just(OrderResult.internalError());
            })

            // 7. Metrics
            .doOnSuccess(result -> {
                metrics.recordOrderProcessing(result.getStatus());
                log.info("Order processed: {}", result.getOrderId());
            })
            .doOnError(e ->
                log.error("Order processing failed", e)
            );
    }

    private Mono<Order> validateOrder(Order order) {
        if (order.getItems() == null || order.getItems().isEmpty()) {
            return Mono.error(new ValidationException("Order has no items"));
        }
        if (order.getTotal().compareTo(BigDecimal.ZERO) <= 0) {
            return Mono.error(new ValidationException("Invalid order total"));
        }
        return Mono.just(order);
    }

    private Mono<InventoryReservation> checkInventoryWithRateLimit(Order order) {
        return Mono.defer(() -> inventoryService.reserve(order.getItems()))
            .transformDeferred(RateLimiterOperator.of(inventoryRateLimiter))
            .onErrorMap(RequestNotPermitted.class, e ->
                new ServiceUnavailableException("Inventory service busy")
            );
    }

    private Mono<Payment> processPaymentWithCircuitBreaker(Order order) {
        return Mono.defer(() -> paymentGateway.process(order))
            .transformDeferred(CircuitBreakerOperator.of(paymentCircuitBreaker))
            .onErrorMap(CallNotPermittedException.class, e ->
                new ServiceUnavailableException("Payment service unavailable")
            );
    }

    private void rollbackTransaction(Payment payment, InventoryReservation reservation) {
        Mono.zip(
            paymentGateway.refund(payment).onErrorResume(e -> Mono.empty()),
            inventoryService.release(reservation).onErrorResume(e -> Mono.empty())
        ).subscribe(
            result -> log.info("Transaction rolled back"),
            error -> log.error("Rollback failed", error)
        );
    }
}
```

## Key Takeaways

- **Errors terminate streams** - Handle them appropriately
- **onErrorReturn()** - Simple fallback value
- **onErrorResume()** - Complex fallback logic or alternative sources
- **onErrorContinue()** - Skip errors, continue processing
- **Retry with backoff** - Handle transient failures
- **Circuit breaker** - Prevent cascading failures
- **Timeout** - Set clear time boundaries
- **Rate limiter** - Protect external services
- **Combine patterns** - Use retry + circuit breaker + timeout together
- **Always have fallbacks** - Graceful degradation is key

## What's Next

In Part 6, we'll dive deep into **Spring WebFlux** - building complete REST APIs, functional endpoints, WebSocket support, Server-Sent Events, and creating production-ready reactive microservices.

**Practice Exercise**: Build a resilient payment service that:
1. Implements retry with exponential backoff
2. Uses circuit breaker to prevent cascading failures
3. Has timeout protection
4. Provides fallback to alternative payment gateway
5. Handles all error scenarios gracefully
6. Includes comprehensive monitoring and metrics
