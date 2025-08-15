---
title: "Java Tutorial Series - Part 5: Arrays"
description: "Master Java arrays including single and multi-dimensional arrays, initialization techniques, traversal methods, common operations, and sorting/searching algorithms."
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

Arrays are fundamental data structures in Java that store multiple values of the same type in a single variable. They provide an efficient way to organize and manipulate collections of data. In this part, we'll explore everything you need to know about working with arrays in Java.

## What are Arrays?

An array is a container object that holds a fixed number of values of a single type. The length of an array is established when the array is created and cannot be changed after creation. Each item in an array is called an element, and each element is accessed by its numerical index.

### Key Characteristics of Arrays

**1. Fixed Size**: Once created, array size cannot be changed
**2. Homogeneous**: All elements must be of the same type
**3. Indexed Access**: Elements are accessed using zero-based indexing
**4. Reference Types**: Arrays are objects in Java
**5. Contiguous Memory**: Elements are stored in contiguous memory locations

## Array Declaration and Initialization

### Single-Dimensional Arrays

#### Declaration Syntax

```java
public class ArrayDeclaration {
    public static void main(String[] args) {
        // Different ways to declare arrays
        
        // Method 1: Type followed by square brackets
        int[] numbers;
        String[] names;
        double[] prices;
        boolean[] flags;
        
        // Method 2: Square brackets after variable name (less common)
        int ages[];
        String cities[];
        
        // Method 3: Declare and initialize in one line
        int[] scores = new int[5];           // Array of 5 integers, all initialized to 0
        String[] colors = new String[3];     // Array of 3 strings, all initialized to null
        
        // Method 4: Declare, create, and initialize with values
        int[] fibNumbers = {0, 1, 1, 2, 3, 5, 8, 13};
        String[] days = {"Monday", "Tuesday", "Wednesday", "Thursday", "Friday"};
        double[] temperatures = {23.5, 25.0, 22.8, 26.3, 24.1};
        
        // Method 5: Using new keyword with initializer list
        int[] primes = new int[]{2, 3, 5, 7, 11, 13, 17, 19};
        String[] months = new String[]{"Jan", "Feb", "Mar", "Apr"};
        
        // Print array information
        System.out.println("Fibonacci numbers array length: " + fibNumbers.length);
        System.out.println("Days array length: " + days.length);
        System.out.println("Temperatures array length: " + temperatures.length);
    }
}
```

#### Array Initialization Techniques

```java
public class ArrayInitialization {
    
    public static void demonstrateInitialization() {
        System.out.println("=== Array Initialization Techniques ===");
        
        // 1. Default initialization (zeros, nulls, false)
        int[] defaultInts = new int[5];
        String[] defaultStrings = new String[3];
        boolean[] defaultBooleans = new boolean[4];
        
        System.out.println("Default int array:");
        printArray(defaultInts);
        
        System.out.println("Default String array:");
        printArray(defaultStrings);
        
        System.out.println("Default boolean array:");
        printArray(defaultBooleans);
        
        // 2. Manual initialization using loops
        int[] squares = new int[10];
        for (int i = 0; i < squares.length; i++) {
            squares[i] = (i + 1) * (i + 1);
        }
        System.out.println("Squares array (manual initialization):");
        printArray(squares);
        
        // 3. Initialization with user input simulation
        String[] studentNames = new String[3];
        studentNames[0] = "Alice";
        studentNames[1] = "Bob";
        studentNames[2] = "Charlie";
        
        System.out.println("Student names:");
        printArray(studentNames);
        
        // 4. Copying from another array
        int[] originalArray = {10, 20, 30, 40, 50};
        int[] copiedArray = new int[originalArray.length];
        
        // Manual copy
        for (int i = 0; i < originalArray.length; i++) {
            copiedArray[i] = originalArray[i];
        }
        
        System.out.println("Original array:");
        printArray(originalArray);
        System.out.println("Copied array:");
        printArray(copiedArray);
        
        // 5. Using System.arraycopy()
        int[] systemCopiedArray = new int[originalArray.length];
        System.arraycopy(originalArray, 0, systemCopiedArray, 0, originalArray.length);
        
        System.out.println("System copied array:");
        printArray(systemCopiedArray);
    }
    
    // Helper method to print integer arrays
    public static void printArray(int[] array) {
        System.out.print("[");
        for (int i = 0; i < array.length; i++) {
            System.out.print(array[i]);
            if (i < array.length - 1) {
                System.out.print(", ");
            }
        }
        System.out.println("]");
    }
    
    // Helper method to print String arrays
    public static void printArray(String[] array) {
        System.out.print("[");
        for (int i = 0; i < array.length; i++) {
            System.out.print(array[i] == null ? "null" : "\"" + array[i] + "\"");
            if (i < array.length - 1) {
                System.out.print(", ");
            }
        }
        System.out.println("]");
    }
    
    // Helper method to print boolean arrays
    public static void printArray(boolean[] array) {
        System.out.print("[");
        for (int i = 0; i < array.length; i++) {
            System.out.print(array[i]);
            if (i < array.length - 1) {
                System.out.print(", ");
            }
        }
        System.out.println("]");
    }
    
    public static void main(String[] args) {
        demonstrateInitialization();
    }
}
```

## Array Access and Traversal

### Accessing Array Elements

```java
public class ArrayAccess {
    
    public static void demonstrateAccess() {
        int[] numbers = {10, 25, 30, 45, 50, 65, 70, 85, 90};
        
        System.out.println("=== Array Access Examples ===");
        
        // Basic element access
        System.out.println("First element (index 0): " + numbers[0]);
        System.out.println("Last element (index " + (numbers.length - 1) + "): " + numbers[numbers.length - 1]);
        System.out.println("Middle element: " + numbers[numbers.length / 2]);
        
        // Modifying elements
        System.out.println("\nBefore modification:");
        printArray(numbers);
        
        numbers[0] = 100;           // Change first element
        numbers[numbers.length - 1] = 999;  // Change last element
        
        System.out.println("After modification:");
        printArray(numbers);
        
        // Safe access with bounds checking
        int index = 5;
        if (index >= 0 && index < numbers.length) {
            System.out.println("Element at index " + index + ": " + numbers[index]);
        } else {
            System.out.println("Index " + index + " is out of bounds");
        }
        
        // Demonstrate ArrayIndexOutOfBoundsException
        try {
            int invalidElement = numbers[15]; // This will throw an exception
        } catch (ArrayIndexOutOfBoundsException e) {
            System.out.println("Caught exception: " + e.getMessage());
        }
    }
    
    public static void printArray(int[] array) {
        System.out.print("[");
        for (int i = 0; i < array.length; i++) {
            System.out.print(array[i]);
            if (i < array.length - 1) {
                System.out.print(", ");
            }
        }
        System.out.println("]");
    }
    
    public static void main(String[] args) {
        demonstrateAccess();
    }
}
```

### Array Traversal Methods

```java
public class ArrayTraversal {
    
    public static void demonstrateTraversal() {
        String[] fruits = {"apple", "banana", "cherry", "date", "elderberry"};
        int[] scores = {85, 92, 78, 96, 88, 74, 91};
        
        System.out.println("=== Array Traversal Methods ===");
        
        // Method 1: Traditional for loop
        System.out.println("1. Traditional for loop:");
        for (int i = 0; i < fruits.length; i++) {
            System.out.println("  Index " + i + ": " + fruits[i]);
        }
        
        // Method 2: Enhanced for loop (for-each)
        System.out.println("\n2. Enhanced for loop (for-each):");
        for (String fruit : fruits) {
            System.out.println("  Fruit: " + fruit);
        }
        
        // Method 3: While loop
        System.out.println("\n3. While loop:");
        int index = 0;
        while (index < scores.length) {
            System.out.println("  Score " + (index + 1) + ": " + scores[index]);
            index++;
        }
        
        // Method 4: Reverse traversal
        System.out.println("\n4. Reverse traversal:");
        for (int i = fruits.length - 1; i >= 0; i--) {
            System.out.println("  " + fruits[i]);
        }
        
        // Method 5: Processing while traversing
        System.out.println("\n5. Calculating sum while traversing:");
        int sum = 0;
        for (int score : scores) {
            sum += score;
            System.out.println("  Current score: " + score + ", Running sum: " + sum);
        }
        System.out.println("  Final sum: " + sum);
        System.out.println("  Average: " + (double)sum / scores.length);
    }
    
    // Advanced traversal: finding elements
    public static void findElements() {
        int[] numbers = {15, 8, 23, 42, 7, 31, 18, 9, 36, 12};
        
        System.out.println("\n=== Finding Elements ===");
        printArray(numbers);
        
        // Find specific element
        int target = 23;
        boolean found = false;
        int foundIndex = -1;
        
        for (int i = 0; i < numbers.length; i++) {
            if (numbers[i] == target) {
                found = true;
                foundIndex = i;
                break; // Exit loop once found
            }
        }
        
        if (found) {
            System.out.println("Found " + target + " at index " + foundIndex);
        } else {
            System.out.println(target + " not found in the array");
        }
        
        // Find all even numbers
        System.out.println("Even numbers in the array:");
        for (int i = 0; i < numbers.length; i++) {
            if (numbers[i] % 2 == 0) {
                System.out.println("  " + numbers[i] + " at index " + i);
            }
        }
        
        // Find maximum and minimum
        int max = numbers[0];
        int min = numbers[0];
        int maxIndex = 0;
        int minIndex = 0;
        
        for (int i = 1; i < numbers.length; i++) {
            if (numbers[i] > max) {
                max = numbers[i];
                maxIndex = i;
            }
            if (numbers[i] < min) {
                min = numbers[i];
                minIndex = i;
            }
        }
        
        System.out.println("Maximum: " + max + " at index " + maxIndex);
        System.out.println("Minimum: " + min + " at index " + minIndex);
    }
    
    public static void printArray(int[] array) {
        System.out.print("[");
        for (int i = 0; i < array.length; i++) {
            System.out.print(array[i]);
            if (i < array.length - 1) {
                System.out.print(", ");
            }
        }
        System.out.println("]");
    }
    
    public static void main(String[] args) {
        demonstrateTraversal();
        findElements();
    }
}
```

## Multi-Dimensional Arrays

### Two-Dimensional Arrays

```java
public class TwoDimensionalArrays {
    
    public static void demonstrate2DArrays() {
        System.out.println("=== Two-Dimensional Arrays ===");
        
        // Declaration and initialization
        
        // Method 1: Declare and create with specific size
        int[][] matrix1 = new int[3][4]; // 3 rows, 4 columns
        
        // Method 2: Initialize with values
        int[][] matrix2 = {
            {1, 2, 3, 4},
            {5, 6, 7, 8},
            {9, 10, 11, 12}
        };
        
        // Method 3: Create and initialize separately
        int[][] matrix3 = new int[2][3];
        matrix3[0][0] = 100; matrix3[0][1] = 200; matrix3[0][2] = 300;
        matrix3[1][0] = 400; matrix3[1][1] = 500; matrix3[1][2] = 600;
        
        // Method 4: Jagged arrays (different row lengths)
        int[][] jaggedArray = {
            {1, 2},
            {3, 4, 5, 6},
            {7, 8, 9}
        };
        
        System.out.println("Matrix 2 (initialized with values):");
        print2DArray(matrix2);
        
        System.out.println("Matrix 3 (manually initialized):");
        print2DArray(matrix3);
        
        System.out.println("Jagged Array:");
        print2DArray(jaggedArray);
        
        // Populate matrix1 with multiplication table
        for (int i = 0; i < matrix1.length; i++) {
            for (int j = 0; j < matrix1[i].length; j++) {
                matrix1[i][j] = (i + 1) * (j + 1);
            }
        }
        
        System.out.println("Matrix 1 (multiplication table):");
        print2DArray(matrix1);
    }
    
    public static void practical2DExamples() {
        System.out.println("\n=== Practical 2D Array Examples ===");
        
        // Example 1: Student grades (students x subjects)
        String[] students = {"Alice", "Bob", "Charlie"};
        String[] subjects = {"Math", "Science", "English", "History"};
        int[][] grades = {
            {85, 92, 78, 88},  // Alice's grades
            {79, 85, 91, 82},  // Bob's grades
            {92, 88, 85, 90}   // Charlie's grades
        };
        
        System.out.println("Student Grade Report:");
        System.out.printf("%-10s", "Student");
        for (String subject : subjects) {
            System.out.printf("%-10s", subject);
        }
        System.out.printf("%-10s%n", "Average");
        System.out.println("-".repeat(60));
        
        for (int i = 0; i < students.length; i++) {
            System.out.printf("%-10s", students[i]);
            int sum = 0;
            for (int j = 0; j < grades[i].length; j++) {
                System.out.printf("%-10d", grades[i][j]);
                sum += grades[i][j];
            }
            double average = (double)sum / grades[i].length;
            System.out.printf("%-10.1f%n", average);
        }
        
        // Example 2: Tic-tac-toe board
        char[][] board = {
            {'X', 'O', 'X'},
            {'O', 'X', 'O'},
            {' ', 'X', 'O'}
        };
        
        System.out.println("\nTic-Tac-Toe Board:");
        printTicTacToeBoard(board);
        
        // Example 3: Matrix operations
        int[][] matrixA = {{1, 2}, {3, 4}};
        int[][] matrixB = {{5, 6}, {7, 8}};
        
        System.out.println("\nMatrix A:");
        print2DArray(matrixA);
        
        System.out.println("Matrix B:");
        print2DArray(matrixB);
        
        int[][] sum = addMatrices(matrixA, matrixB);
        System.out.println("Matrix A + Matrix B:");
        print2DArray(sum);
    }
    
    // Helper method to print 2D integer arrays
    public static void print2DArray(int[][] array) {
        for (int i = 0; i < array.length; i++) {
            for (int j = 0; j < array[i].length; j++) {
                System.out.printf("%4d ", array[i][j]);
            }
            System.out.println();
        }
        System.out.println();
    }
    
    // Helper method to print tic-tac-toe board
    public static void printTicTacToeBoard(char[][] board) {
        for (int i = 0; i < board.length; i++) {
            for (int j = 0; j < board[i].length; j++) {
                System.out.print(" " + board[i][j] + " ");
                if (j < board[i].length - 1) {
                    System.out.print("|");
                }
            }
            System.out.println();
            if (i < board.length - 1) {
                System.out.println("-----------");
            }
        }
        System.out.println();
    }
    
    // Matrix addition
    public static int[][] addMatrices(int[][] a, int[][] b) {
        if (a.length != b.length || a[0].length != b[0].length) {
            throw new IllegalArgumentException("Matrices must have the same dimensions");
        }
        
        int[][] result = new int[a.length][a[0].length];
        for (int i = 0; i < a.length; i++) {
            for (int j = 0; j < a[i].length; j++) {
                result[i][j] = a[i][j] + b[i][j];
            }
        }
        return result;
    }
    
    public static void main(String[] args) {
        demonstrate2DArrays();
        practical2DExamples();
    }
}
```

### Three-Dimensional Arrays and Beyond

```java
public class MultiDimensionalArrays {
    
    public static void demonstrate3DArrays() {
        System.out.println("=== Three-Dimensional Arrays ===");
        
        // Example: 3D array representing a cube of data
        // Think of it as: floors x rows x columns
        int floors = 2;
        int rows = 3;
        int columns = 4;
        
        int[][][] cube = new int[floors][rows][columns];
        
        // Initialize the cube with some pattern
        int value = 1;
        for (int f = 0; f < floors; f++) {
            for (int r = 0; r < rows; r++) {
                for (int c = 0; c < columns; c++) {
                    cube[f][r][c] = value++;
                }
            }
        }
        
        // Print the cube
        for (int f = 0; f < floors; f++) {
            System.out.println("Floor " + f + ":");
            for (int r = 0; r < rows; r++) {
                for (int c = 0; c < columns; c++) {
                    System.out.printf("%3d ", cube[f][r][c]);
                }
                System.out.println();
            }
            System.out.println();
        }
        
        // Practical example: Student data across multiple semesters
        // Dimensions: semester x student x subject
        String[] semesters = {"Fall", "Spring"};
        String[] students = {"Alice", "Bob", "Charlie"};
        String[] subjects = {"Math", "Science", "English"};
        
        int[][][] semesterGrades = {
            // Fall semester
            {
                {85, 90, 88},  // Alice's fall grades
                {78, 82, 85},  // Bob's fall grades
                {92, 89, 91}   // Charlie's fall grades
            },
            // Spring semester
            {
                {88, 92, 90},  // Alice's spring grades
                {82, 85, 88},  // Bob's spring grades
                {89, 91, 93}   // Charlie's spring grades
            }
        };
        
        // Print semester report
        for (int s = 0; s < semesters.length; s++) {
            System.out.println(semesters[s] + " Semester Grades:");
            System.out.printf("%-10s", "Student");
            for (String subject : subjects) {
                System.out.printf("%-10s", subject);
            }
            System.out.println();
            System.out.println("-".repeat(40));
            
            for (int i = 0; i < students.length; i++) {
                System.out.printf("%-10s", students[i]);
                for (int j = 0; j < subjects.length; j++) {
                    System.out.printf("%-10d", semesterGrades[s][i][j]);
                }
                System.out.println();
            }
            System.out.println();
        }
    }
    
    public static void main(String[] args) {
        demonstrate3DArrays();
    }
}
```

## Common Array Operations

### Array Manipulation Operations

```java
public class ArrayOperations {
    
    public static void demonstrateBasicOperations() {
        int[] original = {5, 2, 8, 1, 9, 3};
        
        System.out.println("=== Basic Array Operations ===");
        System.out.println("Original array:");
        printArray(original);
        
        // 1. Find sum and average
        int sum = calculateSum(original);
        double average = (double)sum / original.length;
        System.out.println("Sum: " + sum);
        System.out.println("Average: " + average);
        
        // 2. Find min and max
        int min = findMinimum(original);
        int max = findMaximum(original);
        System.out.println("Minimum: " + min);
        System.out.println("Maximum: " + max);
        
        // 3. Count specific elements
        int target = 8;
        int count = countOccurrences(original, target);
        System.out.println("Count of " + target + ": " + count);
        
        // 4. Reverse array
        int[] reversed = reverseArray(original);
        System.out.println("Reversed array:");
        printArray(reversed);
        
        // 5. Copy array
        int[] copied = copyArray(original);
        System.out.println("Copied array:");
        printArray(copied);
        
        // 6. Insert element at position
        int[] inserted = insertElement(original, 99, 2);
        System.out.println("Array after inserting 99 at index 2:");
        printArray(inserted);
        
        // 7. Remove element at position
        int[] removed = removeElement(original, 1);
        System.out.println("Array after removing element at index 1:");
        printArray(removed);
    }
    
    // Calculate sum of all elements
    public static int calculateSum(int[] array) {
        int sum = 0;
        for (int element : array) {
            sum += element;
        }
        return sum;
    }
    
    // Find minimum element
    public static int findMinimum(int[] array) {
        if (array.length == 0) {
            throw new IllegalArgumentException("Array cannot be empty");
        }
        
        int min = array[0];
        for (int i = 1; i < array.length; i++) {
            if (array[i] < min) {
                min = array[i];
            }
        }
        return min;
    }
    
    // Find maximum element
    public static int findMaximum(int[] array) {
        if (array.length == 0) {
            throw new IllegalArgumentException("Array cannot be empty");
        }
        
        int max = array[0];
        for (int i = 1; i < array.length; i++) {
            if (array[i] > max) {
                max = array[i];
            }
        }
        return max;
    }
    
    // Count occurrences of a specific element
    public static int countOccurrences(int[] array, int target) {
        int count = 0;
        for (int element : array) {
            if (element == target) {
                count++;
            }
        }
        return count;
    }
    
    // Reverse array (creates new array)
    public static int[] reverseArray(int[] array) {
        int[] reversed = new int[array.length];
        for (int i = 0; i < array.length; i++) {
            reversed[i] = array[array.length - 1 - i];
        }
        return reversed;
    }
    
    // Copy array
    public static int[] copyArray(int[] array) {
        int[] copy = new int[array.length];
        for (int i = 0; i < array.length; i++) {
            copy[i] = array[i];
        }
        return copy;
    }
    
    // Insert element at specific position
    public static int[] insertElement(int[] array, int element, int position) {
        if (position < 0 || position > array.length) {
            throw new IllegalArgumentException("Invalid position");
        }
        
        int[] newArray = new int[array.length + 1];
        
        // Copy elements before the insertion point
        for (int i = 0; i < position; i++) {
            newArray[i] = array[i];
        }
        
        // Insert the new element
        newArray[position] = element;
        
        // Copy remaining elements
        for (int i = position; i < array.length; i++) {
            newArray[i + 1] = array[i];
        }
        
        return newArray;
    }
    
    // Remove element at specific position
    public static int[] removeElement(int[] array, int position) {
        if (position < 0 || position >= array.length) {
            throw new IllegalArgumentException("Invalid position");
        }
        
        int[] newArray = new int[array.length - 1];
        
        // Copy elements before the removal point
        for (int i = 0; i < position; i++) {
            newArray[i] = array[i];
        }
        
        // Copy elements after the removal point
        for (int i = position + 1; i < array.length; i++) {
            newArray[i - 1] = array[i];
        }
        
        return newArray;
    }
    
    public static void printArray(int[] array) {
        System.out.print("[");
        for (int i = 0; i < array.length; i++) {
            System.out.print(array[i]);
            if (i < array.length - 1) {
                System.out.print(", ");
            }
        }
        System.out.println("]");
    }
    
    public static void main(String[] args) {
        demonstrateBasicOperations();
    }
}
```

## Array Sorting and Searching

### Sorting Algorithms

```java
public class ArraySorting {
    
    public static void demonstrateSorting() {
        int[] numbers = {64, 34, 25, 12, 22, 11, 90, 88, 76, 50, 42};
        
        System.out.println("=== Array Sorting Algorithms ===");
        System.out.println("Original array:");
        printArray(numbers);
        
        // Test different sorting algorithms
        testBubbleSort(numbers.clone());
        testSelectionSort(numbers.clone());
        testInsertionSort(numbers.clone());
        testBuiltInSort(numbers.clone());
    }
    
    public static void testBubbleSort(int[] array) {
        System.out.println("\n--- Bubble Sort ---");
        long startTime = System.nanoTime();
        bubbleSort(array);
        long endTime = System.nanoTime();
        
        System.out.println("Sorted array:");
        printArray(array);
        System.out.println("Time taken: " + (endTime - startTime) / 1000000.0 + " ms");
    }
    
    // Bubble Sort implementation
    public static void bubbleSort(int[] array) {
        int n = array.length;
        boolean swapped;
        
        for (int i = 0; i < n - 1; i++) {
            swapped = false;
            
            // Last i elements are already in place
            for (int j = 0; j < n - i - 1; j++) {
                if (array[j] > array[j + 1]) {
                    // Swap elements
                    int temp = array[j];
                    array[j] = array[j + 1];
                    array[j + 1] = temp;
                    swapped = true;
                }
            }
            
            // If no swapping occurred, array is sorted
            if (!swapped) {
                break;
            }
        }
    }
    
    public static void testSelectionSort(int[] array) {
        System.out.println("\n--- Selection Sort ---");
        long startTime = System.nanoTime();
        selectionSort(array);
        long endTime = System.nanoTime();
        
        System.out.println("Sorted array:");
        printArray(array);
        System.out.println("Time taken: " + (endTime - startTime) / 1000000.0 + " ms");
    }
    
    // Selection Sort implementation
    public static void selectionSort(int[] array) {
        int n = array.length;
        
        for (int i = 0; i < n - 1; i++) {
            // Find the minimum element in remaining unsorted array
            int minIndex = i;
            for (int j = i + 1; j < n; j++) {
                if (array[j] < array[minIndex]) {
                    minIndex = j;
                }
            }
            
            // Swap the found minimum element with the first element
            int temp = array[minIndex];
            array[minIndex] = array[i];
            array[i] = temp;
        }
    }
    
    public static void testInsertionSort(int[] array) {
        System.out.println("\n--- Insertion Sort ---");
        long startTime = System.nanoTime();
        insertionSort(array);
        long endTime = System.nanoTime();
        
        System.out.println("Sorted array:");
        printArray(array);
        System.out.println("Time taken: " + (endTime - startTime) / 1000000.0 + " ms");
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
    
    public static void testBuiltInSort(int[] array) {
        System.out.println("\n--- Built-in Sort (Arrays.sort) ---");
        long startTime = System.nanoTime();
        java.util.Arrays.sort(array);
        long endTime = System.nanoTime();
        
        System.out.println("Sorted array:");
        printArray(array);
        System.out.println("Time taken: " + (endTime - startTime) / 1000000.0 + " ms");
    }
    
    public static void printArray(int[] array) {
        System.out.print("[");
        for (int i = 0; i < array.length; i++) {
            System.out.print(array[i]);
            if (i < array.length - 1) {
                System.out.print(", ");
            }
        }
        System.out.println("]");
    }
    
    public static void main(String[] args) {
        demonstrateSorting();
    }
}
```

### Searching Algorithms

```java
public class ArraySearching {
    
    public static void demonstrateSearching() {
        int[] unsortedArray = {64, 34, 25, 12, 22, 11, 90, 88, 76, 50, 42};
        int[] sortedArray = {11, 12, 22, 25, 34, 42, 50, 64, 76, 88, 90};
        
        System.out.println("=== Array Searching Algorithms ===");
        System.out.println("Unsorted array:");
        printArray(unsortedArray);
        System.out.println("Sorted array:");
        printArray(sortedArray);
        
        int target = 25;
        System.out.println("\nSearching for: " + target);
        
        // Linear search on unsorted array
        testLinearSearch(unsortedArray, target);
        
        // Linear search on sorted array
        testLinearSearch(sortedArray, target);
        
        // Binary search on sorted array
        testBinarySearch(sortedArray, target);
        
        // Test with element not in array
        int notFound = 100;
        System.out.println("\nSearching for: " + notFound + " (not in array)");
        testLinearSearch(sortedArray, notFound);
        testBinarySearch(sortedArray, notFound);
    }
    
    public static void testLinearSearch(int[] array, int target) {
        System.out.println("\n--- Linear Search ---");
        long startTime = System.nanoTime();
        int result = linearSearch(array, target);
        long endTime = System.nanoTime();
        
        if (result != -1) {
            System.out.println("Element found at index: " + result);
        } else {
            System.out.println("Element not found");
        }
        System.out.println("Time taken: " + (endTime - startTime) + " nanoseconds");
    }
    
    // Linear Search implementation
    public static int linearSearch(int[] array, int target) {
        for (int i = 0; i < array.length; i++) {
            if (array[i] == target) {
                return i; // Return index of found element
            }
        }
        return -1; // Element not found
    }
    
    public static void testBinarySearch(int[] array, int target) {
        System.out.println("\n--- Binary Search ---");
        long startTime = System.nanoTime();
        int result = binarySearch(array, target);
        long endTime = System.nanoTime();
        
        if (result != -1) {
            System.out.println("Element found at index: " + result);
        } else {
            System.out.println("Element not found");
        }
        System.out.println("Time taken: " + (endTime - startTime) + " nanoseconds");
    }
    
    // Binary Search implementation (requires sorted array)
    public static int binarySearch(int[] array, int target) {
        int left = 0;
        int right = array.length - 1;
        
        while (left <= right) {
            int mid = left + (right - left) / 2;
            
            // Check if target is at mid
            if (array[mid] == target) {
                return mid;
            }
            
            // If target is greater, ignore left half
            if (array[mid] < target) {
                left = mid + 1;
            }
            // If target is smaller, ignore right half
            else {
                right = mid - 1;
            }
        }
        
        return -1; // Element not found
    }
    
    // Advanced search: find all occurrences
    public static void findAllOccurrences() {
        int[] arrayWithDuplicates = {2, 5, 8, 5, 12, 5, 3, 5, 9};
        int target = 5;
        
        System.out.println("\n=== Finding All Occurrences ===");
        System.out.println("Array:");
        printArray(arrayWithDuplicates);
        System.out.println("Finding all occurrences of: " + target);
        
        int[] indices = findAllIndices(arrayWithDuplicates, target);
        if (indices.length > 0) {
            System.out.print("Found at indices: ");
            for (int i = 0; i < indices.length; i++) {
                System.out.print(indices[i]);
                if (i < indices.length - 1) {
                    System.out.print(", ");
                }
            }
            System.out.println();
            System.out.println("Total occurrences: " + indices.length);
        } else {
            System.out.println("Element not found");
        }
    }
    
    // Find all indices where target appears
    public static int[] findAllIndices(int[] array, int target) {
        // First, count occurrences
        int count = 0;
        for (int element : array) {
            if (element == target) {
                count++;
            }
        }
        
        // Create result array
        int[] indices = new int[count];
        int index = 0;
        
        // Fill result array with indices
        for (int i = 0; i < array.length; i++) {
            if (array[i] == target) {
                indices[index++] = i;
            }
        }
        
        return indices;
    }
    
    public static void printArray(int[] array) {
        System.out.print("[");
        for (int i = 0; i < array.length; i++) {
            System.out.print(array[i]);
            if (i < array.length - 1) {
                System.out.print(", ");
            }
        }
        System.out.println("]");
    }
    
    public static void main(String[] args) {
        demonstrateSearching();
        findAllOccurrences();
    }
}
```

## Practical Array Applications

### Complete Array Utility Class

```java
/**
 * A comprehensive utility class demonstrating practical array operations
 * commonly used in real-world applications.
 */
public class ArrayUtilities {
    
    /**
     * Statistical analysis of an array
     */
    public static class Statistics {
        public final double sum;
        public final double mean;
        public final double median;
        public final int min;
        public final int max;
        public final double standardDeviation;
        
        public Statistics(double sum, double mean, double median, 
                         int min, int max, double standardDeviation) {
            this.sum = sum;
            this.mean = mean;
            this.median = median;
            this.min = min;
            this.max = max;
            this.standardDeviation = standardDeviation;
        }
        
        @Override
        public String toString() {
            return String.format(
                "Statistics{sum=%.2f, mean=%.2f, median=%.2f, min=%d, max=%d, stdDev=%.2f}",
                sum, mean, median, min, max, standardDeviation
            );
        }
    }
    
    /**
     * Calculate comprehensive statistics for an array
     */
    public static Statistics calculateStatistics(int[] array) {
        if (array == null || array.length == 0) {
            throw new IllegalArgumentException("Array cannot be null or empty");
        }
        
        // Calculate sum and mean
        double sum = 0;
        for (int value : array) {
            sum += value;
        }
        double mean = sum / array.length;
        
        // Find min and max
        int min = array[0];
        int max = array[0];
        for (int i = 1; i < array.length; i++) {
            if (array[i] < min) min = array[i];
            if (array[i] > max) max = array[i];
        }
        
        // Calculate median (requires sorting)
        int[] sorted = array.clone();
        java.util.Arrays.sort(sorted);
        double median;
        if (sorted.length % 2 == 0) {
            median = (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2.0;
        } else {
            median = sorted[sorted.length / 2];
        }
        
        // Calculate standard deviation
        double sumSquaredDifferences = 0;
        for (int value : array) {
            double difference = value - mean;
            sumSquaredDifferences += difference * difference;
        }
        double variance = sumSquaredDifferences / array.length;
        double standardDeviation = Math.sqrt(variance);
        
        return new Statistics(sum, mean, median, min, max, standardDeviation);
    }
    
    /**
     * Remove duplicates from an array
     */
    public static int[] removeDuplicates(int[] array) {
        if (array == null || array.length == 0) {
            return new int[0];
        }
        
        // Count unique elements
        int uniqueCount = 0;
        for (int i = 0; i < array.length; i++) {
            boolean isDuplicate = false;
            for (int j = 0; j < i; j++) {
                if (array[i] == array[j]) {
                    isDuplicate = true;
                    break;
                }
            }
            if (!isDuplicate) {
                uniqueCount++;
            }
        }
        
        // Create array with unique elements
        int[] unique = new int[uniqueCount];
        int index = 0;
        for (int i = 0; i < array.length; i++) {
            boolean isDuplicate = false;
            for (int j = 0; j < i; j++) {
                if (array[i] == array[j]) {
                    isDuplicate = true;
                    break;
                }
            }
            if (!isDuplicate) {
                unique[index++] = array[i];
            }
        }
        
        return unique;
    }
    
    /**
     * Merge two sorted arrays into one sorted array
     */
    public static int[] mergeSortedArrays(int[] array1, int[] array2) {
        int[] merged = new int[array1.length + array2.length];
        int i = 0, j = 0, k = 0;
        
        // Merge elements in sorted order
        while (i < array1.length && j < array2.length) {
            if (array1[i] <= array2[j]) {
                merged[k++] = array1[i++];
            } else {
                merged[k++] = array2[j++];
            }
        }
        
        // Copy remaining elements
        while (i < array1.length) {
            merged[k++] = array1[i++];
        }
        while (j < array2.length) {
            merged[k++] = array2[j++];
        }
        
        return merged;
    }
    
    /**
     * Rotate array to the left by k positions
     */
    public static int[] rotateLeft(int[] array, int k) {
        if (array == null || array.length == 0) {
            return array;
        }
        
        k = k % array.length; // Handle k > array.length
        int[] rotated = new int[array.length];
        
        for (int i = 0; i < array.length; i++) {
            rotated[i] = array[(i + k) % array.length];
        }
        
        return rotated;
    }
    
    /**
     * Find the longest increasing subsequence length
     */
    public static int longestIncreasingSubsequence(int[] array) {
        if (array == null || array.length == 0) {
            return 0;
        }
        
        int maxLength = 1;
        int currentLength = 1;
        
        for (int i = 1; i < array.length; i++) {
            if (array[i] > array[i - 1]) {
                currentLength++;
                maxLength = Math.max(maxLength, currentLength);
            } else {
                currentLength = 1;
            }
        }
        
        return maxLength;
    }
    
    /**
     * Check if array is a palindrome
     */
    public static boolean isPalindrome(int[] array) {
        if (array == null) {
            return false;
        }
        
        int left = 0;
        int right = array.length - 1;
        
        while (left < right) {
            if (array[left] != array[right]) {
                return false;
            }
            left++;
            right--;
        }
        
        return true;
    }
    
    /**
     * Demonstration of all utility methods
     */
    public static void demonstrateUtilities() {
        System.out.println("=== Array Utilities Demonstration ===");
        
        // Test data
        int[] numbers = {5, 2, 8, 2, 1, 9, 5, 3, 8, 1};
        int[] sortedArray1 = {1, 3, 5, 7, 9};
        int[] sortedArray2 = {2, 4, 6, 8, 10, 12};
        int[] palindromeArray = {1, 2, 3, 2, 1};
        int[] increasingArray = {1, 2, 2, 3, 5, 4, 6, 7, 8};
        
        System.out.println("Original array:");
        printArray(numbers);
        
        // Statistics
        Statistics stats = calculateStatistics(numbers);
        System.out.println("\nStatistics: " + stats);
        
        // Remove duplicates
        int[] unique = removeDuplicates(numbers);
        System.out.println("\nArray without duplicates:");
        printArray(unique);
        
        // Merge sorted arrays
        int[] merged = mergeSortedArrays(sortedArray1, sortedArray2);
        System.out.println("\nMerged sorted arrays:");
        System.out.print("Array 1: "); printArray(sortedArray1);
        System.out.print("Array 2: "); printArray(sortedArray2);
        System.out.print("Merged:  "); printArray(merged);
        
        // Rotate array
        int[] rotated = rotateLeft(numbers, 3);
        System.out.println("\nArray rotated left by 3 positions:");
        printArray(rotated);
        
        // Check palindrome
        System.out.println("\nPalindrome check:");
        System.out.print("Array: "); printArray(palindromeArray);
        System.out.println("Is palindrome: " + isPalindrome(palindromeArray));
        System.out.print("Array: "); printArray(numbers);
        System.out.println("Is palindrome: " + isPalindrome(numbers));
        
        // Longest increasing subsequence
        System.out.println("\nLongest increasing subsequence:");
        System.out.print("Array: "); printArray(increasingArray);
        System.out.println("Length: " + longestIncreasingSubsequence(increasingArray));
    }
    
    public static void printArray(int[] array) {
        System.out.print("[");
        for (int i = 0; i < array.length; i++) {
            System.out.print(array[i]);
            if (i < array.length - 1) {
                System.out.print(", ");
            }
        }
        System.out.println("]");
    }
    
    public static void main(String[] args) {
        demonstrateUtilities();
    }
}
```

## Summary

In this fifth part of our Java tutorial series, you've learned:

✅ **Array Fundamentals**: Declaration, initialization, and basic array concepts  
✅ **Array Access**: Indexing, traversal methods, and safe access techniques  
✅ **Multi-dimensional Arrays**: Working with 2D, 3D, and nested array structures  
✅ **Array Operations**: Common manipulations like copying, reversing, and modifying  
✅ **Sorting Algorithms**: Bubble sort, selection sort, insertion sort, and built-in sorting  
✅ **Searching Algorithms**: Linear search, binary search, and finding multiple occurrences  
✅ **Practical Applications**: Real-world array utilities and statistical operations  

### Key Takeaways

1. **Fixed Size**: Arrays have a fixed size that cannot be changed after creation
2. **Zero-based Indexing**: Array indices start at 0 and go up to length-1
3. **Type Safety**: All elements in an array must be of the same type
4. **Performance**: Arrays provide constant-time access to elements by index
5. **Memory Efficiency**: Arrays store elements in contiguous memory locations

### Common Pitfalls to Avoid

1. **ArrayIndexOutOfBoundsException**: Always check array bounds before accessing
2. **NullPointerException**: Check for null arrays before operations
3. **Off-by-one Errors**: Remember that array indices go from 0 to length-1
4. **Modifying Arrays During Iteration**: Be careful when changing array size during loops
5. **Assuming Array Contents**: Arrays of objects are initialized to null, primitives to their default values

### What's Next?

In **Part 6: Object-Oriented Programming Basics**, we'll explore:
- Classes and objects
- Constructors and initialization
- Instance variables and methods
- The `this` keyword
- Encapsulation principles

### Practice Exercises

Before moving on, try these exercises:

1. **Grade Manager**: Create a program that manages student grades using arrays
2. **Matrix Calculator**: Implement basic matrix operations (addition, multiplication, transpose)
3. **Data Analysis**: Build a program that analyzes sales data using array statistics
4. **Game Board**: Create a tic-tac-toe or connect-four game using 2D arrays
5. **Sorting Comparison**: Compare the performance of different sorting algorithms

Ready to dive into object-oriented programming? Let's continue to Part 6!

---

*This tutorial is part of our comprehensive Java Tutorial Series. Arrays are fundamental to programming and data manipulation, so practice these concepts thoroughly before moving to object-oriented programming.*