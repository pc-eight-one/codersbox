---
title: "Spring Boot Reactive Programming - Part 2: Operators and Transformations"
description: "Master advanced Reactor operators including merge, zip, concat, flatMap variants, reduce, collect, and build complex data transformation pipelines for real-world reactive applications."
publishDate: 2025-10-06
publishedAt: 2025-10-06
tags: ["Spring Boot", "Reactor", "Operators", "WebFlux", "Transformations"]
difficulty: "intermediate"
series: "Spring Boot Reactive Programming"
part: 2
estimatedTime: "75 minutes"
totalParts: 8
featured: true
---

# Spring Boot Reactive Programming - Part 2: Operators and Transformations

In Part 1, we learned the basics of Mono and Flux. Now we'll master advanced operators to build complex reactive pipelines for real-world applications.

## Combining Publishers

### zip() - Combine Multiple Publishers

`zip()` waits for **all** publishers and combines their results.

```java
@Service
public class UserEnrichmentService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProfileService profileService;

    @Autowired
    private SettingsService settingsService;

    // Combine user data from multiple sources
    public Mono<EnrichedUser> getEnrichedUser(Long userId) {
        Mono<User> userMono = userRepository.findById(userId);
        Mono<Profile> profileMono = profileService.getProfile(userId);
        Mono<Settings> settingsMono = settingsService.getSettings(userId);

        // zip waits for ALL to complete
        return Mono.zip(userMono, profileMono, settingsMono)
            .map(tuple -> new EnrichedUser(
                tuple.getT1(),  // User
                tuple.getT2(),  // Profile
                tuple.getT3()   // Settings
            ));
    }

    // Zip with custom combinator function
    public Mono<UserDashboard> getUserDashboard(Long userId) {
        return Mono.zip(
            userRepository.findById(userId),
            orderService.getRecentOrders(userId),
            notificationService.getUnreadCount(userId),
            (user, orders, unreadCount) ->
                new UserDashboard(user, orders, unreadCount)
        );
    }
}
```

**Timing Diagram:**
```java
// zip waits for the SLOWEST publisher
Mono<String> fast = Mono.delay(Duration.ofMillis(100))
    .then(Mono.just("Fast"));    // 100ms

Mono<String> slow = Mono.delay(Duration.ofMillis(500))
    .then(Mono.just("Slow"));    // 500ms

Mono.zip(fast, slow, (f, s) -> f + " + " + s)
    .subscribe(System.out::println);
// Takes 500ms (max of all), outputs: "Fast + Slow"
```

### zipWith() - Zip Two Publishers

```java
public class ZipWithExamples {

    // Simpler syntax for zipping two publishers
    public Mono<OrderWithUser> getOrderWithUser(Long orderId) {
        Mono<Order> orderMono = orderRepository.findById(orderId);

        return orderMono
            .flatMap(order ->
                userRepository.findById(order.getUserId())
                    .zipWith(Mono.just(order))
            )
            .map(tuple -> new OrderWithUser(tuple.getT2(), tuple.getT1()));
    }

    // Chain multiple zipWith
    public Mono<CompleteOrder> getCompleteOrder(Long orderId) {
        return orderRepository.findById(orderId)
            .zipWith(paymentService.getPayment(orderId))
            .zipWith(shippingService.getShipping(orderId))
            .map(tuple -> {
                Tuple2<Order, Payment> t1 = tuple.getT1();
                Shipping shipping = tuple.getT2();
                return new CompleteOrder(t1.getT1(), t1.getT2(), shipping);
            });
    }
}
```

### merge() - Merge Multiple Publishers (Interleaved)

`merge()` subscribes to **all** publishers immediately and emits items as they arrive.

```java
@Service
public class NotificationService {

    // Merge notifications from multiple sources
    public Flux<Notification> getAllNotifications(Long userId) {
        Flux<Notification> emailNotifications =
            emailService.getNotifications(userId);

        Flux<Notification> smsNotifications =
            smsService.getNotifications(userId);

        Flux<Notification> pushNotifications =
            pushService.getNotifications(userId);

        // merge emits items as soon as they arrive from ANY source
        return Flux.merge(
            emailNotifications,
            smsNotifications,
            pushNotifications
        ).sort(Comparator.comparing(Notification::getTimestamp));
    }

    // Real-world: Live data from multiple sensors
    public Flux<SensorReading> getAllSensorData() {
        return Flux.merge(
            temperatureSensor.readings(),
            humiditySensor.readings(),
            pressureSensor.readings()
        );
        // Readings arrive in real-time, interleaved
    }
}
```

**merge vs zip:**
```java
// zip waits for ALL, then emits combined result
Flux<String> zipped = Flux.zip(
    Flux.interval(Duration.ofMillis(100)).map(i -> "A" + i),
    Flux.interval(Duration.ofMillis(200)).map(i -> "B" + i)
).map(tuple -> tuple.getT1() + tuple.getT2());
// Output: A0B0, A1B1, A2B2 (synchronized)

// merge emits as soon as each item arrives
Flux<String> merged = Flux.merge(
    Flux.interval(Duration.ofMillis(100)).map(i -> "A" + i),
    Flux.interval(Duration.ofMillis(200)).map(i -> "B" + i)
);
// Output: A0, A1, B0, A2, A3, B1, A4... (interleaved)
```

### concat() - Concatenate Publishers (Sequential)

`concat()` subscribes to publishers **one at a time**, in order.

```java
@Service
public class DataMigrationService {

    // Process data sources sequentially
    public Flux<MigrationResult> migrateAllData() {
        Flux<MigrationResult> usersData = migrateUsers();
        Flux<MigrationResult> ordersData = migrateOrders();
        Flux<MigrationResult> paymentsData = migratePayments();

        // concat ensures sequential execution
        // ordersData starts ONLY after usersData completes
        return Flux.concat(usersData, ordersData, paymentsData);
    }

    // Real-world: Sequential API calls (maintain order)
    public Flux<Product> syncProducts() {
        // Fetch from primary source first
        Flux<Product> primaryProducts = primaryApi.getProducts();

        // Then fetch from backup source
        Flux<Product> backupProducts = backupApi.getProducts();

        return Flux.concat(primaryProducts, backupProducts)
            .distinct(Product::getId);  // Remove duplicates
    }
}
```

**Comparison:**
```java
Flux<Integer> flux1 = Flux.just(1, 2, 3).delayElements(Duration.ofMillis(100));
Flux<Integer> flux2 = Flux.just(4, 5, 6).delayElements(Duration.ofMillis(100));

// concat: 1, 2, 3, then 4, 5, 6 (sequential)
Flux.concat(flux1, flux2).subscribe(System.out::println);

// merge: 1, 4, 2, 5, 3, 6 (interleaved)
Flux.merge(flux1, flux2).subscribe(System.out::println);
```

## flatMap Variants

### flatMap() - Async transformation, unordered

```java
@Service
public class OrderProcessingService {

    // Process orders concurrently (order not preserved)
    public Flux<ProcessedOrder> processOrders(Flux<Order> orders) {
        return orders
            .flatMap(order ->
                // Each order processed asynchronously
                paymentService.processPayment(order)
                    .flatMap(payment ->
                        shippingService.createShipment(order, payment)
                    )
                    .map(shipment ->
                        new ProcessedOrder(order, shipment)
                    )
            );
        // Results arrive as soon as each order completes
        // NOT in original order!
    }

    // Limit concurrency
    public Flux<ProcessedOrder> processOrdersWithLimit(Flux<Order> orders) {
        return orders
            .flatMap(
                order -> processOrder(order),
                10  // Process max 10 orders concurrently
            );
    }
}
```

### flatMapSequential() - Async transformation, ordered

```java
@Service
public class ReportService {

    // Generate reports in order
    public Flux<Report> generateReports(Flux<Long> userIds) {
        return userIds
            .flatMapSequential(userId ->
                // Processes concurrently BUT outputs in original order
                generateUserReport(userId)
            );
    }

    private Mono<Report> generateUserReport(Long userId) {
        return userRepository.findById(userId)
            .flatMap(user ->
                orderRepository.findByUserId(userId)
                    .collectList()
                    .map(orders -> new Report(user, orders))
            );
    }
}
```

**flatMap vs flatMapSequential:**
```java
Flux<Integer> numbers = Flux.range(1, 5);

// flatMap: Results arrive as each completes (unordered)
numbers.flatMap(n ->
    Mono.delay(Duration.ofMillis(100 - n * 10))
        .then(Mono.just(n))
).subscribe(System.out::println);
// Output: 5, 4, 3, 2, 1 (fastest first)

// flatMapSequential: Results reordered to match input (ordered)
numbers.flatMapSequential(n ->
    Mono.delay(Duration.ofMillis(100 - n * 10))
        .then(Mono.just(n))
).subscribe(System.out::println);
// Output: 1, 2, 3, 4, 5 (original order)
```

### concatMap() - Sequential transformation

```java
@Service
public class SequentialProcessor {

    // Process one at a time (strictly sequential)
    public Flux<Result> processSequentially(Flux<Task> tasks) {
        return tasks
            .concatMap(task ->
                // Next task starts ONLY after current completes
                processTask(task)
            );
    }

    // Real-world: Database migrations
    public Flux<MigrationStep> runMigrations(List<Migration> migrations) {
        return Flux.fromIterable(migrations)
            .concatMap(migration ->
                // Each migration must complete before next starts
                executeMigration(migration)
                    .doOnSuccess(result ->
                        log.info("Migration {} complete", migration.getName())
                    )
            );
    }
}
```

**When to use which:**
```java
// flatMap: Fastest, unordered (e.g., fetching user profiles)
flux.flatMap(id -> userService.getUser(id))

// flatMapSequential: Fast + ordered (e.g., paginated results)
flux.flatMapSequential(page -> fetchPage(page))

// concatMap: Sequential, ordered (e.g., database migrations)
flux.concatMap(migration -> executeMigration(migration))
```

## Aggregation Operators

### reduce() - Aggregate to single value

```java
@Service
public class AnalyticsService {

    // Sum all order totals
    public Mono<BigDecimal> calculateTotalRevenue(Flux<Order> orders) {
        return orders
            .map(Order::getTotal)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    // Find maximum value
    public Mono<BigDecimal> findMaxOrder(Flux<Order> orders) {
        return orders
            .map(Order::getTotal)
            .reduce(BigDecimal::max);
    }

    // Complex reduction
    public Mono<OrderStatistics> calculateStatistics(Flux<Order> orders) {
        return orders
            .reduce(
                new OrderStatistics(),  // Initial value
                (stats, order) -> {
                    stats.incrementCount();
                    stats.addTotal(order.getTotal());
                    stats.updateMax(order.getTotal());
                    stats.updateMin(order.getTotal());
                    return stats;
                }
            );
    }
}
```

### collect() - Collect to collection

```java
@Service
public class CollectionService {

    // Collect to List
    public Mono<List<User>> getAllUsersAsList() {
        return userRepository.findAll()
            .collectList();
    }

    // Collect to Set
    public Mono<Set<String>> getUniqueCategories() {
        return productRepository.findAll()
            .map(Product::getCategory)
            .collect(Collectors.toSet());
    }

    // Collect to Map
    public Mono<Map<Long, User>> getUsersAsMap() {
        return userRepository.findAll()
            .collectMap(User::getId);
    }

    // Collect to Map with custom key/value
    public Mono<Map<String, List<Product>>> groupByCategory() {
        return productRepository.findAll()
            .collect(Collectors.groupingBy(Product::getCategory));
    }

    // Collect with custom collector
    public Mono<String> getAllUserNames() {
        return userRepository.findAll()
            .map(User::getName)
            .collect(Collectors.joining(", "));
    }
}
```

### count() - Count elements

```java
public class CountExamples {

    public Mono<Long> countActiveUsers() {
        return userRepository.findAll()
            .filter(User::isActive)
            .count();
    }

    public Mono<Boolean> hasAnyActiveUsers() {
        return userRepository.findAll()
            .filter(User::isActive)
            .hasElements();  // Returns Mono<Boolean>
    }
}
```

## Filtering Operators

### take() - Take first N elements

```java
@Service
public class LimitingService {

    // Get first 10 products
    public Flux<Product> getTopProducts() {
        return productRepository.findAll()
            .sort(Comparator.comparing(Product::getRating).reversed())
            .take(10);
    }

    // Take until condition
    public Flux<SensorReading> readUntilThreshold() {
        return sensorService.readings()
            .takeUntil(reading -> reading.getValue() > 100);
    }

    // Take while condition is true
    public Flux<Stock> monitorStockPrice() {
        return stockService.prices()
            .takeWhile(price -> price.getValue() < 1000);
    }

    // Take for duration
    public Flux<Event> eventsForNextMinute() {
        return eventStream.events()
            .take(Duration.ofMinutes(1));
    }
}
```

### skip() - Skip first N elements

```java
public class PaginationService {

    // Implement pagination
    public Flux<Product> getProductPage(int page, int size) {
        return productRepository.findAll()
            .skip((long) page * size)
            .take(size);
    }

    // Skip until condition
    public Flux<LogEntry> getLogsAfterError() {
        return logRepository.findAll()
            .skipUntil(log -> log.getLevel() == Level.ERROR);
    }

    // Skip while condition is true
    public Flux<Reading> skipWarmup() {
        return sensorService.readings()
            .skipWhile(reading -> reading.getTimestamp()
                .isBefore(warmupEndTime));
    }
}
```

### distinct() - Remove duplicates

```java
@Service
public class DeduplicationService {

    // Get unique categories
    public Flux<String> getUniqueCategories() {
        return productRepository.findAll()
            .map(Product::getCategory)
            .distinct();
    }

    // Distinct by key
    public Flux<Product> getUniqueProductsByName() {
        return productRepository.findAll()
            .distinct(Product::getName);
    }

    // Distinct until changed (consecutive duplicates)
    public Flux<SensorReading> filterConsecutiveDuplicates() {
        return sensorService.readings()
            .distinctUntilChanged(SensorReading::getValue);
    }
}
```

## Timing Operators

### delay() - Delay elements

```java
@Service
public class TimingService {

    // Delay entire stream
    public Flux<Notification> sendDelayedNotifications(
            Flux<Notification> notifications) {
        return notifications
            .delaySubscription(Duration.ofSeconds(5));  // Wait 5s before starting
    }

    // Delay each element
    public Flux<Event> rateLimit(Flux<Event> events) {
        return events
            .delayElements(Duration.ofMillis(100));  // 100ms between items
    }

    // Conditional delay
    public Flux<Order> processWithDelay(Flux<Order> orders) {
        return orders
            .flatMap(order -> {
                if (order.isPriority()) {
                    return Mono.just(order);  // No delay
                } else {
                    return Mono.just(order)
                        .delayElement(Duration.ofSeconds(1));
                }
            });
    }
}
```

### timeout() - Set timeout

```java
@Service
public class TimeoutService {

    // Timeout entire operation
    public Mono<User> getUserWithTimeout(Long id) {
        return userRepository.findById(id)
            .timeout(Duration.ofSeconds(5))
            .onErrorResume(TimeoutException.class, e ->
                Mono.error(new ServiceException("User fetch timeout"))
            );
    }

    // Timeout with fallback
    public Mono<Product> getProductWithFallback(Long id) {
        return productService.fetchFromPrimary(id)
            .timeout(Duration.ofSeconds(2),
                productService.fetchFromCache(id)  // Fallback
            );
    }
}
```

### buffer() - Collect into batches

```java
@Service
public class BatchProcessor {

    // Buffer by count
    public Flux<List<Event>> bufferEvents(Flux<Event> events) {
        return events
            .buffer(100);  // Batch of 100 events
    }

    // Buffer by time
    public Flux<List<LogEntry>> bufferLogs(Flux<LogEntry> logs) {
        return logs
            .buffer(Duration.ofSeconds(5));  // Batch every 5 seconds
    }

    // Buffer by count AND time (whichever comes first)
    public Flux<List<Order>> bufferOrders(Flux<Order> orders) {
        return orders
            .bufferTimeout(50, Duration.ofSeconds(10));
    }

    // Real-world: Batch database inserts
    public Mono<Void> batchInsertUsers(Flux<User> users) {
        return users
            .buffer(1000)  // Insert 1000 at a time
            .flatMap(batch -> userRepository.saveAll(batch))
            .then();
    }
}
```

### window() - Split into windows

```java
@Service
public class WindowProcessor {

    // Window by count
    public Flux<Flux<Event>> windowEvents(Flux<Event> events) {
        return events
            .window(100);  // Window of 100 events
    }

    // Window by time
    public Flux<Flux<Reading>> windowReadings(Flux<Reading> readings) {
        return readings
            .window(Duration.ofMinutes(1));
    }

    // Process each window
    public Flux<Statistics> calculateWindowStatistics(
            Flux<SensorReading> readings) {
        return readings
            .window(Duration.ofMinutes(5))
            .flatMap(window ->
                window.collectList()
                    .map(this::calculateStatistics)
            );
    }
}
```

## Real-World Example: E-Commerce Order Processing

```java
@Service
@Slf4j
public class OrderProcessingPipeline {

    @Autowired private OrderRepository orderRepository;
    @Autowired private InventoryService inventoryService;
    @Autowired private PaymentService paymentService;
    @Autowired private ShippingService shippingService;
    @Autowired private NotificationService notificationService;

    public Flux<OrderResult> processOrders(Flux<Order> orders) {
        return orders
            // 1. Validate orders
            .filter(this::validateOrder)
            .doOnNext(order -> log.info("Processing order: {}", order.getId()))

            // 2. Check inventory for each item (concurrent)
            .flatMap(order ->
                checkInventory(order)
                    .zipWith(Mono.just(order))
            )
            .filter(tuple -> tuple.getT1())  // Filter out insufficient inventory
            .map(Tuple2::getT2)

            // 3. Reserve inventory
            .flatMap(order ->
                inventoryService.reserve(order.getItems())
                    .zipWith(Mono.just(order))
            )
            .map(Tuple2::getT2)

            // 4. Process payment (with retry)
            .flatMap(order ->
                paymentService.processPayment(order)
                    .retryWhen(Retry.backoff(3, Duration.ofSeconds(1)))
                    .zipWith(Mono.just(order))
            )

            // 5. Create shipment
            .flatMap(tuple -> {
                Payment payment = tuple.getT1();
                Order order = tuple.getT2();
                return shippingService.createShipment(order)
                    .map(shipment -> new OrderResult(order, payment, shipment));
            })

            // 6. Send notifications (fire and forget)
            .doOnNext(result ->
                notificationService.sendOrderConfirmation(result)
                    .subscribe()
            )

            // 7. Error handling
            .onErrorResume(PaymentException.class, e -> {
                log.error("Payment failed: {}", e.getMessage());
                return Mono.empty();
            })
            .doOnError(e -> log.error("Order processing error", e))

            // 8. Metrics
            .doOnComplete(() -> log.info("Order batch completed"));
    }

    private boolean validateOrder(Order order) {
        return order.getItems() != null &&
               !order.getItems().isEmpty() &&
               order.getTotal().compareTo(BigDecimal.ZERO) > 0;
    }

    private Mono<Boolean> checkInventory(Order order) {
        return Flux.fromIterable(order.getItems())
            .flatMap(item ->
                inventoryService.checkAvailability(
                    item.getProductId(),
                    item.getQuantity()
                )
            )
            .all(available -> available);  // All items must be available
    }
}
```

## Performance Optimization Tips

```java
@Service
public class OptimizationExamples {

    // ❌ BAD: Sequential execution
    public Mono<Dashboard> getDashboardSlow(Long userId) {
        return userRepository.findById(userId)
            .flatMap(user ->
                orderService.getOrders(userId)  // Waits for this
                    .collectList()
                    .flatMap(orders ->
                        notificationService.getCount(userId)  // Then this
                            .map(count ->
                                new Dashboard(user, orders, count)
                            )
                    )
            );
        // Total: ~300ms (100 + 100 + 100)
    }

    // ✅ GOOD: Parallel execution
    public Mono<Dashboard> getDashboardFast(Long userId) {
        Mono<User> userMono = userRepository.findById(userId);
        Mono<List<Order>> ordersMono = orderService.getOrders(userId)
            .collectList();
        Mono<Long> countMono = notificationService.getCount(userId);

        return Mono.zip(userMono, ordersMono, countMono)
            .map(tuple -> new Dashboard(
                tuple.getT1(),
                tuple.getT2(),
                tuple.getT3()
            ));
        // Total: ~100ms (max of all)
    }

    // ❌ BAD: Blocking in reactive chain
    public Flux<Product> getProductsBad() {
        return productRepository.findAll()
            .map(product -> {
                // NEVER block in reactive chain!
                String enriched = blockingExternalApi.enrich(product);
                product.setEnrichedData(enriched);
                return product;
            });
    }

    // ✅ GOOD: Use reactive API
    public Flux<Product> getProductsGood() {
        return productRepository.findAll()
            .flatMap(product ->
                reactiveExternalApi.enrich(product)
                    .map(enriched -> {
                        product.setEnrichedData(enriched);
                        return product;
                    })
            );
    }

    // ✅ GOOD: If you must block, use subscribeOn
    public Flux<Product> getProductsWithBlocking() {
        return productRepository.findAll()
            .flatMap(product ->
                Mono.fromCallable(() -> {
                    // Blocking call on bounded elastic scheduler
                    return blockingExternalApi.enrich(product);
                })
                .subscribeOn(Schedulers.boundedElastic())
                .map(enriched -> {
                    product.setEnrichedData(enriched);
                    return product;
                })
            );
    }
}
```

## Key Takeaways

- **zip()** combines multiple publishers, waits for all
- **merge()** interleaves multiple publishers as they emit
- **concat()** subscribes to publishers sequentially
- **flatMap()** for async transformation (unordered, fastest)
- **flatMapSequential()** for async transformation (ordered)
- **concatMap()** for sequential transformation (strictly ordered)
- **reduce()** and **collect()** for aggregations
- **buffer()** and **window()** for batching
- **Use zip/merge for parallel execution** to improve performance
- **Never block in reactive chains** - use subscribeOn if necessary

## What's Next

In Part 3, we'll explore **Schedulers and Threading** - understanding how to control execution context, thread pools, and optimize performance with proper scheduler selection.

**Practice Exercise**: Build an order processing pipeline that:
1. Validates orders in parallel
2. Checks inventory concurrently
3. Processes payments with retry logic
4. Creates shipments
5. Sends notifications
6. Implements proper error handling at each step
