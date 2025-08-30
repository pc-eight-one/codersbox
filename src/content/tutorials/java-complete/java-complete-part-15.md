---
title: "Java Complete Part 15: Collections Framework"
slug: java-complete-part-15
description: "Master Java Collections Framework with List, Set, Map interfaces, ArrayList, HashMap, TreeSet, and advanced collection operations for efficient data management"
publishDate: 2025-08-29
publishedAt: 2025-08-29
tags: ["java", "tutorial", "intermediate", "collections", "list", "set", "map", "arraylist", "hashmap"]
category: Tutorial
author: "codersbox"
series: "Java Complete"
part: 15
difficulty: "intermediate"
estimatedTime: "100-120 minutes"
totalParts: 17
prerequisites: ["Java Complete Parts 1-14"]
---

# Collections Framework

The Java Collections Framework provides a unified architecture for storing and manipulating groups of objects. It includes interfaces, implementations, and algorithms that make data manipulation efficient and intuitive.

## Collections Hierarchy Overview

```java
/*
Collection Interface Hierarchy

Collection<E>
├── List<E> (ordered, allows duplicates)
│   ├── ArrayList<E>
│   ├── LinkedList<E>
│   └── Vector<E>
├── Set<E> (no duplicates)
│   ├── HashSet<E>
│   ├── LinkedHashSet<E>
│   └── SortedSet<E>
│       └── TreeSet<E>
└── Queue<E> (processing order)
    ├── LinkedList<E>
    ├── PriorityQueue<E>
    └── Deque<E>
        └── ArrayDeque<E>

Map<K,V> (key-value pairs, separate hierarchy)
├── HashMap<K,V>
├── LinkedHashMap<K,V>
└── SortedMap<K,V>
    └── TreeMap<K,V>
*/

import java.util.*;

public class CollectionsOverview {
    public static void demonstrateCollectionTypes() {
        System.out.println("=== Collections Framework Overview ===");
        
        // List - ordered, allows duplicates
        List<String> fruits = new ArrayList<>();
        fruits.add("apple");
        fruits.add("banana");
        fruits.add("apple"); // Duplicate allowed
        System.out.println("List (ArrayList): " + fruits);
        System.out.println("Element at index 1: " + fruits.get(1));
        
        // Set - no duplicates
        Set<String> uniqueFruits = new HashSet<>(fruits);
        System.out.println("Set (HashSet): " + uniqueFruits);
        System.out.println("Size after removing duplicates: " + uniqueFruits.size());
        
        // Map - key-value pairs
        Map<String, Integer> fruitCounts = new HashMap<>();
        fruitCounts.put("apple", 5);
        fruitCounts.put("banana", 3);
        fruitCounts.put("orange", 8);
        System.out.println("Map (HashMap): " + fruitCounts);
        System.out.println("Apple count: " + fruitCounts.get("apple"));
        
        // Queue - processing order
        Queue<String> processingQueue = new LinkedList<>();
        processingQueue.offer("task1");
        processingQueue.offer("task2");
        processingQueue.offer("task3");
        System.out.println("Queue: " + processingQueue);
        System.out.println("Next to process: " + processingQueue.peek());
        
        // Common operations across all collections
        System.out.println("\n=== Common Collection Operations ===");
        Collection<String> collection = new ArrayList<>(Arrays.asList("a", "b", "c"));
        System.out.println("Original: " + collection);
        System.out.println("Size: " + collection.size());
        System.out.println("Is empty: " + collection.isEmpty());
        System.out.println("Contains 'b': " + collection.contains("b"));
        
        collection.remove("b");
        System.out.println("After removing 'b': " + collection);
        
        collection.addAll(Arrays.asList("d", "e"));
        System.out.println("After adding 'd', 'e': " + collection);
        
        System.out.println("As array: " + Arrays.toString(collection.toArray()));
    }
    
    public static void main(String[] args) {
        demonstrateCollectionTypes();
    }
}
```

## List Interface and Implementations

### ArrayList - Dynamic Array Implementation

```java
import java.util.*;

public class ArrayListDemo {
    
    public static void demonstrateArrayListBasics() {
        System.out.println("=== ArrayList Basics ===");
        
        // Creating ArrayList
        ArrayList<String> names = new ArrayList<>();
        ArrayList<String> namesWithCapacity = new ArrayList<>(20); // Initial capacity
        ArrayList<String> namesFromCollection = new ArrayList<>(Arrays.asList("Alice", "Bob"));
        
        System.out.println("Empty list: " + names);
        System.out.println("From collection: " + namesFromCollection);
        
        // Adding elements
        names.add("Charlie");
        names.add("Diana");
        names.add(0, "Aaron"); // Insert at specific index
        names.addAll(Arrays.asList("Eve", "Frank"));
        
        System.out.println("After additions: " + names);
        
        // Accessing elements
        System.out.println("First element: " + names.get(0));
        System.out.println("Last element: " + names.get(names.size() - 1));
        System.out.println("Index of 'Diana': " + names.indexOf("Diana"));
        System.out.println("Last index of 'Charlie': " + names.lastIndexOf("Charlie"));
        
        // Modifying elements
        names.set(1, "Updated Charlie");
        System.out.println("After update: " + names);
        
        // Removing elements
        names.remove("Eve");           // Remove by object
        names.remove(0);               // Remove by index
        System.out.println("After removals: " + names);
    }
    
    public static void demonstrateArrayListIteration() {
        System.out.println("\n=== ArrayList Iteration Methods ===");
        
        ArrayList<Integer> numbers = new ArrayList<>(Arrays.asList(1, 2, 3, 4, 5));
        
        // 1. Traditional for loop
        System.out.print("Traditional for: ");
        for (int i = 0; i < numbers.size(); i++) {
            System.out.print(numbers.get(i) + " ");
        }
        System.out.println();
        
        // 2. Enhanced for loop (for-each)
        System.out.print("Enhanced for: ");
        for (Integer num : numbers) {
            System.out.print(num + " ");
        }
        System.out.println();
        
        // 3. Iterator
        System.out.print("Iterator: ");
        Iterator<Integer> iterator = numbers.iterator();
        while (iterator.hasNext()) {
            System.out.print(iterator.next() + " ");
        }
        System.out.println();
        
        // 4. ListIterator (bidirectional)
        System.out.print("ListIterator (reverse): ");
        ListIterator<Integer> listIterator = numbers.listIterator(numbers.size());
        while (listIterator.hasPrevious()) {
            System.out.print(listIterator.previous() + " ");
        }
        System.out.println();
        
        // 5. Stream API
        System.out.print("Stream API: ");
        numbers.stream().forEach(num -> System.out.print(num + " "));
        System.out.println();
        
        // 6. Method reference
        System.out.print("Method reference: ");
        numbers.forEach(System.out::print);
        numbers.forEach(num -> System.out.print(" "));
        System.out.println();
    }
    
    public static void demonstrateArrayListOperations() {
        System.out.println("\n=== ArrayList Advanced Operations ===");
        
        ArrayList<String> words = new ArrayList<>(Arrays.asList("apple", "banana", "cherry", "date", "elderberry"));
        
        // Sublist operations
        List<String> subWords = words.subList(1, 4);
        System.out.println("Original: " + words);
        System.out.println("Sublist [1,4): " + subWords);
        
        // Modifying sublist affects original
        subWords.set(0, "BANANA");
        System.out.println("After sublist modification: " + words);
        
        // Sorting
        ArrayList<String> sortedWords = new ArrayList<>(words);
        Collections.sort(sortedWords);
        System.out.println("Sorted: " + sortedWords);
        
        // Reverse sorting
        Collections.sort(sortedWords, Collections.reverseOrder());
        System.out.println("Reverse sorted: " + sortedWords);
        
        // Searching (binary search requires sorted list)
        Collections.sort(words);
        int index = Collections.binarySearch(words, "cherry");
        System.out.println("Binary search for 'cherry': " + index);
        
        // Shuffling
        Collections.shuffle(words);
        System.out.println("Shuffled: " + words);
        
        // Converting to array
        String[] wordArray = words.toArray(new String[0]);
        System.out.println("As array: " + Arrays.toString(wordArray));
    }
    
    // Performance characteristics demo
    public static void demonstrateArrayListPerformance() {
        System.out.println("\n=== ArrayList Performance Characteristics ===");
        
        ArrayList<Integer> list = new ArrayList<>();
        
        // Adding elements - O(1) amortized
        long startTime = System.nanoTime();
        for (int i = 0; i < 100000; i++) {
            list.add(i);
        }
        long addTime = System.nanoTime() - startTime;
        
        // Random access - O(1)
        startTime = System.nanoTime();
        for (int i = 0; i < 10000; i++) {
            int randomIndex = (int) (Math.random() * list.size());
            list.get(randomIndex);
        }
        long accessTime = System.nanoTime() - startTime;
        
        // Insertion at beginning - O(n)
        startTime = System.nanoTime();
        for (int i = 0; i < 1000; i++) {
            list.add(0, i);
        }
        long insertTime = System.nanoTime() - startTime;
        
        System.out.printf("Add 100k elements: %.2f ms%n", addTime / 1_000_000.0);
        System.out.printf("10k random access: %.2f ms%n", accessTime / 1_000_000.0);
        System.out.printf("1k insertions at start: %.2f ms%n", insertTime / 1_000_000.0);
    }
    
    public static void main(String[] args) {
        demonstrateArrayListBasics();
        demonstrateArrayListIteration();
        demonstrateArrayListOperations();
        demonstrateArrayListPerformance();
    }
}
```

### LinkedList - Doubly Linked List Implementation

```java
import java.util.*;

public class LinkedListDemo {
    
    public static void demonstrateLinkedListBasics() {
        System.out.println("=== LinkedList Basics ===");
        
        LinkedList<String> linkedList = new LinkedList<>();
        
        // LinkedList-specific methods
        linkedList.addFirst("First");
        linkedList.addLast("Last");
        linkedList.add("Middle");
        
        System.out.println("LinkedList: " + linkedList);
        
        // Access first and last elements
        System.out.println("First element: " + linkedList.getFirst());
        System.out.println("Last element: " + linkedList.getLast());
        System.out.println("Peek first: " + linkedList.peekFirst());
        System.out.println("Peek last: " + linkedList.peekLast());
        
        // Remove first and last elements
        String removedFirst = linkedList.removeFirst();
        String removedLast = linkedList.removeLast();
        
        System.out.println("Removed first: " + removedFirst);
        System.out.println("Removed last: " + removedLast);
        System.out.println("After removals: " + linkedList);
    }
    
    public static void demonstrateLinkedListAsQueue() {
        System.out.println("\n=== LinkedList as Queue ===");
        
        Queue<String> queue = new LinkedList<>();
        
        // Enqueue operations
        queue.offer("Task 1");
        queue.offer("Task 2");
        queue.offer("Task 3");
        
        System.out.println("Queue: " + queue);
        
        // Process queue
        while (!queue.isEmpty()) {
            String task = queue.poll();
            System.out.println("Processing: " + task);
        }
        
        System.out.println("Queue after processing: " + queue);
    }
    
    public static void demonstrateLinkedListAsDeque() {
        System.out.println("\n=== LinkedList as Deque (Double-ended Queue) ===");
        
        Deque<Integer> deque = new LinkedList<>();
        
        // Add to both ends
        deque.addFirst(2);
        deque.addLast(3);
        deque.addFirst(1);
        deque.addLast(4);
        
        System.out.println("Deque: " + deque);
        
        // Remove from both ends
        System.out.println("Remove first: " + deque.removeFirst());
        System.out.println("Remove last: " + deque.removeLast());
        System.out.println("Deque after removals: " + deque);
        
        // Use as stack (LIFO)
        System.out.println("\nUsing as Stack:");
        Deque<String> stack = new LinkedList<>();
        stack.push("Bottom");
        stack.push("Middle");
        stack.push("Top");
        
        System.out.println("Stack: " + stack);
        while (!stack.isEmpty()) {
            System.out.println("Pop: " + stack.pop());
        }
    }
    
    // Performance comparison with ArrayList
    public static void compareWithArrayList() {
        System.out.println("\n=== LinkedList vs ArrayList Performance ===");
        
        int size = 100000;
        
        // Test 1: Adding elements at the end
        long startTime = System.nanoTime();
        ArrayList<Integer> arrayList = new ArrayList<>();
        for (int i = 0; i < size; i++) {
            arrayList.add(i);
        }
        long arrayListAddTime = System.nanoTime() - startTime;
        
        startTime = System.nanoTime();
        LinkedList<Integer> linkedList = new LinkedList<>();
        for (int i = 0; i < size; i++) {
            linkedList.add(i);
        }
        long linkedListAddTime = System.nanoTime() - startTime;
        
        // Test 2: Random access
        startTime = System.nanoTime();
        for (int i = 0; i < 10000; i++) {
            int randomIndex = (int) (Math.random() * arrayList.size());
            arrayList.get(randomIndex);
        }
        long arrayListAccessTime = System.nanoTime() - startTime;
        
        startTime = System.nanoTime();
        for (int i = 0; i < 10000; i++) {
            int randomIndex = (int) (Math.random() * linkedList.size());
            linkedList.get(randomIndex);
        }
        long linkedListAccessTime = System.nanoTime() - startTime;
        
        // Test 3: Insertion at beginning
        startTime = System.nanoTime();
        for (int i = 0; i < 1000; i++) {
            arrayList.add(0, i);
        }
        long arrayListInsertTime = System.nanoTime() - startTime;
        
        startTime = System.nanoTime();
        for (int i = 0; i < 1000; i++) {
            linkedList.add(0, i);
        }
        long linkedListInsertTime = System.nanoTime() - startTime;
        
        System.out.println("Performance Comparison (times in ms):");
        System.out.printf("%-20s %-10s %-10s%n", "Operation", "ArrayList", "LinkedList");
        System.out.printf("%-20s %-10.2f %-10.2f%n", "Add " + size + " elements", 
                         arrayListAddTime / 1_000_000.0, linkedListAddTime / 1_000_000.0);
        System.out.printf("%-20s %-10.2f %-10.2f%n", "10k random access", 
                         arrayListAccessTime / 1_000_000.0, linkedListAccessTime / 1_000_000.0);
        System.out.printf("%-20s %-10.2f %-10.2f%n", "1k insert at start", 
                         arrayListInsertTime / 1_000_000.0, linkedListInsertTime / 1_000_000.0);
    }
    
    public static void main(String[] args) {
        demonstrateLinkedListBasics();
        demonstrateLinkedListAsQueue();
        demonstrateLinkedListAsDeque();
        compareWithArrayList();
    }
}
```

## Set Interface and Implementations

### HashSet, LinkedHashSet, and TreeSet

```java
import java.util.*;

public class SetDemo {
    
    public static void demonstrateHashSet() {
        System.out.println("=== HashSet Demo ===");
        
        // HashSet - no duplicates, no guaranteed order
        HashSet<String> hashSet = new HashSet<>();
        
        hashSet.add("apple");
        hashSet.add("banana");
        hashSet.add("cherry");
        hashSet.add("apple"); // Duplicate - won't be added
        
        System.out.println("HashSet: " + hashSet);
        System.out.println("Size: " + hashSet.size());
        System.out.println("Contains 'banana': " + hashSet.contains("banana"));
        
        // Adding collection
        hashSet.addAll(Arrays.asList("date", "elderberry", "fig"));
        System.out.println("After adding collection: " + hashSet);
        
        // Remove elements
        hashSet.remove("apple");
        System.out.println("After removing 'apple': " + hashSet);
        
        // Iteration (order not guaranteed)
        System.out.print("Iteration order: ");
        for (String fruit : hashSet) {
            System.out.print(fruit + " ");
        }
        System.out.println();
    }
    
    public static void demonstrateLinkedHashSet() {
        System.out.println("\n=== LinkedHashSet Demo ===");
        
        // LinkedHashSet - no duplicates, maintains insertion order
        LinkedHashSet<String> linkedHashSet = new LinkedHashSet<>();
        
        linkedHashSet.add("first");
        linkedHashSet.add("second");
        linkedHashSet.add("third");
        linkedHashSet.add("first"); // Duplicate - won't be added
        linkedHashSet.add("fourth");
        
        System.out.println("LinkedHashSet: " + linkedHashSet);
        
        // Maintains insertion order
        System.out.print("Insertion order maintained: ");
        for (String item : linkedHashSet) {
            System.out.print(item + " ");
        }
        System.out.println();
        
        // Performance comparison
        Set<Integer> hashSet = new HashSet<>();
        Set<Integer> linkedHashSet2 = new LinkedHashSet<>();
        
        long startTime = System.nanoTime();
        for (int i = 0; i < 100000; i++) {
            hashSet.add(i);
        }
        long hashSetTime = System.nanoTime() - startTime;
        
        startTime = System.nanoTime();
        for (int i = 0; i < 100000; i++) {
            linkedHashSet2.add(i);
        }
        long linkedHashSetTime = System.nanoTime() - startTime;
        
        System.out.printf("HashSet add time: %.2f ms%n", hashSetTime / 1_000_000.0);
        System.out.printf("LinkedHashSet add time: %.2f ms%n", linkedHashSetTime / 1_000_000.0);
    }
    
    public static void demonstrateTreeSet() {
        System.out.println("\n=== TreeSet Demo ===");
        
        // TreeSet - no duplicates, maintains sorted order
        TreeSet<String> treeSet = new TreeSet<>();
        
        treeSet.add("zebra");
        treeSet.add("apple");
        treeSet.add("monkey");
        treeSet.add("banana");
        treeSet.add("apple"); // Duplicate - won't be added
        
        System.out.println("TreeSet (sorted): " + treeSet);
        
        // TreeSet specific methods
        System.out.println("First element: " + treeSet.first());
        System.out.println("Last element: " + treeSet.last());
        System.out.println("Lower than 'monkey': " + treeSet.lower("monkey"));
        System.out.println("Higher than 'banana': " + treeSet.higher("banana"));
        
        // Subset operations
        SortedSet<String> headSet = treeSet.headSet("monkey");
        SortedSet<String> tailSet = treeSet.tailSet("monkey");
        SortedSet<String> subSet = treeSet.subSet("banana", "zebra");
        
        System.out.println("Head set (< 'monkey'): " + headSet);
        System.out.println("Tail set (>= 'monkey'): " + tailSet);
        System.out.println("Sub set ['banana', 'zebra'): " + subSet);
        
        // Custom sorting with Comparator
        TreeSet<String> lengthSortedSet = new TreeSet<>(Comparator.comparing(String::length));
        lengthSortedSet.addAll(Arrays.asList("a", "bb", "ccc", "dddd", "ee"));
        System.out.println("Sorted by length: " + lengthSortedSet);
        
        // Reverse order
        TreeSet<Integer> reverseSet = new TreeSet<>(Collections.reverseOrder());
        reverseSet.addAll(Arrays.asList(5, 2, 8, 1, 9, 3));
        System.out.println("Reverse order: " + reverseSet);
    }
    
    public static void demonstrateSetOperations() {
        System.out.println("\n=== Set Operations (Mathematical) ===");
        
        Set<Integer> set1 = new HashSet<>(Arrays.asList(1, 2, 3, 4, 5));
        Set<Integer> set2 = new HashSet<>(Arrays.asList(4, 5, 6, 7, 8));
        
        System.out.println("Set 1: " + set1);
        System.out.println("Set 2: " + set2);
        
        // Union
        Set<Integer> union = new HashSet<>(set1);
        union.addAll(set2);
        System.out.println("Union (set1 ∪ set2): " + union);
        
        // Intersection
        Set<Integer> intersection = new HashSet<>(set1);
        intersection.retainAll(set2);
        System.out.println("Intersection (set1 ∩ set2): " + intersection);
        
        // Difference
        Set<Integer> difference = new HashSet<>(set1);
        difference.removeAll(set2);
        System.out.println("Difference (set1 - set2): " + difference);
        
        // Symmetric difference
        Set<Integer> symmetricDiff = new HashSet<>(union);
        symmetricDiff.removeAll(intersection);
        System.out.println("Symmetric difference: " + symmetricDiff);
        
        // Subset check
        Set<Integer> subset = new HashSet<>(Arrays.asList(2, 3));
        System.out.println("Is {2, 3} subset of set1: " + set1.containsAll(subset));
    }
    
    // Custom object in Set
    static class Person {
        private String name;
        private int age;
        
        public Person(String name, int age) {
            this.name = name;
            this.age = age;
        }
        
        // Important: Override equals and hashCode for proper Set behavior
        @Override
        public boolean equals(Object obj) {
            if (this == obj) return true;
            if (obj == null || getClass() != obj.getClass()) return false;
            Person person = (Person) obj;
            return age == person.age && Objects.equals(name, person.name);
        }
        
        @Override
        public int hashCode() {
            return Objects.hash(name, age);
        }
        
        @Override
        public String toString() {
            return name + "(" + age + ")";
        }
        
        // For TreeSet natural ordering
        public String getName() { return name; }
        public int getAge() { return age; }
    }
    
    public static void demonstrateCustomObjectsInSet() {
        System.out.println("\n=== Custom Objects in Set ===");
        
        Set<Person> people = new HashSet<>();
        people.add(new Person("Alice", 25));
        people.add(new Person("Bob", 30));
        people.add(new Person("Alice", 25)); // Duplicate based on equals()
        people.add(new Person("Charlie", 35));
        
        System.out.println("HashSet of people: " + people);
        System.out.println("Size: " + people.size()); // Should be 3, not 4
        
        // TreeSet with custom comparator
        Set<Person> sortedPeople = new TreeSet<>(Comparator.comparing(Person::getName));
        sortedPeople.addAll(people);
        System.out.println("TreeSet sorted by name: " + sortedPeople);
        
        // TreeSet sorted by age
        Set<Person> ageSortedPeople = new TreeSet<>(Comparator.comparingInt(Person::getAge));
        ageSortedPeople.addAll(people);
        System.out.println("TreeSet sorted by age: " + ageSortedPeople);
    }
    
    public static void main(String[] args) {
        demonstrateHashSet();
        demonstrateLinkedHashSet();
        demonstrateTreeSet();
        demonstrateSetOperations();
        demonstrateCustomObjectsInSet();
    }
}
```

## Map Interface and Implementations

### HashMap, LinkedHashMap, and TreeMap

```java
import java.util.*;

public class MapDemo {
    
    public static void demonstrateHashMap() {
        System.out.println("=== HashMap Demo ===");
        
        // HashMap - key-value pairs, no guaranteed order
        HashMap<String, Integer> scores = new HashMap<>();
        
        // Adding entries
        scores.put("Alice", 95);
        scores.put("Bob", 87);
        scores.put("Charlie", 92);
        scores.put("Diana", 98);
        
        System.out.println("HashMap: " + scores);
        
        // Accessing values
        System.out.println("Alice's score: " + scores.get("Alice"));
        System.out.println("Eve's score: " + scores.get("Eve")); // null for non-existent key
        System.out.println("Eve's score (with default): " + scores.getOrDefault("Eve", 0));
        
        // Checking keys and values
        System.out.println("Contains key 'Bob': " + scores.containsKey("Bob"));
        System.out.println("Contains value 95: " + scores.containsValue(95));
        
        // Updating values
        scores.put("Alice", 97); // Overwrites existing value
        scores.putIfAbsent("Eve", 85); // Only adds if key doesn't exist
        
        System.out.println("After updates: " + scores);
        
        // Removing entries
        scores.remove("Bob");
        boolean removed = scores.remove("Charlie", 92); // Remove only if key-value pair matches
        System.out.println("Removed Charlie with score 92: " + removed);
        System.out.println("After removals: " + scores);
        
        // Compute operations (Java 8+)
        scores.compute("Alice", (key, value) -> value + 5); // Alice: 97 -> 102
        scores.computeIfAbsent("Frank", key -> 80); // Add Frank if not present
        scores.computeIfPresent("Diana", (key, value) -> value + 2); // Diana: 98 -> 100
        
        System.out.println("After compute operations: " + scores);
        
        // Merge operation
        scores.merge("Alice", 10, Integer::sum); // Alice: 102 + 10 = 112
        System.out.println("After merge: " + scores);
    }
    
    public static void demonstrateMapIteration() {
        System.out.println("\n=== Map Iteration Methods ===");
        
        Map<String, Integer> map = new HashMap<>();
        map.put("apple", 5);
        map.put("banana", 3);
        map.put("cherry", 8);
        
        // 1. Iterate over keys
        System.out.println("Keys:");
        for (String key : map.keySet()) {
            System.out.println("  " + key + " -> " + map.get(key));
        }
        
        // 2. Iterate over values
        System.out.println("Values:");
        for (Integer value : map.values()) {
            System.out.println("  " + value);
        }
        
        // 3. Iterate over entries
        System.out.println("Entries:");
        for (Map.Entry<String, Integer> entry : map.entrySet()) {
            System.out.println("  " + entry.getKey() + " = " + entry.getValue());
        }
        
        // 4. Java 8 forEach
        System.out.println("forEach with lambda:");
        map.forEach((key, value) -> System.out.println("  " + key + ": " + value));
        
        // 5. Stream API
        System.out.println("Stream API:");
        map.entrySet().stream()
           .sorted(Map.Entry.comparingByValue())
           .forEach(entry -> System.out.println("  " + entry.getKey() + " = " + entry.getValue()));
    }
    
    public static void demonstrateLinkedHashMap() {
        System.out.println("\n=== LinkedHashMap Demo ===");
        
        // LinkedHashMap - maintains insertion order
        LinkedHashMap<String, String> insertionOrder = new LinkedHashMap<>();
        insertionOrder.put("first", "1st");
        insertionOrder.put("third", "3rd");
        insertionOrder.put("second", "2nd");
        insertionOrder.put("fourth", "4th");
        
        System.out.println("LinkedHashMap (insertion order): " + insertionOrder);
        
        // LinkedHashMap with access order (LRU cache behavior)
        LinkedHashMap<String, String> accessOrder = new LinkedHashMap<>(16, 0.75f, true);
        accessOrder.put("A", "First");
        accessOrder.put("B", "Second");
        accessOrder.put("C", "Third");
        
        System.out.println("Before access: " + accessOrder);
        accessOrder.get("A"); // Access A, moves it to end
        System.out.println("After accessing A: " + accessOrder);
        
        // LRU Cache implementation
        LRUCache<String, String> lruCache = new LRUCache<>(3);
        lruCache.put("1", "One");
        lruCache.put("2", "Two");
        lruCache.put("3", "Three");
        System.out.println("LRU Cache: " + lruCache);
        
        lruCache.put("4", "Four"); // Should evict oldest entry
        System.out.println("After adding 4th item: " + lruCache);
    }
    
    // Simple LRU Cache implementation
    static class LRUCache<K, V> extends LinkedHashMap<K, V> {
        private final int maxSize;
        
        public LRUCache(int maxSize) {
            super(16, 0.75f, true); // access-order
            this.maxSize = maxSize;
        }
        
        @Override
        protected boolean removeEldestEntry(Map.Entry<K, V> eldest) {
            return size() > maxSize;
        }
    }
    
    public static void demonstrateTreeMap() {
        System.out.println("\n=== TreeMap Demo ===");
        
        // TreeMap - sorted by keys
        TreeMap<String, Double> prices = new TreeMap<>();
        prices.put("Apple", 1.50);
        prices.put("Banana", 0.80);
        prices.put("Cherry", 3.20);
        prices.put("Date", 2.10);
        
        System.out.println("TreeMap (sorted by key): " + prices);
        
        // TreeMap specific methods
        System.out.println("First key: " + prices.firstKey());
        System.out.println("Last key: " + prices.lastKey());
        System.out.println("Lower key than 'Cherry': " + prices.lowerKey("Cherry"));
        System.out.println("Higher key than 'Banana': " + prices.higherKey("Banana"));
        
        // Subset operations
        SortedMap<String, Double> headMap = prices.headMap("Cherry");
        SortedMap<String, Double> tailMap = prices.tailMap("Cherry");
        SortedMap<String, Double> subMap = prices.subMap("Banana", "Date");
        
        System.out.println("Head map (< 'Cherry'): " + headMap);
        System.out.println("Tail map (>= 'Cherry'): " + tailMap);
        System.out.println("Sub map ['Banana', 'Date'): " + subMap);
        
        // Custom comparator (reverse order)
        TreeMap<String, Double> reversePrices = new TreeMap<>(Collections.reverseOrder());
        reversePrices.putAll(prices);
        System.out.println("Reverse order TreeMap: " + reversePrices);
        
        // TreeMap with custom objects
        TreeMap<Person, String> personRoles = new TreeMap<>(Comparator.comparing(Person::getName));
        personRoles.put(new Person("Alice", 30), "Manager");
        personRoles.put(new Person("Bob", 25), "Developer");
        personRoles.put(new Person("Charlie", 35), "Architect");
        
        System.out.println("TreeMap with custom objects: " + personRoles);
    }
    
    static class Person {
        private String name;
        private int age;
        
        public Person(String name, int age) {
            this.name = name;
            this.age = age;
        }
        
        public String getName() { return name; }
        public int getAge() { return age; }
        
        @Override
        public String toString() {
            return name + "(" + age + ")";
        }
        
        @Override
        public boolean equals(Object obj) {
            if (this == obj) return true;
            if (obj == null || getClass() != obj.getClass()) return false;
            Person person = (Person) obj;
            return age == person.age && Objects.equals(name, person.name);
        }
        
        @Override
        public int hashCode() {
            return Objects.hash(name, age);
        }
    }
    
    public static void demonstrateMapPerformance() {
        System.out.println("\n=== Map Performance Comparison ===");
        
        int size = 100000;
        
        // HashMap performance
        long startTime = System.nanoTime();
        Map<Integer, String> hashMap = new HashMap<>();
        for (int i = 0; i < size; i++) {
            hashMap.put(i, "value" + i);
        }
        long hashMapPutTime = System.nanoTime() - startTime;
        
        // TreeMap performance
        startTime = System.nanoTime();
        Map<Integer, String> treeMap = new TreeMap<>();
        for (int i = 0; i < size; i++) {
            treeMap.put(i, "value" + i);
        }
        long treeMapPutTime = System.nanoTime() - startTime;
        
        // Get performance
        startTime = System.nanoTime();
        for (int i = 0; i < 10000; i++) {
            hashMap.get(i);
        }
        long hashMapGetTime = System.nanoTime() - startTime;
        
        startTime = System.nanoTime();
        for (int i = 0; i < 10000; i++) {
            treeMap.get(i);
        }
        long treeMapGetTime = System.nanoTime() - startTime;
        
        System.out.printf("Performance (times in ms):%n");
        System.out.printf("%-15s %-10s %-10s%n", "Operation", "HashMap", "TreeMap");
        System.out.printf("%-15s %-10.2f %-10.2f%n", "Put " + size, 
                         hashMapPutTime / 1_000_000.0, treeMapPutTime / 1_000_000.0);
        System.out.printf("%-15s %-10.2f %-10.2f%n", "Get 10k", 
                         hashMapGetTime / 1_000_000.0, treeMapGetTime / 1_000_000.0);
    }
    
    public static void main(String[] args) {
        demonstrateHashMap();
        demonstrateMapIteration();
        demonstrateLinkedHashMap();
        demonstrateTreeMap();
        demonstrateMapPerformance();
    }
}
```

## Advanced Collection Operations

### Utility Classes and Algorithms

```java
import java.util.*;

public class CollectionUtilities {
    
    public static void demonstrateCollectionsUtilities() {
        System.out.println("=== Collections Utility Class ===");
        
        List<String> names = new ArrayList<>(Arrays.asList("Charlie", "Alice", "Bob", "Diana"));
        System.out.println("Original list: " + names);
        
        // Sorting
        Collections.sort(names);
        System.out.println("Sorted: " + names);
        
        Collections.sort(names, Collections.reverseOrder());
        System.out.println("Reverse sorted: " + names);
        
        Collections.sort(names, Comparator.comparing(String::length));
        System.out.println("Sorted by length: " + names);
        
        // Shuffling
        Collections.shuffle(names);
        System.out.println("Shuffled: " + names);
        
        // Searching (requires sorted list)
        Collections.sort(names);
        int index = Collections.binarySearch(names, "Bob");
        System.out.println("Binary search for 'Bob': " + index);
        
        // Min and Max
        System.out.println("Min: " + Collections.min(names));
        System.out.println("Max: " + Collections.max(names));
        System.out.println("Min by length: " + Collections.min(names, Comparator.comparing(String::length)));
        
        // Frequency
        names.add("Alice"); // Add duplicate
        System.out.println("Frequency of 'Alice': " + Collections.frequency(names, "Alice"));
        
        // Rotating
        Collections.rotate(names, 2);
        System.out.println("Rotated by 2: " + names);
        
        // Filling
        List<String> fillList = new ArrayList<>(Collections.nCopies(5, "default"));
        System.out.println("Filled list: " + fillList);
        Collections.fill(fillList, "updated");
        System.out.println("After fill: " + fillList);
        
        // Reversing
        Collections.reverse(names);
        System.out.println("Reversed: " + names);
    }
    
    public static void demonstrateArraysUtilities() {
        System.out.println("\n=== Arrays Utility Class ===");
        
        // Array creation and manipulation
        int[] numbers = {5, 2, 8, 1, 9, 3};
        System.out.println("Original array: " + Arrays.toString(numbers));
        
        // Sorting
        int[] sortedNumbers = Arrays.copyOf(numbers, numbers.length);
        Arrays.sort(sortedNumbers);
        System.out.println("Sorted: " + Arrays.toString(sortedNumbers));
        
        // Partial sorting
        int[] partialSort = Arrays.copyOf(numbers, numbers.length);
        Arrays.sort(partialSort, 1, 4); // Sort elements at indices 1-3
        System.out.println("Partial sort [1,4): " + Arrays.toString(partialSort));
        
        // Binary search
        int searchIndex = Arrays.binarySearch(sortedNumbers, 5);
        System.out.println("Binary search for 5: " + searchIndex);
        
        // Filling
        int[] fillArray = new int[5];
        Arrays.fill(fillArray, 42);
        System.out.println("Filled array: " + Arrays.toString(fillArray));
        
        // Equality
        int[] array1 = {1, 2, 3};
        int[] array2 = {1, 2, 3};
        int[] array3 = {1, 2, 4};
        
        System.out.println("Arrays equal (array1, array2): " + Arrays.equals(array1, array2));
        System.out.println("Arrays equal (array1, array3): " + Arrays.equals(array1, array3));
        
        // Convert array to list
        String[] stringArray = {"a", "b", "c"};
        List<String> listFromArray = Arrays.asList(stringArray);
        System.out.println("List from array: " + listFromArray);
        
        // Note: Arrays.asList returns fixed-size list
        try {
            listFromArray.add("d"); // This will throw UnsupportedOperationException
        } catch (UnsupportedOperationException e) {
            System.out.println("Cannot add to Arrays.asList result: " + e.getMessage());
        }
        
        // To get modifiable list
        List<String> modifiableList = new ArrayList<>(Arrays.asList(stringArray));
        modifiableList.add("d");
        System.out.println("Modifiable list: " + modifiableList);
    }
    
    public static void demonstrateImmutableCollections() {
        System.out.println("\n=== Immutable Collections ===");
        
        // Java 9+ factory methods
        List<String> immutableList = List.of("a", "b", "c");
        Set<String> immutableSet = Set.of("x", "y", "z");
        Map<String, Integer> immutableMap = Map.of("one", 1, "two", 2, "three", 3);
        
        System.out.println("Immutable list: " + immutableList);
        System.out.println("Immutable set: " + immutableSet);
        System.out.println("Immutable map: " + immutableMap);
        
        // These collections are truly immutable
        try {
            immutableList.add("d");
        } catch (UnsupportedOperationException e) {
            System.out.println("Cannot modify immutable list: " + e.getMessage());
        }
        
        // Collections.unmodifiableXxx() methods (Java 1.2+)
        List<String> mutableList = new ArrayList<>(Arrays.asList("a", "b", "c"));
        List<String> unmodifiableView = Collections.unmodifiableList(mutableList);
        
        System.out.println("Unmodifiable view: " + unmodifiableView);
        
        // The view reflects changes to the original
        mutableList.add("d");
        System.out.println("After modifying original: " + unmodifiableView);
        
        // But the view itself cannot be modified
        try {
            unmodifiableView.add("e");
        } catch (UnsupportedOperationException e) {
            System.out.println("Cannot modify unmodifiable view: " + e.getMessage());
        }
        
        // Empty collections
        List<String> emptyList = Collections.emptyList();
        Set<String> emptySet = Collections.emptySet();
        Map<String, String> emptyMap = Collections.emptyMap();
        
        System.out.println("Empty collections - List: " + emptyList + ", Set: " + emptySet + ", Map: " + emptyMap);
        
        // Singleton collections
        List<String> singletonList = Collections.singletonList("only");
        Set<String> singletonSet = Collections.singleton("only");
        Map<String, String> singletonMap = Collections.singletonMap("key", "value");
        
        System.out.println("Singleton collections - List: " + singletonList + ", Set: " + singletonSet + ", Map: " + singletonMap);
    }
    
    public static void demonstrateSynchronizedCollections() {
        System.out.println("\n=== Synchronized Collections ===");
        
        // Create synchronized collections
        List<String> syncList = Collections.synchronizedList(new ArrayList<>());
        Set<String> syncSet = Collections.synchronizedSet(new HashSet<>());
        Map<String, String> syncMap = Collections.synchronizedMap(new HashMap<>());
        
        // Add some data
        syncList.addAll(Arrays.asList("a", "b", "c"));
        syncSet.addAll(Arrays.asList("x", "y", "z"));
        syncMap.put("key1", "value1");
        syncMap.put("key2", "value2");
        
        System.out.println("Synchronized list: " + syncList);
        System.out.println("Synchronized set: " + syncSet);
        System.out.println("Synchronized map: " + syncMap);
        
        // Important: Iteration still requires external synchronization
        synchronized (syncList) {
            Iterator<String> iterator = syncList.iterator();
            while (iterator.hasNext()) {
                System.out.println("Synchronized iteration: " + iterator.next());
            }
        }
        
        // Modern approach: Use concurrent collections instead
        List<String> concurrentList = new ArrayList<>(); // For lists, use explicit locking or CopyOnWriteArrayList
        Set<String> concurrentSet = ConcurrentHashMap.newKeySet();
        Map<String, String> concurrentMap = new java.util.concurrent.ConcurrentHashMap<>();
        
        System.out.println("Concurrent collections are generally preferred for thread-safety");
    }
    
    public static void main(String[] args) {
        demonstrateCollectionsUtilities();
        demonstrateArraysUtilities();
        demonstrateImmutableCollections();
        demonstrateSynchronizedCollections();
    }
}
```

## Collection Performance and Best Practices

### Choosing the Right Collection

```java
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

public class CollectionBestPractices {
    
    public static void demonstrateCollectionChoiceGuidelines() {
        System.out.println("=== Collection Choice Guidelines ===");
        
        System.out.println("List implementations:");
        System.out.println("- ArrayList: Best for random access, iteration, and when you add mostly at the end");
        System.out.println("- LinkedList: Best for frequent insertion/deletion in the middle, use as Queue/Deque");
        System.out.println("- Vector: Legacy, synchronized, generally avoid in favor of ArrayList");
        
        System.out.println("\nSet implementations:");
        System.out.println("- HashSet: Best general-purpose Set, O(1) operations");
        System.out.println("- LinkedHashSet: When you need insertion order preservation");
        System.out.println("- TreeSet: When you need sorted elements and navigation operations");
        
        System.out.println("\nMap implementations:");
        System.out.println("- HashMap: Best general-purpose Map, O(1) operations");
        System.out.println("- LinkedHashMap: When you need insertion/access order preservation");
        System.out.println("- TreeMap: When you need sorted keys and navigation operations");
        System.out.println("- ConcurrentHashMap: Thread-safe alternative to HashMap");
    }
    
    public static void demonstratePerformanceConsiderations() {
        System.out.println("\n=== Performance Considerations ===");
        
        // Initial capacity matters for HashMap/HashSet
        long startTime = System.nanoTime();
        Map<Integer, String> defaultCapacityMap = new HashMap<>();
        for (int i = 0; i < 100000; i++) {
            defaultCapacityMap.put(i, "value" + i);
        }
        long defaultTime = System.nanoTime() - startTime;
        
        startTime = System.nanoTime();
        Map<Integer, String> properCapacityMap = new HashMap<>(150000); // Avoid resizing
        for (int i = 0; i < 100000; i++) {
            properCapacityMap.put(i, "value" + i);
        }
        long properTime = System.nanoTime() - startTime;
        
        System.out.printf("HashMap with default capacity: %.2f ms%n", defaultTime / 1_000_000.0);
        System.out.printf("HashMap with proper capacity: %.2f ms%n", properTime / 1_000_000.0);
        System.out.printf("Performance improvement: %.1fx%n", (double) defaultTime / properTime);
        
        // ArrayList vs LinkedList for different operations
        demonstrateListPerformance();
    }
    
    private static void demonstrateListPerformance() {
        System.out.println("\n--- List Performance Comparison ---");
        
        int size = 50000;
        
        // ArrayList vs LinkedList for adding at end
        long startTime = System.nanoTime();
        List<Integer> arrayList = new ArrayList<>();
        for (int i = 0; i < size; i++) {
            arrayList.add(i);
        }
        long arrayListAddTime = System.nanoTime() - startTime;
        
        startTime = System.nanoTime();
        List<Integer> linkedList = new LinkedList<>();
        for (int i = 0; i < size; i++) {
            linkedList.add(i);
        }
        long linkedListAddTime = System.nanoTime() - startTime;
        
        // Random access performance
        Random random = new Random();
        startTime = System.nanoTime();
        for (int i = 0; i < 10000; i++) {
            arrayList.get(random.nextInt(arrayList.size()));
        }
        long arrayListGetTime = System.nanoTime() - startTime;
        
        startTime = System.nanoTime();
        for (int i = 0; i < 10000; i++) {
            linkedList.get(random.nextInt(linkedList.size()));
        }
        long linkedListGetTime = System.nanoTime() - startTime;
        
        System.out.printf("Adding %d elements:%n", size);
        System.out.printf("  ArrayList: %.2f ms%n", arrayListAddTime / 1_000_000.0);
        System.out.printf("  LinkedList: %.2f ms%n", linkedListAddTime / 1_000_000.0);
        
        System.out.printf("10k random access:%n");
        System.out.printf("  ArrayList: %.2f ms%n", arrayListGetTime / 1_000_000.0);
        System.out.printf("  LinkedList: %.2f ms%n", linkedListGetTime / 1_000_000.0);
    }
    
    public static void demonstrateCommonPitfalls() {
        System.out.println("\n=== Common Pitfalls and Solutions ===");
        
        // Pitfall 1: Modifying collection during iteration
        System.out.println("1. Modifying collection during iteration:");
        List<String> list = new ArrayList<>(Arrays.asList("a", "b", "c", "d"));
        
        // ❌ BAD: This will throw ConcurrentModificationException
        try {
            for (String item : list) {
                if (item.equals("b")) {
                    list.remove(item); // Don't do this!
                }
            }
        } catch (ConcurrentModificationException e) {
            System.out.println("   ConcurrentModificationException caught!");
        }
        
        // ✅ GOOD: Use Iterator.remove()
        list = new ArrayList<>(Arrays.asList("a", "b", "c", "d"));
        Iterator<String> iterator = list.iterator();
        while (iterator.hasNext()) {
            String item = iterator.next();
            if (item.equals("b")) {
                iterator.remove(); // Safe removal
            }
        }
        System.out.println("   After safe removal: " + list);
        
        // ✅ BETTER: Use removeIf (Java 8+)
        list = new ArrayList<>(Arrays.asList("a", "b", "c", "d"));
        list.removeIf(item -> item.equals("b"));
        System.out.println("   Using removeIf: " + list);
        
        // Pitfall 2: Using == instead of equals() for objects
        System.out.println("\n2. Object comparison in collections:");
        List<String> stringList = new ArrayList<>();
        stringList.add(new String("hello"));
        stringList.add("world");
        
        String searchString = new String("hello");
        System.out.println("   Contains 'hello': " + stringList.contains(searchString)); // Uses equals()
        
        // Pitfall 3: Not overriding equals() and hashCode()
        System.out.println("\n3. Custom objects without proper equals/hashCode:");
        Set<BadPerson> badSet = new HashSet<>();
        badSet.add(new BadPerson("John"));
        badSet.add(new BadPerson("John")); // Should be same person, but will be added as different
        
        System.out.println("   Bad person set size: " + badSet.size()); // Will be 2, not 1
        
        Set<GoodPerson> goodSet = new HashSet<>();
        goodSet.add(new GoodPerson("John"));
        goodSet.add(new GoodPerson("John")); // Properly treated as same person
        
        System.out.println("   Good person set size: " + goodSet.size()); // Will be 1
        
        // Pitfall 4: Using raw types
        System.out.println("\n4. Raw types vs parameterized types:");
        
        // ❌ BAD: Raw type
        @SuppressWarnings("rawtypes")
        List rawList = new ArrayList();
        rawList.add("string");
        rawList.add(123); // No compile-time type checking
        
        // ✅ GOOD: Parameterized type
        List<String> typedList = new ArrayList<>();
        typedList.add("string");
        // typedList.add(123); // Compile error - type safety
        
        System.out.println("   Always use parameterized types for type safety");
    }
    
    // Bad example - no equals/hashCode override
    static class BadPerson {
        private String name;
        
        public BadPerson(String name) {
            this.name = name;
        }
        
        @Override
        public String toString() {
            return "BadPerson{name='" + name + "'}";
        }
    }
    
    // Good example - proper equals/hashCode override
    static class GoodPerson {
        private String name;
        
        public GoodPerson(String name) {
            this.name = name;
        }
        
        @Override
        public boolean equals(Object obj) {
            if (this == obj) return true;
            if (obj == null || getClass() != obj.getClass()) return false;
            GoodPerson that = (GoodPerson) obj;
            return Objects.equals(name, that.name);
        }
        
        @Override
        public int hashCode() {
            return Objects.hash(name);
        }
        
        @Override
        public String toString() {
            return "GoodPerson{name='" + name + "'}";
        }
    }
    
    public static void demonstrateMemoryEfficiency() {
        System.out.println("\n=== Memory Efficiency Tips ===");
        
        // 1. Use ArrayList.trimToSize() after bulk operations
        ArrayList<Integer> list = new ArrayList<>();
        for (int i = 0; i < 100000; i++) {
            list.add(i);
        }
        System.out.println("ArrayList capacity before trim: estimated ~" + (list.size() * 1.5));
        list.trimToSize();
        System.out.println("ArrayList capacity after trim: " + list.size());
        
        // 2. Use EnumSet for enum collections
        EnumSet<Day> weekdays = EnumSet.of(Day.MONDAY, Day.TUESDAY, Day.WEDNESDAY, Day.THURSDAY, Day.FRIDAY);
        System.out.println("EnumSet is more memory efficient than HashSet for enums: " + weekdays);
        
        // 3. Consider primitive collections for performance-critical code
        System.out.println("Consider primitive collections (e.g., Eclipse Collections, Trove) for better performance");
        
        // 4. Use Stream operations for complex transformations
        List<String> words = Arrays.asList("hello", "world", "java", "collections");
        List<String> upperCaseWords = words.stream()
            .map(String::toUpperCase)
            .filter(word -> word.length() > 4)
            .sorted()
            .collect(ArrayList::new, ArrayList::add, ArrayList::addAll);
        
        System.out.println("Stream processed words: " + upperCaseWords);
    }
    
    enum Day {
        MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY
    }
    
    public static void main(String[] args) {
        demonstrateCollectionChoiceGuidelines();
        demonstratePerformanceConsiderations();
        demonstrateCommonPitfalls();
        demonstrateMemoryEfficiency();
    }
}
```

## Practical Collections Applications

### Real-World Example: Student Management System

```java
import java.util.*;
import java.util.stream.Collectors;

public class StudentManagementSystem {
    
    // Student class with proper equals/hashCode
    static class Student {
        private final String studentId;
        private final String name;
        private final int age;
        private final String major;
        private final Map<String, Double> grades;
        
        public Student(String studentId, String name, int age, String major) {
            this.studentId = studentId;
            this.name = name;
            this.age = age;
            this.major = major;
            this.grades = new HashMap<>();
        }
        
        public void addGrade(String course, double grade) {
            grades.put(course, grade);
        }
        
        public double getGPA() {
            if (grades.isEmpty()) return 0.0;
            return grades.values().stream()
                         .mapToDouble(Double::doubleValue)
                         .average()
                         .orElse(0.0);
        }
        
        // Getters
        public String getStudentId() { return studentId; }
        public String getName() { return name; }
        public int getAge() { return age; }
        public String getMajor() { return major; }
        public Map<String, Double> getGrades() { return new HashMap<>(grades); }
        
        @Override
        public boolean equals(Object obj) {
            if (this == obj) return true;
            if (obj == null || getClass() != obj.getClass()) return false;
            Student student = (Student) obj;
            return Objects.equals(studentId, student.studentId);
        }
        
        @Override
        public int hashCode() {
            return Objects.hash(studentId);
        }
        
        @Override
        public String toString() {
            return String.format("Student{id='%s', name='%s', age=%d, major='%s', GPA=%.2f}", 
                               studentId, name, age, major, getGPA());
        }
    }
    
    // Course class
    static class Course {
        private final String courseId;
        private final String courseName;
        private final int credits;
        private final Set<String> enrolledStudents;
        
        public Course(String courseId, String courseName, int credits) {
            this.courseId = courseId;
            this.courseName = courseName;
            this.credits = credits;
            this.enrolledStudents = new HashSet<>();
        }
        
        public void enrollStudent(String studentId) {
            enrolledStudents.add(studentId);
        }
        
        public void dropStudent(String studentId) {
            enrolledStudents.remove(studentId);
        }
        
        // Getters
        public String getCourseId() { return courseId; }
        public String getCourseName() { return courseName; }
        public int getCredits() { return credits; }
        public Set<String> getEnrolledStudents() { return new HashSet<>(enrolledStudents); }
        
        @Override
        public boolean equals(Object obj) {
            if (this == obj) return true;
            if (obj == null || getClass() != obj.getClass()) return false;
            Course course = (Course) obj;
            return Objects.equals(courseId, course.courseId);
        }
        
        @Override
        public int hashCode() {
            return Objects.hash(courseId);
        }
        
        @Override
        public String toString() {
            return String.format("Course{id='%s', name='%s', credits=%d, enrolled=%d}", 
                               courseId, courseName, credits, enrolledStudents.size());
        }
    }
    
    // Main system class
    private final Map<String, Student> students;           // studentId -> Student
    private final Map<String, Course> courses;            // courseId -> Course
    private final Map<String, List<String>> majorToStudents; // major -> List of studentIds
    private final TreeMap<Double, List<Student>> gpaRanking; // GPA -> Students (sorted)
    
    public StudentManagementSystem() {
        this.students = new HashMap<>();
        this.courses = new HashMap<>();
        this.majorToStudents = new HashMap<>();
        this.gpaRanking = new TreeMap<>(Collections.reverseOrder()); // Highest GPA first
    }
    
    // Add student
    public void addStudent(Student student) {
        students.put(student.getStudentId(), student);
        
        // Update major index
        majorToStudents.computeIfAbsent(student.getMajor(), k -> new ArrayList<>())
                      .add(student.getStudentId());
        
        updateGPARanking(student);
        System.out.println("Added student: " + student);
    }
    
    // Add course
    public void addCourse(Course course) {
        courses.put(course.getCourseId(), course);
        System.out.println("Added course: " + course);
    }
    
    // Enroll student in course
    public boolean enrollStudent(String studentId, String courseId) {
        Student student = students.get(studentId);
        Course course = courses.get(courseId);
        
        if (student == null || course == null) {
            System.out.println("Student or course not found");
            return false;
        }
        
        course.enrollStudent(studentId);
        System.out.printf("Enrolled %s in %s%n", student.getName(), course.getCourseName());
        return true;
    }
    
    // Add grade for student
    public void addGrade(String studentId, String courseId, double grade) {
        Student student = students.get(studentId);
        Course course = courses.get(courseId);
        
        if (student == null || course == null) {
            System.out.println("Student or course not found");
            return;
        }
        
        if (!course.getEnrolledStudents().contains(studentId)) {
            System.out.println("Student is not enrolled in this course");
            return;
        }
        
        // Remove from old GPA ranking
        removeFromGPARanking(student);
        
        // Add grade
        student.addGrade(courseId, grade);
        
        // Update GPA ranking
        updateGPARanking(student);
        
        System.out.printf("Added grade %.2f for %s in %s%n", 
                         grade, student.getName(), course.getCourseName());
    }
    
    private void updateGPARanking(Student student) {
        double gpa = student.getGPA();
        gpaRanking.computeIfAbsent(gpa, k -> new ArrayList<>()).add(student);
    }
    
    private void removeFromGPARanking(Student student) {
        double oldGPA = student.getGPA();
        List<Student> studentsAtGPA = gpaRanking.get(oldGPA);
        if (studentsAtGPA != null) {
            studentsAtGPA.remove(student);
            if (studentsAtGPA.isEmpty()) {
                gpaRanking.remove(oldGPA);
            }
        }
    }
    
    // Query methods
    public List<Student> getStudentsByMajor(String major) {
        return majorToStudents.getOrDefault(major, Collections.emptyList())
                             .stream()
                             .map(students::get)
                             .collect(Collectors.toList());
    }
    
    public List<Student> getTopStudents(int limit) {
        return gpaRanking.values().stream()
                        .flatMap(List::stream)
                        .limit(limit)
                        .collect(Collectors.toList());
    }
    
    public List<Course> getCoursesForStudent(String studentId) {
        return courses.values().stream()
                     .filter(course -> course.getEnrolledStudents().contains(studentId))
                     .collect(Collectors.toList());
    }
    
    public Map<String, Long> getMajorDistribution() {
        return students.values().stream()
                      .collect(Collectors.groupingBy(Student::getMajor, Collectors.counting()));
    }
    
    public OptionalDouble getAverageGPAByMajor(String major) {
        return getStudentsByMajor(major).stream()
                                       .mapToDouble(Student::getGPA)
                                       .average();
    }
    
    // Display methods
    public void displayAllStudents() {
        System.out.println("\n=== All Students ===");
        students.values().stream()
               .sorted(Comparator.comparing(Student::getName))
               .forEach(System.out::println);
    }
    
    public void displayStatistics() {
        System.out.println("\n=== System Statistics ===");
        System.out.println("Total students: " + students.size());
        System.out.println("Total courses: " + courses.size());
        
        System.out.println("\nMajor distribution:");
        getMajorDistribution().entrySet().stream()
                             .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                             .forEach(entry -> System.out.printf("  %s: %d students%n", 
                                                                entry.getKey(), entry.getValue()));
        
        System.out.println("\nTop 5 students by GPA:");
        getTopStudents(5).forEach(student -> 
            System.out.printf("  %s (GPA: %.2f)%n", student.getName(), student.getGPA()));
        
        // Average GPA by major
        System.out.println("\nAverage GPA by major:");
        getMajorDistribution().keySet().forEach(major -> {
            OptionalDouble avgGPA = getAverageGPAByMajor(major);
            System.out.printf("  %s: %.2f%n", major, avgGPA.orElse(0.0));
        });
    }
    
    public static void main(String[] args) {
        StudentManagementSystem sms = new StudentManagementSystem();
        
        // Add students
        sms.addStudent(new Student("S001", "Alice Johnson", 20, "Computer Science"));
        sms.addStudent(new Student("S002", "Bob Smith", 21, "Mathematics"));
        sms.addStudent(new Student("S003", "Charlie Brown", 19, "Computer Science"));
        sms.addStudent(new Student("S004", "Diana Prince", 22, "Physics"));
        sms.addStudent(new Student("S005", "Eve Adams", 20, "Mathematics"));
        
        // Add courses
        sms.addCourse(new Course("CS101", "Introduction to Programming", 3));
        sms.addCourse(new Course("MATH201", "Calculus II", 4));
        sms.addCourse(new Course("PHYS101", "General Physics", 4));
        sms.addCourse(new Course("CS201", "Data Structures", 3));
        
        // Enroll students
        sms.enrollStudent("S001", "CS101");
        sms.enrollStudent("S001", "MATH201");
        sms.enrollStudent("S001", "CS201");
        sms.enrollStudent("S002", "MATH201");
        sms.enrollStudent("S002", "PHYS101");
        sms.enrollStudent("S003", "CS101");
        sms.enrollStudent("S003", "CS201");
        sms.enrollStudent("S004", "PHYS101");
        sms.enrollStudent("S004", "MATH201");
        sms.enrollStudent("S005", "MATH201");
        
        // Add grades
        sms.addGrade("S001", "CS101", 95.0);
        sms.addGrade("S001", "MATH201", 87.5);
        sms.addGrade("S001", "CS201", 92.0);
        sms.addGrade("S002", "MATH201", 78.5);
        sms.addGrade("S002", "PHYS101", 85.0);
        sms.addGrade("S003", "CS101", 88.0);
        sms.addGrade("S003", "CS201", 90.5);
        sms.addGrade("S004", "PHYS101", 96.0);
        sms.addGrade("S004", "MATH201", 89.0);
        sms.addGrade("S005", "MATH201", 82.5);
        
        // Display results
        sms.displayAllStudents();
        sms.displayStatistics();
        
        // Query examples
        System.out.println("\n=== Query Examples ===");
        System.out.println("Computer Science students:");
        sms.getStudentsByMajor("Computer Science")
           .forEach(student -> System.out.println("  " + student));
        
        System.out.println("\nCourses for student S001:");
        sms.getCoursesForStudent("S001")
           .forEach(course -> System.out.println("  " + course));
    }
}
```

## Summary

The Java Collections Framework provides powerful tools for data management:

### Key Takeaways

1. **Choose the Right Collection**:
   - `ArrayList` for random access and frequent reads
   - `LinkedList` for frequent insertions/deletions
   - `HashSet` for fast uniqueness checking
   - `TreeSet` for sorted unique elements
   - `HashMap` for key-value associations
   - `TreeMap` for sorted key-value pairs

2. **Performance Considerations**:
   - Set initial capacity for `HashMap`/`HashSet` when size is known
   - Use appropriate collection for your access patterns
   - Consider memory usage vs. performance trade-offs

3. **Best Practices**:
   - Always override `equals()` and `hashCode()` for custom objects
   - Use parameterized types for type safety
   - Prefer immutable collections when possible
   - Use `Iterator.remove()` for safe removal during iteration
   - Consider concurrent collections for thread-safe operations

4. **Modern Java Features**:
   - Stream API for complex data processing
   - Collection factory methods (`List.of()`, `Set.of()`, `Map.of()`)
   - Method references and lambda expressions

## Next Steps

<function_calls>
<invoke name="TodoWrite">
<parameter name="todos">[{"content": "Create Tutorial 12: Packages and Modularity", "status": "completed", "activeForm": "Creating Tutorial 12: Packages and Modularity"}, {"content": "Create Tutorial 13: Exception Handling", "status": "completed", "activeForm": "Creating Tutorial 13: Exception Handling"}, {"content": "Create Tutorial 14: Input/Output (I/O) Streams", "status": "completed", "activeForm": "Creating Tutorial 14: Input/Output (I/O) Streams"}, {"content": "Create Tutorial 15: Collections Framework", "status": "completed", "activeForm": "Creating Tutorial 15: Collections Framework"}, {"content": "Create Tutorial 16: Generics", "status": "pending", "activeForm": "Creating Tutorial 16: Generics"}]