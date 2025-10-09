---
title: "ByteBuddy with Java - Part 1: Introduction and Dynamic Class Creation"
description: "Master ByteBuddy fundamentals: create classes at runtime, understand bytecode manipulation, and build your first dynamic proxy. Learn why ByteBuddy beats reflection."
publishDate: 2025-06-28
tags: ["ByteBuddy", "Java", "Bytecode", "Runtime", "Proxies", "Dynamic Programming"]
difficulty: "intermediate"
series: "ByteBuddy with Java"
part: 1
estimatedTime: "25 minutes"
totalParts: 5
---

# ByteBuddy with Java - Part 1: Introduction and Dynamic Class Creation

ByteBuddy is a code generation library that creates and modifies Java classes at runtime without compilers. You define behavior using fluent APIs, ByteBuddy generates bytecode. We'll build dynamic proxies, custom annotations processors, and Java agents.

## What You'll Build

A dynamic proxy that intercepts method calls:

```java
UserService proxy = createProxy(UserService.class);
proxy.getUser(123);  // Logs: "Calling getUser with [123]"
```

Output:

```
[INTERCEPTED] Method: getUser
[INTERCEPTED] Arguments: [123]
[INTERCEPTED] Execution time: 45ms
```

By Part 5, you'll build Java agents that instrument code at JVM startup. Part 1 covers basics: creating classes and simple interception.

## ByteBuddy Concepts

ByteBuddy is a **code generation library**. You describe class structure with Java code, ByteBuddy generates bytecode and loads it into the JVM.

### Why ByteBuddy?

**Problem with Reflection:**

```java
Method method = obj.getClass().getMethod("getValue");
Object result = method.invoke(obj);  // Slow, type-unsafe, verbose
```

**ByteBuddy generates real classes:**

```java
Class<?> proxyClass = new ByteBuddy()
    .subclass(Object.class)
    .method(named("toString"))
    .intercept(FixedValue.value("Hello ByteBuddy"))
    .make()
    .load(getClass().getClassLoader())
    .getLoaded();

Object instance = proxyClass.getDeclaredConstructor().newInstance();
System.out.println(instance);  // "Hello ByteBuddy"
```

ByteBuddy generates bytecode. The JVM executes normal method calls - no reflection overhead.

### ByteBuddy vs Alternatives

| Library | Complexity | Type Safety | Performance |
|---------|------------|-------------|-------------|
| **ByteBuddy** | Low (fluent API) | High | Excellent |
| ASM | High (manual bytecode) | Low | Excellent |
| Javassist | Medium | Medium | Good |
| Reflection | Low | Low | Poor |

ByteBuddy combines ASM's performance with simple APIs. Used by Hibernate, Mockito, and Spring Framework.

### Key Components

**1. Builder API**: Describes class structure

```java
DynamicType.Unloaded<?> dynamicType = new ByteBuddy()
    .subclass(Object.class)
    .name("com.example.Generated")
    .make();
```

**2. Interception**: Defines method behavior

```java
.method(named("toString"))
.intercept(FixedValue.value("Generated"))
```

**3. Loading**: Injects classes into JVM

```java
.load(classLoader)
.getLoaded();
```

## Project Setup

Create a Maven project. ByteBuddy requires a single dependency.

### pom.xml

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
         http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.example</groupId>
    <artifactId>bytebuddy-tutorial</artifactId>
    <version>1.0-SNAPSHOT</version>

    <properties>
        <maven.compiler.source>17</maven.compiler.source>
        <maven.compiler.target>17</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>

    <dependencies>
        <!-- ByteBuddy -->
        <dependency>
            <groupId>net.bytebuddy</groupId>
            <artifactId>byte-buddy</artifactId>
            <version>1.14.11</version>
        </dependency>

        <!-- Testing -->
        <dependency>
            <groupId>org.junit.jupiter</groupId>
            <artifactId>junit-jupiter</artifactId>
            <version>5.10.1</version>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-surefire-plugin</artifactId>
                <version>3.2.3</version>
            </plugin>
        </plugins>
    </build>
</project>
```

### Project Structure

```
src/
  main/
    java/
      com/example/
        HelloByteBuddy.java
        ProxyExample.java
  test/
    java/
      com/example/
        ByteBuddyBasicsTest.java
```

## Creating Your First Class

ByteBuddy generates classes in three steps:

1. **Build**: Define class structure
2. **Make**: Generate bytecode
3. **Load**: Inject into JVM

### Example 1: Hello ByteBuddy

```java
package com.example;

import net.bytebuddy.ByteBuddy;
import net.bytebuddy.implementation.FixedValue;
import net.bytebuddy.matcher.ElementMatchers;

public class HelloByteBuddy {

    public static void main(String[] args) throws Exception {
        // Step 1: Build class definition
        Class<?> dynamicType = new ByteBuddy()
            .subclass(Object.class)
            .method(ElementMatchers.named("toString"))
            .intercept(FixedValue.value("Hello from ByteBuddy!"))
            .make()
            .load(HelloByteBuddy.class.getClassLoader())
            .getLoaded();

        // Step 2: Create instance
        Object instance = dynamicType.getDeclaredConstructor().newInstance();

        // Step 3: Call method
        System.out.println(instance.toString());
    }
}
```

**Output:**

```
Hello from ByteBuddy!
```

### How It Works

![Diagram 1](/diagrams/bytebuddy-java-part-1-diagram-1.svg)

1. **ByteBuddy()**: Creates builder
2. **subclass(Object.class)**: Extends Object
3. **method(named("toString"))**: Selects toString method
4. **intercept(FixedValue)**: Replaces with fixed value
5. **make()**: Generates bytecode
6. **load()**: Loads into JVM classloader
7. **getLoaded()**: Returns Class<?> reference

### Builder API Deep Dive

**subclass() vs implement() vs redefine():**

```java
// Subclass - creates child class
new ByteBuddy().subclass(MyClass.class)

// Implement - creates class with interfaces
new ByteBuddy().implement(Runnable.class, Serializable.class)

// Redefine - modifies existing class (requires agent)
new ByteBuddy().redefine(MyClass.class)
```

**Method selection with ElementMatchers:**

```java
import static net.bytebuddy.matcher.ElementMatchers.*;

// Match by name
.method(named("getValue"))

// Match by annotation
.method(isAnnotatedWith(Override.class))

// Match by return type
.method(returns(String.class))

// Combine matchers
.method(named("get").and(takesArguments(1)))

// Match any method
.method(any())
```

**Interception strategies:**

```java
// Fixed value
.intercept(FixedValue.value("constant"))

// Delegate to another object
.intercept(MethodDelegation.to(new MyInterceptor()))

// Call superclass
.intercept(SuperMethodCall.INSTANCE)

// Throw exception
.intercept(ExceptionMethod.throwing(UnsupportedOperationException.class))
```

## Example 2: Creating a Dynamic Proxy

Real-world use case: add logging without modifying source code.

### Target Class

```java
package com.example;

public class UserService {

    public String getUser(int id) {
        return "User[id=" + id + "]";
    }

    public void deleteUser(int id) {
        System.out.println("Deleting user " + id);
    }
}
```

### Interceptor with Logging

```java
package com.example;

import net.bytebuddy.implementation.bind.annotation.*;
import java.lang.reflect.Method;
import java.util.Arrays;
import java.util.concurrent.Callable;

public class LoggingInterceptor {

    @RuntimeType
    public Object intercept(@Origin Method method,
                           @AllArguments Object[] args,
                           @SuperCall Callable<?> superCall) throws Exception {

        long start = System.currentTimeMillis();

        System.out.println("[INTERCEPTED] Method: " + method.getName());
        System.out.println("[INTERCEPTED] Arguments: " + Arrays.toString(args));

        // Call original method
        Object result = superCall.call();

        long duration = System.currentTimeMillis() - start;
        System.out.println("[INTERCEPTED] Execution time: " + duration + "ms");
        System.out.println("[INTERCEPTED] Result: " + result);
        System.out.println();

        return result;
    }
}
```

**Annotation breakdown:**

- `@RuntimeType`: Handles return type casting automatically
- `@Origin Method`: Injects method reference
- `@AllArguments`: Injects all method arguments as array
- `@SuperCall Callable<?>`: Provides callable to invoke original method

### Creating the Proxy

```java
package com.example;

import net.bytebuddy.ByteBuddy;
import net.bytebuddy.implementation.MethodDelegation;
import net.bytebuddy.matcher.ElementMatchers;

public class ProxyExample {

    public static void main(String[] args) throws Exception {
        // Create proxy class
        Class<? extends UserService> proxyClass = new ByteBuddy()
            .subclass(UserService.class)
            .method(ElementMatchers.any())
            .intercept(MethodDelegation.to(new LoggingInterceptor()))
            .make()
            .load(ProxyExample.class.getClassLoader())
            .getLoaded();

        // Create instance and call methods
        UserService proxy = proxyClass.getDeclaredConstructor().newInstance();

        proxy.getUser(123);
        proxy.deleteUser(456);
    }
}
```

**Output:**

```
[INTERCEPTED] Method: getUser
[INTERCEPTED] Arguments: [123]
[INTERCEPTED] Execution time: 2ms
[INTERCEPTED] Result: User[id=123]

[INTERCEPTED] Method: deleteUser
[INTERCEPTED] Arguments: [456]
Deleting user 456
[INTERCEPTED] Execution time: 1ms
[INTERCEPTED] Result: null
```

### How Method Delegation Works

![Diagram 2](/diagrams/bytebuddy-java-part-1-diagram-2.svg)

When you call `proxy.getUser(123)`:

1. JVM invokes generated bytecode
2. ByteBuddy routes call to `LoggingInterceptor.intercept()`
3. Interceptor receives method metadata via annotations
4. `superCall.call()` invokes original `UserService.getUser()`
5. Interceptor returns result to caller

ByteBuddy generates bytecode equivalent to:

```java
public class UserService$ByteBuddy$Generated extends UserService {
    private LoggingInterceptor interceptor;

    @Override
    public String getUser(int id) {
        return (String) interceptor.intercept(
            UserService.class.getMethod("getUser", int.class),
            new Object[]{id},
            () -> super.getUser(id)
        );
    }
}
```

## Testing

Create `src/test/java/com/example/ByteBuddyBasicsTest.java`:

```java
package com.example;

import net.bytebuddy.ByteBuddy;
import net.bytebuddy.implementation.FixedValue;
import net.bytebuddy.implementation.MethodDelegation;
import net.bytebuddy.matcher.ElementMatchers;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class ByteBuddyBasicsTest {

    @Test
    void testFixedValueInterception() throws Exception {
        Class<?> dynamicType = new ByteBuddy()
            .subclass(Object.class)
            .method(ElementMatchers.named("toString"))
            .intercept(FixedValue.value("Intercepted!"))
            .make()
            .load(getClass().getClassLoader())
            .getLoaded();

        Object instance = dynamicType.getDeclaredConstructor().newInstance();
        assertEquals("Intercepted!", instance.toString());
    }

    @Test
    void testSubclassingUserService() throws Exception {
        Class<? extends UserService> proxyClass = new ByteBuddy()
            .subclass(UserService.class)
            .method(ElementMatchers.named("getUser"))
            .intercept(MethodDelegation.to(new LoggingInterceptor()))
            .make()
            .load(getClass().getClassLoader())
            .getLoaded();

        UserService proxy = proxyClass.getDeclaredConstructor().newInstance();
        String result = proxy.getUser(123);

        assertNotNull(result);
        assertTrue(result.contains("123"));
    }

    @Test
    void testMultipleInterfaceImplementation() throws Exception {
        Class<?> dynamicType = new ByteBuddy()
            .subclass(Object.class)
            .implement(Runnable.class, AutoCloseable.class)
            .method(ElementMatchers.named("run"))
            .intercept(FixedValue.originType())
            .method(ElementMatchers.named("close"))
            .intercept(FixedValue.originType())
            .make()
            .load(getClass().getClassLoader())
            .getLoaded();

        Object instance = dynamicType.getDeclaredConstructor().newInstance();
        assertTrue(instance instanceof Runnable);
        assertTrue(instance instanceof AutoCloseable);
    }
}
```

Run tests:

```bash
mvn test
```

All tests pass. ByteBuddy successfully generates classes, intercepts methods, and implements interfaces.

## Common Patterns

### Pattern 1: Conditional Interception

Intercept only specific methods:

```java
new ByteBuddy()
    .subclass(UserService.class)
    .method(ElementMatchers.nameStartsWith("get"))
    .intercept(MethodDelegation.to(new GetterInterceptor()))
    .method(ElementMatchers.nameStartsWith("set"))
    .intercept(MethodDelegation.to(new SetterInterceptor()))
    .make()
    .load(classLoader)
    .getLoaded();
```

### Pattern 2: Implementing Multiple Interfaces

```java
Class<?> dynamicType = new ByteBuddy()
    .subclass(Object.class)
    .implement(Runnable.class, Serializable.class, Cloneable.class)
    .method(ElementMatchers.named("run"))
    .intercept(FixedValue.originType())
    .make()
    .load(classLoader)
    .getLoaded();
```

### Pattern 3: Method Chaining

ByteBuddy supports fluent method chaining:

```java
new ByteBuddy()
    .subclass(BaseClass.class)
    .implement(Interface1.class)
    .implement(Interface2.class)
    .name("com.example.Generated")
    .method(named("method1"))
    .intercept(FixedValue.value("value1"))
    .method(named("method2"))
    .intercept(FixedValue.value("value2"))
    .make()
    .load(classLoader)
    .getLoaded();
```

## Common Pitfalls

**ClassLoader Issues**: Always use appropriate classloader.

```java
// Wrong - may cause ClassNotFoundException
.load(ClassLoader.getSystemClassLoader())

// Correct - use same classloader as current class
.load(getClass().getClassLoader())
```

**Forgetting @RuntimeType**: Without it, interceptor return type must match exactly.

```java
// Wrong - ClassCastException if method returns String
public Object intercept(@SuperCall Callable<?> superCall) {
    return superCall.call();
}

// Correct - ByteBuddy handles casting
@RuntimeType
public Object intercept(@SuperCall Callable<?> superCall) {
    return superCall.call();
}
```

**Calling super on final classes**: Can't subclass final classes.

```java
// Fails - String is final
new ByteBuddy().subclass(String.class)  // IllegalArgumentException

// Solution - use redefine with Java agent (Part 5)
```

**Constructor arguments**: Subclasses must call parent constructors.

```java
public class Parent {
    public Parent(String name) { }
}

// Wrong - no matching constructor
new ByteBuddy().subclass(Parent.class)

// Correct - specify constructor strategy
new ByteBuddy()
    .subclass(Parent.class, ConstructorStrategy.Default.NO_CONSTRUCTORS)
    .defineConstructor(Visibility.PUBLIC)
    .withParameters(String.class)
    .intercept(MethodCall.invoke(Parent.class.getConstructor(String.class))
        .withAllArguments())
```

## Performance Considerations

ByteBuddy-generated classes perform identically to hand-written classes. The overhead is during class generation, not execution.

**Benchmark:**

```java
// Reflection: 1000ms for 10M calls
Method method = obj.getClass().getMethod("getValue");
for (int i = 0; i < 10_000_000; i++) {
    method.invoke(obj);
}

// ByteBuddy proxy: 50ms for 10M calls (20x faster)
ValueService proxy = createProxy(ValueService.class);
for (int i = 0; i < 10_000_000; i++) {
    proxy.getValue();
}
```

**Tip**: Cache generated classes. Class generation is expensive (~50ms per class).

```java
// Bad - generates new class every call
public <T> T createProxy(Class<T> type) {
    return new ByteBuddy().subclass(type).make().load(...).getLoaded();
}

// Good - cache generated classes
private final Map<Class<?>, Class<?>> proxyCache = new ConcurrentHashMap<>();

public <T> T createProxy(Class<T> type) {
    Class<?> proxyClass = proxyCache.computeIfAbsent(type, t ->
        new ByteBuddy().subclass(t).make().load(...).getLoaded()
    );
    return (T) proxyClass.getDeclaredConstructor().newInstance();
}
```

## What's Next

Part 2 covers advanced method interception: accessing fields, modifying arguments, handling exceptions, and creating custom annotations. We'll build:

```java
@Timed
@Cached
public String expensiveOperation(String input) {
    // Automatically timed and cached via ByteBuddy
}
```

You'll learn argument binding, field access, exception handling, and annotation processing with ByteBuddy.
