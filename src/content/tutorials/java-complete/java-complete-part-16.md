---
title: "Java Complete Part 16: Generics"
slug: java-complete-part-16
description: "Master Java Generics with type parameters, bounded types, wildcards, generic methods, type erasure, and best practices for type-safe programming"
publishDate: 2025-08-29
publishedAt: 2025-08-29
tags: ["java", "tutorial", "intermediate", "generics", "type-safety", "wildcards", "bounded-types"]
category: Tutorial
author: "codersbox"
series: "Java Complete"
part: 16
difficulty: "intermediate"
estimatedTime: "90-110 minutes"
totalParts: 17
prerequisites: ["Java Complete Parts 1-15"]
---

# Generics

Generics enable types (classes and interfaces) to be parameters when defining classes, interfaces, and methods. They provide compile-time type safety and eliminate the need for type casting, making code more readable and robust.

## Understanding Generics

### Before and After Generics

```java
import java.util.*;

public class GenericsIntroduction {
    
    public static void demonstrateWithoutGenerics() {
        System.out.println("=== Before Generics (Raw Types) ===");
        
        // Raw types - no type safety
        @SuppressWarnings("rawtypes")
        List rawList = new ArrayList();
        
        rawList.add("String");
        rawList.add(123);           // Integer
        rawList.add(45.67);         // Double
        rawList.add(new Date());    // Date
        
        System.out.println("Raw list: " + rawList);
        
        // Unsafe - requires casting and runtime type checking
        for (Object obj : rawList) {
            if (obj instanceof String) {
                String str = (String) obj;
                System.out.println("String: " + str.toUpperCase());
            } else if (obj instanceof Integer) {
                Integer num = (Integer) obj;
                System.out.println("Integer: " + (num * 2));
            }
            // ... more type checks needed
        }
        
        // This compiles but fails at runtime
        try {
            @SuppressWarnings("unchecked")
            List<String> unsafeStringList = rawList;
            for (String str : unsafeStringList) {
                System.out.println(str.toUpperCase()); // ClassCastException!
            }
        } catch (ClassCastException e) {
            System.out.println("Runtime error: " + e.getMessage());
        }
    }
    
    public static void demonstrateWithGenerics() {
        System.out.println("\n=== With Generics (Type Safe) ===");
        
        // Generic types - compile-time type safety
        List<String> stringList = new ArrayList<>();
        stringList.add("Hello");
        stringList.add("World");
        // stringList.add(123);     // Compile-time error!
        
        System.out.println("String list: " + stringList);
        
        // No casting needed - type is guaranteed
        for (String str : stringList) {
            System.out.println("String: " + str.toUpperCase());
        }
        
        // Different types in separate collections
        List<Integer> intList = new ArrayList<>();
        intList.add(10);
        intList.add(20);
        intList.add(30);
        
        for (Integer num : intList) {
            System.out.println("Integer: " + (num * 2));
        }
        
        // Type safety prevents runtime errors
        System.out.println("No runtime ClassCastException with generics!");
    }
    
    public static void main(String[] args) {
        demonstrateWithoutGenerics();
        demonstrateWithGenerics();
    }
}
```

## Generic Classes and Interfaces

### Creating Generic Classes

```java
/**
 * Generic class with single type parameter
 */
public class Box<T> {
    private T content;
    
    public Box() {
        this.content = null;
    }
    
    public Box(T content) {
        this.content = content;
    }
    
    public void setContent(T content) {
        this.content = content;
    }
    
    public T getContent() {
        return content;
    }
    
    public boolean isEmpty() {
        return content == null;
    }
    
    @Override
    public String toString() {
        return "Box{content=" + content + "}";
    }
}

/**
 * Generic class with multiple type parameters
 */
public class Pair<T, U> {
    private final T first;
    private final U second;
    
    public Pair(T first, U second) {
        this.first = first;
        this.second = second;
    }
    
    public T getFirst() {
        return first;
    }
    
    public U getSecond() {
        return second;
    }
    
    // Generic method in generic class
    public <V> Pair<T, V> replaceSecond(V newSecond) {
        return new Pair<>(first, newSecond);
    }
    
    // Static generic method
    public static <T, U> Pair<T, U> of(T first, U second) {
        return new Pair<>(first, second);
    }
    
    @Override
    public String toString() {
        return "(" + first + ", " + second + ")";
    }
    
    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        
        Pair<?, ?> pair = (Pair<?, ?>) obj;
        return Objects.equals(first, pair.first) && 
               Objects.equals(second, pair.second);
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(first, second);
    }
}

/**
 * Generic interface
 */
public interface Container<T> {
    void add(T item);
    T remove();
    boolean isEmpty();
    int size();
    
    // Default method in generic interface
    default void addAll(Collection<? extends T> items) {
        for (T item : items) {
            add(item);
        }
    }
}

/**
 * Implementation of generic interface
 */
public class ListContainer<T> implements Container<T> {
    private final List<T> items;
    
    public ListContainer() {
        this.items = new ArrayList<>();
    }
    
    @Override
    public void add(T item) {
        items.add(item);
    }
    
    @Override
    public T remove() {
        return items.isEmpty() ? null : items.remove(items.size() - 1);
    }
    
    @Override
    public boolean isEmpty() {
        return items.isEmpty();
    }
    
    @Override
    public int size() {
        return items.size();
    }
    
    public List<T> getItems() {
        return new ArrayList<>(items);
    }
    
    @Override
    public String toString() {
        return "ListContainer{items=" + items + "}";
    }
}

// Demo class
public class GenericClassDemo {
    public static void main(String[] args) {
        System.out.println("=== Generic Classes Demo ===");
        
        // Single type parameter
        Box<String> stringBox = new Box<>("Hello, Generics!");
        Box<Integer> intBox = new Box<>(42);
        Box<List<String>> listBox = new Box<>(Arrays.asList("a", "b", "c"));
        
        System.out.println("String box: " + stringBox);
        System.out.println("Integer box: " + intBox);
        System.out.println("List box: " + listBox);
        
        // Multiple type parameters
        Pair<String, Integer> nameAge = new Pair<>("Alice", 25);
        Pair<Integer, Double> coordinates = new Pair<>(100, 75.5);
        Pair<String, List<String>> nameHobbies = new Pair<>("Bob", Arrays.asList("reading", "coding"));
        
        System.out.println("Name-Age: " + nameAge);
        System.out.println("Coordinates: " + coordinates);
        System.out.println("Name-Hobbies: " + nameHobbies);
        
        // Using static factory method
        Pair<String, String> cityCountry = Pair.of("Paris", "France");
        System.out.println("City-Country: " + cityCountry);
        
        // Generic method usage
        Pair<String, Double> nameScore = nameAge.replaceSecond(95.5);
        System.out.println("Name-Score: " + nameScore);
        
        // Generic interface implementation
        Container<String> container = new ListContainer<>();
        container.add("First");
        container.add("Second");
        container.addAll(Arrays.asList("Third", "Fourth"));
        
        System.out.println("Container: " + container);
        System.out.println("Size: " + container.size());
        System.out.println("Removed: " + container.remove());
        System.out.println("After removal: " + container);
    }
}
```

## Generic Methods

### Standalone and Instance Generic Methods

```java
import java.util.*;

public class GenericMethods {
    
    // Generic method with single type parameter
    public static <T> void swap(T[] array, int i, int j) {
        if (i >= 0 && i < array.length && j >= 0 && j < array.length) {
            T temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
    }
    
    // Generic method with multiple type parameters
    public static <T, U, V> Triple<T, U, V> createTriple(T first, U second, V third) {
        return new Triple<>(first, second, third);
    }
    
    // Generic method with bounded type parameter
    public static <T extends Comparable<T>> T findMax(T[] array) {
        if (array == null || array.length == 0) {
            return null;
        }
        
        T max = array[0];
        for (int i = 1; i < array.length; i++) {
            if (array[i].compareTo(max) > 0) {
                max = array[i];
            }
        }
        return max;
    }
    
    // Generic method with wildcards
    public static double sumNumbers(List<? extends Number> numbers) {
        double sum = 0.0;
        for (Number num : numbers) {
            sum += num.doubleValue();
        }
        return sum;
    }
    
    // Generic method for safe casting
    @SuppressWarnings("unchecked")
    public static <T> T safeCast(Object obj, Class<T> clazz) {
        if (clazz.isInstance(obj)) {
            return (T) obj;
        }
        return null;
    }
    
    // Generic method for creating lists
    @SafeVarargs
    public static <T> List<T> listOf(T... elements) {
        List<T> list = new ArrayList<>();
        Collections.addAll(list, elements);
        return list;
    }
    
    // Generic method with type inference
    public static <T> Optional<T> findFirst(List<T> list, Predicate<T> predicate) {
        for (T item : list) {
            if (predicate.test(item)) {
                return Optional.of(item);
            }
        }
        return Optional.empty();
    }
    
    // Generic method for conversion
    public static <T, R> List<R> map(List<T> source, Function<T, R> mapper) {
        List<R> result = new ArrayList<>();
        for (T item : source) {
            result.add(mapper.apply(item));
        }
        return result;
    }
    
    // Generic method for filtering
    public static <T> List<T> filter(List<T> source, Predicate<T> predicate) {
        List<T> result = new ArrayList<>();
        for (T item : source) {
            if (predicate.test(item)) {
                result.add(item);
            }
        }
        return result;
    }
    
    public static void main(String[] args) {
        System.out.println("=== Generic Methods Demo ===");
        
        // Swap method
        String[] names = {"Alice", "Bob", "Charlie"};
        System.out.println("Before swap: " + Arrays.toString(names));
        swap(names, 0, 2);
        System.out.println("After swap: " + Arrays.toString(names));
        
        Integer[] numbers = {5, 2, 8, 1, 9};
        System.out.println("Before swap: " + Arrays.toString(numbers));
        swap(numbers, 1, 3);
        System.out.println("After swap: " + Arrays.toString(numbers));
        
        // Triple creation
        Triple<String, Integer, Boolean> triple = createTriple("Test", 42, true);
        System.out.println("Triple: " + triple);
        
        // Find max
        Integer[] intArray = {3, 7, 2, 9, 1};
        String[] stringArray = {"apple", "zebra", "banana"};
        
        System.out.println("Max integer: " + findMax(intArray));
        System.out.println("Max string: " + findMax(stringArray));
        
        // Sum numbers
        List<Integer> integers = Arrays.asList(1, 2, 3, 4, 5);
        List<Double> doubles = Arrays.asList(1.1, 2.2, 3.3);
        List<Number> mixedNumbers = Arrays.asList(1, 2.5, 3L, 4.7f);
        
        System.out.println("Sum of integers: " + sumNumbers(integers));
        System.out.println("Sum of doubles: " + sumNumbers(doubles));
        System.out.println("Sum of mixed numbers: " + sumNumbers(mixedNumbers));
        
        // Safe casting
        Object stringObj = "Hello";
        Object intObj = 42;
        
        String castedString = safeCast(stringObj, String.class);
        Integer castedInt = safeCast(stringObj, Integer.class); // null
        
        System.out.println("Casted string: " + castedString);
        System.out.println("Casted int (should be null): " + castedInt);
        
        // List creation
        List<String> fruits = listOf("apple", "banana", "cherry");
        List<Integer> nums = listOf(1, 2, 3, 4, 5);
        
        System.out.println("Fruits: " + fruits);
        System.out.println("Numbers: " + nums);
        
        // Find first
        Optional<String> longFruit = findFirst(fruits, s -> s.length() > 5);
        System.out.println("First long fruit: " + longFruit.orElse("None"));
        
        // Map and filter
        List<String> upperFruits = map(fruits, String::toUpperCase);
        List<String> longFruits = filter(fruits, s -> s.length() > 5);
        
        System.out.println("Upper case fruits: " + upperFruits);
        System.out.println("Long fruits: " + longFruits);
    }
}

// Helper classes
class Triple<T, U, V> {
    private final T first;
    private final U second;
    private final V third;
    
    public Triple(T first, U second, V third) {
        this.first = first;
        this.second = second;
        this.third = third;
    }
    
    public T getFirst() { return first; }
    public U getSecond() { return second; }
    public V getThird() { return third; }
    
    @Override
    public String toString() {
        return "(" + first + ", " + second + ", " + third + ")";
    }
}

@FunctionalInterface
interface Predicate<T> {
    boolean test(T t);
}

@FunctionalInterface
interface Function<T, R> {
    R apply(T t);
}
```

## Bounded Type Parameters

### Upper and Lower Bounds

```java
import java.util.*;

public class BoundedTypes {
    
    // Upper bound - T must extend Number
    public static class NumberBox<T extends Number> {
        private T value;
        
        public NumberBox(T value) {
            this.value = value;
        }
        
        public T getValue() {
            return value;
        }
        
        public void setValue(T value) {
            this.value = value;
        }
        
        // Can use Number methods because T extends Number
        public double getDoubleValue() {
            return value.doubleValue();
        }
        
        public int getIntValue() {
            return value.intValue();
        }
        
        public boolean isZero() {
            return value.doubleValue() == 0.0;
        }
        
        public NumberBox<T> add(NumberBox<T> other) {
            double result = this.value.doubleValue() + other.value.doubleValue();
            
            // This is a simplified approach - in practice, you'd need proper type handling
            if (value instanceof Integer) {
                @SuppressWarnings("unchecked")
                T newValue = (T) Integer.valueOf((int) result);
                return new NumberBox<>(newValue);
            } else if (value instanceof Double) {
                @SuppressWarnings("unchecked")
                T newValue = (T) Double.valueOf(result);
                return new NumberBox<>(newValue);
            }
            // Add more type checks as needed
            return this;
        }
        
        @Override
        public String toString() {
            return "NumberBox{" + value + " (" + value.getClass().getSimpleName() + ")}";
        }
    }
    
    // Multiple bounds - T must extend Number AND implement Comparable
    public static class ComparableNumberBox<T extends Number & Comparable<T>> {
        private T value;
        
        public ComparableNumberBox(T value) {
            this.value = value;
        }
        
        public T getValue() {
            return value;
        }
        
        // Can use both Number and Comparable methods
        public boolean isGreaterThan(ComparableNumberBox<T> other) {
            return this.value.compareTo(other.value) > 0;
        }
        
        public boolean isLessThan(ComparableNumberBox<T> other) {
            return this.value.compareTo(other.value) < 0;
        }
        
        public ComparableNumberBox<T> max(ComparableNumberBox<T> other) {
            return this.value.compareTo(other.value) >= 0 ? this : other;
        }
        
        public ComparableNumberBox<T> min(ComparableNumberBox<T> other) {
            return this.value.compareTo(other.value) <= 0 ? this : other;
        }
        
        @Override
        public String toString() {
            return "ComparableNumberBox{" + value + "}";
        }
    }
    
    // Generic method with upper bound
    public static <T extends Comparable<T>> List<T> sort(List<T> list) {
        List<T> sorted = new ArrayList<>(list);
        Collections.sort(sorted);
        return sorted;
    }
    
    // Generic method with multiple bounds
    public static <T extends Number & Comparable<T>> T findMax(Collection<T> numbers) {
        if (numbers.isEmpty()) {
            return null;
        }
        
        T max = numbers.iterator().next();
        for (T num : numbers) {
            if (num.compareTo(max) > 0) {
                max = num;
            }
        }
        return max;
    }
    
    // Bounded wildcard examples
    public static double calculateSum(List<? extends Number> numbers) {
        double sum = 0.0;
        for (Number num : numbers) {
            sum += num.doubleValue();
        }
        return sum;
    }
    
    public static void addNumbers(List<? super Integer> list) {
        list.add(1);
        list.add(2);
        list.add(3);
        // Can add integers because list accepts Integer or its supertypes
    }
    
    // Complex bounded generic method
    public static <T extends Comparable<T>, U extends Collection<T>> 
           T findMaxInCollection(U collection) {
        if (collection.isEmpty()) {
            return null;
        }
        
        T max = null;
        for (T item : collection) {
            if (max == null || item.compareTo(max) > 0) {
                max = item;
            }
        }
        return max;
    }
    
    public static void main(String[] args) {
        System.out.println("=== Bounded Types Demo ===");
        
        // NumberBox examples
        NumberBox<Integer> intBox = new NumberBox<>(42);
        NumberBox<Double> doubleBox = new NumberBox<>(3.14);
        // NumberBox<String> stringBox = new NumberBox<>("hello"); // Compile error!
        
        System.out.println("Integer box: " + intBox);
        System.out.println("Double value from int box: " + intBox.getDoubleValue());
        System.out.println("Is zero: " + intBox.isZero());
        
        System.out.println("Double box: " + doubleBox);
        System.out.println("Int value from double box: " + doubleBox.getIntValue());
        
        // Addition
        NumberBox<Integer> intBox2 = new NumberBox<>(8);
        NumberBox<Integer> sum = intBox.add(intBox2);
        System.out.println("Sum: " + sum);
        
        // ComparableNumberBox examples
        ComparableNumberBox<Integer> compInt1 = new ComparableNumberBox<>(10);
        ComparableNumberBox<Integer> compInt2 = new ComparableNumberBox<>(20);
        
        System.out.println("Comparable boxes: " + compInt1 + " and " + compInt2);
        System.out.println("First > Second: " + compInt1.isGreaterThan(compInt2));
        System.out.println("First < Second: " + compInt1.isLessThan(compInt2));
        System.out.println("Max: " + compInt1.max(compInt2));
        System.out.println("Min: " + compInt1.min(compInt2));
        
        // Generic method with bounds
        List<String> names = Arrays.asList("Charlie", "Alice", "Bob");
        List<Integer> numbers = Arrays.asList(5, 2, 8, 1, 9);
        
        System.out.println("Original names: " + names);
        System.out.println("Sorted names: " + sort(names));
        
        System.out.println("Original numbers: " + numbers);
        System.out.println("Sorted numbers: " + sort(numbers));
        System.out.println("Max number: " + findMax(numbers));
        
        // Wildcard examples
        List<Integer> integers = Arrays.asList(1, 2, 3, 4, 5);
        List<Double> doubles = Arrays.asList(1.1, 2.2, 3.3);
        List<Number> mixedNumbers = new ArrayList<>(Arrays.asList(1, 2.5, 3L));
        
        System.out.println("Sum of integers: " + calculateSum(integers));
        System.out.println("Sum of doubles: " + calculateSum(doubles));
        
        // Lower bound wildcard
        addNumbers(mixedNumbers); // Works because List<Number> is super type of Integer
        System.out.println("After adding numbers: " + mixedNumbers);
        
        // Complex bounded method
        List<String> stringList = Arrays.asList("zebra", "apple", "banana");
        Set<Integer> integerSet = new TreeSet<>(Arrays.asList(7, 3, 9, 1));
        
        System.out.println("Max in string list: " + findMaxInCollection(stringList));
        System.out.println("Max in integer set: " + findMaxInCollection(integerSet));
    }
}
```

## Wildcards

### Upper Bounded, Lower Bounded, and Unbounded Wildcards

```java
import java.util.*;

public class WildcardsDemo {
    
    // Shape hierarchy for demonstration
    static class Shape {
        protected String name;
        
        public Shape(String name) {
            this.name = name;
        }
        
        public void draw() {
            System.out.println("Drawing " + name);
        }
        
        @Override
        public String toString() {
            return name;
        }
    }
    
    static class Circle extends Shape {
        private double radius;
        
        public Circle(double radius) {
            super("Circle");
            this.radius = radius;
        }
        
        public double getArea() {
            return Math.PI * radius * radius;
        }
        
        @Override
        public String toString() {
            return name + "(r=" + radius + ")";
        }
    }
    
    static class Rectangle extends Shape {
        private double width, height;
        
        public Rectangle(double width, double height) {
            super("Rectangle");
            this.width = width;
            this.height = height;
        }
        
        public double getArea() {
            return width * height;
        }
        
        @Override
        public String toString() {
            return name + "(" + width + "x" + height + ")";
        }
    }
    
    // Upper bounded wildcard (? extends T)
    // Can READ from the collection, but cannot ADD (except null)
    public static void drawShapes(List<? extends Shape> shapes) {
        System.out.println("Drawing all shapes:");
        for (Shape shape : shapes) {
            shape.draw(); // Can read and use Shape methods
        }
        
        // shapes.add(new Circle(5)); // Compile error! Can't add to ? extends
        // shapes.add(new Rectangle(3, 4)); // Compile error!
        // shapes.add(null); // This is allowed but not useful
    }
    
    public static double calculateTotalArea(List<? extends Shape> shapes) {
        double totalArea = 0;
        for (Shape shape : shapes) {
            // We need to check type to access specific methods
            if (shape instanceof Circle) {
                totalArea += ((Circle) shape).getArea();
            } else if (shape instanceof Rectangle) {
                totalArea += ((Rectangle) shape).getArea();
            }
        }
        return totalArea;
    }
    
    // Lower bounded wildcard (? super T)
    // Can ADD to the collection, but reading is limited to Object
    public static void addCircles(List<? super Circle> shapes) {
        shapes.add(new Circle(1.0));
        shapes.add(new Circle(2.0));
        shapes.add(new Circle(3.0));
        
        // Can add Circle or its subtypes
        // shapes.add(new Rectangle(1, 1)); // Compile error! Rectangle is not Circle subtype
        
        // Reading is limited to Object
        for (Object obj : shapes) {
            System.out.println("Object: " + obj);
            // Need to cast if you want specific behavior
            if (obj instanceof Shape) {
                ((Shape) obj).draw();
            }
        }
    }
    
    // Unbounded wildcard (?)
    // Equivalent to ? extends Object
    // Can only read as Object, cannot add anything except null
    public static void printCollection(List<?> collection) {
        System.out.println("Collection contents:");
        for (Object item : collection) {
            System.out.println("  " + item);
        }
        System.out.println("Size: " + collection.size());
        System.out.println("Is empty: " + collection.isEmpty());
        
        // collection.add("something"); // Compile error!
        // collection.add(null); // Only null is allowed
    }
    
    // PECS Principle: Producer Extends, Consumer Super
    
    // Producer (source) - use ? extends T
    public static <T> void copy(List<? extends T> source, List<? super T> destination) {
        for (T item : source) {
            destination.add(item);
        }
    }
    
    // More complex example with PECS
    public static <T> T getMax(Collection<? extends T> collection, Comparator<? super T> comparator) {
        if (collection.isEmpty()) {
            return null;
        }
        
        T max = collection.iterator().next();
        for (T item : collection) {
            if (comparator.compare(item, max) > 0) {
                max = item;
            }
        }
        return max;
    }
    
    // Wildcard capture
    public static void wildcardCapture(List<?> list) {
        // Cannot do: list.add(list.get(0)); // Compile error
        
        // Use helper method to capture the wildcard
        wildcardCaptureHelper(list);
    }
    
    private static <T> void wildcardCaptureHelper(List<T> list) {
        if (!list.isEmpty()) {
            T first = list.get(0);
            list.add(first); // Now this works because T is captured
        }
    }
    
    // Nested wildcards
    public static void processNestedLists(List<? extends List<? extends Number>> nestedLists) {
        for (List<? extends Number> innerList : nestedLists) {
            double sum = 0;
            for (Number num : innerList) {
                sum += num.doubleValue();
            }
            System.out.println("Sum of inner list: " + sum);
        }
    }
    
    public static void main(String[] args) {
        System.out.println("=== Wildcards Demo ===");
        
        // Create shape collections
        List<Shape> shapes = new ArrayList<>();
        shapes.add(new Circle(5.0));
        shapes.add(new Rectangle(3.0, 4.0));
        shapes.add(new Circle(2.0));
        
        List<Circle> circles = new ArrayList<>();
        circles.add(new Circle(1.0));
        circles.add(new Circle(3.0));
        
        List<Rectangle> rectangles = new ArrayList<>();
        rectangles.add(new Rectangle(2.0, 3.0));
        rectangles.add(new Rectangle(1.0, 5.0));
        
        // Upper bounded wildcard examples
        System.out.println("=== Upper Bounded Wildcards (? extends) ===");
        drawShapes(shapes);
        drawShapes(circles);      // Circle extends Shape
        drawShapes(rectangles);   // Rectangle extends Shape
        
        System.out.println("Total area of shapes: " + calculateTotalArea(shapes));
        System.out.println("Total area of circles: " + calculateTotalArea(circles));
        
        // Lower bounded wildcard examples
        System.out.println("\n=== Lower Bounded Wildcards (? super) ===");
        List<Shape> shapeContainer = new ArrayList<>();
        List<Object> objectContainer = new ArrayList<>();
        
        addCircles(shapeContainer);   // Shape is super type of Circle
        addCircles(objectContainer);  // Object is super type of Circle
        // addCircles(circles);       // Circle is not super type of Circle (it's the same)
        
        // Unbounded wildcard examples
        System.out.println("\n=== Unbounded Wildcards (?) ===");
        printCollection(shapes);
        printCollection(circles);
        printCollection(Arrays.asList("a", "b", "c"));
        printCollection(Arrays.asList(1, 2, 3, 4, 5));
        
        // PECS examples
        System.out.println("\n=== PECS Examples ===");
        List<String> source = Arrays.asList("apple", "banana", "cherry");
        List<Object> destination = new ArrayList<>();
        
        copy(source, destination);
        System.out.println("Copied to destination: " + destination);
        
        // Comparator example
        List<String> words = Arrays.asList("elephant", "cat", "dog");
        Comparator<String> lengthComparator = Comparator.comparing(String::length);
        Comparator<Object> toStringComparator = Comparator.comparing(Object::toString);
        
        String maxByLength = getMax(words, lengthComparator);
        String maxByToString = getMax(words, toStringComparator);
        
        System.out.println("Max by length: " + maxByLength);
        System.out.println("Max by toString: " + maxByToString);
        
        // Wildcard capture
        System.out.println("\n=== Wildcard Capture ===");
        List<String> stringList = new ArrayList<>(Arrays.asList("test"));
        wildcardCapture(stringList);
        System.out.println("After wildcard capture: " + stringList);
        
        // Nested wildcards
        System.out.println("\n=== Nested Wildcards ===");
        List<List<Integer>> intLists = Arrays.asList(
            Arrays.asList(1, 2, 3),
            Arrays.asList(4, 5, 6, 7),
            Arrays.asList(8, 9)
        );
        
        List<List<Double>> doubleLists = Arrays.asList(
            Arrays.asList(1.1, 2.2),
            Arrays.asList(3.3, 4.4, 5.5)
        );
        
        processNestedLists(intLists);
        processNestedLists(doubleLists);
    }
}
```

## Type Erasure and Limitations

### Understanding Type Erasure

```java
import java.lang.reflect.*;
import java.util.*;

public class TypeErasureDemo {
    
    // Generic class to demonstrate type erasure
    public static class GenericClass<T> {
        private T value;
        private Class<T> type; // We need to store type explicitly
        
        // Cannot do: new T() - type erasure prevents this
        // public T createInstance() {
        //     return new T(); // Compile error!
        // }
        
        public GenericClass(T value, Class<T> type) {
            this.value = value;
            this.type = type;
        }
        
        public T getValue() {
            return value;
        }
        
        public Class<T> getType() {
            return type;
        }
        
        // This works because we have the Class object
        public T createNewInstance() throws Exception {
            return type.getDeclaredConstructor().newInstance();
        }
        
        // Type erasure means this method has same signature as raw type
        public void setValue(T value) {
            this.value = value;
        }
        
        // These would be ambiguous due to type erasure:
        // public void process(List<String> list) { }
        // public void process(List<Integer> list) { } // Error: same erasure!
        
        // Workaround: use different method names or additional parameters
        public void processStrings(List<String> list) {
            System.out.println("Processing strings: " + list);
        }
        
        public void processIntegers(List<Integer> list) {
            System.out.println("Processing integers: " + list);
        }
    }
    
    public static void demonstrateTypeErasure() {
        System.out.println("=== Type Erasure Demonstration ===");
        
        // At runtime, both have the same class
        List<String> stringList = new ArrayList<>();
        List<Integer> intList = new ArrayList<>();
        
        System.out.println("String list class: " + stringList.getClass());
        System.out.println("Integer list class: " + intList.getClass());
        System.out.println("Same class? " + (stringList.getClass() == intList.getClass()));
        
        // Generic type information is erased
        System.out.println("Type parameters for ArrayList:");
        TypeVariable<?>[] typeParams = ArrayList.class.getTypeParameters();
        for (TypeVariable<?> param : typeParams) {
            System.out.println("  " + param.getName() + " bounds: " + Arrays.toString(param.getBounds()));
        }
        
        // Raw type warnings
        @SuppressWarnings({"rawtypes", "unchecked"})
        List rawList = new ArrayList();
        rawList.add("string");
        rawList.add(123);
        
        // This compiles but can cause ClassCastException at runtime
        try {
            @SuppressWarnings("unchecked")
            List<String> unsafeList = rawList;
            for (String s : unsafeList) {
                System.out.println(s.toUpperCase()); // Will fail on Integer
            }
        } catch (ClassCastException e) {
            System.out.println("ClassCastException due to type erasure: " + e.getMessage());
        }
    }
    
    public static void demonstrateErasureLimitations() {
        System.out.println("\n=== Type Erasure Limitations ===");
        
        // Cannot create arrays of generic types
        // List<String>[] arrayOfLists = new List<String>[10]; // Compile error!
        
        // Workaround: use wildcards or Object arrays
        @SuppressWarnings("unchecked")
        List<String>[] arrayOfLists = (List<String>[]) new List<?>[10];
        arrayOfLists[0] = new ArrayList<>();
        arrayOfLists[0].add("test");
        
        System.out.println("Array of lists workaround: " + Arrays.toString(arrayOfLists));
        
        // Cannot use instanceof with parameterized types
        List<String> list = new ArrayList<>();
        
        // if (list instanceof List<String>) { } // Compile error!
        
        // Can only check raw type
        if (list instanceof List) {
            System.out.println("list is a List (raw type check)");
        }
        
        // Cannot catch generic exception types (if they existed)
        // try { } catch (GenericException<String> e) { } // Not allowed
        
        // Static members cannot use class type parameters
        // static T staticField; // Compile error!
        // static void staticMethod(T param) { } // Compile error!
    }
    
    public static void demonstrateTypeInference() {
        System.out.println("\n=== Type Inference ===");
        
        // Diamond operator (Java 7+)
        Map<String, List<Integer>> map = new HashMap<>(); // Inferred from left side
        
        // Method type inference
        List<String> list = Arrays.asList("a", "b", "c"); // Type inferred
        
        // Target type inference (Java 8+)
        map.put("numbers", Arrays.asList(1, 2, 3)); // List<Integer> inferred
        
        System.out.println("Map with inferred types: " + map);
        
        // Complex inference
        Optional<List<String>> optional = Optional.of(Arrays.asList("hello", "world"));
        System.out.println("Complex inferred type: " + optional);
    }
    
    public static void demonstrateBridgeMethods() {
        System.out.println("\n=== Bridge Methods ===");
        
        // Bridge methods are generated to maintain polymorphism after erasure
        class StringBox implements Comparable<StringBox> {
            private String value;
            
            public StringBox(String value) {
                this.value = value;
            }
            
            @Override
            public int compareTo(StringBox other) {
                return this.value.compareTo(other.value);
            }
            
            @Override
            public String toString() {
                return value;
            }
        }
        
        StringBox box = new StringBox("test");
        
        // The compiler generates a bridge method:
        // public int compareTo(Object other) {
        //     return compareTo((StringBox) other);
        // }
        
        Method[] methods = StringBox.class.getDeclaredMethods();
        System.out.println("Methods in StringBox:");
        for (Method method : methods) {
            System.out.println("  " + method.getName() + 
                             " - Bridge: " + method.isBridge() + 
                             " - Synthetic: " + method.isSynthetic());
        }
    }
    
    // Generic method with type token pattern
    @SuppressWarnings("unchecked")
    public static <T> T fromJson(String json, Class<T> clazz) {
        // Simplified JSON parsing - in reality you'd use a JSON library
        if (clazz == String.class) {
            return (T) json.replace("\"", "");
        } else if (clazz == Integer.class) {
            return (T) Integer.valueOf(json);
        }
        return null;
    }
    
    // Generic method with super type tokens
    public static <T> T fromJsonAdvanced(String json, TypeReference<T> typeRef) {
        // This pattern is used by libraries like Jackson
        // TypeReference captures the generic type information
        Type type = typeRef.getType();
        System.out.println("Captured type: " + type);
        return null; // Simplified implementation
    }
    
    public static void main(String[] args) {
        demonstrateTypeErasure();
        demonstrateErasureLimitations();
        demonstrateTypeInference();
        demonstrateBridgeMethods();
        
        System.out.println("\n=== Working with Type Erasure ===");
        
        // Type token pattern
        String result1 = fromJson("\"hello\"", String.class);
        Integer result2 = fromJson("42", Integer.class);
        
        System.out.println("Parsed string: " + result1);
        System.out.println("Parsed integer: " + result2);
        
        // Super type tokens
        fromJsonAdvanced("{\"list\":[1,2,3]}", new TypeReference<List<Integer>>() {});
        fromJsonAdvanced("{\"map\":{\"key\":\"value\"}}", new TypeReference<Map<String, String>>() {});
    }
}

// Helper class for super type tokens pattern
abstract class TypeReference<T> {
    private final Type type;
    
    protected TypeReference() {
        Type superClass = getClass().getGenericSuperclass();
        this.type = ((ParameterizedType) superClass).getActualTypeArguments()[0];
    }
    
    public Type getType() {
        return type;
    }
}
```

## Generic Best Practices

### Design Patterns and Common Practices

```java
import java.util.*;
import java.util.function.*;

public class GenericBestPractices {
    
    // 1. Use bounded wildcards for API flexibility
    
    // BAD: Too restrictive
    public static void badCopyList(List<Number> source, List<Number> dest) {
        for (Number n : source) {
            dest.add(n);
        }
    }
    
    // GOOD: Flexible with PECS principle
    public static void goodCopyList(List<? extends Number> source, List<? super Number> dest) {
        for (Number n : source) {
            dest.add(n);
        }
    }
    
    // 2. Prefer generic methods over wildcards when possible
    
    // GOOD: Generic method allows type inference
    public static <T> void swap(List<T> list, int i, int j) {
        T temp = list.get(i);
        list.set(i, list.get(j));
        list.set(j, temp);
    }
    
    // LESS IDEAL: Requires explicit casting
    public static void swapWildcard(List<?> list, int i, int j) {
        swapHelper(list, i, j);
    }
    
    private static <T> void swapHelper(List<T> list, int i, int j) {
        T temp = list.get(i);
        list.set(i, list.get(j));
        list.set(j, temp);
    }
    
    // 3. Use type tokens for runtime type information
    
    public static class GenericDAO<T> {
        private final Class<T> entityClass;
        
        public GenericDAO(Class<T> entityClass) {
            this.entityClass = entityClass;
        }
        
        public T findById(Long id) {
            // Simulate database lookup
            System.out.println("Finding " + entityClass.getSimpleName() + " with id: " + id);
            try {
                return entityClass.getDeclaredConstructor().newInstance();
            } catch (Exception e) {
                return null;
            }
        }
        
        public List<T> findAll() {
            System.out.println("Finding all " + entityClass.getSimpleName() + " entities");
            return new ArrayList<>();
        }
        
        public void save(T entity) {
            System.out.println("Saving " + entityClass.getSimpleName() + ": " + entity);
        }
    }
    
    // 4. Builder pattern with generics
    
    public static class GenericBuilder<T> {
        private final Map<String, Object> properties = new HashMap<>();
        private final Class<T> targetClass;
        
        private GenericBuilder(Class<T> targetClass) {
            this.targetClass = targetClass;
        }
        
        public static <T> GenericBuilder<T> of(Class<T> clazz) {
            return new GenericBuilder<>(clazz);
        }
        
        public GenericBuilder<T> with(String property, Object value) {
            properties.put(property, value);
            return this;
        }
        
        @SuppressWarnings("unchecked")
        public T build() {
            // Simplified building - in practice you'd use reflection or factory
            if (targetClass == Person.class) {
                String name = (String) properties.get("name");
                Integer age = (Integer) properties.get("age");
                return (T) new Person(name != null ? name : "Unknown", age != null ? age : 0);
            }
            return null;
        }
    }
    
    // 5. Generic factory pattern
    
    @FunctionalInterface
    public interface Factory<T> {
        T create();
    }
    
    public static class FactoryRegistry {
        private static final Map<Class<?>, Factory<?>> factories = new HashMap<>();
        
        public static <T> void register(Class<T> clazz, Factory<T> factory) {
            factories.put(clazz, factory);
        }
        
        @SuppressWarnings("unchecked")
        public static <T> T create(Class<T> clazz) {
            Factory<T> factory = (Factory<T>) factories.get(clazz);
            return factory != null ? factory.create() : null;
        }
    }
    
    // 6. Recursive type bounds (F-bounded polymorphism)
    
    public static abstract class Comparable<T extends Comparable<T>> {
        public abstract int compareTo(T other);
        
        public boolean isLessThan(T other) {
            return compareTo(other) < 0;
        }
        
        public boolean isGreaterThan(T other) {
            return compareTo(other) > 0;
        }
    }
    
    public static class Person extends Comparable<Person> {
        private final String name;
        private final int age;
        
        public Person(String name, int age) {
            this.name = name;
            this.age = age;
        }
        
        @Override
        public int compareTo(Person other) {
            int nameComparison = this.name.compareTo(other.name);
            return nameComparison != 0 ? nameComparison : Integer.compare(this.age, other.age);
        }
        
        @Override
        public String toString() {
            return name + "(" + age + ")";
        }
        
        // Getters
        public String getName() { return name; }
        public int getAge() { return age; }
    }
    
    // 7. Generic utility class
    
    public static class GenericUtils {
        
        private GenericUtils() {} // Utility class
        
        // Safe casting with Optional
        public static <T> Optional<T> safeCast(Object obj, Class<T> clazz) {
            return clazz.isInstance(obj) ? Optional.of(clazz.cast(obj)) : Optional.empty();
        }
        
        // Create list with specific type
        @SafeVarargs
        public static <T> List<T> listOf(T... elements) {
            return Arrays.asList(elements);
        }
        
        // Find first matching element
        public static <T> Optional<T> findFirst(Iterable<T> iterable, Predicate<T> predicate) {
            for (T element : iterable) {
                if (predicate.test(element)) {
                    return Optional.of(element);
                }
            }
            return Optional.empty();
        }
        
        // Transform collection
        public static <T, R> List<R> transform(Collection<T> source, Function<T, R> transformer) {
            List<R> result = new ArrayList<>();
            for (T element : source) {
                result.add(transformer.apply(element));
            }
            return result;
        }
        
        // Partition collection
        public static <T> Map<Boolean, List<T>> partition(Collection<T> source, Predicate<T> predicate) {
            Map<Boolean, List<T>> result = new HashMap<>();
            result.put(true, new ArrayList<>());
            result.put(false, new ArrayList<>());
            
            for (T element : source) {
                result.get(predicate.test(element)).add(element);
            }
            
            return result;
        }
    }
    
    // 8. Generic event system
    
    @FunctionalInterface
    public interface EventListener<T> {
        void onEvent(T event);
    }
    
    public static class EventBus {
        private final Map<Class<?>, List<EventListener<?>>> listeners = new HashMap<>();
        
        @SuppressWarnings("unchecked")
        public <T> void register(Class<T> eventType, EventListener<T> listener) {
            listeners.computeIfAbsent(eventType, k -> new ArrayList<>()).add(listener);
        }
        
        @SuppressWarnings("unchecked")
        public <T> void publish(T event) {
            Class<?> eventType = event.getClass();
            List<EventListener<?>> eventListeners = listeners.get(eventType);
            
            if (eventListeners != null) {
                for (EventListener<?> listener : eventListeners) {
                    ((EventListener<T>) listener).onEvent(event);
                }
            }
        }
    }
    
    // Example events
    public static class UserLoginEvent {
        private final String username;
        
        public UserLoginEvent(String username) {
            this.username = username;
        }
        
        public String getUsername() { return username; }
        
        @Override
        public String toString() {
            return "UserLoginEvent{username='" + username + "'}";
        }
    }
    
    public static class OrderCreatedEvent {
        private final String orderId;
        
        public OrderCreatedEvent(String orderId) {
            this.orderId = orderId;
        }
        
        public String getOrderId() { return orderId; }
        
        @Override
        public String toString() {
            return "OrderCreatedEvent{orderId='" + orderId + "'}";
        }
    }
    
    public static void main(String[] args) {
        System.out.println("=== Generic Best Practices Demo ===");
        
        // 1. PECS example
        List<Integer> integers = Arrays.asList(1, 2, 3);
        List<Number> numbers = new ArrayList<>();
        
        goodCopyList(integers, numbers); // Works with wildcards
        System.out.println("Copied numbers: " + numbers);
        
        // 2. Generic method
        List<String> names = new ArrayList<>(Arrays.asList("Alice", "Bob", "Charlie"));
        System.out.println("Before swap: " + names);
        swap(names, 0, 2);
        System.out.println("After swap: " + names);
        
        // 3. Generic DAO with type tokens
        GenericDAO<Person> personDAO = new GenericDAO<>(Person.class);
        Person person = personDAO.findById(1L);
        personDAO.save(new Person("John", 30));
        
        // 4. Builder pattern
        Person builtPerson = GenericBuilder.of(Person.class)
            .with("name", "Alice")
            .with("age", 25)
            .build();
        System.out.println("Built person: " + builtPerson);
        
        // 5. Factory registry
        FactoryRegistry.register(Person.class, () -> new Person("Default", 0));
        Person factoryPerson = FactoryRegistry.create(Person.class);
        System.out.println("Factory person: " + factoryPerson);
        
        // 6. Recursive type bounds
        Person p1 = new Person("Alice", 25);
        Person p2 = new Person("Bob", 30);
        
        System.out.println("p1 < p2: " + p1.isLessThan(p2));
        System.out.println("p1 > p2: " + p1.isGreaterThan(p2));
        
        // 7. Generic utilities
        List<String> words = Arrays.asList("hello", "world", "java", "generics");
        
        Optional<String> longWord = GenericUtils.findFirst(words, s -> s.length() > 5);
        System.out.println("First long word: " + longWord.orElse("None"));
        
        List<Integer> lengths = GenericUtils.transform(words, String::length);
        System.out.println("Word lengths: " + lengths);
        
        Map<Boolean, List<String>> partitioned = GenericUtils.partition(words, s -> s.length() > 4);
        System.out.println("Long words: " + partitioned.get(true));
        System.out.println("Short words: " + partitioned.get(false));
        
        // 8. Event system
        EventBus eventBus = new EventBus();
        
        // Register listeners
        eventBus.register(UserLoginEvent.class, event -> 
            System.out.println("User logged in: " + event.getUsername()));
        
        eventBus.register(OrderCreatedEvent.class, event -> 
            System.out.println("Order created: " + event.getOrderId()));
        
        // Publish events
        eventBus.publish(new UserLoginEvent("alice"));
        eventBus.publish(new OrderCreatedEvent("ORDER-123"));
        
        System.out.println("\nGeneric best practices demonstrated!");
    }
}
```

## Summary

Generics provide powerful type safety and code reusability in Java:

### Key Benefits
1. **Compile-time type safety** - Catch type errors at compile time
2. **Elimination of casts** - No need for explicit type casting
3. **Generic algorithms** - Write algorithms that work with different types
4. **Code reusability** - One implementation works with multiple types

### Important Concepts
1. **Type parameters** (`<T>`, `<T, U>`) for flexible type definitions
2. **Bounded types** (`<T extends Number>`) for type constraints
3. **Wildcards** (`?`, `? extends`, `? super`) for API flexibility
4. **PECS principle** - Producer Extends, Consumer Super
5. **Type erasure** - Generic information removed at runtime

### Best Practices
1. **Use wildcards** in APIs for maximum flexibility
2. **Prefer generic methods** over wildcards when possible
3. **Use type tokens** to work around type erasure
4. **Apply PECS principle** for wildcard usage
5. **Avoid raw types** - always use parameterized types
6. **Use `@SafeVarargs`** for generic varargs methods

### Common Pitfalls
1. **Type erasure limitations** - cannot create generic arrays or use instanceof
2. **Raw type warnings** - using generics without type parameters
3. **Wildcard capture** - some operations require helper methods
4. **Bridge methods** - compiler-generated methods for compatibility

Generics are fundamental to modern Java development and are extensively used in the Collections Framework, Stream API, and most Java libraries. Understanding generics enables you to write more robust, maintainable, and reusable code.