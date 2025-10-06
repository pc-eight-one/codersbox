---
title: "Spring Boot Reactive Programming - Part 7: Reactive Data Access with R2DBC"
description: "Master reactive database access with R2DBC, Spring Data R2DBC, transactions, query methods, and integrate MongoDB and Redis reactively for production-ready data layers."
publishDate: 2025-10-06
publishedAt: 2025-10-06
tags: ["Spring Boot", "R2DBC", "Spring Data", "PostgreSQL", "MongoDB", "Redis"]
difficulty: "advanced"
series: "Spring Boot Reactive Programming"
part: 7
estimatedTime: "85 minutes"
totalParts: 8
---

# Spring Boot Reactive Programming - Part 7: Reactive Data Access

Building reactive applications requires reactive data access. In this part, we'll master R2DBC for relational databases, Spring Data R2DBC, transactions, and integrate with MongoDB and Redis reactively.

## R2DBC Overview

**R2DBC** (Reactive Relational Database Connectivity) is the reactive alternative to JDBC.

### JDBC vs R2DBC

```java
// JDBC (Blocking)
@Repository
public class JdbcUserRepository {
    @Autowired
    private JdbcTemplate jdbcTemplate;

    public User findById(Long id) {
        // Thread BLOCKS waiting for database
        return jdbcTemplate.queryForObject(
            "SELECT * FROM users WHERE id = ?",
            new Object[]{id},
            new BeanPropertyRowMapper<>(User.class)
        );
    }
}

// R2DBC (Non-blocking)
@Repository
public interface R2dbcUserRepository extends ReactiveCrudRepository<User, Long> {
    // Thread is NEVER blocked
    Mono<User> findById(Long id);
}
```

## Configuration

### Dependencies (pom.xml)

```xml
<dependencies>
    <!-- Spring Data R2DBC -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-r2dbc</artifactId>
    </dependency>

    <!-- PostgreSQL R2DBC Driver -->
    <dependency>
        <groupId>org.postgresql</groupId>
        <artifactId>r2dbc-postgresql</artifactId>
    </dependency>

    <!-- Pool -->
    <dependency>
        <groupId>io.r2dbc</groupId>
        <artifactId>r2dbc-pool</artifactId>
    </dependency>
</dependencies>
```

### Application Properties

```yaml
spring:
  r2dbc:
    url: r2dbc:postgresql://localhost:5432/productdb
    username: postgres
    password: password
    pool:
      initial-size: 10
      max-size: 20
      max-idle-time: 30m
      validation-query: SELECT 1

  liquibase:
    enabled: true
    change-log: classpath:db/changelog/db.changelog-master.yaml
```

### Configuration Class

```java
@Configuration
@EnableR2dbcRepositories
public class R2dbcConfig extends AbstractR2dbcConfiguration {

    @Override
    @Bean
    public ConnectionFactory connectionFactory() {
        ConnectionFactoryOptions options = ConnectionFactoryOptions.builder()
            .option(DRIVER, "postgresql")
            .option(HOST, "localhost")
            .option(PORT, 5432)
            .option(USER, "postgres")
            .option(PASSWORD, "password")
            .option(DATABASE, "productdb")
            .build();

        ConnectionFactory connectionFactory =
            ConnectionFactories.get(options);

        // Connection pooling
        ConnectionPoolConfiguration poolConfig =
            ConnectionPoolConfiguration.builder(connectionFactory)
                .maxIdleTime(Duration.ofMinutes(30))
                .initialSize(10)
                .maxSize(20)
                .maxCreateConnectionTime(Duration.ofSeconds(2))
                .build();

        return new ConnectionPool(poolConfig);
    }

    @Bean
    public R2dbcEntityTemplate r2dbcEntityTemplate(
            DatabaseClient databaseClient) {
        return new R2dbcEntityTemplate(databaseClient);
    }
}
```

## Entity Mapping

```java
@Table("users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    private Long id;

    @Column("full_name")
    private String name;

    private String email;

    @Column("created_at")
    private LocalDateTime createdAt;

    @Column("updated_at")
    private LocalDateTime updatedAt;

    private boolean active;

    @Transient  // Not persisted to database
    private List<Order> orders;
}

@Table("products")
@Data
public class Product {

    @Id
    private Long id;

    private String name;

    private BigDecimal price;

    private String category;

    @Column("in_stock")
    private boolean inStock;

    private Integer quantity;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
```

## Repository Interfaces

```java
@Repository
public interface UserRepository extends ReactiveCrudRepository<User, Long> {

    // Derived query methods
    Mono<User> findByEmail(String email);

    Flux<User> findByNameContaining(String name);

    Flux<User> findByActiveTrue();

    Mono<Boolean> existsByEmail(String email);

    // Query with pagination
    Flux<User> findAllBy(Pageable pageable);

    // Custom query
    @Query("SELECT * FROM users WHERE created_at >= :date")
    Flux<User> findUsersCreatedAfter(LocalDateTime date);

    // Query with parameters
    @Query("SELECT * FROM users WHERE active = :active AND created_at >= :date")
    Flux<User> findActiveUsersCreatedAfter(boolean active, LocalDateTime date);

    // Modifying query
    @Modifying
    @Query("UPDATE users SET active = false WHERE last_login < :date")
    Mono<Integer> deactivateInactiveUsers(LocalDateTime date);

    // Count
    @Query("SELECT COUNT(*) FROM users WHERE active = true")
    Mono<Long> countActiveUsers();
}

@Repository
public interface ProductRepository extends ReactiveCrudRepository<Product, Long> {

    Flux<Product> findByCategory(String category);

    Flux<Product> findByInStockTrue();

    Flux<Product> findByPriceBetween(BigDecimal min, BigDecimal max);

    Flux<Product> findByNameContainingIgnoreCase(String name);

    @Query("SELECT * FROM products WHERE category = :category AND in_stock = true ORDER BY price")
    Flux<Product> findAvailableProductsByCategory(String category);

    // Custom query with join (if relationships exist)
    @Query("SELECT p.* FROM products p WHERE p.category = :category LIMIT :limit")
    Flux<Product> findTopProductsByCategory(String category, int limit);
}
```

## CRUD Operations

```java
@Service
@Slf4j
public class UserService {

    @Autowired
    private UserRepository userRepository;

    // Create
    public Mono<User> createUser(UserDto dto) {
        User user = new User();
        user.setName(dto.getName());
        user.setEmail(dto.getEmail());
        user.setActive(true);
        user.setCreatedAt(LocalDateTime.now());

        return userRepository.save(user)
            .doOnSuccess(saved ->
                log.info("Created user: {}", saved.getId())
            );
    }

    // Read
    public Mono<User> getUserById(Long id) {
        return userRepository.findById(id)
            .switchIfEmpty(Mono.error(
                new NotFoundException("User not found: " + id)
            ));
    }

    // Update
    public Mono<User> updateUser(Long id, UserDto dto) {
        return userRepository.findById(id)
            .flatMap(existing -> {
                existing.setName(dto.getName());
                existing.setEmail(dto.getEmail());
                existing.setUpdatedAt(LocalDateTime.now());
                return userRepository.save(existing);
            })
            .switchIfEmpty(Mono.error(
                new NotFoundException("User not found: " + id)
            ));
    }

    // Delete
    public Mono<Void> deleteUser(Long id) {
        return userRepository.findById(id)
            .flatMap(user -> userRepository.delete(user))
            .switchIfEmpty(Mono.error(
                new NotFoundException("User not found: " + id)
            ));
    }

    // List all
    public Flux<User> getAllUsers() {
        return userRepository.findAll();
    }

    // Pagination
    public Flux<User> getUsersPage(int page, int size) {
        return userRepository.findAllBy(
            PageRequest.of(page, size, Sort.by("createdAt").descending())
        );
    }

    // Search
    public Flux<User> searchUsers(String query) {
        return userRepository.findByNameContaining(query);
    }

    // Batch operations
    public Flux<User> createUsers(List<UserDto> dtos) {
        List<User> users = dtos.stream()
            .map(dto -> {
                User user = new User();
                user.setName(dto.getName());
                user.setEmail(dto.getEmail());
                user.setActive(true);
                return user;
            })
            .collect(Collectors.toList());

        return userRepository.saveAll(users);
    }
}
```

## Database Client (Low-level API)

```java
@Service
public class CustomUserService {

    @Autowired
    private DatabaseClient databaseClient;

    // Custom query with DatabaseClient
    public Flux<User> findUsersByCustomQuery(String namePattern, boolean active) {
        return databaseClient.sql(
                "SELECT * FROM users WHERE name LIKE :pattern AND active = :active"
            )
            .bind("pattern", "%" + namePattern + "%")
            .bind("active", active)
            .map((row, metadata) -> {
                User user = new User();
                user.setId(row.get("id", Long.class));
                user.setName(row.get("full_name", String.class));
                user.setEmail(row.get("email", String.class));
                user.setActive(row.get("active", Boolean.class));
                return user;
            })
            .all();
    }

    // Insert with returning generated ID
    public Mono<User> createUserWithGeneratedId(User user) {
        return databaseClient.sql(
                "INSERT INTO users (full_name, email, active, created_at) " +
                "VALUES (:name, :email, :active, :createdAt) " +
                "RETURNING id"
            )
            .bind("name", user.getName())
            .bind("email", user.getEmail())
            .bind("active", user.isActive())
            .bind("createdAt", user.getCreatedAt())
            .map((row, metadata) -> {
                user.setId(row.get("id", Long.class));
                return user;
            })
            .one();
    }

    // Update
    public Mono<Integer> updateUserEmail(Long userId, String newEmail) {
        return databaseClient.sql(
                "UPDATE users SET email = :email, updated_at = :updatedAt " +
                "WHERE id = :id"
            )
            .bind("email", newEmail)
            .bind("updatedAt", LocalDateTime.now())
            .bind("id", userId)
            .fetch()
            .rowsUpdated();
    }

    // Complex aggregation
    public Flux<UserStatistics> getUserStatistics() {
        return databaseClient.sql(
                "SELECT " +
                "  DATE(created_at) as date, " +
                "  COUNT(*) as user_count, " +
                "  SUM(CASE WHEN active THEN 1 ELSE 0 END) as active_count " +
                "FROM users " +
                "GROUP BY DATE(created_at) " +
                "ORDER BY date DESC"
            )
            .map((row, metadata) -> new UserStatistics(
                row.get("date", LocalDate.class),
                row.get("user_count", Long.class),
                row.get("active_count", Long.class)
            ))
            .all();
    }
}
```

## Transactions

```java
@Service
public class TransactionalService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private TransactionalOperator transactionalOperator;

    // Declarative transaction
    @Transactional
    public Mono<Order> createOrderWithUserUpdate(Long userId, OrderDto orderDto) {
        return userRepository.findById(userId)
            .flatMap(user -> {
                Order order = new Order();
                order.setUserId(userId);
                order.setTotal(orderDto.getTotal());
                order.setStatus(OrderStatus.PENDING);

                return orderRepository.save(order)
                    .flatMap(savedOrder -> {
                        user.setUpdatedAt(LocalDateTime.now());
                        return userRepository.save(user)
                            .thenReturn(savedOrder);
                    });
            });
        // If any operation fails, entire transaction rolls back
    }

    // Programmatic transaction
    public Mono<OrderResult> processOrderProgrammatic(OrderRequest request) {
        return userRepository.findById(request.getUserId())
            .flatMap(user -> {
                Order order = createOrder(request, user);

                return orderRepository.save(order)
                    .flatMap(savedOrder ->
                        updateUserBalance(user, request.getTotal())
                            .thenReturn(new OrderResult(savedOrder))
                    );
            })
            .as(transactionalOperator::transactional)
            .onErrorResume(e -> {
                log.error("Transaction failed, rolling back", e);
                return Mono.just(OrderResult.failed());
            });
    }

    // Multiple operations in transaction
    @Transactional
    public Mono<TransferResult> transferFunds(
            Long fromUserId, Long toUserId, BigDecimal amount) {

        return Mono.zip(
            userRepository.findById(fromUserId),
            userRepository.findById(toUserId)
        )
        .flatMap(tuple -> {
            User fromUser = tuple.getT1();
            User toUser = tuple.getT2();

            // Deduct from source
            // Add to destination
            // (Simplified - real app would have account balance table)

            return Mono.zip(
                userRepository.save(fromUser),
                userRepository.save(toUser)
            )
            .map(savedTuple -> new TransferResult(true, "Success"));
        })
        .onErrorReturn(new TransferResult(false, "Transfer failed"));
    }

    private Order createOrder(OrderRequest request, User user) {
        Order order = new Order();
        order.setUserId(user.getId());
        order.setTotal(request.getTotal());
        return order;
    }

    private Mono<User> updateUserBalance(User user, BigDecimal amount) {
        // Update logic
        return userRepository.save(user);
    }
}
```

## Reactive MongoDB

```java
// Dependencies
/*
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-mongodb-reactive</artifactId>
</dependency>
*/

// Configuration
@Configuration
@EnableReactiveMongoRepositories
public class MongoConfig {

    @Bean
    public ReactiveMongoTemplate reactiveMongoTemplate(
            ReactiveMongoDatabaseFactory factory) {
        return new ReactiveMongoTemplate(factory);
    }
}

// Document
@Document(collection = "products")
@Data
public class ProductDocument {

    @Id
    private String id;

    @Indexed
    private String name;

    private BigDecimal price;

    @Indexed
    private String category;

    private List<String> tags;

    private Map<String, Object> attributes;

    @CreatedDate
    private LocalDateTime createdAt;
}

// Repository
@Repository
public interface ProductMongoRepository
        extends ReactiveMongoRepository<ProductDocument, String> {

    Flux<ProductDocument> findByCategory(String category);

    Flux<ProductDocument> findByTagsContaining(String tag);

    Flux<ProductDocument> findByPriceGreaterThan(BigDecimal price);

    @Query("{ 'category': ?0, 'price': { $lte: ?1 } }")
    Flux<ProductDocument> findByCategoryAndMaxPrice(String category, BigDecimal maxPrice);
}

// Service
@Service
public class ProductMongoService {

    @Autowired
    private ProductMongoRepository repository;

    @Autowired
    private ReactiveMongoTemplate mongoTemplate;

    // Complex query with MongoDB template
    public Flux<ProductDocument> searchProducts(ProductSearchCriteria criteria) {
        Criteria mongoCriteria = new Criteria();

        if (criteria.getCategory() != null) {
            mongoCriteria.and("category").is(criteria.getCategory());
        }

        if (criteria.getMinPrice() != null) {
            mongoCriteria.and("price").gte(criteria.getMinPrice());
        }

        if (criteria.getMaxPrice() != null) {
            mongoCriteria.and("price").lte(criteria.getMaxPrice());
        }

        if (criteria.getTags() != null && !criteria.getTags().isEmpty()) {
            mongoCriteria.and("tags").in(criteria.getTags());
        }

        Query query = new Query(mongoCriteria)
            .with(Sort.by(Sort.Direction.DESC, "createdAt"))
            .limit(100);

        return mongoTemplate.find(query, ProductDocument.class);
    }

    // Aggregation
    public Flux<CategoryStats> getCategoryStatistics() {
        Aggregation aggregation = Aggregation.newAggregation(
            Aggregation.group("category")
                .count().as("count")
                .avg("price").as("avgPrice")
                .min("price").as("minPrice")
                .max("price").as("maxPrice"),
            Aggregation.sort(Sort.Direction.DESC, "count")
        );

        return mongoTemplate.aggregate(
            aggregation,
            "products",
            CategoryStats.class
        );
    }
}
```

## Reactive Redis

```java
// Dependencies
/*
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis-reactive</artifactId>
</dependency>
*/

// Configuration
@Configuration
public class RedisConfig {

    @Bean
    public ReactiveRedisConnectionFactory reactiveRedisConnectionFactory() {
        return new LettuceConnectionFactory("localhost", 6379);
    }

    @Bean
    public ReactiveRedisTemplate<String, Object> reactiveRedisTemplate(
            ReactiveRedisConnectionFactory factory) {

        RedisSerializationContext<String, Object> serializationContext =
            RedisSerializationContext
                .<String, Object>newSerializationContext(new StringRedisSerializer())
                .value(new GenericJackson2JsonRedisSerializer())
                .build();

        return new ReactiveRedisTemplate<>(factory, serializationContext);
    }
}

// Cache Service
@Service
@Slf4j
public class RedisCacheService {

    @Autowired
    private ReactiveRedisTemplate<String, Object> redisTemplate;

    // Set value with TTL
    public <T> Mono<Boolean> set(String key, T value, Duration ttl) {
        return redisTemplate.opsForValue()
            .set(key, value, ttl)
            .doOnSuccess(result ->
                log.debug("Cached: {} = {}", key, value)
            );
    }

    // Get value
    public <T> Mono<T> get(String key, Class<T> type) {
        return redisTemplate.opsForValue()
            .get(key)
            .cast(type)
            .doOnNext(value ->
                log.debug("Cache hit: {} = {}", key, value)
            );
    }

    // Delete
    public Mono<Boolean> delete(String key) {
        return redisTemplate.delete(key)
            .map(count -> count > 0);
    }

    // Check exists
    public Mono<Boolean> exists(String key) {
        return redisTemplate.hasKey(key);
    }

    // List operations
    public Mono<Long> pushToList(String key, Object value) {
        return redisTemplate.opsForList().rightPush(key, value);
    }

    public Flux<Object> getList(String key) {
        return redisTemplate.opsForList().range(key, 0, -1);
    }

    // Set operations
    public Mono<Long> addToSet(String key, Object... values) {
        return redisTemplate.opsForSet().add(key, values);
    }

    public Flux<Object> getSet(String key) {
        return redisTemplate.opsForSet().members(key);
    }

    // Hash operations
    public Mono<Boolean> setHash(String key, String field, Object value) {
        return redisTemplate.opsForHash()
            .put(key, field, value);
    }

    public Mono<Object> getHash(String key, String field) {
        return redisTemplate.opsForHash()
            .get(key, field);
    }

    // Increment
    public Mono<Long> increment(String key) {
        return redisTemplate.opsForValue().increment(key);
    }

    // Expire
    public Mono<Boolean> expire(String key, Duration timeout) {
        return redisTemplate.expire(key, timeout);
    }
}

// Service with caching
@Service
public class CachedUserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RedisCacheService cacheService;

    public Mono<User> getUserById(Long id) {
        String cacheKey = "user:" + id;

        return cacheService.get(cacheKey, User.class)
            .switchIfEmpty(
                userRepository.findById(id)
                    .flatMap(user ->
                        cacheService.set(cacheKey, user, Duration.ofMinutes(10))
                            .thenReturn(user)
                    )
            );
    }

    public Mono<User> updateUser(Long id, UserDto dto) {
        return userRepository.findById(id)
            .flatMap(user -> {
                user.setName(dto.getName());
                user.setEmail(dto.getEmail());
                return userRepository.save(user);
            })
            .flatMap(updated ->
                cacheService.delete("user:" + id)
                    .thenReturn(updated)
            );
    }
}
```

## Key Takeaways

- **R2DBC** provides reactive database access for SQL databases
- **Spring Data R2DBC** offers repository abstraction
- **Transactions** work with `@Transactional` or `TransactionalOperator`
- **DatabaseClient** for custom queries and complex operations
- **MongoDB Reactive** for document-based reactive storage
- **Redis Reactive** for caching and session management
- **Connection pooling** is critical for performance
- **Always use reactive drivers** to maintain non-blocking benefits

## What's Next

In Part 8 (final part), we'll cover **Testing, Debugging, and Production** - comprehensive testing strategies with StepVerifier and WebTestClient, debugging reactive code, production monitoring, and deployment best practices.

**Practice Exercise**: Build a complete reactive data layer:
1. User management with R2DBC (PostgreSQL)
2. Product catalog with MongoDB
3. Caching layer with Redis
4. Transactions for order processing
5. Complex queries and aggregations
6. Proper error handling and logging
