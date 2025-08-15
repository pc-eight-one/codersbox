---
title: "Java Tutorial Series - Part 3: Control Flow"
description: "Master Java control flow statements including if-else conditions, switch statements, loops (for, while, do-while), and best practices for readable code structure."
publishDate: 2025-01-15
tags: ["Java", "Control Flow", "Loops", "Conditionals", "Switch", "Programming Logic"]
difficulty: "beginner"
series: "Java Tutorial Series"
part: 3
estimatedTime: "75 minutes"
totalParts: 24
featured: false
---

# Java Tutorial Series - Part 3: Control Flow

Control flow statements determine the order in which your code executes. They're essential for creating dynamic programs that can make decisions and repeat actions. In this part, we'll explore conditional statements, loops, and best practices for writing readable control flow code.

## Conditional Statements

Conditional statements allow your program to make decisions based on different conditions.

### if-else Statements

The `if` statement executes code when a condition is true:

```java
public class IfElseExamples {
    public static void main(String[] args) {
        int temperature = 75;
        
        // Simple if statement
        if (temperature > 80) {
            System.out.println("It's hot outside!");
        }
        
        // if-else statement
        if (temperature > 80) {
            System.out.println("It's hot outside!");
        } else {
            System.out.println("It's not that hot.");
        }
        
        // if-else-if chain
        if (temperature >= 90) {
            System.out.println("It's very hot!");
        } else if (temperature >= 80) {
            System.out.println("It's hot.");
        } else if (temperature >= 70) {
            System.out.println("It's warm.");
        } else if (temperature >= 60) {
            System.out.println("It's cool.");
        } else {
            System.out.println("It's cold!");
        }
        
        // Nested if statements
        boolean hasUmbrella = true;
        boolean isRaining = false;
        
        if (isRaining) {
            if (hasUmbrella) {
                System.out.println("Good thing you have an umbrella!");
            } else {
                System.out.println("You'll get wet!");
            }
        } else {
            System.out.println("No need for an umbrella today.");
        }
    }
}
```

### Ternary Operator

A shorthand way to write simple if-else statements:

```java
public class TernaryOperator {
    public static void main(String[] args) {
        int score = 85;
        
        // Traditional if-else
        String grade;
        if (score >= 90) {
            grade = "A";
        } else {
            grade = "B";
        }
        
        // Ternary operator: condition ? valueIfTrue : valueIfFalse
        String gradeShort = (score >= 90) ? "A" : "B";
        
        System.out.println("Traditional: " + grade);
        System.out.println("Ternary: " + gradeShort);
        
        // Nested ternary (be careful with readability!)
        String letterGrade = (score >= 90) ? "A" : 
                           (score >= 80) ? "B" : 
                           (score >= 70) ? "C" : 
                           (score >= 60) ? "D" : "F";
        System.out.println("Nested ternary: " + letterGrade);
        
        // Practical examples
        int age = 20;
        String status = (age >= 18) ? "Adult" : "Minor";
        System.out.println("Status: " + status);
        
        int number = -5;
        String sign = (number > 0) ? "Positive" : (number < 0) ? "Negative" : "Zero";
        System.out.println("Sign: " + sign);
    }
}
```

### switch Statements

The `switch` statement is useful for multiple discrete conditions:

```java
public class SwitchExamples {
    public static void main(String[] args) {
        // Basic switch statement
        char grade = 'B';
        
        switch (grade) {
            case 'A':
                System.out.println("Excellent!");
                break;
            case 'B':
                System.out.println("Good job!");
                break;
            case 'C':
                System.out.println("Average work.");
                break;
            case 'D':
                System.out.println("Below average.");
                break;
            case 'F':
                System.out.println("Failed.");
                break;
            default:
                System.out.println("Invalid grade.");
        }
        
        // Switch without breaks (fall-through)
        int month = 3;
        String season;
        
        switch (month) {
            case 12:
            case 1:
            case 2:
                season = "Winter";
                break;
            case 3:
            case 4:
            case 5:
                season = "Spring";
                break;
            case 6:
            case 7:
            case 8:
                season = "Summer";
                break;
            case 9:
            case 10:
            case 11:
                season = "Fall";
                break;
            default:
                season = "Invalid month";
        }
        System.out.println("Season: " + season);
        
        // Switch with String (Java 7+)
        String dayOfWeek = "Monday";
        
        switch (dayOfWeek.toLowerCase()) {
            case "monday":
            case "tuesday":
            case "wednesday":
            case "thursday":
            case "friday":
                System.out.println("Weekday - time to work!");
                break;
            case "saturday":
            case "sunday":
                System.out.println("Weekend - time to relax!");
                break;
            default:
                System.out.println("Invalid day");
        }
    }
}
```

## Loops

Loops allow you to execute code repeatedly based on conditions.

### for Loops

The `for` loop is ideal when you know the number of iterations:

```java
public class ForLoopExamples {
    public static void main(String[] args) {
        // Basic for loop
        System.out.println("Counting from 1 to 5:");
        for (int i = 1; i <= 5; i++) {
            System.out.println("Count: " + i);
        }
        
        // Counting backwards
        System.out.println("\nCountdown:");
        for (int i = 10; i >= 1; i--) {
            System.out.println(i);
        }
        System.out.println("Blast off!");
        
        // Different step sizes
        System.out.println("\nEven numbers from 2 to 20:");
        for (int i = 2; i <= 20; i += 2) {
            System.out.print(i + " ");
        }
        System.out.println();
        
        // Multiple variables in for loop
        System.out.println("\nMultiple variables:");
        for (int i = 0, j = 10; i < j; i++, j--) {
            System.out.println("i = " + i + ", j = " + j);
        }
        
        // For loop with arrays (traditional approach)
        int[] numbers = {10, 20, 30, 40, 50};
        System.out.println("\nArray elements:");
        for (int i = 0; i < numbers.length; i++) {
            System.out.println("Index " + i + ": " + numbers[i]);
        }
    }
}
```

### Enhanced for Loop (for-each)

The enhanced for loop simplifies iteration over collections:

```java
public class EnhancedForLoop {
    public static void main(String[] args) {
        // Enhanced for loop with arrays
        int[] numbers = {1, 2, 3, 4, 5};
        
        System.out.println("Using enhanced for loop:");
        for (int number : numbers) {
            System.out.println(number);
        }
        
        // With strings
        String[] names = {"Alice", "Bob", "Charlie", "Diana"};
        System.out.println("\nNames:");
        for (String name : names) {
            System.out.println("Hello, " + name + "!");
        }
        
        // Calculate sum using enhanced for loop
        int[] scores = {85, 92, 78, 96, 87};
        int total = 0;
        
        for (int score : scores) {
            total += score;
        }
        
        double average = (double) total / scores.length;
        System.out.println("\nAverage score: " + average);
        
        // Enhanced for loop vs traditional for loop
        System.out.println("\nComparison:");
        
        // When you need the index, use traditional for loop
        for (int i = 0; i < names.length; i++) {
            System.out.println((i + 1) + ". " + names[i]);
        }
        
        // When you just need the values, use enhanced for loop
        for (String name : names) {
            System.out.println("Processing: " + name);
        }
    }
}
```

### while Loops

The `while` loop continues as long as a condition is true:

```java
import java.util.Scanner;

public class WhileLoopExamples {
    public static void main(String[] args) {
        // Basic while loop
        int count = 1;
        System.out.println("Basic while loop:");
        while (count <= 5) {
            System.out.println("Count: " + count);
            count++;
        }
        
        // While loop for input validation
        Scanner scanner = new Scanner(System.in);
        int number = 0;
        
        System.out.println("\nEnter a number between 1 and 100:");
        while (number < 1 || number > 100) {
            System.out.print("Your number: ");
            if (scanner.hasNextInt()) {
                number = scanner.nextInt();
                if (number < 1 || number > 100) {
                    System.out.println("Please enter a number between 1 and 100!");
                }
            } else {
                System.out.println("Please enter a valid integer!");
                scanner.next(); // Clear invalid input
            }
        }
        System.out.println("Thank you! You entered: " + number);
        
        // While loop for processing unknown amount of data
        System.out.println("\nEnter numbers to sum (0 to stop):");
        int sum = 0;
        int input = scanner.nextInt();
        
        while (input != 0) {
            sum += input;
            System.out.print("Enter next number (0 to stop): ");
            input = scanner.nextInt();
        }
        
        System.out.println("Sum of all numbers: " + sum);
        scanner.close();
    }
}
```

### do-while Loops

The `do-while` loop executes at least once, then continues while the condition is true:

```java
import java.util.Scanner;

public class DoWhileExamples {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        
        // Simple do-while example
        int i = 6;
        
        System.out.println("while loop with i = 6:");
        while (i <= 5) {
            System.out.println("This won't print");
            i++;
        }
        
        System.out.println("do-while loop with i = 6:");
        do {
            System.out.println("This will print once: i = " + i);
            i++;
        } while (i <= 5);
        
        // Menu system using do-while
        int choice;
        do {
            System.out.println("\n=== Menu ===");
            System.out.println("1. Say Hello");
            System.out.println("2. Show Current Time");
            System.out.println("3. Calculate Square");
            System.out.println("0. Exit");
            System.out.print("Enter your choice: ");
            
            choice = scanner.nextInt();
            
            switch (choice) {
                case 1:
                    System.out.println("Hello, World!");
                    break;
                case 2:
                    System.out.println("Current time: " + java.time.LocalTime.now());
                    break;
                case 3:
                    System.out.print("Enter a number: ");
                    int num = scanner.nextInt();
                    System.out.println("Square of " + num + " is " + (num * num));
                    break;
                case 0:
                    System.out.println("Goodbye!");
                    break;
                default:
                    System.out.println("Invalid choice! Please try again.");
            }
        } while (choice != 0);
        
        // Password verification with do-while
        String correctPassword = "java123";
        String enteredPassword;
        int attempts = 0;
        final int MAX_ATTEMPTS = 3;
        
        System.out.println("\n=== Login System ===");
        do {
            attempts++;
            System.out.print("Enter password (attempt " + attempts + "/" + MAX_ATTEMPTS + "): ");
            enteredPassword = scanner.next();
            
            if (!enteredPassword.equals(correctPassword)) {
                if (attempts < MAX_ATTEMPTS) {
                    System.out.println("Incorrect password. Try again.");
                } else {
                    System.out.println("Too many failed attempts. Access denied!");
                }
            }
        } while (!enteredPassword.equals(correctPassword) && attempts < MAX_ATTEMPTS);
        
        if (enteredPassword.equals(correctPassword)) {
            System.out.println("Login successful! Welcome!");
        }
        
        scanner.close();
    }
}
```

## Break and Continue Statements

These statements modify loop behavior:

```java
public class BreakContinueExamples {
    public static void main(String[] args) {
        // Break statement - exits the loop
        System.out.println("Break example - find first even number:");
        int[] numbers = {1, 3, 7, 8, 9, 12, 15};
        
        for (int number : numbers) {
            if (number % 2 == 0) {
                System.out.println("First even number found: " + number);
                break; // Exit the loop
            }
            System.out.println("Checking: " + number);
        }
        
        // Continue statement - skips current iteration
        System.out.println("\nContinue example - print only odd numbers:");
        for (int i = 1; i <= 10; i++) {
            if (i % 2 == 0) {
                continue; // Skip even numbers
            }
            System.out.print(i + " ");
        }
        System.out.println();
        
        // Break and continue in nested loops
        System.out.println("\nNested loops with break and continue:");
        for (int i = 1; i <= 3; i++) {
            System.out.println("Outer loop: " + i);
            
            for (int j = 1; j <= 5; j++) {
                if (j == 2) {
                    continue; // Skip j = 2
                }
                if (j == 4) {
                    break; // Exit inner loop when j = 4
                }
                System.out.println("  Inner loop: " + j);
            }
        }
        
        // Labeled break and continue (advanced)
        System.out.println("\nLabeled break example:");
        outer: for (int i = 1; i <= 3; i++) {
            System.out.println("Outer: " + i);
            
            for (int j = 1; j <= 3; j++) {
                if (i == 2 && j == 2) {
                    System.out.println("  Breaking outer loop");
                    break outer; // Break out of outer loop
                }
                System.out.println("  Inner: " + j);
            }
        }
        System.out.println("After labeled break");
    }
}
```

## Nested Loops and Conditionals

Complex control structures for sophisticated logic:

```java
public class NestedStructures {
    public static void main(String[] args) {
        // Pattern printing with nested loops
        System.out.println("Right triangle pattern:");
        for (int i = 1; i <= 5; i++) {
            for (int j = 1; j <= i; j++) {
                System.out.print("* ");
            }
            System.out.println();
        }
        
        System.out.println("\nNumber pyramid:");
        for (int i = 1; i <= 4; i++) {
            // Print spaces
            for (int j = 1; j <= 4 - i; j++) {
                System.out.print(" ");
            }
            // Print numbers
            for (int k = 1; k <= i; k++) {
                System.out.print(k + " ");
            }
            System.out.println();
        }
        
        // Multiplication table
        System.out.println("\nMultiplication table (1-5):");
        System.out.print("   ");
        for (int i = 1; i <= 5; i++) {
            System.out.printf("%4d", i);
        }
        System.out.println();
        
        for (int i = 1; i <= 5; i++) {
            System.out.printf("%2d ", i);
            for (int j = 1; j <= 5; j++) {
                System.out.printf("%4d", i * j);
            }
            System.out.println();
        }
        
        // Complex conditional logic
        System.out.println("\nGrade analysis:");
        int[][] studentScores = {
            {85, 92, 78, 96},  // Student 1
            {67, 71, 69, 73},  // Student 2
            {94, 87, 91, 89},  // Student 3
            {45, 52, 48, 51}   // Student 4
        };
        
        String[] studentNames = {"Alice", "Bob", "Carol", "Dave"};
        
        for (int i = 0; i < studentScores.length; i++) {
            System.out.println("\nStudent: " + studentNames[i]);
            
            int total = 0;
            int passCount = 0;
            
            for (int j = 0; j < studentScores[i].length; j++) {
                int score = studentScores[i][j];
                total += score;
                
                if (score >= 60) {
                    passCount++;
                }
                
                // Determine grade for each subject
                String grade;
                if (score >= 90) {
                    grade = "A";
                } else if (score >= 80) {
                    grade = "B";
                } else if (score >= 70) {
                    grade = "C";
                } else if (score >= 60) {
                    grade = "D";
                } else {
                    grade = "F";
                }
                
                System.out.println("  Subject " + (j + 1) + ": " + score + " (" + grade + ")");
            }
            
            double average = (double) total / studentScores[i].length;
            System.out.printf("  Average: %.2f\n", average);
            
            // Overall assessment
            if (average >= 90) {
                System.out.println("  Status: Excellent student!");
            } else if (average >= 80) {
                System.out.println("  Status: Good performance");
            } else if (average >= 70) {
                System.out.println("  Status: Satisfactory");
            } else if (passCount >= 2) {
                System.out.println("  Status: Needs improvement but passing");
            } else {
                System.out.println("  Status: At risk - consider tutoring");
            }
        }
    }
}
```

## Best Practices for Readable Control Flow

Writing clean, maintainable control flow code:

```java
public class ControlFlowBestPractices {
    
    public static void main(String[] args) {
        demonstrateGoodPractices();
        demonstrateCommonMistakes();
    }
    
    public static void demonstrateGoodPractices() {
        System.out.println("=== Good Practices ===");
        
        // 1. Use meaningful variable names
        int userAge = 25;
        boolean hasValidLicense = true;
        
        // 2. Use early returns to reduce nesting
        if (!hasValidLicense) {
            System.out.println("Cannot drive without a valid license");
            return;
        }
        
        if (userAge < 16) {
            System.out.println("Too young to drive");
            return;
        }
        
        System.out.println("Can drive!");
        
        // 3. Use constants for magic numbers
        final int MINIMUM_DRIVING_AGE = 16;
        final int SENIOR_DISCOUNT_AGE = 65;
        final double SENIOR_DISCOUNT_RATE = 0.15;
        
        if (userAge >= SENIOR_DISCOUNT_AGE) {
            System.out.println("Senior discount applied: " + (SENIOR_DISCOUNT_RATE * 100) + "%");
        }
        
        // 4. Keep conditions simple and readable
        boolean isWeekend = true;
        boolean isHoliday = false;
        boolean isOffDay = isWeekend || isHoliday;
        
        if (isOffDay) {
            System.out.println("It's a day off!");
        }
        
        // 5. Use positive conditions when possible
        if (hasValidLicense) {  // Better than if (!hasInvalidLicense)
            System.out.println("License is valid");
        }
    }
    
    public static void demonstrateCommonMistakes() {
        System.out.println("\n=== Common Mistakes to Avoid ===");
        
        int score = 85;
        
        // AVOID: Deep nesting (hard to read)
        System.out.println("Avoid deep nesting:");
        if (score > 0) {
            if (score <= 100) {
                if (score >= 90) {
                    if (score >= 95) {
                        System.out.println("Excellent!");
                    } else {
                        System.out.println("Very good!");
                    }
                } else {
                    System.out.println("Good job!");
                }
            }
        }
        
        // BETTER: Guard clauses and early returns
        System.out.println("\nBetter approach:");
        evaluateScore(score);
        
        // AVOID: Magic numbers
        System.out.println("\nAvoid magic numbers:");
        if (score >= 90) {  // What does 90 represent?
            System.out.println("Grade A");
        }
        
        // BETTER: Named constants
        final int A_GRADE_THRESHOLD = 90;
        if (score >= A_GRADE_THRESHOLD) {
            System.out.println("Grade A");
        }
    }
    
    // Helper method demonstrating guard clauses
    public static void evaluateScore(int score) {
        // Guard clauses - handle edge cases first
        if (score < 0 || score > 100) {
            System.out.println("Invalid score");
            return;
        }
        
        // Main logic is now cleaner
        if (score >= 95) {
            System.out.println("Excellent!");
        } else if (score >= 90) {
            System.out.println("Very good!");
        } else if (score >= 80) {
            System.out.println("Good job!");
        } else if (score >= 70) {
            System.out.println("Satisfactory");
        } else {
            System.out.println("Needs improvement");
        }
    }
}
```

## Practical Example: Number Guessing Game

Let's create a comprehensive example that uses all the control flow concepts:

```java
import java.util.Random;
import java.util.Scanner;

/**
 * A number guessing game that demonstrates various control flow concepts
 * including loops, conditionals, break/continue, and input validation.
 */
public class NumberGuessingGame {
    
    private static final int MIN_NUMBER = 1;
    private static final int MAX_NUMBER = 100;
    private static final int MAX_ATTEMPTS = 7;
    
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        Random random = new Random();
        boolean playAgain = true;
        
        System.out.println("=== Welcome to the Number Guessing Game! ===");
        System.out.println("I'm thinking of a number between " + MIN_NUMBER + " and " + MAX_NUMBER);
        
        while (playAgain) {
            int secretNumber = random.nextInt(MAX_NUMBER - MIN_NUMBER + 1) + MIN_NUMBER;
            int attempts = 0;
            boolean hasWon = false;
            
            System.out.println("\nNew game started! You have " + MAX_ATTEMPTS + " attempts.");
            
            while (attempts < MAX_ATTEMPTS && !hasWon) {
                attempts++;
                System.out.print("Attempt " + attempts + "/" + MAX_ATTEMPTS + " - Enter your guess: ");
                
                // Input validation
                if (!scanner.hasNextInt()) {
                    System.out.println("Please enter a valid number!");
                    scanner.next(); // Clear invalid input
                    attempts--; // Don't count invalid input as an attempt
                    continue;
                }
                
                int guess = scanner.nextInt();
                
                // Validate range
                if (guess < MIN_NUMBER || guess > MAX_NUMBER) {
                    System.out.println("Please guess between " + MIN_NUMBER + " and " + MAX_NUMBER);
                    attempts--; // Don't count out-of-range guesses
                    continue;
                }
                
                // Check the guess
                if (guess == secretNumber) {
                    hasWon = true;
                    System.out.println("🎉 Congratulations! You guessed it in " + attempts + " attempts!");
                    
                    // Performance feedback
                    if (attempts <= 3) {
                        System.out.println("Amazing! You're a master guesser!");
                    } else if (attempts <= 5) {
                        System.out.println("Great job! Good guessing skills!");
                    } else {
                        System.out.println("You made it! That was close!");
                    }
                } else if (guess < secretNumber) {
                    System.out.println("Too low! Try a higher number.");
                    
                    // Give hints based on how close they are
                    int difference = secretNumber - guess;
                    if (difference <= 5) {
                        System.out.println("Hint: You're very close!");
                    } else if (difference <= 15) {
                        System.out.println("Hint: You're getting warm!");
                    }
                } else {
                    System.out.println("Too high! Try a lower number.");
                    
                    // Give hints based on how close they are
                    int difference = guess - secretNumber;
                    if (difference <= 5) {
                        System.out.println("Hint: You're very close!");
                    } else if (difference <= 15) {
                        System.out.println("Hint: You're getting warm!");
                    }
                }
                
                // Show remaining attempts
                if (!hasWon && attempts < MAX_ATTEMPTS) {
                    int remaining = MAX_ATTEMPTS - attempts;
                    System.out.println("Remaining attempts: " + remaining);
                }
            }
            
            // Game over
            if (!hasWon) {
                System.out.println("\n💔 Game over! The number was " + secretNumber);
                System.out.println("Better luck next time!");
            }
            
            // Ask to play again
            String response;
            do {
                System.out.print("\nWould you like to play again? (yes/no): ");
                response = scanner.next().toLowerCase().trim();
                
                if (response.equals("yes") || response.equals("y")) {
                    playAgain = true;
                    break;
                } else if (response.equals("no") || response.equals("n")) {
                    playAgain = false;
                    break;
                } else {
                    System.out.println("Please answer 'yes' or 'no'");
                }
            } while (true);
        }
        
        System.out.println("\nThanks for playing! Goodbye! 👋");
        scanner.close();
    }
}
```

## Summary

In this third part of our Java tutorial series, you've learned:

✅ **Conditional Statements**: if-else chains, ternary operators, and switch statements for decision making  
✅ **Loop Types**: for loops, enhanced for loops, while loops, and do-while loops for repetition  
✅ **Loop Control**: break and continue statements for controlling loop execution  
✅ **Complex Structures**: Nested loops and conditionals for sophisticated logic  
✅ **Best Practices**: Writing readable, maintainable control flow code  

### Key Takeaways

1. **Choose the Right Tool**: Use the most appropriate control structure for your specific need
2. **Keep It Simple**: Avoid deep nesting and complex conditions when possible
3. **Use Constants**: Replace magic numbers with named constants for clarity
4. **Validate Input**: Always validate user input to prevent unexpected behavior
5. **Early Returns**: Use guard clauses to reduce nesting and improve readability

### What's Next?

In **Part 4: Methods**, we'll explore:
- Defining and calling methods
- Parameters and return types
- Method overloading
- Variable scope and lifetime
- Best practices for method design

### Practice Exercises

Before moving on, try these exercises:

1. **Grade Calculator**: Create a program that calculates final grades based on multiple test scores
2. **Prime Number Finder**: Write a program that finds all prime numbers up to a given limit
3. **Pattern Printer**: Create various patterns using nested loops (diamonds, triangles, etc.)
4. **Simple Menu System**: Build a calculator with a menu-driven interface

Ready to learn about methods and code organization? Let's continue to Part 4!

---

*This tutorial is part of our comprehensive Java Tutorial Series. Master these control flow concepts as they're fundamental to all programming logic in Java.*