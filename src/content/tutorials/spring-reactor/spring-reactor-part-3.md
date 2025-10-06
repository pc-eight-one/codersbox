---
title: "Spring Boot Reactive Programming - Part 3: Schedulers and Threading"
description: "Master Reactor schedulers and threading model. Learn publishOn vs subscribeOn, handle blocking code properly, optimize thread pools, and avoid common threading pitfalls in reactive applications."
publishDate: 2025-10-06
publishedAt: 2025-10-06
tags: ["Spring Boot", "Reactor", "Schedulers", "Threading", "Performance", "WebFlux"]
difficulty: "advanced"
series: "Spring Boot Reactive Programming"
part: 3
estimatedTime: "80 minutes"
totalParts: 8
---

# Spring Boot Reactive Programming - Part 3: Schedulers and Threading

Understanding schedulers and threading is critical for building performant reactive applications. In this part, we'll master how Reactor manages threads and how to control execution context.

## The Reactive Threading Model

### Traditional vs Reactive Threading

```java
// Traditional blocking model
@RestController
public class BlockingController {

    @GetMapping("/user/{id}")
    public User getUser(@PathVariable Long id) {
        // Tomcat thread pool (default: 200 threads)
        // This thread is BLOCKED for entire duration

        User user = userService.findById(id);        // 50ms - thread blocked
        Profile profile = profileService.get(id);     // 100ms - thread blocked
        Settings settings = settingsService.get(id);  // 30ms - thread blocked

        // Thread blocked for 180ms total
        // Can handle ~1,111 requests/second with 200 threads
        return enrichUser(user, profile, settings);
    }
}

// Reactive non-blocking model
@RestController
public class ReactiveController {

    @GetMapping("/user/{id}")
    public Mono<User> getUser(@PathVariable Long id) {
        // Event loop threads (default: CPU cores, e.g., 8 threads)
        // Thread is NEVER blocked

        Mono<User> userMono = userService.findById(id);
        Mono<Profile> profileMono = profileService.get(id);
        Mono<Settings> settingsMono = settingsService.get(id);

        return Mono.zip(userMono, profileMono, settingsMono)
            .map(tuple -> enrichUser(tuple.getT1(), tuple.getT2(), tuple.getT3()));

        // Thread freed immediately
        // Max execution time: ~100ms (longest operation)
        // Can handle ~80,000 requests/second with 8 threads!
    }
}
```

**Key Difference:**
- **Blocking**: Thread waits for I/O → Limited by thread pool size
- **Reactive**: Thread never waits → Limited by CPU/network bandwidth

## Reactor Schedulers

Schedulers control **where** and **when** operators execute.

### Built-in Scheduler Types

```java
@Configuration
public class SchedulerExamples {

    public void demonstrateSchedulers() {

        // 1. Schedulers.immediate() - No scheduling, executes on current thread
        Flux.range(1, 3)
            .publishOn(Schedulers.immediate())
            .subscribe(i -> log.info("Value: {}, Thread: {}",
                i, Thread.currentThread().getName()));
        // Output: All on main thread

        // 2. Schedulers.single() - Single reusable thread
        // Good for: Low-frequency tasks, timer tasks
        Flux.range(1, 3)
            .publishOn(Schedulers.single())
            .subscribe(i -> log.info("Value: {}, Thread: {}",
                i, Thread.currentThread().getName()));
        // Output: All on "single-1" thread

        // 3. Schedulers.parallel() - Fixed pool of workers (CPU cores)
        // Good for: CPU-intensive tasks
        // Pool size: Runtime.getRuntime().availableProcessors()
        Flux.range(1, 10)
            .publishOn(Schedulers.parallel())
            .map(this::cpuIntensiveOperation)
            .subscribe(result -> log.info("Result: {}, Thread: {}",
                result, Thread.currentThread().getName()));
        // Output: Distributed across "parallel-1", "parallel-2", etc.

        // 4. Schedulers.boundedElastic() - Elastic thread pool with limit
        // Good for: Blocking I/O (database, file I/O, legacy APIs)
        // Pool size: 10 * CPU cores (bounded, prevents thread explosion)
        // TTL: 60 seconds (threads die if idle)
        Flux.range(1, 10)
            .publishOn(Schedulers.boundedElastic())
            .map(this::blockingDatabaseCall)
            .subscribe(result -> log.info("Result: {}, Thread: {}",
                result, Thread.currentThread().getName()));
        // Output: Distributed across "boundedElastic-1", "boundedElastic-2", etc.
    }

    private int cpuIntensiveOperation(int i) {
        // Simulate CPU work
        return IntStream.range(0, 1000000).sum() + i;
    }

    private String blockingDatabaseCall(int i) {
        // Simulate blocking I/O
        try {
            Thread.sleep(100);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        return "Result-" + i;
    }
}
```

### Scheduler Comparison Table

| Scheduler | Pool Size | Use Case | Example |
|-----------|-----------|----------|---------|
| `immediate()` | 0 (current thread) | Testing, debugging | N/A |
| `single()` | 1 thread | Single background task | Scheduled cleanup |
| `parallel()` | CPU cores | CPU-bound work | Image processing |
| `boundedElastic()` | 10 × CPU cores | Blocking I/O | JDBC calls, file I/O |

## publishOn() vs subscribeOn()

The most important concept in Reactor threading!

### publishOn() - Changes downstream execution

```java
public class PublishOnExample {

    public void demonstratePublishOn() {
        Flux.range(1, 5)
            .doOnNext(i -> log.info("1. Source: {}, Thread: {}",
                i, Thread.currentThread().getName()))

            .publishOn(Schedulers.parallel())  // ← Switch happens HERE

            .map(i -> {
                log.info("2. Map: {}, Thread: {}",
                    i, Thread.currentThread().getName());
                return i * 2;
            })
            .filter(i -> {
                log.info("3. Filter: {}, Thread: {}",
                    i, Thread.currentThread().getName());
                return i % 4 == 0;
            })
            .subscribe(i -> log.info("4. Subscribe: {}, Thread: {}",
                i, Thread.currentThread().getName()));

        /* Output:
         * 1. Source: 1, Thread: main
         * 1. Source: 2, Thread: main
         * 1. Source: 3, Thread: main
         * 1. Source: 4, Thread: main
         * 1. Source: 5, Thread: main
         * 2. Map: 1, Thread: parallel-1        ← Changed here
         * 3. Filter: 2, Thread: parallel-1
         * 2. Map: 2, Thread: parallel-1
         * 3. Filter: 4, Thread: parallel-1
         * 4. Subscribe: 4, Thread: parallel-1   ← All downstream uses parallel-1
         * ...
         */
    }
}
```

### subscribeOn() - Changes upstream execution

```java
public class SubscribeOnExample {

    public void demonstrateSubscribeOn() {
        Flux.range(1, 5)
            .doOnNext(i -> log.info("1. Source: {}, Thread: {}",
                i, Thread.currentThread().getName()))
            .map(i -> {
                log.info("2. Map: {}, Thread: {}",
                    i, Thread.currentThread().getName());
                return i * 2;
            })

            .subscribeOn(Schedulers.parallel())  // ← Affects entire chain

            .filter(i -> {
                log.info("3. Filter: {}, Thread: {}",
                    i, Thread.currentThread().getName());
                return i % 4 == 0;
            })
            .subscribe(i -> log.info("4. Subscribe: {}, Thread: {}",
                i, Thread.currentThread().getName()));

        /* Output:
         * 1. Source: 1, Thread: parallel-1     ← Everything on parallel-1
         * 2. Map: 1, Thread: parallel-1
         * 3. Filter: 2, Thread: parallel-1
         * 1. Source: 2, Thread: parallel-1
         * 2. Map: 2, Thread: parallel-1
         * 3. Filter: 4, Thread: parallel-1
         * 4. Subscribe: 4, Thread: parallel-1
         * ...
         */
    }
}
```

### Multiple publishOn/subscribeOn

```java
public class MultipleSchedulers {

    public void demonstrateMultiple() {
        Flux.range(1, 3)
            .doOnNext(i -> log.info("1. Source: Thread: {}",
                Thread.currentThread().getName()))

            .subscribeOn(Schedulers.single())  // Affects upstream (source)

            .map(i -> {
                log.info("2. Map1: Thread: {}",
                    Thread.currentThread().getName());
                return i * 2;
            })

            .publishOn(Schedulers.parallel())  // Changes downstream

            .map(i -> {
                log.info("3. Map2: Thread: {}",
                    Thread.currentThread().getName());
                return i + 1;
            })

            .publishOn(Schedulers.boundedElastic())  // Changes downstream again

            .subscribe(i -> log.info("4. Subscribe: {}, Thread: {}",
                i, Thread.currentThread().getName()));

        /* Output:
         * 1. Source: Thread: single-1
         * 2. Map1: Thread: single-1            ← subscribeOn affects this
         * 3. Map2: Thread: parallel-1          ← First publishOn
         * 4. Subscribe: 3, Thread: boundedElastic-1  ← Second publishOn
         */
    }
}
```

**Rule of Thumb:**
- **publishOn**: "Everything AFTER this runs on X scheduler"
- **subscribeOn**: "Everything runs on X scheduler (unless publishOn overrides)"

## Handling Blocking Code

### ❌ WRONG: Blocking on Event Loop

```java
@Service
public class BadBlockingExample {

    @Autowired
    private JdbcTemplate jdbcTemplate;  // Traditional blocking JDBC

    // ❌ NEVER DO THIS!
    public Mono<User> getUserBad(Long id) {
        return Mono.fromCallable(() -> {
            // This BLOCKS the event loop thread!
            // Disaster for performance
            return jdbcTemplate.queryForObject(
                "SELECT * FROM users WHERE id = ?",
                new Object[]{id},
                new BeanPropertyRowMapper<>(User.class)
            );
        });
        // Thread blocked waiting for database
        // Entire application slows down
    }
}
```

### ✅ CORRECT: Use boundedElastic Scheduler

```java
@Service
public class GoodBlockingExample {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    // ✅ CORRECT: Blocking code on boundedElastic
    public Mono<User> getUserGood(Long id) {
        return Mono.fromCallable(() -> {
            // Blocking JDBC call
            return jdbcTemplate.queryForObject(
                "SELECT * FROM users WHERE id = ?",
                new Object[]{id},
                new BeanPropertyRowMapper<>(User.class)
            );
        })
        .subscribeOn(Schedulers.boundedElastic());  // Run on elastic thread pool
        // Event loop threads remain free
    }

    // Real-world: Calling legacy blocking API
    public Mono<ExternalData> callLegacyApi(String id) {
        return Mono.fromCallable(() -> {
            // Blocking HTTP call
            RestTemplate restTemplate = new RestTemplate();
            return restTemplate.getForObject(
                "https://legacy-api.com/data/" + id,
                ExternalData.class
            );
        })
        .subscribeOn(Schedulers.boundedElastic())
        .timeout(Duration.ofSeconds(5))
        .retry(2);
    }

    // File I/O (blocking)
    public Mono<String> readFile(String path) {
        return Mono.fromCallable(() -> {
            // Blocking file read
            return Files.readString(Path.of(path));
        })
        .subscribeOn(Schedulers.boundedElastic());
    }
}
```

### When to Use Which Scheduler

```java
@Service
public class SchedulerSelectionGuide {

    // Use parallel() for CPU-intensive work
    public Flux<ProcessedImage> processImages(Flux<Image> images) {
        return images
            .publishOn(Schedulers.parallel())
            .map(this::cpuIntensiveImageProcessing);
    }

    // Use boundedElastic() for blocking I/O
    public Flux<User> getUsersFromLegacyDb(List<Long> ids) {
        return Flux.fromIterable(ids)
            .flatMap(id ->
                Mono.fromCallable(() -> jdbcTemplate.query(/* blocking */))
                    .subscribeOn(Schedulers.boundedElastic())
            );
    }

    // Use single() for periodic tasks
    public Flux<Void> scheduledCleanup() {
        return Flux.interval(Duration.ofHours(1), Schedulers.single())
            .flatMap(tick -> performCleanup());
    }

    // Default (no scheduler) for reactive I/O
    public Flux<Product> getProductsReactive() {
        // R2DBC is already non-blocking
        // No need for publishOn/subscribeOn
        return productRepository.findAll();
    }
}
```

## Custom Schedulers

```java
@Configuration
public class CustomSchedulerConfig {

    // Custom scheduler for specific workload
    @Bean
    public Scheduler customDatabaseScheduler() {
        return Schedulers.newBoundedElastic(
            20,                          // Max threads
            Integer.MAX_VALUE,           // Queue size (unbounded)
            "db-pool",                   // Thread name prefix
            60,                          // TTL seconds
            true                         // Daemon threads
        );
    }

    // Custom parallel scheduler
    @Bean
    public Scheduler customParallelScheduler() {
        int cores = Runtime.getRuntime().availableProcessors();
        return Schedulers.newParallel(
            "custom-parallel",
            cores * 2,                   // 2x CPU cores
            true                         // Daemon threads
        );
    }
}

@Service
public class CustomSchedulerUsage {

    @Autowired
    @Qualifier("customDatabaseScheduler")
    private Scheduler databaseScheduler;

    public Mono<User> getUserFromLegacyDb(Long id) {
        return Mono.fromCallable(() -> {
            // Blocking JDBC call
            return jdbcTemplate.queryForObject(/* ... */);
        })
        .subscribeOn(databaseScheduler);  // Use custom scheduler
    }
}
```

## Thread Pool Tuning

```java
@Configuration
public class SchedulerTuning {

    @PostConstruct
    public void configureSchedulers() {

        // Tune boundedElastic
        System.setProperty(
            "reactor.schedulers.defaultBoundedElasticSize",
            String.valueOf(Runtime.getRuntime().availableProcessors() * 10)
        );

        System.setProperty(
            "reactor.schedulers.defaultBoundedElasticQueuedTaskCap",
            "100000"
        );

        // Tune parallel
        System.setProperty(
            "reactor.schedulers.defaultPoolSize",
            String.valueOf(Runtime.getRuntime().availableProcessors())
        );
    }

    // Production-tuned scheduler
    @Bean
    public Scheduler productionScheduler() {
        int cores = Runtime.getRuntime().availableProcessors();

        return Schedulers.newBoundedElastic(
            cores * 10,                  // 10 threads per core
            100_000,                     // Large queue for bursts
            "production-elastic",
            60,                          // 60s TTL
            true
        );
    }
}
```

## Real-World Example: Order Processing

```java
@Service
@Slf4j
public class OrderProcessingService {

    @Autowired private OrderRepository orderRepository;       // R2DBC (reactive)
    @Autowired private LegacyInventoryService inventoryService; // JDBC (blocking)
    @Autowired private PaymentService paymentService;         // WebClient (reactive)
    @Autowired private EmailService emailService;             // Blocking SMTP

    public Mono<ProcessedOrder> processOrder(Order order) {
        return Mono.just(order)
            // 1. Save order (R2DBC - already non-blocking)
            .flatMap(orderRepository::save)
            .doOnNext(o -> log.info("Order saved on: {}",
                Thread.currentThread().getName()))

            // 2. Check inventory (Legacy JDBC - blocking!)
            .flatMap(savedOrder ->
                checkInventory(savedOrder)
                    .subscribeOn(Schedulers.boundedElastic())  // ← Run on elastic
                    .zipWith(Mono.just(savedOrder))
            )
            .doOnNext(tuple -> log.info("Inventory checked on: {}",
                Thread.currentThread().getName()))

            // 3. Process payment (WebClient - reactive)
            .flatMap(tuple -> {
                InventoryStatus inventory = tuple.getT1();
                Order savedOrder = tuple.getT2();

                if (!inventory.isAvailable()) {
                    return Mono.error(new OutOfStockException());
                }

                return paymentService.processPayment(savedOrder)
                    .zipWith(Mono.just(savedOrder));
            })
            .doOnNext(tuple -> log.info("Payment processed on: {}",
                Thread.currentThread().getName()))

            // 4. Send confirmation email (Blocking SMTP)
            .flatMap(tuple -> {
                Payment payment = tuple.getT1();
                Order savedOrder = tuple.getT2();

                return sendConfirmationEmail(savedOrder)
                    .subscribeOn(Schedulers.boundedElastic())  // ← Run on elastic
                    .then(Mono.just(new ProcessedOrder(savedOrder, payment)));
            })
            .doOnNext(result -> log.info("Email sent on: {}",
                Thread.currentThread().getName()));
    }

    private Mono<InventoryStatus> checkInventory(Order order) {
        return Mono.fromCallable(() -> {
            // Blocking JDBC call
            log.info("Checking inventory on: {}",
                Thread.currentThread().getName());
            return inventoryService.checkAvailability(order.getItems());
        });
    }

    private Mono<Void> sendConfirmationEmail(Order order) {
        return Mono.fromRunnable(() -> {
            // Blocking SMTP
            log.info("Sending email on: {}",
                Thread.currentThread().getName());
            emailService.sendOrderConfirmation(order);
        });
    }
}

/* Example output:
 * Order saved on: reactor-http-nio-2
 * Checking inventory on: boundedElastic-1      ← Blocking I/O
 * Inventory checked on: boundedElastic-1
 * Payment processed on: reactor-http-nio-3     ← Reactive
 * Sending email on: boundedElastic-2           ← Blocking I/O
 * Email sent on: boundedElastic-2
 */
```

## Performance Benchmarks

```java
@Component
public class SchedulerBenchmark {

    @EventListener(ApplicationReadyEvent.class)
    public void runBenchmark() {
        int requests = 10_000;

        // Benchmark 1: No scheduler (event loop)
        long start1 = System.currentTimeMillis();
        Flux.range(1, requests)
            .flatMap(i -> Mono.just(i).map(this::lightComputation))
            .blockLast();
        long time1 = System.currentTimeMillis() - start1;
        log.info("No scheduler: {}ms", time1);

        // Benchmark 2: publishOn(parallel())
        long start2 = System.currentTimeMillis();
        Flux.range(1, requests)
            .publishOn(Schedulers.parallel())
            .map(this::lightComputation)
            .blockLast();
        long time2 = System.currentTimeMillis() - start2;
        log.info("publishOn(parallel): {}ms", time2);

        // Benchmark 3: flatMap with subscribeOn
        long start3 = System.currentTimeMillis();
        Flux.range(1, requests)
            .flatMap(i ->
                Mono.fromCallable(() -> lightComputation(i))
                    .subscribeOn(Schedulers.parallel())
            )
            .blockLast();
        long time3 = System.currentTimeMillis() - start3;
        log.info("flatMap + subscribeOn: {}ms", time3);

        /* Typical results (10,000 operations):
         * No scheduler: 50ms              ← Fastest for light work
         * publishOn(parallel): 150ms      ← Overhead from context switching
         * flatMap + subscribeOn: 200ms    ← Even more overhead
         *
         * Conclusion: Only use schedulers when necessary!
         */
    }

    private int lightComputation(int i) {
        return i * 2;
    }
}
```

## Common Threading Pitfalls

### Pitfall 1: Blocking on Event Loop

```java
// ❌ WRONG
public Mono<User> getUserWrong(Long id) {
    return Mono.just(id)
        .map(userId -> {
            // BLOCKS event loop thread!
            return jdbcTemplate.queryForObject(/* ... */);
        });
}

// ✅ CORRECT
public Mono<User> getUserCorrect(Long id) {
    return Mono.fromCallable(() ->
        jdbcTemplate.queryForObject(/* ... */)
    )
    .subscribeOn(Schedulers.boundedElastic());
}
```

### Pitfall 2: Unnecessary Scheduler Changes

```java
// ❌ WRONG: Unnecessary publishOn
public Flux<Product> getProductsWrong() {
    return productRepository.findAll()  // Already non-blocking
        .publishOn(Schedulers.parallel())  // Pointless!
        .map(Product::getName);
}

// ✅ CORRECT: No scheduler needed
public Flux<Product> getProductsCorrect() {
    return productRepository.findAll()
        .map(Product::getName);
}
```

### Pitfall 3: Wrong Scheduler for Blocking I/O

```java
// ❌ WRONG: parallel() for blocking I/O
public Flux<User> getUsersWrong(List<Long> ids) {
    return Flux.fromIterable(ids)
        .publishOn(Schedulers.parallel())  // Wrong scheduler!
        .map(id -> jdbcTemplate.query(/* blocking */));
    // Blocks parallel pool (meant for CPU work)
}

// ✅ CORRECT: boundedElastic() for blocking I/O
public Flux<User> getUsersCorrect(List<Long> ids) {
    return Flux.fromIterable(ids)
        .flatMap(id ->
            Mono.fromCallable(() -> jdbcTemplate.query(/* blocking */))
                .subscribeOn(Schedulers.boundedElastic())
        );
}
```

### Pitfall 4: Thread Context Loss

```java
@Service
public class ThreadContextExample {

    // ❌ WRONG: ThreadLocal lost on scheduler change
    public Mono<User> getUserWithContextWrong(Long id) {
        SecurityContext context = SecurityContextHolder.getContext();

        return userRepository.findById(id)
            .publishOn(Schedulers.parallel())
            .map(user -> {
                // SecurityContext is LOST here!
                SecurityContextHolder.getContext();  // Returns empty
                return user;
            });
    }

    // ✅ CORRECT: Use Reactor Context
    public Mono<User> getUserWithContextCorrect(Long id) {
        return userRepository.findById(id)
            .publishOn(Schedulers.parallel())
            .contextWrite(Context.of("securityContext",
                SecurityContextHolder.getContext()))
            .map(user -> {
                // Access from Reactor Context
                return user;
            });
    }
}
```

## Monitoring Thread Pools

```java
@Component
@Slf4j
public class SchedulerMonitoring {

    @Scheduled(fixedRate = 60000)  // Every minute
    public void monitorSchedulers() {
        // Monitor boundedElastic
        Metrics.gauge("reactor.scheduler.boundedElastic.active",
            Schedulers.boundedElastic());

        // Monitor parallel
        Metrics.gauge("reactor.scheduler.parallel.active",
            Schedulers.parallel());

        // Log thread pool sizes
        ThreadPoolExecutor executor = (ThreadPoolExecutor)
            ((ExecutorScheduler) Schedulers.boundedElastic()).executor;

        log.info("BoundedElastic - Active: {}, Pool Size: {}, Queue: {}",
            executor.getActiveCount(),
            executor.getPoolSize(),
            executor.getQueue().size());
    }
}
```

## Key Takeaways

- **publishOn()** changes downstream execution context
- **subscribeOn()** changes entire chain execution context
- Use **Schedulers.parallel()** for CPU-intensive work
- Use **Schedulers.boundedElastic()** for blocking I/O
- **Never block on event loop threads** - use boundedElastic
- **Avoid unnecessary scheduler changes** - they have overhead
- R2DBC/WebClient are **already non-blocking** - don't add schedulers
- **Monitor thread pools** in production
- Use **custom schedulers** for specific workloads

## What's Next

In Part 4, we'll dive into **Backpressure and Flow Control** - understanding how to handle fast producers and slow consumers, implementing backpressure strategies, and building robust streaming applications.

**Practice Exercise**: Build a data processing pipeline that:
1. Reads files from disk (blocking I/O)
2. Processes data with CPU-intensive transformation
3. Saves results to database (reactive R2DBC)
4. Uses appropriate schedulers for each operation
5. Measures and logs thread usage
