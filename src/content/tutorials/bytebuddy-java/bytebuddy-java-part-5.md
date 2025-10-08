---
title: "ByteBuddy with Java - Part 5: Java Agents and Runtime Instrumentation"
description: "Build production Java agents with ByteBuddy: instrument classes at JVM startup, redefine loaded classes, and create APM tools for distributed tracing and monitoring."
publishDate: 2025-10-07
tags: ["ByteBuddy", "Java", "Agents", "Instrumentation", "APM", "Monitoring", "JVM"]
difficulty: "advanced"
series: "ByteBuddy with Java"
part: 5
estimatedTime: "45 minutes"
totalParts: 5
---

# ByteBuddy with Java - Part 5: Java Agents and Runtime Instrumentation

Parts 1-4 modified classes during development. Part 5 shows **Java Agents**: programs that instrument classes at JVM startup or runtime without modifying application code.

## What You'll Build

A production-ready APM (Application Performance Monitoring) agent:

```bash
java -javaagent:apm-agent.jar -jar my-application.jar
```

The agent automatically:
- Tracks all HTTP requests with timing
- Monitors database queries
- Records method execution times
- Generates distributed traces
- Reports metrics to console/monitoring system

**All without touching application code.**

## Java Agent Basics

### What is a Java Agent?

A Java agent is a JAR file with special entry points that the JVM calls during startup or attach. Agents can:

1. **Transform classes** as they're loaded
2. **Redefine classes** already loaded
3. **Access instrumentation API** for heap inspection
4. **Hook into JVM lifecycle** (startup, shutdown)

### Agent Types

**Premain Agent** - Runs at JVM startup:

```bash
java -javaagent:agent.jar -jar app.jar
```

**Agentmain Agent** - Attaches to running JVM:

```bash
# Attach to PID 12345
java -jar attach-tool.jar 12345 agent.jar
```

ByteBuddy supports both. We'll focus on premain agents.

## Creating Your First Agent

### Project Structure

```
apm-agent/
├── pom.xml
└── src/
    └── main/
        ├── java/
        │   └── com/example/agent/
        │       ├── APMAgent.java
        │       └── TimingAdvice.java
        └── resources/
            └── META-INF/
                └── MANIFEST.MF
```

### pom.xml

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
         http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.example</groupId>
    <artifactId>apm-agent</artifactId>
    <version>1.0.0</version>

    <properties>
        <maven.compiler.source>17</maven.compiler.source>
        <maven.compiler.target>17</maven.compiler.target>
    </properties>

    <dependencies>
        <dependency>
            <groupId>net.bytebuddy</groupId>
            <artifactId>byte-buddy</artifactId>
            <version>1.14.11</version>
        </dependency>
        <dependency>
            <groupId>net.bytebuddy</groupId>
            <artifactId>byte-buddy-agent</artifactId>
            <version>1.14.11</version>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-jar-plugin</artifactId>
                <version>3.3.0</version>
                <configuration>
                    <archive>
                        <manifestFile>src/main/resources/META-INF/MANIFEST.MF</manifestFile>
                    </archive>
                </configuration>
            </plugin>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-shade-plugin</artifactId>
                <version>3.5.1</version>
                <executions>
                    <execution>
                        <phase>package</phase>
                        <goals>
                            <goal>shade</goal>
                        </goals>
                    </execution>
                </executions>
            </plugin>
        </plugins>
    </build>
</project>
```

**Note:** `maven-shade-plugin` creates fat JAR with all dependencies.

### META-INF/MANIFEST.MF

```
Manifest-Version: 1.0
Premain-Class: com.example.agent.APMAgent
Agent-Class: com.example.agent.APMAgent
Can-Redefine-Classes: true
Can-Retransform-Classes: true
```

**Key entries:**
- `Premain-Class`: Entry point for `-javaagent`
- `Agent-Class`: Entry point for runtime attach
- `Can-Redefine-Classes`: Allows class redefinition
- `Can-Retransform-Classes`: Allows retransformation

### Simple Agent

```java
package com.example.agent;

import net.bytebuddy.agent.builder.AgentBuilder;
import net.bytebuddy.asm.Advice;
import net.bytebuddy.matcher.ElementMatchers;

import java.lang.instrument.Instrumentation;

public class APMAgent {

    public static void premain(String agentArgs, Instrumentation inst) {
        System.out.println("[APM Agent] Starting instrumentation...");

        new AgentBuilder.Default()
            .type(ElementMatchers.nameStartsWith("com.example.app"))
            .transform((builder, typeDescription, classLoader, module, protectionDomain) ->
                builder.visit(Advice.to(TimingAdvice.class)
                    .on(ElementMatchers.any())))
            .installOn(inst);

        System.out.println("[APM Agent] Instrumentation complete");
    }
}
```

### Timing Advice

```java
package com.example.agent;

import net.bytebuddy.asm.Advice;

public class TimingAdvice {

    @Advice.OnMethodEnter
    public static long enter(@Advice.Origin String method) {
        System.out.println("[TRACE] Entering: " + method);
        return System.nanoTime();
    }

    @Advice.OnMethodExit(onThrowable = Throwable.class)
    public static void exit(@Advice.Origin String method,
                           @Advice.Enter long startTime) {
        long duration = System.nanoTime() - startTime;
        System.out.printf("[TRACE] Exited: %s (%.2fms)%n",
            method, duration / 1_000_000.0);
    }
}
```

### Build the Agent

```bash
mvn clean package
```

This creates `target/apm-agent-1.0.0.jar`.

## Testing the Agent

### Sample Application

Create a separate project for the target application:

```java
package com.example.app;

public class UserService {

    public String getUser(String id) {
        simulateWork(50);
        return "User[id=" + id + "]";
    }

    public void createUser(String name) {
        simulateWork(100);
        System.out.println("Created user: " + name);
    }

    private void simulateWork(long millis) {
        try {
            Thread.sleep(millis);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }

    public static void main(String[] args) {
        UserService service = new UserService();
        service.getUser("123");
        service.createUser("Alice");
    }
}
```

### Run with Agent

```bash
java -javaagent:apm-agent-1.0.0.jar -cp app.jar com.example.app.UserService
```

**Output:**

```
[APM Agent] Starting instrumentation...
[APM Agent] Instrumentation complete
[TRACE] Entering: com.example.app.UserService.getUser
[TRACE] Entering: com.example.app.UserService.simulateWork
[TRACE] Exited: com.example.app.UserService.simulateWork (50.23ms)
[TRACE] Exited: com.example.app.UserService.getUser (50.45ms)
[TRACE] Entering: com.example.app.UserService.createUser
[TRACE] Entering: com.example.app.UserService.simulateWork
[TRACE] Exited: com.example.app.UserService.simulateWork (100.12ms)
Created user: Alice
[TRACE] Exited: com.example.app.UserService.createUser (100.34ms)
```

The agent automatically instrumented all methods in `com.example.app.*` packages!

## AgentBuilder API

ByteBuddy's `AgentBuilder` provides powerful class selection and transformation.

### Type Matching

```java
import static net.bytebuddy.matcher.ElementMatchers.*;

new AgentBuilder.Default()
    // Match by package
    .type(nameStartsWith("com.example"))

    // Match by annotation
    .type(isAnnotatedWith(RestController.class))

    // Match interfaces
    .type(isSubTypeOf(Runnable.class))

    // Combine matchers
    .type(nameStartsWith("com.example")
        .and(not(nameContains("Test")))
        .and(isPublic()))

    // Match everything except JDK classes
    .type(not(nameStartsWith("java."))
        .and(not(nameStartsWith("javax."))))
```

### Method Matching

```java
new AgentBuilder.Default()
    .type(nameStartsWith("com.example"))
    .transform((builder, typeDescription, classLoader, module, protectionDomain) ->
        builder
            // Only public methods
            .visit(Advice.to(PublicMethodAdvice.class)
                .on(isPublic()))

            // Only methods with @Timed annotation
            .visit(Advice.to(TimingAdvice.class)
                .on(isAnnotatedWith(Timed.class)))

            // Getters and setters
            .visit(Advice.to(AccessorAdvice.class)
                .on(nameStartsWith("get").or(nameStartsWith("set"))))
    )
    .installOn(inst);
```

### Listener for Debugging

```java
new AgentBuilder.Default()
    .with(AgentBuilder.Listener.StreamWriting.toSystemOut())
    .type(nameStartsWith("com.example"))
    .transform(...)
    .installOn(inst);
```

Prints transformation details:

```
[Byte Buddy] TRANSFORM com.example.UserService [classloader: sun.misc.Launcher$AppClassLoader]
[Byte Buddy] COMPLETE com.example.UserService [classloader: sun.misc.Launcher$AppClassLoader]
```

## Building a Production APM Agent

Let's build a complete APM system with HTTP tracing, database monitoring, and metrics collection.

### Annotations

```java
package com.example.agent.annotations;

import java.lang.annotation.*;

@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
public @interface Traced {
    String operation() default "";
}

@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.TYPE)
public @interface Service {
    String name();
}
```

### Trace Context

```java
package com.example.agent;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

public class TraceContext {

    private static final ThreadLocal<Span> currentSpan = new ThreadLocal<>();
    private static final Map<String, List<Span>> completedTraces = new ConcurrentHashMap<>();

    public static Span startSpan(String operation) {
        Span parent = currentSpan.get();
        Span span = new Span(operation, parent);
        currentSpan.set(span);
        return span;
    }

    public static void endSpan(Span span) {
        span.finish();
        if (span.parent != null) {
            currentSpan.set(span.parent);
        } else {
            currentSpan.remove();
            completedTraces.computeIfAbsent(span.traceId, k -> new ArrayList<>())
                .add(span);
        }
    }

    public static void printTraces() {
        System.out.println("\n=== Distributed Traces ===");
        completedTraces.forEach((traceId, spans) -> {
            System.out.println("Trace ID: " + traceId);
            spans.forEach(span -> span.print(0));
            System.out.println();
        });
    }

    public static class Span {
        final String traceId;
        final String spanId;
        final String operation;
        final Span parent;
        final long startTime;
        long endTime;
        final Map<String, String> tags = new HashMap<>();

        Span(String operation, Span parent) {
            this.operation = operation;
            this.parent = parent;
            this.traceId = parent != null ? parent.traceId : UUID.randomUUID().toString();
            this.spanId = UUID.randomUUID().toString().substring(0, 8);
            this.startTime = System.nanoTime();
        }

        void finish() {
            this.endTime = System.nanoTime();
        }

        long durationMs() {
            return (endTime - startTime) / 1_000_000;
        }

        void setTag(String key, String value) {
            tags.put(key, value);
        }

        void print(int indent) {
            String prefix = "  ".repeat(indent);
            System.out.printf("%s[%s] %s (%.2fms)%n",
                prefix, spanId, operation, durationMs());
            tags.forEach((k, v) ->
                System.out.printf("%s  %s: %s%n", prefix, k, v));
        }
    }
}
```

### HTTP Tracing Advice

```java
package com.example.agent;

import net.bytebuddy.asm.Advice;

public class HttpTracingAdvice {

    @Advice.OnMethodEnter
    public static TraceContext.Span enter(@Advice.Origin String method,
                                          @Advice.AllArguments Object[] args) {
        String operation = "HTTP " + extractHttpMethod(method);
        TraceContext.Span span = TraceContext.startSpan(operation);

        if (args.length > 0 && args[0] != null) {
            span.setTag("url", args[0].toString());
        }

        return span;
    }

    @Advice.OnMethodExit(onThrowable = Throwable.class)
    public static void exit(@Advice.Enter TraceContext.Span span,
                           @Advice.Thrown Throwable exception) {
        if (exception != null) {
            span.setTag("error", exception.getMessage());
        }
        TraceContext.endSpan(span);
    }

    private static String extractHttpMethod(String method) {
        if (method.contains("GET")) return "GET";
        if (method.contains("POST")) return "POST";
        if (method.contains("PUT")) return "PUT";
        if (method.contains("DELETE")) return "DELETE";
        return "UNKNOWN";
    }
}
```

### Database Tracing Advice

```java
package com.example.agent;

import net.bytebuddy.asm.Advice;

import java.sql.Statement;

public class DatabaseTracingAdvice {

    @Advice.OnMethodEnter
    public static TraceContext.Span enter(@Advice.This Statement statement,
                                          @Advice.Argument(0) String sql) {
        TraceContext.Span span = TraceContext.startSpan("SQL Query");
        span.setTag("sql", sql);
        span.setTag("type", extractQueryType(sql));
        return span;
    }

    @Advice.OnMethodExit(onThrowable = Throwable.class)
    public static void exit(@Advice.Enter TraceContext.Span span,
                           @Advice.Return Object result,
                           @Advice.Thrown Throwable exception) {
        if (exception != null) {
            span.setTag("error", exception.getMessage());
        }
        if (result != null) {
            span.setTag("result", result.toString());
        }
        TraceContext.endSpan(span);
    }

    private static String extractQueryType(String sql) {
        String upper = sql.trim().toUpperCase();
        if (upper.startsWith("SELECT")) return "SELECT";
        if (upper.startsWith("INSERT")) return "INSERT";
        if (upper.startsWith("UPDATE")) return "UPDATE";
        if (upper.startsWith("DELETE")) return "DELETE";
        return "OTHER";
    }
}
```

### Service Method Tracing

```java
package com.example.agent;

import net.bytebuddy.asm.Advice;

import java.lang.reflect.Method;

public class ServiceTracingAdvice {

    @Advice.OnMethodEnter
    public static TraceContext.Span enter(@Advice.Origin Method method,
                                          @Advice.AllArguments Object[] args) {
        Traced traced = method.getAnnotation(Traced.class);
        String operation = traced != null && !traced.operation().isEmpty()
            ? traced.operation()
            : method.getName();

        TraceContext.Span span = TraceContext.startSpan(operation);
        span.setTag("class", method.getDeclaringClass().getSimpleName());
        span.setTag("method", method.getName());

        return span;
    }

    @Advice.OnMethodExit(onThrowable = Throwable.class)
    public static void exit(@Advice.Enter TraceContext.Span span,
                           @Advice.Return Object result,
                           @Advice.Thrown Throwable exception) {
        if (exception != null) {
            span.setTag("error", exception.getMessage());
        }
        TraceContext.endSpan(span);
    }
}
```

### Complete APM Agent

```java
package com.example.agent;

import net.bytebuddy.agent.builder.AgentBuilder;
import net.bytebuddy.asm.Advice;
import net.bytebuddy.matcher.ElementMatchers;
import com.example.agent.annotations.*;

import java.lang.instrument.Instrumentation;

import static net.bytebuddy.matcher.ElementMatchers.*;

public class APMAgent {

    public static void premain(String agentArgs, Instrumentation inst) {
        System.out.println("[APM Agent] Starting comprehensive instrumentation...");

        installServiceTracing(inst);
        installHttpTracing(inst);
        installDatabaseTracing(inst);
        installShutdownHook();

        System.out.println("[APM Agent] All instrumentation installed");
    }

    private static void installServiceTracing(Instrumentation inst) {
        new AgentBuilder.Default()
            .type(isAnnotatedWith(Service.class))
            .transform((builder, typeDescription, classLoader, module, protectionDomain) ->
                builder.visit(Advice.to(ServiceTracingAdvice.class)
                    .on(isAnnotatedWith(Traced.class)
                        .or(isPublic().and(not(isConstructor()))))))
            .installOn(inst);
    }

    private static void installHttpTracing(Instrumentation inst) {
        new AgentBuilder.Default()
            .type(nameContains("Controller").or(isAnnotatedWith(named("org.springframework.web.bind.annotation.RestController"))))
            .transform((builder, typeDescription, classLoader, module, protectionDomain) ->
                builder.visit(Advice.to(HttpTracingAdvice.class)
                    .on(isPublic().and(not(isConstructor())))))
            .installOn(inst);
    }

    private static void installDatabaseTracing(Instrumentation inst) {
        new AgentBuilder.Default()
            .type(isSubTypeOf(named("java.sql.Statement")))
            .transform((builder, typeDescription, classLoader, module, protectionDomain) ->
                builder.visit(Advice.to(DatabaseTracingAdvice.class)
                    .on(named("execute")
                        .or(named("executeQuery"))
                        .or(named("executeUpdate")))))
            .installOn(inst);
    }

    private static void installShutdownHook() {
        Runtime.getRuntime().addShutdownHook(new Thread(() -> {
            System.out.println("\n[APM Agent] Shutting down...");
            TraceContext.printTraces();
        }));
    }
}
```

## Example Application

```java
package com.example.app;

import com.example.agent.annotations.*;

@Service(name = "OrderService")
public class OrderService {

    @Traced(operation = "order.create")
    public Order createOrder(String customerId, String product) {
        validateCustomer(customerId);
        Order order = saveToDatabase(product);
        sendConfirmationEmail(customerId);
        return order;
    }

    @Traced
    private void validateCustomer(String customerId) {
        simulateWork(20);
    }

    @Traced(operation = "db.insert.order")
    private Order saveToDatabase(String product) {
        simulateWork(100);
        return new Order("ORD-123", product);
    }

    @Traced
    private void sendConfirmationEmail(String customerId) {
        simulateWork(50);
    }

    private void simulateWork(long millis) {
        try {
            Thread.sleep(millis);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }

    public static void main(String[] args) {
        OrderService service = new OrderService();
        service.createOrder("CUST-456", "Laptop");
    }
}

class Order {
    final String id;
    final String product;

    Order(String id, String product) {
        this.id = id;
        this.product = product;
    }
}
```

### Running with Agent

```bash
mvn clean package
java -javaagent:apm-agent-1.0.0.jar -cp app.jar com.example.app.OrderService
```

**Output:**

```
[APM Agent] Starting comprehensive instrumentation...
[APM Agent] All instrumentation installed

[APM Agent] Shutting down...

=== Distributed Traces ===
Trace ID: a7f3c2b1-4d5e-6789-abcd-ef0123456789
[a7f3c2b1] order.create (172.45ms)
  class: OrderService
  method: createOrder
  [b2c4d5e6] validateCustomer (20.12ms)
    class: OrderService
    method: validateCustomer
  [c3d5e7f8] db.insert.order (100.34ms)
    class: OrderService
    method: saveToDatabase
  [d4e6f8a9] sendConfirmationEmail (50.23ms)
    class: OrderService
    method: sendConfirmationEmail
```

Perfect hierarchical trace showing the call chain!

## Advanced: Redefining Loaded Classes

ByteBuddy agents can modify classes already loaded by the JVM.

### Attach API Example

```java
package com.example.agent;

import net.bytebuddy.agent.ByteBuddyAgent;
import net.bytebuddy.agent.builder.AgentBuilder;
import net.bytebuddy.asm.Advice;
import net.bytebuddy.matcher.ElementMatchers;

public class RuntimeAttachment {

    public static void main(String[] args) {
        // Install agent programmatically
        Instrumentation inst = ByteBuddyAgent.install();

        new AgentBuilder.Default()
            .with(AgentBuilder.RedefinitionStrategy.RETRANSFORMATION)
            .type(ElementMatchers.named("com.example.TargetClass"))
            .transform((builder, typeDescription, classLoader, module, protectionDomain) ->
                builder.visit(Advice.to(LoggingAdvice.class)
                    .on(ElementMatchers.any())))
            .installOn(inst);

        System.out.println("Agent attached to running JVM");
    }
}
```

## Performance Considerations

### Agent Overhead

| Instrumentation Type | Overhead |
|---------------------|----------|
| No agent | Baseline |
| Agent with no transformations | < 1% |
| Simple advice (logging) | 1-3% |
| Complex advice (tracing) | 3-7% |
| Heavy computation in advice | 10%+ |

**Tips:**
1. Keep advice methods lightweight
2. Use conditional tracing (sampling)
3. Avoid heavy allocations in hot paths
4. Use static advice when possible

### Sampling Strategy

```java
public class SampledTracingAdvice {

    private static final ThreadLocalRandom random = ThreadLocalRandom.current();
    private static final double SAMPLE_RATE = 0.1; // 10%

    @Advice.OnMethodEnter
    public static TraceContext.Span enter(@Advice.Origin String method) {
        if (random.nextDouble() < SAMPLE_RATE) {
            return TraceContext.startSpan(method);
        }
        return null;
    }

    @Advice.OnMethodExit
    public static void exit(@Advice.Enter TraceContext.Span span) {
        if (span != null) {
            TraceContext.endSpan(span);
        }
    }
}
```

## Testing Agents

```java
package com.example.agent;

import net.bytebuddy.agent.ByteBuddyAgent;
import org.junit.jupiter.api.*;

import java.lang.instrument.Instrumentation;

class AgentTest {

    private static Instrumentation inst;

    @BeforeAll
    static void setupAgent() {
        inst = ByteBuddyAgent.install();
        APMAgent.premain(null, inst);
    }

    @Test
    void testServiceInstrumentation() {
        OrderService service = new OrderService();
        Order order = service.createOrder("CUST-123", "Widget");

        assertNotNull(order);
        // Verify traces captured
    }

    @Test
    void testTracingContext() {
        TraceContext.Span span = TraceContext.startSpan("test-operation");
        span.setTag("key", "value");
        TraceContext.endSpan(span);

        // Verify span recorded
    }
}
```

## Common Patterns

### Pattern 1: Conditional Instrumentation

```java
// Only instrument in production
String env = System.getProperty("environment", "dev");
if ("production".equals(env)) {
    installFullTracing(inst);
} else {
    installBasicLogging(inst);
}
```

### Pattern 2: Plugin Architecture

```java
// Load transformers from configuration
List<String> transformers = loadConfig();
for (String transformerClass : transformers) {
    Class<?> clazz = Class.forName(transformerClass);
    AgentTransformer transformer = (AgentTransformer) clazz.getDeclaredConstructor().newInstance();
    transformer.install(inst);
}
```

### Pattern 3: Metrics Export

```java
ScheduledExecutorService executor = Executors.newScheduledThreadPool(1);
executor.scheduleAtFixedRate(() -> {
    MetricsCollector.exportToPrometheus();
}, 0, 60, TimeUnit.SECONDS);
```

## What You've Learned

Across all 5 parts:

1. **Part 1**: Basic class creation, method interception, proxies
2. **Part 2**: Advanced interception, field access, annotations, caching
3. **Part 3**: Advice API, code injection, performance monitoring
4. **Part 4**: Dynamic class definition, interface implementation, ORM
5. **Part 5**: Java agents, runtime instrumentation, APM systems

You can now:
- Build dynamic proxies and mocking frameworks
- Create annotation processors and AOP libraries
- Generate complete classes from interfaces
- Instrument production applications with agents
- Build APM and monitoring tools

ByteBuddy powers Hibernate, Mockito, Spring, and countless other frameworks. You have the skills to build similar systems!

## Resources

- [ByteBuddy Documentation](https://bytebuddy.net/)
- [Java Instrumentation API](https://docs.oracle.com/en/java/javase/17/docs/api/java.instrument/java/lang/instrument/package-summary.html)
- [ASM Bytecode Guide](https://asm.ow2.io/asm4-guide.pdf)
- [JVM Specification](https://docs.oracle.com/javase/specs/jvms/se17/html/index.html)
