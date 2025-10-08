---
title: "ByteBuddy with Java - Part 2: Advanced Method Interception and Field Access"
description: "Master ByteBuddy method interception: access fields, modify arguments, handle exceptions, and create custom annotations. Build annotation-driven behavior."
publishDate: 2025-10-07
tags: ["ByteBuddy", "Java", "Bytecode", "Annotations", "AOP", "Interception"]
difficulty: "intermediate"
series: "ByteBuddy with Java"
part: 2
estimatedTime: "30 minutes"
totalParts: 5
---

# ByteBuddy with Java - Part 2: Advanced Method Interception and Field Access

Part 1 covered basic interception with `FixedValue` and `MethodDelegation`. Part 2 dives deeper: access instance fields, modify arguments, handle exceptions, and create annotation-driven interceptors.

## What You'll Build

An annotation-driven caching system:

```java
public class ProductService {

    @Cached(ttl = 60)
    public Product getProduct(String id) {
        // Expensive database call
        return database.findProduct(id);
    }
}
```

ByteBuddy intercepts `@Cached` methods and adds caching automatically:

```
First call:  getProduct("123") -> Database query (150ms)
Second call: getProduct("123") -> Cache hit (1ms)
Third call:  getProduct("456") -> Database query (150ms)
Fourth call: getProduct("456") -> Cache hit (1ms)
```

## Binding Method Parameters

Part 1 used `@AllArguments` to capture all parameters. ByteBuddy provides fine-grained parameter binding.

### Parameter Binding Annotations

```java
import net.bytebuddy.implementation.bind.annotation.*;

public class ParameterInterceptor {

    @RuntimeType
    public Object intercept(
        @This Object instance,              // Intercepted object instance
        @Origin Method method,              // Method being called
        @AllArguments Object[] args,        // All arguments as array
        @Argument(0) String firstArg,       // First argument (typed)
        @SuperCall Callable<?> superCall,   // Callable to invoke original
        @Super Object superInstance         // Super instance for method calls
    ) throws Exception {
        return superCall.call();
    }
}
```

**Common annotations:**

| Annotation | Purpose | Example |
|------------|---------|---------|
| `@This` | Current instance | Access instance fields |
| `@Origin` | Method/Constructor | Get method name, annotations |
| `@AllArguments` | All args as array | Validate or log all params |
| `@Argument(index)` | Specific argument | Access first param: `@Argument(0)` |
| `@SuperCall` | Call original method | Invoke super implementation |
| `@Super` | Super instance | Call other super methods |
| `@FieldValue("name")` | Read field | Access private field |

### Example: Argument Validation

```java
package com.example;

import net.bytebuddy.implementation.bind.annotation.*;
import java.lang.reflect.Method;
import java.util.concurrent.Callable;

public class ValidationInterceptor {

    @RuntimeType
    public Object intercept(@Origin Method method,
                           @AllArguments Object[] args,
                           @SuperCall Callable<?> superCall) throws Exception {

        // Validate arguments
        for (int i = 0; i < args.length; i++) {
            if (args[i] == null) {
                throw new IllegalArgumentException(
                    method.getName() + " argument " + i + " cannot be null"
                );
            }
        }

        return superCall.call();
    }
}
```

**Usage:**

```java
Class<? extends UserService> validated = new ByteBuddy()
    .subclass(UserService.class)
    .method(ElementMatchers.any())
    .intercept(MethodDelegation.to(new ValidationInterceptor()))
    .make()
    .load(getClass().getClassLoader())
    .getLoaded();

UserService service = validated.getDeclaredConstructor().newInstance();
service.getUser(null);  // Throws: IllegalArgumentException
```

## Accessing and Modifying Fields

ByteBuddy can read and write instance fields from interceptors.

### Reading Fields with @FieldValue

```java
package com.example;

public class Counter {
    private int count = 0;

    public void increment() {
        count++;
    }

    public int getCount() {
        return count;
    }
}
```

**Interceptor that reads field:**

```java
package com.example;

import net.bytebuddy.implementation.bind.annotation.*;
import java.util.concurrent.Callable;

public class FieldAccessInterceptor {

    @RuntimeType
    public Object intercept(@FieldValue("count") int currentCount,
                           @SuperCall Callable<?> superCall) throws Exception {

        System.out.println("Before: count = " + currentCount);
        Object result = superCall.call();
        return result;
    }
}
```

**Creating proxy:**

```java
Class<? extends Counter> proxyClass = new ByteBuddy()
    .subclass(Counter.class)
    .method(ElementMatchers.named("increment"))
    .intercept(MethodDelegation.to(new FieldAccessInterceptor()))
    .make()
    .load(getClass().getClassLoader())
    .getLoaded();

Counter counter = proxyClass.getDeclaredConstructor().newInstance();
counter.increment();  // Before: count = 0
counter.increment();  // Before: count = 1
counter.increment();  // Before: count = 2
```

### Writing Fields with FieldAccessor

ByteBuddy provides `FieldAccessor` for direct field manipulation:

```java
import net.bytebuddy.implementation.FieldAccessor;

Class<?> dynamicClass = new ByteBuddy()
    .subclass(Object.class)
    .defineField("value", String.class, Visibility.PRIVATE)
    .defineMethod("getValue", String.class, Visibility.PUBLIC)
    .intercept(FieldAccessor.ofField("value"))
    .defineMethod("setValue", void.class, Visibility.PUBLIC)
    .withParameters(String.class)
    .intercept(FieldAccessor.ofField("value"))
    .make()
    .load(getClass().getClassLoader())
    .getLoaded();

Object instance = dynamicClass.getDeclaredConstructor().newInstance();

// Call generated setter
Method setter = dynamicClass.getMethod("setValue", String.class);
setter.invoke(instance, "Hello");

// Call generated getter
Method getter = dynamicClass.getMethod("getValue");
System.out.println(getter.invoke(instance));  // "Hello"
```

This generates equivalent to:

```java
public class Generated {
    private String value;

    public String getValue() {
        return value;
    }

    public void setValue(String value) {
        this.value = value;
    }
}
```

## Exception Handling

Interceptors can catch and handle exceptions from original methods.

### Try-Catch Interception

```java
package com.example;

import net.bytebuddy.implementation.bind.annotation.*;
import java.lang.reflect.Method;
import java.util.concurrent.Callable;

public class ExceptionHandlingInterceptor {

    @RuntimeType
    public Object intercept(@Origin Method method,
                           @SuperCall Callable<?> superCall) throws Exception {
        try {
            return superCall.call();
        } catch (Exception e) {
            System.err.println("[ERROR] " + method.getName() + " threw " +
                             e.getClass().getSimpleName() + ": " + e.getMessage());

            // Log, retry, or return default value
            if (method.getReturnType().equals(String.class)) {
                return "DEFAULT";
            }
            throw e;
        }
    }
}
```

**Service with exceptions:**

```java
public class OrderService {

    public String getOrder(int id) {
        if (id < 0) {
            throw new IllegalArgumentException("Invalid ID");
        }
        return "Order[" + id + "]";
    }
}
```

**Creating resilient proxy:**

```java
Class<? extends OrderService> resilient = new ByteBuddy()
    .subclass(OrderService.class)
    .method(ElementMatchers.any())
    .intercept(MethodDelegation.to(new ExceptionHandlingInterceptor()))
    .make()
    .load(getClass().getClassLoader())
    .getLoaded();

OrderService service = resilient.getDeclaredConstructor().newInstance();
String result = service.getOrder(-1);
// Logs: [ERROR] getOrder threw IllegalArgumentException: Invalid ID
// Returns: "DEFAULT"
```

## Annotation-Driven Interception

Real-world frameworks use annotations to trigger behavior. Let's build a caching system driven by `@Cached`.

### Custom Annotation

```java
package com.example;

import java.lang.annotation.*;

@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
public @interface Cached {
    int ttl() default 300;  // Time-to-live in seconds
}
```

### Cache Implementation

```java
package com.example;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class CacheStore {

    private static final Map<String, CacheEntry> cache = new ConcurrentHashMap<>();

    public static Object get(String key) {
        CacheEntry entry = cache.get(key);
        if (entry != null && !entry.isExpired()) {
            System.out.println("[CACHE HIT] " + key);
            return entry.value;
        }
        System.out.println("[CACHE MISS] " + key);
        return null;
    }

    public static void put(String key, Object value, int ttlSeconds) {
        cache.put(key, new CacheEntry(value, ttlSeconds));
    }

    private static class CacheEntry {
        final Object value;
        final long expiresAt;

        CacheEntry(Object value, int ttlSeconds) {
            this.value = value;
            this.expiresAt = System.currentTimeMillis() + (ttlSeconds * 1000L);
        }

        boolean isExpired() {
            return System.currentTimeMillis() > expiresAt;
        }
    }
}
```

### Caching Interceptor

```java
package com.example;

import net.bytebuddy.implementation.bind.annotation.*;
import java.lang.reflect.Method;
import java.util.Arrays;
import java.util.concurrent.Callable;

public class CachingInterceptor {

    @RuntimeType
    public Object intercept(@Origin Method method,
                           @AllArguments Object[] args,
                           @SuperCall Callable<?> superCall) throws Exception {

        // Check if method has @Cached annotation
        Cached cached = method.getAnnotation(Cached.class);
        if (cached == null) {
            return superCall.call();
        }

        // Generate cache key
        String cacheKey = method.getName() + ":" + Arrays.toString(args);

        // Check cache
        Object cachedValue = CacheStore.get(cacheKey);
        if (cachedValue != null) {
            return cachedValue;
        }

        // Cache miss - call original method
        Object result = superCall.call();

        // Store in cache
        CacheStore.put(cacheKey, result, cached.ttl());

        return result;
    }
}
```

### Service with Caching

```java
package com.example;

public class ProductService {

    @Cached(ttl = 60)
    public String getProduct(String id) {
        System.out.println("[DATABASE] Fetching product " + id);
        simulateSlowQuery();
        return "Product[id=" + id + ", name=Widget]";
    }

    public String getUncachedProduct(String id) {
        System.out.println("[DATABASE] Fetching uncached product " + id);
        return "Product[id=" + id + "]";
    }

    private void simulateSlowQuery() {
        try {
            Thread.sleep(100);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}
```

### Creating Cached Proxy

```java
package com.example;

import net.bytebuddy.ByteBuddy;
import net.bytebuddy.implementation.MethodDelegation;
import net.bytebuddy.matcher.ElementMatchers;

public class CachingExample {

    public static void main(String[] args) throws Exception {
        Class<? extends ProductService> cached = new ByteBuddy()
            .subclass(ProductService.class)
            .method(ElementMatchers.isAnnotatedWith(Cached.class))
            .intercept(MethodDelegation.to(new CachingInterceptor()))
            .make()
            .load(CachingExample.class.getClassLoader())
            .getLoaded();

        ProductService service = cached.getDeclaredConstructor().newInstance();

        // First call - cache miss
        long start1 = System.currentTimeMillis();
        service.getProduct("123");
        System.out.println("Duration: " + (System.currentTimeMillis() - start1) + "ms\n");

        // Second call - cache hit
        long start2 = System.currentTimeMillis();
        service.getProduct("123");
        System.out.println("Duration: " + (System.currentTimeMillis() - start2) + "ms\n");

        // Different argument - cache miss
        long start3 = System.currentTimeMillis();
        service.getProduct("456");
        System.out.println("Duration: " + (System.currentTimeMillis() - start3) + "ms\n");

        // Uncached method - always executes
        service.getUncachedProduct("789");
        service.getUncachedProduct("789");
    }
}
```

**Output:**

```
[CACHE MISS] getProduct:[123]
[DATABASE] Fetching product 123
Duration: 105ms

[CACHE HIT] getProduct:[123]
Duration: 1ms

[CACHE MISS] getProduct:[456]
[DATABASE] Fetching product 456
Duration: 103ms

[DATABASE] Fetching uncached product 789
[DATABASE] Fetching uncached product 789
```

### How Annotation Matching Works

![Diagram 1](/diagrams/bytebuddy-java-part-2-diagram-1.svg)

ByteBuddy processes annotations during class generation:

1. `isAnnotatedWith(Cached.class)` scans methods for `@Cached`
2. Only matching methods get intercepted
3. At runtime, interceptor checks annotation with `method.getAnnotation(Cached.class)`
4. Annotation parameters (like `ttl`) control behavior

## Combining Multiple Interceptors

Real applications need multiple cross-cutting concerns: logging, caching, validation, timing.

### Multiple Annotations

```java
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
public @interface Timed {
}

@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
public @interface Logged {
}
```

### Timing Interceptor

```java
package com.example;

import net.bytebuddy.implementation.bind.annotation.*;
import java.lang.reflect.Method;
import java.util.concurrent.Callable;

public class TimingInterceptor {

    @RuntimeType
    public Object intercept(@Origin Method method,
                           @SuperCall Callable<?> superCall) throws Exception {

        long start = System.nanoTime();
        Object result = superCall.call();
        long duration = System.nanoTime() - start;

        System.out.println("[TIMING] " + method.getName() +
                         " took " + (duration / 1_000_000) + "ms");
        return result;
    }
}
```

### Stacking Interceptors

```java
Class<? extends ProductService> enhanced = new ByteBuddy()
    .subclass(ProductService.class)
    .method(ElementMatchers.isAnnotatedWith(Cached.class))
    .intercept(MethodDelegation.to(new CachingInterceptor()))
    .method(ElementMatchers.isAnnotatedWith(Timed.class))
    .intercept(MethodDelegation.to(new TimingInterceptor()))
    .method(ElementMatchers.isAnnotatedWith(Logged.class))
    .intercept(MethodDelegation.to(new LoggingInterceptor()))
    .make()
    .load(classLoader)
    .getLoaded();
```

**Service with multiple annotations:**

```java
public class OrderService {

    @Cached(ttl = 60)
    @Timed
    @Logged
    public Order getOrder(String id) {
        return database.find(id);
    }
}
```

**Execution order:**

```
1. LoggingInterceptor logs call
2. TimingInterceptor starts timer
3. CachingInterceptor checks cache
4. Original method executes (if cache miss)
5. CachingInterceptor stores result
6. TimingInterceptor logs duration
7. LoggingInterceptor logs result
```

## Advanced: Modifying Arguments

ByteBuddy can modify arguments before calling original methods.

### Argument Transformation

```java
package com.example;

import net.bytebuddy.implementation.bind.annotation.*;
import java.lang.reflect.Method;
import java.util.concurrent.Callable;

public class ArgumentTransformInterceptor {

    @RuntimeType
    public Object intercept(@Origin Method method,
                           @AllArguments Object[] args,
                           @This Object instance) throws Exception {

        // Transform arguments
        for (int i = 0; i < args.length; i++) {
            if (args[i] instanceof String) {
                args[i] = ((String) args[i]).trim().toLowerCase();
            }
        }

        // Call with modified arguments
        return method.invoke(instance, args);
    }
}
```

This normalizes string arguments:

```java
service.findUser("  JOHN  ");  // Transformed to "john"
```

## Testing

```java
package com.example;

import net.bytebuddy.ByteBuddy;
import net.bytebuddy.implementation.MethodDelegation;
import net.bytebuddy.matcher.ElementMatchers;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class AdvancedInterceptionTest {

    @Test
    void testCachingInterceptor() throws Exception {
        Class<? extends ProductService> cached = new ByteBuddy()
            .subclass(ProductService.class)
            .method(ElementMatchers.isAnnotatedWith(Cached.class))
            .intercept(MethodDelegation.to(new CachingInterceptor()))
            .make()
            .load(getClass().getClassLoader())
            .getLoaded();

        ProductService service = cached.getDeclaredConstructor().newInstance();

        // First call - slow
        long start1 = System.currentTimeMillis();
        String result1 = service.getProduct("123");
        long duration1 = System.currentTimeMillis() - start1;

        // Second call - fast (cached)
        long start2 = System.currentTimeMillis();
        String result2 = service.getProduct("123");
        long duration2 = System.currentTimeMillis() - start2;

        assertEquals(result1, result2);
        assertTrue(duration2 < duration1);
    }

    @Test
    void testFieldAccess() throws Exception {
        Class<? extends Counter> instrumented = new ByteBuddy()
            .subclass(Counter.class)
            .method(ElementMatchers.named("increment"))
            .intercept(MethodDelegation.to(new FieldAccessInterceptor()))
            .make()
            .load(getClass().getClassLoader())
            .getLoaded();

        Counter counter = instrumented.getDeclaredConstructor().newInstance();
        counter.increment();
        counter.increment();

        assertEquals(2, counter.getCount());
    }

    @Test
    void testExceptionHandling() throws Exception {
        Class<? extends OrderService> resilient = new ByteBuddy()
            .subclass(OrderService.class)
            .method(ElementMatchers.any())
            .intercept(MethodDelegation.to(new ExceptionHandlingInterceptor()))
            .make()
            .load(getClass().getClassLoader())
            .getLoaded();

        OrderService service = resilient.getDeclaredConstructor().newInstance();
        String result = service.getOrder(-1);

        assertEquals("DEFAULT", result);
    }
}
```

Run tests:

```bash
mvn test
```

## Common Patterns

### Pattern 1: Retry Logic

```java
public class RetryInterceptor {

    @RuntimeType
    public Object intercept(@SuperCall Callable<?> superCall) throws Exception {
        int attempts = 0;
        while (attempts < 3) {
            try {
                return superCall.call();
            } catch (Exception e) {
                attempts++;
                if (attempts >= 3) throw e;
                Thread.sleep(1000 * attempts);
            }
        }
        throw new IllegalStateException("Should not reach");
    }
}
```

### Pattern 2: Async Execution

```java
public class AsyncInterceptor {

    @RuntimeType
    public Future<?> intercept(@SuperCall Callable<?> superCall) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                return superCall.call();
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
        });
    }
}
```

### Pattern 3: Circuit Breaker

```java
public class CircuitBreakerInterceptor {
    private int failures = 0;
    private static final int THRESHOLD = 5;

    @RuntimeType
    public Object intercept(@Origin Method method,
                           @SuperCall Callable<?> superCall) throws Exception {
        if (failures >= THRESHOLD) {
            throw new IllegalStateException("Circuit breaker open");
        }

        try {
            Object result = superCall.call();
            failures = 0;  // Reset on success
            return result;
        } catch (Exception e) {
            failures++;
            throw e;
        }
    }
}
```

## What's Next

Part 3 covers advanced delegation strategies: custom delegation logic, method ambiguity resolution, and building a dependency injection framework with ByteBuddy. We'll create:

```java
@Inject
private UserService userService;

@Inject
private ProductService productService;
```

You'll learn `@Morph` for custom invocation, `Advice` for code injection, and building real-world frameworks.
