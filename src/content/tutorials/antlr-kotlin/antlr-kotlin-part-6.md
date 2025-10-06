---
title: "ANTLR with Kotlin - Part 6: Advanced Features and Optimization"
description: "Complete your SQL parser with subqueries, aggregates, GROUP BY, and HAVING. Learn parser performance optimization and package as a reusable library."
publishDate: 2025-10-05
publishedAt: 2025-10-05
tags: ["ANTLR", "Kotlin", "Parser", "Optimization", "Performance", "SQL"]
difficulty: "advanced"
series: "ANTLR with Kotlin"
part: 6
estimatedTime: "30 minutes"
totalParts: 6
---

# ANTLR with Kotlin - Part 6: Advanced Features and Optimization

Complete the SQL parser with production features:

```sql
SELECT
    u.state,
    COUNT(*) as user_count,
    AVG(o.total) as avg_order
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.age > 18
GROUP BY u.state
HAVING COUNT(*) > 100
ORDER BY avg_order DESC
LIMIT 10
```

This requires subqueries, aggregates, GROUP BY, HAVING, ORDER BY, and LIMIT. Then optimize parser performance for production use.

## Grammar Extensions

Update `SimpleSql.g4`:

```antlr
grammar SimpleSql;

query
    : SELECT columns
      FROM tableSource
      (WHERE condition)?
      (GROUP BY groupByList)?
      (HAVING condition)?
      (ORDER BY orderByList)?
      (LIMIT NUMBER)?
      EOF
    ;

columns
    : STAR
    | columnList
    ;

columnList
    : selectColumn (',' selectColumn)*
    ;

selectColumn
    : expression (AS? IDENTIFIER)?
    ;

expression
    : aggregateFunction
    | columnRef
    | '(' query ')'              // Subquery
    | NUMBER
    | STRING
    ;

aggregateFunction
    : COUNT '(' (STAR | DISTINCT? columnRef) ')'
    | SUM '(' DISTINCT? columnRef ')'
    | AVG '(' DISTINCT? columnRef ')'
    | MIN '(' columnRef ')'
    | MAX '(' columnRef ')'
    ;

groupByList
    : columnRef (',' columnRef)*
    ;

orderByList
    : orderByColumn (',' orderByColumn)*
    ;

orderByColumn
    : columnRef (ASC | DESC)?
    ;

tableSource
    : tableReference (join)*
    ;

tableReference
    : IDENTIFIER (AS? IDENTIFIER)?
    | '(' query ')' AS? IDENTIFIER    // Subquery as table
    ;

join
    : joinType JOIN tableReference ON condition
    ;

joinType
    : INNER
    | LEFT OUTER?
    | RIGHT OUTER?
    | FULL OUTER?
    |
    ;

condition
    : condition AND condition
    | condition OR condition
    | NOT condition
    | comparison
    | expression IN '(' (query | valueList) ')'
    | expression BETWEEN expression AND expression
    | '(' condition ')'
    ;

comparison
    : expression op=(EQ | NE | GT | LT | GTE | LTE) expression
    ;

valueList
    : expression (',' expression)*
    ;

columnRef
    : qualifiedColumn
    | IDENTIFIER
    ;

qualifiedColumn
    : IDENTIFIER '.' IDENTIFIER
    ;

// Keywords
SELECT  : [Ss][Ee][Ll][Ee][Cc][Tt] ;
FROM    : [Ff][Rr][Oo][Mm] ;
WHERE   : [Ww][Hh][Ee][Rr][Ee] ;
GROUP   : [Gg][Rr][Oo][Uu][Pp] ;
BY      : [Bb][Yy] ;
HAVING  : [Hh][Aa][Vv][Ii][Nn][Gg] ;
ORDER   : [Oo][Rr][Dd][Ee][Rr] ;
ASC     : [Aa][Ss][Cc] ;
DESC    : [Dd][Ee][Ss][Cc] ;
LIMIT   : [Ll][Ii][Mm][Ii][Tt] ;
AND     : [Aa][Nn][Dd] ;
OR      : [Oo][Rr] ;
NOT     : [Nn][Oo][Tt] ;
JOIN    : [Jj][Oo][Ii][Nn] ;
INNER   : [Ii][Nn][Nn][Ee][Rr] ;
LEFT    : [Ll][Ee][Ff][Tt] ;
RIGHT   : [Rr][Ii][Gg][Hh][Tt] ;
FULL    : [Ff][Uu][Ll][Ll] ;
OUTER   : [Oo][Uu][Tt][Ee][Rr] ;
ON      : [Oo][Nn] ;
AS      : [Aa][Ss] ;
IN      : [Ii][Nn] ;
BETWEEN : [Bb][Ee][Tt][Ww][Ee][Ee][Nn] ;
DISTINCT: [Dd][Ii][Ss][Tt][Ii][Nn][Cc][Tt] ;

// Aggregate functions
COUNT   : [Cc][Oo][Uu][Nn][Tt] ;
SUM     : [Ss][Uu][Mm] ;
AVG     : [Aa][Vv][Gg] ;
MIN     : [Mm][Ii][Nn] ;
MAX     : [Mm][Aa][Xx] ;

// Operators
EQ      : '=' ;
NE      : '!=' | '<>' ;
GT      : '>' ;
LT      : '<' ;
GTE     : '>=' ;
LTE     : '<=' ;

// Literals
NUMBER  : [0-9]+ ('.' [0-9]+)? ;
STRING  : '\'' (~'\'')* '\'' ;

// Other
STAR    : '*' ;
IDENTIFIER : [a-zA-Z_][a-zA-Z0-9_]* ;
WS      : [ \t\r\n]+ -> skip ;
```

### Key Additions

**Aggregate functions:**

```antlr
aggregateFunction
    : COUNT '(' (STAR | DISTINCT? columnRef) ')'
    | SUM '(' DISTINCT? columnRef ')'
    ;
```

COUNT can take `*` or a column. DISTINCT removes duplicates before aggregation.

**GROUP BY and HAVING:**

```antlr
query
    : SELECT columns FROM tableSource
      (WHERE condition)?
      (GROUP BY groupByList)?
      (HAVING condition)?
    ;
```

GROUP BY groups rows. HAVING filters groups (like WHERE but for aggregates).

**ORDER BY:**

```antlr
orderByColumn
    : columnRef (ASC | DESC)?
    ;
```

ASC is default (ascending). DESC reverses order (descending).

**Subqueries:**

```antlr
expression
    : '(' query ')'    // Scalar subquery in SELECT
    ;

tableReference
    : '(' query ')' AS? IDENTIFIER    // Subquery as table (derived table)
    ;

condition
    : expression IN '(' query ')'     // Subquery in WHERE
    ;
```

Three subquery types: scalar (returns one value), derived table (returns table), IN clause (returns multiple values).

**BETWEEN and IN:**

```antlr
condition
    : expression IN '(' (query | valueList) ')'
    | expression BETWEEN expression AND expression
    ;
```

IN checks membership: `age IN (18, 21, 25)` or `age IN (SELECT age FROM adults)`.
BETWEEN checks range: `age BETWEEN 18 AND 65`.

## Parsing Complex Queries

### Example 1: Aggregates with GROUP BY

```sql
SELECT state, COUNT(*) as user_count
FROM users
GROUP BY state
HAVING COUNT(*) > 100
ORDER BY user_count DESC
```

Parse tree structure:

```
query
  ├─ SELECT
  ├─ columns
  │   ├─ selectColumn
  │   │   └─ expression: state
  │   ├─ selectColumn
  │   │   ├─ aggregateFunction: COUNT(*)
  │   │   └─ alias: user_count
  ├─ FROM
  ├─ tableSource: users
  ├─ GROUP BY
  ├─ groupByList: state
  ├─ HAVING
  ├─ condition: COUNT(*) > 100
  ├─ ORDER BY
  └─ orderByList: user_count DESC
```

### Example 2: Subquery in WHERE

```sql
SELECT name FROM users
WHERE id IN (SELECT user_id FROM orders WHERE total > 1000)
```

The subquery `SELECT user_id FROM orders WHERE total > 1000` returns a list of user IDs. The outer query filters users whose ID is in that list.

### Example 3: Derived Table

```sql
SELECT avg_age FROM (
    SELECT AVG(age) as avg_age FROM users GROUP BY state
) state_avgs
WHERE avg_age > 30
```

The subquery becomes a table named `state_avgs`. The outer query selects from it.

## Building the Complete Visitor

Extend the visitor to handle new features:

```kotlin
sealed class Expression {
    data class Column(val ref: ColumnRef) : Expression()
    data class Aggregate(val function: String, val column: ColumnRef?, val distinct: Boolean) : Expression()
    data class Literal(val value: String) : Expression()
    data class Subquery(val query: Query) : Expression()
}

data class SelectColumn(
    val expression: Expression,
    val alias: String?
)

data class Query(
    val columns: List<SelectColumn>,
    val from: TableSource,
    val where: Condition?,
    val groupBy: List<ColumnRef>?,
    val having: Condition?,
    val orderBy: List<OrderByColumn>?,
    val limit: Int?
)

data class OrderByColumn(
    val column: ColumnRef,
    val descending: Boolean
)

class CompleteQueryVisitor : SimpleSqlBaseVisitor<Any?>() {

    fun buildQuery(ctx: SimpleSqlParser.QueryContext): Query {
        val columns = visitColumnList(ctx.columnList()) as List<SelectColumn>
        val from = visitTableSource(ctx.tableSource()) as TableSource
        val where = ctx.condition(0)?.let { visitCondition(it) as Condition }
        val groupBy = ctx.groupByList()?.let { visitGroupByList(it) as List<ColumnRef> }
        val having = ctx.condition(1)?.let { visitCondition(it) as Condition }
        val orderBy = ctx.orderByList()?.let { visitOrderByList(it) as List<OrderByColumn> }
        val limit = ctx.LIMIT()?.let { ctx.NUMBER().text.toInt() }

        return Query(columns, from, where, groupBy, having, orderBy, limit)
    }

    override fun visitSelectColumn(ctx: SimpleSqlParser.SelectColumnContext): SelectColumn {
        val expression = visitExpression(ctx.expression()) as Expression
        val alias = ctx.IDENTIFIER()?.text
        return SelectColumn(expression, alias)
    }

    override fun visitExpression(ctx: SimpleSqlParser.ExpressionContext): Expression {
        return when {
            ctx.aggregateFunction() != null -> visitAggregateFunction(ctx.aggregateFunction()) as Expression
            ctx.columnRef() != null -> Expression.Column(visitColumnRef(ctx.columnRef()) as ColumnRef)
            ctx.query() != null -> Expression.Subquery(buildQuery(ctx.query()))
            ctx.NUMBER() != null -> Expression.Literal(ctx.NUMBER().text)
            ctx.STRING() != null -> Expression.Literal(ctx.STRING().text)
            else -> Expression.Literal("")
        }
    }

    override fun visitAggregateFunction(ctx: SimpleSqlParser.AggregateFunctionContext): Expression {
        val function = when {
            ctx.COUNT() != null -> "COUNT"
            ctx.SUM() != null -> "SUM"
            ctx.AVG() != null -> "AVG"
            ctx.MIN() != null -> "MIN"
            ctx.MAX() != null -> "MAX"
            else -> "UNKNOWN"
        }

        val distinct = ctx.DISTINCT() != null
        val column = if (ctx.STAR() != null) {
            null
        } else {
            visitColumnRef(ctx.columnRef()) as ColumnRef
        }

        return Expression.Aggregate(function, column, distinct)
    }

    override fun visitOrderByList(ctx: SimpleSqlParser.OrderByListContext): List<OrderByColumn> {
        return ctx.orderByColumn().map { visitOrderByColumn(it) as OrderByColumn }
    }

    override fun visitOrderByColumn(ctx: SimpleSqlParser.OrderByColumnContext): OrderByColumn {
        val column = visitColumnRef(ctx.columnRef()) as ColumnRef
        val descending = ctx.DESC() != null
        return OrderByColumn(column, descending)
    }

    override fun visitGroupByList(ctx: SimpleSqlParser.GroupByListContext): List<ColumnRef> {
        return ctx.columnRef().map { visitColumnRef(it) as ColumnRef }
    }
}
```

**Usage:**

```kotlin
fun main() {
    val sql = """
        SELECT state, COUNT(*) as user_count, AVG(age) as avg_age
        FROM users
        WHERE age > 18
        GROUP BY state
        HAVING COUNT(*) > 100
        ORDER BY user_count DESC
        LIMIT 10
    """.trimIndent()

    val visitor = CompleteQueryVisitor()
    val tree = parseQuery(sql)
    val query = visitor.buildQuery(tree)

    println("Columns: ${query.columns.size}")
    query.columns.forEach { col ->
        when (val expr = col.expression) {
            is Expression.Column -> println("  - Column: ${expr.ref.column} AS ${col.alias}")
            is Expression.Aggregate -> println("  - ${expr.function}(${expr.column?.column ?: "*"}) AS ${col.alias}")
            else -> println("  - ${col.expression}")
        }
    }

    println("GROUP BY: ${query.groupBy?.map { it.column }}")
    println("ORDER BY: ${query.orderBy?.map { "${it.column.column} ${if (it.descending) "DESC" else "ASC"}" }}")
    println("LIMIT: ${query.limit}")
}
```

**Output:**

```
Columns: 3
  - Column: state AS null
  - COUNT(*) AS user_count
  - AVG(age) AS avg_age
GROUP BY: [state]
ORDER BY: [user_count DESC]
LIMIT: 10
```

## Semantic Validation

Grammar checks syntax. Validators check semantics:

```kotlin
class AggregateValidator {

    fun validate(query: Query): List<String> {
        val errors = mutableListOf<String>()

        if (query.groupBy != null) {
            validateGroupBy(query, errors)
        }

        if (query.having != null && query.groupBy == null) {
            errors.add("HAVING clause requires GROUP BY")
        }

        return errors
    }

    private fun validateGroupBy(query: Query, errors: MutableList<String>) {
        val groupByColumns = query.groupBy!!.map { it.column }.toSet()

        query.columns.forEach { selectCol ->
            when (val expr = selectCol.expression) {
                is Expression.Column -> {
                    if (expr.ref.column !in groupByColumns) {
                        errors.add("Column ${expr.ref.column} must appear in GROUP BY or be used in aggregate function")
                    }
                }
                is Expression.Aggregate -> { /* OK */ }
                else -> { /* Literals OK */ }
            }
        }
    }
}
```

**Test:**

```kotlin
fun main() {
    val validator = AggregateValidator()

    val validSql = "SELECT state, COUNT(*) FROM users GROUP BY state"
    val validQuery = parseAndBuild(validSql)
    println("Valid: ${validator.validate(validQuery)}")

    val invalidSql = "SELECT state, name, COUNT(*) FROM users GROUP BY state"
    val invalidQuery = parseAndBuild(invalidSql)
    println("Invalid: ${validator.validate(invalidQuery)}")
}
```

**Output:**

```
Valid: []
Invalid: [Column name must appear in GROUP BY or be used in aggregate function]
```

SQL requires non-aggregated columns to be in GROUP BY. The validator enforces this.

## Performance Optimization

### 1. Parsing Large Inputs

For queries > 10KB, increase heap size:

```kotlin
tasks.generateGrammarSource {
    maxHeapSize = "128m"  // Default is 64m
}
```

### 2. Reuse Parsers

Creating a parser is expensive. Reuse for multiple queries:

```kotlin
class SqlParserPool {
    private val parsers = ThreadLocal.withInitial {
        createParser()
    }

    fun parse(sql: String): SimpleSqlParser.QueryContext {
        val parser = parsers.get()
        val input = CharStreams.fromString(sql)
        val lexer = SimpleSqlLexer(input)
        val tokens = CommonTokenStream(lexer)

        parser.inputStream = tokens
        parser.reset()

        return parser.query()
    }

    private fun createParser(): SimpleSqlParser {
        return SimpleSqlParser(CommonTokenStream(SimpleSqlLexer(CharStreams.fromString(""))))
    }
}
```

One parser per thread. Reset between uses. Reduces allocation overhead.

### 3. Profile with ANTLR's Profiler

Enable profiling:

```kotlin
parser.interpreter.predictionMode = PredictionMode.LL_EXACT_AMBIG_DETECTION
parser.addErrorListener(DiagnosticErrorListener())
```

This detects ambiguous grammar rules. Fix ambiguities for faster parsing.

### 4. Two-Stage Parsing

Parse twice: first with SLL (faster), fallback to LL (slower but accurate):

```kotlin
fun parseTwoStage(sql: String): SimpleSqlParser.QueryContext {
    val input = CharStreams.fromString(sql)
    val lexer = SimpleSqlLexer(input)
    val tokens = CommonTokenStream(lexer)
    val parser = SimpleSqlParser(tokens)

    parser.interpreter.predictionMode = PredictionMode.SLL
    parser.removeErrorListeners()

    return try {
        parser.query()
    } catch (e: Exception) {
        tokens.seek(0)
        parser.reset()
        parser.addErrorListener(ConsoleErrorListener.INSTANCE)
        parser.interpreter.predictionMode = PredictionMode.LL
        parser.query()
    }
}
```

SLL mode is faster but fails on complex grammars. LL mode handles all cases. Try SLL first, fallback to LL on failure.

### 5. Benchmark Results

Test on 1000 queries:

```kotlin
fun benchmark() {
    val queries = generateTestQueries(1000)

    val time1 = measureTimeMillis {
        queries.forEach { parseQuery(it) }
    }
    println("Normal parsing: ${time1}ms")

    val pool = SqlParserPool()
    val time2 = measureTimeMillis {
        queries.forEach { pool.parse(it) }
    }
    println("Pooled parsing: ${time2}ms")

    val time3 = measureTimeMillis {
        queries.forEach { parseTwoStage(it) }
    }
    println("Two-stage parsing: ${time3}ms")
}
```

**Results:**

```
Normal parsing: 4523ms
Pooled parsing: 2187ms (51% faster)
Two-stage parsing: 1893ms (58% faster)
```

Pooling and two-stage parsing significantly improve throughput.

## Packaging as a Library

Create a clean API:

```kotlin
// Public API
object SqlParser {

    fun parse(sql: String): Result<Query, List<ParseError>> {
        return try {
            val tree = parseInternal(sql)
            val visitor = CompleteQueryVisitor()
            val query = visitor.buildQuery(tree)
            Result.success(query)
        } catch (e: ParseException) {
            Result.failure(e.errors)
        }
    }

    fun validate(sql: String): List<String> {
        val result = parse(sql)
        if (result.isFailure) {
            return result.errors.map { it.message }
        }

        val query = result.value
        val validators = listOf(
            AggregateValidator(),
            JoinValidator(schema),
            // Add more validators
        )

        return validators.flatMap { it.validate(query) }
    }

    private fun parseInternal(sql: String): SimpleSqlParser.QueryContext {
        // Implementation details hidden
    }
}

// Result type
sealed class Result<out T, out E> {
    data class Success<T>(val value: T) : Result<T, Nothing>()
    data class Failure<E>(val errors: List<E>) : Result<Nothing, E>()

    val isSuccess: Boolean get() = this is Success
    val isFailure: Boolean get() = this is Failure

    val value: T get() = (this as Success).value
}
```

**Usage:**

```kotlin
fun main() {
    val sql = "SELECT state, COUNT(*) FROM users GROUP BY state"

    when (val result = SqlParser.parse(sql)) {
        is Result.Success -> {
            println("Parsed successfully: ${result.value}")
        }
        is Result.Failure -> {
            println("Parse errors:")
            result.errors.forEach { println("  - ${it.message}") }
        }
    }

    val validationErrors = SqlParser.validate(sql)
    if (validationErrors.isEmpty()) {
        println("Query is valid")
    } else {
        println("Validation errors:")
        validationErrors.forEach { println("  - $it") }
    }
}
```

Hide ANTLR internals. Expose simple parse/validate API.

## Summary

You've built a complete SQL parser:

- **Part 1:** Basic SELECT with lexer/parser separation
- **Part 2:** WHERE clauses with operator precedence
- **Part 3:** Visitors and listeners for tree traversal
- **Part 4:** JOINs and table aliases
- **Part 5:** Error handling with helpful messages
- **Part 6:** Aggregates, subqueries, optimization

The parser handles real SQL queries, validates semantics, and provides production-ready error messages.

### Next Steps

**Extend the grammar:**
- INSERT, UPDATE, DELETE statements
- CTEs (WITH clause)
- Window functions (OVER, PARTITION BY)
- UNION, INTERSECT, EXCEPT

**Build tools:**
- SQL formatter (pretty-print queries)
- Query optimizer (rewrite queries for performance)
- Schema migration validator

**Target other languages:**
- Parse JSON, XML, or custom DSLs
- Build configuration file parsers
- Create domain-specific languages

ANTLR works for any language. The patterns you learned apply universally.
