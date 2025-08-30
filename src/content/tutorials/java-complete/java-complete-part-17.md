---
title: "Java Complete Part 17: Lambda Expressions, Streams, and Optional"
slug: java-complete-part-17
description: "Master Java 8+ functional programming with lambda expressions, Stream API operations, method references, and Optional for null-safe programming"
publishDate: 2025-08-29
publishedAt: 2025-01-30
tags: ["java", "tutorial", "intermediate", "lambda", "streams", "optional", "functional-programming"]
category: Tutorial
author: "codersbox"
series: "Java Complete"
part: 17
difficulty: "intermediate"
estimatedTime: "120-150 minutes"
totalParts: 17
prerequisites: ["Java Complete Parts 1-16"]
---

# Lambda Expressions, Streams, and Optional

Java 8 introduced functional programming features that revolutionized how we write Java code. Lambda expressions provide a concise way to represent anonymous functions, the Stream API enables powerful data processing operations, and Optional helps eliminate null pointer exceptions.

## Lambda Expressions

### Understanding Lambda Syntax

```java
import java.util.*;
import java.util.function.*;

public class LambdaBasics {
    
    public static void demonstrateLambdaSyntax() {
        System.out.println("=== Lambda Expression Syntax ===");
        
        // Traditional anonymous inner class
        Runnable traditionalRunnable = new Runnable() {
            @Override
            public void run() {
                System.out.println("Traditional anonymous class");
            }
        };
        
        // Lambda expression - concise syntax
        Runnable lambdaRunnable = () -> System.out.println("Lambda expression");
        
        traditionalRunnable.run();
        lambdaRunnable.run();
        
        // Comparator examples
        List<String> names = Arrays.asList("Alice", "Bob", "Charlie", "Diana");
        
        // Traditional comparator
        Collections.sort(names, new Comparator<String>() {
            @Override
            public int compare(String a, String b) {
                return a.length() - b.length();
            }
        });
        System.out.println("Sorted by length (traditional): " + names);
        
        // Lambda comparator
        names = Arrays.asList("Alice", "Bob", "Charlie", "Diana");
        Collections.sort(names, (a, b) -> a.length() - b.length());
        System.out.println("Sorted by length (lambda): " + names);
        
        // Even more concise with method reference
        names = Arrays.asList("Alice", "Bob", "Charlie", "Diana");
        Collections.sort(names, Comparator.comparing(String::length));
        System.out.println("Sorted by length (method reference): " + names);
    }
    
    public static void demonstrateLambdaVariations() {
        System.out.println("\n=== Lambda Variations ===");
        
        // No parameters
        Supplier<String> noParams = () -> "Hello World";
        System.out.println("No params: " + noParams.get());
        
        // Single parameter (parentheses optional)
        Function<String, String> singleParam = s -> s.toUpperCase();
        Function<String, String> singleParamWithParens = (s) -> s.toUpperCase();
        System.out.println("Single param: " + singleParam.apply("hello"));
        
        // Multiple parameters
        BinaryOperator<Integer> multipleParams = (a, b) -> a + b;
        System.out.println("Multiple params: " + multipleParams.apply(5, 3));
        
        // Block body
        Function<String, String> blockBody = s -> {
            String result = s.trim();
            result = result.toUpperCase();
            return "Processed: " + result;
        };
        System.out.println("Block body: " + blockBody.apply("  hello  "));
        
        // Type inference
        Predicate<String> typeInferred = s -> s.length() > 3;
        Predicate<String> explicitType = (String s) -> s.length() > 3;
        System.out.println("Type inferred: " + typeInferred.test("hello"));
        System.out.println("Explicit type: " + explicitType.test("hi"));
    }
    
    public static void main(String[] args) {
        demonstrateLambdaSyntax();
        demonstrateLambdaVariations();
    }
}
```

### Functional Interfaces

```java
import java.util.*;
import java.util.function.*;

public class FunctionalInterfacesDemo {
    
    // Custom functional interface
    @FunctionalInterface
    public interface Calculator {
        double calculate(double a, double b);
        
        // Default methods are allowed
        default void printResult(double a, double b) {
            double result = calculate(a, b);
            System.out.printf("%.2f calculated from %.2f and %.2f%n", result, a, b);
        }
        
        // Static methods are allowed
        static Calculator getAddition() {
            return (a, b) -> a + b;
        }
    }
    
    public static void demonstrateBuiltInFunctionalInterfaces() {
        System.out.println("=== Built-in Functional Interfaces ===");
        
        // Predicate<T> - takes T, returns boolean
        Predicate<String> isLongString = s -> s.length() > 5;
        Predicate<Integer> isEven = n -> n % 2 == 0;
        Predicate<String> startsWithA = s -> s.startsWith("A");
        
        System.out.println("'hello' is long: " + isLongString.test("hello"));
        System.out.println("4 is even: " + isEven.test(4));
        System.out.println("'Apple' starts with A: " + startsWithA.test("Apple"));
        
        // Combining predicates
        Predicate<String> longAndStartsWithA = isLongString.and(startsWithA);
        System.out.println("'Application' is long and starts with A: " + longAndStartsWithA.test("Application"));
        
        // Function<T, R> - takes T, returns R
        Function<String, Integer> stringLength = String::length;
        Function<String, String> toUpperCase = String::toUpperCase;
        Function<Integer, String> numberToString = Object::toString;
        
        System.out.println("Length of 'hello': " + stringLength.apply("hello"));
        System.out.println("Upper case 'hello': " + toUpperCase.apply("hello"));
        
        // Chaining functions
        Function<String, String> lengthAsString = stringLength.andThen(numberToString);
        System.out.println("Length as string: " + lengthAsString.apply("hello"));
        
        // Consumer<T> - takes T, returns void
        Consumer<String> printer = System.out::println;
        Consumer<String> upperPrinter = s -> System.out.println(s.toUpperCase());
        
        printer.accept("Hello Consumer");
        upperPrinter.accept("Hello Upper Consumer");
        
        // Chaining consumers
        Consumer<String> printBoth = printer.andThen(upperPrinter);
        printBoth.accept("Chain example");
        
        // Supplier<T> - takes nothing, returns T
        Supplier<String> randomString = () -> "Random: " + Math.random();
        Supplier<List<String>> listSupplier = ArrayList::new;
        
        System.out.println(randomString.get());
        System.out.println("New list: " + listSupplier.get());
        
        // BinaryOperator<T> - takes two T, returns T
        BinaryOperator<Integer> max = Integer::max;
        BinaryOperator<String> concat = (a, b) -> a + b;
        
        System.out.println("Max of 5 and 3: " + max.apply(5, 3));
        System.out.println("Concat 'Hello' and 'World': " + concat.apply("Hello", "World"));
        
        // UnaryOperator<T> - takes T, returns T
        UnaryOperator<String> addExclamation = s -> s + "!";
        UnaryOperator<Integer> square = n -> n * n;
        
        System.out.println("Add exclamation: " + addExclamation.apply("Hello"));
        System.out.println("Square of 5: " + square.apply(5));
    }
    
    public static void demonstrateCustomFunctionalInterface() {
        System.out.println("\n=== Custom Functional Interface ===");
        
        // Using custom functional interface with lambdas
        Calculator addition = (a, b) -> a + b;
        Calculator multiplication = (a, b) -> a * b;
        Calculator division = (a, b) -> b != 0 ? a / b : Double.NaN;
        
        addition.printResult(10, 5);
        multiplication.printResult(10, 5);
        division.printResult(10, 5);
        
        // Using static factory method
        Calculator staticAddition = Calculator.getAddition();
        staticAddition.printResult(7, 3);
        
        // Method that accepts functional interface
        performCalculation(15, 4, (a, b) -> Math.pow(a, b));
    }
    
    private static void performCalculation(double a, double b, Calculator calculator) {
        calculator.printResult(a, b);
    }
    
    public static void main(String[] args) {
        demonstrateBuiltInFunctionalInterfaces();
        demonstrateCustomFunctionalInterface();
    }
}
```

## Method References

### Types of Method References

```java
import java.util.*;
import java.util.function.*;

public class MethodReferencesDemo {
    
    // Static methods for demonstration
    public static String processString(String s) {
        return "Processed: " + s.toUpperCase();
    }
    
    public static int compareByLength(String a, String b) {
        return Integer.compare(a.length(), b.length());
    }
    
    // Instance method for demonstration
    public String instanceProcess(String s) {
        return "Instance: " + s.toLowerCase();
    }
    
    public static void demonstrateStaticMethodReferences() {
        System.out.println("=== Static Method References ===");
        
        List<String> words = Arrays.asList("hello", "world", "java", "programming");
        
        // Lambda vs Method Reference
        Function<String, String> lambdaProcessor = s -> processString(s);
        Function<String, String> methodRefProcessor = MethodReferencesDemo::processString;
        
        System.out.println("Lambda: " + lambdaProcessor.apply("test"));
        System.out.println("Method ref: " + methodRefProcessor.apply("test"));
        
        // Using with collections
        words.stream()
             .map(MethodReferencesDemo::processString)
             .forEach(System.out::println);
        
        // Comparator with method reference
        List<String> sortedWords = new ArrayList<>(words);
        sortedWords.sort(MethodReferencesDemo::compareByLength);
        System.out.println("Sorted by length: " + sortedWords);
        
        // Built-in static method references
        List<String> numbers = Arrays.asList("1", "2", "3", "4", "5");
        numbers.stream()
               .map(Integer::parseInt)  // Static method reference
               .forEach(System.out::println);
    }
    
    public static void demonstrateInstanceMethodReferences() {
        System.out.println("\n=== Instance Method References ===");
        
        List<String> words = Arrays.asList("HELLO", "WORLD", "JAVA");
        
        // Instance method reference on existing object
        MethodReferencesDemo demo = new MethodReferencesDemo();
        Function<String, String> instanceRef = demo::instanceProcess;
        System.out.println("Instance method: " + instanceRef.apply("TEST"));
        
        // Instance method reference of arbitrary object
        words.stream()
             .map(String::toLowerCase)  // s -> s.toLowerCase()
             .forEach(System.out::println);
        
        // More examples of arbitrary object method references
        List<String> names = Arrays.asList("alice", "bob", "charlie");
        names.stream()
             .map(String::toUpperCase)
             .map(String::trim)
             .forEach(System.out::println);
        
        // Using with Comparator
        List<String> sortableWords = new ArrayList<>(Arrays.asList("apple", "Banana", "cherry"));
        sortableWords.sort(String::compareToIgnoreCase);
        System.out.println("Sorted ignore case: " + sortableWords);
    }
    
    public static void demonstrateConstructorReferences() {
        System.out.println("\n=== Constructor References ===");
        
        // Constructor reference for ArrayList
        Supplier<List<String>> listSupplier = ArrayList::new;
        List<String> newList = listSupplier.get();
        newList.add("test");
        System.out.println("New list: " + newList);
        
        // Constructor reference with parameters
        Function<String, StringBuilder> sbSupplier = StringBuilder::new;
        StringBuilder sb = sbSupplier.apply("Hello");
        System.out.println("StringBuilder: " + sb);
        
        // Using constructor reference with streams
        List<String> words = Arrays.asList("one", "two", "three");
        List<StringBuilder> stringBuilders = words.stream()
                                                   .map(StringBuilder::new)
                                                   .collect(ArrayList::new, List::add, List::addAll);
        
        stringBuilders.forEach(System.out::println);
        
        // Custom class constructor reference
        List<Person> people = Arrays.asList("Alice", "Bob", "Charlie")
                                    .stream()
                                    .map(Person::new)  // Constructor reference
                                    .collect(ArrayList::new, List::add, List::addAll);
        
        people.forEach(System.out::println);
    }
    
    public static void demonstrateArrayConstructorReferences() {
        System.out.println("\n=== Array Constructor References ===");
        
        // Array constructor reference
        IntFunction<String[]> arrayGenerator = String[]::new;
        String[] stringArray = arrayGenerator.apply(5);
        System.out.println("Array length: " + stringArray.length);
        
        // Using with streams
        List<String> words = Arrays.asList("one", "two", "three", "four");
        String[] wordsArray = words.stream().toArray(String[]::new);
        System.out.println("Array from stream: " + Arrays.toString(wordsArray));
        
        // Different array types
        IntFunction<Integer[]> intArrayGen = Integer[]::new;
        Integer[] intArray = intArrayGen.apply(3);
        Arrays.fill(intArray, 42);
        System.out.println("Integer array: " + Arrays.toString(intArray));
    }
    
    // Helper class for constructor reference demo
    static class Person {
        private String name;
        
        public Person(String name) {
            this.name = name;
        }
        
        @Override
        public String toString() {
            return "Person{name='" + name + "'}";
        }
    }
    
    public static void main(String[] args) {
        demonstrateStaticMethodReferences();
        demonstrateInstanceMethodReferences();
        demonstrateConstructorReferences();
        demonstrateArrayConstructorReferences();
    }
}
```

## Stream API Fundamentals

### Creating and Basic Operations

```java
import java.util.*;
import java.util.stream.*;

public class StreamBasics {
    
    public static void demonstrateStreamCreation() {
        System.out.println("=== Stream Creation ===");
        
        // From collections
        List<String> list = Arrays.asList("a", "b", "c");
        Stream<String> streamFromList = list.stream();
        System.out.println("From list: " + streamFromList.collect(Collectors.toList()));
        
        // From arrays
        String[] array = {"x", "y", "z"};
        Stream<String> streamFromArray = Arrays.stream(array);
        System.out.println("From array: " + streamFromArray.collect(Collectors.toList()));
        
        // Using Stream.of()
        Stream<Integer> streamOf = Stream.of(1, 2, 3, 4, 5);
        System.out.println("Stream.of(): " + streamOf.collect(Collectors.toList()));
        
        // Empty stream
        Stream<String> emptyStream = Stream.empty();
        System.out.println("Empty stream count: " + emptyStream.count());
        
        // Infinite streams
        Stream<Integer> infiniteStream = Stream.iterate(0, n -> n + 2).limit(5);
        System.out.println("Infinite stream (even numbers): " + infiniteStream.collect(Collectors.toList()));
        
        Stream<Double> randomStream = Stream.generate(Math::random).limit(3);
        System.out.println("Random stream: " + randomStream.collect(Collectors.toList()));
        
        // Range streams
        IntStream intRange = IntStream.range(1, 6);  // 1 to 5
        System.out.println("Int range: " + intRange.boxed().collect(Collectors.toList()));
        
        IntStream intRangeClosed = IntStream.rangeClosed(1, 5);  // 1 to 5 inclusive
        System.out.println("Int range closed: " + intRangeClosed.boxed().collect(Collectors.toList()));
        
        // From strings
        IntStream charStream = "hello".chars();
        System.out.println("Char stream: " + charStream.mapToObj(c -> (char) c).collect(Collectors.toList()));
    }
    
    public static void demonstrateIntermediateOperations() {
        System.out.println("\n=== Intermediate Operations ===");
        
        List<String> words = Arrays.asList("apple", "banana", "cherry", "date", "elderberry", "fig");
        
        // Filter - select elements matching a condition
        List<String> longWords = words.stream()
                                      .filter(word -> word.length() > 5)
                                      .collect(Collectors.toList());
        System.out.println("Words longer than 5 chars: " + longWords);
        
        // Map - transform elements
        List<Integer> wordLengths = words.stream()
                                         .map(String::length)
                                         .collect(Collectors.toList());
        System.out.println("Word lengths: " + wordLengths);
        
        List<String> upperWords = words.stream()
                                       .map(String::toUpperCase)
                                       .collect(Collectors.toList());
        System.out.println("Upper case words: " + upperWords);
        
        // FlatMap - flatten nested structures
        List<List<String>> nestedLists = Arrays.asList(
            Arrays.asList("a", "b"),
            Arrays.asList("c", "d", "e"),
            Arrays.asList("f")
        );
        
        List<String> flattened = nestedLists.stream()
                                           .flatMap(List::stream)
                                           .collect(Collectors.toList());
        System.out.println("Flattened: " + flattened);
        
        // Distinct - remove duplicates
        List<Integer> numbers = Arrays.asList(1, 2, 2, 3, 3, 3, 4, 5, 5);
        List<Integer> distinct = numbers.stream()
                                       .distinct()
                                       .collect(Collectors.toList());
        System.out.println("Distinct numbers: " + distinct);
        
        // Sorted - sort elements
        List<String> sortedWords = words.stream()
                                       .sorted()
                                       .collect(Collectors.toList());
        System.out.println("Sorted words: " + sortedWords);
        
        List<String> sortedByLength = words.stream()
                                          .sorted(Comparator.comparing(String::length))
                                          .collect(Collectors.toList());
        System.out.println("Sorted by length: " + sortedByLength);
        
        // Peek - side effect without modifying stream
        List<String> peekedWords = words.stream()
                                       .peek(word -> System.out.println("Processing: " + word))
                                       .filter(word -> word.startsWith("a"))
                                       .collect(Collectors.toList());
        System.out.println("Words starting with 'a': " + peekedWords);
        
        // Limit - take first n elements
        List<String> limitedWords = words.stream()
                                        .limit(3)
                                        .collect(Collectors.toList());
        System.out.println("First 3 words: " + limitedWords);
        
        // Skip - skip first n elements
        List<String> skippedWords = words.stream()
                                        .skip(2)
                                        .collect(Collectors.toList());
        System.out.println("Skip first 2 words: " + skippedWords);
    }
    
    public static void demonstrateTerminalOperations() {
        System.out.println("\n=== Terminal Operations ===");
        
        List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);
        
        // forEach - perform action on each element
        System.out.print("Numbers: ");
        numbers.stream().forEach(n -> System.out.print(n + " "));
        System.out.println();
        
        // collect - gather elements into collection
        List<Integer> evenNumbers = numbers.stream()
                                          .filter(n -> n % 2 == 0)
                                          .collect(Collectors.toList());
        System.out.println("Even numbers: " + evenNumbers);
        
        // reduce - combine elements into single result
        Optional<Integer> sum = numbers.stream().reduce((a, b) -> a + b);
        System.out.println("Sum: " + sum.orElse(0));
        
        Integer sumWithIdentity = numbers.stream().reduce(0, Integer::sum);
        System.out.println("Sum with identity: " + sumWithIdentity);
        
        // count - count elements
        long count = numbers.stream().filter(n -> n > 5).count();
        System.out.println("Count of numbers > 5: " + count);
        
        // anyMatch, allMatch, noneMatch
        boolean anyEven = numbers.stream().anyMatch(n -> n % 2 == 0);
        boolean allPositive = numbers.stream().allMatch(n -> n > 0);
        boolean noneNegative = numbers.stream().noneMatch(n -> n < 0);
        
        System.out.println("Any even: " + anyEven);
        System.out.println("All positive: " + allPositive);
        System.out.println("None negative: " + noneNegative);
        
        // findFirst, findAny
        Optional<Integer> firstEven = numbers.stream()
                                            .filter(n -> n % 2 == 0)
                                            .findFirst();
        System.out.println("First even number: " + firstEven.orElse(-1));
        
        Optional<Integer> anyOdd = numbers.stream()
                                         .filter(n -> n % 2 == 1)
                                         .findAny();
        System.out.println("Any odd number: " + anyOdd.orElse(-1));
        
        // min, max
        Optional<Integer> min = numbers.stream().min(Integer::compareTo);
        Optional<Integer> max = numbers.stream().max(Integer::compareTo);
        
        System.out.println("Min: " + min.orElse(-1));
        System.out.println("Max: " + max.orElse(-1));
        
        // toArray
        Integer[] numbersArray = numbers.stream()
                                       .filter(n -> n <= 5)
                                       .toArray(Integer[]::new);
        System.out.println("Numbers <= 5 as array: " + Arrays.toString(numbersArray));
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
import java.util.function.*;

public class AdvancedStreams {
    
    // Sample data classes
    static class Employee {
        private String name;
        private String department;
        private double salary;
        private int age;
        
        public Employee(String name, String department, double salary, int age) {
            this.name = name;
            this.department = department;
            this.salary = salary;
            this.age = age;
        }
        
        // Getters
        public String getName() { return name; }
        public String getDepartment() { return department; }
        public double getSalary() { return salary; }
        public int getAge() { return age; }
        
        @Override
        public String toString() {
            return String.format("%s (%s, $%.0f, %d years)", name, department, salary, age);
        }
    }
    
    static class Order {
        private String id;
        private String customer;
        private List<OrderItem> items;
        private double total;
        
        public Order(String id, String customer, List<OrderItem> items) {
            this.id = id;
            this.customer = customer;
            this.items = items;
            this.total = items.stream().mapToDouble(OrderItem::getTotal).sum();
        }
        
        public String getId() { return id; }
        public String getCustomer() { return customer; }
        public List<OrderItem> getItems() { return items; }
        public double getTotal() { return total; }
        
        @Override
        public String toString() {
            return String.format("Order[%s, %s, $%.2f]", id, customer, total);
        }
    }
    
    static class OrderItem {
        private String product;
        private int quantity;
        private double price;
        
        public OrderItem(String product, int quantity, double price) {
            this.product = product;
            this.quantity = quantity;
            this.price = price;
        }
        
        public String getProduct() { return product; }
        public int getQuantity() { return quantity; }
        public double getPrice() { return price; }
        public double getTotal() { return quantity * price; }
        
        @Override
        public String toString() {
            return String.format("%s x%d @$%.2f", product, quantity, price);
        }
    }
    
    public static void demonstrateGroupingAndPartitioning() {
        System.out.println("=== Grouping and Partitioning ===");
        
        List<Employee> employees = Arrays.asList(
            new Employee("Alice", "IT", 75000, 28),
            new Employee("Bob", "IT", 82000, 32),
            new Employee("Charlie", "HR", 65000, 29),
            new Employee("Diana", "Finance", 78000, 35),
            new Employee("Eve", "IT", 88000, 27),
            new Employee("Frank", "HR", 72000, 31),
            new Employee("Grace", "Finance", 85000, 33)
        );
        
        // Group by department
        Map<String, List<Employee>> byDepartment = employees.stream()
            .collect(Collectors.groupingBy(Employee::getDepartment));
        
        System.out.println("Employees by department:");
        byDepartment.forEach((dept, empList) -> {
            System.out.println("  " + dept + ": " + empList.size() + " employees");
            empList.forEach(emp -> System.out.println("    " + emp));
        });
        
        // Group by salary range
        Map<String, List<Employee>> bySalaryRange = employees.stream()
            .collect(Collectors.groupingBy(emp -> {
                if (emp.getSalary() < 70000) return "Low";
                else if (emp.getSalary() < 80000) return "Medium";
                else return "High";
            }));
        
        System.out.println("\nEmployees by salary range:");
        bySalaryRange.forEach((range, empList) -> 
            System.out.println("  " + range + ": " + empList.size() + " employees"));
        
        // Partition by condition (high/low salary)
        Map<Boolean, List<Employee>> partitionedBySalary = employees.stream()
            .collect(Collectors.partitioningBy(emp -> emp.getSalary() > 80000));
        
        System.out.println("\nHigh salary employees (>$80,000): " + 
                          partitionedBySalary.get(true).size());
        System.out.println("Lower salary employees (≤$80,000): " + 
                          partitionedBySalary.get(false).size());
        
        // Advanced grouping with downstream collectors
        Map<String, Double> avgSalaryByDept = employees.stream()
            .collect(Collectors.groupingBy(
                Employee::getDepartment,
                Collectors.averagingDouble(Employee::getSalary)
            ));
        
        System.out.println("\nAverage salary by department:");
        avgSalaryByDept.forEach((dept, avgSalary) -> 
            System.out.printf("  %s: $%.2f%n", dept, avgSalary));
        
        // Count by department
        Map<String, Long> countByDept = employees.stream()
            .collect(Collectors.groupingBy(
                Employee::getDepartment,
                Collectors.counting()
            ));
        
        System.out.println("\nEmployee count by department:");
        countByDept.forEach((dept, count) -> 
            System.out.println("  " + dept + ": " + count));
    }
    
    public static void demonstrateFlatMapAndComplexProcessing() {
        System.out.println("\n=== FlatMap and Complex Processing ===");
        
        List<Order> orders = Arrays.asList(
            new Order("O001", "Alice", Arrays.asList(
                new OrderItem("Laptop", 1, 1200.00),
                new OrderItem("Mouse", 2, 25.00)
            )),
            new Order("O002", "Bob", Arrays.asList(
                new OrderItem("Keyboard", 1, 80.00),
                new OrderItem("Monitor", 1, 300.00),
                new OrderItem("Mouse", 1, 25.00)
            )),
            new Order("O003", "Alice", Arrays.asList(
                new OrderItem("Laptop", 1, 1200.00),
                new OrderItem("Keyboard", 1, 80.00)
            ))
        );
        
        // Flatten all order items
        List<OrderItem> allItems = orders.stream()
            .flatMap(order -> order.getItems().stream())
            .collect(Collectors.toList());
        
        System.out.println("All order items:");
        allItems.forEach(item -> System.out.println("  " + item));
        
        // Count products across all orders
        Map<String, Long> productCounts = orders.stream()
            .flatMap(order -> order.getItems().stream())
            .collect(Collectors.groupingBy(
                OrderItem::getProduct,
                Collectors.counting()
            ));
        
        System.out.println("\nProduct counts across all orders:");
        productCounts.forEach((product, count) -> 
            System.out.println("  " + product + ": " + count));
        
        // Total revenue by product
        Map<String, Double> revenueByProduct = orders.stream()
            .flatMap(order -> order.getItems().stream())
            .collect(Collectors.groupingBy(
                OrderItem::getProduct,
                Collectors.summingDouble(OrderItem::getTotal)
            ));
        
        System.out.println("\nTotal revenue by product:");
        revenueByProduct.forEach((product, revenue) -> 
            System.out.printf("  %s: $%.2f%n", product, revenue));
        
        // Customer order totals
        Map<String, Double> customerTotals = orders.stream()
            .collect(Collectors.groupingBy(
                Order::getCustomer,
                Collectors.summingDouble(Order::getTotal)
            ));
        
        System.out.println("\nTotal spent by customer:");
        customerTotals.forEach((customer, total) -> 
            System.out.printf("  %s: $%.2f%n", customer, total));
        
        // Most expensive single item across all orders
        Optional<OrderItem> mostExpensive = orders.stream()
            .flatMap(order -> order.getItems().stream())
            .max(Comparator.comparing(OrderItem::getTotal));
        
        System.out.println("\nMost expensive item: " + 
                          mostExpensive.map(OrderItem::toString).orElse("None"));
        
        // Orders containing laptops
        List<Order> ordersWithLaptops = orders.stream()
            .filter(order -> order.getItems().stream()
                                  .anyMatch(item -> item.getProduct().equals("Laptop")))
            .collect(Collectors.toList());
        
        System.out.println("\nOrders containing laptops:");
        ordersWithLaptops.forEach(order -> System.out.println("  " + order));
    }
    
    public static void demonstrateCustomCollectors() {
        System.out.println("\n=== Custom Collectors ===");
        
        List<String> words = Arrays.asList("apple", "banana", "cherry", "date", "elderberry");
        
        // Using built-in collectors
        String joined = words.stream()
            .collect(Collectors.joining(", "));
        System.out.println("Joined: " + joined);
        
        String joinedWithPrefix = words.stream()
            .collect(Collectors.joining(", ", "[", "]"));
        System.out.println("Joined with brackets: " + joinedWithPrefix);
        
        // Statistics collectors
        List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);
        
        IntSummaryStatistics stats = numbers.stream()
            .collect(Collectors.summarizingInt(Integer::intValue));
        
        System.out.println("\nNumber statistics:");
        System.out.println("  Count: " + stats.getCount());
        System.out.println("  Sum: " + stats.getSum());
        System.out.println("  Average: " + stats.getAverage());
        System.out.println("  Min: " + stats.getMin());
        System.out.println("  Max: " + stats.getMax());
        
        // Custom collector - collect to immutable list
        List<String> immutableWords = words.stream()
            .filter(word -> word.length() > 4)
            .collect(Collectors.collectingAndThen(
                Collectors.toList(),
                Collections::unmodifiableList
            ));
        
        System.out.println("Immutable long words: " + immutableWords);
        
        // Mapping collector
        List<Integer> wordLengths = words.stream()
            .collect(Collectors.mapping(String::length, Collectors.toList()));
        System.out.println("Word lengths: " + wordLengths);
        
        // Filtering collector
        List<String> longWords = words.stream()
            .collect(Collectors.filtering(
                word -> word.length() > 5,
                Collectors.toList()
            ));
        System.out.println("Long words (>5 chars): " + longWords);
    }
    
    public static void demonstrateParallelStreams() {
        System.out.println("\n=== Parallel Streams ===");
        
        List<Integer> largeList = IntStream.range(1, 1000000)
                                          .boxed()
                                          .collect(Collectors.toList());
        
        // Sequential processing
        long startTime = System.currentTimeMillis();
        long sequentialSum = largeList.stream()
            .filter(n -> n % 2 == 0)
            .mapToLong(Integer::longValue)
            .sum();
        long sequentialTime = System.currentTimeMillis() - startTime;
        
        // Parallel processing
        startTime = System.currentTimeMillis();
        long parallelSum = largeList.parallelStream()
            .filter(n -> n % 2 == 0)
            .mapToLong(Integer::longValue)
            .sum();
        long parallelTime = System.currentTimeMillis() - startTime;
        
        System.out.println("Sequential sum: " + sequentialSum + " (Time: " + sequentialTime + "ms)");
        System.out.println("Parallel sum: " + parallelSum + " (Time: " + parallelTime + "ms)");
        System.out.println("Speedup: " + (double) sequentialTime / parallelTime + "x");
        
        // Demonstrating thread usage in parallel streams
        System.out.println("\nThreads used in parallel stream:");
        Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8).parallelStream()
            .map(n -> {
                String threadName = Thread.currentThread().getName();
                System.out.println("Processing " + n + " on " + threadName);
                return n * n;
            })
            .collect(Collectors.toList());
    }
    
    public static void main(String[] args) {
        demonstrateGroupingAndPartitioning();
        demonstrateFlatMapAndComplexProcessing();
        demonstrateCustomCollectors();
        demonstrateParallelStreams();
    }
}
```

## Optional Class

### Null-Safe Programming with Optional

```java
import java.util.*;
import java.util.function.*;
import java.util.stream.Collectors;

public class OptionalDemo {
    
    // Sample classes
    static class Person {
        private String name;
        private Optional<String> email;
        private Optional<Address> address;
        private List<String> hobbies;
        
        public Person(String name, String email, Address address, List<String> hobbies) {
            this.name = name;
            this.email = Optional.ofNullable(email);
            this.address = Optional.ofNullable(address);
            this.hobbies = hobbies != null ? hobbies : new ArrayList<>();
        }
        
        public String getName() { return name; }
        public Optional<String> getEmail() { return email; }
        public Optional<Address> getAddress() { return address; }
        public List<String> getHobbies() { return hobbies; }
        
        @Override
        public String toString() {
            return String.format("Person{name='%s', email=%s, address=%s}", 
                               name, email.orElse("none"), address.map(Address::toString).orElse("none"));
        }
    }
    
    static class Address {
        private String street;
        private String city;
        private Optional<String> zipCode;
        
        public Address(String street, String city, String zipCode) {
            this.street = street;
            this.city = city;
            this.zipCode = Optional.ofNullable(zipCode);
        }
        
        public String getStreet() { return street; }
        public String getCity() { return city; }
        public Optional<String> getZipCode() { return zipCode; }
        
        @Override
        public String toString() {
            return String.format("%s, %s %s", street, city, zipCode.orElse(""));
        }
    }
    
    public static void demonstrateOptionalCreation() {
        System.out.println("=== Optional Creation ===");
        
        // Creating Optional instances
        Optional<String> empty = Optional.empty();
        Optional<String> nonEmpty = Optional.of("Hello");
        Optional<String> nullable = Optional.ofNullable(null);
        Optional<String> nullable2 = Optional.ofNullable("World");
        
        System.out.println("Empty: " + empty);
        System.out.println("Non-empty: " + nonEmpty);
        System.out.println("Nullable (null): " + nullable);
        System.out.println("Nullable (non-null): " + nullable2);
        
        // Optional.of() with null throws exception
        try {
            Optional<String> nullOptional = Optional.of(null);
        } catch (NullPointerException e) {
            System.out.println("Optional.of(null) throws NullPointerException");
        }
    }
    
    public static void demonstrateOptionalBasicOperations() {
        System.out.println("\n=== Optional Basic Operations ===");
        
        Optional<String> present = Optional.of("Hello World");
        Optional<String> absent = Optional.empty();
        
        // Check if value is present
        System.out.println("Present isPresent(): " + present.isPresent());
        System.out.println("Absent isPresent(): " + absent.isPresent());
        System.out.println("Present isEmpty(): " + present.isEmpty());
        System.out.println("Absent isEmpty(): " + absent.isEmpty());
        
        // Get value (unsafe - can throw exception)
        try {
            System.out.println("Present get(): " + present.get());
            System.out.println("Absent get(): " + absent.get()); // NoSuchElementException
        } catch (NoSuchElementException e) {
            System.out.println("absent.get() throws NoSuchElementException");
        }
        
        // Safe value retrieval
        System.out.println("Present orElse(): " + present.orElse("default"));
        System.out.println("Absent orElse(): " + absent.orElse("default"));
        
        // orElseGet - lazy evaluation
        System.out.println("Absent orElseGet(): " + absent.orElseGet(() -> "computed default"));
        
        // orElseThrow
        try {
            String value = absent.orElseThrow(() -> new IllegalStateException("Value not present"));
        } catch (IllegalStateException e) {
            System.out.println("orElseThrow: " + e.getMessage());
        }
    }
    
    public static void demonstrateOptionalTransformations() {
        System.out.println("\n=== Optional Transformations ===");
        
        Optional<String> text = Optional.of("hello world");
        Optional<String> emptyText = Optional.empty();
        
        // map - transform the value if present
        Optional<String> upperCase = text.map(String::toUpperCase);
        Optional<Integer> length = text.map(String::length);
        Optional<String> emptyMapped = emptyText.map(String::toUpperCase);
        
        System.out.println("Original: " + text.orElse("none"));
        System.out.println("Upper case: " + upperCase.orElse("none"));
        System.out.println("Length: " + length.orElse(-1));
        System.out.println("Empty mapped: " + emptyMapped.orElse("none"));
        
        // flatMap - avoid nested Optionals
        Optional<Person> person = Optional.of(new Person("Alice", "alice@example.com", 
                                              new Address("123 Main St", "City", "12345"), 
                                              Arrays.asList("reading", "coding")));
        
        // Without flatMap - would result in Optional<Optional<String>>
        Optional<String> email = person.flatMap(Person::getEmail);
        Optional<String> zipCode = person.flatMap(Person::getAddress)
                                        .flatMap(Address::getZipCode);
        
        System.out.println("Person email: " + email.orElse("no email"));
        System.out.println("Person zip code: " + zipCode.orElse("no zip"));
        
        // Chain multiple transformations
        Optional<String> processedEmail = person
            .flatMap(Person::getEmail)
            .map(String::toLowerCase)
            .map(e -> e.replace("@", " [at] "))
            .filter(e -> e.contains("alice"));
        
        System.out.println("Processed email: " + processedEmail.orElse("not found"));
    }
    
    public static void demonstrateOptionalFiltering() {
        System.out.println("\n=== Optional Filtering ===");
        
        List<Optional<String>> optionals = Arrays.asList(
            Optional.of("apple"),
            Optional.of("banana"),
            Optional.empty(),
            Optional.of("cherry"),
            Optional.of("date")
        );
        
        // Filter present values
        List<String> presentValues = optionals.stream()
            .filter(Optional::isPresent)
            .map(Optional::get)
            .collect(Collectors.toList());
        
        System.out.println("Present values: " + presentValues);
        
        // Better approach using flatMap
        List<String> presentValues2 = optionals.stream()
            .flatMap(Optional::stream)  // Java 9+
            .collect(Collectors.toList());
        
        System.out.println("Present values (flatMap): " + presentValues2);
        
        // Filter with condition
        List<String> longWords = optionals.stream()
            .flatMap(Optional::stream)
            .filter(word -> word.length() > 5)
            .collect(Collectors.toList());
        
        System.out.println("Long words: " + longWords);
        
        // Using filter on Optional
        Optional<String> fruit = Optional.of("apple");
        Optional<String> longFruit = fruit.filter(f -> f.length() > 5);
        Optional<String> shortFruit = fruit.filter(f -> f.length() <= 5);
        
        System.out.println("Apple is long fruit: " + longFruit.isPresent());
        System.out.println("Apple is short fruit: " + shortFruit.isPresent());
    }
    
    public static void demonstrateOptionalConditionalActions() {
        System.out.println("\n=== Optional Conditional Actions ===");
        
        Optional<String> present = Optional.of("Hello");
        Optional<String> absent = Optional.empty();
        
        // ifPresent - perform action if value is present
        System.out.print("Present value: ");
        present.ifPresent(System.out::println);
        
        System.out.print("Absent value: ");
        absent.ifPresent(System.out::println);
        System.out.println("(nothing printed for absent)");
        
        // ifPresentOrElse (Java 9+)
        present.ifPresentOrElse(
            value -> System.out.println("Found: " + value),
            () -> System.out.println("No value found")
        );
        
        absent.ifPresentOrElse(
            value -> System.out.println("Found: " + value),
            () -> System.out.println("No value found")
        );
        
        // or - provide alternative Optional (Java 9+)
        Optional<String> alternative = absent.or(() -> Optional.of("alternative"));
        System.out.println("With alternative: " + alternative.orElse("none"));
        
        Optional<String> noAlternative = present.or(() -> Optional.of("alternative"));
        System.out.println("Present with alternative: " + noAlternative.orElse("none"));
    }
    
    public static void demonstrateOptionalBestPractices() {
        System.out.println("\n=== Optional Best Practices ===");
        
        // DON'T: Use Optional as method parameter
        // public void badMethod(Optional<String> param) { ... }
        
        // DO: Use Optional as return type
        Optional<String> findUserById(String id) {
            // Simulate database lookup
            if ("123".equals(id)) {
                return Optional.of("John Doe");
            }
            return Optional.empty();
        }
        
        // DON'T: Use Optional for collections
        // Optional<List<String>> badCollection = Optional.of(Arrays.asList("a", "b"));
        
        // DO: Return empty collection instead
        List<String> getItems() {
            return Collections.emptyList(); // Never return null for collections
        }
        
        // DON'T: Chain orElse with expensive operations
        String expensive = absent.orElse(expensiveOperation());
        
        // DO: Use orElseGet for lazy evaluation
        String efficient = absent.orElseGet(this::expensiveOperation);
        
        // DON'T: Use get() without checking
        // String unsafe = optional.get(); // Can throw exception
        
        // DO: Use safe extraction methods
        String safe = findUserById("123").orElse("Unknown");
        
        // Example of good Optional usage
        Optional<Person> personOpt = findPerson("Alice");
        String result = personOpt
            .filter(p -> !p.getHobbies().isEmpty())
            .flatMap(Person::getEmail)
            .map(String::toLowerCase)
            .orElse("No email found for person with hobbies");
        
        System.out.println("Complex Optional chain result: " + result);
        
        // Working with Optional in streams
        List<Person> people = Arrays.asList(
            new Person("Alice", "alice@example.com", null, Arrays.asList("reading")),
            new Person("Bob", null, new Address("456 Oak St", "Town", null), Arrays.asList()),
            new Person("Charlie", "charlie@example.com", 
                      new Address("789 Pine St", "Village", "54321"), Arrays.asList("gaming"))
        );
        
        // Extract all emails that are present
        List<String> emails = people.stream()
            .map(Person::getEmail)
            .filter(Optional::isPresent)
            .map(Optional::get)
            .collect(Collectors.toList());
        
        System.out.println("All emails: " + emails);
        
        // Extract all cities from addresses
        List<String> cities = people.stream()
            .map(Person::getAddress)
            .filter(Optional::isPresent)
            .map(Optional::get)
            .map(Address::getCity)
            .collect(Collectors.toList());
        
        System.out.println("All cities: " + cities);
    }
    
    private String expensiveOperation() {
        // Simulate expensive operation
        try {
            Thread.sleep(100);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        return "Expensive result";
    }
    
    private Optional<Person> findPerson(String name) {
        if ("Alice".equals(name)) {
            return Optional.of(new Person("Alice", "alice@example.com", null, Arrays.asList("reading")));
        }
        return Optional.empty();
    }
    
    public static void main(String[] args) {
        demonstrateOptionalCreation();
        demonstrateOptionalBasicOperations();
        demonstrateOptionalTransformations();
        demonstrateOptionalFiltering();
        demonstrateOptionalConditionalActions();
        new OptionalDemo().demonstrateOptionalBestPractices();
    }
}
```

## Practical Applications

### Real-World Example: Data Analysis System

```java
import java.time.*;
import java.util.*;
import java.util.function.*;
import java.util.stream.*;

public class DataAnalysisSystem {
    
    // Domain classes
    static class SalesRecord {
        private String id;
        private String product;
        private String category;
        private String salesperson;
        private LocalDate date;
        private double amount;
        private int quantity;
        private String region;
        
        public SalesRecord(String id, String product, String category, String salesperson,
                          LocalDate date, double amount, int quantity, String region) {
            this.id = id;
            this.product = product;
            this.category = category;
            this.salesperson = salesperson;
            this.date = date;
            this.amount = amount;
            this.quantity = quantity;
            this.region = region;
        }
        
        // Getters
        public String getId() { return id; }
        public String getProduct() { return product; }
        public String getCategory() { return category; }
        public String getSalesperson() { return salesperson; }
        public LocalDate getDate() { return date; }
        public double getAmount() { return amount; }
        public int getQuantity() { return quantity; }
        public String getRegion() { return region; }
        
        @Override
        public String toString() {
            return String.format("Sale[%s, %s, $%.2f, %s]", id, product, amount, date);
        }
    }
    
    static class AnalysisResult {
        private String category;
        private double totalSales;
        private double averageSale;
        private int transactionCount;
        private Optional<SalesRecord> highestSale;
        
        public AnalysisResult(String category, double totalSales, double averageSale, 
                            int transactionCount, Optional<SalesRecord> highestSale) {
            this.category = category;
            this.totalSales = totalSales;
            this.averageSale = averageSale;
            this.transactionCount = transactionCount;
            this.highestSale = highestSale;
        }
        
        // Getters
        public String getCategory() { return category; }
        public double getTotalSales() { return totalSales; }
        public double getAverageSale() { return averageSale; }
        public int getTransactionCount() { return transactionCount; }
        public Optional<SalesRecord> getHighestSale() { return highestSale; }
        
        @Override
        public String toString() {
            return String.format("Analysis[%s: $%.2f total, $%.2f avg, %d transactions]", 
                               category, totalSales, averageSale, transactionCount);
        }
    }
    
    private List<SalesRecord> salesData;
    
    public DataAnalysisSystem() {
        this.salesData = generateSampleData();
    }
    
    private List<SalesRecord> generateSampleData() {
        return Arrays.asList(
            new SalesRecord("S001", "Laptop Pro", "Electronics", "Alice", LocalDate.of(2024, 1, 15), 1200.00, 1, "North"),
            new SalesRecord("S002", "Office Chair", "Furniture", "Bob", LocalDate.of(2024, 1, 16), 350.00, 2, "South"),
            new SalesRecord("S003", "Smartphone", "Electronics", "Charlie", LocalDate.of(2024, 1, 17), 800.00, 1, "East"),
            new SalesRecord("S004", "Desk Lamp", "Furniture", "Alice", LocalDate.of(2024, 1, 18), 85.00, 3, "North"),
            new SalesRecord("S005", "Tablet", "Electronics", "Diana", LocalDate.of(2024, 1, 19), 450.00, 2, "West"),
            new SalesRecord("S006", "Ergonomic Keyboard", "Electronics", "Bob", LocalDate.of(2024, 1, 20), 120.00, 5, "South"),
            new SalesRecord("S007", "Standing Desk", "Furniture", "Charlie", LocalDate.of(2024, 1, 21), 650.00, 1, "East"),
            new SalesRecord("S008", "Monitor", "Electronics", "Alice", LocalDate.of(2024, 1, 22), 300.00, 2, "North"),
            new SalesRecord("S009", "Bookshelf", "Furniture", "Diana", LocalDate.of(2024, 1, 23), 180.00, 1, "West"),
            new SalesRecord("S010", "Gaming Mouse", "Electronics", "Bob", LocalDate.of(2024, 1, 24), 75.00, 4, "South"),
            new SalesRecord("S011", "Conference Table", "Furniture", "Charlie", LocalDate.of(2024, 2, 1), 1200.00, 1, "East"),
            new SalesRecord("S012", "Wireless Headphones", "Electronics", "Alice", LocalDate.of(2024, 2, 2), 200.00, 3, "North"),
            new SalesRecord("S013", "Filing Cabinet", "Furniture", "Diana", LocalDate.of(2024, 2, 3), 280.00, 2, "West"),
            new SalesRecord("S014", "Smart Watch", "Electronics", "Bob", LocalDate.of(2024, 2, 4), 350.00, 1, "South"),
            new SalesRecord("S015", "Lounge Chair", "Furniture", "Charlie", LocalDate.of(2024, 2, 5), 890.00, 1, "East")
        );
    }
    
    public void performBasicAnalysis() {
        System.out.println("=== Basic Sales Analysis ===");
        
        // Total sales amount
        double totalSales = salesData.stream()
            .mapToDouble(SalesRecord::getAmount)
            .sum();
        
        // Average sale amount
        OptionalDouble averageSale = salesData.stream()
            .mapToDouble(SalesRecord::getAmount)
            .average();
        
        // Total transactions
        long transactionCount = salesData.stream().count();
        
        // Highest single sale
        Optional<SalesRecord> highestSale = salesData.stream()
            .max(Comparator.comparing(SalesRecord::getAmount));
        
        // Lowest single sale
        Optional<SalesRecord> lowestSale = salesData.stream()
            .min(Comparator.comparing(SalesRecord::getAmount));
        
        System.out.printf("Total Sales: $%.2f%n", totalSales);
        System.out.printf("Average Sale: $%.2f%n", averageSale.orElse(0.0));
        System.out.printf("Total Transactions: %d%n", transactionCount);
        System.out.println("Highest Sale: " + highestSale.map(SalesRecord::toString).orElse("None"));
        System.out.println("Lowest Sale: " + lowestSale.map(SalesRecord::toString).orElse("None"));
    }
    
    public void analyzeByCategory() {
        System.out.println("\n=== Analysis by Category ===");
        
        Map<String, AnalysisResult> categoryAnalysis = salesData.stream()
            .collect(Collectors.groupingBy(
                SalesRecord::getCategory,
                Collectors.collectingAndThen(
                    Collectors.toList(),
                    records -> {
                        double total = records.stream().mapToDouble(SalesRecord::getAmount).sum();
                        double average = records.stream().mapToDouble(SalesRecord::getAmount).average().orElse(0.0);
                        int count = records.size();
                        Optional<SalesRecord> highest = records.stream().max(Comparator.comparing(SalesRecord::getAmount));
                        
                        return new AnalysisResult(records.get(0).getCategory(), total, average, count, highest);
                    }
                )
            ));
        
        categoryAnalysis.values()
            .stream()
            .sorted(Comparator.comparing(AnalysisResult::getTotalSales).reversed())
            .forEach(result -> {
                System.out.println(result);
                result.getHighestSale().ifPresent(sale -> 
                    System.out.println("  Highest: " + sale));
            });
    }
    
    public void analyzeBySalesperson() {
        System.out.println("\n=== Analysis by Salesperson ===");
        
        Map<String, DoubleSummaryStatistics> salespersonStats = salesData.stream()
            .collect(Collectors.groupingBy(
                SalesRecord::getSalesperson,
                Collectors.summarizingDouble(SalesRecord::getAmount)
            ));
        
        // Top performer by total sales
        Optional<Map.Entry<String, DoubleSummaryStatistics>> topPerformer = salespersonStats.entrySet()
            .stream()
            .max(Map.Entry.comparingByValue(Comparator.comparing(DoubleSummaryStatistics::getSum)));
        
        topPerformer.ifPresent(entry -> 
            System.out.printf("Top Performer: %s with $%.2f in total sales%n", 
                            entry.getKey(), entry.getValue().getSum()));
        
        // Detailed breakdown
        salespersonStats.entrySet().stream()
            .sorted(Map.Entry.<String, DoubleSummaryStatistics>comparingByValue(
                Comparator.comparing(DoubleSummaryStatistics::getSum)).reversed())
            .forEach(entry -> {
                String name = entry.getKey();
                DoubleSummaryStatistics stats = entry.getValue();
                System.out.printf("%s: %d sales, $%.2f total, $%.2f average%n",
                                name, stats.getCount(), stats.getSum(), stats.getAverage());
            });
    }
    
    public void timeSeriesAnalysis() {
        System.out.println("\n=== Time Series Analysis ===");
        
        // Sales by month
        Map<YearMonth, Double> monthlySales = salesData.stream()
            .collect(Collectors.groupingBy(
                record -> YearMonth.from(record.getDate()),
                Collectors.summingDouble(SalesRecord::getAmount)
            ));
        
        System.out.println("Monthly Sales:");
        monthlySales.entrySet().stream()
            .sorted(Map.Entry.comparingByKey())
            .forEach(entry -> 
                System.out.printf("  %s: $%.2f%n", entry.getKey(), entry.getValue()));
        
        // Sales by day of week
        Map<DayOfWeek, Double> dailySales = salesData.stream()
            .collect(Collectors.groupingBy(
                record -> record.getDate().getDayOfWeek(),
                Collectors.summingDouble(SalesRecord::getAmount)
            ));
        
        System.out.println("\nSales by Day of Week:");
        dailySales.entrySet().stream()
            .sorted(Map.Entry.<DayOfWeek, Double>comparingByValue().reversed())
            .forEach(entry -> 
                System.out.printf("  %s: $%.2f%n", entry.getKey(), entry.getValue()));
        
        // Recent sales trend (last 7 days)
        LocalDate cutoffDate = salesData.stream()
            .map(SalesRecord::getDate)
            .max(LocalDate::compareTo)
            .orElse(LocalDate.now())
            .minusDays(7);
        
        List<SalesRecord> recentSales = salesData.stream()
            .filter(record -> record.getDate().isAfter(cutoffDate))
            .sorted(Comparator.comparing(SalesRecord::getDate))
            .collect(Collectors.toList());
        
        System.out.println("\nRecent Sales (last 7 days):");
        recentSales.forEach(sale -> System.out.println("  " + sale));
    }
    
    public void advancedAnalysis() {
        System.out.println("\n=== Advanced Analysis ===");
        
        // Top products by revenue
        Map<String, Double> productRevenue = salesData.stream()
            .collect(Collectors.groupingBy(
                SalesRecord::getProduct,
                Collectors.summingDouble(SalesRecord::getAmount)
            ));
        
        System.out.println("Top 5 Products by Revenue:");
        productRevenue.entrySet().stream()
            .sorted(Map.Entry.<String, Double>comparingByValue().reversed())
            .limit(5)
            .forEach(entry -> 
                System.out.printf("  %s: $%.2f%n", entry.getKey(), entry.getValue()));
        
        // Regional performance
        Map<String, DoubleSummaryStatistics> regionalStats = salesData.stream()
            .collect(Collectors.groupingBy(
                SalesRecord::getRegion,
                Collectors.summarizingDouble(SalesRecord::getAmount)
            ));
        
        System.out.println("\nRegional Performance:");
        regionalStats.entrySet().stream()
            .sorted(Map.Entry.<String, DoubleSummaryStatistics>comparingByValue(
                Comparator.comparing(DoubleSummaryStatistics::getSum)).reversed())
            .forEach(entry -> {
                String region = entry.getKey();
                DoubleSummaryStatistics stats = entry.getValue();
                System.out.printf("  %s: $%.2f total, $%.2f average (%d transactions)%n",
                                region, stats.getSum(), stats.getAverage(), stats.getCount());
            });
        
        // High-value transactions (above average)
        double overallAverage = salesData.stream()
            .mapToDouble(SalesRecord::getAmount)
            .average()
            .orElse(0.0);
        
        List<SalesRecord> highValueSales = salesData.stream()
            .filter(record -> record.getAmount() > overallAverage)
            .sorted(Comparator.comparing(SalesRecord::getAmount).reversed())
            .collect(Collectors.toList());
        
        System.out.printf("\nHigh-Value Transactions (above $%.2f average):%n", overallAverage);
        highValueSales.forEach(sale -> System.out.println("  " + sale));
        
        // Category market share
        double totalRevenue = salesData.stream()
            .mapToDouble(SalesRecord::getAmount)
            .sum();
        
        System.out.println("\nCategory Market Share:");
        salesData.stream()
            .collect(Collectors.groupingBy(
                SalesRecord::getCategory,
                Collectors.summingDouble(SalesRecord::getAmount)
            ))
            .entrySet().stream()
            .sorted(Map.Entry.<String, Double>comparingByValue().reversed())
            .forEach(entry -> {
                double percentage = (entry.getValue() / totalRevenue) * 100;
                System.out.printf("  %s: %.1f%% ($%.2f)%n", 
                                entry.getKey(), percentage, entry.getValue());
            });
    }
    
    public void performComplexQueries() {
        System.out.println("\n=== Complex Queries ===");
        
        // Find salesperson with most diverse product portfolio
        Map<String, Set<String>> salespersonProducts = salesData.stream()
            .collect(Collectors.groupingBy(
                SalesRecord::getSalesperson,
                Collectors.mapping(
                    SalesRecord::getProduct,
                    Collectors.toSet()
                )
            ));
        
        Optional<Map.Entry<String, Set<String>>> mostDiverse = salespersonProducts.entrySet()
            .stream()
            .max(Map.Entry.comparingByValue(Comparator.comparing(Set::size)));
        
        mostDiverse.ifPresent(entry -> 
            System.out.printf("Most diverse salesperson: %s with %d different products%n",
                            entry.getKey(), entry.getValue().size()));
        
        // Products sold in all regions
        Set<String> allRegions = salesData.stream()
            .map(SalesRecord::getRegion)
            .collect(Collectors.toSet());
        
        Set<String> productsInAllRegions = salesData.stream()
            .collect(Collectors.groupingBy(
                SalesRecord::getProduct,
                Collectors.mapping(
                    SalesRecord::getRegion,
                    Collectors.toSet()
                )
            ))
            .entrySet().stream()
            .filter(entry -> entry.getValue().size() == allRegions.size())
            .map(Map.Entry::getKey)
            .collect(Collectors.toSet());
        
        System.out.println("Products sold in all regions: " + productsInAllRegions);
        
        // Average days between consecutive sales by salesperson
        Map<String, List<LocalDate>> salespersonDates = salesData.stream()
            .collect(Collectors.groupingBy(
                SalesRecord::getSalesperson,
                Collectors.mapping(
                    SalesRecord::getDate,
                    Collectors.collectingAndThen(
                        Collectors.toList(),
                        dates -> dates.stream().sorted().collect(Collectors.toList())
                    )
                )
            ));
        
        System.out.println("\nSales frequency by salesperson:");
        salespersonDates.forEach((salesperson, dates) -> {
            if (dates.size() > 1) {
                double avgDaysBetween = IntStream.range(1, dates.size())
                    .mapToLong(i -> dates.get(i).toEpochDay() - dates.get(i-1).toEpochDay())
                    .average()
                    .orElse(0.0);
                System.out.printf("  %s: %.1f days between sales on average%n", 
                                salesperson, avgDaysBetween);
            }
        });
    }
    
    public static void main(String[] args) {
        DataAnalysisSystem system = new DataAnalysisSystem();
        
        system.performBasicAnalysis();
        system.analyzeByCategory();
        system.analyzeBySalesperson();
        system.timeSeriesAnalysis();
        system.advancedAnalysis();
        system.performComplexQueries();
        
        System.out.println("\n=== Analysis Complete ===");
    }
}
```

## Best Practices and Performance Tips

### Effective Functional Programming

```java
import java.util.*;
import java.util.function.*;
import java.util.stream.*;

public class FunctionalProgrammingBestPractices {
    
    public static void demonstratePerformanceTips() {
        System.out.println("=== Performance Tips ===");
        
        List<Integer> largeList = IntStream.range(1, 1000000)
                                          .boxed()
                                          .collect(Collectors.toList());
        
        // Tip 1: Use primitive streams when possible
        long startTime = System.nanoTime();
        long sumBoxed = largeList.stream()
            .mapToInt(Integer::intValue)
            .filter(n -> n % 2 == 0)
            .sum();
        long boxedTime = System.nanoTime() - startTime;
        
        startTime = System.nanoTime();
        long sumPrimitive = IntStream.range(1, 1000000)
            .filter(n -> n % 2 == 0)
            .sum();
        long primitiveTime = System.nanoTime() - startTime;
        
        System.out.printf("Boxed stream: %d ns%n", boxedTime);
        System.out.printf("Primitive stream: %d ns%n", primitiveTime);
        System.out.printf("Speedup: %.2fx%n", (double) boxedTime / primitiveTime);
        
        // Tip 2: Order filter operations by selectivity (most selective first)
        List<String> words = Arrays.asList("a", "ab", "abc", "abcd", "abcde", "abcdef");
        
        // Less efficient - expensive operation first
        long inefficientCount = words.stream()
            .filter(s -> expensiveCheck(s))
            .filter(s -> s.length() > 3)
            .count();
        
        // More efficient - cheap filter first
        long efficientCount = words.stream()
            .filter(s -> s.length() > 3)  // Cheap filter first
            .filter(s -> expensiveCheck(s))  // Expensive filter on smaller set
            .count();
        
        System.out.println("Efficient filtering applied");
        
        // Tip 3: Use parallel streams judiciously
        boolean shouldUseParallel = largeList.size() > 10000 && 
                                   Runtime.getRuntime().availableProcessors() > 1;
        
        Stream<Integer> stream = shouldUseParallel ? 
                                largeList.parallelStream() : 
                                largeList.stream();
        
        System.out.println("Parallel stream decision based on size and CPU cores");
    }
    
    private static boolean expensiveCheck(String s) {
        // Simulate expensive operation
        return s.hashCode() % 2 == 0;
    }
    
    public static void demonstrateFunctionalPatterns() {
        System.out.println("\n=== Functional Patterns ===");
        
        // Pattern 1: Function composition
        Function<String, String> trimAndLower = ((Function<String, String>) String::trim)
            .andThen(String::toLowerCase);
        
        Function<String, Optional<String>> safeEmailExtractor = email -> 
            email.contains("@") ? Optional.of(trimAndLower.apply(email)) : Optional.empty();
        
        List<String> rawEmails = Arrays.asList("  ALICE@EXAMPLE.COM  ", "invalid-email", "  bob@test.org  ");
        List<String> cleanEmails = rawEmails.stream()
            .map(safeEmailExtractor)
            .filter(Optional::isPresent)
            .map(Optional::get)
            .collect(Collectors.toList());
        
        System.out.println("Clean emails: " + cleanEmails);
        
        // Pattern 2: Currying (partial application)
        BinaryOperator<Integer> add = (a, b) -> a + b;
        Function<Integer, Integer> add5 = b -> add.apply(5, b);
        
        List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5);
        List<Integer> incremented = numbers.stream()
            .map(add5)
            .collect(Collectors.toList());
        
        System.out.println("Incremented by 5: " + incremented);
        
        // Pattern 3: Builder pattern with functional interfaces
        PersonBuilder builder = Person.builder()
            .name("John Doe")
            .age(30)
            .email("john@example.com")
            .addHobby("reading")
            .addHobby("coding");
        
        Person person = builder.build();
        System.out.println("Built person: " + person);
    }
    
    public static void demonstrateErrorHandling() {
        System.out.println("\n=== Functional Error Handling ===");
        
        List<String> inputs = Arrays.asList("123", "456", "invalid", "789", "");
        
        // Pattern 1: Using Optional for safe parsing
        List<Integer> parsedNumbers = inputs.stream()
            .map(FunctionalProgrammingBestPractices::safeParseInt)
            .filter(Optional::isPresent)
            .map(Optional::get)
            .collect(Collectors.toList());
        
        System.out.println("Safely parsed numbers: " + parsedNumbers);
        
        // Pattern 2: Collect successes and failures separately
        Map<Boolean, List<String>> partitioned = inputs.stream()
            .collect(Collectors.partitioningBy(s -> safeParseInt(s).isPresent()));
        
        System.out.println("Valid inputs: " + partitioned.get(true));
        System.out.println("Invalid inputs: " + partitioned.get(false));
        
        // Pattern 3: Using Either-like pattern (Result type)
        List<Result<Integer, String>> results = inputs.stream()
            .map(FunctionalProgrammingBestPractices::parseWithError)
            .collect(Collectors.toList());
        
        List<Integer> successes = results.stream()
            .filter(Result::isSuccess)
            .map(Result::getValue)
            .collect(Collectors.toList());
        
        List<String> errors = results.stream()
            .filter(Result::isFailure)
            .map(Result::getError)
            .collect(Collectors.toList());
        
        System.out.println("Successful parses: " + successes);
        System.out.println("Parse errors: " + errors);
    }
    
    private static Optional<Integer> safeParseInt(String s) {
        try {
            return Optional.of(Integer.parseInt(s.trim()));
        } catch (NumberFormatException e) {
            return Optional.empty();
        }
    }
    
    private static Result<Integer, String> parseWithError(String s) {
        try {
            return Result.success(Integer.parseInt(s.trim()));
        } catch (NumberFormatException e) {
            return Result.failure("Cannot parse '" + s + "' as integer");
        }
    }
    
    public static void demonstrateCommonPitfalls() {
        System.out.println("\n=== Common Pitfalls ===");
        
        List<String> words = Arrays.asList("hello", "world", "java", "stream");
        
        // Pitfall 1: Side effects in stream operations
        List<String> modifiedWords = new ArrayList<>();
        
        // BAD: Side effect in map
        words.stream()
            .map(word -> {
                String upper = word.toUpperCase();
                modifiedWords.add(upper); // Side effect!
                return upper;
            })
            .collect(Collectors.toList());
        
        System.out.println("Side effect result (don't do this): " + modifiedWords);
        
        // GOOD: Pure functional approach
        List<String> upperWords = words.stream()
            .map(String::toUpperCase)
            .collect(Collectors.toList());
        
        System.out.println("Pure functional result: " + upperWords);
        
        // Pitfall 2: Reusing streams
        Stream<String> wordStream = words.stream();
        long count1 = wordStream.count();
        
        try {
            long count2 = wordStream.count(); // IllegalStateException!
        } catch (IllegalStateException e) {
            System.out.println("Cannot reuse streams: " + e.getMessage());
        }
        
        // Pitfall 3: Overusing streams for simple operations
        List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5);
        
        // Overkill for simple operations
        Optional<Integer> first = numbers.stream().findFirst();
        
        // Better: direct access
        Integer firstDirect = numbers.isEmpty() ? null : numbers.get(0);
        
        System.out.println("Stream first: " + first.orElse(null));
        System.out.println("Direct first: " + firstDirect);
    }
    
    // Helper classes
    static class Person {
        private final String name;
        private final int age;
        private final String email;
        private final List<String> hobbies;
        
        private Person(String name, int age, String email, List<String> hobbies) {
            this.name = name;
            this.age = age;
            this.email = email;
            this.hobbies = new ArrayList<>(hobbies);
        }
        
        public static PersonBuilder builder() {
            return new PersonBuilder();
        }
        
        @Override
        public String toString() {
            return String.format("Person{name='%s', age=%d, email='%s', hobbies=%s}", 
                               name, age, email, hobbies);
        }
    }
    
    static class PersonBuilder {
        private String name;
        private int age;
        private String email;
        private List<String> hobbies = new ArrayList<>();
        
        public PersonBuilder name(String name) {
            this.name = name;
            return this;
        }
        
        public PersonBuilder age(int age) {
            this.age = age;
            return this;
        }
        
        public PersonBuilder email(String email) {
            this.email = email;
            return this;
        }
        
        public PersonBuilder addHobby(String hobby) {
            this.hobbies.add(hobby);
            return this;
        }
        
        public Person build() {
            return new Person(name, age, email, hobbies);
        }
    }
    
    static class Result<T, E> {
        private final T value;
        private final E error;
        private final boolean success;
        
        private Result(T value, E error, boolean success) {
            this.value = value;
            this.error = error;
            this.success = success;
        }
        
        public static <T, E> Result<T, E> success(T value) {
            return new Result<>(value, null, true);
        }
        
        public static <T, E> Result<T, E> failure(E error) {
            return new Result<>(null, error, false);
        }
        
        public boolean isSuccess() { return success; }
        public boolean isFailure() { return !success; }
        public T getValue() { return value; }
        public E getError() { return error; }
    }
    
    public static void main(String[] args) {
        demonstratePerformanceTips();
        demonstrateFunctionalPatterns();
        demonstrateErrorHandling();
        demonstrateCommonPitfalls();
    }
}
```

## Summary

Lambda expressions, Streams, and Optional revolutionize Java programming:

### Key Benefits
1. **Concise code** - Less boilerplate, more expressive
2. **Functional style** - Immutable, side-effect-free operations
3. **Powerful data processing** - Complex transformations made simple
4. **Null safety** - Optional eliminates NullPointerException
5. **Performance** - Lazy evaluation and parallel processing

### Essential Concepts
1. **Lambda expressions** - Anonymous functions with clean syntax
2. **Method references** - Even more concise than lambdas
3. **Stream operations** - Intermediate (lazy) and terminal (eager)
4. **Collectors** - Powerful result aggregation
5. **Optional** - Null-safe value containers
6. **Functional interfaces** - Single abstract method interfaces

### Best Practices
1. **Prefer method references** when they improve readability
2. **Use primitive streams** for performance with numbers
3. **Order filters by selectivity** for efficiency
4. **Avoid side effects** in stream operations
5. **Use Optional wisely** - return types, not parameters
6. **Consider parallel streams** for large datasets and CPU-intensive operations

### Performance Considerations
1. **Primitive streams** are faster than boxed streams
2. **Filter early** to reduce subsequent processing
3. **Parallel streams** benefit large datasets but have overhead
4. **Short-circuiting operations** can improve performance

This completes the comprehensive Java Complete tutorial series, covering everything from basic syntax to advanced functional programming concepts. You now have the tools to write modern, efficient, and maintainable Java code!