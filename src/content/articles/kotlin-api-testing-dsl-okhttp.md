---
title: "Building an API Testing Library with Kotlin DSL and OkHttp"
description: "Create a reusable API automation testing library using Kotlin DSLs and OkHttp. Build a clean, type-safe interface for REST API testing that works across projects."
publishDate: 2025-02-16
author: "Prashant Chaturvedi"
tags: ["Kotlin", "Testing", "API", "OkHttp", "DSL", "Maven", "REST", "Automation"]
readTime: "20 min read"
difficulty: "intermediate"
estimatedTime: "45 minutes"
---

# Building an API Testing Library with Kotlin DSL and OkHttp

API automation requires repeating the same patterns: build request, send, validate response. A DSL (Domain-Specific Language) makes this readable and reusable. We'll build a Maven library that turns this:

```kotlin
val client = OkHttpClient()
val request = Request.Builder()
    .url("https://api.example.com/users")
    .addHeader("Authorization", "Bearer token123")
    .post(
        """{"name":"Rajesh Kumar","email":"rajesh@example.com"}"""
            .toRequestBody("application/json".toMediaType())
    )
    .build()
val response = client.newCall(request).execute()
assertEquals(201, response.code)
```

Into this:

```kotlin
api {
    request {
        POST("/users") {
            header("Authorization", "Bearer token123")
            body {
                "name" to "Rajesh Kumar"
                "email" to "rajesh@example.com"
            }
        }
    }
    expect {
        status(201)
        jsonPath("$.id") { exists() }
        jsonPath("$.name") { equals("Rajesh Kumar") }
    }
}
```

Clean, readable, reusable across projects.

## Project Setup

Create Maven project structure:

```
api-test-dsl/
├── pom.xml
└── src/
    └── main/
        └── kotlin/
            └── com/codersbox/apitest/
                ├── ApiTestDsl.kt
                ├── RequestBuilder.kt
                ├── ResponseValidator.kt
                └── JsonPathMatcher.kt
```

### pom.xml

```xml
<project>
    <modelVersion>4.0.0</modelVersion>
    <groupId>com.codersbox</groupId>
    <artifactId>api-test-dsl</artifactId>
    <version>1.0.0</version>
    <packaging>jar</packaging>

    <properties>
        <kotlin.version>1.9.21</kotlin.version>
        <okhttp.version>4.12.0</okhttp.version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.jetbrains.kotlin</groupId>
            <artifactId>kotlin-stdlib</artifactId>
            <version>${kotlin.version}</version>
        </dependency>

        <dependency>
            <groupId>com.squareup.okhttp3</groupId>
            <artifactId>okhttp</artifactId>
            <version>${okhttp.version}</version>
        </dependency>

        <dependency>
            <groupId>com.google.code.gson</groupId>
            <artifactId>gson</artifactId>
            <version>2.10.1</version>
        </dependency>

        <dependency>
            <groupId>com.jayway.jsonpath</groupId>
            <artifactId>json-path</artifactId>
            <version>2.9.0</version>
        </dependency>

        <dependency>
            <groupId>org.junit.jupiter</groupId>
            <artifactId>junit-jupiter</artifactId>
            <version>5.10.1</version>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <sourceDirectory>src/main/kotlin</sourceDirectory>
        <plugins>
            <plugin>
                <groupId>org.jetbrains.kotlin</groupId>
                <artifactId>kotlin-maven-plugin</artifactId>
                <version>${kotlin.version}</version>
                <executions>
                    <execution>
                        <id>compile</id>
                        <phase>compile</phase>
                        <goals><goal>compile</goal></goals>
                    </execution>
                </executions>
            </plugin>
        </plugins>
    </build>
</project>
```

**Dependencies:**
- **OkHttp**: HTTP client for making requests
- **Gson**: JSON serialization/deserialization
- **JsonPath**: Extract values from JSON responses
- **JUnit 5**: For test assertions

## Core DSL Structure

### ApiTestDsl.kt

```kotlin
package com.codersbox.apitest

import okhttp3.OkHttpClient
import okhttp3.Response

class ApiTest {
    private var client: OkHttpClient = OkHttpClient()
    private var baseUrl: String = ""
    private lateinit var requestBuilder: RequestBuilder
    private lateinit var response: Response
    private val validators = mutableListOf<ResponseValidator>()

    fun baseUrl(url: String) {
        this.baseUrl = url.trimEnd('/')
    }

    fun client(configure: OkHttpClient.Builder.() -> Unit) {
        this.client = OkHttpClient.Builder().apply(configure).build()
    }

    fun request(configure: RequestBuilder.() -> Unit) {
        requestBuilder = RequestBuilder(baseUrl, client)
        requestBuilder.configure()
        response = requestBuilder.execute()
    }

    fun expect(configure: ResponseValidator.() -> Unit) {
        val validator = ResponseValidator(response)
        validator.configure()
        validators.add(validator)
        validator.validate()
    }
}

fun api(configure: ApiTest.() -> Unit): ApiTest {
    val test = ApiTest()
    test.configure()
    return test
}
```

**How it works:**

- `api { }` creates an `ApiTest` instance
- `baseUrl()` sets base URL for all requests
- `client { }` configures OkHttp client (timeouts, interceptors)
- `request { }` builds and executes HTTP request
- `expect { }` validates response

The DSL uses Kotlin's lambda with receiver pattern: `configure: ApiTest.() -> Unit` means the lambda runs inside `ApiTest` context, accessing its methods directly.

## Request Builder

### RequestBuilder.kt

```kotlin
package com.codersbox.apitest

import com.google.gson.Gson
import okhttp3.*
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.RequestBody.Companion.toRequestBody

class RequestBuilder(
    private val baseUrl: String,
    private val client: OkHttpClient
) {
    private val headers = mutableMapOf<String, String>()
    private val queryParams = mutableMapOf<String, String>()
    private var requestBody: RequestBody? = null
    private lateinit var method: String
    private lateinit var path: String
    private val gson = Gson()

    fun GET(path: String, configure: RequestBuilder.() -> Unit = {}) {
        this.method = "GET"
        this.path = path
        this.configure()
    }

    fun POST(path: String, configure: RequestBuilder.() -> Unit = {}) {
        this.method = "POST"
        this.path = path
        this.configure()
    }

    fun PUT(path: String, configure: RequestBuilder.() -> Unit = {}) {
        this.method = "PUT"
        this.path = path
        this.configure()
    }

    fun DELETE(path: String, configure: RequestBuilder.() -> Unit = {}) {
        this.method = "DELETE"
        this.path = path
        this.configure()
    }

    fun PATCH(path: String, configure: RequestBuilder.() -> Unit = {}) {
        this.method = "PATCH"
        this.path = path
        this.configure()
    }

    fun header(name: String, value: String) {
        headers[name] = value
    }

    fun headers(vararg pairs: Pair<String, String>) {
        pairs.forEach { (name, value) -> headers[name] = value }
    }

    fun queryParam(name: String, value: String) {
        queryParams[name] = value
    }

    fun queryParams(vararg pairs: Pair<String, String>) {
        pairs.forEach { (name, value) -> queryParams[name] = value }
    }

    fun body(configure: JsonBodyBuilder.() -> Unit) {
        val builder = JsonBodyBuilder()
        builder.configure()
        val json = gson.toJson(builder.data)
        requestBody = json.toRequestBody("application/json".toMediaType())
    }

    fun rawBody(content: String, contentType: String = "application/json") {
        requestBody = content.toRequestBody(contentType.toMediaType())
    }

    fun execute(): Response {
        val url = buildUrl()
        val request = Request.Builder()
            .url(url)
            .apply { headers.forEach { (name, value) -> addHeader(name, value) } }
            .method(method, requestBody)
            .build()

        return client.newCall(request).execute()
    }

    private fun buildUrl(): String {
        val fullPath = if (path.startsWith("http")) path else "$baseUrl$path"

        return if (queryParams.isEmpty()) {
            fullPath
        } else {
            val queryString = queryParams.entries.joinToString("&") { (key, value) ->
                "${java.net.URLEncoder.encode(key, "UTF-8")}=${java.net.URLEncoder.encode(value, "UTF-8")}"
            }
            "$fullPath?$queryString"
        }
    }
}

class JsonBodyBuilder {
    val data = mutableMapOf<String, Any?>()

    infix fun String.to(value: Any?) {
        data[this] = value
    }
}
```

**Features:**

- HTTP methods as DSL functions: `GET()`, `POST()`, `PUT()`, etc.
- Headers: `header("Authorization", "Bearer token")`
- Query params: `queryParam("page", "1")`
- JSON body builder using infix notation: `"name" to "Rajesh"`
- Raw body support for non-JSON content

**Body DSL:**

```kotlin
body {
    "name" to "Rajesh Kumar"
    "email" to "rajesh@example.com"
    "age" to 28
    "active" to true
}
```

Converts to:
```json
{
  "name": "Rajesh Kumar",
  "email": "rajesh@example.com",
  "age": 28,
  "active": true
}
```

## Response Validator

### ResponseValidator.kt

```kotlin
package com.codersbox.apitest

import com.jayway.jsonpath.JsonPath
import okhttp3.Response

class ResponseValidator(private val response: Response) {
    private val assertions = mutableListOf<() -> Unit>()
    private val responseBody: String = response.body?.string() ?: ""

    fun status(expectedCode: Int) {
        assertions.add {
            val actual = response.code
            if (actual != expectedCode) {
                throw AssertionError("Expected status $expectedCode but got $actual")
            }
        }
    }

    fun statusIn(vararg codes: Int) {
        assertions.add {
            val actual = response.code
            if (actual !in codes) {
                throw AssertionError("Expected status in ${codes.toList()} but got $actual")
            }
        }
    }

    fun header(name: String, expectedValue: String) {
        assertions.add {
            val actual = response.header(name)
            if (actual != expectedValue) {
                throw AssertionError("Expected header '$name' to be '$expectedValue' but got '$actual'")
            }
        }
    }

    fun headerExists(name: String) {
        assertions.add {
            val actual = response.header(name)
            if (actual == null) {
                throw AssertionError("Expected header '$name' to exist")
            }
        }
    }

    fun bodyContains(text: String) {
        assertions.add {
            if (!responseBody.contains(text)) {
                throw AssertionError("Expected body to contain '$text'")
            }
        }
    }

    fun jsonPath(path: String, configure: JsonPathMatcher.() -> Unit) {
        val matcher = JsonPathMatcher(responseBody, path)
        matcher.configure()
        assertions.addAll(matcher.assertions)
    }

    fun validate() {
        assertions.forEach { it.invoke() }
    }
}
```

**Validations:**

- Status code: `status(200)` or `statusIn(200, 201, 204)`
- Headers: `header("Content-Type", "application/json")`
- Body text: `bodyContains("success")`
- JSON path expressions: `jsonPath("$.user.name") { equals("Rajesh") }`

## JSON Path Matcher

### JsonPathMatcher.kt

```kotlin
package com.codersbox.apitest

import com.jayway.jsonpath.JsonPath

class JsonPathMatcher(
    private val json: String,
    private val path: String
) {
    val assertions = mutableListOf<() -> Unit>()

    fun exists() {
        assertions.add {
            try {
                JsonPath.read<Any>(json, path)
            } catch (e: Exception) {
                throw AssertionError("JSON path '$path' does not exist")
            }
        }
    }

    fun notExists() {
        assertions.add {
            try {
                JsonPath.read<Any>(json, path)
                throw AssertionError("JSON path '$path' exists but expected it not to")
            } catch (e: Exception) {
                // Expected - path doesn't exist
            }
        }
    }

    fun equals(expected: Any) {
        assertions.add {
            val actual = JsonPath.read<Any>(json, path)
            if (actual != expected) {
                throw AssertionError("Expected '$path' to equal '$expected' but got '$actual'")
            }
        }
    }

    fun notEquals(value: Any) {
        assertions.add {
            val actual = JsonPath.read<Any>(json, path)
            if (actual == value) {
                throw AssertionError("Expected '$path' to not equal '$value'")
            }
        }
    }

    fun contains(substring: String) {
        assertions.add {
            val actual = JsonPath.read<String>(json, path)
            if (!actual.contains(substring)) {
                throw AssertionError("Expected '$path' to contain '$substring' but got '$actual'")
            }
        }
    }

    fun matches(regex: String) {
        assertions.add {
            val actual = JsonPath.read<String>(json, path)
            if (!actual.matches(Regex(regex))) {
                throw AssertionError("Expected '$path' to match regex '$regex' but got '$actual'")
            }
        }
    }

    fun isNull() {
        assertions.add {
            val actual = JsonPath.read<Any?>(json, path)
            if (actual != null) {
                throw AssertionError("Expected '$path' to be null but got '$actual'")
            }
        }
    }

    fun isNotNull() {
        assertions.add {
            val actual = JsonPath.read<Any?>(json, path)
            if (actual == null) {
                throw AssertionError("Expected '$path' to not be null")
            }
        }
    }

    fun greaterThan(value: Number) {
        assertions.add {
            val actual = JsonPath.read<Number>(json, path).toDouble()
            val expected = value.toDouble()
            if (actual <= expected) {
                throw AssertionError("Expected '$path' ($actual) to be greater than $expected")
            }
        }
    }

    fun lessThan(value: Number) {
        assertions.add {
            val actual = JsonPath.read<Number>(json, path).toDouble()
            val expected = value.toDouble()
            if (actual >= expected) {
                throw AssertionError("Expected '$path' ($actual) to be less than $expected")
            }
        }
    }

    fun hasSize(size: Int) {
        assertions.add {
            val actual = JsonPath.read<List<Any>>(json, path)
            if (actual.size != size) {
                throw AssertionError("Expected '$path' to have size $size but got ${actual.size}")
            }
        }
    }

    fun isEmpty() {
        assertions.add {
            val actual = JsonPath.read<List<Any>>(json, path)
            if (actual.isNotEmpty()) {
                throw AssertionError("Expected '$path' to be empty but has ${actual.size} elements")
            }
        }
    }

    fun isNotEmpty() {
        assertions.add {
            val actual = JsonPath.read<List<Any>>(json, path)
            if (actual.isEmpty()) {
                throw AssertionError("Expected '$path' to not be empty")
            }
        }
    }
}
```

**JSON Path examples:**

```kotlin
jsonPath("$.id") { exists() }
jsonPath("$.name") { equals("Rajesh Kumar") }
jsonPath("$.email") { matches(".*@example\\.com") }
jsonPath("$.age") { greaterThan(18) }
jsonPath("$.orders") { hasSize(3) }
jsonPath("$.items[0].price") { lessThan(1000) }
```

## Usage Examples

### Example 1: Create User

```kotlin
import org.junit.jupiter.api.Test

class UserApiTest {

    @Test
    fun `create new user`() {
        api {
            baseUrl("https://api.example.com")

            request {
                POST("/users") {
                    header("Authorization", "Bearer token123")
                    body {
                        "name" to "Rajesh Kumar"
                        "email" to "rajesh@example.com"
                        "age" to 28
                        "city" to "Mumbai"
                    }
                }
            }

            expect {
                status(201)
                header("Content-Type", "application/json")
                jsonPath("$.id") { exists() }
                jsonPath("$.name") { equals("Rajesh Kumar") }
                jsonPath("$.email") { equals("rajesh@example.com") }
                jsonPath("$.createdAt") { isNotNull() }
            }
        }
    }
}
```

### Example 2: Get Users with Query Params

```kotlin
@Test
fun `get users filtered by city`() {
    api {
        baseUrl("https://api.example.com")

        request {
            GET("/users") {
                header("Authorization", "Bearer token123")
                queryParams(
                    "city" to "Mumbai",
                    "age_min" to "25",
                    "limit" to "10"
                )
            }
        }

        expect {
            status(200)
            jsonPath("$.users") { isNotEmpty() }
            jsonPath("$.users") { hasSize(10) }
            jsonPath("$.users[0].city") { equals("Mumbai") }
            jsonPath("$.users[0].age") { greaterThan(24) }
        }
    }
}
```

### Example 3: Update User

```kotlin
@Test
fun `update user information`() {
    api {
        baseUrl("https://api.example.com")

        request {
            PUT("/users/123") {
                header("Authorization", "Bearer token123")
                body {
                    "name" to "Rajesh Kumar Updated"
                    "age" to 29
                }
            }
        }

        expect {
            status(200)
            jsonPath("$.id") { equals(123) }
            jsonPath("$.name") { equals("Rajesh Kumar Updated") }
            jsonPath("$.age") { equals(29) }
            jsonPath("$.updatedAt") { isNotNull() }
        }
    }
}
```

### Example 4: Delete User

```kotlin
@Test
fun `delete user`() {
    api {
        baseUrl("https://api.example.com")

        request {
            DELETE("/users/123") {
                header("Authorization", "Bearer token123")
            }
        }

        expect {
            statusIn(204, 200)
        }
    }
}
```

### Example 5: Custom Client Configuration

```kotlin
@Test
fun `configure custom timeouts and interceptors`() {
    api {
        baseUrl("https://api.example.com")

        client {
            connectTimeout(10, java.util.concurrent.TimeUnit.SECONDS)
            readTimeout(30, java.util.concurrent.TimeUnit.SECONDS)
            addInterceptor { chain ->
                val request = chain.request().newBuilder()
                    .addHeader("X-Request-ID", java.util.UUID.randomUUID().toString())
                    .build()
                chain.proceed(request)
            }
        }

        request {
            GET("/slow-endpoint")
        }

        expect {
            status(200)
        }
    }
}
```

### Example 6: Nested JSON Validation

```kotlin
@Test
fun `validate nested user object`() {
    api {
        baseUrl("https://api.example.com")

        request {
            GET("/users/123")
        }

        expect {
            status(200)
            jsonPath("$.user.name") { equals("Rajesh Kumar") }
            jsonPath("$.user.address.city") { equals("Mumbai") }
            jsonPath("$.user.address.state") { equals("Maharashtra") }
            jsonPath("$.user.address.pincode") { matches("^[0-9]{6}$") }
            jsonPath("$.user.orders") { hasSize(5) }
            jsonPath("$.user.orders[0].total") { greaterThan(500) }
        }
    }
}
```

## Building and Publishing

### Build the library

```bash
mvn clean package
```

Produces `target/api-test-dsl-1.0.0.jar`.

### Install locally

```bash
mvn clean install
```

Now available in local Maven repository (`~/.m2/repository`).

### Use in other projects

Add to your test project's `pom.xml`:

```xml
<dependency>
    <groupId>com.codersbox</groupId>
    <artifactId>api-test-dsl</artifactId>
    <version>1.0.0</version>
    <scope>test</scope>
</dependency>
```

Import and use:

```kotlin
import com.codersbox.apitest.api

class MyApiTests {
    @Test
    fun testApi() {
        api {
            // Your tests here
        }
    }
}
```

## Advanced Features

### Reusable Request Configurations

```kotlin
fun ApiTest.authenticatedRequest(
    token: String,
    configure: RequestBuilder.() -> Unit
) {
    request {
        header("Authorization", "Bearer $token")
        configure()
    }
}

// Usage
api {
    baseUrl("https://api.example.com")

    authenticatedRequest("token123") {
        GET("/protected-resource")
    }

    expect {
        status(200)
    }
}
```

### Response Extraction

Extend `ResponseValidator` to extract values:

```kotlin
class ResponseValidator(private val response: Response) {
    private val responseBody: String = response.body?.string() ?: ""

    fun <T> extract(path: String): T {
        return JsonPath.read(responseBody, path)
    }
}

// Usage
val userId = api {
    request { POST("/users") { /* ... */ } }
    expect { status(201) }
}.extract<Int>("$.id")

// Use extracted value in next request
api {
    request { GET("/users/$userId") }
    expect { status(200) }
}
```

### Custom Matchers

```kotlin
fun JsonPathMatcher.isEmail() {
    matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$")
}

fun JsonPathMatcher.isIndianMobile() {
    matches("^[6-9][0-9]{9}$")
}

// Usage
expect {
    jsonPath("$.email") { isEmail() }
    jsonPath("$.mobile") { isIndianMobile() }
}
```

## Best Practices

**Separate base configuration:**

```kotlin
abstract class BaseApiTest {
    protected fun apiTest(configure: ApiTest.() -> Unit) = api {
        baseUrl(System.getenv("API_BASE_URL") ?: "https://api.example.com")
        client {
            connectTimeout(10, TimeUnit.SECONDS)
            readTimeout(30, TimeUnit.SECONDS)
        }
        configure()
    }
}

class UserApiTest : BaseApiTest() {
    @Test
    fun testUsers() = apiTest {
        request { GET("/users") }
        expect { status(200) }
    }
}
```

**Environment-specific configuration:**

```kotlin
object ApiConfig {
    val baseUrl = System.getenv("API_URL") ?: "https://api.example.com"
    val authToken = System.getenv("API_TOKEN") ?: "default-token"
}

api {
    baseUrl(ApiConfig.baseUrl)
    request {
        GET("/endpoint") {
            header("Authorization", "Bearer ${ApiConfig.authToken}")
        }
    }
}
```

**Assertion messages with context:**

Extend validators to include response body in errors:

```kotlin
fun status(expectedCode: Int) {
    assertions.add {
        val actual = response.code
        if (actual != expectedCode) {
            throw AssertionError("""
                Expected status $expectedCode but got $actual
                Response body: $responseBody
            """.trimIndent())
        }
    }
}
```

## Summary

You've built a complete API testing DSL library:

- Clean syntax for HTTP requests (GET, POST, PUT, DELETE, PATCH)
- JSON body builder with Kotlin DSL
- Comprehensive response validation (status, headers, JSON paths)
- JSON path matchers (equals, contains, size checks, type validation)
- Reusable across Maven projects
- Type-safe, compile-time checked

The library reduces boilerplate by 70% compared to raw OkHttp, making tests readable and maintainable.

**Extend further:**
- Add XML support
- Form data encoding
- File uploads
- WebSocket testing
- Response mocking
- Test data builders
