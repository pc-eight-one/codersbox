---
title: "Java Tutorial Series - Part 5: Arrays"
description: "Master Java arrays including single and multi-dimensional arrays, initialization techniques, traversal methods, common operations, sorting, and searching algorithms."
publishDate: 2025-01-15
tags: ["Java", "Arrays", "Data Structures", "Algorithms", "Sorting", "Searching"]
difficulty: "beginner"
series: "Java Tutorial Series"
part: 5
estimatedTime: "90 minutes"
totalParts: 24
featured: false
---

# Java Tutorial Series - Part 5: Arrays

Arrays are fundamental data structures in Java that allow you to store multiple values of the same type in a single variable. They provide efficient access to elements using indices and are the building blocks for more complex data structures. In this part, we'll explore everything you need to know about working with arrays effectively.

## What are Arrays?

An array is a container object that holds a fixed number of values of a single type. The length of an array is established when the array is created and cannot be changed after creation. Each item in an array is called an element, and each element is accessed by its numerical index.

### Key Characteristics of Arrays

- **Fixed size**: Once created, the array size cannot be changed
- **Homogeneous**: All elements must be of the same type
- **Indexed**: Elements are accessed using zero-based indices
- **Reference type**: Arrays are objects in Java
- **Contiguous memory**: Elements are stored in consecutive memory locations

## Declaring and Initializing Arrays

### Array Declaration

```java
public class ArrayDeclaration {
    public static void main(String[] args) {
        // Different ways to declare arrays
        
        // Method 1: Type followed by square brackets
        int[] numbers1;
        String[] names1;
        double[] prices1;
        
        // Method 2: Square brackets after variable name (less preferred)
        int numbers2[];
        String names2[];
        double prices2[];
        
        // Method 3: Declaring multiple arrays
        int[] array1, array2, array3;
        
        // Note: This creates one array and one int variable!
        int[] arrayVar, intVar; // arrayVar is int[], intVar is just int
        
        System.out.println("Arrays declared successfully!");
    }
}
```

### Array Initialization

```java
public class ArrayInitialization {
    public static void main(String[] args) {
        // Method 1: Declare and initialize separately
        int[] numbers;
        numbers = new int[5]; // Creates array with 5 elements, all initialized to 0
        
        // Method 2: Declare and initialize in one line
        int[] scores = new int[10]; // Array of 10 integers
        String[] names = new String[3]; // Array of 3 strings (initialized to null)
        boolean[] flags = new boolean[4]; // Array of 4 booleans (initialized to false)
        
        // Method 3: Initialize with specific values
        int[] grades = {85, 92, 78, 96, 87}; // Array literal
        String[] colors = {"red", "green", "blue", "yellow"};
        double[] temperatures = {23.5, 25.0, 22.8, 26.2};
        
        // Method 4: Using new keyword with initialization
        int[] fibonacci = new int[]{0, 1, 1, 2, 3, 5, 8, 13};
        String[] fruits = new String[]{"apple", "banana", "orange"};
        
        // Method 5: Anonymous array (useful for method parameters)
        printArray(new int[]{1, 2, 3, 4, 5});
        
        // Display array information
        System.out.println("Numbers array length: " + numbers.length);
        System.out.println("Grades array length: " + grades.length);
        System.out.println("Colors array length: " + colors.length);
        
        // Display default values
        System.out.println("Default int value: " + numbers[0]);
        System.out.println("Default String value: " + names[0]);
        System.out.println("Default boolean value: " + flags[0]);
    }
    
    public static void printArray(int[] array) {
        System.out.print("Anonymous array: ");
        for (int value : array) {
            System.out.print(value + " ");
        }
        System.out.println();
    }
}
```

## Single-Dimensional Arrays

### Accessing and Modifying Array Elements

```java
public class ArrayAccess {
    public static void main(String[] args) {
        // Create and initialize array
        String[] students = {"Alice", "Bob", "Charlie", "Diana", "Eve"};
        
        // Access elements using index (0-based)
        System.out.println("First student: " + students[0]);
        System.out.println("Last student: " + students[students.length - 1]);
        System.out.println("Third student: " + students[2]);
        
        // Modify array elements
        students[1] = "Robert"; // Change "Bob" to "Robert"
        students[4] = "Eva";    // Change "Eve" to "Eva"
        
        System.out.println("\nAfter modifications:");
        for (int i = 0; i < students.length; i++) {
            System.out.println("Student " + (i + 1) + ": " + students[i]);
        }
        
        // Working with numeric arrays
        int[] scores = new int[5];
        
        // Initialize with user input simulation
        scores[0] = 85;
        scores[1] = 92;
        scores[2] = 78;
        scores[3] = 96;
        scores[4] = 87;
        
        // Calculate and display statistics
        int total = 0;
        int max = scores[0];
        int min = scores[0];
        
        for (int i = 0; i < scores.length; i++) {
            total += scores[i];
            if (scores[i] > max) max = scores[i];
            if (scores[i] < min) min = scores[i];
        }
        
        double average = (double) total / scores.length;
        
        System.out.println("\nScore Statistics:");
        System.out.println("Total: " + total);
        System.out.printf("Average: %.2f%n", average);
        System.out.println("Highest: " + max);
        System.out.println("Lowest: " + min);
    }
}
```

### Array Bounds and Common Errors

```java
public class ArrayBounds {
    public static void main(String[] args) {
        int[] numbers = {10, 20, 30, 40, 50};
        
        System.out.println("Array length: " + numbers.length);
        System.out.println("Valid indices: 0 to " + (numbers.length - 1));
        
        // Valid access
        System.out.println("First element: " + numbers[0]);
        System.out.println("Last element: " + numbers[numbers.length - 1]);
        
        // Common mistakes and how to avoid them
        
        // MISTAKE 1: Using length as index (should be length - 1)
        try {
            System.out.println("Trying to access index " + numbers.length);
            System.out.println(numbers[numbers.length]); // This will throw exception
        } catch (ArrayIndexOutOfBoundsException e) {
            System.out.println("Error: " + e.getMessage());
        }
        
        // MISTAKE 2: Negative index
        try {
            System.out.println("Trying to access index -1");
            System.out.println(numbers[-1]); // This will throw exception
        } catch (ArrayIndexOutOfBoundsException e) {
            System.out.println("Error: " + e.getMessage());
        }
        
        // SAFE WAY: Always check bounds
        int index = 10; // Some index we want to access
        if (index >= 0 && index < numbers.length) {
            System.out.println("Element at index " + index + ": " + numbers[index]);
        } else {
            System.out.println("Index " + index + " is out of bounds!");
        }
        
        // Helper method for safe access
        System.out.println("Safe access result: " + safeGet(numbers, 2));
        System.out.println("Safe access result: " + safeGet(numbers, 10));
    }
    
    public static Integer safeGet(int[] array, int index) {
        if (index >= 0 && index < array.length) {
            return array[index];
        }
        return null; // or throw a custom exception
    }
}
```

## Array Traversal Techniques

### Traditional for Loop

```java
public class ArrayTraversal {
    public static void main(String[] args) {
        int[] numbers = {2, 4, 6, 8, 10, 12, 14, 16, 18, 20};
        
        // Method 1: Traditional for loop (when you need index)
        System.out.println("Method 1: Traditional for loop");
        for (int i = 0; i < numbers.length; i++) {
            System.out.println("Index " + i + ": " + numbers[i]);
        }
        
        // Method 2: Enhanced for loop (for-each) - when you just need values
        System.out.println("\nMethod 2: Enhanced for loop");
        for (int number : numbers) {
            System.out.print(number + " ");
        }
        System.out.println();
        
        // Method 3: While loop
        System.out.println("\nMethod 3: While loop");
        int index = 0;
        while (index < numbers.length) {
            System.out.print(numbers[index] + " ");
            index++;
        }
        System.out.println();
        
        // Method 4: Reverse traversal
        System.out.println("\nMethod 4: Reverse traversal");
        for (int i = numbers.length - 1; i >= 0; i--) {
            System.out.print(numbers[i] + " ");
        }
        System.out.println();
        
        // Practical examples
        demonstrateTraversalUseCases();
    }
    
    public static void demonstrateTraversalUseCases() {
        String[] words = {"Java", "Python", "JavaScript", "TypeScript", "Go"};
        
        // Use case 1: Find longest word (need to compare values)
        String longest = words[0];
        for (String word : words) {
            if (word.length() > longest.length()) {
                longest = word;
            }
        }
        System.out.println("\nLongest word: " + longest);
        
        // Use case 2: Find index of specific word (need index)
        String target = "JavaScript";
        int foundIndex = -1;
        for (int i = 0; i < words.length; i++) {
            if (words[i].equals(target)) {
                foundIndex = i;
                break;
            }
        }
        System.out.println(target + " found at index: " + foundIndex);
        
        // Use case 3: Create modified array (need both index and value)
        String[] uppercased = new String[words.length];
        for (int i = 0; i < words.length; i++) {
            uppercased[i] = words[i].toUpperCase();
        }
        
        System.out.print("Uppercased: ");
        for (String word : uppercased) {
            System.out.print(word + " ");
        }
        System.out.println();
    }
}
```

## Multi-Dimensional Arrays

### Two-Dimensional Arrays

```java
public class TwoDimensionalArrays {
    public static void main(String[] args) {
        // Declaration and initialization
        
        // Method 1: Specify dimensions
        int[][] matrix1 = new int[3][4]; // 3 rows, 4 columns
        
        // Method 2: Initialize with values
        int[][] matrix2 = {
            {1, 2, 3, 4},
            {5, 6, 7, 8},
            {9, 10, 11, 12}
        };
        
        // Method 3: Using new keyword with values
        int[][] matrix3 = new int[][]{
            {10, 20},
            {30, 40},
            {50, 60}
        };
        
        // Working with 2D arrays
        System.out.println("Matrix2 dimensions: " + matrix2.length + " x " + matrix2[0].length);
        
        // Populate matrix1
        int value = 1;
        for (int row = 0; row < matrix1.length; row++) {
            for (int col = 0; col < matrix1[row].length; col++) {
                matrix1[row][col] = value++;
            }
        }
        
        // Display matrices
        System.out.println("\nMatrix1:");
        printMatrix(matrix1);
        
        System.out.println("\nMatrix2:");
        printMatrix(matrix2);
        
        // Practical example: Student grades
        demonstrateStudentGrades();
        
        // Matrix operations
        demonstrateMatrixOperations();
    }
    
    public static void printMatrix(int[][] matrix) {
        for (int row = 0; row < matrix.length; row++) {
            for (int col = 0; col < matrix[row].length; col++) {
                System.out.printf("%4d", matrix[row][col]);
            }
            System.out.println();
        }
    }
    
    public static void demonstrateStudentGrades() {
        // Rows represent students, columns represent subjects
        String[] students = {"Alice", "Bob", "Charlie", "Diana"};
        String[] subjects = {"Math", "Science", "English", "History"};
        int[][] grades = {
            {85, 92, 78, 88},  // Alice's grades
            {90, 87, 85, 92},  // Bob's grades
            {78, 85, 90, 86},  // Charlie's grades
            {92, 89, 87, 91}   // Diana's grades
        };
        
        System.out.println("\n=== Student Grade Report ===");
        
        // Print header
        System.out.printf("%-10s", "Student");
        for (String subject : subjects) {
            System.out.printf("%8s", subject);
        }
        System.out.printf("%8s%n", "Average");
        
        // Print student grades and averages
        for (int i = 0; i < students.length; i++) {
            System.out.printf("%-10s", students[i]);
            
            int total = 0;
            for (int j = 0; j < grades[i].length; j++) {
                System.out.printf("%8d", grades[i][j]);
                total += grades[i][j];
            }
            
            double average = (double) total / grades[i].length;
            System.out.printf("%8.1f%n", average);
        }
        
        // Calculate subject averages
        System.out.printf("%-10s", "Average");
        for (int j = 0; j < subjects.length; j++) {
            int total = 0;
            for (int i = 0; i < grades.length; i++) {
                total += grades[i][j];
            }
            double average = (double) total / grades.length;
            System.out.printf("%8.1f", average);
        }
        System.out.println();
    }
    
    public static void demonstrateMatrixOperations() {
        int[][] matrix1 = {{1, 2, 3}, {4, 5, 6}};
        int[][] matrix2 = {{7, 8, 9}, {10, 11, 12}};
        
        System.out.println("\n=== Matrix Operations ===");
        
        // Matrix addition
        int[][] sum = addMatrices(matrix1, matrix2);
        System.out.println("Matrix Addition:");
        printMatrix(sum);
        
        // Find maximum element
        int max = findMaximum(matrix1);
        System.out.println("\nMaximum element in matrix1: " + max);
        
        // Transpose matrix
        int[][] transposed = transpose(matrix1);
        System.out.println("\nTransposed matrix1:");
        printMatrix(transposed);
    }
    
    public static int[][] addMatrices(int[][] a, int[][] b) {
        if (a.length != b.length || a[0].length != b[0].length) {
            throw new IllegalArgumentException("Matrices must have same dimensions");
        }
        
        int[][] result = new int[a.length][a[0].length];
        for (int i = 0; i < a.length; i++) {
            for (int j = 0; j < a[i].length; j++) {
                result[i][j] = a[i][j] + b[i][j];
            }
        }
        return result;
    }
    
    public static int findMaximum(int[][] matrix) {
        int max = matrix[0][0];
        for (int[] row : matrix) {
            for (int value : row) {
                if (value > max) {
                    max = value;
                }
            }
        }
        return max;
    }
    
    public static int[][] transpose(int[][] matrix) {
        int[][] result = new int[matrix[0].length][matrix.length];
        for (int i = 0; i < matrix.length; i++) {
            for (int j = 0; j < matrix[i].length; j++) {
                result[j][i] = matrix[i][j];
            }
        }
        return result;
    }
}
```

### Jagged Arrays

```java
public class JaggedArrays {
    public static void main(String[] args) {
        // Jagged arrays: arrays where rows can have different lengths
        
        // Method 1: Create rows with different sizes
        int[][] jaggedArray = new int[4][]; // 4 rows, columns not specified
        jaggedArray[0] = new int[3];     // First row has 3 elements
        jaggedArray[1] = new int[5];     // Second row has 5 elements
        jaggedArray[2] = new int[2];     // Third row has 2 elements
        jaggedArray[3] = new int[4];     // Fourth row has 4 elements
        
        // Method 2: Initialize with different sized rows
        int[][] triangularArray = {
            {1},
            {2, 3},
            {4, 5, 6},
            {7, 8, 9, 10},
            {11, 12, 13, 14, 15}
        };
        
        // Populate jagged array
        int value = 1;
        for (int i = 0; i < jaggedArray.length; i++) {
            for (int j = 0; j < jaggedArray[i].length; j++) {
                jaggedArray[i][j] = value++;
            }
        }
        
        // Display jagged arrays
        System.out.println("Jagged Array:");
        printJaggedArray(jaggedArray);
        
        System.out.println("\nTriangular Array:");
        printJaggedArray(triangularArray);
        
        // Practical example: Different class sizes
        demonstrateClassSizes();
    }
    
    public static void printJaggedArray(int[][] array) {
        for (int i = 0; i < array.length; i++) {
            System.out.print("Row " + i + ": ");
            for (int j = 0; j < array[i].length; j++) {
                System.out.print(array[i][j] + " ");
            }
            System.out.println();
        }
    }
    
    public static void demonstrateClassSizes() {
        // Different grades have different number of students
        String[][] students = {
            {"Alice", "Bob", "Charlie"},                    // Grade 1: 3 students
            {"Diana", "Eve", "Frank", "Grace"},            // Grade 2: 4 students
            {"Henry", "Ivy"},                              // Grade 3: 2 students
            {"Jack", "Kate", "Liam", "Mia", "Noah"}       // Grade 4: 5 students
        };
        
        System.out.println("\n=== School Enrollment by Grade ===");
        
        int totalStudents = 0;
        for (int grade = 0; grade < students.length; grade++) {
            System.out.println("Grade " + (grade + 1) + " (" + students[grade].length + " students):");
            for (String student : students[grade]) {
                System.out.println("  - " + student);
            }
            totalStudents += students[grade].length;
        }
        
        System.out.println("\nTotal students: " + totalStudents);
        
        // Calculate average class size
        double averageClassSize = (double) totalStudents / students.length;
        System.out.printf("Average class size: %.1f students%n", averageClassSize);
    }
}
```

## Common Array Operations

### Copying Arrays

```java
import java.util.Arrays;

public class ArrayCopying {
    public static void main(String[] args) {
        int[] original = {1, 2, 3, 4, 5};
        
        // Method 1: Manual copying
        int[] copy1 = new int[original.length];
        for (int i = 0; i < original.length; i++) {
            copy1[i] = original[i];
        }
        
        // Method 2: System.arraycopy()
        int[] copy2 = new int[original.length];
        System.arraycopy(original, 0, copy2, 0, original.length);
        
        // Method 3: Arrays.copyOf()
        int[] copy3 = Arrays.copyOf(original, original.length);
        
        // Method 4: Arrays.copyOfRange()
        int[] copy4 = Arrays.copyOfRange(original, 1, 4); // Copy elements 1-3
        
        // Method 5: Clone method
        int[] copy5 = original.clone();
        
        // Display results
        System.out.println("Original: " + Arrays.toString(original));
        System.out.println("Copy1 (manual): " + Arrays.toString(copy1));
        System.out.println("Copy2 (System.arraycopy): " + Arrays.toString(copy2));
        System.out.println("Copy3 (Arrays.copyOf): " + Arrays.toString(copy3));
        System.out.println("Copy4 (Arrays.copyOfRange): " + Arrays.toString(copy4));
        System.out.println("Copy5 (clone): " + Arrays.toString(copy5));
        
        // Demonstrate shallow vs deep copy with object arrays
        demonstrateShallowCopy();
    }
    
    public static void demonstrateShallowCopy() {
        // Create array of string arrays
        String[][] original = {
            {"Alice", "Engineer"},
            {"Bob", "Designer"},
            {"Charlie", "Manager"}
        };
        
        // Shallow copy - copies references, not objects
        String[][] shallowCopy = original.clone();
        
        // Modify original
        original[0][1] = "Senior Engineer"; // This affects both arrays!
        
        System.out.println("\n=== Shallow Copy Demonstration ===");
        System.out.println("Original: " + Arrays.deepToString(original));
        System.out.println("Shallow copy: " + Arrays.deepToString(shallowCopy));
        
        // Deep copy - create completely independent copy
        String[][] deepCopy = new String[original.length][];
        for (int i = 0; i < original.length; i++) {
            deepCopy[i] = Arrays.copyOf(original[i], original[i].length);
        }
        
        // Modify original again
        original[1][1] = "Senior Designer";
        
        System.out.println("\nAfter second modification:");
        System.out.println("Original: " + Arrays.deepToString(original));
        System.out.println("Deep copy: " + Arrays.deepToString(deepCopy));
    }
}
```

### Resizing Arrays

```java
import java.util.Arrays;

public class ArrayResizing {
    public static void main(String[] args) {
        // Arrays have fixed size, but we can simulate resizing
        
        int[] numbers = {1, 2, 3, 4, 5};
        System.out.println("Original: " + Arrays.toString(numbers));
        
        // Expand array
        numbers = expandArray(numbers, 8);
        System.out.println("Expanded: " + Arrays.toString(numbers));
        
        // Add element to array
        numbers = addElement(numbers, 99);
        System.out.println("After adding 99: " + Arrays.toString(numbers));
        
        // Remove element from array
        numbers = removeElement(numbers, 2); // Remove element at index 2
        System.out.println("After removing index 2: " + Arrays.toString(numbers));
        
        // Insert element at specific position
        numbers = insertElement(numbers, 2, 100);
        System.out.println("After inserting 100 at index 2: " + Arrays.toString(numbers));
        
        // Demonstrate dynamic array behavior
        demonstrateDynamicArray();
    }
    
    public static int[] expandArray(int[] array, int newSize) {
        if (newSize <= array.length) {
            return Arrays.copyOf(array, array.length);
        }
        return Arrays.copyOf(array, newSize);
    }
    
    public static int[] addElement(int[] array, int element) {
        // Find first available spot (null/0 for int arrays)
        for (int i = 0; i < array.length; i++) {
            if (array[i] == 0) { // Assuming 0 means empty for this example
                array[i] = element;
                return array;
            }
        }
        
        // No space available, expand array
        int[] newArray = Arrays.copyOf(array, array.length + 1);
        newArray[array.length] = element;
        return newArray;
    }
    
    public static int[] removeElement(int[] array, int index) {
        if (index < 0 || index >= array.length) {
            return array; // Invalid index
        }
        
        int[] newArray = new int[array.length - 1];
        
        // Copy elements before the index
        System.arraycopy(array, 0, newArray, 0, index);
        
        // Copy elements after the index
        System.arraycopy(array, index + 1, newArray, index, array.length - index - 1);
        
        return newArray;
    }
    
    public static int[] insertElement(int[] array, int index, int element) {
        if (index < 0 || index > array.length) {
            return array; // Invalid index
        }
        
        int[] newArray = new int[array.length + 1];
        
        // Copy elements before the index
        System.arraycopy(array, 0, newArray, 0, index);
        
        // Insert new element
        newArray[index] = element;
        
        // Copy elements after the index
        System.arraycopy(array, index, newArray, index + 1, array.length - index);
        
        return newArray;
    }
    
    public static void demonstrateDynamicArray() {
        System.out.println("\n=== Dynamic Array Simulation ===");
        
        int[] dynamicArray = new int[0]; // Start with empty array
        
        // Add several elements
        dynamicArray = addToEnd(dynamicArray, 10);
        dynamicArray = addToEnd(dynamicArray, 20);
        dynamicArray = addToEnd(dynamicArray, 30);
        dynamicArray = addToEnd(dynamicArray, 40);
        
        System.out.println("After adding elements: " + Arrays.toString(dynamicArray));
        
        // Remove last element
        dynamicArray = removeFromEnd(dynamicArray);
        System.out.println("After removing last: " + Arrays.toString(dynamicArray));
    }
    
    public static int[] addToEnd(int[] array, int element) {
        int[] newArray = Arrays.copyOf(array, array.length + 1);
        newArray[array.length] = element;
        return newArray;
    }
    
    public static int[] removeFromEnd(int[] array) {
        if (array.length == 0) return array;
        return Arrays.copyOf(array, array.length - 1);
    }
}
```

## Sorting Arrays

### Built-in Sorting

```java
import java.util.Arrays;
import java.util.Collections;

public class ArraySorting {
    public static void main(String[] args) {
        // Sorting primitive arrays
        int[] numbers = {64, 34, 25, 12, 22, 11, 90, 88, 76, 50, 42};
        System.out.println("Original: " + Arrays.toString(numbers));
        
        // Sort in ascending order
        int[] ascending = Arrays.copyOf(numbers, numbers.length);
        Arrays.sort(ascending);
        System.out.println("Ascending: " + Arrays.toString(ascending));
        
        // For descending order with primitives, we need to sort and reverse
        Integer[] numberObjects = new Integer[numbers.length];
        for (int i = 0; i < numbers.length; i++) {
            numberObjects[i] = numbers[i];
        }
        Arrays.sort(numberObjects, Collections.reverseOrder());
        System.out.println("Descending: " + Arrays.toString(numberObjects));
        
        // Sorting strings
        String[] names = {"Alice", "charlie", "Bob", "diana", "Eve"};
        System.out.println("\nOriginal names: " + Arrays.toString(names));
        
        Arrays.sort(names); // Case-sensitive sort
        System.out.println("Sorted (case-sensitive): " + Arrays.toString(names));
        
        // Case-insensitive sort
        String[] namesCopy = {"Alice", "charlie", "Bob", "diana", "Eve"};
        Arrays.sort(namesCopy, String.CASE_INSENSITIVE_ORDER);
        System.out.println("Sorted (case-insensitive): " + Arrays.toString(namesCopy));
        
        // Partial sorting
        int[] partialSort = {5, 2, 8, 1, 9, 3, 7, 4, 6};
        Arrays.sort(partialSort, 2, 6); // Sort elements from index 2 to 5
        System.out.println("Partial sort (index 2-5): " + Arrays.toString(partialSort));
        
        // Demonstrate custom sorting
        demonstrateCustomSorting();
        
        // Implement basic sorting algorithms
        demonstrateSortingAlgorithms();
    }
    
    public static void demonstrateCustomSorting() {
        System.out.println("\n=== Custom Sorting ===");
        
        // Create array of students with grades
        Student[] students = {
            new Student("Alice", 85),
            new Student("Bob", 92),
            new Student("Charlie", 78),
            new Student("Diana", 96),
            new Student("Eve", 87)
        };
        
        System.out.println("Original order:");
        for (Student student : students) {
            System.out.println(student);
        }
        
        // Sort by grade (ascending)
        Arrays.sort(students, (s1, s2) -> Integer.compare(s1.grade, s2.grade));
        System.out.println("\nSorted by grade (ascending):");
        for (Student student : students) {
            System.out.println(student);
        }
        
        // Sort by name (alphabetical)
        Arrays.sort(students, (s1, s2) -> s1.name.compareTo(s2.name));
        System.out.println("\nSorted by name (alphabetical):");
        for (Student student : students) {
            System.out.println(student);
        }
    }
    
    public static void demonstrateSortingAlgorithms() {
        System.out.println("\n=== Sorting Algorithms Implementation ===");
        
        int[] data = {64, 34, 25, 12, 22, 11, 90, 88, 76, 50, 42};
        
        // Bubble Sort
        int[] bubbleData = Arrays.copyOf(data, data.length);
        bubbleSort(bubbleData);
        System.out.println("Bubble Sort: " + Arrays.toString(bubbleData));
        
        // Selection Sort
        int[] selectionData = Arrays.copyOf(data, data.length);
        selectionSort(selectionData);
        System.out.println("Selection Sort: " + Arrays.toString(selectionData));
        
        // Insertion Sort
        int[] insertionData = Arrays.copyOf(data, data.length);
        insertionSort(insertionData);
        System.out.println("Insertion Sort: " + Arrays.toString(insertionData));
    }
    
    // Bubble Sort implementation
    public static void bubbleSort(int[] array) {
        int n = array.length;
        for (int i = 0; i < n - 1; i++) {
            for (int j = 0; j < n - i - 1; j++) {
                if (array[j] > array[j + 1]) {
                    // Swap elements
                    int temp = array[j];
                    array[j] = array[j + 1];
                    array[j + 1] = temp;
                }
            }
        }
    }
    
    // Selection Sort implementation
    public static void selectionSort(int[] array) {
        int n = array.length;
        for (int i = 0; i < n - 1; i++) {
            int minIndex = i;
            for (int j = i + 1; j < n; j++) {
                if (array[j] < array[minIndex]) {
                    minIndex = j;
                }
            }
            // Swap minimum element with first element
            int temp = array[minIndex];
            array[minIndex] = array[i];
            array[i] = temp;
        }
    }
    
    // Insertion Sort implementation
    public static void insertionSort(int[] array) {
        int n = array.length;
        for (int i = 1; i < n; i++) {
            int key = array[i];
            int j = i - 1;
            
            // Move elements greater than key one position ahead
            while (j >= 0 && array[j] > key) {
                array[j + 1] = array[j];
                j = j - 1;
            }
            array[j + 1] = key;
        }
    }
    
    // Helper class for custom sorting
    static class Student {
        String name;
        int grade;
        
        Student(String name, int grade) {
            this.name = name;
            this.grade = grade;
        }
        
        @Override
        public String toString() {
            return name + ": " + grade;
        }
    }
}
```

## Searching Arrays

```java
import java.util.Arrays;

public class ArraySearching {
    public static void main(String[] args) {
        int[] numbers = {2, 5, 8, 12, 16, 23, 38, 45, 56, 67, 78};
        
        // Linear Search
        System.out.println("=== Linear Search ===");
        int target = 23;
        int index = linearSearch(numbers, target);
        System.out.println("Linear search for " + target + ": " + 
                         (index != -1 ? "found at index " + index : "not found"));
        
        // Binary Search (array must be sorted)
        System.out.println("\n=== Binary Search ===");
        index = binarySearch(numbers, target);
        System.out.println("Binary search for " + target + ": " + 
                         (index != -1 ? "found at index " + index : "not found"));
        
        // Built-in binary search
        index = Arrays.binarySearch(numbers, target);
        System.out.println("Arrays.binarySearch for " + target + ": " + 
                         (index >= 0 ? "found at index " + index : "not found"));
        
        // Search in unsorted array
        int[] unsorted = {45, 12, 78, 23, 8, 56, 2, 67, 38, 16, 5};
        System.out.println("\n=== Search in Unsorted Array ===");
        System.out.println("Unsorted array: " + Arrays.toString(unsorted));
        
        index = linearSearch(unsorted, target);
        System.out.println("Linear search for " + target + ": " + 
                         (index != -1 ? "found at index " + index : "not found"));
        
        // String array search
        demonstrateStringSearch();
        
        // Advanced search operations
        demonstrateAdvancedSearch();
    }
    
    // Linear Search - works on any array
    public static int linearSearch(int[] array, int target) {
        for (int i = 0; i < array.length; i++) {
            if (array[i] == target) {
                return i;
            }
        }
        return -1; // Not found
    }
    
    // Binary Search - requires sorted array
    public static int binarySearch(int[] array, int target) {
        int left = 0;
        int right = array.length - 1;
        
        while (left <= right) {
            int mid = left + (right - left) / 2;
            
            if (array[mid] == target) {
                return mid;
            }
            
            if (array[mid] < target) {
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }
        
        return -1; // Not found
    }
    
    public static void demonstrateStringSearch() {
        System.out.println("\n=== String Array Search ===");
        
        String[] fruits = {"apple", "banana", "cherry", "date", "elderberry", "fig", "grape"};
        String target = "cherry";
        
        // Case-sensitive search
        int index = linearSearchString(fruits, target);
        System.out.println("Search for '" + target + "': " + 
                         (index != -1 ? "found at index " + index : "not found"));
        
        // Case-insensitive search
        target = "CHERRY";
        index = linearSearchStringIgnoreCase(fruits, target);
        System.out.println("Case-insensitive search for '" + target + "': " + 
                         (index != -1 ? "found at index " + index : "not found"));
        
        // Partial match search
        String partial = "erry";
        index = searchPartialMatch(fruits, partial);
        System.out.println("Partial match search for '" + partial + "': " + 
                         (index != -1 ? "found in '" + fruits[index] + "' at index " + index : "not found"));
    }
    
    public static int linearSearchString(String[] array, String target) {
        for (int i = 0; i < array.length; i++) {
            if (array[i].equals(target)) {
                return i;
            }
        }
        return -1;
    }
    
    public static int linearSearchStringIgnoreCase(String[] array, String target) {
        for (int i = 0; i < array.length; i++) {
            if (array[i].equalsIgnoreCase(target)) {
                return i;
            }
        }
        return -1;
    }
    
    public static int searchPartialMatch(String[] array, String partial) {
        for (int i = 0; i < array.length; i++) {
            if (array[i].contains(partial)) {
                return i;
            }
        }
        return -1;
    }
    
    public static void demonstrateAdvancedSearch() {
        System.out.println("\n=== Advanced Search Operations ===");
        
        int[] numbers = {12, 45, 23, 67, 23, 89, 23, 34, 56, 23};
        int target = 23;
        
        // Find all occurrences
        int[] indices = findAllOccurrences(numbers, target);
        System.out.println("All occurrences of " + target + ": " + Arrays.toString(indices));
        
        // Find min and max
        int min = findMinimum(numbers);
        int max = findMaximum(numbers);
        System.out.println("Minimum: " + min + ", Maximum: " + max);
        
        // Find second largest
        int secondLargest = findSecondLargest(numbers);
        System.out.println("Second largest: " + secondLargest);
        
        // Count occurrences
        int count = countOccurrences(numbers, target);
        System.out.println("Count of " + target + ": " + count);
    }
    
    public static int[] findAllOccurrences(int[] array, int target) {
        // First pass: count occurrences
        int count = 0;
        for (int value : array) {
            if (value == target) count++;
        }
        
        // Second pass: collect indices
        int[] indices = new int[count];
        int index = 0;
        for (int i = 0; i < array.length; i++) {
            if (array[i] == target) {
                indices[index++] = i;
            }
        }
        
        return indices;
    }
    
    public static int findMinimum(int[] array) {
        if (array.length == 0) throw new IllegalArgumentException("Array is empty");
        
        int min = array[0];
        for (int i = 1; i < array.length; i++) {
            if (array[i] < min) {
                min = array[i];
            }
        }
        return min;
    }
    
    public static int findMaximum(int[] array) {
        if (array.length == 0) throw new IllegalArgumentException("Array is empty");
        
        int max = array[0];
        for (int i = 1; i < array.length; i++) {
            if (array[i] > max) {
                max = array[i];
            }
        }
        return max;
    }
    
    public static int findSecondLargest(int[] array) {
        if (array.length < 2) throw new IllegalArgumentException("Array must have at least 2 elements");
        
        int largest = Integer.MIN_VALUE;
        int secondLargest = Integer.MIN_VALUE;
        
        for (int value : array) {
            if (value > largest) {
                secondLargest = largest;
                largest = value;
            } else if (value > secondLargest && value < largest) {
                secondLargest = value;
            }
        }
        
        return secondLargest;
    }
    
    public static int countOccurrences(int[] array, int target) {
        int count = 0;
        for (int value : array) {
            if (value == target) count++;
        }
        return count;
    }
}
```

## Summary

In this fifth part of our Java tutorial series, you've learned:

✅ **Array Fundamentals**: Declaration, initialization, and basic operations  
✅ **Single-Dimensional Arrays**: Working with one-dimensional arrays effectively  
✅ **Multi-Dimensional Arrays**: Creating and manipulating 2D arrays and jagged arrays  
✅ **Array Traversal**: Different techniques for iterating through arrays  
✅ **Common Operations**: Copying, resizing, and manipulating array contents  
✅ **Sorting Algorithms**: Built-in sorting and implementing basic sorting algorithms  
✅ **Searching Techniques**: Linear search, binary search, and advanced search operations  

### Key Takeaways

1. **Fixed Size**: Arrays have a fixed size that cannot be changed after creation
2. **Zero-Based Indexing**: Array indices start at 0 and go to length-1
3. **Bounds Checking**: Always validate array indices to prevent runtime errors
4. **Reference Types**: Arrays are objects and are passed by reference
5. **Performance**: Arrays provide O(1) access time but O(n) insertion/deletion

### What's Next?

In **Part 6: Object-Oriented Programming Basics**, we'll explore:
- Classes and objects
- Constructors and initialization
- Instance variables and methods
- The `this` keyword
- Encapsulation principles

### Practice Exercises

Before moving on, try these exercises:

1. **Grade Book System**: Create a program that manages student grades using 2D arrays
2. **Matrix Calculator**: Implement matrix operations (addition, multiplication, transpose)
3. **Array Statistics**: Build a utility class for statistical analysis of arrays
4. **Search and Sort Comparison**: Compare performance of different sorting and searching algorithms

Ready to dive into object-oriented programming? Let's continue to Part 6!

---

*This tutorial is part of our comprehensive Java Tutorial Series. Arrays are fundamental to Java programming and form the basis for understanding more complex data structures.*