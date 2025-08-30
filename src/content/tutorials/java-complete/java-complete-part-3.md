---
title: "Java Complete - Part 3: Basic Syntax and Data Types"
description: "Master Java's fundamental building blocks. Learn variables, primitive types, type conversion, and the structure of Java programs through practical examples."
publishDate: 2025-08-29
publishedAt: 2025-08-29
tags: ["Java", "Variables", "Data Types", "Syntax", "Programming"]
difficulty: "beginner"
series: "Java Complete"
part: 3
estimatedTime: "50 minutes"
totalParts: 17
featured: false
---

# Java Complete - Part 3: Basic Syntax and Data Types

Every programming language has rules that govern how you express ideas in code. Java's syntax balances expressiveness with clarity, designed to be readable by both compiler and human. In this tutorial, we'll explore the fundamental elements that form every Java program: variables, data types, and the structure that holds them together.

## Anatomy of a Java Program

Let's dissect a simple but complete Java program:

```java
package com.codersbox.basics;          // Package declaration

import java.time.LocalDateTime;        // Import statement
import java.text.NumberFormat;

/**
 * A program demonstrating Java's basic syntax and data types.
 * This class calculates compound interest and displays results.
 */
public class InvestmentCalculator {    // Class declaration
    // Class-level constant
    private static final double DEFAULT_RATE = 0.05;
    
    public static void main(String[] args) {  // Method declaration
        // Local variables
        double principal = 10000.0;
        double interestRate = 0.07;
        int years = 5;
        boolean isCompounding = true;
        
        // Calculate compound interest
        double finalAmount = calculateCompoundInterest(
            principal, interestRate, years, isCompounding
        );
        
        // Display results
        displayResults(principal, interestRate, years, finalAmount);
    }
    
    private static double calculateCompoundInterest(
            double principal, double rate, int periods, boolean compound) {
        if (compound) {
            return principal * Math.pow(1 + rate, periods);
        } else {
            return principal * (1 + rate * periods);
        }
    }
    
    private static void displayResults(
            double principal, double rate, int years, double result) {
        NumberFormat currency = NumberFormat.getCurrencyInstance();
        NumberFormat percent = NumberFormat.getPercentInstance();
        
        System.out.println("=== Investment Analysis ===");
        System.out.printf("Initial investment: %s%n", currency.format(principal));
        System.out.printf("Annual interest rate: %s%n", percent.format(rate));
        System.out.printf("Investment period: %d years%n", years);
        System.out.printf("Final amount: %s%n", currency.format(result));
        System.out.printf("Total gain: %s%n", currency.format(result - principal));
        System.out.println("Calculated at: " + LocalDateTime.now());
    }
}
```

When you run this program:
```
=== Investment Analysis ===
Initial investment: $10,000.00
Annual interest rate: 7%
Investment period: 5 years
Final amount: $14,025.52
Total gain: $4,025.52
Calculated at: 2025-01-29T10:30:45.123
```

## Java Program Structure

### Package Declaration
```java
package com.codersbox.basics;
```

Packages organize related classes and prevent naming conflicts. The package name typically follows your domain name in reverse (like `com.company.project`). This must be the first non-comment line in your file.

### Import Statements
```java
import java.time.LocalDateTime;
import java.text.NumberFormat;
import java.util.*;  // Wildcard import (use sparingly)
```

Imports make classes from other packages available. Prefer specific imports over wildcards for clarity.

### Class Declaration
```java
public class InvestmentCalculator {
    // class body
}
```

Every Java program needs at least one class. The filename must match the public class name exactly.

## Variables and Identifiers

Variables store data that your program manipulates. Java requires you to declare variables before using them:

```java
public class VariableDemo {
    public static void main(String[] args) {
        // Declaration and initialization
        int age = 25;
        String name = "Alice";
        double salary = 75000.50;
        boolean isActive = true;
        
        // Declaration without initialization
        int count;
        count = 10;  // Must initialize before use
        
        // Multiple variables of same type
        int width = 800, height = 600;
        
        // Final variables (constants)
        final double PI = 3.14159265359;
        final String COMPANY_NAME = "TechCorp";
        
        System.out.println(name + " is " + age + " years old");
        System.out.println("Salary: $" + salary);
        System.out.println("Status: " + (isActive ? "Active" : "Inactive"));
    }
}
```

### Identifier Rules
Valid identifiers must:
- Start with a letter, underscore (_), or dollar sign ($)
- Contain only letters, digits, underscores, and dollar signs
- Not be a Java keyword
- Be case-sensitive

```java
// Valid identifiers
int studentAge;
double _temperature;
String $currency;
boolean isReady2Go;

// Invalid identifiers
// int 2students;     // Starts with digit
// double class;      // Java keyword
// String student-name; // Contains hyphen
```

### Naming Conventions
Java follows consistent naming patterns:
- **Variables and methods**: camelCase (`studentName`, `calculateInterest`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_SIZE`, `DEFAULT_TIMEOUT`)
- **Classes**: PascalCase (`BankAccount`, `HttpClient`)
- **Packages**: lowercase (`com.company.utilities`)

## Primitive Data Types

Java provides eight primitive types that store data efficiently:

### Integer Types

```java
public class IntegerTypes {
    public static void main(String[] args) {
        byte smallNumber = 127;        // 8 bits: -128 to 127
        short mediumNumber = 32767;    // 16 bits: -32,768 to 32,767
        int regularNumber = 2147483647; // 32 bits: -2^31 to 2^31-1
        long largeNumber = 9223372036854775807L; // 64 bits: -2^63 to 2^63-1
        
        // Numeric literals
        int decimal = 42;
        int hex = 0x2A;        // Hexadecimal
        int octal = 052;       // Octal (rarely used)
        int binary = 0b101010; // Binary (Java 7+)
        
        // Underscores for readability (Java 7+)
        long population = 7_800_000_000L;
        int bankBalance = 1_000_000;
        
        System.out.println("Decimal: " + decimal);
        System.out.println("Hex: " + hex);
        System.out.println("Binary: " + binary);
        System.out.println("Population: " + population);
        
        // Demonstrate overflow
        int maxInt = Integer.MAX_VALUE;
        System.out.println("Max int: " + maxInt);
        System.out.println("Max int + 1: " + (maxInt + 1)); // Overflow!
    }
}
```

Output:
```
Decimal: 42
Hex: 42
Binary: 42
Population: 7800000000
Max int: 2147483647
Max int + 1: -2147483648
```

### Floating-Point Types

```java
public class FloatingPointTypes {
    public static void main(String[] args) {
        float precision = 3.14159f;    // 32-bit IEEE 754
        double highPrecision = 3.141592653589793; // 64-bit IEEE 754
        
        // Scientific notation
        double avogadro = 6.022e23;
        double electronMass = 9.109e-31;
        
        // Special values
        double positive = Double.POSITIVE_INFINITY;
        double negative = Double.NEGATIVE_INFINITY;
        double notANumber = Double.NaN;
        
        System.out.println("Float precision: " + precision);
        System.out.println("Double precision: " + highPrecision);
        System.out.println("Avogadro's number: " + avogadro);
        
        // Floating-point arithmetic peculiarities
        double result = 0.1 + 0.2;
        System.out.println("0.1 + 0.2 = " + result);
        System.out.println("Equals 0.3? " + (result == 0.3));
        
        // Use BigDecimal for exact decimal arithmetic
        java.math.BigDecimal bd1 = new java.math.BigDecimal("0.1");
        java.math.BigDecimal bd2 = new java.math.BigDecimal("0.2");
        java.math.BigDecimal bdResult = bd1.add(bd2);
        System.out.println("BigDecimal result: " + bdResult);
    }
}
```

### Character and Boolean Types

```java
public class CharAndBoolean {
    public static void main(String[] args) {
        // Character type
        char letter = 'A';
        char digit = '9';
        char unicode = '\u0041';  // Unicode for 'A'
        char newline = '\n';      // Escape sequence
        char tab = '\t';
        
        System.out.println("Letter: " + letter);
        System.out.println("Unicode A: " + unicode);
        System.out.println("Character to int: " + (int) letter);
        
        // Boolean type
        boolean isJavaFun = true;
        boolean isPythonBetter = false;
        boolean result = isJavaFun && !isPythonBetter;
        
        System.out.println("Java is fun: " + isJavaFun);
        System.out.println("Combined result: " + result);
        
        // Characters in arithmetic
        char firstChar = 'A';
        char secondChar = 'B';
        int difference = secondChar - firstChar;
        System.out.println("'B' - 'A' = " + difference);
    }
}
```

## Type Conversion and Casting

Java performs automatic conversions when safe, but requires explicit casting for potentially lossy conversions:

```java
public class TypeConversion {
    public static void main(String[] args) {
        // Automatic widening conversions (safe)
        int intValue = 100;
        long longValue = intValue;        // int → long
        double doubleValue = longValue;   // long → double
        
        System.out.println("Int: " + intValue);
        System.out.println("Long: " + longValue);
        System.out.println("Double: " + doubleValue);
        
        // Explicit narrowing conversions (potentially lossy)
        double pi = 3.14159;
        int intPi = (int) pi;            // Truncates decimal part
        byte bytePi = (byte) intPi;      // May lose data if too large
        
        System.out.println("Original pi: " + pi);
        System.out.println("Int pi: " + intPi);
        System.out.println("Byte pi: " + bytePi);
        
        // Dangerous narrowing
        int bigNumber = 1000;
        byte smallByte = (byte) bigNumber;
        System.out.println("1000 as byte: " + smallByte); // -24 (overflow)
        
        // String conversions
        int age = 25;
        String ageString = String.valueOf(age);
        String ageString2 = Integer.toString(age);
        String ageString3 = "" + age;  // Concatenation trick
        
        // Parse strings to numbers
        String numberStr = "42";
        int parsedInt = Integer.parseInt(numberStr);
        double parsedDouble = Double.parseDouble("3.14");
        
        System.out.println("Parsed int: " + parsedInt);
        System.out.println("Parsed double: " + parsedDouble);
        
        // Handle parsing errors
        try {
            int invalidNumber = Integer.parseInt("not a number");
        } catch (NumberFormatException e) {
            System.out.println("Failed to parse: " + e.getMessage());
        }
    }
}
```

## Wrapper Classes and Autoboxing

Each primitive type has a corresponding wrapper class that provides additional functionality:

```java
import java.util.ArrayList;
import java.util.List;

public class WrapperDemo {
    public static void main(String[] args) {
        // Wrapper classes
        Integer wrappedInt = 42;           // Autoboxing
        Double wrappedDouble = 3.14;
        Boolean wrappedBoolean = true;
        Character wrappedChar = 'A';
        
        // Unboxing
        int primitiveInt = wrappedInt;     // Automatic unboxing
        double primitiveDouble = wrappedDouble;
        
        // Collections require wrapper classes
        List<Integer> numbers = new ArrayList<>();
        numbers.add(10);    // Autoboxing: int → Integer
        numbers.add(20);
        numbers.add(30);
        
        int first = numbers.get(0);  // Unboxing: Integer → int
        System.out.println("First number: " + first);
        
        // Wrapper utility methods
        String binaryString = Integer.toBinaryString(42);
        String hexString = Integer.toHexString(42);
        int maxInt = Integer.MAX_VALUE;
        int minInt = Integer.MIN_VALUE;
        
        System.out.println("42 in binary: " + binaryString);
        System.out.println("42 in hex: " + hexString);
        System.out.println("Integer range: " + minInt + " to " + maxInt);
        
        // Comparing wrapper objects
        Integer a = 127;
        Integer b = 127;
        Integer c = 128;
        Integer d = 128;
        
        System.out.println("127 == 127: " + (a == b));     // true (cached)
        System.out.println("128 == 128: " + (c == d));     // false (not cached)
        System.out.println("128 equals 128: " + c.equals(d)); // true (content)
        
        // Null values
        Integer nullInteger = null;
        try {
            int value = nullInteger;  // NullPointerException
        } catch (NullPointerException e) {
            System.out.println("Cannot unbox null wrapper");
        }
    }
}
```

## Constants and Final Variables

Use `final` to create constants that cannot be reassigned:

```java
public class Constants {
    // Class constants (compile-time constants)
    public static final int MAX_CONNECTIONS = 100;
    public static final String APPLICATION_NAME = "Java Calculator";
    public static final double CONVERSION_RATE = 1.609344; // miles to km
    
    // Instance constants
    private final String userId;
    private final long creationTime;
    
    public Constants(String userId) {
        this.userId = userId;           // Can initialize in constructor
        this.creationTime = System.currentTimeMillis();
    }
    
    public static void main(String[] args) {
        // Local constants
        final double TAX_RATE = 0.08;
        final int DAYS_IN_WEEK = 7;
        
        // Cannot reassign final variables
        // TAX_RATE = 0.09;  // Compile error
        
        double price = 100.0;
        double tax = price * TAX_RATE;
        double total = price + tax;
        
        System.out.println("Price: $" + price);
        System.out.println("Tax: $" + tax);
        System.out.println("Total: $" + total);
        
        // Final objects can still be modified
        final List<String> names = new ArrayList<>();
        names.add("Alice");      // OK - modifying contents
        names.add("Bob");
        // names = new ArrayList<>();  // Error - reassigning reference
        
        System.out.println("Names: " + names);
        
        // Demonstrate class constants
        System.out.println("Max connections: " + MAX_CONNECTIONS);
        System.out.println("App name: " + APPLICATION_NAME);
        
        // Miles to kilometers conversion
        double miles = 26.2;  // Marathon distance
        double kilometers = miles * CONVERSION_RATE;
        System.out.printf("%.1f miles = %.1f kilometers%n", miles, kilometers);
    }
}
```

## Variable Scope and Lifetime

Understanding scope prevents common errors and helps you write cleaner code:

```java
public class VariableScope {
    // Class (static) variables - live for entire program
    private static int classCounter = 0;
    
    // Instance variables - live as long as object exists
    private String instanceName;
    private int instanceId;
    
    public VariableScope(String name) {
        this.instanceName = name;
        this.instanceId = ++classCounter;  // Increment and assign
    }
    
    public void demonstrateScope() {
        // Method parameter and local variables
        int localVariable = 10;
        
        if (localVariable > 5) {
            // Block scope variable
            String blockVariable = "I exist only in this block";
            int anotherLocal = 20;
            
            System.out.println("Block variable: " + blockVariable);
            System.out.println("Can access local: " + localVariable);
            System.out.println("Can access instance: " + instanceName);
        }
        
        // blockVariable not accessible here
        // System.out.println(blockVariable);  // Compile error
        
        // Loop variables
        for (int i = 0; i < 3; i++) {
            System.out.println("Loop iteration: " + i);
        }
        
        // i is not accessible here
        // System.out.println(i);  // Compile error
    }
    
    public void shadowingExample() {
        int value = 100;  // Local variable
        
        if (true) {
            // This shadows the outer 'value'
            String value = "I'm a string now";
            System.out.println("Inner value: " + value);
        }
        
        System.out.println("Outer value: " + value);
    }
    
    // Static method can only access static variables
    public static void staticMethodExample() {
        System.out.println("Class counter: " + classCounter);
        // System.out.println(instanceName);  // Compile error
    }
    
    public static void main(String[] args) {
        VariableScope obj1 = new VariableScope("First Object");
        VariableScope obj2 = new VariableScope("Second Object");
        
        obj1.demonstrateScope();
        obj2.demonstrateScope();
        obj1.shadowingExample();
        
        System.out.println("Total objects created: " + classCounter);
        
        staticMethodExample();
    }
}
```

## Practical Example: Temperature Converter

Let's build a practical program that demonstrates these concepts:

```java
package com.codersbox.basics;

import java.util.Scanner;
import java.text.DecimalFormat;

/**
 * Temperature converter demonstrating Java basics:
 * - Data types and variables
 * - Type conversion
 * - Constants
 * - Input/output
 * - Method parameters
 */
public class TemperatureConverter {
    // Mathematical constants
    private static final double CELSIUS_TO_KELVIN_OFFSET = 273.15;
    private static final double FAHRENHEIT_TO_CELSIUS_RATIO = 5.0 / 9.0;
    private static final double CELSIUS_TO_FAHRENHEIT_RATIO = 9.0 / 5.0;
    private static final int FAHRENHEIT_OFFSET = 32;
    
    // Display formatting
    private static final DecimalFormat TEMPERATURE_FORMAT = new DecimalFormat("#.##");
    
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        boolean continueConverting = true;
        
        System.out.println("=== Temperature Converter ===");
        
        while (continueConverting) {
            displayMenu();
            int choice = getValidChoice(scanner);
            
            if (choice == 4) {
                continueConverting = false;
                System.out.println("Goodbye!");
                continue;
            }
            
            System.out.print("Enter temperature value: ");
            double temperature = scanner.nextDouble();
            
            performConversion(choice, temperature);
            
            System.out.print("Convert another temperature? (y/n): ");
            String response = scanner.next().toLowerCase();
            continueConverting = response.startsWith("y");
        }
        
        scanner.close();
    }
    
    private static void displayMenu() {
        System.out.println("\nChoose conversion:");
        System.out.println("1. Celsius to Fahrenheit");
        System.out.println("2. Fahrenheit to Celsius");
        System.out.println("3. Celsius to Kelvin");
        System.out.println("4. Exit");
        System.out.print("Your choice (1-4): ");
    }
    
    private static int getValidChoice(Scanner scanner) {
        int choice;
        do {
            while (!scanner.hasNextInt()) {
                System.out.print("Please enter a valid number (1-4): ");
                scanner.next(); // Clear invalid input
            }
            choice = scanner.nextInt();
            
            if (choice < 1 || choice > 4) {
                System.out.print("Please enter a number between 1 and 4: ");
            }
        } while (choice < 1 || choice > 4);
        
        return choice;
    }
    
    private static void performConversion(int choice, double temperature) {
        double result;
        String fromUnit, toUnit;
        
        switch (choice) {
            case 1:
                result = celsiusToFahrenheit(temperature);
                fromUnit = "°C";
                toUnit = "°F";
                break;
            case 2:
                result = fahrenheitToCelsius(temperature);
                fromUnit = "°F";
                toUnit = "°C";
                break;
            case 3:
                result = celsiusToKelvin(temperature);
                fromUnit = "°C";
                toUnit = "K";
                break;
            default:
                return; // Should never reach here due to validation
        }
        
        System.out.printf("%s%s = %s%s%n", 
            TEMPERATURE_FORMAT.format(temperature), fromUnit,
            TEMPERATURE_FORMAT.format(result), toUnit);
            
        // Add contextual information
        addContext(choice, temperature, result);
    }
    
    private static double celsiusToFahrenheit(double celsius) {
        return celsius * CELSIUS_TO_FAHRENHEIT_RATIO + FAHRENHEIT_OFFSET;
    }
    
    private static double fahrenheitToCelsius(double fahrenheit) {
        return (fahrenheit - FAHRENHEIT_OFFSET) * FAHRENHEIT_TO_CELSIUS_RATIO;
    }
    
    private static double celsiusToKelvin(double celsius) {
        return celsius + CELSIUS_TO_KELVIN_OFFSET;
    }
    
    private static void addContext(int conversionType, double original, double converted) {
        if (conversionType == 1 || conversionType == 2) {
            // Celsius/Fahrenheit context
            if (original == 0 && conversionType == 1) {
                System.out.println("(Water freezing point)");
            } else if (original == 100 && conversionType == 1) {
                System.out.println("(Water boiling point)");
            } else if (original == 32 && conversionType == 2) {
                System.out.println("(Water freezing point)");
            } else if (original == 212 && conversionType == 2) {
                System.out.println("(Water boiling point)");
            }
        } else if (conversionType == 3) {
            // Kelvin context
            if (converted == CELSIUS_TO_KELVIN_OFFSET) {
                System.out.println("(Water freezing point)");
            } else if (converted == 373.15) {
                System.out.println("(Water boiling point)");
            } else if (converted == 0) {
                System.out.println("(Absolute zero - impossible!)");
            }
        }
    }
}
```

This program demonstrates:
- All primitive data types in action
- Constants for mathematical values
- Type conversion and formatting
- Variable scope in different methods
- Input validation and error handling

## Common Pitfalls and Best Practices

### 1. Integer Overflow
```java
int maxValue = Integer.MAX_VALUE;
int overflow = maxValue + 1;  // Wraps to Integer.MIN_VALUE
```

**Solution**: Use appropriate data types or check bounds:
```java
if (maxValue > Integer.MAX_VALUE - 1) {
    // Handle potential overflow
    long result = (long) maxValue + 1;
}
```

### 2. Floating-Point Precision
```java
double result = 0.1 + 0.2;  // Not exactly 0.3!
```

**Solution**: Use BigDecimal for exact decimal arithmetic or epsilon comparisons:
```java
final double EPSILON = 1e-10;
boolean isEqual = Math.abs(result - 0.3) < EPSILON;
```

### 3. Unboxing Null Wrappers
```java
Integer value = null;
int primitive = value;  // NullPointerException
```

**Solution**: Always check for null before unboxing:
```java
int primitive = (value != null) ? value : 0;
```

## Looking Ahead

You now understand Java's fundamental building blocks: variables, primitive types, constants, and type conversions. These concepts form the foundation for everything we'll build in future tutorials.

In the next tutorial, we'll explore operators and expressions - how to combine these data elements to perform calculations, make decisions, and manipulate data. We'll also dive into Java's operator precedence rules and learn how to write complex expressions that are both efficient and readable.

Remember: mastering these basics thoroughly will make advanced topics much easier to understand. Take time to experiment with the examples, modify them, and see how changes affect the results. This hands-on practice builds the intuition you'll rely on as you tackle more complex programming challenges.