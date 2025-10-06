---
title: "Java Spliterators: Stream Sources and Parallel Processing"
description: "Master Spliterators to create custom stream sources, control parallel processing, and optimize data traversal. Build efficient iterators for complex data structures."
publishDate: 2025-10-06
author: "Prashant Chaturvedi"
tags: ["Java", "Spliterator", "Streams", "Parallel Processing", "Performance", "Collections"]
readTime: "25 min read"
difficulty: "advanced"
estimatedTime: "50 minutes"
---

# Java Spliterators: Stream Sources and Parallel Processing

Spliterators power Java streams. While streams provide the API you use, spliterators define how elements traverse and split for parallel processing. Custom spliterators unlock streaming over files, databases, APIs, and complex data structures.

## What is a Spliterator?

Spliterator = **Split** + **Iterator**

Combines iteration with the ability to split for parallel processing.

```java
public interface Spliterator<T> {
    boolean tryAdvance(Consumer<? super T> action);
    Spliterator<T> trySplit();
    long estimateSize();
    int characteristics();
}
```

**tryAdvance**: Process next element. Returns true if element exists.

**trySplit**: Split into two spliterators for parallel processing. Returns null if can't split.

**estimateSize**: Approximate remaining elements. Used for optimization.

**characteristics**: Bit flags describing properties (ORDERED, SORTED, SIZED, etc.).

## Basic Usage

### Creating Streams from Spliterators

```java
List<String> names = Arrays.asList("Rajesh", "Priya", "Amit", "Neha");
Spliterator<String> spliterator = names.spliterator();

// Create stream from spliterator
Stream<String> stream = StreamSupport.stream(spliterator, false);
stream.forEach(System.out::println);
```

**Sequential vs Parallel:**

```java
// Sequential stream
Stream<String> sequential = StreamSupport.stream(spliterator, false);

// Parallel stream
Stream<String> parallel = StreamSupport.stream(spliterator, true);
```

Second parameter controls parallelism.

## Custom Spliterator: Range

Simple spliterator that generates numbers in a range:

```java
class RangeSpliterator implements Spliterator<Integer> {
    private int current;
    private final int end;
    private final int step;

    public RangeSpliterator(int start, int end, int step) {
        this.current = start;
        this.end = end;
        this.step = step;
    }

    @Override
    public boolean tryAdvance(Consumer<? super Integer> action) {
        if (current < end) {
            action.accept(current);
            current += step;
            return true;
        }
        return false;
    }

    @Override
    public Spliterator<Integer> trySplit() {
        int remaining = (end - current) / step;
        if (remaining <= 1) {
            return null;  // Too small to split
        }

        int splitPoint = current + (remaining / 2) * step;
        Spliterator<Integer> prefix = new RangeSpliterator(current, splitPoint, step);
        current = splitPoint;
        return prefix;
    }

    @Override
    public long estimateSize() {
        return (end - current + step - 1) / step;
    }

    @Override
    public int characteristics() {
        return ORDERED | SIZED | SUBSIZED | IMMUTABLE | NONNULL;
    }
}
```

**Usage:**

```java
Stream<Integer> range = StreamSupport.stream(
    new RangeSpliterator(0, 100, 2),
    false
);

range.forEach(System.out::println);  // Prints: 0, 2, 4, 6, ..., 98
```

**How trySplit works:**

1. Initial: `[0..100]`
2. First split: `[0..50]` and `[50..100]`
3. Split `[0..50]`: `[0..25]` and `[25..50]`
4. Split `[50..100]`: `[50..75]` and `[75..100]`
5. Continue until chunks too small

Parallel stream splits recursively, processing chunks on separate threads.

## Characteristics

Characteristics optimize stream operations:

```java
int ORDERED    = 0x00000010;  // Elements have defined order
int DISTINCT   = 0x00000001;  // Elements are distinct
int SORTED     = 0x00000004;  // Elements are sorted
int SIZED      = 0x00000040;  // Size is known and exact
int NONNULL    = 0x00000100;  // No null elements
int IMMUTABLE  = 0x00000400;  // Source cannot be modified
int CONCURRENT = 0x00001000;  // Safe for concurrent modification
int SUBSIZED   = 0x00004000;  // Splits are SIZED too
```

**Why they matter:**

```java
// SORTED allows optimization
stream.sorted()  // No-op if already SORTED

// SIZED enables parallel splitting
stream.limit(10)  // Efficient with SIZED, inefficient without

// DISTINCT optimizes distinct()
stream.distinct()  // No-op if already DISTINCT
```

**Combine characteristics with bitwise OR:**

```java
@Override
public int characteristics() {
    return ORDERED | SIZED | SUBSIZED | IMMUTABLE | NONNULL;
}
```

## File Line Spliterator

Read file lines as stream:

```java
class FileSpliterator implements Spliterator<String> {
    private final BufferedReader reader;
    private String nextLine;

    public FileSpliterator(Path path) throws IOException {
        this.reader = Files.newBufferedReader(path);
        advance();
    }

    private void advance() {
        try {
            nextLine = reader.readLine();
        } catch (IOException e) {
            nextLine = null;
        }
    }

    @Override
    public boolean tryAdvance(Consumer<? super String> action) {
        if (nextLine != null) {
            action.accept(nextLine);
            advance();
            return true;
        }
        return false;
    }

    @Override
    public Spliterator<String> trySplit() {
        return null;  // Files not easily splittable
    }

    @Override
    public long estimateSize() {
        return Long.MAX_VALUE;  // Unknown
    }

    @Override
    public int characteristics() {
        return ORDERED | NONNULL;
    }
}
```

**Usage:**

```java
Path logFile = Paths.get("/var/log/app.log");
Stream<String> lines = StreamSupport.stream(
    new FileSpliterator(logFile),
    false
);

long errorCount = lines
    .filter(line -> line.contains("ERROR"))
    .count();

System.out.println("Errors: " + errorCount);
```

**Note:** `Files.lines()` already provides this functionality. Custom spliterator shown for educational purposes.

## Database Result Set Spliterator

Stream database results:

```java
class ResultSetSpliterator implements Spliterator<Map<String, Object>> {
    private final ResultSet resultSet;
    private final ResultSetMetaData metaData;

    public ResultSetSpliterator(ResultSet resultSet) throws SQLException {
        this.resultSet = resultSet;
        this.metaData = resultSet.getMetaData();
    }

    @Override
    public boolean tryAdvance(Consumer<? super Map<String, Object>> action) {
        try {
            if (resultSet.next()) {
                Map<String, Object> row = new HashMap<>();
                int columnCount = metaData.getColumnCount();

                for (int i = 1; i <= columnCount; i++) {
                    String columnName = metaData.getColumnName(i);
                    Object value = resultSet.getObject(i);
                    row.put(columnName, value);
                }

                action.accept(row);
                return true;
            }
            return false;
        } catch (SQLException e) {
            throw new RuntimeException("Error reading ResultSet", e);
        }
    }

    @Override
    public Spliterator<Map<String, Object>> trySplit() {
        return null;  // ResultSet is sequential
    }

    @Override
    public long estimateSize() {
        return Long.MAX_VALUE;  // Unknown size
    }

    @Override
    public int characteristics() {
        return ORDERED | NONNULL;
    }
}
```

**Usage:**

```java
String query = "SELECT id, name, email, age FROM users WHERE age > 18";
try (Connection conn = dataSource.getConnection();
     Statement stmt = conn.createStatement();
     ResultSet rs = stmt.executeQuery(query)) {

    Stream<Map<String, Object>> users = StreamSupport.stream(
        new ResultSetSpliterator(rs),
        false
    );

    List<String> emails = users
        .map(row -> (String) row.get("email"))
        .collect(Collectors.toList());

    emails.forEach(System.out::println);
}
```

## Binary Tree Spliterator

Stream tree nodes with parallel splitting:

```java
class TreeNode<T> {
    T value;
    TreeNode<T> left;
    TreeNode<T> right;

    TreeNode(T value) {
        this.value = value;
    }
}

class TreeSpliterator<T> implements Spliterator<T> {
    private final Deque<TreeNode<T>> stack = new ArrayDeque<>();

    public TreeSpliterator(TreeNode<T> root) {
        if (root != null) {
            pushLeft(root);
        }
    }

    private TreeSpliterator(Deque<TreeNode<T>> stack) {
        this.stack.addAll(stack);
    }

    private void pushLeft(TreeNode<T> node) {
        while (node != null) {
            stack.push(node);
            node = node.left;
        }
    }

    @Override
    public boolean tryAdvance(Consumer<? super T> action) {
        if (stack.isEmpty()) {
            return false;
        }

        TreeNode<T> node = stack.pop();
        action.accept(node.value);

        if (node.right != null) {
            pushLeft(node.right);
        }

        return true;
    }

    @Override
    public Spliterator<T> trySplit() {
        if (stack.size() < 2) {
            return null;
        }

        Deque<TreeNode<T>> prefix = new ArrayDeque<>();
        int splitSize = stack.size() / 2;

        for (int i = 0; i < splitSize; i++) {
            prefix.push(stack.pop());
        }

        return new TreeSpliterator<>(prefix);
    }

    @Override
    public long estimateSize() {
        return stack.size();
    }

    @Override
    public int characteristics() {
        return ORDERED | SIZED | SUBSIZED;
    }
}
```

**Usage:**

```java
// Build tree
TreeNode<Integer> root = new TreeNode<>(10);
root.left = new TreeNode<>(5);
root.right = new TreeNode<>(15);
root.left.left = new TreeNode<>(3);
root.left.right = new TreeNode<>(7);
root.right.left = new TreeNode<>(12);
root.right.right = new TreeNode<>(20);

// Stream tree nodes
Stream<Integer> treeStream = StreamSupport.stream(
    new TreeSpliterator<>(root),
    true  // Parallel
);

List<Integer> values = treeStream
    .sorted()
    .collect(Collectors.toList());

System.out.println(values);  // [3, 5, 7, 10, 12, 15, 20]
```

## Paginated API Spliterator

Stream paginated API results:

```java
class PaginatedApiSpliterator<T> implements Spliterator<T> {
    private final Function<Integer, List<T>> fetcher;
    private final int pageSize;
    private int currentPage = 0;
    private List<T> currentBatch = new ArrayList<>();
    private int currentIndex = 0;

    public PaginatedApiSpliterator(Function<Integer, List<T>> fetcher, int pageSize) {
        this.fetcher = fetcher;
        this.pageSize = pageSize;
    }

    @Override
    public boolean tryAdvance(Consumer<? super T> action) {
        if (currentIndex >= currentBatch.size()) {
            currentBatch = fetcher.apply(currentPage++);
            currentIndex = 0;

            if (currentBatch.isEmpty()) {
                return false;
            }
        }

        action.accept(currentBatch.get(currentIndex++));
        return true;
    }

    @Override
    public Spliterator<T> trySplit() {
        return null;  // API pagination is sequential
    }

    @Override
    public long estimateSize() {
        return Long.MAX_VALUE;  // Unknown total size
    }

    @Override
    public int characteristics() {
        return ORDERED;
    }
}
```

**Usage:**

```java
// API client
class UserApiClient {
    public List<User> getUsers(int page, int size) {
        // HTTP call to /api/users?page={page}&size={size}
        return apiCall("/api/users", page, size);
    }
}

UserApiClient client = new UserApiClient();

// Create spliterator
Function<Integer, List<User>> fetcher = page -> client.getUsers(page, 100);
Spliterator<User> spliterator = new PaginatedApiSpliterator<>(fetcher, 100);

// Stream all users across pages
Stream<User> users = StreamSupport.stream(spliterator, false);

List<String> activeUserEmails = users
    .filter(User::isActive)
    .map(User::getEmail)
    .collect(Collectors.toList());
```

## Batch Processing Spliterator

Process elements in batches:

```java
class BatchSpliterator<T> implements Spliterator<List<T>> {
    private final Spliterator<T> source;
    private final int batchSize;

    public BatchSpliterator(Spliterator<T> source, int batchSize) {
        this.source = source;
        this.batchSize = batchSize;
    }

    @Override
    public boolean tryAdvance(Consumer<? super List<T>> action) {
        List<T> batch = new ArrayList<>(batchSize);

        for (int i = 0; i < batchSize && source.tryAdvance(batch::add); i++) {
            // Accumulate elements into batch
        }

        if (batch.isEmpty()) {
            return false;
        }

        action.accept(batch);
        return true;
    }

    @Override
    public Spliterator<List<T>> trySplit() {
        Spliterator<T> split = source.trySplit();
        return split == null ? null : new BatchSpliterator<>(split, batchSize);
    }

    @Override
    public long estimateSize() {
        long sourceSize = source.estimateSize();
        return sourceSize == Long.MAX_VALUE
            ? Long.MAX_VALUE
            : (sourceSize + batchSize - 1) / batchSize;
    }

    @Override
    public int characteristics() {
        return source.characteristics() & ~(SIZED | SUBSIZED);
    }
}
```

**Usage:**

```java
List<Integer> numbers = IntStream.rangeClosed(1, 1000)
    .boxed()
    .collect(Collectors.toList());

// Process in batches of 100
Stream<List<Integer>> batches = StreamSupport.stream(
    new BatchSpliterator<>(numbers.spliterator(), 100),
    false
);

batches.forEach(batch -> {
    System.out.println("Processing batch of " + batch.size() + " items");
    // Bulk database insert, API call, etc.
    saveBatch(batch);
});
```

## Infinite Spliterator

Generate infinite sequence:

```java
class FibonacciSpliterator implements Spliterator<Long> {
    private long prev = 0;
    private long current = 1;

    @Override
    public boolean tryAdvance(Consumer<? super Long> action) {
        action.accept(current);
        long next = prev + current;
        prev = current;
        current = next;
        return true;  // Infinite
    }

    @Override
    public Spliterator<Long> trySplit() {
        return null;  // Sequential
    }

    @Override
    public long estimateSize() {
        return Long.MAX_VALUE;
    }

    @Override
    public int characteristics() {
        return ORDERED | NONNULL | IMMUTABLE;
    }
}
```

**Usage:**

```java
Stream<Long> fibonacci = StreamSupport.stream(
    new FibonacciSpliterator(),
    false
);

List<Long> first20 = fibonacci
    .limit(20)
    .collect(Collectors.toList());

System.out.println(first20);
// [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987, 1597, 2584, 4181, 6765]
```

## Performance Considerations

### When to Implement trySplit

**Implement trySplit if:**
- Data structure supports efficient splitting (arrays, lists, ranges)
- Parallel processing provides benefit (CPU-intensive operations)
- Elements are independent (no shared state)

**Return null from trySplit if:**
- Sequential source (file, network, database cursor)
- Small dataset (overhead exceeds benefit)
- Splitting is expensive

### Estimating Size

**Return exact size when:**
- Collection has known size (arrays, lists)
- Characteristic SIZED is set

**Return Long.MAX_VALUE when:**
- Size unknown (files, infinite streams)
- Size expensive to compute

```java
@Override
public long estimateSize() {
    return hasKnownSize ? exactSize : Long.MAX_VALUE;
}
```

### Choosing Characteristics

More characteristics = more optimizations:

```java
// Minimal
return 0;

// Typical sequential
return ORDERED | NONNULL;

// Parallel-friendly
return ORDERED | SIZED | SUBSIZED | IMMUTABLE | NONNULL;

// Sorted data
return ORDERED | SORTED | SIZED | DISTINCT | IMMUTABLE | NONNULL;
```

## Comparing Iterator vs Spliterator

**Iterator:**

```java
Iterator<String> iterator = list.iterator();
while (iterator.hasNext()) {
    String item = iterator.next();
    process(item);
}
```

**Spliterator:**

```java
Spliterator<String> spliterator = list.spliterator();
spliterator.forEachRemaining(this::process);
```

**Key differences:**

| Feature | Iterator | Spliterator |
|---------|----------|-------------|
| Splitting | No | Yes (trySplit) |
| Size estimation | No | Yes (estimateSize) |
| Characteristics | No | Yes (characteristics) |
| Parallel support | No | Yes |
| Stream creation | Via collection | Direct |

## Real-World Example: CSV Spliterator

Parse CSV file as stream:

```java
class CsvSpliterator implements Spliterator<String[]> {
    private final BufferedReader reader;
    private final String delimiter;

    public CsvSpliterator(Path path, String delimiter) throws IOException {
        this.reader = Files.newBufferedReader(path);
        this.delimiter = delimiter;
    }

    @Override
    public boolean tryAdvance(Consumer<? super String[]> action) {
        try {
            String line = reader.readLine();
            if (line == null) {
                return false;
            }

            String[] fields = line.split(delimiter);
            action.accept(fields);
            return true;
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }

    @Override
    public Spliterator<String[]> trySplit() {
        return null;  // Sequential file reading
    }

    @Override
    public long estimateSize() {
        return Long.MAX_VALUE;
    }

    @Override
    public int characteristics() {
        return ORDERED | NONNULL;
    }
}
```

**Usage:**

```java
Path csvFile = Paths.get("users.csv");
Stream<String[]> rows = StreamSupport.stream(
    new CsvSpliterator(csvFile, ","),
    false
);

// Skip header, parse rows
List<User> users = rows
    .skip(1)  // Skip header row
    .map(fields -> new User(
        Long.parseLong(fields[0]),    // id
        fields[1],                      // name
        fields[2],                      // email
        Integer.parseInt(fields[3])     // age
    ))
    .filter(user -> user.getAge() >= 18)
    .collect(Collectors.toList());
```

## Best Practices

**1. Implement characteristics accurately:**

```java
@Override
public int characteristics() {
    // Don't claim SIZED if size is unknown
    // Don't claim IMMUTABLE if source can change
    // Don't claim SORTED without actual sorting
    return ORDERED | NONNULL;  // Only guarantee what's true
}
```

**2. Estimate size conservatively:**

```java
@Override
public long estimateSize() {
    // Underestimate rather than overestimate
    // Return Long.MAX_VALUE if truly unknown
    return knownSize >= 0 ? knownSize : Long.MAX_VALUE;
}
```

**3. Handle exceptions properly:**

```java
@Override
public boolean tryAdvance(Consumer<? super T> action) {
    try {
        // I/O or other operations
    } catch (IOException e) {
        throw new UncheckedIOException(e);  // Wrap checked exceptions
    }
}
```

**4. Close resources:**

```java
class ResourceSpliterator<T> implements Spliterator<T>, AutoCloseable {
    private final BufferedReader reader;

    @Override
    public void close() throws IOException {
        reader.close();
    }
}

// Usage
try (ResourceSpliterator<String> spliterator = new ResourceSpliterator<>(path)) {
    Stream<String> stream = StreamSupport.stream(spliterator, false);
    stream.forEach(System.out::println);
}
```

## Common Pitfalls

**Pitfall 1: Incorrect size estimation**

```java
// Bad: claims SIZED but returns estimate
@Override
public long estimateSize() {
    return approximateSize;
}

@Override
public int characteristics() {
    return SIZED;  // Wrong - size is not exact
}
```

**Pitfall 2: Mutable state in parallel**

```java
// Bad: shared mutable state
private int counter = 0;

@Override
public boolean tryAdvance(Consumer<? super Integer> action) {
    action.accept(counter++);  // Race condition in parallel
    return counter < limit;
}
```

**Pitfall 3: Inefficient trySplit**

```java
// Bad: creates new data structure on every split
@Override
public Spliterator<T> trySplit() {
    List<T> copy = new ArrayList<>(data);  // Expensive copy
    return copy.spliterator();
}
```

## Summary

Spliterators power Java streams:

- **Core methods**: tryAdvance (iterate), trySplit (parallel split), estimateSize (optimization), characteristics (metadata)
- **Custom sources**: Files, databases, APIs, trees, infinite sequences
- **Characteristics**: Optimize stream operations (SORTED, SIZED, DISTINCT, etc.)
- **Parallel support**: Implement trySplit for parallel-friendly data structures
- **Real-world use**: CSV parsing, paginated APIs, batch processing, database streaming

Master spliterators to create custom stream sources and control parallel processing for optimal performance.
