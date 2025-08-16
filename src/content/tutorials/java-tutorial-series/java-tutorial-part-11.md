---
title: "Java Tutorial Series - Part 11: Exception Handling"
description: "Master Java exception handling with try-catch blocks, checked and unchecked exceptions, throw statements, and custom exceptions for robust applications."
publishDate: 2025-01-15
tags: ["Java", "Exception Handling", "Error Handling", "Try-Catch", "Custom Exceptions", "Debugging"]
difficulty: "intermediate"
series: "Java Tutorial Series"
part: 11
estimatedTime: "110 minutes"
totalParts: 24
featured: false
---

# Java Tutorial Series - Part 11: Exception Handling

Exception handling is a crucial aspect of Java programming that allows you to create robust applications that can gracefully handle errors and unexpected situations. In this comprehensive part, we'll explore different types of exceptions, try-catch blocks, throwing exceptions, and creating custom exception classes.

## Introduction to Exceptions

### What are Exceptions?

An exception is an event that occurs during program execution that disrupts the normal flow of instructions. When an exceptional situation arises, Java creates an exception object containing information about the error and throws it to the runtime system.

```java
public class ExceptionDemo {
    public static void main(String[] args) {
        // This will cause an ArithmeticException
        try {
            int result = 10 / 0; // Division by zero
            System.out.println("Result: " + result);
        } catch (ArithmeticException e) {
            System.out.println("Error: Cannot divide by zero!");
            System.out.println("Exception message: " + e.getMessage());
        }
        
        System.out.println("Program continues after exception handling");
    }
}
```

### Exception Hierarchy

Java's exception hierarchy starts with the `Throwable` class:

```java
// Exception hierarchy demonstration
public class ExceptionHierarchyDemo {
    public static void demonstrateExceptionTypes() {
        // RuntimeException (Unchecked)
        try {
            String text = null;
            int length = text.length(); // NullPointerException
        } catch (NullPointerException e) {
            System.out.println("Caught NullPointerException: " + e.getMessage());
        }
        
        // Checked Exception
        try {
            Thread.sleep(1000); // InterruptedException (checked)
        } catch (InterruptedException e) {
            System.out.println("Caught InterruptedException: " + e.getMessage());
        }
        
        // Error (usually not caught)
        try {
            recursiveMethod(0);
        } catch (StackOverflowError e) {
            System.out.println("Caught StackOverflowError - stack too deep!");
        }
    }
    
    private static void recursiveMethod(int count) {
        // Intentional infinite recursion to demonstrate StackOverflowError
        if (count < 100000) { // Limit to prevent infinite loop in demo
            recursiveMethod(count + 1);
        }
    }
    
    public static void main(String[] args) {
        demonstrateExceptionTypes();
    }
}
```

## Try-Catch-Finally Blocks

### Basic Try-Catch Structure

```java
public class TryCatchBasics {
    public static void main(String[] args) {
        // Single catch block
        try {
            int[] numbers = {1, 2, 3};
            System.out.println(numbers[5]); // ArrayIndexOutOfBoundsException
        } catch (ArrayIndexOutOfBoundsException e) {
            System.out.println("Array index out of bounds: " + e.getMessage());
        }
        
        // Multiple catch blocks
        try {
            String text = "123abc";
            int number = Integer.parseInt(text); // NumberFormatException
            int result = number / 0; // ArithmeticException
        } catch (NumberFormatException e) {
            System.out.println("Invalid number format: " + e.getMessage());
        } catch (ArithmeticException e) {
            System.out.println("Arithmetic error: " + e.getMessage());
        }
        
        // Catch multiple exception types in one block (Java 7+)
        try {
            processData("invalid");
        } catch (NumberFormatException | IllegalArgumentException e) {
            System.out.println("Input validation error: " + e.getMessage());
        }
    }
    
    private static void processData(String input) {
        if (input.equals("invalid")) {
            throw new IllegalArgumentException("Invalid input provided");
        }
        Integer.parseInt(input);
    }
}
```

### Finally Block

```java
import java.io.*;
import java.util.Scanner;

public class FinallyBlockDemo {
    public static void readFileWithFinally() {
        FileReader fileReader = null;
        BufferedReader bufferedReader = null;
        
        try {
            fileReader = new FileReader("data.txt");
            bufferedReader = new BufferedReader(fileReader);
            
            String line;
            while ((line = bufferedReader.readLine()) != null) {
                System.out.println(line);
            }
        } catch (FileNotFoundException e) {
            System.out.println("File not found: " + e.getMessage());
        } catch (IOException e) {
            System.out.println("Error reading file: " + e.getMessage());
        } finally {
            // This block always executes
            System.out.println("Cleaning up resources...");
            
            try {
                if (bufferedReader != null) {
                    bufferedReader.close();
                }
                if (fileReader != null) {
                    fileReader.close();
                }
            } catch (IOException e) {
                System.out.println("Error closing resources: " + e.getMessage());
            }
        }
    }
    
    public static void demonstrateFinallyExecution() {
        try {
            System.out.println("In try block");
            return; // Finally still executes
        } catch (Exception e) {
            System.out.println("In catch block");
        } finally {
            System.out.println("Finally block always executes");
        }
    }
    
    public static void main(String[] args) {
        readFileWithFinally();
        System.out.println();
        demonstrateFinallyExecution();
    }
}
```

### Try-with-Resources (Java 7+)

```java
import java.io.*;
import java.util.Scanner;

public class TryWithResourcesDemo {
    // Automatic resource management
    public static void readFileWithTryWithResources() {
        // Resources are automatically closed
        try (FileReader fileReader = new FileReader("data.txt");
             BufferedReader bufferedReader = new BufferedReader(fileReader)) {
            
            String line;
            while ((line = bufferedReader.readLine()) != null) {
                System.out.println(line);
            }
            
        } catch (FileNotFoundException e) {
            System.out.println("File not found: " + e.getMessage());
        } catch (IOException e) {
            System.out.println("Error reading file: " + e.getMessage());
        }
        // No finally block needed - resources closed automatically
    }
    
    // Multiple resources
    public static void processMultipleResources() {
        try (Scanner scanner = new Scanner(System.in);
             FileWriter writer = new FileWriter("output.txt");
             PrintWriter printWriter = new PrintWriter(writer)) {
            
            System.out.print("Enter text to write to file: ");
            String input = scanner.nextLine();
            printWriter.println(input);
            printWriter.flush();
            
            System.out.println("Text written to file successfully");
            
        } catch (IOException e) {
            System.out.println("Error processing files: " + e.getMessage());
        }
    }
    
    // Custom AutoCloseable resource
    static class DatabaseConnection implements AutoCloseable {
        private String connectionName;
        
        public DatabaseConnection(String name) {
            this.connectionName = name;
            System.out.println("Opening database connection: " + name);
        }
        
        public void executeQuery(String query) {
            System.out.println("Executing query: " + query);
        }
        
        @Override
        public void close() {
            System.out.println("Closing database connection: " + connectionName);
        }
    }
    
    public static void useCustomResource() {
        try (DatabaseConnection db = new DatabaseConnection("MyDB")) {
            db.executeQuery("SELECT * FROM users");
            // Connection automatically closed
        }
    }
    
    public static void main(String[] args) {
        System.out.println("=== Try-with-Resources Demo ===");
        readFileWithTryWithResources();
        
        System.out.println("\n=== Custom Resource Demo ===");
        useCustomResource();
    }
}
```

## Checked vs Unchecked Exceptions

### Checked Exceptions

```java
import java.io.*;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;

public class CheckedExceptionsDemo {
    // Method that throws checked exceptions
    public static void readFile(String filename) throws IOException {
        FileReader file = new FileReader(filename);
        BufferedReader reader = new BufferedReader(file);
        
        try {
            String line = reader.readLine();
            System.out.println("First line: " + line);
        } finally {
            reader.close();
        }
    }
    
    // Method that handles checked exceptions internally
    public static String parseDate(String dateString) {
        SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd");
        
        try {
            Date date = formatter.parse(dateString);
            return "Parsed date: " + date;
        } catch (ParseException e) {
            System.out.println("Invalid date format: " + e.getMessage());
            return "Failed to parse date";
        }
    }
    
    // Method that propagates multiple checked exceptions
    public static void processFile(String filename) throws IOException, ParseException {
        // Read file
        FileReader file = new FileReader(filename);
        BufferedReader reader = new BufferedReader(file);
        
        try {
            String line = reader.readLine();
            
            // Parse date from file
            SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd");
            Date date = formatter.parse(line);
            
            System.out.println("Processed date from file: " + date);
        } finally {
            reader.close();
        }
    }
    
    public static void main(String[] args) {
        // Handling checked exceptions
        try {
            readFile("test.txt");
        } catch (IOException e) {
            System.out.println("File operation failed: " + e.getMessage());
        }
        
        // Method handles exception internally
        String result = parseDate("2023-12-25");
        System.out.println(result);
        
        String invalidResult = parseDate("invalid-date");
        System.out.println(invalidResult);
        
        // Handling multiple checked exceptions
        try {
            processFile("dates.txt");
        } catch (IOException e) {
            System.out.println("File I/O error: " + e.getMessage());
        } catch (ParseException e) {
            System.out.println("Date parsing error: " + e.getMessage());
        }
    }
}
```

### Unchecked Exceptions

```java
import java.util.ArrayList;
import java.util.List;

public class UncheckedExceptionsDemo {
    public static void demonstrateRuntimeExceptions() {
        // NullPointerException
        try {
            String text = null;
            int length = text.length();
        } catch (NullPointerException e) {
            System.out.println("NullPointerException: " + e.getMessage());
        }
        
        // ArrayIndexOutOfBoundsException
        try {
            int[] numbers = {1, 2, 3};
            System.out.println(numbers[10]);
        } catch (ArrayIndexOutOfBoundsException e) {
            System.out.println("Array index error: " + e.getMessage());
        }
        
        // NumberFormatException
        try {
            int number = Integer.parseInt("not-a-number");
        } catch (NumberFormatException e) {
            System.out.println("Number format error: " + e.getMessage());
        }
        
        // IllegalArgumentException
        try {
            Thread.sleep(-1000); // Negative sleep time
        } catch (IllegalArgumentException e) {
            System.out.println("Illegal argument: " + e.getMessage());
        } catch (InterruptedException e) {
            System.out.println("Thread interrupted: " + e.getMessage());
        }
        
        // ClassCastException
        try {
            Object obj = "Hello";
            Integer number = (Integer) obj; // Invalid cast
        } catch (ClassCastException e) {
            System.out.println("Class cast error: " + e.getMessage());
        }
    }
    
    // Method that can throw unchecked exceptions
    public static double calculateAverage(List<Integer> numbers) {
        if (numbers == null) {
            throw new IllegalArgumentException("List cannot be null");
        }
        
        if (numbers.isEmpty()) {
            throw new IllegalArgumentException("List cannot be empty");
        }
        
        int sum = 0;
        for (Integer number : numbers) {
            if (number == null) {
                throw new IllegalArgumentException("List cannot contain null values");
            }
            sum += number;
        }
        
        return (double) sum / numbers.size();
    }
    
    public static void main(String[] args) {
        System.out.println("=== Runtime Exceptions Demo ===");
        demonstrateRuntimeExceptions();
        
        System.out.println("\n=== Custom Validation Demo ===");
        
        // Valid usage
        List<Integer> validNumbers = new ArrayList<>();
        validNumbers.add(10);
        validNumbers.add(20);
        validNumbers.add(30);
        
        try {
            double average = calculateAverage(validNumbers);
            System.out.println("Average: " + average);
        } catch (IllegalArgumentException e) {
            System.out.println("Validation error: " + e.getMessage());
        }
        
        // Invalid usage - null list
        try {
            double average = calculateAverage(null);
        } catch (IllegalArgumentException e) {
            System.out.println("Validation error: " + e.getMessage());
        }
        
        // Invalid usage - empty list
        try {
            double average = calculateAverage(new ArrayList<>());
        } catch (IllegalArgumentException e) {
            System.out.println("Validation error: " + e.getMessage());
        }
    }
}
```

## Throwing Exceptions

### Using throw Statement

```java
public class ThrowExceptionsDemo {
    public static void validateAge(int age) {
        if (age < 0) {
            throw new IllegalArgumentException("Age cannot be negative: " + age);
        }
        if (age > 150) {
            throw new IllegalArgumentException("Age cannot exceed 150: " + age);
        }
        System.out.println("Valid age: " + age);
    }
    
    public static void validateEmail(String email) {
        if (email == null) {
            throw new NullPointerException("Email cannot be null");
        }
        if (email.trim().isEmpty()) {
            throw new IllegalArgumentException("Email cannot be empty");
        }
        if (!email.contains("@")) {
            throw new IllegalArgumentException("Invalid email format: " + email);
        }
        System.out.println("Valid email: " + email);
    }
    
    // Method that re-throws exceptions with additional context
    public static void processUserData(String email, int age) throws IllegalArgumentException {
        try {
            validateEmail(email);
            validateAge(age);
            System.out.println("User data processed successfully");
        } catch (IllegalArgumentException | NullPointerException e) {
            // Re-throw with additional context
            throw new IllegalArgumentException("User data validation failed: " + e.getMessage(), e);
        }
    }
    
    // Method that throws checked exceptions
    public static void connectToDatabase(String connectionString) throws Exception {
        if (connectionString == null || connectionString.isEmpty()) {
            throw new Exception("Connection string is required");
        }
        
        if (!connectionString.startsWith("jdbc:")) {
            throw new Exception("Invalid connection string format");
        }
        
        // Simulate connection failure
        if (connectionString.contains("localhost")) {
            throw new Exception("Cannot connect to localhost database");
        }
        
        System.out.println("Connected to database: " + connectionString);
    }
    
    public static void main(String[] args) {
        System.out.println("=== Throwing Exceptions Demo ===");
        
        // Valid input
        try {
            validateAge(25);
            validateEmail("user@example.com");
        } catch (Exception e) {
            System.out.println("Error: " + e.getMessage());
        }
        
        // Invalid inputs
        try {
            validateAge(-5);
        } catch (IllegalArgumentException e) {
            System.out.println("Age validation error: " + e.getMessage());
        }
        
        try {
            validateEmail("invalid-email");
        } catch (IllegalArgumentException e) {
            System.out.println("Email validation error: " + e.getMessage());
        }
        
        // Testing re-throw with context
        try {
            processUserData("bad-email", 25);
        } catch (IllegalArgumentException e) {
            System.out.println("Process error: " + e.getMessage());
            System.out.println("Caused by: " + e.getCause().getMessage());
        }
        
        // Testing checked exceptions
        try {
            connectToDatabase("jdbc:mysql://localhost:3306/test");
        } catch (Exception e) {
            System.out.println("Database connection error: " + e.getMessage());
        }
    }
}
```

## Custom Exception Classes

### Creating Custom Checked Exceptions

```java
// Custom checked exception for business logic
class InsufficientFundsException extends Exception {
    private double currentBalance;
    private double requestedAmount;
    
    public InsufficientFundsException(double currentBalance, double requestedAmount) {
        super("Insufficient funds. Balance: $" + currentBalance + 
              ", Requested: $" + requestedAmount);
        this.currentBalance = currentBalance;
        this.requestedAmount = requestedAmount;
    }
    
    public InsufficientFundsException(String message, double currentBalance, double requestedAmount) {
        super(message);
        this.currentBalance = currentBalance;
        this.requestedAmount = requestedAmount;
    }
    
    public double getCurrentBalance() {
        return currentBalance;
    }
    
    public double getRequestedAmount() {
        return requestedAmount;
    }
    
    public double getShortfall() {
        return requestedAmount - currentBalance;
    }
}

// Custom unchecked exception for validation
class InvalidAccountNumberException extends RuntimeException {
    private String accountNumber;
    
    public InvalidAccountNumberException(String accountNumber) {
        super("Invalid account number: " + accountNumber);
        this.accountNumber = accountNumber;
    }
    
    public InvalidAccountNumberException(String message, String accountNumber) {
        super(message);
        this.accountNumber = accountNumber;
    }
    
    public String getAccountNumber() {
        return accountNumber;
    }
}

// Business class using custom exceptions
class BankAccount {
    private String accountNumber;
    private double balance;
    private String accountHolder;
    
    public BankAccount(String accountNumber, String accountHolder, double initialBalance) {
        validateAccountNumber(accountNumber);
        this.accountNumber = accountNumber;
        this.accountHolder = accountHolder;
        this.balance = initialBalance;
    }
    
    private void validateAccountNumber(String accountNumber) {
        if (accountNumber == null || accountNumber.trim().isEmpty()) {
            throw new InvalidAccountNumberException("Account number cannot be null or empty", accountNumber);
        }
        
        if (accountNumber.length() != 10) {
            throw new InvalidAccountNumberException("Account number must be 10 digits", accountNumber);
        }
        
        if (!accountNumber.matches("\\d+")) {
            throw new InvalidAccountNumberException("Account number must contain only digits", accountNumber);
        }
    }
    
    public void withdraw(double amount) throws InsufficientFundsException {
        if (amount <= 0) {
            throw new IllegalArgumentException("Withdrawal amount must be positive");
        }
        
        if (amount > balance) {
            throw new InsufficientFundsException(balance, amount);
        }
        
        balance -= amount;
        System.out.println("Withdrawn $" + amount + ". New balance: $" + balance);
    }
    
    public void deposit(double amount) {
        if (amount <= 0) {
            throw new IllegalArgumentException("Deposit amount must be positive");
        }
        
        balance += amount;
        System.out.println("Deposited $" + amount + ". New balance: $" + balance);
    }
    
    public double getBalance() {
        return balance;
    }
    
    public String getAccountNumber() {
        return accountNumber;
    }
    
    public String getAccountHolder() {
        return accountHolder;
    }
}

public class CustomExceptionsDemo {
    public static void main(String[] args) {
        System.out.println("=== Custom Exceptions Demo ===");
        
        // Test invalid account number (unchecked exception)
        try {
            BankAccount invalidAccount = new BankAccount("123", "John Doe", 1000.0);
        } catch (InvalidAccountNumberException e) {
            System.out.println("Account creation failed: " + e.getMessage());
            System.out.println("Invalid account number: " + e.getAccountNumber());
        }
        
        // Test valid account
        try {
            BankAccount account = new BankAccount("1234567890", "Alice Johnson", 500.0);
            
            // Valid operations
            account.deposit(100.0);
            account.withdraw(200.0);
            
            // Test insufficient funds (checked exception)
            account.withdraw(500.0);
            
        } catch (InvalidAccountNumberException e) {
            System.out.println("Account validation error: " + e.getMessage());
        } catch (InsufficientFundsException e) {
            System.out.println("Transaction failed: " + e.getMessage());
            System.out.println("Current balance: $" + e.getCurrentBalance());
            System.out.println("Shortfall: $" + e.getShortfall());
        } catch (IllegalArgumentException e) {
            System.out.println("Invalid operation: " + e.getMessage());
        }
        
        // Demonstrate exception chaining
        try {
            processAccountTransaction("invalidacc", 100.0);
        } catch (Exception e) {
            System.out.println("Transaction processing failed: " + e.getMessage());
            if (e.getCause() != null) {
                System.out.println("Root cause: " + e.getCause().getMessage());
            }
        }
    }
    
    private static void processAccountTransaction(String accountNumber, double amount) throws Exception {
        try {
            BankAccount account = new BankAccount(accountNumber, "Test User", 1000.0);
            account.withdraw(amount);
        } catch (InvalidAccountNumberException e) {
            // Chain the exception with additional context
            throw new Exception("Failed to process transaction for account: " + accountNumber, e);
        }
    }
}
```

### Advanced Custom Exception Features

```java
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

// Advanced custom exception with detailed error information
class DetailedValidationException extends Exception {
    private final Map<String, String> validationErrors;
    private final LocalDateTime timestamp;
    private final String errorCode;
    
    public DetailedValidationException(String message, String errorCode) {
        super(message);
        this.errorCode = errorCode;
        this.timestamp = LocalDateTime.now();
        this.validationErrors = new HashMap<>();
    }
    
    public DetailedValidationException(String message, String errorCode, Map<String, String> errors) {
        super(message);
        this.errorCode = errorCode;
        this.timestamp = LocalDateTime.now();
        this.validationErrors = new HashMap<>(errors);
    }
    
    public void addValidationError(String field, String error) {
        validationErrors.put(field, error);
    }
    
    public Map<String, String> getValidationErrors() {
        return new HashMap<>(validationErrors);
    }
    
    public LocalDateTime getTimestamp() {
        return timestamp;
    }
    
    public String getErrorCode() {
        return errorCode;
    }
    
    public boolean hasValidationErrors() {
        return !validationErrors.isEmpty();
    }
    
    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append("DetailedValidationException{");
        sb.append("errorCode='").append(errorCode).append('\'');
        sb.append(", timestamp=").append(timestamp);
        sb.append(", message='").append(getMessage()).append('\'');
        
        if (hasValidationErrors()) {
            sb.append(", validationErrors={");
            validationErrors.forEach((field, error) -> 
                sb.append(field).append("='").append(error).append("', "));
            sb.setLength(sb.length() - 2); // Remove trailing comma and space
            sb.append("}");
        }
        
        sb.append("}");
        return sb.toString();
    }
}

// User validation service
class UserValidator {
    public static void validateUser(String name, String email, int age) 
            throws DetailedValidationException {
        Map<String, String> errors = new HashMap<>();
        
        // Validate name
        if (name == null || name.trim().isEmpty()) {
            errors.put("name", "Name is required");
        } else if (name.length() < 2) {
            errors.put("name", "Name must be at least 2 characters");
        } else if (name.length() > 50) {
            errors.put("name", "Name cannot exceed 50 characters");
        }
        
        // Validate email
        if (email == null || email.trim().isEmpty()) {
            errors.put("email", "Email is required");
        } else if (!email.matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$")) {
            errors.put("email", "Invalid email format");
        }
        
        // Validate age
        if (age < 0) {
            errors.put("age", "Age cannot be negative");
        } else if (age > 150) {
            errors.put("age", "Age cannot exceed 150");
        } else if (age < 18) {
            errors.put("age", "User must be at least 18 years old");
        }
        
        if (!errors.isEmpty()) {
            throw new DetailedValidationException(
                "User validation failed with " + errors.size() + " error(s)",
                "USER_VALIDATION_FAILED",
                errors
            );
        }
    }
}

public class AdvancedCustomExceptionsDemo {
    public static void main(String[] args) {
        System.out.println("=== Advanced Custom Exceptions Demo ===");
        
        // Test cases with different validation errors
        testUserValidation("", "invalid-email", -5);
        testUserValidation("A", "user@domain", 15);
        testUserValidation("Valid User", "valid@example.com", 25);
    }
    
    private static void testUserValidation(String name, String email, int age) {
        System.out.println("\n--- Testing user validation ---");
        System.out.println("Name: '" + name + "', Email: '" + email + "', Age: " + age);
        
        try {
            UserValidator.validateUser(name, email, age);
            System.out.println("✓ User validation passed successfully");
        } catch (DetailedValidationException e) {
            System.out.println("✗ User validation failed");
            System.out.println("Error Code: " + e.getErrorCode());
            System.out.println("Timestamp: " + e.getTimestamp());
            System.out.println("Message: " + e.getMessage());
            
            if (e.hasValidationErrors()) {
                System.out.println("Validation Errors:");
                e.getValidationErrors().forEach((field, error) -> 
                    System.out.println("  - " + field + ": " + error));
            }
        }
    }
}
```

## Best Practices for Exception Handling

### Exception Handling Guidelines

```java
import java.io.*;
import java.util.logging.Logger;
import java.util.logging.Level;

public class ExceptionBestPractices {
    private static final Logger logger = Logger.getLogger(ExceptionBestPractices.class.getName());
    
    // 1. Be specific with exception types
    public static void badPractice() {
        try {
            String text = null;
            int length = text.length();
        } catch (Exception e) { // Too broad
            System.out.println("Something went wrong");
        }
    }
    
    public static void goodPractice() {
        try {
            String text = null;
            int length = text.length();
        } catch (NullPointerException e) { // Specific exception
            System.out.println("Text cannot be null: " + e.getMessage());
        }
    }
    
    // 2. Don't swallow exceptions
    public static void badPracticeSwallowing() {
        try {
            riskyOperation();
        } catch (Exception e) {
            // Silently ignoring - bad practice
        }
    }
    
    public static void goodPracticeLogging() {
        try {
            riskyOperation();
        } catch (Exception e) {
            // Log the exception
            logger.log(Level.SEVERE, "Failed to execute risky operation", e);
            // Optionally re-throw or handle appropriately
            throw new RuntimeException("Operation failed", e);
        }
    }
    
    // 3. Clean up resources properly
    public static void processFileWithProperCleanup(String filename) {
        FileInputStream fis = null;
        BufferedInputStream bis = null;
        
        try {
            fis = new FileInputStream(filename);
            bis = new BufferedInputStream(fis);
            
            // Process file
            int data;
            while ((data = bis.read()) != -1) {
                // Process data
            }
            
        } catch (FileNotFoundException e) {
            logger.log(Level.WARNING, "File not found: " + filename, e);
        } catch (IOException e) {
            logger.log(Level.SEVERE, "Error processing file: " + filename, e);
        } finally {
            // Always clean up resources
            if (bis != null) {
                try {
                    bis.close();
                } catch (IOException e) {
                    logger.log(Level.WARNING, "Error closing BufferedInputStream", e);
                }
            }
            if (fis != null) {
                try {
                    fis.close();
                } catch (IOException e) {
                    logger.log(Level.WARNING, "Error closing FileInputStream", e);
                }
            }
        }
    }
    
    // 4. Use try-with-resources for AutoCloseable objects
    public static void processFileWithTryWithResources(String filename) {
        try (FileInputStream fis = new FileInputStream(filename);
             BufferedInputStream bis = new BufferedInputStream(fis)) {
            
            // Process file
            int data;
            while ((data = bis.read()) != -1) {
                // Process data
            }
            
        } catch (FileNotFoundException e) {
            logger.log(Level.WARNING, "File not found: " + filename, e);
        } catch (IOException e) {
            logger.log(Level.SEVERE, "Error processing file: " + filename, e);
        }
        // Resources automatically closed
    }
    
    // 5. Validate input early
    public static double calculateCircleArea(double radius) {
        // Validate input immediately
        if (radius < 0) {
            throw new IllegalArgumentException("Radius cannot be negative: " + radius);
        }
        
        return Math.PI * radius * radius;
    }
    
    // 6. Provide meaningful error messages
    public static void transferMoney(String fromAccount, String toAccount, double amount) 
            throws IllegalArgumentException {
        
        if (fromAccount == null || fromAccount.trim().isEmpty()) {
            throw new IllegalArgumentException("Source account number is required");
        }
        
        if (toAccount == null || toAccount.trim().isEmpty()) {
            throw new IllegalArgumentException("Destination account number is required");
        }
        
        if (amount <= 0) {
            throw new IllegalArgumentException(
                "Transfer amount must be positive, got: " + amount);
        }
        
        if (fromAccount.equals(toAccount)) {
            throw new IllegalArgumentException(
                "Cannot transfer money to the same account: " + fromAccount);
        }
        
        // Proceed with transfer
        System.out.println("Transferring $" + amount + " from " + fromAccount + " to " + toAccount);
    }
    
    private static void riskyOperation() throws Exception {
        // Simulate a risky operation
        if (Math.random() > 0.5) {
            throw new Exception("Random failure occurred");
        }
    }
    
    public static void main(String[] args) {
        System.out.println("=== Exception Best Practices Demo ===");
        
        // Test good practices
        goodPractice();
        
        try {
            double area = calculateCircleArea(5.0);
            System.out.println("Circle area: " + area);
            
            calculateCircleArea(-2.0); // Will throw exception
        } catch (IllegalArgumentException e) {
            System.out.println("Input validation error: " + e.getMessage());
        }
        
        try {
            transferMoney("12345", "67890", 100.0);
            transferMoney("12345", "12345", 50.0); // Same account
        } catch (IllegalArgumentException e) {
            System.out.println("Transfer validation error: " + e.getMessage());
        }
    }
}
```

## Summary

In this eleventh part of our Java tutorial series, you've learned:

✅ **Exception Fundamentals**: Understanding what exceptions are and the exception hierarchy  
✅ **Try-Catch-Finally**: Handling exceptions with proper cleanup  
✅ **Try-with-Resources**: Automatic resource management for cleaner code  
✅ **Exception Types**: Checked vs unchecked exceptions and when to use each  
✅ **Throwing Exceptions**: Using throw statements and creating meaningful error conditions  
✅ **Custom Exceptions**: Building custom exception classes for specific business logic  
✅ **Best Practices**: Writing robust, maintainable exception handling code  

### Key Takeaways

1. **Handle Exceptions Gracefully**: Don't let exceptions crash your application
2. **Be Specific**: Catch specific exception types rather than generic Exception
3. **Clean Up Resources**: Always close files, connections, and other resources
4. **Provide Context**: Include meaningful error messages and relevant information
5. **Validate Early**: Check input parameters and fail fast with clear messages
6. **Log Appropriately**: Record exceptions for debugging and monitoring

### What's Next?

In **Part 10: Interfaces**, we'll explore:
- Defining and implementing interfaces
- Default and static methods in interfaces
- Functional interfaces
- Interface inheritance and multiple inheritance
- When to use interfaces vs abstract classes

### Practice Exercises

Before moving on, try these exercises:

1. **File Processor**: Create a file processing utility with comprehensive exception handling
2. **Calculator Service**: Build a calculator that throws custom exceptions for invalid operations
3. **User Registration System**: Implement user registration with detailed validation exceptions
4. **Resource Manager**: Create a custom AutoCloseable resource and use it with try-with-resources

Ready to continue? In **Part 10**, we'll dive into interfaces and explore how they enable powerful design patterns in Java!

---

*This tutorial is part of our comprehensive Java Tutorial Series. Exception handling is crucial for building robust applications, so practice these concepts thoroughly.*