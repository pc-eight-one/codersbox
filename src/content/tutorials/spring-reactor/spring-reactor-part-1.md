---
title: "Spring Boot Reactive Programming - Part 1: Introduction to Project Reactor"
description: "Master reactive programming fundamentals with Project Reactor. Understand the reactive paradigm, learn Mono and Flux, and discover why reactive programming is essential for modern applications."
publishDate: 2025-10-06
publishedAt: 2025-10-06
tags: ["Spring Boot", "Reactor", "Reactive Programming", "WebFlux", "Mono", "Flux"]
difficulty: "intermediate"
series: "Spring Boot Reactive Programming"
part: 1
estimatedTime: "60 minutes"
totalParts: 8
featured: true
---

# Spring Boot Reactive Programming - Part 1: Introduction to Project Reactor

This comprehensive series will teach you reactive programming with Spring Boot and Project Reactor. Whether you're building high-throughput APIs or real-time data pipelines, this series provides the practical knowledge you need.

## What is Reactive Programming?

Reactive programming is a **declarative programming paradigm** focused on data streams and the propagation of change. It enables you to build non-blocking, asynchronous, and event-driven applications.

### The Problem with Traditional Blocking I/O

```java
// Traditional blocking code
@RestController
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/users/{id}")
    public User getUser(@PathVariable Long id) {
        // Thread BLOCKS waiting for database
        User user = userService.findById(id);  // 50ms

        // Thread BLOCKS waiting for external API
        Profile profile = externalApi.getProfile(id);  // 100ms

        // Thread BLOCKS waiting for cache
        Settings settings = cache.get(id);  // 20ms

        // Total time: 170ms with thread blocked entire time
        return enrichUser(user, profile, settings);
    }
}
```

**Problems:**
- ❌ Thread blocked for 170ms doing nothing
- ❌ Can't handle concurrent requests efficiently
- ❌ Limited by thread pool size
- ❌ Poor resource utilization

### The Reactive Solution

```java
// Reactive non-blocking code
@RestController
public class ReactiveUserController {

    @Autowired
    private ReactiveUserService userService;

    @GetMapping("/users/{id}")
    public Mono<User> getUser(@PathVariable Long id) {
        // Execute all operations CONCURRENTLY
        Mono<User> userMono = userService.findById(id);
        Mono<Profile> profileMono = externalApi.getProfile(id);
        Mono<Settings> settingsMono = cache.get(id);

        // Combine results when all complete
        return Mono.zip(userMono, profileMono, settingsMono)
                .map(tuple -> enrichUser(
                    tuple.getT1(),
                    tuple.getT2(),
                    tuple.getT3()
                ));

        // Total time: ~100ms (max of all operations)
        // Thread is freed immediately, handles other requests
    }
}
```

**Benefits:**
- ✅ Operations run concurrently
- ✅ Thread freed immediately
- ✅ Better resource utilization
- ✅ Handles more concurrent requests

## Project Reactor: The Foundation

Project Reactor is the reactive library powering Spring WebFlux. It implements the **Reactive Streams specification**.

### Core Concepts

**1. Publisher** - Emits data
**2. Subscriber** - Consumes data
**3. Subscription** - Connection between publisher and subscriber
**4. Backpressure** - Subscriber controls emission rate

### Reactor's Two Main Types

#### Mono<T> - 0 or 1 Element

```java
// Mono represents a stream of 0 or 1 elements
public class MonoExamples {

    // Mono with a single value
    Mono<String> mono = Mono.just("Hello");

    // Empty Mono
    Mono<String> empty = Mono.empty();

    // Mono with error
    Mono<String> error = Mono.error(new RuntimeException("Failed"));

    // Mono from Callable (lazy evaluation)
    Mono<String> fromCallable = Mono.fromCallable(() -> {
        // Executed only when subscribed
        return expensiveOperation();
    });

    // Mono from CompletableFuture
    CompletableFuture<String> future = CompletableFuture.supplyAsync(() -> "Async");
    Mono<String> fromFuture = Mono.fromFuture(future);
}
```

**Use Cases for Mono:**
- Single database record lookup
- HTTP request/response
- Cache get/put operations
- Single computation result

#### Flux<T> - 0 to N Elements

```java
// Flux represents a stream of 0 to N elements
public class FluxExamples {

    // Flux with multiple values
    Flux<Integer> numbers = Flux.just(1, 2, 3, 4, 5);

    // Flux from array
    Flux<String> fromArray = Flux.fromArray(new String[]{"A", "B", "C"});

    // Flux from collection
    List<String> list = Arrays.asList("X", "Y", "Z");
    Flux<String> fromList = Flux.fromIterable(list);

    // Flux with range
    Flux<Integer> range = Flux.range(1, 100);  // 1 to 100

    // Infinite Flux
    Flux<Long> interval = Flux.interval(Duration.ofSeconds(1));

    // Empty Flux
    Flux<String> empty = Flux.empty();
}
```

**Use Cases for Flux:**
- Database query results (multiple rows)
- Real-time data streams (stock prices, sensor data)
- File reading (line by line)
- Pagination results
- Event streams

## Creating Publishers

### Basic Creation

```java
@Service
public class DataService {

    // 1. Creating Mono
    public Mono<User> findUserById(Long id) {
        return Mono.just(new User(id, "John Doe"));
    }

    // 2. Creating empty Mono
    public Mono<User> findUserByEmail(String email) {
        // Return empty if not found
        return Mono.empty();
    }

    // 3. Creating Mono with error
    public Mono<User> findUserOrError(Long id) {
        if (id == null) {
            return Mono.error(new IllegalArgumentException("ID cannot be null"));
        }
        return Mono.just(new User(id, "Jane"));
    }

    // 4. Creating Flux
    public Flux<User> findAllUsers() {
        return Flux.just(
            new User(1L, "Alice"),
            new User(2L, "Bob"),
            new User(3L, "Charlie")
        );
    }

    // 5. Creating Flux from database
    @Autowired
    private UserRepository userRepository;  // R2DBC repository

    public Flux<User> findAllUsersFromDb() {
        return userRepository.findAll();
    }
}
```

### Deferred Creation (Lazy)

```java
public class DeferredCreation {

    // WRONG: Executes immediately (eager)
    public Mono<String> eagerMono() {
        String result = expensiveOperation();  // Executes NOW
        return Mono.just(result);
    }

    // CORRECT: Executes only when subscribed (lazy)
    public Mono<String> lazyMono() {
        return Mono.fromCallable(() -> {
            return expensiveOperation();  // Executes on subscription
        });
    }

    // Defer creation of entire Mono
    public Mono<String> deferredMono() {
        return Mono.defer(() -> {
            // Entire Mono created fresh on each subscription
            if (someCondition()) {
                return Mono.just("Value A");
            } else {
                return Mono.error(new RuntimeException("Failed"));
            }
        });
    }

    private String expensiveOperation() {
        // Simulate expensive operation
        try {
            Thread.sleep(1000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        return "Result";
    }
}
```

**Critical Difference:**
```java
// Eager: Operation executes 3 times immediately
Mono<String> eager = Mono.just(expensiveOperation());
eager.subscribe();  // Uses cached result
eager.subscribe();  // Uses cached result
eager.subscribe();  // Uses cached result

// Lazy: Operation executes on each subscription
Mono<String> lazy = Mono.fromCallable(() -> expensiveOperation());
lazy.subscribe();  // Executes operation (1st time)
lazy.subscribe();  // Executes operation (2nd time)
lazy.subscribe();  // Executes operation (3rd time)
```

## Subscribing to Publishers

Nothing happens until you **subscribe**! This is a fundamental concept.

```java
public class SubscriptionExamples {

    public void demonstrateSubscription() {
        // 1. Basic subscription
        Mono<String> mono = Mono.just("Hello");

        // NO OUTPUT - nothing happens!
        mono.map(String::toUpperCase);

        // OUTPUT: HELLO - subscription triggers execution
        mono.map(String::toUpperCase)
            .subscribe(System.out::println);

        // 2. Subscribe with consumer
        Flux.range(1, 5)
            .subscribe(
                value -> System.out.println("Received: " + value)
            );

        // 3. Subscribe with consumer and error handler
        Flux.range(1, 5)
            .map(i -> {
                if (i == 3) throw new RuntimeException("Error at 3");
                return i;
            })
            .subscribe(
                value -> System.out.println("Value: " + value),
                error -> System.err.println("Error: " + error.getMessage())
            );

        // 4. Subscribe with consumer, error handler, and completion
        Flux.range(1, 3)
            .subscribe(
                value -> System.out.println("Value: " + value),
                error -> System.err.println("Error: " + error),
                () -> System.out.println("Completed!")
            );

        // Output:
        // Value: 1
        // Value: 2
        // Value: 3
        // Completed!
    }
}
```

### Subscription Lifecycle

```java
public class SubscriptionLifecycle {

    public void demonstrateLifecycle() {
        Flux<Integer> flux = Flux.range(1, 5)
            .doOnSubscribe(sub ->
                System.out.println("1. Subscribed!"))
            .doOnNext(value ->
                System.out.println("2. Processing: " + value))
            .doOnComplete(() ->
                System.out.println("3. Completed!"))
            .doOnError(err ->
                System.out.println("4. Error: " + err))
            .doFinally(signal ->
                System.out.println("5. Finally: " + signal));

        flux.subscribe();

        // Output:
        // 1. Subscribed!
        // 2. Processing: 1
        // 2. Processing: 2
        // 2. Processing: 3
        // 2. Processing: 4
        // 2. Processing: 5
        // 3. Completed!
        // 5. Finally: onComplete
    }
}
```

## Basic Operators

Operators transform data in the stream.

### map() - Transform each element

```java
public class MapOperator {

    public void demonstrateMap() {
        // Transform strings to uppercase
        Flux.just("hello", "world")
            .map(String::toUpperCase)
            .subscribe(System.out::println);
        // Output: HELLO, WORLD

        // Transform objects
        Flux.just(1, 2, 3)
            .map(num -> new User(num.longValue(), "User" + num))
            .subscribe(user -> System.out.println(user.getName()));
        // Output: User1, User2, User3
    }

    // Real-world example: DTO conversion
    public Flux<UserDTO> getAllUsersAsDTO() {
        return userRepository.findAll()
            .map(this::convertToDTO);
    }

    private UserDTO convertToDTO(User user) {
        return new UserDTO(
            user.getId(),
            user.getName(),
            user.getEmail()
        );
    }
}
```

### filter() - Keep only matching elements

```java
public class FilterOperator {

    public void demonstrateFilter() {
        // Filter even numbers
        Flux.range(1, 10)
            .filter(num -> num % 2 == 0)
            .subscribe(System.out::println);
        // Output: 2, 4, 6, 8, 10

        // Filter active users
        userRepository.findAll()
            .filter(user -> user.isActive())
            .subscribe(user -> System.out.println(user.getName()));
    }

    // Real-world: Filter and transform
    public Flux<UserDTO> getActiveUsersAsDTO() {
        return userRepository.findAll()
            .filter(User::isActive)
            .filter(user -> user.getAge() >= 18)
            .map(this::convertToDTO);
    }
}
```

### flatMap() - Transform and flatten

```java
public class FlatMapOperator {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrderRepository orderRepository;

    // WRONG: This doesn't work!
    public Flux<Order> getAllOrdersWrong() {
        return userRepository.findAll()
            .map(user -> orderRepository.findByUserId(user.getId()));
            // Returns Flux<Flux<Order>> - WRONG!
    }

    // CORRECT: Use flatMap to flatten
    public Flux<Order> getAllOrders() {
        return userRepository.findAll()
            .flatMap(user -> orderRepository.findByUserId(user.getId()));
            // Returns Flux<Order> - CORRECT!
    }

    // Real-world: Get users with their orders
    public Flux<UserWithOrders> getUsersWithOrders() {
        return userRepository.findAll()
            .flatMap(user ->
                orderRepository.findByUserId(user.getId())
                    .collectList()  // Collect orders into List
                    .map(orders -> new UserWithOrders(user, orders))
            );
    }
}
```

**map vs flatMap:**
```java
// map: 1 input → 1 output (same type or different)
Flux<String> names = users.map(User::getName);  // User → String

// flatMap: 1 input → 0..N outputs (reactive type)
Flux<Order> orders = users.flatMap(user ->
    orderRepository.findByUserId(user.getId())  // User → Flux<Order>
);
```

## Error Handling

Reactive streams need robust error handling.

```java
@Service
public class ErrorHandlingService {

    // 1. Handle error and provide fallback value
    public Mono<User> findUserWithFallback(Long id) {
        return userRepository.findById(id)
            .onErrorReturn(new User(0L, "Guest User"));
    }

    // 2. Handle error and execute fallback Mono
    public Mono<User> findUserWithFallbackMono(Long id) {
        return userRepository.findById(id)
            .onErrorResume(error -> {
                log.error("Error finding user: {}", error.getMessage());
                return findDefaultUser();
            });
    }

    // 3. Transform error
    public Mono<User> findUserWithCustomError(Long id) {
        return userRepository.findById(id)
            .onErrorMap(error ->
                new UserNotFoundException("User not found: " + id, error)
            );
    }

    // 4. Retry on error
    public Mono<User> findUserWithRetry(Long id) {
        return userRepository.findById(id)
            .retry(3);  // Retry up to 3 times
    }

    // 5. Retry with backoff
    public Mono<User> findUserWithBackoff(Long id) {
        return userRepository.findById(id)
            .retryWhen(Retry.backoff(3, Duration.ofSeconds(1))
                .maxBackoff(Duration.ofSeconds(10))
            );
    }

    // 6. Handle specific errors differently
    public Mono<User> findUserWithSpecificHandling(Long id) {
        return userRepository.findById(id)
            .onErrorResume(DatabaseException.class, e -> {
                log.error("Database error: {}", e.getMessage());
                return Mono.empty();
            })
            .onErrorResume(NetworkException.class, e -> {
                log.error("Network error, retrying...");
                return findUserWithRetry(id);
            });
    }
}
```

## Practical Example: REST API

Let's build a complete reactive REST API.

```java
// Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Product {
    private Long id;
    private String name;
    private BigDecimal price;
    private String category;
    private boolean inStock;
}

// Repository (R2DBC)
@Repository
public interface ProductRepository extends ReactiveCrudRepository<Product, Long> {
    Flux<Product> findByCategory(String category);
    Flux<Product> findByInStockTrue();
    Mono<Product> findByName(String name);
}

// Service
@Service
@Slf4j
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    public Mono<Product> createProduct(Product product) {
        return productRepository.save(product)
            .doOnSuccess(p -> log.info("Created product: {}", p.getId()))
            .doOnError(e -> log.error("Failed to create product", e));
    }

    public Mono<Product> getProductById(Long id) {
        return productRepository.findById(id)
            .switchIfEmpty(Mono.error(
                new ProductNotFoundException("Product not found: " + id)
            ));
    }

    public Flux<Product> getAllProducts() {
        return productRepository.findAll()
            .doOnComplete(() -> log.info("Retrieved all products"));
    }

    public Flux<Product> getProductsByCategory(String category) {
        return productRepository.findByCategory(category)
            .filter(Product::isInStock)
            .sort(Comparator.comparing(Product::getPrice));
    }

    public Mono<Product> updateProduct(Long id, Product product) {
        return productRepository.findById(id)
            .flatMap(existing -> {
                existing.setName(product.getName());
                existing.setPrice(product.getPrice());
                existing.setCategory(product.getCategory());
                existing.setInStock(product.isInStock());
                return productRepository.save(existing);
            })
            .switchIfEmpty(Mono.error(
                new ProductNotFoundException("Product not found: " + id)
            ));
    }

    public Mono<Void> deleteProduct(Long id) {
        return productRepository.findById(id)
            .flatMap(product -> productRepository.delete(product))
            .switchIfEmpty(Mono.error(
                new ProductNotFoundException("Product not found: " + id)
            ));
    }
}

// Controller
@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductService productService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Mono<Product> createProduct(@RequestBody Product product) {
        return productService.createProduct(product);
    }

    @GetMapping("/{id}")
    public Mono<Product> getProduct(@PathVariable Long id) {
        return productService.getProductById(id);
    }

    @GetMapping
    public Flux<Product> getAllProducts() {
        return productService.getAllProducts();
    }

    @GetMapping("/category/{category}")
    public Flux<Product> getProductsByCategory(@PathVariable String category) {
        return productService.getProductsByCategory(category);
    }

    @PutMapping("/{id}")
    public Mono<Product> updateProduct(
            @PathVariable Long id,
            @RequestBody Product product) {
        return productService.updateProduct(id, product);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public Mono<Void> deleteProduct(@PathVariable Long id) {
        return productService.deleteProduct(id);
    }
}
```

## Testing Reactive Code

```java
@SpringBootTest
public class ProductServiceTest {

    @Autowired
    private ProductService productService;

    @Test
    public void testCreateProduct() {
        Product product = new Product(null, "Laptop",
            new BigDecimal("999.99"), "Electronics", true);

        StepVerifier.create(productService.createProduct(product))
            .assertNext(p -> {
                assertThat(p.getId()).isNotNull();
                assertThat(p.getName()).isEqualTo("Laptop");
                assertThat(p.getPrice()).isEqualTo(new BigDecimal("999.99"));
            })
            .verifyComplete();
    }

    @Test
    public void testGetProductById_NotFound() {
        StepVerifier.create(productService.getProductById(999L))
            .expectError(ProductNotFoundException.class)
            .verify();
    }

    @Test
    public void testGetAllProducts() {
        StepVerifier.create(productService.getAllProducts())
            .expectNextCount(3)
            .verifyComplete();
    }
}
```

## Key Takeaways

- **Reactive programming** enables non-blocking, asynchronous applications
- **Mono<T>** represents 0 or 1 element, **Flux<T>** represents 0 to N elements
- **Nothing happens until you subscribe** - this is fundamental!
- Use **map()** for 1:1 transformations, **flatMap()** for 1:N transformations
- **Error handling** is crucial - use onErrorReturn, onErrorResume, retry
- **Lazy evaluation** - use fromCallable() and defer() for expensive operations
- **Testing** with StepVerifier makes reactive testing easy

## What's Next

In Part 2, we'll dive deep into **Operators and Transformations** - learning about advanced operators like merge, zip, concat, reduce, collect, and building complex data transformation pipelines.

**Practice Exercise**: Build a reactive REST API for a simple blog system with Posts, Comments, and Authors. Implement CRUD operations and relationships between entities.
