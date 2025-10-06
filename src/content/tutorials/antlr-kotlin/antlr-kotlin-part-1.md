---
title: "ANTLR with Kotlin - Part 1: Basics and Project Setup"
description: "Build a SQL parser from scratch using ANTLR and Kotlin. Learn lexer vs parser, grammar design, and project setup by parsing simple SELECT queries."
publishDate: 2025-10-05
publishedAt: 2025-10-05
tags: ["ANTLR", "Kotlin", "Parser", "Compiler", "SQL", "Grammar"]
difficulty: "intermediate"
series: "ANTLR with Kotlin"
part: 1
estimatedTime: "20 minutes"
totalParts: 6
---

# ANTLR with Kotlin - Part 1: Basics and Project Setup

ANTLR generates parsers from grammar files. You write the grammar, ANTLR produces the parser code. We'll build a SQL parser that validates queries and extracts metadata.

## What You'll Build

A parser that reads this:

```sql
SELECT name, email FROM users WHERE age > 18
```

And produces this:

```kotlin
QueryMetadata(
    tables = listOf("users"),
    columns = listOf("name", "email"),
    conditions = listOf(Condition("age", ">", 18))
)
```

By Part 6, you'll parse complex queries with JOINs, subqueries, and aggregates. Part 1 covers basics: `SELECT * FROM users`.

## ANTLR Concepts

ANTLR (ANother Tool for Language Recognition) is a **parser generator**. You define a grammar, ANTLR generates Java or Kotlin code that parses text matching that grammar.

### Lexer vs Parser

**Lexer**: Converts text into tokens.

Input: `SELECT name FROM users`
Tokens: `[SELECT, name, FROM, users]`

**Parser**: Builds a tree from tokens.

Tokens: `[SELECT, name, FROM, users]`
Tree:
```
selectStatement
  ├─ SELECT
  ├─ columnList
  │   └─ name
  ├─ FROM
  └─ tableReference
      └─ users
```

The lexer handles characters. The parser handles structure.

### Grammar Files

ANTLR grammars use `.g4` files. Two types:

1. **Lexer grammar** - defines tokens (keywords, identifiers, operators)
2. **Parser grammar** - defines syntax rules (statements, expressions)

Combined grammars include both in one file.

## Project Setup

Create a Kotlin project with Gradle. ANTLR generates code during build.

### build.gradle.kts

```kotlin
plugins {
    kotlin("jvm") version "1.9.21"
    id("antlr")
}

repositories {
    mavenCentral()
}

dependencies {
    antlr("org.antlr:antlr4:4.13.1")
    implementation("org.antlr:antlr4-runtime:4.13.1")
    implementation("com.strumenta:antlr-kotlin-runtime:1.0.0-RC1")

    testImplementation(kotlin("test"))
}

tasks.generateGrammarSource {
    maxHeapSize = "64m"
    arguments = arguments + listOf("-visitor", "-long-messages")
    outputDirectory = file("build/generated-src/antlr/main")
}

tasks.compileKotlin {
    dependsOn(tasks.generateGrammarSource)
}

kotlin {
    sourceSets["main"].kotlin.srcDir("build/generated-src/antlr/main")
}
```

**How it works:**

- `antlr` plugin generates parser from `.g4` files
- `-visitor` flag creates visitor classes (we'll use in Part 3)
- Generated code goes to `build/generated-src/antlr/main`
- Kotlin compilation waits for ANTLR generation

### Project Structure

```
src/
  main/
    antlr/
      SimpleSql.g4          # Grammar definition
    kotlin/
      SqlParser.kt          # Our Kotlin code
  test/
    kotlin/
      SqlParserTest.kt      # Tests
```

Grammar files go in `src/main/antlr/`. ANTLR finds them automatically.

## First Grammar: Simple SELECT

Create `src/main/antlr/SimpleSql.g4`:

```antlr
grammar SimpleSql;

// Parser Rules
query
    : SELECT columns FROM table EOF
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

// Lexer Rules
SELECT  : [Ss][Ee][Ll][Ee][Cc][Tt] ;
FROM    : [Ff][Rr][Oo][Mm] ;
STAR    : '*' ;
IDENTIFIER : [a-zA-Z_][a-zA-Z0-9_]* ;
COMMA   : ',' ;
WS      : [ \t\r\n]+ -> skip ;
```

### Grammar Breakdown

**Parser rules** (lowercase): Define syntax structure.

```antlr
query
    : SELECT columns FROM table EOF
    ;
```

A query is: SELECT keyword, columns, FROM keyword, table name, end of file.

```antlr
columns
    : STAR
    | columnList
    ;
```

Columns can be `*` or a list of identifiers. The `|` means "or".

```antlr
columnList
    : IDENTIFIER (',' IDENTIFIER)*
    ;
```

A column list is one identifier, optionally followed by comma + identifier (repeated). Matches `name`, `name, email`, `name, email, age`.

**Lexer rules** (UPPERCASE): Define tokens.

```antlr
SELECT  : [Ss][Ee][Ll][Ee][Cc][Tt] ;
```

SELECT matches case-insensitive (SELECT, select, SeLeCt all work).

```antlr
IDENTIFIER : [a-zA-Z_][a-zA-Z0-9_]* ;
```

Identifiers start with letter or underscore, followed by any alphanumeric or underscore. Matches `users`, `user_id`, `firstName`.

```antlr
WS : [ \t\r\n]+ -> skip ;
```

Whitespace is recognized but skipped (not part of parse tree).

## Using the Parser

Build the project to generate parser code:

```bash
./gradlew generateGrammarSource
```

ANTLR creates these files:
- `SimpleSqlLexer.java` - tokenizes input
- `SimpleSqlParser.java` - builds parse tree
- `SimpleSqlVisitor.java` - interface for tree traversal
- `SimpleSqlBaseVisitor.java` - base implementation

### Parse a Query

Create `src/main/kotlin/SqlParser.kt`:

```kotlin
import org.antlr.v4.runtime.*
import org.antlr.v4.runtime.tree.*

fun parseQuery(sql: String): ParseTree {
    val input = CharStreams.fromString(sql)
    val lexer = SimpleSqlLexer(input)
    val tokens = CommonTokenStream(lexer)
    val parser = SimpleSqlParser(tokens)

    return parser.query()
}

fun main() {
    val sql = "SELECT * FROM users"
    val tree = parseQuery(sql)
    println(tree.toStringTree(SimpleSqlParser.ruleNames.toList()))
}
```

**Output:**

```
(query SELECT (columns *) FROM (table users) <EOF>)
```

### How It Works

![Diagram 1](/diagrams/antlr-kotlin-part-1-diagram-1.svg)

1. **CharStream**: Wraps input string
2. **Lexer**: Converts characters to tokens
3. **TokenStream**: Holds tokens
4. **Parser**: Builds parse tree from tokens
5. **Parse Tree**: Structure representing the query

Each step transforms data:
- `"SELECT * FROM users"` → CharStream
- CharStream → `[SELECT, STAR, FROM, IDENTIFIER("users"), EOF]`
- Tokens → Parse tree with `query` root node

## Visualizing the Parse Tree

![Diagram 2](/diagrams/antlr-kotlin-part-1-diagram-2.svg)

The parser creates this tree automatically from the grammar rules.

## Testing

Create `src/test/kotlin/SqlParserTest.kt`:

```kotlin
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertDoesNotThrow
import kotlin.test.assertContains

class SqlParserTest {

    @Test
    fun `parse SELECT star`() {
        val sql = "SELECT * FROM users"
        val tree = parseQuery(sql)
        val treeStr = tree.toStringTree(SimpleSqlParser.ruleNames.toList())

        assertContains(treeStr, "SELECT")
        assertContains(treeStr, "users")
    }

    @Test
    fun `parse SELECT columns`() {
        val sql = "SELECT name, email FROM customers"
        assertDoesNotThrow {
            parseQuery(sql)
        }
    }

    @Test
    fun `case insensitive keywords`() {
        val sqls = listOf(
            "SELECT * FROM users",
            "select * from users",
            "SeLeCt * FrOm users"
        )

        sqls.forEach { sql ->
            assertDoesNotThrow("Failed: $sql") {
                parseQuery(sql)
            }
        }
    }
}
```

Run tests:

```bash
./gradlew test
```

All three tests pass. The grammar handles case-insensitive keywords and both `*` and column lists.

## Common Pitfalls

**Missing EOF**: Always include `EOF` in your top-level rule.

```antlr
query : SELECT columns FROM table ;  // Wrong - doesn't validate entire input
query : SELECT columns FROM table EOF ;  // Correct
```

Without `EOF`, the parser stops after matching the first valid query, ignoring remaining input. `SELECT * FROM users garbage` would parse successfully.

**Lexer rule order matters**: ANTLR tries rules top to bottom.

```antlr
// Wrong - IDENTIFIER matches before keywords
IDENTIFIER : [a-zA-Z]+ ;
SELECT : 'SELECT' ;

// Correct - keywords before IDENTIFIER
SELECT : 'SELECT' ;
IDENTIFIER : [a-zA-Z]+ ;
```

If `IDENTIFIER` comes first, "SELECT" becomes an IDENTIFIER token, not SELECT. Keywords must come before generic patterns.

**Left recursion in lexer**: Lexer rules cannot be recursive.

```antlr
NUMBER : NUMBER DIGIT ;  // ERROR - lexer rules can't recurse
```

Only parser rules support recursion. Use repetition operators in lexer rules:

```antlr
NUMBER : DIGIT+ ;
```

## What's Next

Part 2 adds WHERE clauses with comparison operators, AND/OR logic, and expressions. We'll extend the grammar to parse:

```sql
SELECT name, email FROM users WHERE age > 18 AND status = 'active'
```

You'll learn operator precedence, expression parsing, and testing complex grammars.
