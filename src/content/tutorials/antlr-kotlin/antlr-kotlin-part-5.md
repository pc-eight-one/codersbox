---
title: "ANTLR with Kotlin - Part 5: Error Handling and Recovery"
description: "Build production-ready error messages for your SQL parser. Learn custom error listeners, error recovery strategies, and helpful syntax suggestions."
publishDate: 2025-10-05
publishedAt: 2025-10-05
tags: ["ANTLR", "Kotlin", "Parser", "Error Handling", "Developer Experience"]
difficulty: "intermediate"
series: "ANTLR with Kotlin"
part: 5
estimatedTime: "25 minutes"
totalParts: 6
featured: true
---

# ANTLR with Kotlin - Part 5: Error Handling and Recovery

Default ANTLR errors are cryptic:

```
line 1:12 mismatched input 'FORM' expecting FROM
```

Users need better. We'll build errors like this:

```
Error at line 1, column 12:
  SELECT * FORM users
           ^^^^
  Expected FROM but found FORM
  Did you mean: FROM?
```

This requires custom error listeners, position tracking, and suggestion logic.

## ANTLR's Error Handling

ANTLR detects two error types:

**Lexer errors:** Invalid tokens. Example: `@#$%` in a query.

**Parser errors:** Valid tokens, invalid syntax. Example: `SELECT FROM users` (missing columns).

### Default Error Listener

ANTLR prints errors to stderr:

```kotlin
fun main() {
    val sql = "SELECT * FORM users"
    parseQuery(sql)
}
```

**Output:**

```
line 1:9 mismatched input 'FORM' expecting FROM
```

The message lacks context. Users don't know what FROM is or why it's expected.

## Custom Error Listener

Replace default listener with custom:

```kotlin
class SqlErrorListener : BaseErrorListener() {
    val errors = mutableListOf<ParseError>()

    override fun syntaxError(
        recognizer: Recognizer<*, *>?,
        offendingSymbol: Any?,
        line: Int,
        charPositionInLine: Int,
        msg: String?,
        e: RecognitionException?
    ) {
        val error = ParseError(
            line = line,
            column = charPositionInLine,
            message = msg ?: "Unknown error",
            offendingToken = (offendingSymbol as? Token)?.text,
            recognizer = recognizer
        )
        errors.add(error)
    }
}

data class ParseError(
    val line: Int,
    val column: Int,
    val message: String,
    val offendingToken: String?,
    val recognizer: Recognizer<*, *>?
)
```

**How it works:**

- `syntaxError` called for each error
- `offendingSymbol` is the problematic token
- `line` and `charPositionInLine` locate the error
- `msg` is ANTLR's default message
- `RecognitionException` contains parser state (expected tokens, etc.)

### Using the Custom Listener

```kotlin
fun parseWithErrors(sql: String): Pair<SimpleSqlParser.QueryContext?, List<ParseError>> {
    val input = CharStreams.fromString(sql)
    val lexer = SimpleSqlLexer(input)
    val tokens = CommonTokenStream(lexer)
    val parser = SimpleSqlParser(tokens)

    val errorListener = SqlErrorListener()
    parser.removeErrorListeners()
    parser.addErrorListener(errorListener)

    val tree = parser.query()
    return tree to errorListener.errors
}

fun main() {
    val sql = "SELECT * FORM users"
    val (tree, errors) = parseWithErrors(sql)

    if (errors.isNotEmpty()) {
        println("Found ${errors.size} error(s):")
        errors.forEach { error ->
            println("  Line ${error.line}, column ${error.column}: ${error.message}")
            println("  Offending token: ${error.offendingToken}")
        }
    }
}
```

**Output:**

```
Found 1 error(s):
  Line 1, column 9: mismatched input 'FORM' expecting FROM
  Offending token: FORM
```

Still uses default message. Next: improve the message.

## Better Error Messages

Extract expected tokens and suggest fixes:

```kotlin
class SqlErrorListener(private val sourceCode: String) : BaseErrorListener() {
    val errors = mutableListOf<FormattedError>()

    override fun syntaxError(
        recognizer: Recognizer<*, *>?,
        offendingSymbol: Any?,
        line: Int,
        charPositionInLine: Int,
        msg: String?,
        e: RecognitionException?
    ) {
        val token = offendingSymbol as? Token
        val expectedTokens = if (e != null && recognizer is Parser) {
            getExpectedTokens(recognizer, e)
        } else {
            emptyList()
        }

        val formattedError = formatError(
            sourceCode,
            line,
            charPositionInLine,
            token,
            expectedTokens,
            msg
        )

        errors.add(formattedError)
    }

    private fun getExpectedTokens(parser: Parser, e: RecognitionException): List<String> {
        val expectedTokens = e.expectedTokens ?: return emptyList()
        val vocabulary = parser.vocabulary

        return expectedTokens.toList().map { tokenType ->
            val displayName = vocabulary.getDisplayName(tokenType)
            displayName.removeSurrounding("'")
        }
    }

    private fun formatError(
        source: String,
        line: Int,
        column: Int,
        token: Token?,
        expected: List<String>,
        defaultMsg: String?
    ): FormattedError {
        val lines = source.lines()
        val errorLine = lines.getOrNull(line - 1) ?: ""

        val tokenText = token?.text ?: ""
        val tokenLength = tokenText.length.coerceAtLeast(1)

        val pointer = " ".repeat(column) + "^".repeat(tokenLength)

        val message = buildString {
            appendLine("Error at line $line, column $column:")
            appendLine("  $errorLine")
            appendLine("  $pointer")

            if (expected.isNotEmpty()) {
                append("  Expected: ${expected.joinToString(", ")}")
                if (tokenText.isNotEmpty()) {
                    appendLine(" but found '$tokenText'")
                } else {
                    appendLine()
                }

                val suggestion = findSuggestion(tokenText, expected)
                if (suggestion != null) {
                    appendLine("  Did you mean: $suggestion?")
                }
            } else {
                appendLine("  $defaultMsg")
            }
        }

        return FormattedError(line, column, message)
    }

    private fun findSuggestion(actual: String, expected: List<String>): String? {
        if (actual.isEmpty()) return null

        return expected
            .filter { it.isNotEmpty() }
            .minByOrNull { levenshteinDistance(actual.uppercase(), it.uppercase()) }
            ?.takeIf { levenshteinDistance(actual.uppercase(), it.uppercase()) <= 2 }
    }

    private fun levenshteinDistance(s1: String, s2: String): Int {
        val dp = Array(s1.length + 1) { IntArray(s2.length + 1) }

        for (i in 0..s1.length) dp[i][0] = i
        for (j in 0..s2.length) dp[0][j] = j

        for (i in 1..s1.length) {
            for (j in 1..s2.length) {
                val cost = if (s1[i - 1] == s2[j - 1]) 0 else 1
                dp[i][j] = minOf(
                    dp[i - 1][j] + 1,
                    dp[i][j - 1] + 1,
                    dp[i - 1][j - 1] + cost
                )
            }
        }

        return dp[s1.length][s2.length]
    }
}

data class FormattedError(
    val line: Int,
    val column: Int,
    val message: String
)
```

### How It Works

**getExpectedTokens:** Extracts what ANTLR expected. `e.expectedTokens` contains token types. Vocabulary maps types to names (FROM, SELECT, etc.).

**formatError:** Builds multi-line error with pointer (`^^^`), expected tokens, and suggestion.

**findSuggestion:** Uses Levenshtein distance to find closest match. `FORM` is 1 edit from `FROM`, so suggest it.

**levenshteinDistance:** Calculates edit distance (insertions, deletions, substitutions). Distance <= 2 suggests close match.

### Example Output

```kotlin
fun main() {
    val queries = listOf(
        "SELECT * FORM users",
        "SELECT name email FROM users",
        "SELECT * FROM users WERE age > 18"
    )

    queries.forEach { sql ->
        val errorListener = SqlErrorListener(sql)
        val (_, errors) = parseWithErrors(sql, errorListener)

        if (errors.isNotEmpty()) {
            errors.forEach { println(it.message) }
            println()
        }
    }
}
```

**Output:**

```
Error at line 1, column 9:
  SELECT * FORM users
           ^^^^
  Expected: FROM but found 'FORM'
  Did you mean: FROM?

Error at line 1, column 12:
  SELECT name email FROM users
              ^^^^^
  Expected: , but found 'email'

Error at line 1, column 23:
  SELECT * FROM users WERE age > 18
                       ^^^^
  Expected: WHERE, EOF but found 'WERE'
  Did you mean: WHERE?
```

Clear, actionable errors. Users know what's wrong and how to fix it.

## Error Recovery

ANTLR attempts to recover from errors and continue parsing. Two strategies:

### Single Token Deletion

If an unexpected token appears, ANTLR deletes it and continues:

```sql
SELECT * , FROM users
```

ANTLR sees:
1. SELECT * - valid
2. , - expected column name, got comma
3. Delete comma, continue
4. FROM users - valid

Parse succeeds with one error reported. Useful for minor typos.

### Single Token Insertion

If a required token is missing, ANTLR pretends it's there:

```sql
SELECT * users
```

ANTLR sees:
1. SELECT * - valid
2. users - expected FROM, got identifier
3. Insert imaginary FROM token
4. users - now valid as table name

Parse continues. Errors reported, but tree structure is complete.

### Controlling Recovery

Disable recovery for strict parsing:

```kotlin
parser.errorHandler = object : DefaultErrorStrategy() {
    override fun recover(recognizer: Parser, e: RecognitionException) {
        throw e
    }

    override fun recoverInline(recognizer: Parser): Token {
        throw InputMismatchException(recognizer)
    }
}
```

Now parser stops at first error. Useful when you need exact correctness (code generators, validators).

## Lexer Errors

Lexer errors occur when characters don't match any token:

```sql
SELECT * FROM users WHERE age > 18@
```

The `@` is invalid. Custom lexer error listener:

```kotlin
class SqlLexerErrorListener(private val sourceCode: String) : BaseErrorListener() {
    val errors = mutableListOf<FormattedError>()

    override fun syntaxError(
        recognizer: Recognizer<*, *>?,
        offendingSymbol: Any?,
        line: Int,
        charPositionInLine: Int,
        msg: String?,
        e: RecognitionException?
    ) {
        val lines = sourceCode.lines()
        val errorLine = lines.getOrNull(line - 1) ?: ""
        val badChar = errorLine.getOrNull(charPositionInLine) ?: '?'

        val message = buildString {
            appendLine("Lexer error at line $line, column $charPositionInLine:")
            appendLine("  $errorLine")
            appendLine("  ${" ".repeat(charPositionInLine)}^")
            appendLine("  Unexpected character: '$badChar'")
        }

        errors.add(FormattedError(line, charPositionInLine, message))
    }
}
```

**Usage:**

```kotlin
fun parseWithLexerErrors(sql: String): Pair<SimpleSqlParser.QueryContext?, List<FormattedError>> {
    val input = CharStreams.fromString(sql)
    val lexer = SimpleSqlLexer(input)

    val lexerErrorListener = SqlLexerErrorListener(sql)
    lexer.removeErrorListeners()
    lexer.addErrorListener(lexerErrorListener)

    val tokens = CommonTokenStream(lexer)
    val parser = SimpleSqlParser(tokens)

    val parserErrorListener = SqlErrorListener(sql)
    parser.removeErrorListeners()
    parser.addErrorListener(parserErrorListener)

    val tree = parser.query()

    val allErrors = lexerErrorListener.errors + parserErrorListener.errors
    return tree to allErrors
}
```

Now both lexer and parser errors are captured with nice formatting.

## Testing Error Messages

```kotlin
class ErrorHandlingTest {

    @Test
    fun `detect keyword typo`() {
        val sql = "SELECT * FORM users"
        val (_, errors) = parseWithErrors(sql)

        assertEquals(1, errors.size)
        assertTrue(errors[0].message.contains("Did you mean: FROM"))
    }

    @Test
    fun `detect missing comma`() {
        val sql = "SELECT name email FROM users"
        val (_, errors) = parseWithErrors(sql)

        assertEquals(1, errors.size)
        assertTrue(errors[0].message.contains("Expected: ,"))
    }

    @Test
    fun `detect unexpected character`() {
        val sql = "SELECT * FROM users WHERE age > 18@"
        val (_, errors) = parseWithLexerErrors(sql)

        assertEquals(1, errors.size)
        assertTrue(errors[0].message.contains("Unexpected character: '@'"))
    }

    @Test
    fun `suggest close matches`() {
        val testCases = mapOf(
            "WERE" to "WHERE",
            "FORM" to "FROM",
            "SELCT" to "SELECT"
        )

        testCases.forEach { (typo, expected) ->
            val sql = "SELECT * $typo users"
            val (_, errors) = parseWithErrors(sql)

            assertTrue(
                errors.any { it.message.contains("Did you mean: $expected") },
                "Expected suggestion for $typo"
            )
        }
    }
}
```

## Common Pitfalls

**Not removing default listeners:**

```kotlin
parser.addErrorListener(customListener)
// Wrong - default listener still active
```

Default listener prints to stderr. Remove it first:

```kotlin
parser.removeErrorListeners()
parser.addErrorListener(customListener)
```

**Swallowing errors silently:**

```kotlin
override fun syntaxError(...) {
    // Empty - errors disappear
}
```

Always log or store errors. Silent failures confuse users.

**Poor suggestions from Levenshtein:**

For distance > 2, suggestions are random. Threshold at 2 edits:

```kotlin
.takeIf { levenshteinDistance(...) <= 2 }
```

**Not handling multi-line input:**

```kotlin
val errorLine = source.lines().getOrNull(line - 1) ?: ""
```

Line numbers are 1-indexed. Subtract 1 for array access.

## What's Next

Part 6 covers **advanced features and optimization**:

- Subqueries (nested SELECT statements)
- Aggregate functions (COUNT, SUM, AVG)
- GROUP BY and HAVING clauses
- Parser performance tuning
- Building a reusable library

You'll complete the SQL parser with full query support and learn how to optimize ANTLR for production workloads.
