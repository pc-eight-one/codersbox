---
title: "Hexagonal Architecture in Spring Boot with Kotlin: A Practical Guide"
description: "Learn Hexagonal Architecture (Ports and Adapters) by building a Todo application with Spring Boot and Kotlin. Understand domain-driven design, dependency inversion, and clean separation of concerns."
publishDate: 2026-03-05
author: "Prashant Chaturvedi"
tags: ["Kotlin", "Spring Boot", "Hexagonal Architecture", "Clean Architecture", "Domain-Driven Design", "Software Architecture"]
readTime: "30 min read"
---

# Hexagonal Architecture in Spring Boot with Kotlin: A Practical Guide

Hexagonal Architecture, also known as Ports and Adapters, is a design pattern that promotes separation of concerns by isolating the domain logic from external concerns like databases, user interfaces, and external services. This architectural style makes your applications more testable, maintainable, and adaptable to change.

In this comprehensive guide, we'll build a Todo application using Hexagonal Architecture with Spring Boot and Kotlin. You'll learn how to structure your application to keep business logic pure and independent of frameworks.

## What You'll Learn

- Core concepts of Hexagonal Architecture
- How to structure a Spring Boot application using ports and adapters
- Domain-driven design principles in practice
- Dependency inversion and interface segregation
- Testing strategies for hexagonal applications
- Practical implementation of a complete Todo application

## Understanding Hexagonal Architecture

Hexagonal Architecture organizes code into three main layers:

1. **Domain Layer**: Contains pure business logic, entities, and domain services. This layer has no dependencies on frameworks or external systems.

2. **Application Layer**: Defines use cases and orchestrates domain operations. It depends only on the domain layer and defines ports (interfaces) for external interactions.

3. **Infrastructure Layer**: Contains adapters that implement the ports defined in the application layer. This includes database repositories, REST controllers, message queues, and external service clients.

The key principle is **dependency inversion**: the domain and application layers define interfaces (ports), and the infrastructure layer provides implementations (adapters). This means dependencies point inward toward the domain, not outward.

## Project Structure

```
src/
├── main/
│   └── kotlin/
│       └── com/example/todo/
│           ├── domain/              # Domain Layer
│           │   ├── model/
│           │   └── exception/
│           ├── application/         # Application Layer
│           │   ├── port/in/         # Input ports (use case interfaces)
│           │   ├── port/out/        # Output ports (repository interfaces)
│           │   └── service/
│           └── infrastructure/      # Infrastructure Layer
│               ├── adapter/
│               │   ├── in/
│               │   │   └── web/     # REST controllers
│               │   └── out/
│               │       └── persistence/  # Database adapters
│               └── config/
└── test/
```

## Domain Layer: The Heart of Your Application

The domain layer contains your business logic and should have zero dependencies on Spring or any other framework.

### Domain Model: Todo Entity

```kotlin
package com.example.todo.domain.model

import java.time.LocalDateTime
import java.util.UUID

data class Todo(
    val id: UUID = UUID.randomUUID(),
    val title: String,
    val description: String? = null,
    val completed: Boolean = false,
    val createdAt: LocalDateTime = LocalDateTime.now(),
    val updatedAt: LocalDateTime = LocalDateTime.now()
) {
    init {
        require(title.isNotBlank()) { "Todo title cannot be blank" }
        require(title.length <= 200) { "Todo title cannot exceed 200 characters" }
    }

    fun complete(): Todo = copy(
        completed = true,
        updatedAt = LocalDateTime.now()
    )

    fun uncomplete(): Todo = copy(
        completed = false,
        updatedAt = LocalDateTime.now()
    )

    fun update(title: String, description: String?): Todo {
        require(title.isNotBlank()) { "Todo title cannot be blank" }
        require(title.length <= 200) { "Todo title cannot exceed 200 characters" }
        
        return copy(
            title = title,
            description = description,
            updatedAt = LocalDateTime.now()
        )
    }
}
```

**Why this matters**: The `Todo` class is a pure data class with business rules enforced in the constructor and methods. It doesn't know about databases, HTTP, or any framework. The `complete()`, `uncomplete()`, and `update()` methods return new instances (immutability), making the code thread-safe and predictable.

### Domain Exceptions

```kotlin
package com.example.todo.domain.exception

sealed class DomainException(message: String) : RuntimeException(message)

class TodoNotFoundException(id: String) : DomainException("Todo with id $id not found")

class DuplicateTodoException(title: String) : DomainException("Todo with title '$title' already exists")

class InvalidTodoStateException(message: String) : DomainException(message)
```

**Why this matters**: Using sealed classes for exceptions creates a type-safe hierarchy. Callers can catch specific exceptions or the general `DomainException` base class.

## Application Layer: Defining Ports and Use Cases

The application layer orchestrates domain operations and defines contracts (ports) for external interactions.

### Input Ports: Use Case Interfaces

Input ports define what operations the application supports. These are typically implemented by application services.

```kotlin
package com.example.todo.application.port.`in`

import com.example.todo.domain.model.Todo
import java.util.UUID

interface CreateTodoUseCase {
    fun create(command: CreateTodoCommand): Todo
}

data class CreateTodoCommand(
    val title: String,
    val description: String?
)
```

```kotlin
package com.example.todo.application.port.`in`

import com.example.todo.domain.model.Todo
import java.util.UUID

interface GetTodoUseCase {
    fun getById(id: UUID): Todo
    fun getAll(): List<Todo>
    fun getByStatus(completed: Boolean): List<Todo>
}
```

```kotlin
package com.example.todo.application.port.`in`

import com.example.todo.domain.model.Todo
import java.util.UUID

interface UpdateTodoUseCase {
    fun update(command: UpdateTodoCommand): Todo
}

data class UpdateTodoCommand(
    val id: UUID,
    val title: String,
    val description: String?
)
```

```kotlin
package com.example.todo.application.port.`in`

import java.util.UUID

interface DeleteTodoUseCase {
    fun delete(id: UUID)
}
```

```kotlin
package com.example.todo.application.port.`in`

import com.example.todo.domain.model.Todo
import java.util.UUID

interface CompleteTodoUseCase {
    fun complete(id: UUID): Todo
    fun uncomplete(id: UUID): Todo
}
```

**Why this matters**: Each use case is represented by a focused interface with a single responsibility. The command objects (`CreateTodoCommand`, `UpdateTodoCommand`) encapsulate all parameters needed for the operation, making the API explicit and type-safe.

### Output Ports: Repository Interfaces

Output ports define what the application needs from external systems. The domain doesn't care how these are implemented.

```kotlin
package com.example.todo.application.port.out

import com.example.todo.domain.model.Todo
import java.util.UUID

interface TodoRepository {
    fun save(todo: Todo): Todo
    fun findById(id: UUID): Todo?
    fun findAll(): List<Todo>
    fun findByCompleted(completed: Boolean): List<Todo>
    fun findByTitle(title: String): Todo?
    fun delete(id: UUID)
    fun existsByTitle(title: String): Boolean
}
```

**Why this matters**: The repository interface is defined in the application layer, not the infrastructure layer. This inverts the dependency: the domain/application defines what it needs, and infrastructure provides it. Notice the return type uses nullable `Todo?` instead of `Optional<Todo>` - this is idiomatic Kotlin.

### Application Service Implementation

```kotlin
package com.example.todo.application.service

import com.example.todo.application.port.`in`.CreateTodoCommand
import com.example.todo.application.port.`in`.CreateTodoUseCase
import com.example.todo.application.port.out.TodoRepository
import com.example.todo.domain.exception.DuplicateTodoException
import com.example.todo.domain.model.Todo
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
@Transactional
class CreateTodoService(
    private val todoRepository: TodoRepository
) : CreateTodoUseCase {

    override fun create(command: CreateTodoCommand): Todo {
        if (todoRepository.existsByTitle(command.title)) {
            throw DuplicateTodoException(command.title)
        }

        val todo = Todo(
            title = command.title,
            description = command.description
        )

        return todoRepository.save(todo)
    }
}
```

**Why this matters**: The service implements the input port interface and depends on the output port interface. It orchestrates the use case: checking for duplicates, creating the domain object, and persisting it. The `@Transactional` annotation is an infrastructure concern, but it's acceptable here since this is the boundary between application and infrastructure.

```kotlin
package com.example.todo.application.service

import com.example.todo.application.port.`in`.GetTodoUseCase
import com.example.todo.application.port.out.TodoRepository
import com.example.todo.domain.exception.TodoNotFoundException
import com.example.todo.domain.model.Todo
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Service
@Transactional(readOnly = true)
class GetTodoService(
    private val todoRepository: TodoRepository
) : GetTodoUseCase {

    override fun getById(id: UUID): Todo {
        return todoRepository.findById(id)
            ?: throw TodoNotFoundException(id.toString())
    }

    override fun getAll(): List<Todo> {
        return todoRepository.findAll()
    }

    override fun getByStatus(completed: Boolean): List<Todo> {
        return todoRepository.findByCompleted(completed)
    }
}
```

```kotlin
package com.example.todo.application.service

import com.example.todo.application.port.`in`.UpdateTodoCommand
import com.example.todo.application.port.`in`.UpdateTodoUseCase
import com.example.todo.application.port.out.TodoRepository
import com.example.todo.domain.exception.DuplicateTodoException
import com.example.todo.domain.exception.TodoNotFoundException
import com.example.todo.domain.model.Todo
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
@Transactional
class UpdateTodoService(
    private val todoRepository: TodoRepository
) : UpdateTodoUseCase {

    override fun update(command: UpdateTodoCommand): Todo {
        val existingTodo = todoRepository.findById(command.id)
            ?: throw TodoNotFoundException(command.id.toString())

        val todoWithSameTitle = todoRepository.findByTitle(command.title)
        if (todoWithSameTitle != null && todoWithSameTitle.id != command.id) {
            throw DuplicateTodoException(command.title)
        }

        val updatedTodo = existingTodo.update(
            title = command.title,
            description = command.description
        )

        return todoRepository.save(updatedTodo)
    }
}
```

```kotlin
package com.example.todo.application.service

import com.example.todo.application.port.`in`.DeleteTodoUseCase
import com.example.todo.application.port.out.TodoRepository
import com.example.todo.domain.exception.TodoNotFoundException
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Service
@Transactional
class DeleteTodoService(
    private val todoRepository: TodoRepository
) : DeleteTodoUseCase {

    override fun delete(id: UUID) {
        if (todoRepository.findById(id) == null) {
            throw TodoNotFoundException(id.toString())
        }
        todoRepository.delete(id)
    }
}
```

```kotlin
package com.example.todo.application.service

import com.example.todo.application.port.`in`.CompleteTodoUseCase
import com.example.todo.application.port.out.TodoRepository
import com.example.todo.domain.exception.TodoNotFoundException
import com.example.todo.domain.model.Todo
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Service
@Transactional
class CompleteTodoService(
    private val todoRepository: TodoRepository
) : CompleteTodoUseCase {

    override fun complete(id: UUID): Todo {
        val todo = todoRepository.findById(id)
            ?: throw TodoNotFoundException(id.toString())
        
        return todoRepository.save(todo.complete())
    }

    override fun uncomplete(id: UUID): Todo {
        val todo = todoRepository.findById(id)
            ?: throw TodoNotFoundException(id.toString())
        
        return todoRepository.save(todo.uncomplete())
    }
}
```

**Why this matters**: Each service is focused on a single use case and implements the corresponding input port. They delegate to the domain model for business logic (like `todo.complete()`) and use the output port for persistence. This keeps business rules in the domain while orchestration lives in the application layer.

## Infrastructure Layer: Adapters

The infrastructure layer contains concrete implementations of the ports defined in the application layer.

### Persistence Adapter

First, let's create a JPA entity that mirrors our domain model:

```kotlin
package com.example.todo.infrastructure.adapter.out.persistence

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.time.LocalDateTime
import java.util.UUID

@Entity
@Table(name = "todos")
class TodoJpaEntity(
    @Id
    val id: UUID = UUID.randomUUID(),

    @Column(nullable = false, length = 200)
    var title: String,

    @Column(length = 2000)
    var description: String? = null,

    @Column(nullable = false)
    var completed: Boolean = false,

    @Column(nullable = false)
    var createdAt: LocalDateTime = LocalDateTime.now(),

    @Column(nullable = false)
    var updatedAt: LocalDateTime = LocalDateTime.now()
)
```

**Why this matters**: The JPA entity is separate from the domain model. This allows the domain model to remain pure while the JPA entity handles database-specific concerns like annotations and lazy loading.

```kotlin
package com.example.todo.infrastructure.adapter.out.persistence

import com.example.todo.domain.model.Todo

object TodoMapper {

    fun toDomain(jpaEntity: TodoJpaEntity): Todo = Todo(
        id = jpaEntity.id,
        title = jpaEntity.title,
        description = jpaEntity.description,
        completed = jpaEntity.completed,
        createdAt = jpaEntity.createdAt,
        updatedAt = jpaEntity.updatedAt
    )

    fun toJpaEntity(domain: Todo): TodoJpaEntity = TodoJpaEntity(
        id = domain.id,
        title = domain.title,
        description = domain.description,
        completed = domain.completed,
        createdAt = domain.createdAt,
        updatedAt = domain.updatedAt
    )

    fun updateJpaEntity(jpaEntity: TodoJpaEntity, domain: Todo) {
        jpaEntity.title = domain.title
        jpaEntity.description = domain.description
        jpaEntity.completed = domain.completed
        jpaEntity.updatedAt = domain.updatedAt
    }
}
```

**Why this matters**: The mapper isolates the conversion logic between domain and persistence models. This is crucial because the two models may diverge over time (e.g., the JPA entity might have additional fields for auditing or optimistic locking).

```kotlin
package com.example.todo.infrastructure.adapter.out.persistence

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface TodoJpaRepository : JpaRepository<TodoJpaEntity, UUID> {
    fun findByCompleted(completed: Boolean): List<TodoJpaEntity>
    fun findByTitle(title: String): TodoJpaEntity?
    fun existsByTitle(title: String): Boolean
}
```

**Why this matters**: Spring Data JPA provides the basic CRUD operations, and we add custom queries for our specific needs. This interface is package-private to the infrastructure layer - the domain never sees it.

```kotlin
package com.example.todo.infrastructure.adapter.out.persistence

import com.example.todo.application.port.out.TodoRepository
import com.example.todo.domain.model.Todo
import org.springframework.stereotype.Component
import java.util.UUID

@Component
class TodoPersistenceAdapter(
    private val todoJpaRepository: TodoJpaRepository
) : TodoRepository {

    override fun save(todo: Todo): Todo {
        val existingEntity = todoJpaRepository.findById(todo.id)
        
        val savedEntity = if (existingEntity.isPresent) {
            val entity = existingEntity.get()
            TodoMapper.updateJpaEntity(entity, todo)
            todoJpaRepository.save(entity)
        } else {
            todoJpaRepository.save(TodoMapper.toJpaEntity(todo))
        }
        
        return TodoMapper.toDomain(savedEntity)
    }

    override fun findById(id: UUID): Todo? {
        return todoJpaRepository.findById(id)
            .map { TodoMapper.toDomain(it) }
            .orElse(null)
    }

    override fun findAll(): List<Todo> {
        return todoJpaRepository.findAll()
            .map { TodoMapper.toDomain(it) }
    }

    override fun findByCompleted(completed: Boolean): List<Todo> {
        return todoJpaRepository.findByCompleted(completed)
            .map { TodoMapper.toDomain(it) }
    }

    override fun findByTitle(title: String): Todo? {
        return todoJpaRepository.findByTitle(title)
            ?.let { TodoMapper.toDomain(it) }
    }

    override fun delete(id: UUID) {
        todoJpaRepository.deleteById(id)
    }

    override fun existsByTitle(title: String): Boolean {
        return todoJpaRepository.existsByTitle(title)
    }
}
```

**Why this matters**: The adapter implements the `TodoRepository` port from the application layer. It translates between the domain model and JPA entities using the mapper. This is where the framework-specific code lives - if we wanted to switch to MongoDB or a REST API, we'd only change this adapter, not the domain or application layers.

### Web Adapter: REST Controllers

```kotlin
package com.example.todo.infrastructure.adapter.`in`.web

import com.example.todo.application.port.`in`.CreateTodoCommand
import com.example.todo.application.port.`in`.CreateTodoUseCase
import com.example.todo.domain.model.Todo
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/todos")
class CreateTodoController(
    private val createTodoUseCase: CreateTodoUseCase
) {

    @PostMapping
    fun create(@RequestBody request: CreateTodoRequest): ResponseEntity<TodoResponse> {
        val command = CreateTodoCommand(
            title = request.title,
            description = request.description
        )
        
        val todo = createTodoUseCase.create(command)
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(TodoResponse.fromDomain(todo))
    }
}

data class CreateTodoRequest(
    val title: String,
    val description: String?
)
```

**Why this matters**: The controller depends only on the input port interface (`CreateTodoUseCase`), not the concrete service. This allows easy testing with mocks. The controller's job is to translate HTTP requests to use case commands and responses to HTTP responses.

```kotlin
package com.example.todo.infrastructure.adapter.`in`.web

import com.example.todo.application.port.`in`.GetTodoUseCase
import com.example.todo.domain.model.Todo
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
@RequestMapping("/api/todos")
class GetTodoController(
    private val getTodoUseCase: GetTodoUseCase
) {

    @GetMapping
    fun getAll(
        @RequestParam(required = false) completed: Boolean?
    ): ResponseEntity<List<TodoResponse>> {
        val todos = if (completed != null) {
            getTodoUseCase.getByStatus(completed)
        } else {
            getTodoUseCase.getAll()
        }
        
        return ResponseEntity.ok(todos.map { TodoResponse.fromDomain(it) })
    }

    @GetMapping("/{id}")
    fun getById(@PathVariable id: UUID): ResponseEntity<TodoResponse> {
        val todo = getTodoUseCase.getById(id)
        return ResponseEntity.ok(TodoResponse.fromDomain(todo))
    }
}
```

```kotlin
package com.example.todo.infrastructure.adapter.`in`.web

import com.example.todo.application.port.`in`.UpdateTodoCommand
import com.example.todo.application.port.`in`.UpdateTodoUseCase
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
@RequestMapping("/api/todos")
class UpdateTodoController(
    private val updateTodoUseCase: UpdateTodoUseCase
) {

    @PutMapping("/{id}")
    fun update(
        @PathVariable id: UUID,
        @RequestBody request: UpdateTodoRequest
    ): ResponseEntity<TodoResponse> {
        val command = UpdateTodoCommand(
            id = id,
            title = request.title,
            description = request.description
        )
        
        val todo = updateTodoUseCase.update(command)
        return ResponseEntity.ok(TodoResponse.fromDomain(todo))
    }
}

data class UpdateTodoRequest(
    val title: String,
    val description: String?
)
```

```kotlin
package com.example.todo.infrastructure.adapter.`in`.web

import com.example.todo.application.port.`in`.DeleteTodoUseCase
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
@RequestMapping("/api/todos")
class DeleteTodoController(
    private val deleteTodoUseCase: DeleteTodoUseCase
) {

    @DeleteMapping("/{id}")
    fun delete(@PathVariable id: UUID): ResponseEntity<Void> {
        deleteTodoUseCase.delete(id)
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build()
    }
}
```

```kotlin
package com.example.todo.infrastructure.adapter.`in`.web

import com.example.todo.application.port.`in`.CompleteTodoUseCase
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
@RequestMapping("/api/todos")
class CompleteTodoController(
    private val completeTodoUseCase: CompleteTodoUseCase
) {

    @PostMapping("/{id}/complete")
    fun complete(@PathVariable id: UUID): ResponseEntity<TodoResponse> {
        val todo = completeTodoUseCase.complete(id)
        return ResponseEntity.ok(TodoResponse.fromDomain(todo))
    }

    @PostMapping("/{id}/uncomplete")
    fun uncomplete(@PathVariable id: UUID): ResponseEntity<TodoResponse> {
        val todo = completeTodoUseCase.uncomplete(id)
        return ResponseEntity.ok(TodoResponse.fromDomain(todo))
    }
}
```

### DTOs and Response Objects

```kotlin
package com.example.todo.infrastructure.adapter.`in`.web

import com.example.todo.domain.model.Todo
import java.time.LocalDateTime
import java.util.UUID

data class TodoResponse(
    val id: UUID,
    val title: String,
    val description: String?,
    val completed: Boolean,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime
) {
    companion object {
        fun fromDomain(todo: Todo): TodoResponse = TodoResponse(
            id = todo.id,
            title = todo.title,
            description = todo.description,
            completed = todo.completed,
            createdAt = todo.createdAt,
            updatedAt = todo.updatedAt
        )
    }
}
```

**Why this matters**: The response DTO separates the API contract from the domain model. This allows the API to evolve independently from the domain - you might want to add computed fields, hide internal details, or use different naming conventions in the API.

### Global Exception Handler

```kotlin
package com.example.todo.infrastructure.adapter.`in`.web

import com.example.todo.domain.exception.DomainException
import com.example.todo.domain.exception.DuplicateTodoException
import com.example.todo.domain.exception.TodoNotFoundException
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice

@RestControllerAdvice
class GlobalExceptionHandler {

    @ExceptionHandler(TodoNotFoundException::class)
    fun handleNotFound(ex: TodoNotFoundException): ResponseEntity<ErrorResponse> {
        return ResponseEntity
            .status(HttpStatus.NOT_FOUND)
            .body(ErrorResponse(ex.message ?: "Resource not found"))
    }

    @ExceptionHandler(DuplicateTodoException::class)
    fun handleDuplicate(ex: DuplicateTodoException): ResponseEntity<ErrorResponse> {
        return ResponseEntity
            .status(HttpStatus.CONFLICT)
            .body(ErrorResponse(ex.message ?: "Resource already exists"))
    }

    @ExceptionHandler(DomainException::class)
    fun handleDomainException(ex: DomainException): ResponseEntity<ErrorResponse> {
        return ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .body(ErrorResponse(ex.message ?: "Invalid request"))
    }

    @ExceptionHandler(IllegalArgumentException::class)
    fun handleIllegalArgument(ex: IllegalArgumentException): ResponseEntity<ErrorResponse> {
        return ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .body(ErrorResponse(ex.message ?: "Invalid input"))
    }
}

data class ErrorResponse(
    val message: String,
    val timestamp: Long = System.currentTimeMillis()
)
```

**Why this matters**: The exception handler translates domain exceptions to appropriate HTTP responses. This keeps the domain layer free of HTTP concerns while providing meaningful error responses to API clients.

## Configuration

```kotlin
package com.example.todo.infrastructure.config

import org.springframework.context.annotation.Configuration
import org.springframework.data.jpa.repository.config.EnableJpaRepositories

@Configuration
@EnableJpaRepositories(basePackages = ["com.example.todo.infrastructure.adapter.out.persistence"])
class JpaConfig
```

## Testing Strategy

One of the main benefits of Hexagonal Architecture is testability. Let's look at how to test each layer.

### Domain Layer Tests

```kotlin
package com.example.todo.domain.model

import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.assertThatThrownBy
import org.junit.jupiter.api.Test
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.ValueSource

class TodoTest {

    @Test
    fun `should create todo with valid title`() {
        val todo = Todo(title = "Test Todo", description = "Description")

        assertThat(todo.title).isEqualTo("Test Todo")
        assertThat(todo.description).isEqualTo("Description")
        assertThat(todo.completed).isFalse()
    }

    @ParameterizedTest
    @ValueSource(strings = ["", "   "])
    fun `should throw exception when title is blank`(title: String) {
        assertThatThrownBy { Todo(title = title) }
            .isInstanceOf(IllegalArgumentException::class.java)
            .hasMessageContaining("cannot be blank")
    }

    @Test
    fun `should throw exception when title exceeds 200 characters`() {
        val longTitle = "a".repeat(201)
        
        assertThatThrownBy { Todo(title = longTitle) }
            .isInstanceOf(IllegalArgumentException::class.java)
            .hasMessageContaining("cannot exceed 200 characters")
    }

    @Test
    fun `should complete todo`() {
        val todo = Todo(title = "Test")
        val completed = todo.complete()

        assertThat(completed.completed).isTrue()
        assertThat(completed.updatedAt).isAfter(todo.updatedAt)
    }

    @Test
    fun `should uncomplete todo`() {
        val todo = Todo(title = "Test", completed = true)
        val uncompleted = todo.uncomplete()

        assertThat(uncompleted.completed).isFalse()
    }

    @Test
    fun `should update todo`() {
        val todo = Todo(title = "Original", description = "Original desc")
        val updated = todo.update(title = "Updated", description = "Updated desc")

        assertThat(updated.title).isEqualTo("Updated")
        assertThat(updated.description).isEqualTo("Updated desc")
        assertThat(updated.updatedAt).isAfter(todo.updatedAt)
    }
}
```

**Why this matters**: Domain tests are pure unit tests with no dependencies. They run fast and verify business rules directly.

### Application Layer Tests with Mocks

```kotlin
package com.example.todo.application.service

import com.example.todo.application.port.`in`.CreateTodoCommand
import com.example.todo.application.port.out.TodoRepository
import com.example.todo.domain.exception.DuplicateTodoException
import com.example.todo.domain.model.Todo
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.assertThatThrownBy
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.InjectMocks
import org.mockito.Mock
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever

@ExtendWith(MockitoExtension::class)
class CreateTodoServiceTest {

    @Mock
    private lateinit var todoRepository: TodoRepository

    @InjectMocks
    private lateinit var createTodoService: CreateTodoService

    @Test
    fun `should create todo when title is unique`() {
        val command = CreateTodoCommand(title = "New Todo", description = "Description")
        whenever(todoRepository.existsByTitle("New Todo")).thenReturn(false)
        whenever(todoRepository.save(org.mockito.kotlin.any()))
            .thenAnswer { it.arguments[0] as Todo }

        val result = createTodoService.create(command)

        assertThat(result.title).isEqualTo("New Todo")
        assertThat(result.description).isEqualTo("Description")
        verify(todoRepository).existsByTitle("New Todo")
        verify(todoRepository).save(org.mockito.kotlin.any())
    }

    @Test
    fun `should throw exception when title already exists`() {
        val command = CreateTodoCommand(title = "Existing Todo", description = null)
        whenever(todoRepository.existsByTitle("Existing Todo")).thenReturn(true)

        assertThatThrownBy { createTodoService.create(command) }
            .isInstanceOf(DuplicateTodoException::class.java)
            .hasMessageContaining("Existing Todo")
    }
}
```

**Why this matters**: Application layer tests use mocks for the output ports. This tests the orchestration logic without needing a real database.

### Integration Tests

```kotlin
package com.example.todo.infrastructure.adapter.out.persistence

import com.example.todo.application.port.out.TodoRepository
import com.example.todo.domain.model.Todo
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest
import org.springframework.context.annotation.Import
import org.springframework.test.context.ActiveProfiles

@DataJpaTest
@Import(TodoPersistenceAdapter::class, TodoMapper::class)
@ActiveProfiles("test")
class TodoPersistenceAdapterTest {

    @Autowired
    private lateinit var todoRepository: TodoRepository

    @Test
    fun `should save and retrieve todo`() {
        val todo = Todo(title = "Test Todo", description = "Test Description")
        
        val saved = todoRepository.save(todo)
        val retrieved = todoRepository.findById(saved.id)

        assertThat(retrieved).isNotNull
        assertThat(retrieved!!.title).isEqualTo("Test Todo")
        assertThat(retrieved.description).isEqualTo("Test Description")
    }

    @Test
    fun `should find todos by completion status`() {
        val todo1 = todoRepository.save(Todo(title = "Todo 1", completed = false))
        val todo2 = todoRepository.save(Todo(title = "Todo 2", completed = true))

        val incompleteTodos = todoRepository.findByCompleted(false)
        val completeTodos = todoRepository.findByCompleted(true)

        assertThat(incompleteTodos).hasSize(1)
        assertThat(incompleteTodos[0].id).isEqualTo(todo1.id)
        assertThat(completeTodos).hasSize(1)
        assertThat(completeTodos[0].id).isEqualTo(todo2.id)
    }

    @Test
    fun `should check if title exists`() {
        todoRepository.save(Todo(title = "Unique Title"))

        assertThat(todoRepository.existsByTitle("Unique Title")).isTrue()
        assertThat(todoRepository.existsByTitle("Non-existent")).isFalse()
    }
}
```

**Why this matters**: Integration tests verify that the adapter works correctly with the real database. `@DataJpaTest` provides a lightweight test context with an embedded database.

### Web Layer Tests

```kotlin
package com.example.todo.infrastructure.adapter.`in`.web

import com.example.todo.application.port.`in`.CreateTodoCommand
import com.example.todo.application.port.`in`.CreateTodoUseCase
import com.example.todo.domain.exception.DuplicateTodoException
import com.example.todo.domain.model.Todo
import com.fasterxml.jackson.databind.ObjectMapper
import org.junit.jupiter.api.Test
import org.mockito.kotlin.whenever
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.http.MediaType
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status

@WebMvcTest(CreateTodoController::class)
class CreateTodoControllerTest {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    @MockitoBean
    private lateinit var createTodoUseCase: CreateTodoUseCase

    @Test
    fun `should create todo and return 201`() {
        val request = CreateTodoRequest(title = "New Todo", description = "Description")
        val todo = Todo(title = "New Todo", description = "Description")
        
        whenever(createTodoUseCase.create(CreateTodoCommand("New Todo", "Description")))
            .thenReturn(todo)

        mockMvc.perform(
            post("/api/todos")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
        )
            .andExpect(status().isCreated)
            .andExpect(jsonPath("$.title").value("New Todo"))
            .andExpect(jsonPath("$.description").value("Description"))
            .andExpect(jsonPath("$.completed").value(false))
    }

    @Test
    fun `should return 409 when todo already exists`() {
        val request = CreateTodoRequest(title = "Existing", description = null)
        
        whenever(createTodoUseCase.create(CreateTodoCommand("Existing", null)))
            .thenThrow(DuplicateTodoException("Existing"))

        mockMvc.perform(
            post("/api/todos")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
        )
            .andExpect(status().isConflict)
    }
}
```

**Why this matters**: Web layer tests use `@WebMvcTest` to test controllers in isolation. The use case is mocked, so these tests verify HTTP mapping, request/response handling, and error responses.

## Benefits of Hexagonal Architecture

1. **Testability**: Each layer can be tested independently. Domain logic has no dependencies, application logic uses mocks, and infrastructure is tested with real implementations.

2. **Flexibility**: You can swap out infrastructure components without touching domain or application code. Want to switch from JPA to MongoDB? Just create a new adapter implementing the same port.

3. **Framework Independence**: The domain and application layers are pure Kotlin with no Spring dependencies. This makes them portable and easier to reason about.

4. **Clear Boundaries**: The ports (interfaces) create explicit contracts between layers, making the codebase easier to understand and maintain.

5. **Evolution**: As requirements change, you can evolve each layer independently. Add a new use case by implementing the input port. Add a new persistence mechanism by implementing the output port.

## Common Patterns and Best Practices

### 1. Keep Domain Models Pure

Domain models should not have framework annotations or infrastructure concerns. If you need JPA, create separate entities and use mappers.

### 2. Use Command Objects

Encapsulate use case parameters in command objects rather than passing many parameters. This makes the API explicit and easier to extend.

### 3. One Use Case Per Service

Each application service should implement one use case interface. This keeps services focused and follows the Single Responsibility Principle.

### 4. Transaction Boundaries

Place `@Transactional` on application services, not domain models. The service orchestrates the transaction boundary.

### 5. Validation Layers

- **Domain validation**: Business rules (e.g., title cannot be blank)
- **Application validation**: Cross-aggregate rules (e.g., checking for duplicates)
- **Input validation**: Format and type checking (e.g., valid UUID, required fields)

### 6. Error Handling

Use domain exceptions for business errors and translate them to appropriate HTTP responses in the web layer. Don't leak HTTP status codes into the domain.

## When to Use Hexagonal Architecture

Hexagonal Architecture is beneficial when:

- You have complex business logic that needs to be tested thoroughly
- You anticipate changing infrastructure (database, messaging, external APIs)
- You want to defer technology decisions (start with in-memory, switch to real database later)
- Multiple teams work on different parts of the system
- You need to support multiple interfaces (REST, CLI, messaging) with the same core logic

It might be overkill for:

- Simple CRUD applications with minimal business logic
- Prototypes or MVPs where speed is more important than structure
- Applications unlikely to change infrastructure or grow significantly

## Summary

Hexagonal Architecture provides a clean separation between business logic and technical concerns. By organizing code into domain, application, and infrastructure layers with well-defined ports, you create a system that is:

- **Testable**: Each layer can be tested in isolation
- **Flexible**: Infrastructure can be swapped without touching business logic
- **Maintainable**: Clear boundaries make the code easier to understand
- **Evolvable**: New features and technologies can be added with minimal impact

The Todo application we've built demonstrates these principles in practice. The domain layer contains pure business logic, the application layer orchestrates use cases through ports, and the infrastructure layer provides concrete implementations. This structure scales well as your application grows and requirements change.

Start with the domain, define your ports, and let the infrastructure adapt to your business needs rather than the other way around.
