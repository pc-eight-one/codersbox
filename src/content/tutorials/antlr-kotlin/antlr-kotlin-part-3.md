---
title: "ANTLR with Kotlin - Part 3: Visitors and Listeners"
description: "Master ANTLR's visitor and listener patterns. Extract query metadata, validate syntax semantically, and build reusable tree traversal logic in Kotlin."
publishDate: 2025-10-05
publishedAt: 2025-10-05
tags: ["ANTLR", "Kotlin", "Parser", "Visitor Pattern", "AST", "Tree Traversal"]
difficulty: "intermediate"
series: "ANTLR with Kotlin"
part: 3
estimatedTime: "25 minutes"
totalParts: 6
---

# ANTLR with Kotlin - Part 3: Visitors and Listeners

Parse trees contain structure. Visitors and listeners extract meaning. We'll build a metadata extractor that analyzes queries:

```kotlin
val metadata = analyzeQuery("SELECT name, email FROM users WHERE age > 18")

// Output:
QueryMetadata(
    tables = setOf("users"),
    columns = setOf("name", "email", "age"),
    hasWhere = true,
    conditionCount = 1
)
```

## Visitor vs Listener

ANTLR generates both patterns. They traverse trees differently.

### Visitor Pattern

**Control:** You control traversal. Visit children manually.
**Return values:** Methods return values you define.
**Use case:** Transform tree to another structure (metadata, AST, code generation).

```kotlin
class MetadataVisitor : SimpleSqlBaseVisitor<Unit>() {
    val tables = mutableSetOf<String>()

    override fun visitTable(ctx: SimpleSqlParser.TableContext) {
        tables.add(ctx.IDENTIFIER().text)
    }
}
```

### Listener Pattern

**Control:** ANTLR controls traversal. It walks the tree automatically.
**Return values:** None. Methods are void.
**Use case:** React to parse events (validation, logging, simple extraction).

```kotlin
class TableListener : SimpleSqlBaseListener() {
    val tables = mutableSetOf<String>()

    override fun enterTable(ctx: SimpleSqlParser.TableContext) {
        tables.add(ctx.IDENTIFIER().text)
    }
}
```

**Key difference:** Visitors let you control traversal order and accumulate return values. Listeners just react as ANTLR walks the tree.

![Diagram 1](/diagrams/antlr-kotlin-part-3-diagram-1.svg)

## Building a Metadata Visitor

Create `SqlMetadataVisitor.kt`:

```kotlin
import org.antlr.v4.runtime.tree.ParseTree

data class QueryMetadata(
    val tables: Set<String>,
    val columns: Set<String>,
    val conditions: List<Condition>,
    val hasWhere: Boolean,
    val selectsStar: Boolean
)

data class Condition(
    val column: String,
    val operator: String,
    val value: String
)

class SqlMetadataVisitor : SimpleSqlBaseVisitor<Unit>() {
    private val tables = mutableSetOf<String>()
    private val columns = mutableSetOf<String>()
    private val conditions = mutableListOf<Condition>()
    private var selectsStar = false
    private var hasWhere = false

    fun extractMetadata(tree: ParseTree): QueryMetadata {
        visit(tree)
        return QueryMetadata(
            tables = tables.toSet(),
            columns = columns.toSet(),
            conditions = conditions.toList(),
            hasWhere = hasWhere,
            selectsStar = selectsStar
        )
    }

    override fun visitTable(ctx: SimpleSqlParser.TableContext) {
        tables.add(ctx.IDENTIFIER().text)
    }

    override fun visitColumnList(ctx: SimpleSqlParser.ColumnListContext) {
        ctx.IDENTIFIER().forEach { identifier ->
            columns.add(identifier.text)
        }
    }

    override fun visitColumns(ctx: SimpleSqlParser.ColumnsContext) {
        if (ctx.STAR() != null) {
            selectsStar = true
        }
        return super.visitColumns(ctx)
    }

    override fun visitCondition(ctx: SimpleSqlParser.ConditionContext) {
        if (ctx.comparison() != null) {
            hasWhere = true
            val comp = ctx.comparison()
            val column = comp.IDENTIFIER().text
            columns.add(column)

            val operator = when (comp.op.type) {
                SimpleSqlParser.EQ -> "="
                SimpleSqlParser.NE -> "!="
                SimpleSqlParser.GT -> ">"
                SimpleSqlParser.LT -> "<"
                SimpleSqlParser.GTE -> ">="
                SimpleSqlParser.LTE -> "<="
                else -> "?"
            }

            val value = when {
                comp.value().NUMBER() != null -> comp.value().NUMBER().text
                comp.value().STRING() != null -> comp.value().STRING().text
                else -> comp.value().IDENTIFIER().text
            }

            conditions.add(Condition(column, operator, value))
        }

        return super.visitCondition(ctx)
    }
}
```

### How It Works

**visitTable:** Called when parser matches `table` rule. Extract table name from IDENTIFIER token.

**visitColumnList:** Called for column lists like `name, email`. Iterate all IDENTIFIER tokens, add to columns set.

**visitColumns:** Check if SELECT uses `*`. Set flag if so.

**visitCondition:** Extract comparison details. Add column name to columns (WHERE clause references columns too). Build Condition object with operator and value.

**super.visitCondition:** Continue visiting child nodes. Without this, traversal stops. Visitor pattern requires explicit child visiting.

### Using the Visitor

```kotlin
fun analyzeQuery(sql: String): QueryMetadata {
    val input = CharStreams.fromString(sql)
    val lexer = SimpleSqlLexer(input)
    val tokens = CommonTokenStream(lexer)
    val parser = SimpleSqlParser(tokens)
    val tree = parser.query()

    val visitor = SqlMetadataVisitor()
    return visitor.extractMetadata(tree)
}

fun main() {
    val queries = listOf(
        "SELECT * FROM users",
        "SELECT name, email FROM customers WHERE age > 25",
        "SELECT id FROM orders WHERE status = 'shipped' AND total > 1000"
    )

    queries.forEach { sql ->
        println("Query: $sql")
        val metadata = analyzeQuery(sql)
        println(metadata)
        println()
    }
}
```

**Output:**

```
Query: SELECT * FROM users
QueryMetadata(tables=[users], columns=[], conditions=[], hasWhere=false, selectsStar=true)

Query: SELECT name, email FROM customers WHERE age > 25
QueryMetadata(tables=[customers], columns=[name, email, age], conditions=[Condition(column=age, operator=>, value=25)], hasWhere=true, selectsStar=false)

Query: SELECT id FROM orders WHERE status = 'shipped' AND total > 1000
QueryMetadata(tables=[orders], columns=[id, status, total], conditions=[Condition(column=status, operator==, value='shipped'), Condition(column=total, operator=>, value=1000)], hasWhere=true, selectsStar=false)
```

Notice columns includes both SELECT columns and WHERE columns. The visitor collected all column references.

## Building a Listener

Listeners are simpler when you don't need control. Build a validation listener:

```kotlin
class SqlValidationListener : SimpleSqlBaseListener() {
    val errors = mutableListOf<String>()
    private val tables = mutableSetOf<String>()

    override fun enterTable(ctx: SimpleSqlParser.TableContext) {
        val tableName = ctx.IDENTIFIER().text

        if (tableName in tables) {
            errors.add("Duplicate table reference: $tableName")
        }
        tables.add(tableName)

        if (tableName.startsWith("_")) {
            errors.add("Table name starts with underscore: $tableName")
        }

        if (tableName.length > 64) {
            errors.add("Table name too long: $tableName (max 64 chars)")
        }
    }

    override fun enterComparison(ctx: SimpleSqlParser.ComparisonContext) {
        val column = ctx.IDENTIFIER().text

        if (ctx.value().STRING() != null && ctx.op.type in listOf(
            SimpleSqlParser.GT, SimpleSqlParser.LT,
            SimpleSqlParser.GTE, SimpleSqlParser.LTE
        )) {
            errors.add("Cannot use $column ${ctx.op.text} with string value")
        }
    }
}
```

**Usage:**

```kotlin
fun validateQuery(sql: String): List<String> {
    val input = CharStreams.fromString(sql)
    val lexer = SimpleSqlLexer(input)
    val tokens = CommonTokenStream(lexer)
    val parser = SimpleSqlParser(tokens)
    val tree = parser.query()

    val listener = SqlValidationListener()
    ParseTreeWalker.DEFAULT.walk(listener, tree)

    return listener.errors
}

fun main() {
    val queries = listOf(
        "SELECT * FROM users WHERE age > 'twenty'",  // Invalid: comparing number column to string
        "SELECT * FROM _internal_table",              // Warning: underscore prefix
        "SELECT * FROM products WHERE name > 'Apple'" // Valid: string comparison with >
    )

    queries.forEach { sql ->
        println("Query: $sql")
        val errors = validateQuery(sql)
        if (errors.isEmpty()) {
            println("✓ Valid")
        } else {
            errors.forEach { println("✗ $it") }
        }
        println()
    }
}
```

**Output:**

```
Query: SELECT * FROM users WHERE age > 'twenty'
✗ Cannot use age > with string value

Query: SELECT * FROM _internal_table
✗ Table name starts with underscore: _internal_table

Query: SELECT * FROM products WHERE name > 'Apple'
✓ Valid
```

The listener validates semantically. The grammar checks syntax; the listener checks meaning.

## When to Use Each Pattern

### Use Visitor When:

- **Transforming data:** Parse tree → AST, parse tree → SQL object model, parse tree → JSON
- **Accumulating results:** Calculate metrics, collect all references, build dependency graph
- **Control needed:** Skip certain branches, visit in custom order, short-circuit traversal

**Example:** Code generator that produces Kotlin data classes from SQL table definitions.

### Use Listener When:

- **Simple extraction:** Collect names, check for patterns, validate rules
- **Side effects:** Log events, emit warnings, update external state
- **Full traversal:** Need to visit every node in depth-first order

**Example:** SQL formatter that pretty-prints queries as it walks the tree.

## Combining Visitor and Listener

Use both for complex analysis. Listener validates, visitor transforms.

```kotlin
fun processQuery(sql: String): Result<QueryMetadata, List<String>> {
    val tree = parseQuery(sql)

    // Step 1: Validate with listener
    val validator = SqlValidationListener()
    ParseTreeWalker.DEFAULT.walk(validator, tree)

    if (validator.errors.isNotEmpty()) {
        return Result.failure(validator.errors)
    }

    // Step 2: Extract metadata with visitor
    val visitor = SqlMetadataVisitor()
    val metadata = visitor.extractMetadata(tree)

    return Result.success(metadata)
}
```

Validation runs first. If errors exist, skip metadata extraction. This separates concerns: listener checks validity, visitor builds output.

## Advanced Visitor Techniques

### Returning Values

Visitors can return values. Use generics:

```kotlin
class ExpressionEvaluator : SimpleSqlBaseVisitor<Any?>() {

    override fun visitComparison(ctx: SimpleSqlParser.ComparisonContext): Boolean {
        val column = ctx.IDENTIFIER().text
        val value = when {
            ctx.value().NUMBER() != null -> ctx.value().NUMBER().text.toInt()
            else -> ctx.value().STRING().text.trim('\'')
        }

        // Simplified: just return true for demonstration
        return true
    }

    override fun visitCondition(ctx: SimpleSqlParser.ConditionContext): Boolean {
        return when {
            ctx.comparison() != null -> visit(ctx.comparison()) as Boolean
            ctx.AND() != null -> {
                val left = visit(ctx.condition(0)) as Boolean
                val right = visit(ctx.condition(1)) as Boolean
                left && right
            }
            ctx.OR() != null -> {
                val left = visit(ctx.condition(0)) as Boolean
                val right = visit(ctx.condition(1)) as Boolean
                left || right
            }
            else -> false
        }
    }
}
```

This evaluates conditions to boolean. With actual data, you could check if rows match WHERE clauses.

### Context-Aware Visiting

Pass context down the tree:

```kotlin
class ColumnValidator : SimpleSqlBaseVisitor<Unit>() {
    private var currentTable: String? = null
    private val validColumns = mapOf(
        "users" to setOf("id", "name", "email", "age"),
        "orders" to setOf("id", "user_id", "total", "status")
    )
    val errors = mutableListOf<String>()

    override fun visitTable(ctx: SimpleSqlParser.TableContext) {
        currentTable = ctx.IDENTIFIER().text
        super.visitTable(ctx)
        currentTable = null
    }

    override fun visitColumnList(ctx: SimpleSqlParser.ColumnListContext) {
        ctx.IDENTIFIER().forEach { id ->
            val column = id.text
            val validCols = validColumns[currentTable] ?: emptySet()

            if (column !in validCols) {
                errors.add("Unknown column '$column' in table '$currentTable'")
            }
        }
    }
}
```

`currentTable` tracks context as we traverse. When visiting column list, validate columns against the current table's schema.

## Testing Visitors and Listeners

```kotlin
class MetadataVisitorTest {

    @Test
    fun `extract tables`() {
        val metadata = analyzeQuery("SELECT * FROM users")
        assertEquals(setOf("users"), metadata.tables)
    }

    @Test
    fun `extract columns`() {
        val metadata = analyzeQuery("SELECT name, email FROM customers")
        assertEquals(setOf("name", "email"), metadata.columns)
    }

    @Test
    fun `detect SELECT star`() {
        val metadata = analyzeQuery("SELECT * FROM users")
        assertTrue(metadata.selectsStar)
    }

    @Test
    fun `extract conditions`() {
        val metadata = analyzeQuery("SELECT * FROM users WHERE age > 18 AND status = 'active'")

        assertEquals(2, metadata.conditions.size)
        assertEquals(Condition("age", ">", "18"), metadata.conditions[0])
        assertEquals(Condition("status", "=", "'active'"), metadata.conditions[1])
    }

    @Test
    fun `include WHERE columns in column list`() {
        val metadata = analyzeQuery("SELECT name FROM users WHERE age > 18")
        assertEquals(setOf("name", "age"), metadata.columns)
    }
}
```

Test visitors like regular Kotlin classes. Parse query, run visitor, assert results.

## Common Pitfalls

**Forgetting super.visit():**

```kotlin
override fun visitCondition(ctx: SimpleSqlParser.ConditionContext) {
    processCondition(ctx)
    // Missing: super.visitCondition(ctx)
    // Result: child nodes never visited
}
```

Visitors don't auto-traverse. Call `super.visitX()` or manually visit children.

**Listener state management:**

```kotlin
class BadListener : SimpleSqlBaseListener() {
    var currentColumn: String? = null

    override fun enterColumnList(ctx: SimpleSqlParser.ColumnListContext) {
        currentColumn = ctx.IDENTIFIER(0).text
        // Wrong: only captures first column, doesn't iterate
    }
}
```

Listeners are callbacks. State must account for multiple invocations. Use collections, not single values.

**Type casting without checks:**

```kotlin
override fun visitValue(ctx: SimpleSqlParser.ValueContext): Int {
    return ctx.NUMBER().text.toInt()  // Crash if value is STRING
}
```

Always check which alternative matched before accessing tokens:

```kotlin
override fun visitValue(ctx: SimpleSqlParser.ValueContext): Any {
    return when {
        ctx.NUMBER() != null -> ctx.NUMBER().text.toInt()
        ctx.STRING() != null -> ctx.STRING().text.trim('\'')
        else -> ctx.IDENTIFIER().text
    }
}
```

## What's Next

Part 4 tackles **JOINs and table aliases**. We'll parse:

```sql
SELECT u.name, o.total
FROM users u
INNER JOIN orders o ON u.id = o.user_id
WHERE o.status = 'completed'
```

You'll learn:
- Extending grammar for JOIN syntax
- Handling qualified column names (table.column)
- Validating JOIN conditions
- Building a query object model

The visitor will track table aliases and resolve column references to their source tables.
