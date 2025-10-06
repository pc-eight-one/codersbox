---
title: "ANTLR with Kotlin - Part 2: Grammar Design for WHERE Clauses"
description: "Extend your SQL parser to handle WHERE clauses with comparison operators, AND/OR logic, and proper operator precedence using ANTLR's left recursion."
publishDate: 2025-10-05
publishedAt: 2025-10-05
tags: ["ANTLR", "Kotlin", "Parser", "Grammar", "SQL", "Expressions"]
difficulty: "intermediate"
series: "ANTLR with Kotlin"
part: 2
estimatedTime: "25 minutes"
totalParts: 6
---

# ANTLR with Kotlin - Part 2: Grammar Design for WHERE Clauses

WHERE clauses introduce expressions: comparisons, logical operators, parentheses. We'll extend the grammar to parse:

```sql
SELECT name, email FROM users WHERE age > 18 AND status = 'active'
```

This requires handling operator precedence (AND before OR), data types (numbers, strings), and nested expressions.

## Grammar Extensions

Update `SimpleSql.g4`:

```antlr
grammar SimpleSql;

query
    : SELECT columns FROM table (WHERE condition)? EOF
    ;

columns
    : STAR
    | columnList
    ;

columnList
    : IDENTIFIER (',' IDENTIFIER)*
    ;

table
    : IDENTIFIER
    ;

// New: Expression rules
condition
    : condition AND condition           // Left recursion for AND
    | condition OR condition            // Left recursion for OR
    | NOT condition                     // Negation
    | comparison                        // Base case
    | '(' condition ')'                 // Grouping
    ;

comparison
    : IDENTIFIER op=(EQ | NE | GT | LT | GTE | LTE) value
    ;

value
    : NUMBER
    | STRING
    | IDENTIFIER
    ;

// Keywords
SELECT  : [Ss][Ee][Ll][Ee][Cc][Tt] ;
FROM    : [Ff][Rr][Oo][Mm] ;
WHERE   : [Ww][Hh][Ee][Rr][Ee] ;
AND     : [Aa][Nn][Dd] ;
OR      : [Oo][Rr] ;
NOT     : [Nn][Oo][Tt] ;

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

### Key Changes

**Optional WHERE clause:**

```antlr
query
    : SELECT columns FROM table (WHERE condition)? EOF
    ;
```

`(WHERE condition)?` means zero or one WHERE clause. Matches both:
- `SELECT * FROM users`
- `SELECT * FROM users WHERE age > 18`

**Left recursive conditions:**

```antlr
condition
    : condition AND condition
    | condition OR condition
    | comparison
    | '(' condition ')'
    ;
```

This handles precedence automatically. ANTLR 4 supports direct left recursion (earlier versions didn't). The order matters: AND binds tighter than OR.

**Comparison operators:**

```antlr
comparison
    : IDENTIFIER op=(EQ | NE | GT | LT | GTE | LTE) value
    ;
```

`op=` labels the operator token. Later, we'll access it via `ctx.op.type` to know which operator was used.

**Value types:**

```antlr
value
    : NUMBER
    | STRING
    | IDENTIFIER
    ;
```

Values can be numbers (`18`), strings (`'active'`), or column names (`salary`).

## Operator Precedence

How does ANTLR handle: `age > 18 AND status = 'active' OR role = 'admin'`?

The grammar defines precedence:

```antlr
condition
    : condition AND condition    // Higher precedence (tried first)
    | condition OR condition     // Lower precedence
    | NOT condition
    | comparison
    | '(' condition ')'
```

ANTLR resolves this as: `(age > 18 AND status = 'active') OR (role = 'admin')`

![Diagram 1](/diagrams/antlr-kotlin-part-2-diagram-1.svg)

AND has higher precedence because it appears first in the alternation. To override, use parentheses:

```sql
age > 18 AND (status = 'active' OR role = 'admin')
```

## Parsing Examples

### Example 1: Simple Comparison

```sql
SELECT * FROM users WHERE age > 18
```

Parse tree:

```
query
  ├─ SELECT
  ├─ columns: *
  ├─ FROM
  ├─ table: users
  ├─ WHERE
  ├─ condition
  │   └─ comparison
  │       ├─ IDENTIFIER: age
  │       ├─ GT: >
  │       └─ value
  │           └─ NUMBER: 18
  └─ EOF
```

The condition contains a single comparison. No logical operators.

### Example 2: AND Logic

```sql
SELECT name FROM users WHERE age > 18 AND status = 'active'
```

Parse tree:

```
condition
  ├─ condition (left)
  │   └─ comparison: age > 18
  ├─ AND
  └─ condition (right)
      └─ comparison: status = 'active'
```

The top-level `condition` node has two children: left condition, AND, right condition. Both children are comparisons.

### Example 3: Mixed Operators

```sql
SELECT * FROM users WHERE age > 18 AND status = 'active' OR role = 'admin'
```

Because AND has higher precedence:

```
condition (OR)
  ├─ condition (AND)
  │   ├─ condition: age > 18
  │   ├─ AND
  │   └─ condition: status = 'active'
  ├─ OR
  └─ condition: role = 'admin'
```

The AND condition is evaluated as a unit, then OR combines it with the role check.

### Example 4: Parentheses

```sql
SELECT * FROM users WHERE age > 18 AND (status = 'active' OR role = 'admin')
```

Parentheses force grouping:

```
condition (AND)
  ├─ condition: age > 18
  ├─ AND
  └─ condition (grouped)
      └─ condition (OR)
          ├─ condition: status = 'active'
          ├─ OR
          └─ condition: role = 'admin'
```

Now OR is evaluated before AND because of explicit grouping.

## Testing the Extended Grammar

Update `SqlParserTest.kt`:

```kotlin
import org.antlr.v4.runtime.*
import org.junit.jupiter.api.Test
import kotlin.test.assertContains
import kotlin.test.assertNotNull

class SqlParserTest {

    private fun parseQuery(sql: String): SimpleSqlParser.QueryContext {
        val input = CharStreams.fromString(sql)
        val lexer = SimpleSqlLexer(input)
        val tokens = CommonTokenStream(lexer)
        val parser = SimpleSqlParser(tokens)
        return parser.query()
    }

    @Test
    fun `parse simple WHERE`() {
        val sql = "SELECT * FROM users WHERE age > 18"
        val tree = parseQuery(sql)

        assertNotNull(tree.condition())
        val comparison = tree.condition().comparison()
        assertNotNull(comparison)
    }

    @Test
    fun `parse AND condition`() {
        val sql = "SELECT * FROM users WHERE age > 18 AND status = 'active'"
        val tree = parseQuery(sql)

        val condition = tree.condition()
        assertNotNull(condition)

        val treeStr = condition.toStringTree(SimpleSqlParser.ruleNames.toList())
        assertContains(treeStr, "AND")
    }

    @Test
    fun `parse OR condition`() {
        val sql = "SELECT * FROM users WHERE role = 'admin' OR role = 'manager'"
        val tree = parseQuery(sql)

        val treeStr = tree.condition()!!.toStringTree(SimpleSqlParser.ruleNames.toList())
        assertContains(treeStr, "OR")
    }

    @Test
    fun `parse parentheses`() {
        val sql = "SELECT * FROM users WHERE age > 18 AND (status = 'active' OR role = 'admin')"
        val tree = parseQuery(sql)

        assertNotNull(tree.condition())
    }

    @Test
    fun `parse different operators`() {
        val queries = listOf(
            "SELECT * FROM users WHERE age = 25",
            "SELECT * FROM users WHERE age != 25",
            "SELECT * FROM users WHERE age >= 18",
            "SELECT * FROM users WHERE age <= 65",
            "SELECT * FROM users WHERE salary > 50000"
        )

        queries.forEach { sql ->
            val tree = parseQuery(sql)
            assertNotNull(tree.condition(), "Failed: $sql")
        }
    }

    @Test
    fun `parse string values`() {
        val sql = "SELECT * FROM users WHERE name = 'Rajesh Kumar'"
        val tree = parseQuery(sql)

        val value = tree.condition()!!.comparison().value()
        assertNotNull(value.STRING())
    }

    @Test
    fun `parse numeric values`() {
        val sql = "SELECT * FROM products WHERE price > 999.99"
        val tree = parseQuery(sql)

        val value = tree.condition()!!.comparison().value()
        assertNotNull(value.NUMBER())
    }
}
```

Run tests:

```bash
./gradlew test
```

All tests pass. The grammar handles:
- Simple comparisons
- AND/OR logic
- Parentheses for grouping
- All comparison operators
- String and numeric literals

## Extracting Condition Data

The parse tree contains structured data. Extract it with a visitor (we'll cover visitors in detail in Part 3). For now, a simple example:

```kotlin
data class Condition(
    val column: String,
    val operator: String,
    val value: Any
)

fun extractConditions(ctx: SimpleSqlParser.ConditionContext): List<Condition> {
    val conditions = mutableListOf<Condition>()

    fun visit(node: SimpleSqlParser.ConditionContext) {
        when {
            node.comparison() != null -> {
                val comp = node.comparison()
                val column = comp.IDENTIFIER().text
                val op = when (comp.op.type) {
                    SimpleSqlParser.EQ -> "="
                    SimpleSqlParser.NE -> "!="
                    SimpleSqlParser.GT -> ">"
                    SimpleSqlParser.LT -> "<"
                    SimpleSqlParser.GTE -> ">="
                    SimpleSqlParser.LTE -> "<="
                    else -> "unknown"
                }
                val value = when {
                    comp.value().NUMBER() != null -> comp.value().NUMBER().text.toDouble()
                    comp.value().STRING() != null -> comp.value().STRING().text.trim('\'')
                    else -> comp.value().IDENTIFIER().text
                }
                conditions.add(Condition(column, op, value))
            }
            node.AND() != null -> {
                visit(node.condition(0))
                visit(node.condition(1))
            }
            node.OR() != null -> {
                visit(node.condition(0))
                visit(node.condition(1))
            }
        }
    }

    visit(node)
    return conditions
}
```

**Usage:**

```kotlin
fun main() {
    val sql = "SELECT * FROM users WHERE age > 18 AND status = 'active'"
    val tree = parseQuery(sql)
    val conditions = extractConditions(tree.condition()!!)

    conditions.forEach { println(it) }
}
```

**Output:**

```
Condition(column=age, operator=>, value=18.0)
Condition(column=status, operator==, value=active)
```

This flattens the tree into a list of conditions. Useful for validation or query analysis.

## Common Pitfalls

**Ambiguous grammar:**

```antlr
condition
    : condition AND condition
    | condition OR condition
    ;
```

Both rules have same precedence. ANTLR can't decide which to use for `a AND b OR c`. Fix: put AND before OR to give it higher precedence.

**Right recursion instead of left:**

```antlr
condition
    : AND condition condition  // Wrong - right recursion
    | comparison
    ;
```

ANTLR 4 handles left recursion naturally. Right recursion creates deep trees and performs poorly. Always use left recursion for operators.

**Forgetting token labels:**

```antlr
comparison
    : IDENTIFIER (EQ | NE | GT | LT) value  // Can't distinguish operators later
    ;
```

Without `op=`, you can't tell which operator was matched. Use labels for alternations you need to identify.

**Case-sensitive strings:**

```antlr
WHERE : 'WHERE' ;  // Only matches uppercase WHERE
```

SQL is case-insensitive. Use character classes:

```antlr
WHERE : [Ww][Hh][Ee][Rr][Ee] ;
```

## How ANTLR Resolves Precedence

Given: `a > 5 AND b = 10 OR c < 20`

**Step 1:** Try highest precedence rule (AND):

Match `a > 5 AND b = 10` as one condition.

**Step 2:** Try next rule (OR):

Match `(a > 5 AND b = 10) OR c < 20`.

**Result:**

```
condition (OR)
  ├─ condition (AND)
  │   ├─ a > 5
  │   └─ b = 10
  └─ c < 20
```

The order of alternatives in the grammar controls precedence. First alternative = highest precedence.

For explicit precedence control, use precedence climbing:

```antlr
condition
    : andCondition (OR andCondition)*
    ;

andCondition
    : notCondition (AND notCondition)*
    ;

notCondition
    : NOT comparison
    | comparison
    | '(' condition ')'
    ;
```

This makes precedence explicit but is more verbose. ANTLR's left recursion is cleaner for most cases.

## What's Next

Part 3 introduces **Visitors** and **Listeners**—two patterns for traversing parse trees. We'll build a query metadata extractor that collects:

- All table names referenced
- All column names used
- All conditions applied
- Query complexity metrics

You'll learn when to use visitors (transforming trees) vs listeners (reacting to events), and how to build reusable tree traversal logic.
