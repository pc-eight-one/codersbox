---
title: "Spring Boot Reactive Programming - Part 6: Spring WebFlux Deep Dive"
description: "Master Spring WebFlux for building reactive REST APIs. Learn annotated controllers, functional endpoints, WebClient, Server-Sent Events, WebSocket, and create production-ready microservices."
publishDate: 2025-10-06
publishedAt: 2025-10-06
tags: ["Spring Boot", "WebFlux", "REST API", "WebClient", "SSE", "WebSocket"]
difficulty: "advanced"
series: "Spring Boot Reactive Programming"
part: 6
estimatedTime: "100 minutes"
totalParts: 8
featured: true
---

# Spring Boot Reactive Programming - Part 6: Spring WebFlux Deep Dive

Spring WebFlux is Spring's reactive web framework. In this part, we'll build complete reactive REST APIs, master WebClient, implement Server-Sent Events and WebSocket, and create production-ready microservices.

## WebFlux vs Spring MVC

### Architecture Comparison

```java
// Spring MVC (Blocking)
@RestController
public class MvcController {

    @GetMapping("/users/{id}")
    public User getUser(@PathVariable Long id) {
        // Servlet container thread (e.g., Tomcat)
        // Thread BLOCKS here
        User user = userService.findById(id);
        return user;
    }

    // Limited by thread pool size (~200 threads)
    // Can handle ~200 concurrent requests
}

// Spring WebFlux (Non-blocking)
@RestController
public class WebFluxController {

    @GetMapping("/users/{id}")
    public Mono<User> getUser(@PathVariable Long id) {
        // Event loop thread (e.g., Netty)
        // Thread is NEVER blocked
        return userService.findById(id);
    }

    // Limited by CPU/memory, not threads
    // Can handle ~10,000+ concurrent requests
}
```

**When to Use WebFlux:**
- ✅ High concurrency requirements
- ✅ I/O-bound operations (database, external APIs)
- ✅ Streaming data (SSE, WebSocket)
- ✅ Microservices with async communication
- ✅ Integration with reactive databases (R2DBC, MongoDB)

**Stick with Spring MVC when:**
- ❌ Blocking dependencies (JDBC, JPA)
- ❌ CPU-bound operations
- ❌ Team unfamiliar with reactive programming
- ❌ Simple CRUD with low concurrency

## Annotated Controllers

### Basic REST API

```java
@RestController
@RequestMapping("/api/products")
@Validated
public class ProductController {

    @Autowired
    private ProductService productService;

    // GET /api/products/{id}
    @GetMapping("/{id}")
    public Mono<ResponseEntity<Product>> getProduct(@PathVariable Long id) {
        return productService.findById(id)
            .map(ResponseEntity::ok)
            .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    // GET /api/products
    @GetMapping
    public Flux<Product> getAllProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String category) {

        if (category != null) {
            return productService.findByCategory(category);
        }
        return productService.findAll()
            .skip((long) page * size)
            .take(size);
    }

    // POST /api/products
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Mono<Product> createProduct(
            @Valid @RequestBody ProductDto productDto) {
        return productService.create(productDto);
    }

    // PUT /api/products/{id}
    @PutMapping("/{id}")
    public Mono<ResponseEntity<Product>> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductDto productDto) {
        return productService.update(id, productDto)
            .map(ResponseEntity::ok)
            .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    // DELETE /api/products/{id}
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public Mono<Void> deleteProduct(@PathVariable Long id) {
        return productService.delete(id);
    }

    // PATCH /api/products/{id}/stock
    @PatchMapping("/{id}/stock")
    public Mono<Product> updateStock(
            @PathVariable Long id,
            @RequestParam int quantity) {
        return productService.updateStock(id, quantity);
    }
}
```

### Request/Response Handling

```java
@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    // Request headers
    @GetMapping("/{id}")
    public Mono<Order> getOrder(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") String userId,
            @RequestHeader(value = "X-Request-Id", required = false) String requestId) {

        log.info("User {} requesting order {} (request: {})",
            userId, id, requestId);
        return orderService.findById(id);
    }

    // Path variables and request params
    @GetMapping("/user/{userId}")
    public Flux<Order> getUserOrders(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "ALL") OrderStatus status,
            @RequestParam(required = false) @DateTimeFormat(iso = ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = ISO.DATE) LocalDate to) {

        return orderService.findByUserIdAndCriteria(userId, status, from, to);
    }

    // Request body with validation
    @PostMapping
    public Mono<ResponseEntity<Order>> createOrder(
            @Valid @RequestBody CreateOrderRequest request,
            ServerHttpRequest httpRequest) {

        String clientIp = httpRequest.getRemoteAddress()
            .getAddress().getHostAddress();

        return orderService.create(request, clientIp)
            .map(order -> ResponseEntity
                .created(URI.create("/api/orders/" + order.getId()))
                .body(order));
    }

    // Multiple request parameters
    @GetMapping("/search")
    public Flux<Order> searchOrders(
            @RequestParam(required = false) String customerName,
            @RequestParam(required = false) BigDecimal minAmount,
            @RequestParam(required = false) BigDecimal maxAmount,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") Sort.Direction direction) {

        return orderService.search(
            customerName, minAmount, maxAmount, sortBy, direction
        );
    }
}
```

### Exception Handling

```java
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(NotFoundException ex) {
        ErrorResponse error = new ErrorResponse(
            HttpStatus.NOT_FOUND.value(),
            ex.getMessage(),
            Instant.now()
        );
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<ErrorResponse> handleValidation(
            ValidationException ex, ServerWebExchange exchange) {

        ErrorResponse error = new ErrorResponse(
            HttpStatus.BAD_REQUEST.value(),
            ex.getMessage(),
            Instant.now()
        );
        error.setPath(exchange.getRequest().getPath().value());
        return ResponseEntity.badRequest().body(error);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ValidationErrorResponse> handleMethodArgumentNotValid(
            MethodArgumentNotValidException ex) {

        Map<String, String> errors = ex.getBindingResult()
            .getFieldErrors()
            .stream()
            .collect(Collectors.toMap(
                FieldError::getField,
                error -> error.getDefaultMessage() != null
                    ? error.getDefaultMessage()
                    : "Invalid value"
            ));

        ValidationErrorResponse response = new ValidationErrorResponse(
            HttpStatus.BAD_REQUEST.value(),
            "Validation failed",
            errors,
            Instant.now()
        );

        return ResponseEntity.badRequest().body(response);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(Exception ex) {
        log.error("Unexpected error", ex);

        ErrorResponse error = new ErrorResponse(
            HttpStatus.INTERNAL_SERVER_ERROR.value(),
            "An unexpected error occurred",
            Instant.now()
        );

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(error);
    }
}

@Data
@AllArgsConstructor
class ErrorResponse {
    private int status;
    private String message;
    private Instant timestamp;
    private String path;

    public ErrorResponse(int status, String message, Instant timestamp) {
        this.status = status;
        this.message = message;
        this.timestamp = timestamp;
    }
}

@Data
@AllArgsConstructor
class ValidationErrorResponse {
    private int status;
    private String message;
    private Map<String, String> errors;
    private Instant timestamp;
}
```

## Functional Endpoints

Alternative to annotated controllers - functional routing.

```java
@Configuration
public class ProductRouter {

    @Bean
    public RouterFunction<ServerResponse> productRoutes(ProductHandler handler) {
        return RouterFunctions
            .route()
            .path("/api/products", builder -> builder
                .GET("", handler::getAllProducts)
                .GET("/{id}", handler::getProduct)
                .POST("", handler::createProduct)
                .PUT("/{id}", handler::updateProduct)
                .DELETE("/{id}", handler::deleteProduct)
            )
            .build();
    }

    // Advanced routing
    @Bean
    public RouterFunction<ServerResponse> advancedRoutes(ProductHandler handler) {
        return RouterFunctions
            .route()
            // Request predicates
            .GET("/api/products",
                RequestPredicates.queryParam("category", t -> true),
                handler::getProductsByCategory)

            // Content type
            .POST("/api/products",
                RequestPredicates.contentType(MediaType.APPLICATION_JSON),
                handler::createProduct)

            // Header predicates
            .GET("/api/products/{id}",
                RequestPredicates.headers(h ->
                    h.header("X-API-Version").contains("2.0")),
                handler::getProductV2)

            // Nested routes
            .path("/api/admin", builder -> builder
                .nest(RequestPredicates.header("X-Admin-Token", "secret"),
                    adminBuilder -> adminBuilder
                        .GET("/products", handler::getAllProductsAdmin)
                        .DELETE("/products/{id}", handler::deleteProductAdmin)
                )
            )
            .build();
    }
}

@Component
public class ProductHandler {

    @Autowired
    private ProductService productService;

    public Mono<ServerResponse> getAllProducts(ServerRequest request) {
        Flux<Product> products = productService.findAll();
        return ServerResponse.ok()
            .contentType(MediaType.APPLICATION_JSON)
            .body(products, Product.class);
    }

    public Mono<ServerResponse> getProduct(ServerRequest request) {
        Long id = Long.valueOf(request.pathVariable("id"));

        return productService.findById(id)
            .flatMap(product -> ServerResponse.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(product))
            .switchIfEmpty(ServerResponse.notFound().build());
    }

    public Mono<ServerResponse> createProduct(ServerRequest request) {
        Mono<ProductDto> productDto = request.bodyToMono(ProductDto.class);

        return productDto
            .flatMap(dto -> productService.create(dto))
            .flatMap(product -> ServerResponse
                .created(URI.create("/api/products/" + product.getId()))
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(product))
            .onErrorResume(ValidationException.class, e ->
                ServerResponse.badRequest()
                    .bodyValue(new ErrorResponse(400, e.getMessage(), Instant.now()))
            );
    }

    public Mono<ServerResponse> updateProduct(ServerRequest request) {
        Long id = Long.valueOf(request.pathVariable("id"));
        Mono<ProductDto> productDto = request.bodyToMono(ProductDto.class);

        return productDto
            .flatMap(dto -> productService.update(id, dto))
            .flatMap(product -> ServerResponse.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(product))
            .switchIfEmpty(ServerResponse.notFound().build());
    }

    public Mono<ServerResponse> deleteProduct(ServerRequest request) {
        Long id = Long.valueOf(request.pathVariable("id"));

        return productService.delete(id)
            .then(ServerResponse.noContent().build())
            .onErrorResume(NotFoundException.class, e ->
                ServerResponse.notFound().build()
            );
    }

    public Mono<ServerResponse> getProductsByCategory(ServerRequest request) {
        String category = request.queryParam("category")
            .orElseThrow(() -> new IllegalArgumentException("Category required"));

        Flux<Product> products = productService.findByCategory(category);

        return ServerResponse.ok()
            .contentType(MediaType.APPLICATION_JSON)
            .body(products, Product.class);
    }
}
```

## WebClient - Reactive HTTP Client

### Configuration

```java
@Configuration
public class WebClientConfig {

    @Bean
    public WebClient externalApiClient() {
        return WebClient.builder()
            .baseUrl("https://api.external-service.com")
            .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
            .defaultHeader("X-API-Key", "your-api-key")
            .codecs(configurer -> configurer
                .defaultCodecs()
                .maxInMemorySize(16 * 1024 * 1024))  // 16MB buffer
            .build();
    }

    @Bean
    public WebClient customWebClient() {
        HttpClient httpClient = HttpClient.create()
            .option(ChannelOption.CONNECT_TIMEOUT_MILLIS, 5000)
            .responseTimeout(Duration.ofSeconds(5))
            .doOnConnected(conn ->
                conn.addHandlerLast(new ReadTimeoutHandler(5))
                    .addHandlerLast(new WriteTimeoutHandler(5))
            );

        return WebClient.builder()
            .clientConnector(new ReactorClientHttpConnector(httpClient))
            .filter(logRequest())
            .filter(logResponse())
            .build();
    }

    private ExchangeFilterFunction logRequest() {
        return ExchangeFilterFunction.ofRequestProcessor(request -> {
            log.info("Request: {} {}", request.method(), request.url());
            request.headers().forEach((name, values) ->
                values.forEach(value ->
                    log.debug("Header: {}={}", name, value)
                )
            );
            return Mono.just(request);
        });
    }

    private ExchangeFilterFunction logResponse() {
        return ExchangeFilterFunction.ofResponseProcessor(response -> {
            log.info("Response status: {}", response.statusCode());
            return Mono.just(response);
        });
    }
}
```

### Making Requests

```java
@Service
public class ExternalApiService {

    @Autowired
    private WebClient externalApiClient;

    // GET request
    public Mono<User> getUser(Long id) {
        return externalApiClient
            .get()
            .uri("/users/{id}", id)
            .retrieve()
            .bodyToMono(User.class)
            .timeout(Duration.ofSeconds(5))
            .retry(2);
    }

    // GET with query parameters
    public Flux<Product> searchProducts(String query, int page, int size) {
        return externalApiClient
            .get()
            .uri(uriBuilder -> uriBuilder
                .path("/products/search")
                .queryParam("q", query)
                .queryParam("page", page)
                .queryParam("size", size)
                .build())
            .retrieve()
            .bodyToFlux(Product.class);
    }

    // POST request
    public Mono<Order> createOrder(CreateOrderRequest request) {
        return externalApiClient
            .post()
            .uri("/orders")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(request)
            .retrieve()
            .bodyToMono(Order.class);
    }

    // PUT request
    public Mono<User> updateUser(Long id, UserUpdateRequest request) {
        return externalApiClient
            .put()
            .uri("/users/{id}", id)
            .bodyValue(request)
            .retrieve()
            .bodyToMono(User.class);
    }

    // DELETE request
    public Mono<Void> deleteProduct(Long id) {
        return externalApiClient
            .delete()
            .uri("/products/{id}", id)
            .retrieve()
            .bodyToMono(Void.class);
    }

    // Custom headers
    public Mono<ApiResponse> callWithHeaders(String requestId) {
        return externalApiClient
            .get()
            .uri("/api/data")
            .header("X-Request-Id", requestId)
            .header("X-User-Agent", "MyApp/1.0")
            .retrieve()
            .bodyToMono(ApiResponse.class);
    }

    // Handle errors
    public Mono<User> getUserWithErrorHandling(Long id) {
        return externalApiClient
            .get()
            .uri("/users/{id}", id)
            .retrieve()
            .onStatus(HttpStatus::is4xxClientError, response ->
                response.bodyToMono(String.class)
                    .flatMap(body -> Mono.error(
                        new ClientException("Client error: " + body)
                    ))
            )
            .onStatus(HttpStatus::is5xxServerError, response ->
                Mono.error(new ServerException("Server error"))
            )
            .bodyToMono(User.class)
            .onErrorResume(WebClientException.class, e -> {
                log.error("WebClient error: {}", e.getMessage());
                return Mono.empty();
            });
    }

    // Exchange for full control
    public Mono<User> getUserWithExchange(Long id) {
        return externalApiClient
            .get()
            .uri("/users/{id}", id)
            .exchangeToMono(response -> {
                if (response.statusCode().is2xxSuccessful()) {
                    return response.bodyToMono(User.class);
                } else if (response.statusCode() == HttpStatus.NOT_FOUND) {
                    return Mono.empty();
                } else {
                    return response.createException()
                        .flatMap(Mono::error);
                }
            });
    }
}
```

## Server-Sent Events (SSE)

```java
@RestController
@RequestMapping("/api/events")
public class EventStreamController {

    @Autowired
    private EventService eventService;

    // Basic SSE stream
    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<ServerSentEvent<EventData>> streamEvents() {
        return eventService.getEventStream()
            .map(event -> ServerSentEvent.builder(event)
                .id(String.valueOf(event.getId()))
                .event("data-update")
                .build());
    }

    // SSE with heartbeat
    @GetMapping(value = "/stream/heartbeat", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<ServerSentEvent<String>> streamWithHeartbeat() {
        Flux<ServerSentEvent<String>> dataStream = eventService.getEventStream()
            .map(event -> ServerSentEvent.<String>builder()
                .id(String.valueOf(event.getId()))
                .event("message")
                .data(event.toString())
                .build());

        Flux<ServerSentEvent<String>> heartbeat = Flux.interval(Duration.ofSeconds(10))
            .map(seq -> ServerSentEvent.<String>builder()
                .event("heartbeat")
                .data("ping")
                .build());

        return Flux.merge(dataStream, heartbeat);
    }

    // Stock price updates
    @GetMapping(value = "/stocks/{symbol}", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<ServerSentEvent<StockPrice>> streamStockPrice(
            @PathVariable String symbol) {

        return stockPriceService.getPriceStream(symbol)
            .map(price -> ServerSentEvent.builder(price)
                .id(UUID.randomUUID().toString())
                .event("price-update")
                .retry(Duration.ofSeconds(3))
                .build())
            .doOnCancel(() -> log.info("Client disconnected from {}", symbol));
    }

    // Chat messages
    @GetMapping(value = "/chat/{roomId}", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<ServerSentEvent<ChatMessage>> streamChat(
            @PathVariable String roomId,
            @RequestHeader("X-User-Id") String userId) {

        return chatService.joinRoom(roomId, userId)
            .map(message -> ServerSentEvent.builder(message)
                .id(message.getId())
                .event("chat-message")
                .comment("Room: " + roomId)
                .build());
    }
}
```

## WebSocket

```java
@Configuration
@EnableWebSocket
public class WebSocketConfig {

    @Bean
    public HandlerMapping webSocketHandlerMapping(ChatWebSocketHandler handler) {
        Map<String, WebSocketHandler> map = new HashMap<>();
        map.put("/ws/chat", handler);

        SimpleUrlHandlerMapping handlerMapping = new SimpleUrlHandlerMapping();
        handlerMapping.setUrlMap(map);
        handlerMapping.setOrder(1);
        return handlerMapping;
    }

    @Bean
    public WebSocketHandlerAdapter handlerAdapter() {
        return new WebSocketHandlerAdapter();
    }
}

@Component
@Slf4j
public class ChatWebSocketHandler implements WebSocketHandler {

    private final Map<String, Sinks.Many<String>> sessions = new ConcurrentHashMap<>();

    @Override
    public Mono<Void> handle(WebSocketSession session) {
        String sessionId = session.getId();
        log.info("WebSocket connected: {}", sessionId);

        // Create sink for this session
        Sinks.Many<String> sink = Sinks.many().multicast().onBackpressureBuffer();
        sessions.put(sessionId, sink);

        // Send messages to client
        Mono<Void> output = session.send(
            sink.asFlux()
                .map(session::textMessage)
        );

        // Receive messages from client
        Mono<Void> input = session.receive()
            .map(WebSocketMessage::getPayloadAsText)
            .doOnNext(message -> {
                log.info("Received from {}: {}", sessionId, message);
                // Broadcast to all sessions
                broadcastMessage(sessionId + ": " + message);
            })
            .then();

        // Cleanup on disconnect
        return Mono.zip(input, output)
            .doFinally(signalType -> {
                log.info("WebSocket disconnected: {} ({})", sessionId, signalType);
                sessions.remove(sessionId);
            })
            .then();
    }

    private void broadcastMessage(String message) {
        sessions.values().forEach(sink ->
            sink.tryEmitNext(message)
        );
    }

    public void sendToSession(String sessionId, String message) {
        Sinks.Many<String> sink = sessions.get(sessionId);
        if (sink != null) {
            sink.tryEmitNext(message);
        }
    }
}
```

## File Upload/Download

```java
@RestController
@RequestMapping("/api/files")
public class FileController {

    // File upload
    @PostMapping("/upload")
    public Mono<ResponseEntity<FileUploadResponse>> uploadFile(
            @RequestPart("file") Flux<FilePart> filePartFlux) {

        return filePartFlux
            .flatMap(filePart -> {
                String filename = filePart.filename();
                Path filepath = Paths.get("uploads", filename);

                return filePart.transferTo(filepath)
                    .then(Mono.just(new FileUploadResponse(
                        filename,
                        filepath.toString(),
                        "Success"
                    )));
            })
            .next()
            .map(ResponseEntity::ok);
    }

    // Multipart file upload with metadata
    @PostMapping("/upload/multipart")
    public Mono<ResponseEntity<FileUploadResponse>> uploadWithMetadata(
            @RequestPart("file") Mono<FilePart> filePart,
            @RequestPart("metadata") Mono<FileMetadata> metadata) {

        return Mono.zip(filePart, metadata)
            .flatMap(tuple -> {
                FilePart file = tuple.getT1();
                FileMetadata meta = tuple.getT2();

                String filename = UUID.randomUUID().toString() +
                    "-" + file.filename();
                Path filepath = Paths.get("uploads", filename);

                return file.transferTo(filepath)
                    .then(saveMetadata(filepath.toString(), meta))
                    .map(saved -> ResponseEntity.ok(
                        new FileUploadResponse(filename, filepath.toString(), "Success")
                    ));
            });
    }

    // File download
    @GetMapping("/download/{filename}")
    public Mono<ResponseEntity<Resource>> downloadFile(
            @PathVariable String filename) {

        Path filepath = Paths.get("uploads", filename);

        return Mono.fromCallable(() -> new FileSystemResource(filepath))
            .subscribeOn(Schedulers.boundedElastic())
            .map(resource -> ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                    "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(resource))
            .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    // Stream large file
    @GetMapping("/stream/{filename}")
    public Mono<ResponseEntity<Flux<DataBuffer>>> streamFile(
            @PathVariable String filename) {

        Path filepath = Paths.get("uploads", filename);

        return Mono.fromCallable(() -> Files.exists(filepath))
            .subscribeOn(Schedulers.boundedElastic())
            .flatMap(exists -> {
                if (!exists) {
                    return Mono.just(ResponseEntity.notFound().build());
                }

                Flux<DataBuffer> dataBufferFlux = DataBufferUtils
                    .read(filepath, new DefaultDataBufferFactory(), 4096);

                return Mono.just(ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + filename + "\"")
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .body(dataBufferFlux));
            });
    }

    private Mono<FileMetadata> saveMetadata(String filepath, FileMetadata metadata) {
        metadata.setFilepath(filepath);
        return Mono.just(metadata);  // Save to database in real app
    }
}
```

## Complete Microservice Example

```java
// Application
@SpringBootApplication
public class ProductServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(ProductServiceApplication.class, args);
    }
}

// Configuration
@Configuration
public class WebFluxConfig implements WebFluxConfigurer {

    @Override
    public void configureHttpMessageCodecs(ServerCodecConfigurer configurer) {
        configurer.defaultCodecs().maxInMemorySize(16 * 1024 * 1024);
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
            .allowedOrigins("http://localhost:3000")
            .allowedMethods("GET", "POST", "PUT", "DELETE")
            .allowedHeaders("*")
            .allowCredentials(true)
            .maxAge(3600);
    }
}

// Service
@Service
public class ProductService {

    @Autowired
    private ProductRepository repository;

    @Autowired
    private CacheService cacheService;

    public Flux<Product> findAll() {
        return repository.findAll();
    }

    public Mono<Product> findById(Long id) {
        return cacheService.get("product:" + id, Product.class)
            .switchIfEmpty(
                repository.findById(id)
                    .flatMap(product ->
                        cacheService.set("product:" + id, product, Duration.ofMinutes(10))
                            .thenReturn(product)
                    )
            );
    }

    public Mono<Product> create(ProductDto dto) {
        Product product = new Product();
        product.setName(dto.getName());
        product.setPrice(dto.getPrice());
        product.setCategory(dto.getCategory());

        return repository.save(product)
            .flatMap(saved ->
                cacheService.set("product:" + saved.getId(), saved, Duration.ofMinutes(10))
                    .thenReturn(saved)
            );
    }

    public Mono<Product> update(Long id, ProductDto dto) {
        return repository.findById(id)
            .flatMap(existing -> {
                existing.setName(dto.getName());
                existing.setPrice(dto.getPrice());
                existing.setCategory(dto.getCategory());
                return repository.save(existing);
            })
            .flatMap(updated ->
                cacheService.delete("product:" + id)
                    .thenReturn(updated)
            );
    }

    public Mono<Void> delete(Long id) {
        return repository.deleteById(id)
            .then(cacheService.delete("product:" + id));
    }
}
```

## Key Takeaways

- **WebFlux** enables high-concurrency non-blocking applications
- **Annotated controllers** (@RestController) for familiar MVC style
- **Functional endpoints** (RouterFunction) for functional programming style
- **WebClient** is the reactive HTTP client (replaces RestTemplate)
- **SSE** for server-to-client real-time updates
- **WebSocket** for bidirectional real-time communication
- **File handling** with reactive streams prevents memory issues
- **Choose WebFlux** when you need high concurrency and have reactive stack

## What's Next

In Part 7, we'll explore **Reactive Data Access** with R2DBC - building reactive database applications, managing transactions, pagination, and integrating with MongoDB and Redis reactively.

**Practice Exercise**: Build a complete blog API with:
1. CRUD operations for posts and comments
2. WebClient to fetch user data from external API
3. SSE for real-time comment notifications
4. File upload for post images
5. Proper error handling and validation
6. Caching layer with Redis
