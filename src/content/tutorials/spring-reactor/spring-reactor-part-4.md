---
title: "Spring Boot Reactive Programming - Part 4: Backpressure and Flow Control"
description: "Master backpressure strategies in Project Reactor. Learn how to handle fast producers and slow consumers, implement flow control, and build robust streaming applications that scale."
publishDate: 2025-03-24
publishedAt: 2025-10-06
tags: ["Spring Boot", "Reactor", "Backpressure", "Flow Control", "Streaming", "WebFlux"]
difficulty: "advanced"
series: "Spring Boot Reactive Programming"
part: 4
estimatedTime: "70 minutes"
totalParts: 8
---

# Spring Boot Reactive Programming - Part 4: Backpressure and Flow Control

Backpressure is one of the most important concepts in reactive programming. In this part, we'll learn how to handle scenarios where data producers are faster than consumers.

## What is Backpressure?

**Backpressure** is a mechanism that allows a slow consumer to signal to a fast producer: "Slow down, I can't keep up!"

### The Problem: Fast Producer, Slow Consumer

```java
public class BackpressureProblem {

    public void demonstrateProblem() {
        // Fast producer: 1000 items/second
        Flux<Integer> fastProducer = Flux.range(1, 1_000_000)
            .doOnNext(i -> log.info("Producing: {}", i));

        // Slow consumer: 10 items/second
        fastProducer.subscribe(i -> {
            try {
                Thread.sleep(100);  // 100ms = 10 items/sec
                log.info("Consumed: {}", i);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        });

        // Result: OutOfMemoryError!
        // Items pile up in memory waiting to be consumed
    }
}
```

**Without backpressure:**
```
Producer: Item 1, 2, 3, 4, 5... 10,000... 100,000...
Consumer: Item 1... (100ms later) Item 2... (100ms later)...
Memory: 📈📈📈 OutOfMemoryError!
```

**With backpressure:**
```
Consumer: "Give me 10 items"
Producer: Item 1, 2, 3, 4, 5, 6, 7, 8, 9, 10
Consumer: Processing... "Give me 10 more"
Producer: Item 11, 12, 13...
Memory: ✅ Stable
```

## Backpressure Strategies

### Strategy 1: Buffer

Buffer items until consumer is ready (with limits).

```java
@Service
public class BufferStrategy {

    // Buffer with size limit
    public Flux<Event> processEventsWithBuffer(Flux<Event> events) {
        return events
            .onBackpressureBuffer(
                1000,  // Buffer up to 1000 items
                dropped -> log.warn("Dropped event: {}", dropped),
                BufferOverflowStrategy.DROP_LATEST
            )
            .flatMap(this::processEvent);
    }

    // Buffer overflow strategies
    public void demonstrateBufferStrategies() {

        // DROP_LATEST: Drop newest items when buffer full
        Flux<Integer> dropLatest = Flux.range(1, 1000)
            .onBackpressureBuffer(
                100,
                BufferOverflowStrategy.DROP_LATEST
            );

        // DROP_OLDEST: Drop oldest items when buffer full
        Flux<Integer> dropOldest = Flux.range(1, 1000)
            .onBackpressureBuffer(
                100,
                BufferOverflowStrategy.DROP_OLDEST
            );

        // ERROR: Throw error when buffer full
        Flux<Integer> error = Flux.range(1, 1000)
            .onBackpressureBuffer(
                100,
                dropped -> log.error("Buffer overflow!"),
                BufferOverflowStrategy.ERROR
            );
    }

    // Real-world: Event processing with buffer
    public Flux<ProcessedEvent> processEventStream() {
        return eventSource.stream()
            .onBackpressureBuffer(
                10_000,  // 10k events buffer
                dropped -> metrics.incrementDropped(),
                BufferOverflowStrategy.DROP_LATEST
            )
            .window(Duration.ofSeconds(1))  // Process in 1-second windows
            .flatMap(window ->
                window.collectList()
                    .flatMap(this::batchProcess)
            );
    }

    private Mono<Event> processEvent(Event event) {
        return Mono.delay(Duration.ofMillis(100))
            .then(Mono.just(event));
    }
}
```

### Strategy 2: Drop

Drop items when consumer can't keep up.

```java
@Service
public class DropStrategy {

    // Drop items when no demand
    public Flux<SensorReading> processSensorData(Flux<SensorReading> readings) {
        return readings
            .onBackpressureDrop(
                dropped -> log.warn("Dropped reading: {}", dropped.getValue())
            )
            .flatMap(this::analyzereading);
    }

    // Real-world: Stock price updates
    // Only care about latest price, can drop intermediate values
    public Flux<StockPrice> streamStockPrices(String symbol) {
        return stockFeed.getPriceStream(symbol)
            .onBackpressureDrop(
                dropped -> log.debug("Dropped stale price: {}", dropped)
            )
            .distinctUntilChanged(StockPrice::getPrice)
            .doOnNext(price -> publishToWebSocket(price));
    }

    // Metrics tracking
    public Flux<Metric> processMetrics(Flux<Metric> metrics) {
        AtomicLong droppedCount = new AtomicLong(0);

        return metrics
            .onBackpressureDrop(dropped -> {
                long count = droppedCount.incrementAndGet();
                if (count % 1000 == 0) {
                    log.warn("Dropped {} metrics so far", count);
                }
            })
            .doOnComplete(() ->
                log.info("Total dropped: {}", droppedCount.get())
            );
    }
}
```

### Strategy 3: Latest

Keep only the latest item, drop intermediate values.

```java
@Service
public class LatestStrategy {

    // Keep latest value
    public Flux<Temperature> monitorTemperature() {
        return temperatureSensor.readings()
            .onBackpressureLatest()  // Always get most recent reading
            .filter(temp -> temp.getValue() > 100)
            .flatMap(this::sendAlert);
    }

    // Real-world: Live dashboard
    // User only sees latest data, intermediate values don't matter
    public Flux<DashboardData> streamDashboard(String userId) {
        return Flux.merge(
            cpuMetrics.stream().onBackpressureLatest(),
            memoryMetrics.stream().onBackpressureLatest(),
            networkMetrics.stream().onBackpressureLatest()
        )
        .sample(Duration.ofSeconds(1))  // Update dashboard every second
        .map(this::aggregateDashboardData);
    }

    // Comparison of strategies
    public void compareStrategies() {
        Flux<Integer> source = Flux.range(1, 1000);

        // Buffer: Keeps all items (up to limit)
        source.onBackpressureBuffer(100);
        // Result: 1, 2, 3, 4, 5... (all items buffered)

        // Drop: Drops items when buffer full
        source.onBackpressureDrop();
        // Result: 1, 2, 3... <drops 50-900> ...950, 951...

        // Latest: Keeps only most recent
        source.onBackpressureLatest();
        // Result: 1, 2, 3... <skips to> ...1000
    }
}
```

### Strategy 4: Error

Signal error when consumer can't keep up.

```java
@Service
public class ErrorStrategy {

    // Strict mode: Must handle all items
    public Flux<Transaction> processTransactions(Flux<Transaction> transactions) {
        return transactions
            .onBackpressureError()  // Fail fast if can't keep up
            .flatMap(this::validateAndSave)
            .doOnError(e ->
                log.error("Backpressure error - system overloaded!", e)
            );
    }

    // Real-world: Payment processing (can't drop payments!)
    public Mono<PaymentResult> processPayments(Flux<Payment> payments) {
        return payments
            .onBackpressureError()  // Never drop payments
            .concatMap(this::processPayment)  // Sequential processing
            .collectList()
            .map(PaymentResult::new)
            .onErrorResume(OverflowException.class, e -> {
                // Scale up processing capacity
                return scaleUpProcessors()
                    .then(Mono.error(new SystemOverloadException()));
            });
    }
}
```

## Request-Based Backpressure

### limitRate() - Control Request Size

```java
@Service
public class RateLimiting {

    // Limit requests to 10 items at a time
    public Flux<Product> streamProducts() {
        return productRepository.findAll()
            .limitRate(10)  // Request 10, process, request 10 more
            .flatMap(this::enrichProduct);
    }

    // With prefetch
    public Flux<User> streamUsersWithPrefetch() {
        return userRepository.findAll()
            .limitRate(100, 75)  // Request 100, when 75 consumed, request 100 more
            .flatMap(this::processUser);
    }

    // Real-world: Rate-limited API calls
    public Flux<ApiResponse> callExternalApi(Flux<Request> requests) {
        return requests
            .limitRate(10)  // Max 10 concurrent requests
            .flatMap(request ->
                webClient.post()
                    .body(Mono.just(request), Request.class)
                    .retrieve()
                    .bodyToMono(ApiResponse.class)
                    .delayElement(Duration.ofMillis(100))  // Rate limit
            );
    }
}
```

### Controlling Demand Manually

```java
public class ManualDemand {

    public void demonstrateManualControl() {
        Flux<Integer> flux = Flux.range(1, 100);

        flux.subscribe(new BaseSubscriber<Integer>() {

            @Override
            protected void hookOnSubscribe(Subscription subscription) {
                // Request 5 items initially
                request(5);
            }

            @Override
            protected void hookOnNext(Integer value) {
                log.info("Received: {}", value);

                // Process item
                processItem(value);

                // Request 1 more item after processing
                request(1);
            }

            @Override
            protected void hookOnComplete() {
                log.info("Done!");
            }

            private void processItem(Integer value) {
                // Simulate slow processing
                try {
                    Thread.sleep(100);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            }
        });
    }
}
```

## Real-World Example: Log Processing Pipeline

```java
@Service
@Slf4j
public class LogProcessingPipeline {

    @Autowired private LogRepository logRepository;
    @Autowired private ElasticsearchService elasticsearchService;
    @Autowired private MetricsService metricsService;

    public Flux<ProcessedLog> processLogStream(Flux<LogEntry> logStream) {
        return logStream
            // 1. Handle backpressure from fast log generation
            .onBackpressureBuffer(
                50_000,  // Buffer up to 50k logs
                dropped -> {
                    metricsService.incrementDroppedLogs();
                    log.warn("Dropped log: {}", dropped.getMessage());
                },
                BufferOverflowStrategy.DROP_OLDEST  // Keep newest logs
            )

            // 2. Rate limit processing
            .limitRate(1000)  // Process 1000 at a time

            // 3. Batch for efficiency
            .buffer(Duration.ofSeconds(5), 100)  // 5s or 100 items

            // 4. Process batches in parallel
            .flatMap(batch ->
                Mono.fromCallable(() -> processBatch(batch))
                    .subscribeOn(Schedulers.boundedElastic())
                    .timeout(Duration.ofSeconds(30))
                    .retry(2)
                    .onErrorResume(e -> {
                        log.error("Batch processing failed", e);
                        return Mono.empty();
                    }),
                10  // Max 10 concurrent batches
            )

            // 5. Save to Elasticsearch (with backpressure)
            .flatMap(processed ->
                elasticsearchService.index(processed)
                    .onBackpressureBuffer(1000)
                    .retry(3)
            )

            // 6. Metrics
            .doOnNext(result -> metricsService.incrementProcessed())
            .doOnError(e -> metricsService.incrementErrors());
    }

    private List<ProcessedLog> processBatch(List<LogEntry> batch) {
        // Parse, enrich, filter logs
        return batch.stream()
            .map(this::parseLog)
            .filter(this::isRelevant)
            .map(this::enrichLog)
            .collect(Collectors.toList());
    }

    private ProcessedLog parseLog(LogEntry entry) {
        // Parse log format
        return new ProcessedLog(entry);
    }

    private boolean isRelevant(ProcessedLog log) {
        // Filter out noise
        return log.getLevel() != Level.DEBUG;
    }

    private ProcessedLog enrichLog(ProcessedLog log) {
        // Add metadata
        log.setProcessedAt(Instant.now());
        return log;
    }
}
```

## Streaming Large Datasets

```java
@Service
public class LargeDatasetStreaming {

    // Stream millions of records without OOM
    public Flux<User> streamAllUsers() {
        return userRepository.findAll()
            .limitRate(1000)  // Control memory usage
            .doOnNext(user -> log.debug("Streaming user: {}", user.getId()));
    }

    // Export large dataset to CSV
    public Mono<Void> exportToCsv(String filename) {
        return Mono.fromCallable(() -> Files.newBufferedWriter(Path.of(filename)))
            .flatMapMany(writer ->
                userRepository.findAll()
                    .limitRate(500)
                    .map(this::toCsvLine)
                    .doOnNext(line -> {
                        try {
                            writer.write(line);
                            writer.newLine();
                        } catch (IOException e) {
                            throw new RuntimeException(e);
                        }
                    })
                    .doFinally(signal -> {
                        try {
                            writer.close();
                        } catch (IOException e) {
                            log.error("Error closing file", e);
                        }
                    })
            )
            .then();
    }

    // Paginated processing
    public Flux<ProcessedData> processLargeDataset() {
        return Flux.range(0, Integer.MAX_VALUE)
            .limitRate(10)  // Process 10 pages at a time
            .flatMap(page ->
                fetchPage(page, 1000)
                    .flatMapMany(Flux::fromIterable)
            )
            .takeWhile(data -> data != null)  // Stop when no more data
            .flatMap(this::processData)
            .onBackpressureBuffer(5000);
    }

    private Mono<List<Data>> fetchPage(int page, int size) {
        return dataRepository.findAll(PageRequest.of(page, size))
            .collectList();
    }

    private String toCsvLine(User user) {
        return String.format("%d,%s,%s",
            user.getId(), user.getName(), user.getEmail());
    }
}
```

## Backpressure in WebFlux

```java
@RestController
@RequestMapping("/api")
public class StreamingController {

    @Autowired
    private DataService dataService;

    // Server-Sent Events (SSE) with backpressure
    @GetMapping(value = "/stream/events", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<ServerSentEvent<EventData>> streamEvents() {
        return dataService.getEventStream()
            .onBackpressureLatest()  // Client sees latest events
            .map(event -> ServerSentEvent.builder(event)
                .id(String.valueOf(event.getId()))
                .event("data-update")
                .build())
            .doOnCancel(() -> log.info("Client disconnected"));
    }

    // Streaming response with flow control
    @GetMapping("/stream/products")
    public Flux<Product> streamProducts(
            @RequestParam(defaultValue = "100") int batchSize) {

        return productRepository.findAll()
            .limitRate(batchSize)  // Control how fast we send
            .delayElements(Duration.ofMillis(10));  // Throttle
    }

    // Upload large file with backpressure
    @PostMapping("/upload")
    public Mono<UploadResult> uploadFile(
            @RequestPart("file") Flux<DataBuffer> fileData) {

        return fileData
            .onBackpressureBuffer(1000)  // Buffer up to 1000 chunks
            .reduce(DataBufferUtils.join())  // Join all chunks
            .flatMap(this::saveFile);
    }

    private Mono<UploadResult> saveFile(DataBuffer buffer) {
        // Save file
        return Mono.just(new UploadResult("success"));
    }
}
```

## Monitoring Backpressure

```java
@Component
@Slf4j
public class BackpressureMonitoring {

    private final AtomicLong requestedCount = new AtomicLong(0);
    private final AtomicLong droppedCount = new AtomicLong(0);
    private final AtomicLong bufferedCount = new AtomicLong(0);

    public <T> Flux<T> monitorBackpressure(Flux<T> source, String name) {
        return source
            .doOnRequest(requested -> {
                long total = requestedCount.addAndGet(requested);
                log.info("{} - Requested: {}, Total: {}",
                    name, requested, total);
            })
            .onBackpressureBuffer(
                10000,
                dropped -> {
                    long count = droppedCount.incrementAndGet();
                    if (count % 100 == 0) {
                        log.warn("{} - Dropped {} items so far",
                            name, count);
                    }
                },
                BufferOverflowStrategy.DROP_LATEST
            )
            .doOnNext(item -> bufferedCount.decrementAndGet())
            .doOnComplete(() -> {
                log.info("{} - Final stats - Requested: {}, Dropped: {}, Buffered: {}",
                    name, requestedCount.get(), droppedCount.get(), bufferedCount.get());
            });
    }

    // Metrics with Micrometer
    @Bean
    public Flux<Metric> instrumentedFlux(Flux<Event> events) {
        return events
            .name("event.processing")  // Metrics name
            .tag("source", "kafka")    // Tags
            .metrics()                  // Enable metrics
            .onBackpressureBuffer(5000)
            .map(this::processEvent);
    }

    private Metric processEvent(Event event) {
        return new Metric(event);
    }
}
```

## Best Practices

```java
@Service
public class BackpressureBestPractices {

    // ✅ GOOD: Choose appropriate strategy
    public Flux<StockPrice> streamPrices() {
        return priceService.stream()
            .onBackpressureLatest();  // Only care about latest price
    }

    // ✅ GOOD: Set reasonable buffer sizes
    public Flux<Event> processEvents() {
        return eventSource.stream()
            .onBackpressureBuffer(
                10_000,  // Based on memory constraints
                BufferOverflowStrategy.DROP_OLDEST
            );
    }

    // ✅ GOOD: Use limitRate for large streams
    public Flux<User> streamUsers() {
        return userRepository.findAll()
            .limitRate(1000);  // Control memory usage
    }

    // ❌ BAD: Unbounded buffer
    public Flux<Data> processDataBad() {
        return dataSource.stream()
            .onBackpressureBuffer();  // Can cause OOM!
    }

    // ❌ BAD: Wrong strategy for critical data
    public Flux<Payment> processPaymentsBad() {
        return paymentSource.stream()
            .onBackpressureDrop();  // Never drop payments!
    }

    // ❌ BAD: No backpressure handling
    public Flux<Event> processEventsBad() {
        return eventSource.stream()
            .flatMap(this::processEvent);  // Will overflow!
    }

    private Mono<Event> processEvent(Event event) {
        return Mono.just(event);
    }

    private Mono<Data> processData(Data data) {
        return Mono.just(data);
    }
}
```

## Performance Tuning

```java
@Configuration
public class BackpressureConfiguration {

    // Tune buffer sizes based on workload
    @Value("${app.backpressure.buffer-size:10000}")
    private int bufferSize;

    @Value("${app.backpressure.prefetch:256}")
    private int prefetch;

    @Bean
    public Flux<Event> configuredEventStream(Flux<Event> source) {
        return source
            .onBackpressureBuffer(bufferSize)
            .limitRate(prefetch);
    }

    // Custom backpressure strategy
    @Bean
    public Function<Flux<Message>, Flux<Message>> customBackpressure() {
        return flux -> flux
            .onBackpressureBuffer(
                bufferSize,
                dropped -> logDropped(dropped),
                BufferOverflowStrategy.DROP_OLDEST
            )
            .limitRate(prefetch, prefetch * 3 / 4);
    }

    private void logDropped(Message message) {
        log.warn("Dropped message: {}", message.getId());
    }
}
```

## Key Takeaways

- **Backpressure** prevents memory overflow when producers are faster than consumers
- **onBackpressureBuffer()** - Buffer items (with limits)
- **onBackpressureDrop()** - Drop items when overwhelmed
- **onBackpressureLatest()** - Keep only latest value
- **onBackpressureError()** - Fail fast when can't keep up
- **limitRate()** - Control request batch size
- **Choose strategy based on data criticality** (payments vs metrics)
- **Monitor backpressure** in production
- **Set reasonable buffer sizes** to prevent OOM
- **Test with realistic load** to find proper settings

## What's Next

In Part 5, we'll explore **Advanced Error Handling and Resilience** - implementing retry policies, circuit breakers, fallback strategies, and building resilient microservices that gracefully handle failures.

**Practice Exercise**: Build a real-time analytics pipeline that:
1. Consumes events from a fast producer (1000/sec)
2. Processes events with slow consumer (100/sec)
3. Implements appropriate backpressure strategy
4. Buffers and batches for efficient processing
5. Monitors and logs backpressure metrics
6. Handles overflow scenarios gracefully
