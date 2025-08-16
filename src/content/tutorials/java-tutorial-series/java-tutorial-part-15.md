---
title: "Java Tutorial Series - Part 15: Lambda Expressions and Functional Programming"
description: "Master Java lambda expressions, method references, Stream API, and functional programming concepts for writing concise and powerful code."
publishDate: 2025-01-15
tags: ["Java", "Lambda Expressions", "Functional Programming", "Stream API", "Method References", "Functional Interfaces"]
difficulty: "intermediate"
series: "Java Tutorial Series"
part: 15
estimatedTime: "120 minutes"
totalParts: 24
featured: false
---

# Java Tutorial Series - Part 15: Lambda Expressions and Functional Programming

Lambda expressions, introduced in Java 8, revolutionized Java programming by bringing functional programming concepts to the language. In this comprehensive part, we'll explore lambda expressions, method references, the Stream API, and functional programming patterns that make Java code more concise, readable, and powerful.

## Introduction to Lambda Expressions

### What are Lambda Expressions?

A lambda expression is a concise way to represent a function that can be passed around as a value. It's essentially a more compact way to write anonymous functions, particularly useful with functional interfaces.

```java
import java.util.*;
import java.util.function.*;

public class LambdaBasics {
    public static void main(String[] args) {
        System.out.println("=== Lambda Expressions Basics ===");
        
        // Traditional anonymous class approach
        Runnable traditionalRunnable = new Runnable() {
            @Override
            public void run() {
                System.out.println("Hello from traditional anonymous class!");
            }
        };
        
        // Lambda expression approach
        Runnable lambdaRunnable = () -> System.out.println("Hello from lambda expression!");
        
        // Execute both
        traditionalRunnable.run();
        lambdaRunnable.run();
        
        // Comparator examples
        List<String> names = Arrays.asList("Charlie", "Alice", "Bob", "David");
        
        // Traditional way
        Collections.sort(names, new Comparator<String>() {
            @Override
            public int compare(String a, String b) {
                return a.compareTo(b);
            }
        });
        System.out.println("Traditional sort: " + names);
        
        // Lambda way
        names = Arrays.asList("Charlie", "Alice", "Bob", "David");
        Collections.sort(names, (a, b) -> a.compareTo(b));
        System.out.println("Lambda sort: " + names);
        
        // Even more concise with method reference
        names = Arrays.asList("Charlie", "Alice", "Bob", "David");
        Collections.sort(names, String::compareTo);
        System.out.println("Method reference sort: " + names);
    }
}
```

### Lambda Syntax and Variations

```java
import java.util.function.*;

public class LambdaSyntax {
    public static void main(String[] args) {
        System.out.println("=== Lambda Syntax Variations ===");
        
        // 1. No parameters
        Runnable noParams = () -> System.out.println("No parameters");
        noParams.run();
        
        // 2. Single parameter (parentheses optional)
        Consumer<String> singleParam = message -> System.out.println("Message: " + message);
        Consumer<String> singleParamWithParens = (message) -> System.out.println("Message: " + message);
        
        singleParam.accept("Hello");
        singleParamWithParens.accept("World");
        
        // 3. Multiple parameters
        BinaryOperator<Integer> multipleParams = (a, b) -> a + b;
        System.out.println("Sum: " + multipleParams.apply(5, 3));
        
        // 4. Block body vs expression body
        // Expression body (single expression)
        Function<Integer, Integer> expressionBody = x -> x * x;
        
        // Block body (multiple statements)
        Function<Integer, Integer> blockBody = x -> {
            int result = x * x;
            System.out.println("Calculating square of " + x + " = " + result);
            return result;
        };
        
        System.out.println("Expression result: " + expressionBody.apply(4));
        System.out.println("Block result: " + blockBody.apply(4));
        
        // 5. Type inference vs explicit types
        BinaryOperator<Integer> typeInference = (a, b) -> a * b;
        BinaryOperator<Integer> explicitTypes = (Integer a, Integer b) -> a * b;
        
        System.out.println("Type inference: " + typeInference.apply(6, 7));
        System.out.println("Explicit types: " + explicitTypes.apply(6, 7));
        
        // 6. Capturing variables from enclosing scope
        String prefix = "Result: ";
        Function<Integer, String> capturingLambda = num -> prefix + num;
        System.out.println(capturingLambda.apply(42));
        
        // Variables must be effectively final
        int multiplier = 10; // effectively final
        Function<Integer, Integer> multiplierLambda = x -> x * multiplier;
        System.out.println("Multiplied: " + multiplierLambda.apply(5));
        
        // This would cause a compilation error:
        // multiplier = 20; // Cannot modify captured variable
    }
}
```

## Working with Built-in Functional Interfaces

### Common Functional Interfaces

```java
import java.util.*;
import java.util.function.*;

public class FunctionalInterfacesDemo {
    
    public static void demonstratePredicate() {
        System.out.println("=== Predicate<T> Examples ===");
        
        // Basic predicates
        Predicate<Integer> isEven = n -> n % 2 == 0;
        Predicate<Integer> isPositive = n -> n > 0;
        Predicate<String> isLongString = s -> s.length() > 5;
        Predicate<String> startsWithA = s -> s.toLowerCase().startsWith("a");
        
        // Test basic predicates
        System.out.println("Is 4 even? " + isEven.test(4));
        System.out.println("Is 3 even? " + isEven.test(3));
        System.out.println("Is 5 positive? " + isPositive.test(5));
        System.out.println("Is 'Programming' long? " + isLongString.test("Programming"));
        
        // Combining predicates
        Predicate<Integer> evenAndPositive = isEven.and(isPositive);
        Predicate<Integer> oddOrNegative = isEven.negate().or(isPositive.negate());
        
        List<Integer> numbers = Arrays.asList(-4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6);
        
        System.out.println("Original numbers: " + numbers);
        System.out.println("Even and positive: " + filterList(numbers, evenAndPositive));
        System.out.println("Odd or negative: " + filterList(numbers, oddOrNegative));
        
        // String predicate combinations
        List<String> words = Arrays.asList("apple", "application", "cat", "amazing", "programming", "java");
        Predicate<String> longAndStartsWithA = isLongString.and(startsWithA);
        
        System.out.println("Words: " + words);
        System.out.println("Long words starting with 'a': " + filterList(words, longAndStartsWithA));
    }
    
    public static void demonstrateFunction() {
        System.out.println("\n=== Function<T, R> Examples ===");
        
        // Basic functions
        Function<String, Integer> stringLength = String::length;
        Function<Integer, Integer> square = x -> x * x;
        Function<String, String> toUpperCase = String::toUpperCase;
        Function<Double, String> formatPrice = price -> String.format("$%.2f", price);
        
        // Test basic functions
        System.out.println("Length of 'Hello': " + stringLength.apply("Hello"));
        System.out.println("Square of 7: " + square.apply(7));
        System.out.println("Uppercase 'world': " + toUpperCase.apply("world"));
        System.out.println("Formatted price: " + formatPrice.apply(19.99));
        
        // Function composition
        Function<String, String> trimAndUpper = String::trim;
        trimAndUpper = trimAndUpper.andThen(String::toUpperCase);
        
        Function<Integer, String> squareAndFormat = square.andThen(Object::toString);
        
        System.out.println("Trim and upper '  hello  ': '" + trimAndUpper.apply("  hello  ") + "'");
        System.out.println("Square and format 8: " + squareAndFormat.apply(8));
        
        // Complex transformation chain
        Function<String, String> complexTransform = String::trim
            .andThen(String::toLowerCase)
            .andThen(s -> s.replace(" ", "_"))
            .andThen(s -> "processed_" + s);
        
        System.out.println("Complex transform '  Hello World  ': " + 
                         complexTransform.apply("  Hello World  "));
        
        // Using functions with collections
        List<String> names = Arrays.asList("alice", "bob", "charlie", "diana");
        List<Integer> nameLengths = transformList(names, stringLength);
        List<String> upperNames = transformList(names, toUpperCase);
        
        System.out.println("Names: " + names);
        System.out.println("Name lengths: " + nameLengths);
        System.out.println("Upper case names: " + upperNames);
    }
    
    public static void demonstrateConsumer() {
        System.out.println("\n=== Consumer<T> Examples ===");
        
        // Basic consumers
        Consumer<String> printWithBorder = text -> System.out.println("*** " + text + " ***");
        Consumer<Integer> printSquare = num -> System.out.println(num + "² = " + (num * num));
        Consumer<List<String>> printListSize = list -> System.out.println("List size: " + list.size());
        
        // Test basic consumers
        printWithBorder.accept("Hello Consumer");
        printSquare.accept(6);
        printListSize.accept(Arrays.asList("a", "b", "c"));
        
        // Chaining consumers
        Consumer<String> logger = text -> System.out.println("[LOG] " + text);
        Consumer<String> emailSender = text -> System.out.println("[EMAIL] Sending: " + text);
        Consumer<String> dbSaver = text -> System.out.println("[DB] Saving: " + text);
        
        Consumer<String> multiProcessor = logger.andThen(emailSender).andThen(dbSaver);
        multiProcessor.accept("Important message");
        
        // BiConsumer examples
        BiConsumer<String, Integer> printKeyValue = (key, value) -> 
            System.out.println(key + " => " + value);
        
        BiConsumer<String, String> greeting = (firstName, lastName) ->
            System.out.println("Hello, " + firstName + " " + lastName + "!");
        
        printKeyValue.accept("Age", 25);
        printKeyValue.accept("Score", 95);
        greeting.accept("John", "Doe");
        
        // Processing collections with consumers
        List<String> messages = Arrays.asList("Info message", "Warning message", "Error message");
        System.out.println("\nProcessing messages:");
        processEach(messages, printWithBorder);
    }
    
    public static void demonstrateSupplier() {
        System.out.println("\n=== Supplier<T> Examples ===");
        
        // Basic suppliers
        Supplier<String> randomGreeting = () -> {
            String[] greetings = {"Hello", "Hi", "Hey", "Greetings", "Salutations"};
            return greetings[(int)(Math.random() * greetings.length)];
        };
        
        Supplier<Double> randomPrice = () -> Math.round((Math.random() * 100) * 100.0) / 100.0;
        Supplier<String> timestamp = () -> java.time.LocalDateTime.now().toString();
        Supplier<UUID> uniqueId = UUID::randomUUID;
        
        // Test suppliers
        System.out.println("Random greeting: " + randomGreeting.get());
        System.out.println("Random price: $" + randomPrice.get());
        System.out.println("Current timestamp: " + timestamp.get());
        System.out.println("Unique ID: " + uniqueId.get());
        
        // Lazy initialization with suppliers
        Supplier<List<String>> expensiveListCreation = () -> {
            System.out.println("Creating expensive list...");
            List<String> list = new ArrayList<>();
            for (int i = 0; i < 1000; i++) {
                list.add("Item " + i);
            }
            return list;
        };
        
        System.out.println("Supplier created (list not yet created)");
        List<String> lazyList = expensiveListCreation.get(); // Only now is the list created
        System.out.println("List created with " + lazyList.size() + " items");
        
        // Factory pattern with suppliers
        Supplier<StringBuilder> stringBuilderFactory = StringBuilder::new;
        Supplier<HashMap<String, Integer>> mapFactory = HashMap::new;
        
        StringBuilder sb = stringBuilderFactory.get();
        sb.append("Hello").append(" ").append("World");
        System.out.println("StringBuilder result: " + sb.toString());
        
        Map<String, Integer> map = mapFactory.get();
        map.put("Java", 8);
        map.put("Python", 3);
        System.out.println("Map contents: " + map);
    }
    
    public static void demonstrateAdvancedFunctionalInterfaces() {
        System.out.println("\n=== Advanced Functional Interfaces ===");
        
        // UnaryOperator<T> - special case of Function<T, T>
        UnaryOperator<String> addQuotes = s -> "\"" + s + "\"";
        UnaryOperator<Integer> factorial = n -> {
            int result = 1;
            for (int i = 2; i <= n; i++) {
                result *= i;
            }
            return result;
        };
        
        System.out.println("Add quotes: " + addQuotes.apply("Hello World"));
        System.out.println("Factorial of 5: " + factorial.apply(5));
        
        // BinaryOperator<T> - special case of BiFunction<T, T, T>
        BinaryOperator<Integer> max = Integer::max;
        BinaryOperator<String> concat = (a, b) -> a + " " + b;
        BinaryOperator<Double> average = (a, b) -> (a + b) / 2;
        
        System.out.println("Max of 15 and 23: " + max.apply(15, 23));
        System.out.println("Concat: " + concat.apply("Hello", "World"));
        System.out.println("Average of 10.5 and 7.3: " + average.apply(10.5, 7.3));
        
        // BiFunction<T, U, R>
        BiFunction<String, Integer, String> repeat = (str, times) -> str.repeat(times);
        BiFunction<Double, Double, String> formatCoordinate = (x, y) -> 
            String.format("(%.2f, %.2f)", x, y);
        
        System.out.println("Repeat 'Java' 3 times: " + repeat.apply("Java", 3));
        System.out.println("Format coordinate: " + formatCoordinate.apply(12.345, 67.890));
        
        // BiPredicate<T, U>
        BiPredicate<String, Integer> isLengthEqual = (str, len) -> str.length() == len;
        BiPredicate<Integer, Integer> isFirstGreater = (a, b) -> a > b;
        
        System.out.println("Is 'Hello' length 5? " + isLengthEqual.test("Hello", 5));
        System.out.println("Is 10 > 7? " + isFirstGreater.test(10, 7));
    }
    
    // Helper methods
    public static <T> List<T> filterList(List<T> list, Predicate<T> predicate) {
        List<T> result = new ArrayList<>();
        for (T item : list) {
            if (predicate.test(item)) {
                result.add(item);
            }
        }
        return result;
    }
    
    public static <T, R> List<R> transformList(List<T> list, Function<T, R> function) {
        List<R> result = new ArrayList<>();
        for (T item : list) {
            result.add(function.apply(item));
        }
        return result;
    }
    
    public static <T> void processEach(List<T> list, Consumer<T> consumer) {
        for (T item : list) {
            consumer.accept(item);
        }
    }
    
    public static void main(String[] args) {
        demonstratePredicate();
        demonstrateFunction();
        demonstrateConsumer();
        demonstrateSupplier();
        demonstrateAdvancedFunctionalInterfaces();
    }
}
```

## Method References

### Types of Method References

```java
import java.util.*;
import java.util.function.*;

public class MethodReferencesDemo {
    
    // Sample class for instance method references
    static class StringProcessor {
        private String prefix;
        
        public StringProcessor(String prefix) {
            this.prefix = prefix;
        }
        
        public String addPrefix(String text) {
            return prefix + text;
        }
        
        public String processText(String text) {
            return text.toUpperCase().trim();
        }
    }
    
    // Sample class for constructor references
    static class Person {
        private String name;
        private int age;
        
        public Person() {
            this("Unknown", 0);
        }
        
        public Person(String name) {
            this(name, 0);
        }
        
        public Person(String name, int age) {
            this.name = name;
            this.age = age;
        }
        
        public String getName() { return name; }
        public int getAge() { return age; }
        
        @Override
        public String toString() {
            return String.format("Person{name='%s', age=%d}", name, age);
        }
        
        // Static method for method reference
        public static Person createDefaultPerson() {
            return new Person("Default", 25);
        }
    }
    
    public static void demonstrateStaticMethodReferences() {
        System.out.println("=== Static Method References ===");
        
        // Static method references
        Function<Double, Double> sqrt = Math::sqrt;
        Function<Double, Double> abs = Math::abs;
        BiFunction<Double, Double, Double> max = Math::max;
        Function<String, Integer> parseInt = Integer::parseInt;
        
        System.out.println("Square root of 16: " + sqrt.apply(16.0));
        System.out.println("Absolute value of -42: " + abs.apply(-42.0));
        System.out.println("Max of 10.5 and 7.8: " + max.apply(10.5, 7.8));
        System.out.println("Parse '123': " + parseInt.apply("123"));
        
        // Using with collections
        List<String> numbers = Arrays.asList("1", "2", "3", "4", "5");
        List<Integer> parsed = numbers.stream()
            .map(Integer::parseInt)  // Static method reference
            .collect(java.util.stream.Collectors.toList());
        
        System.out.println("Original strings: " + numbers);
        System.out.println("Parsed integers: " + parsed);
        
        // Custom static method reference
        Supplier<Person> defaultPersonSupplier = Person::createDefaultPerson;
        Person defaultPerson = defaultPersonSupplier.get();
        System.out.println("Default person: " + defaultPerson);
    }
    
    public static void demonstrateInstanceMethodReferences() {
        System.out.println("\n=== Instance Method References ===");
        
        // Instance method references on arbitrary objects of a particular type
        Function<String, String> toUpperCase = String::toUpperCase;
        Function<String, String> toLowerCase = String::toLowerCase;
        Function<String, Integer> length = String::length;
        Predicate<String> isEmpty = String::isEmpty;
        
        List<String> words = Arrays.asList("Hello", "WORLD", "Java", "PROGRAMMING");
        
        System.out.println("Original words: " + words);
        
        List<String> upperCased = words.stream()
            .map(String::toUpperCase)  // Instance method reference
            .collect(java.util.stream.Collectors.toList());
        System.out.println("Upper cased: " + upperCased);
        
        List<Integer> lengths = words.stream()
            .map(String::length)       // Instance method reference
            .collect(java.util.stream.Collectors.toList());
        System.out.println("Lengths: " + lengths);
        
        // BiFunction with instance method references
        BiFunction<String, String, Boolean> startsWith = String::startsWith;
        BiFunction<String, String, String> concat = String::concat;
        
        System.out.println("Does 'Hello' start with 'He'? " + startsWith.apply("Hello", "He"));
        System.out.println("Concat 'Hello' and 'World': " + concat.apply("Hello", "World"));
        
        // Instance method reference on a particular object
        StringProcessor processor = new StringProcessor("PREFIX: ");
        Function<String, String> addPrefixRef = processor::addPrefix;
        Function<String, String> processTextRef = processor::processText;
        
        System.out.println("Add prefix: " + addPrefixRef.apply("Test"));
        System.out.println("Process text: " + processTextRef.apply("  hello world  "));
        
        // Comparator with method references
        List<String> names = Arrays.asList("Alice", "Bob", "Charlie", "Diana");
        
        // Sort by natural order
        names.sort(String::compareTo);
        System.out.println("Sorted by natural order: " + names);
        
        // Sort by length
        names.sort(Comparator.comparing(String::length));
        System.out.println("Sorted by length: " + names);
        
        // Sort by length then by natural order
        names.sort(Comparator.comparing(String::length).thenComparing(String::compareTo));
        System.out.println("Sorted by length then natural order: " + names);
    }
    
    public static void demonstrateConstructorReferences() {
        System.out.println("\n=== Constructor References ===");
        
        // Simple constructor references
        Supplier<StringBuilder> stringBuilderSupplier = StringBuilder::new;
        Supplier<ArrayList<String>> listSupplier = ArrayList::new;
        Supplier<Person> personSupplier = Person::new;
        
        StringBuilder sb = stringBuilderSupplier.get();
        sb.append("Hello ").append("Constructor ").append("Reference");
        System.out.println("StringBuilder result: " + sb.toString());
        
        List<String> list = listSupplier.get();
        list.add("Item 1");
        list.add("Item 2");
        System.out.println("List contents: " + list);
        
        Person person = personSupplier.get();
        System.out.println("Default person: " + person);
        
        // Constructor references with parameters
        Function<String, Person> personWithName = Person::new;
        BiFunction<String, Integer, Person> personWithNameAndAge = Person::new;
        
        Person alice = personWithName.apply("Alice");
        Person bob = personWithNameAndAge.apply("Bob", 30);
        
        System.out.println("Person with name: " + alice);
        System.out.println("Person with name and age: " + bob);
        
        // Using constructor references with streams
        List<String> namesList = Arrays.asList("Charlie", "Diana", "Eve");
        List<Person> persons = namesList.stream()
            .map(Person::new)  // Constructor reference
            .collect(java.util.stream.Collectors.toList());
        
        System.out.println("Persons created from names: " + persons);
        
        // Array constructor references
        IntFunction<int[]> arrayCreator = int[]::new;
        Function<Integer, String[]> stringArrayCreator = String[]::new;
        
        int[] numbers = arrayCreator.apply(5);
        String[] strings = stringArrayCreator.apply(3);
        
        System.out.println("Created int array of length: " + numbers.length);
        System.out.println("Created String array of length: " + strings.length);
        
        // Generic constructor references
        Supplier<Map<String, Integer>> mapSupplier = HashMap::new;
        Supplier<Set<String>> setSupplier = HashSet::new;
        
        Map<String, Integer> map = mapSupplier.get();
        Set<String> set = setSupplier.get();
        
        map.put("key1", 100);
        set.add("element1");
        
        System.out.println("Map: " + map);
        System.out.println("Set: " + set);
    }
    
    public static void demonstrateAdvancedMethodReferences() {
        System.out.println("\n=== Advanced Method Reference Patterns ===");
        
        // Method reference chaining with streams
        List<String> sentences = Arrays.asList(
            "  Hello World  ", 
            "  JAVA programming  ", 
            "  Lambda Expressions  "
        );
        
        List<String> processed = sentences.stream()
            .map(String::trim)              // Remove whitespace
            .map(String::toLowerCase)       // Convert to lowercase
            .map(s -> s.replace(" ", "_"))  // Replace spaces with underscores
            .collect(java.util.stream.Collectors.toList());
        
        System.out.println("Original sentences: " + sentences);
        System.out.println("Processed sentences: " + processed);
        
        // Using method references with Optional
        Optional<String> optional = Optional.of("  Hello World  ");
        String result = optional
            .map(String::trim)
            .map(String::toUpperCase)
            .orElse("Default");
        
        System.out.println("Optional processing result: " + result);
        
        // Method references with reduce operations
        List<Integer> nums = Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);
        
        Optional<Integer> sum = nums.stream().reduce(Integer::sum);
        Optional<Integer> max = nums.stream().reduce(Integer::max);
        Optional<Integer> min = nums.stream().reduce(Integer::min);
        
        System.out.println("Numbers: " + nums);
        System.out.println("Sum: " + sum.orElse(0));
        System.out.println("Max: " + max.orElse(0));
        System.out.println("Min: " + min.orElse(0));
        
        // Method references with grouping
        List<Person> people = Arrays.asList(
            new Person("Alice", 25),
            new Person("Bob", 30),
            new Person("Charlie", 25),
            new Person("Diana", 30)
        );
        
        Map<Integer, List<Person>> groupedByAge = people.stream()
            .collect(java.util.stream.Collectors.groupingBy(Person::getAge));
        
        System.out.println("People grouped by age:");
        groupedByAge.forEach((age, personList) -> {
            System.out.println("  Age " + age + ": " + personList);
        });
    }
    
    public static void main(String[] args) {
        demonstrateStaticMethodReferences();
        demonstrateInstanceMethodReferences();
        demonstrateConstructorReferences();
        demonstrateAdvancedMethodReferences();
    }
}
```

## Stream API Fundamentals

### Creating and Using Streams

```java
import java.util.*;
import java.util.stream.*;
import java.util.function.*;

public class StreamBasics {
    
    // Sample data classes
    static class Product {
        private String name;
        private String category;
        private double price;
        private int rating;
        private boolean inStock;
        
        public Product(String name, String category, double price, int rating, boolean inStock) {
            this.name = name;
            this.category = category;
            this.price = price;
            this.rating = rating;
            this.inStock = inStock;
        }
        
        // Getters
        public String getName() { return name; }
        public String getCategory() { return category; }
        public double getPrice() { return price; }
        public int getRating() { return rating; }
        public boolean isInStock() { return inStock; }
        
        @Override
        public String toString() {
            return String.format("%s (%s, $%.2f, %d⭐, %s)", 
                name, category, price, rating, inStock ? "In Stock" : "Out of Stock");
        }
    }
    
    public static void demonstrateStreamCreation() {
        System.out.println("=== Stream Creation ===");
        
        // 1. From collections
        List<String> list = Arrays.asList("apple", "banana", "cherry");
        Stream<String> fromList = list.stream();
        System.out.println("From list: " + fromList.collect(Collectors.toList()));
        
        // 2. From arrays
        String[] array = {"red", "green", "blue"};
        Stream<String> fromArray = Arrays.stream(array);
        System.out.println("From array: " + fromArray.collect(Collectors.toList()));
        
        // 3. Using Stream.of()
        Stream<Integer> numbers = Stream.of(1, 2, 3, 4, 5);
        System.out.println("Using Stream.of(): " + numbers.collect(Collectors.toList()));
        
        // 4. Using Stream.generate()
        Stream<String> generated = Stream.generate(() -> "Hello")
            .limit(3);
        System.out.println("Generated stream: " + generated.collect(Collectors.toList()));
        
        // 5. Using Stream.iterate()
        Stream<Integer> iterated = Stream.iterate(0, n -> n + 2)
            .limit(5);
        System.out.println("Iterated stream: " + iterated.collect(Collectors.toList()));
        
        // 6. Range streams
        IntStream range = IntStream.range(1, 6);
        System.out.println("Range stream: " + range.boxed().collect(Collectors.toList()));
        
        IntStream rangeClosed = IntStream.rangeClosed(1, 5);
        System.out.println("Range closed stream: " + rangeClosed.boxed().collect(Collectors.toList()));
        
        // 7. Empty streams
        Stream<String> empty = Stream.empty();
        System.out.println("Empty stream size: " + empty.count());
        
        // 8. From individual elements
        Stream<String> individual = Stream.of("single");
        System.out.println("Single element stream: " + individual.collect(Collectors.toList()));
    }
    
    public static void demonstrateIntermediateOperations() {
        System.out.println("\n=== Intermediate Operations ===");
        
        List<Product> products = Arrays.asList(
            new Product("Laptop", "Electronics", 999.99, 4, true),
            new Product("Mouse", "Electronics", 29.99, 5, true),
            new Product("Keyboard", "Electronics", 79.99, 4, false),
            new Product("Chair", "Furniture", 199.99, 3, true),
            new Product("Desk", "Furniture", 299.99, 4, true),
            new Product("Monitor", "Electronics", 249.99, 5, true),
            new Product("Book", "Education", 19.99, 5, true),
            new Product("Lamp", "Furniture", 49.99, 4, false)
        );
        
        System.out.println("Original products:");
        products.forEach(System.out::println);
        
        // Filter - select elements based on condition
        System.out.println("\n--- Filter Examples ---");
        List<Product> inStockProducts = products.stream()
            .filter(Product::isInStock)
            .collect(Collectors.toList());
        System.out.println("In stock products: " + inStockProducts.size());
        
        List<Product> expensiveProducts = products.stream()
            .filter(p -> p.getPrice() > 100)
            .collect(Collectors.toList());
        System.out.println("Expensive products (>$100): " + expensiveProducts.size());
        
        List<Product> highRatedElectronics = products.stream()
            .filter(p -> p.getCategory().equals("Electronics"))
            .filter(p -> p.getRating() >= 4)
            .collect(Collectors.toList());
        System.out.println("High-rated electronics:");
        highRatedElectronics.forEach(System.out::println);
        
        // Map - transform elements
        System.out.println("\n--- Map Examples ---");
        List<String> productNames = products.stream()
            .map(Product::getName)
            .collect(Collectors.toList());
        System.out.println("Product names: " + productNames);
        
        List<String> uppercaseNames = products.stream()
            .map(Product::getName)
            .map(String::toUpperCase)
            .collect(Collectors.toList());
        System.out.println("Uppercase names: " + uppercaseNames);
        
        List<Double> discountedPrices = products.stream()
            .map(Product::getPrice)
            .map(price -> price * 0.9) // 10% discount
            .collect(Collectors.toList());
        System.out.println("Discounted prices: " + discountedPrices);
        
        // FlatMap - flatten nested structures
        System.out.println("\n--- FlatMap Examples ---");
        List<List<String>> nestedLists = Arrays.asList(
            Arrays.asList("a", "b"),
            Arrays.asList("c", "d", "e"),
            Arrays.asList("f")
        );
        
        List<String> flattened = nestedLists.stream()
            .flatMap(List::stream)
            .collect(Collectors.toList());
        System.out.println("Nested lists: " + nestedLists);
        System.out.println("Flattened: " + flattened);
        
        // Distinct - remove duplicates
        System.out.println("\n--- Distinct Examples ---");
        List<String> categories = products.stream()
            .map(Product::getCategory)
            .distinct()
            .collect(Collectors.toList());
        System.out.println("Unique categories: " + categories);
        
        // Sorted - sort elements
        System.out.println("\n--- Sorted Examples ---");
        List<Product> sortedByPrice = products.stream()
            .sorted(Comparator.comparing(Product::getPrice))
            .collect(Collectors.toList());
        System.out.println("Sorted by price (ascending):");
        sortedByPrice.forEach(p -> System.out.println("  " + p.getName() + " - $" + p.getPrice()));
        
        List<Product> sortedByPriceDesc = products.stream()
            .sorted(Comparator.comparing(Product::getPrice).reversed())
            .collect(Collectors.toList());
        System.out.println("Sorted by price (descending):");
        sortedByPriceDesc.forEach(p -> System.out.println("  " + p.getName() + " - $" + p.getPrice()));
        
        // Multiple sorting criteria
        List<Product> sortedMultiple = products.stream()
            .sorted(Comparator.comparing(Product::getCategory)
                   .thenComparing(Product::getPrice))
            .collect(Collectors.toList());
        System.out.println("Sorted by category then price:");
        sortedMultiple.forEach(p -> System.out.println("  " + p.getCategory() + " - " + p.getName() + " - $" + p.getPrice()));
        
        // Limit and Skip - pagination
        System.out.println("\n--- Limit and Skip Examples ---");
        List<Product> firstThree = products.stream()
            .limit(3)
            .collect(Collectors.toList());
        System.out.println("First 3 products: " + firstThree.size());
        
        List<Product> skipFirstTwo = products.stream()
            .skip(2)
            .collect(Collectors.toList());
        System.out.println("Skip first 2: " + skipFirstTwo.size());
        
        List<Product> pagination = products.stream()
            .skip(2)
            .limit(3)
            .collect(Collectors.toList());
        System.out.println("Pagination (skip 2, take 3): " + pagination.size());
        
        // Peek - debug/side effects
        System.out.println("\n--- Peek Examples ---");
        List<String> processedNames = products.stream()
            .peek(p -> System.out.println("Processing: " + p.getName()))
            .map(Product::getName)
            .peek(name -> System.out.println("Mapped to: " + name))
            .filter(name -> name.length() > 5)
            .peek(name -> System.out.println("Filtered: " + name))
            .collect(Collectors.toList());
        System.out.println("Final result: " + processedNames);
    }
    
    public static void demonstrateTerminalOperations() {
        System.out.println("\n=== Terminal Operations ===");
        
        List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);
        
        // forEach - perform action on each element
        System.out.println("--- forEach Examples ---");
        System.out.print("Numbers: ");
        numbers.stream().forEach(n -> System.out.print(n + " "));
        System.out.println();
        
        // collect - accumulate into collections
        System.out.println("\n--- Collect Examples ---");
        List<Integer> evenNumbers = numbers.stream()
            .filter(n -> n % 2 == 0)
            .collect(Collectors.toList());
        System.out.println("Even numbers: " + evenNumbers);
        
        Set<Integer> uniqueNumbers = numbers.stream()
            .collect(Collectors.toSet());
        System.out.println("As set: " + uniqueNumbers);
        
        String joinedNumbers = numbers.stream()
            .map(String::valueOf)
            .collect(Collectors.joining(", ", "[", "]"));
        System.out.println("Joined: " + joinedNumbers);
        
        // reduce - combine elements
        System.out.println("\n--- Reduce Examples ---");
        Optional<Integer> sum = numbers.stream()
            .reduce(Integer::sum);
        System.out.println("Sum: " + sum.orElse(0));
        
        Optional<Integer> max = numbers.stream()
            .reduce(Integer::max);
        System.out.println("Max: " + max.orElse(0));
        
        Integer product = numbers.stream()
            .reduce(1, (a, b) -> a * b);
        System.out.println("Product: " + product);
        
        // count - count elements
        System.out.println("\n--- Count Examples ---");
        long totalCount = numbers.stream().count();
        long evenCount = numbers.stream()
            .filter(n -> n % 2 == 0)
            .count();
        System.out.println("Total count: " + totalCount);
        System.out.println("Even count: " + evenCount);
        
        // min/max - find extremes
        System.out.println("\n--- Min/Max Examples ---");
        Optional<Integer> minimum = numbers.stream()
            .min(Integer::compareTo);
        Optional<Integer> maximum = numbers.stream()
            .max(Integer::compareTo);
        System.out.println("Minimum: " + minimum.orElse(0));
        System.out.println("Maximum: " + maximum.orElse(0));
        
        // anyMatch, allMatch, noneMatch - test conditions
        System.out.println("\n--- Match Examples ---");
        boolean hasEven = numbers.stream()
            .anyMatch(n -> n % 2 == 0);
        boolean allPositive = numbers.stream()
            .allMatch(n -> n > 0);
        boolean noneNegative = numbers.stream()
            .noneMatch(n -> n < 0);
        
        System.out.println("Has even numbers: " + hasEven);
        System.out.println("All positive: " + allPositive);
        System.out.println("None negative: " + noneNegative);
        
        // findFirst, findAny - find elements
        System.out.println("\n--- Find Examples ---");
        Optional<Integer> firstEven = numbers.stream()
            .filter(n -> n % 2 == 0)
            .findFirst();
        Optional<Integer> anyOdd = numbers.stream()
            .filter(n -> n % 2 == 1)
            .findAny();
        
        System.out.println("First even: " + firstEven.orElse(-1));
        System.out.println("Any odd: " + anyOdd.orElse(-1));
    }
    
    public static void main(String[] args) {
        demonstrateStreamCreation();
        demonstrateIntermediateOperations();
        demonstrateTerminalOperations();
    }
}
```

## Advanced Stream Operations

### Complex Stream Processing

```java
import java.util.*;
import java.util.stream.*;
import java.time.LocalDate;
import java.time.Month;

public class AdvancedStreams {
    
    // Enhanced data classes
    static class Employee {
        private String name;
        private String department;
        private double salary;
        private LocalDate hireDate;
        private List<String> skills;
        
        public Employee(String name, String department, double salary, LocalDate hireDate, String... skills) {
            this.name = name;
            this.department = department;
            this.salary = salary;
            this.hireDate = hireDate;
            this.skills = Arrays.asList(skills);
        }
        
        // Getters
        public String getName() { return name; }
        public String getDepartment() { return department; }
        public double getSalary() { return salary; }
        public LocalDate getHireDate() { return hireDate; }
        public List<String> getSkills() { return skills; }
        
        @Override
        public String toString() {
            return String.format("%s (%s, $%.0f, %s)", name, department, salary, hireDate.getYear());
        }
    }
    
    static class Order {
        private String orderId;
        private String customerId;
        private LocalDate orderDate;
        private List<OrderItem> items;
        private String status;
        
        public Order(String orderId, String customerId, LocalDate orderDate, String status, OrderItem... items) {
            this.orderId = orderId;
            this.customerId = customerId;
            this.orderDate = orderDate;
            this.status = status;
            this.items = Arrays.asList(items);
        }
        
        public String getOrderId() { return orderId; }
        public String getCustomerId() { return customerId; }
        public LocalDate getOrderDate() { return orderDate; }
        public List<OrderItem> getItems() { return items; }
        public String getStatus() { return status; }
        
        public double getTotalAmount() {
            return items.stream()
                .mapToDouble(item -> item.getPrice() * item.getQuantity())
                .sum();
        }
        
        @Override
        public String toString() {
            return String.format("Order{id='%s', customer='%s', total=$%.2f, status='%s'}", 
                orderId, customerId, getTotalAmount(), status);
        }
    }
    
    static class OrderItem {
        private String productName;
        private double price;
        private int quantity;
        
        public OrderItem(String productName, double price, int quantity) {
            this.productName = productName;
            this.price = price;
            this.quantity = quantity;
        }
        
        public String getProductName() { return productName; }
        public double getPrice() { return price; }
        public int getQuantity() { return quantity; }
    }
    
    public static void demonstrateGroupingAndPartitioning() {
        System.out.println("=== Grouping and Partitioning ===");
        
        List<Employee> employees = Arrays.asList(
            new Employee("Alice", "Engineering", 85000, LocalDate.of(2020, 1, 15), "Java", "Python", "SQL"),
            new Employee("Bob", "Engineering", 75000, LocalDate.of(2021, 3, 10), "JavaScript", "React", "Node.js"),
            new Employee("Charlie", "Marketing", 65000, LocalDate.of(2019, 6, 20), "Analytics", "SEO"),
            new Employee("Diana", "Engineering", 90000, LocalDate.of(2018, 8, 5), "Java", "Spring", "Docker"),
            new Employee("Eve", "Sales", 70000, LocalDate.of(2022, 2, 1), "Negotiation", "CRM"),
            new Employee("Frank", "Marketing", 68000, LocalDate.of(2020, 11, 12), "Content", "Social Media"),
            new Employee("Grace", "Engineering", 95000, LocalDate.of(2017, 4, 30), "Python", "Machine Learning", "TensorFlow")
        );
        
        // Simple grouping
        System.out.println("--- Simple Grouping ---");
        Map<String, List<Employee>> byDepartment = employees.stream()
            .collect(Collectors.groupingBy(Employee::getDepartment));
        
        byDepartment.forEach((dept, empList) -> {
            System.out.println(dept + ": " + empList.size() + " employees");
            empList.forEach(emp -> System.out.println("  " + emp.getName()));
        });
        
        // Grouping with counting
        System.out.println("\n--- Grouping with Counting ---");
        Map<String, Long> departmentCounts = employees.stream()
            .collect(Collectors.groupingBy(Employee::getDepartment, Collectors.counting()));
        System.out.println("Department counts: " + departmentCounts);
        
        // Grouping with custom collector
        System.out.println("\n--- Grouping with Average Salary ---");
        Map<String, Double> avgSalaryByDept = employees.stream()
            .collect(Collectors.groupingBy(
                Employee::getDepartment,
                Collectors.averagingDouble(Employee::getSalary)
            ));
        
        avgSalaryByDept.forEach((dept, avgSalary) ->
            System.out.println(dept + ": $" + String.format("%.2f", avgSalary)));
        
        // Multi-level grouping
        System.out.println("\n--- Multi-level Grouping ---");
        Map<String, Map<Integer, List<Employee>>> byDeptAndYear = employees.stream()
            .collect(Collectors.groupingBy(
                Employee::getDepartment,
                Collectors.groupingBy(emp -> emp.getHireDate().getYear())
            ));
        
        byDeptAndYear.forEach((dept, yearMap) -> {
            System.out.println(dept + ":");
            yearMap.forEach((year, empList) ->
                System.out.println("  " + year + ": " + empList.size() + " employees"));
        });
        
        // Partitioning
        System.out.println("\n--- Partitioning ---");
        Map<Boolean, List<Employee>> partitionedBySalary = employees.stream()
            .collect(Collectors.partitioningBy(emp -> emp.getSalary() > 75000));
        
        System.out.println("High earners (>$75k): " + partitionedBySalary.get(true).size());
        System.out.println("Lower earners (≤$75k): " + partitionedBySalary.get(false).size());
        
        // Partitioning with downstream collector
        Map<Boolean, Double> avgSalaryByEarningLevel = employees.stream()
            .collect(Collectors.partitioningBy(
                emp -> emp.getSalary() > 75000,
                Collectors.averagingDouble(Employee::getSalary)
            ));
        
        System.out.println("Average salary - High earners: $" + 
                         String.format("%.2f", avgSalaryByEarningLevel.get(true)));
        System.out.println("Average salary - Lower earners: $" + 
                         String.format("%.2f", avgSalaryByEarningLevel.get(false)));
    }
    
    public static void demonstrateComplexAggregations() {
        System.out.println("\n=== Complex Aggregations ===");
        
        List<Order> orders = Arrays.asList(
            new Order("ORD001", "CUST001", LocalDate.of(2023, 1, 15), "COMPLETED",
                new OrderItem("Laptop", 999.99, 1),
                new OrderItem("Mouse", 29.99, 2)),
            new Order("ORD002", "CUST002", LocalDate.of(2023, 1, 20), "COMPLETED",
                new OrderItem("Keyboard", 79.99, 1),
                new OrderItem("Monitor", 249.99, 1)),
            new Order("ORD003", "CUST001", LocalDate.of(2023, 2, 5), "PENDING",
                new OrderItem("Headphones", 149.99, 1)),
            new Order("ORD004", "CUST003", LocalDate.of(2023, 2, 10), "COMPLETED",
                new OrderItem("Laptop", 999.99, 2),
                new OrderItem("Keyboard", 79.99, 2)),
            new Order("ORD005", "CUST002", LocalDate.of(2023, 3, 1), "CANCELLED",
                new OrderItem("Monitor", 249.99, 1))
        );
        
        // Basic statistics
        System.out.println("--- Order Statistics ---");
        DoubleSummaryStatistics orderStats = orders.stream()
            .mapToDouble(Order::getTotalAmount)
            .summaryStatistics();
        
        System.out.println("Order value statistics:");
        System.out.println("  Count: " + orderStats.getCount());
        System.out.println("  Sum: $" + String.format("%.2f", orderStats.getSum()));
        System.out.println("  Average: $" + String.format("%.2f", orderStats.getAverage()));
        System.out.println("  Min: $" + String.format("%.2f", orderStats.getMin()));
        System.out.println("  Max: $" + String.format("%.2f", orderStats.getMax()));
        
        // Custom statistics by group
        System.out.println("\n--- Statistics by Status ---");
        Map<String, DoubleSummaryStatistics> statsByStatus = orders.stream()
            .collect(Collectors.groupingBy(
                Order::getStatus,
                Collectors.summarizingDouble(Order::getTotalAmount)
            ));
        
        statsByStatus.forEach((status, stats) -> {
            System.out.println(status + ":");
            System.out.println("  Count: " + stats.getCount());
            System.out.println("  Average: $" + String.format("%.2f", stats.getAverage()));
            System.out.println("  Total: $" + String.format("%.2f", stats.getSum()));
        });
        
        // Top customers
        System.out.println("\n--- Top Customers ---");
        Map<String, Double> customerTotals = orders.stream()
            .filter(order -> order.getStatus().equals("COMPLETED"))
            .collect(Collectors.groupingBy(
                Order::getCustomerId,
                Collectors.summingDouble(Order::getTotalAmount)
            ));
        
        List<Map.Entry<String, Double>> topCustomers = customerTotals.entrySet().stream()
            .sorted(Map.Entry.<String, Double>comparingByValue().reversed())
            .limit(3)
            .collect(Collectors.toList());
        
        System.out.println("Top customers by total order value:");
        topCustomers.forEach(entry ->
            System.out.println("  " + entry.getKey() + ": $" + String.format("%.2f", entry.getValue())));
        
        // Product popularity
        System.out.println("\n--- Product Popularity ---");
        Map<String, Integer> productQuantities = orders.stream()
            .filter(order -> order.getStatus().equals("COMPLETED"))
            .flatMap(order -> order.getItems().stream())
            .collect(Collectors.groupingBy(
                OrderItem::getProductName,
                Collectors.summingInt(OrderItem::getQuantity)
            ));
        
        System.out.println("Product quantities sold:");
        productQuantities.entrySet().stream()
            .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
            .forEach(entry ->
                System.out.println("  " + entry.getKey() + ": " + entry.getValue() + " units"));
        
        // Monthly revenue
        System.out.println("\n--- Monthly Revenue ---");
        Map<Month, Double> monthlyRevenue = orders.stream()
            .filter(order -> order.getStatus().equals("COMPLETED"))
            .collect(Collectors.groupingBy(
                order -> order.getOrderDate().getMonth(),
                Collectors.summingDouble(Order::getTotalAmount)
            ));
        
        System.out.println("Revenue by month:");
        monthlyRevenue.entrySet().stream()
            .sorted(Map.Entry.comparingByKey())
            .forEach(entry ->
                System.out.println("  " + entry.getKey() + ": $" + String.format("%.2f", entry.getValue())));
    }
    
    public static void demonstrateFlatMapAndComplexTransformations() {
        System.out.println("\n=== FlatMap and Complex Transformations ===");
        
        List<Employee> employees = Arrays.asList(
            new Employee("Alice", "Engineering", 85000, LocalDate.of(2020, 1, 15), "Java", "Python", "SQL"),
            new Employee("Bob", "Engineering", 75000, LocalDate.of(2021, 3, 10), "JavaScript", "React", "Node.js"),
            new Employee("Charlie", "Marketing", 65000, LocalDate.of(2019, 6, 20), "Analytics", "SEO"),
            new Employee("Diana", "Engineering", 90000, LocalDate.of(2018, 8, 5), "Java", "Spring", "Docker"),
            new Employee("Grace", "Engineering", 95000, LocalDate.of(2017, 4, 30), "Python", "Machine Learning", "TensorFlow")
        );
        
        // Extract all skills across all employees
        System.out.println("--- All Skills ---");
        Set<String> allSkills = employees.stream()
            .flatMap(emp -> emp.getSkills().stream())
            .collect(Collectors.toSet());
        System.out.println("All skills: " + allSkills);
        
        // Skill popularity
        System.out.println("\n--- Skill Popularity ---");
        Map<String, Long> skillCounts = employees.stream()
            .flatMap(emp -> emp.getSkills().stream())
            .collect(Collectors.groupingBy(
                skill -> skill,
                Collectors.counting()
            ));
        
        System.out.println("Skill counts:");
        skillCounts.entrySet().stream()
            .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
            .forEach(entry ->
                System.out.println("  " + entry.getKey() + ": " + entry.getValue() + " employees"));
        
        // Employees by skill
        System.out.println("\n--- Employees by Skill ---");
        Map<String, List<String>> employeesBySkill = employees.stream()
            .flatMap(emp -> emp.getSkills().stream()
                .map(skill -> new AbstractMap.SimpleEntry<>(skill, emp.getName())))
            .collect(Collectors.groupingBy(
                Map.Entry::getKey,
                Collectors.mapping(Map.Entry::getValue, Collectors.toList())
            ));
        
        employeesBySkill.entrySet().stream()
            .sorted(Map.Entry.comparingByKey())
            .forEach(entry ->
                System.out.println("  " + entry.getKey() + ": " + entry.getValue()));
        
        // Complex transformation: Create skill matrix
        System.out.println("\n--- Skill Matrix ---");
        Map<String, Map<String, Boolean>> skillMatrix = employees.stream()
            .collect(Collectors.toMap(
                Employee::getName,
                emp -> allSkills.stream()
                    .collect(Collectors.toMap(
                        skill -> skill,
                        skill -> emp.getSkills().contains(skill)
                    ))
            ));
        
        // Print skill matrix header
        System.out.print("Employee".formatted("%-15s"));
        allSkills.stream().sorted().forEach(skill -> System.out.print(skill.formatted("%-15s")));
        System.out.println();
        
        // Print skill matrix rows
        skillMatrix.forEach((empName, skills) -> {
            System.out.print(empName.formatted("%-15s"));
            allSkills.stream().sorted().forEach(skill ->
                System.out.print((skills.get(skill) ? "✓" : "-").formatted("%-15s")));
            System.out.println();
        });
    }
    
    public static void demonstrateParallelStreams() {
        System.out.println("\n=== Parallel Streams ===");
        
        // Generate large dataset
        List<Integer> largeList = IntStream.rangeClosed(1, 1_000_000)
            .boxed()
            .collect(Collectors.toList());
        
        // Sequential processing
        long startTime = System.nanoTime();
        long sequentialSum = largeList.stream()
            .filter(n -> n % 2 == 0)
            .mapToLong(n -> n * n)
            .sum();
        long sequentialTime = System.nanoTime() - startTime;
        
        // Parallel processing
        startTime = System.nanoTime();
        long parallelSum = largeList.parallelStream()
            .filter(n -> n % 2 == 0)
            .mapToLong(n -> n * n)
            .sum();
        long parallelTime = System.nanoTime() - startTime;
        
        System.out.println("Large dataset processing (1M numbers):");
        System.out.println("Sequential result: " + sequentialSum);
        System.out.println("Sequential time: " + (sequentialTime / 1_000_000) + " ms");
        System.out.println("Parallel result: " + parallelSum);
        System.out.println("Parallel time: " + (parallelTime / 1_000_000) + " ms");
        System.out.println("Speedup: " + String.format("%.2fx", (double) sequentialTime / parallelTime));
        
        // Parallel stream considerations
        System.out.println("\n--- Parallel Stream Considerations ---");
        
        // Good for parallel: CPU-intensive operations
        List<String> words = Arrays.asList("hello", "world", "java", "streams", "parallel", "processing");
        
        Map<Integer, List<String>> wordsByLength = words.parallelStream()
            .collect(Collectors.groupingBy(String::length));
        System.out.println("Words grouped by length: " + wordsByLength);
        
        // Not ideal for parallel: I/O operations or operations with side effects
        System.out.println("\nDemonstrating thread safety issues:");
        List<Integer> results = new ArrayList<>(); // Not thread-safe
        
        // This could produce inconsistent results due to race conditions
        IntStream.range(1, 1000)
            .parallel()
            .forEach(results::add); // Unsafe operation
        
        System.out.println("Unsafe parallel operation result size: " + results.size() + " (should be 999)");
        
        // Safe alternative using collect
        List<Integer> safeResults = IntStream.range(1, 1000)
            .parallel()
            .boxed()
            .collect(Collectors.toList());
        
        System.out.println("Safe parallel operation result size: " + safeResults.size());
    }
    
    public static void main(String[] args) {
        demonstrateGroupingAndPartitioning();
        demonstrateComplexAggregations();
        demonstrateFlatMapAndComplexTransformations();
        demonstrateParallelStreams();
    }
}
```

## Summary

In this fifteenth part of our Java tutorial series, you've learned:

✅ **Lambda Expressions**: Concise function syntax for functional programming  
✅ **Method References**: Simplified syntax for referring to existing methods  
✅ **Functional Interfaces**: Built-in and custom interfaces for lambda expressions  
✅ **Stream API Basics**: Creating streams and using intermediate/terminal operations  
✅ **Advanced Streams**: Complex processing, grouping, and parallel operations  
✅ **Functional Programming**: Composition, immutability, and functional patterns  

### Key Takeaways

1. **Lambda Expressions**: Make code more concise and readable
2. **Method References**: Provide even more concise syntax when referring to existing methods
3. **Stream API**: Enables functional-style operations on collections
4. **Functional Programming**: Promotes immutable data and pure functions
5. **Performance**: Parallel streams can improve performance for CPU-intensive tasks

### Best Practices

1. **Use Method References**: When lambda just calls an existing method
2. **Prefer Streams for Data Processing**: More readable than traditional loops
3. **Be Cautious with Parallel Streams**: Only use when operations are CPU-intensive and thread-safe
4. **Keep Lambdas Simple**: Complex logic should be extracted to methods
5. **Understand Lazy Evaluation**: Intermediate operations are not executed until terminal operation

### Common Functional Patterns

1. **Map-Filter-Reduce**: Transform, filter, then aggregate data
2. **Grouping and Partitioning**: Organize data into categories
3. **Function Composition**: Chain operations together
4. **Optional Usage**: Handle null values functionally
5. **Collector Patterns**: Custom ways to accumulate stream results

### What's Next?

In future parts of our Java tutorial series, we'll explore:
- Generics and type safety
- Collections framework deep dive
- Concurrency and multithreading
- Design patterns
- Testing frameworks

### Practice Exercises

Before moving on, try these exercises:

1. **Data Analysis Pipeline**: Create a complex data processing pipeline using streams
2. **Functional Calculator**: Build a calculator using function composition
3. **Text Processing**: Implement text analysis using lambda expressions and streams
4. **Performance Comparison**: Compare traditional loops vs streams for various operations
5. **Custom Collectors**: Create custom collector implementations

Ready to explore more advanced Java features? Lambda expressions and functional programming open up powerful new ways to write clean, efficient code!

---

*This tutorial is part of our comprehensive Java Tutorial Series. Functional programming concepts are essential for modern Java development, so practice these concepts thoroughly.*