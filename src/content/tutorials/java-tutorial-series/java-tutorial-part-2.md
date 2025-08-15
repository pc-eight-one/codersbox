---
title: "Java Tutorial Series - Part 2: Java Basics"
description: "Master Java fundamentals including variables, data types, operators, input/output operations, and comments. Learn the building blocks of Java programming."
publishDate: 2025-01-15
tags: ["Java", "Variables", "Data Types", "Operators", "Input Output", "Scanner"]
difficulty: "beginner"
series: "Java Tutorial Series"
part: 2
estimatedTime: "60 minutes"
totalParts: 24
featured: false
---

# Java Tutorial Series - Part 2: Java Basics

Now that you have Java set up and understand the basic program structure, let's dive into the fundamental building blocks of Java programming. In this part, we'll explore variables, data types, operators, and input/output operations.

## Variables and Data Types

Variables are containers that store data values. In Java, every variable must be declared with a specific data type before use.

### Variable Declaration and Initialization

```java
// Declaration
int age;                    // Declare an integer variable
String name;               // Declare a String variable

// Initialization
age = 25;                  // Assign value to age
name = "Alice";           // Assign value to name

// Declaration and initialization in one line
int score = 95;           // Declare and initialize
double salary = 50000.50; // Declare and initialize
boolean isActive = true;   // Declare and initialize
```

### Primitive Data Types

Java has 8 primitive data types:

#### Integer Types
```java
public class IntegerTypes {
    public static void main(String[] args) {
        byte smallNumber = 127;           // 8-bit: -128 to 127
        short mediumNumber = 32000;       // 16-bit: -32,768 to 32,767
        int regularNumber = 1000000;      // 32-bit: -2^31 to 2^31-1
        long largeNumber = 9000000000L;   // 64-bit: -2^63 to 2^63-1 (note the 'L')
        
        System.out.println("Byte: " + smallNumber);
        System.out.println("Short: " + mediumNumber);
        System.out.println("Int: " + regularNumber);
        System.out.println("Long: " + largeNumber);
    }
}
```

#### Floating-Point Types
```java
public class FloatingTypes {
    public static void main(String[] args) {
        float price = 19.99F;             // 32-bit (note the 'F')
        double preciseValue = 19.99999999; // 64-bit (default for decimals)
        
        System.out.println("Float precision: " + price);
        System.out.println("Double precision: " + preciseValue);
        
        // Scientific notation
        double scientificNumber = 1.23e-4; // 0.000123
        System.out.println("Scientific: " + scientificNumber);
    }
}
```

#### Other Primitive Types
```java
public class OtherPrimitives {
    public static void main(String[] args) {
        char grade = 'A';                 // 16-bit Unicode character
        char unicodeChar = '\u0041';      // Unicode for 'A'
        boolean isValid = true;           // true or false only
        
        System.out.println("Grade: " + grade);
        System.out.println("Unicode: " + unicodeChar);
        System.out.println("Boolean: " + isValid);
    }
}
```

### Reference Types

Reference types store references (addresses) to objects in memory:

```java
public class ReferenceTypes {
    public static void main(String[] args) {
        String message = "Hello World";    // String is a reference type
        String anotherMessage = new String("Hello World");
        
        // Arrays are reference types
        int[] numbers = {1, 2, 3, 4, 5};
        
        // Objects are reference types
        StringBuilder builder = new StringBuilder("Java");
        
        System.out.println("String: " + message);
        System.out.println("Array length: " + numbers.length);
        System.out.println("StringBuilder: " + builder.toString());
    }
}
```

### Key Differences: Primitive vs Reference Types

```java
public class PrimitiveVsReference {
    public static void main(String[] args) {
        // Primitive types store actual values
        int num1 = 10;
        int num2 = num1;    // num2 gets a copy of num1's value
        num1 = 20;          // Changing num1 doesn't affect num2
        System.out.println("num1: " + num1 + ", num2: " + num2); // 20, 10
        
        // Reference types store memory addresses
        StringBuilder sb1 = new StringBuilder("Hello");
        StringBuilder sb2 = sb1;    // sb2 points to same object as sb1
        sb1.append(" World");       // Modifying through sb1 affects sb2
        System.out.println("sb1: " + sb1 + ", sb2: " + sb2); // Both: "Hello World"
    }
}
```

## Operators

Java provides various operators to perform operations on variables and values.

### Arithmetic Operators

```java
public class ArithmeticOperators {
    public static void main(String[] args) {
        int a = 15, b = 4;
        
        System.out.println("Addition: " + a + " + " + b + " = " + (a + b));
        System.out.println("Subtraction: " + a + " - " + b + " = " + (a - b));
        System.out.println("Multiplication: " + a + " * " + b + " = " + (a * b));
        System.out.println("Division: " + a + " / " + b + " = " + (a / b));      // Integer division
        System.out.println("Modulo: " + a + " % " + b + " = " + (a % b));        // Remainder
        
        // Floating-point division
        double result = (double) a / b;
        System.out.println("Float division: " + a + " / " + b + " = " + result);
        
        // Unary operators
        int x = 5;
        System.out.println("x = " + x);
        System.out.println("++x = " + (++x));    // Pre-increment: x becomes 6, then returns 6
        System.out.println("x++ = " + (x++));    // Post-increment: returns 6, then x becomes 7
        System.out.println("x = " + x);          // x is now 7
        System.out.println("--x = " + (--x));    // Pre-decrement: x becomes 6, then returns 6
    }
}
```

### Relational Operators

```java
public class RelationalOperators {
    public static void main(String[] args) {
        int x = 10, y = 20;
        
        System.out.println("x = " + x + ", y = " + y);
        System.out.println("x == y: " + (x == y));    // Equal to
        System.out.println("x != y: " + (x != y));    // Not equal to
        System.out.println("x < y: " + (x < y));      // Less than
        System.out.println("x > y: " + (x > y));      // Greater than
        System.out.println("x <= y: " + (x <= y));    // Less than or equal to
        System.out.println("x >= y: " + (x >= y));    // Greater than or equal to
        
        // String comparison (be careful!)
        String str1 = "Hello";
        String str2 = "Hello";
        String str3 = new String("Hello");
        
        System.out.println("str1 == str2: " + (str1 == str2));        // true (string pool)
        System.out.println("str1 == str3: " + (str1 == str3));        // false (different objects)
        System.out.println("str1.equals(str3): " + str1.equals(str3)); // true (content comparison)
    }
}
```

### Logical Operators

```java
public class LogicalOperators {
    public static void main(String[] args) {
        boolean a = true, b = false;
        
        System.out.println("a = " + a + ", b = " + b);
        System.out.println("a && b: " + (a && b));    // Logical AND
        System.out.println("a || b: " + (a || b));    // Logical OR
        System.out.println("!a: " + (!a));            // Logical NOT
        
        // Short-circuit evaluation
        int x = 5, y = 0;
        System.out.println("Short-circuit AND: " + (y != 0 && x / y > 2)); // false, division not performed
        System.out.println("Short-circuit OR: " + (y == 0 || x / y > 2));  // true, division not performed
        
        // Complex logical expressions
        int age = 25;
        boolean hasLicense = true;
        boolean canDrive = age >= 18 && hasLicense;
        System.out.println("Can drive: " + canDrive);
    }
}
```

### Bitwise Operators (Advanced)

```java
public class BitwiseOperators {
    public static void main(String[] args) {
        int a = 5;   // Binary: 0101
        int b = 3;   // Binary: 0011
        
        System.out.println("a = " + a + " (binary: " + Integer.toBinaryString(a) + ")");
        System.out.println("b = " + b + " (binary: " + Integer.toBinaryString(b) + ")");
        
        System.out.println("a & b = " + (a & b));    // AND: 0001 = 1
        System.out.println("a | b = " + (a | b));    // OR:  0111 = 7
        System.out.println("a ^ b = " + (a ^ b));    // XOR: 0110 = 6
        System.out.println("~a = " + (~a));          // NOT: ...11111010 = -6
        System.out.println("a << 1 = " + (a << 1)); // Left shift: 1010 = 10
        System.out.println("a >> 1 = " + (a >> 1)); // Right shift: 010 = 2
    }
}
```

## Input and Output Operations

### Basic Output with System.out

```java
public class OutputExamples {
    public static void main(String[] args) {
        String name = "Alice";
        int age = 25;
        double salary = 50000.75;
        
        // Different ways to print
        System.out.print("Hello ");           // No newline
        System.out.print("World!\n");         // Manual newline
        
        System.out.println("Name: " + name);  // With newline
        
        // String concatenation vs printf-style formatting
        System.out.println("Age: " + age + ", Salary: $" + salary);
        System.out.printf("Formatted: Age: %d, Salary: $%.2f%n", age, salary);
        
        // Common format specifiers
        System.out.printf("Integer: %d%n", 42);
        System.out.printf("Float: %.2f%n", 3.14159);
        System.out.printf("String: %s%n", "Java");
        System.out.printf("Character: %c%n", 'A');
        System.out.printf("Boolean: %b%n", true);
    }
}
```

### Input with Scanner

```java
import java.util.Scanner;

public class InputExamples {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        
        // Reading different types of input
        System.out.print("Enter your name: ");
        String name = scanner.nextLine();
        
        System.out.print("Enter your age: ");
        int age = scanner.nextInt();
        
        System.out.print("Enter your salary: ");
        double salary = scanner.nextDouble();
        
        System.out.print("Are you employed (true/false): ");
        boolean employed = scanner.nextBoolean();
        
        // Clear the buffer after nextBoolean()
        scanner.nextLine();
        
        System.out.print("Enter your city: ");
        String city = scanner.nextLine();
        
        // Display collected information
        System.out.println("\n--- Your Information ---");
        System.out.println("Name: " + name);
        System.out.println("Age: " + age);
        System.out.printf("Salary: $%.2f%n", salary);
        System.out.println("Employed: " + employed);
        System.out.println("City: " + city);
        
        // Always close the scanner
        scanner.close();
    }
}
```

### Practical Input Validation Example

```java
import java.util.Scanner;

public class InputValidation {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        
        // Get valid age (1-120)
        int age = 0;
        while (age < 1 || age > 120) {
            System.out.print("Enter your age (1-120): ");
            
            if (scanner.hasNextInt()) {
                age = scanner.nextInt();
                if (age < 1 || age > 120) {
                    System.out.println("Please enter an age between 1 and 120.");
                }
            } else {
                System.out.println("Please enter a valid number.");
                scanner.next(); // Clear invalid input
            }
        }
        
        // Get valid grade (A-F)
        scanner.nextLine(); // Clear buffer
        String grade = "";
        while (!grade.matches("[A-Fa-f]")) {
            System.out.print("Enter your grade (A-F): ");
            grade = scanner.nextLine().trim();
            
            if (!grade.matches("[A-Fa-f]")) {
                System.out.println("Please enter a valid grade (A, B, C, D, or F).");
            }
        }
        
        System.out.println("Valid input received!");
        System.out.println("Age: " + age);
        System.out.println("Grade: " + grade.toUpperCase());
        
        scanner.close();
    }
}
```

## Comments

Comments are essential for code documentation and readability.

### Types of Comments

```java
/**
 * This is a Javadoc comment for the entire class.
 * It describes what this class does and how to use it.
 * 
 * @author Your Name
 * @version 1.0
 * @since 2025-01-15
 */
public class CommentExamples {
    
    // This is a single-line comment
    private String name;
    
    /*
     * This is a multi-line comment.
     * It can span multiple lines and is useful
     * for longer explanations.
     */
    private int age;
    
    /**
     * This is a Javadoc comment for a method.
     * It explains what the method does, its parameters, and return value.
     * 
     * @param name The person's name
     * @param age The person's age
     * @return A formatted greeting string
     */
    public String createGreeting(String name, int age) {
        // Validate input parameters
        if (name == null || name.trim().isEmpty()) {
            return "Hello, Unknown!";
        }
        
        /*
         * Create a personalized greeting based on age.
         * Different messages for different age groups.
         */
        String greeting;
        if (age < 18) {
            greeting = "Hello, young " + name + "!";
        } else if (age < 65) {
            greeting = "Hello, " + name + "!";        // Standard greeting
        } else {
            greeting = "Hello, respected " + name + "!";
        }
        
        return greeting;
    }
    
    public static void main(String[] args) {
        // TODO: Add more comprehensive examples
        CommentExamples example = new CommentExamples();
        
        // Test the greeting method with different inputs
        System.out.println(example.createGreeting("Alice", 16));  // Young greeting
        System.out.println(example.createGreeting("Bob", 30));    // Standard greeting
        System.out.println(example.createGreeting("Carol", 70));  // Respectful greeting
        
        // FIXME: This might cause issues with null input - need to test
        System.out.println(example.createGreeting(null, 25));
    }
}
```

### Comment Best Practices

```java
public class CommentBestPractices {
    
    // Good: Explains why, not what
    private static final int MAX_RETRIES = 3; // Based on network timeout analysis
    
    // Bad: States the obvious
    // private int count = 0; // Initialize count to 0
    
    /**
     * Calculates compound interest using the formula: A = P(1 + r/n)^(nt)
     * 
     * @param principal Initial amount (P)
     * @param rate Annual interest rate as decimal (r)
     * @param compoundFrequency Number of times interest compounds per year (n)
     * @param years Investment period in years (t)
     * @return Final amount after compound interest
     */
    public double calculateCompoundInterest(double principal, double rate, 
                                          int compoundFrequency, int years) {
        // Using Math.pow for exponentiation: (1 + r/n)^(nt)
        double base = 1 + (rate / compoundFrequency);
        double exponent = compoundFrequency * years;
        
        return principal * Math.pow(base, exponent);
    }
}
```

## Practical Example: Simple Calculator

Let's put everything together in a practical example:

```java
import java.util.Scanner;

/**
 * A simple calculator that performs basic arithmetic operations.
 * Demonstrates variables, data types, operators, input/output, and comments.
 */
public class SimpleCalculator {
    
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        
        System.out.println("=== Simple Calculator ===");
        System.out.println("Supported operations: +, -, *, /, %");
        
        // Get first number
        System.out.print("Enter first number: ");
        double num1 = scanner.nextDouble();
        
        // Get operator
        System.out.print("Enter operator (+, -, *, /, %): ");
        char operator = scanner.next().charAt(0);
        
        // Get second number
        System.out.print("Enter second number: ");
        double num2 = scanner.nextDouble();
        
        // Perform calculation
        double result = 0;
        boolean validOperation = true;
        
        switch (operator) {
            case '+':
                result = num1 + num2;
                break;
            case '-':
                result = num1 - num2;
                break;
            case '*':
                result = num1 * num2;
                break;
            case '/':
                if (num2 != 0) {
                    result = num1 / num2;
                } else {
                    System.out.println("Error: Division by zero!");
                    validOperation = false;
                }
                break;
            case '%':
                if (num2 != 0) {
                    result = num1 % num2;
                } else {
                    System.out.println("Error: Modulo by zero!");
                    validOperation = false;
                }
                break;
            default:
                System.out.println("Error: Invalid operator!");
                validOperation = false;
        }
        
        // Display result
        if (validOperation) {
            System.out.printf("%.2f %c %.2f = %.2f%n", num1, operator, num2, result);
            
            // Additional information
            if (result == (int) result) {
                System.out.println("Result is a whole number: " + (int) result);
            }
            
            if (result > 0) {
                System.out.println("Result is positive");
            } else if (result < 0) {
                System.out.println("Result is negative");
            } else {
                System.out.println("Result is zero");
            }
        }
        
        scanner.close();
    }
}
```

## Summary

In this second part of our Java tutorial series, you've learned:

✅ **Variables and Data Types**: Understanding primitive types (int, double, boolean, char) and reference types (String, arrays, objects)  
✅ **Type Differences**: Key distinctions between primitive and reference types  
✅ **Operators**: Arithmetic, relational, logical, and bitwise operators  
✅ **Input/Output**: Using Scanner for input and System.out for formatted output  
✅ **Comments**: Single-line, multi-line, and Javadoc comments for documentation  

### Key Takeaways

1. **Choose Appropriate Data Types**: Use the most suitable data type for your data to optimize memory usage
2. **Understand Operator Precedence**: Know the order of operations to write correct expressions
3. **Validate Input**: Always validate user input to prevent runtime errors
4. **Comment Wisely**: Write comments that explain why, not what
5. **Type Safety**: Java's strong typing helps catch errors at compile time

### What's Next?

In **Part 3: Control Flow**, we'll explore:
- Conditional statements (if-else, switch)
- Loops (for, while, do-while)
- Break and continue statements
- Nested control structures
- Best practices for readable control flow

### Practice Exercises

Before moving on, try these exercises:

1. **Temperature Converter**: Create a program that converts between Celsius and Fahrenheit
2. **Grade Calculator**: Build a program that calculates letter grades from numeric scores
3. **Number Analyzer**: Write a program that analyzes a number (even/odd, positive/negative, prime)

Ready for the next part? Let's explore control flow structures in Part 3!

---

*This tutorial is part of our comprehensive Java Tutorial Series. Make sure you understand these fundamental concepts as they form the foundation for everything else in Java.*