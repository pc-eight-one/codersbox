---
title: "Java Tutorial Series - Part 10: Interfaces"
description: "Master Java interfaces including defining and implementing interfaces, default and static methods, functional interfaces, and lambda expressions for flexible and modular code design."
publishDate: 2025-01-15
tags: ["Java", "Interfaces", "Default Methods", "Static Methods", "Functional Interfaces", "Lambda Expressions"]
difficulty: "intermediate"
series: "Java Tutorial Series"
part: 10
estimatedTime: "110 minutes"
totalParts: 24
featured: false
---

# Java Tutorial Series - Part 10: Interfaces

Interfaces are one of Java's most powerful features for creating flexible, modular, and maintainable code. They define contracts that classes must follow, enabling multiple inheritance of type and supporting polymorphism. In this part, we'll explore interfaces comprehensively, from basic concepts to advanced features like default methods and functional interfaces.

## What are Interfaces?

An interface in Java is a reference type that defines a contract of methods that implementing classes must provide. Think of an interface as a blueprint that specifies what a class can do, without specifying how it does it.

### Key Characteristics of Interfaces

**1. Abstract by Nature**: Interfaces define method signatures without implementations (except default and static methods)
**2. Multiple Inheritance**: A class can implement multiple interfaces
**3. Contract Definition**: Interfaces specify what methods a class must implement
**4. Type Safety**: Interfaces provide compile-time type checking
**5. Polymorphism**: Objects can be referenced by their interface types

### Interface vs Class vs Abstract Class

```java
// Interface - defines contract only
interface Drawable {
    void draw();  // Implicitly public and abstract
    double getArea();
}

// Abstract class - can have both abstract and concrete methods
abstract class Shape {
    protected String color;
    
    public Shape(String color) {
        this.color = color;
    }
    
    // Concrete method
    public String getColor() {
        return color;
    }
    
    // Abstract method
    public abstract double getArea();
}

// Concrete class - must implement all abstract methods
class Circle extends Shape implements Drawable {
    private double radius;
    
    public Circle(String color, double radius) {
        super(color);
        this.radius = radius;
    }
    
    @Override
    public void draw() {
        System.out.println("Drawing a " + color + " circle with radius " + radius);
    }
    
    @Override
    public double getArea() {
        return Math.PI * radius * radius;
    }
}
```

## Defining and Implementing Interfaces

### Basic Interface Definition

```java
/**
 * Basic interface for vehicles
 */
public interface Vehicle {
    // Constants (implicitly public, static, and final)
    int MAX_SPEED = 200;
    String DEFAULT_COLOR = "White";
    
    // Abstract methods (implicitly public and abstract)
    void start();
    void stop();
    void accelerate(int speed);
    void brake();
    
    // Method with return type
    int getCurrentSpeed();
    String getModel();
    boolean isRunning();
}

/**
 * Interface for electric vehicles
 */
public interface ElectricVehicle {
    // Electric-specific methods
    void chargeBattery();
    void plugIn();
    void plugOut();
    int getBatteryLevel();
    int getRange();
    
    // Constants
    int MIN_BATTERY_LEVEL = 10;
    int MAX_BATTERY_LEVEL = 100;
}

/**
 * Interface for autonomous features
 */
public interface Autonomous {
    void enableAutoPilot();
    void disableAutoPilot();
    boolean isAutoPilotActive();
    void setDestination(String destination);
}
```

### Implementing Single Interface

```java
/**
 * Car class implementing Vehicle interface
 */
public class Car implements Vehicle {
    private String model;
    private int currentSpeed;
    private boolean running;
    private String color;
    
    public Car(String model, String color) {
        this.model = model;
        this.color = color;
        this.currentSpeed = 0;
        this.running = false;
    }
    
    @Override
    public void start() {
        if (!running) {
            running = true;
            System.out.println(model + " engine started");
        } else {
            System.out.println(model + " is already running");
        }
    }
    
    @Override
    public void stop() {
        if (running) {
            running = false;
            currentSpeed = 0;
            System.out.println(model + " engine stopped");
        } else {
            System.out.println(model + " is already stopped");
        }
    }
    
    @Override
    public void accelerate(int speed) {
        if (running) {
            currentSpeed = Math.min(currentSpeed + speed, MAX_SPEED);
            System.out.println(model + " accelerated to " + currentSpeed + " km/h");
        } else {
            System.out.println("Cannot accelerate. " + model + " is not running");
        }
    }
    
    @Override
    public void brake() {
        if (running && currentSpeed > 0) {
            currentSpeed = Math.max(currentSpeed - 20, 0);
            System.out.println(model + " slowed down to " + currentSpeed + " km/h");
        } else {
            System.out.println(model + " is already stopped or not running");
        }
    }
    
    @Override
    public int getCurrentSpeed() {
        return currentSpeed;
    }
    
    @Override
    public String getModel() {
        return model;
    }
    
    @Override
    public boolean isRunning() {
        return running;
    }
    
    // Additional Car-specific methods
    public void honk() {
        System.out.println(model + " honks: Beep! Beep!");
    }
    
    public void displayInfo() {
        System.out.println("=== Car Information ===");
        System.out.println("Model: " + model);
        System.out.println("Color: " + color);
        System.out.println("Current Speed: " + currentSpeed + " km/h");
        System.out.println("Running: " + (running ? "Yes" : "No"));
    }
}
```

### Implementing Multiple Interfaces

```java
/**
 * Electric Car implementing multiple interfaces
 */
public class ElectricCar implements Vehicle, ElectricVehicle, Autonomous {
    private String model;
    private int currentSpeed;
    private boolean running;
    private String color;
    private int batteryLevel;
    private boolean pluggedIn;
    private boolean autoPilotActive;
    private String destination;
    
    public ElectricCar(String model, String color) {
        this.model = model;
        this.color = color;
        this.currentSpeed = 0;
        this.running = false;
        this.batteryLevel = 80; // Start with 80% charge
        this.pluggedIn = false;
        this.autoPilotActive = false;
        this.destination = null;
    }
    
    // Vehicle interface implementation
    @Override
    public void start() {
        if (batteryLevel < MIN_BATTERY_LEVEL) {
            System.out.println("Cannot start " + model + ". Battery too low: " + batteryLevel + "%");
            return;
        }
        
        if (!running) {
            running = true;
            System.out.println(model + " started silently (electric mode)");
        } else {
            System.out.println(model + " is already running");
        }
    }
    
    @Override
    public void stop() {
        if (running) {
            running = false;
            currentSpeed = 0;
            if (autoPilotActive) {
                disableAutoPilot();
            }
            System.out.println(model + " stopped");
        } else {
            System.out.println(model + " is already stopped");
        }
    }
    
    @Override
    public void accelerate(int speed) {
        if (!running) {
            System.out.println("Cannot accelerate. " + model + " is not running");
            return;
        }
        
        if (batteryLevel < MIN_BATTERY_LEVEL) {
            System.out.println("Cannot accelerate. Battery too low");
            return;
        }
        
        currentSpeed = Math.min(currentSpeed + speed, MAX_SPEED);
        batteryLevel = Math.max(batteryLevel - 1, 0); // Use battery
        System.out.println(model + " accelerated to " + currentSpeed + " km/h (Battery: " + batteryLevel + "%)");
    }
    
    @Override
    public void brake() {
        if (running && currentSpeed > 0) {
            currentSpeed = Math.max(currentSpeed - 25, 0);
            batteryLevel = Math.min(batteryLevel + 1, MAX_BATTERY_LEVEL); // Regenerative braking
            System.out.println(model + " slowed down to " + currentSpeed + " km/h (Regenerative braking: " + batteryLevel + "%)");
        }
    }
    
    @Override
    public int getCurrentSpeed() {
        return currentSpeed;
    }
    
    @Override
    public String getModel() {
        return model;
    }
    
    @Override
    public boolean isRunning() {
        return running;
    }
    
    // ElectricVehicle interface implementation
    @Override
    public void chargeBattery() {
        if (!pluggedIn) {
            System.out.println("Cannot charge. " + model + " is not plugged in");
            return;
        }
        
        if (batteryLevel < MAX_BATTERY_LEVEL) {
            int oldLevel = batteryLevel;
            batteryLevel = Math.min(batteryLevel + 20, MAX_BATTERY_LEVEL);
            System.out.println(model + " battery charged from " + oldLevel + "% to " + batteryLevel + "%");
        } else {
            System.out.println(model + " battery is already full");
        }
    }
    
    @Override
    public void plugIn() {
        if (!pluggedIn) {
            pluggedIn = true;
            System.out.println(model + " plugged in for charging");
        } else {
            System.out.println(model + " is already plugged in");
        }
    }
    
    @Override
    public void plugOut() {
        if (pluggedIn) {
            pluggedIn = false;
            System.out.println(model + " unplugged from charger");
        } else {
            System.out.println(model + " is not plugged in");
        }
    }
    
    @Override
    public int getBatteryLevel() {
        return batteryLevel;
    }
    
    @Override
    public int getRange() {
        return batteryLevel * 3; // Simplified: 3 km per 1% battery
    }
    
    // Autonomous interface implementation
    @Override
    public void enableAutoPilot() {
        if (!running) {
            System.out.println("Cannot enable autopilot. " + model + " is not running");
            return;
        }
        
        if (batteryLevel < 20) {
            System.out.println("Cannot enable autopilot. Battery too low for autonomous mode");
            return;
        }
        
        autoPilotActive = true;
        System.out.println(model + " autopilot enabled");
    }
    
    @Override
    public void disableAutoPilot() {
        if (autoPilotActive) {
            autoPilotActive = false;
            destination = null;
            System.out.println(model + " autopilot disabled");
        } else {
            System.out.println(model + " autopilot is already disabled");
        }
    }
    
    @Override
    public boolean isAutoPilotActive() {
        return autoPilotActive;
    }
    
    @Override
    public void setDestination(String destination) {
        if (autoPilotActive) {
            this.destination = destination;
            System.out.println(model + " autopilot destination set to: " + destination);
        } else {
            System.out.println("Cannot set destination. Autopilot is not active");
        }
    }
    
    // Additional methods
    public void displayFullInfo() {
        System.out.println("=== Electric Car Information ===");
        System.out.println("Model: " + model);
        System.out.println("Color: " + color);
        System.out.println("Current Speed: " + currentSpeed + " km/h");
        System.out.println("Running: " + (running ? "Yes" : "No"));
        System.out.println("Battery Level: " + batteryLevel + "%");
        System.out.println("Range: " + getRange() + " km");
        System.out.println("Plugged In: " + (pluggedIn ? "Yes" : "No"));
        System.out.println("Autopilot: " + (autoPilotActive ? "Active" : "Inactive"));
        if (destination != null) {
            System.out.println("Destination: " + destination);
        }
    }
}
```

### Interface Implementation Demo

```java
public class InterfaceDemo {
    public static void main(String[] args) {
        System.out.println("=== Interface Implementation Demo ===");
        
        // Create regular car
        Car regularCar = new Car("Honda Civic", "Blue");
        
        // Create electric car
        ElectricCar tesla = new ElectricCar("Tesla Model 3", "Red");
        
        System.out.println("--- Regular Car Operations ---");
        regularCar.displayInfo();
        regularCar.start();
        regularCar.accelerate(50);
        regularCar.accelerate(30);
        regularCar.brake();
        regularCar.honk();
        regularCar.stop();
        
        System.out.println("\n--- Electric Car Operations ---");
        tesla.displayFullInfo();
        
        // Vehicle operations
        tesla.start();
        tesla.accelerate(60);
        tesla.accelerate(40);
        tesla.brake();
        
        // Electric vehicle operations
        tesla.plugIn();
        tesla.chargeBattery();
        tesla.chargeBattery();
        tesla.plugOut();
        
        // Autonomous operations
        tesla.enableAutoPilot();
        tesla.setDestination("San Francisco");
        tesla.disableAutoPilot();
        
        tesla.stop();
        tesla.displayFullInfo();
        
        // Demonstrate polymorphism
        System.out.println("\n--- Polymorphism with Interfaces ---");
        demonstrateVehiclePolymorphism(regularCar);
        demonstrateVehiclePolymorphism(tesla);
        
        demonstrateElectricFeatures(tesla);
    }
    
    // Method accepting Vehicle interface
    public static void demonstrateVehiclePolymorphism(Vehicle vehicle) {
        System.out.println("Testing vehicle: " + vehicle.getModel());
        vehicle.start();
        vehicle.accelerate(30);
        System.out.println("Current speed: " + vehicle.getCurrentSpeed() + " km/h");
        vehicle.stop();
        System.out.println();
    }
    
    // Method accepting ElectricVehicle interface
    public static void demonstrateElectricFeatures(ElectricVehicle ev) {
        System.out.println("Electric vehicle battery level: " + ev.getBatteryLevel() + "%");
        System.out.println("Range: " + ev.getRange() + " km");
        ev.plugIn();
        ev.chargeBattery();
        ev.plugOut();
        System.out.println();
    }
}
```

## Default and Static Methods

Java 8 introduced default and static methods in interfaces, allowing interfaces to provide method implementations and utility methods.

### Default Methods

```java
/**
 * Interface with default methods
 */
public interface PaymentProcessor {
    // Abstract methods
    boolean processPayment(double amount);
    String getPaymentMethod();
    
    // Default method - provides default implementation
    default void logTransaction(double amount, boolean success) {
        String status = success ? "SUCCESS" : "FAILED";
        String method = getPaymentMethod();
        System.out.println("[" + getCurrentTimestamp() + "] " + method + 
                          " transaction of $" + amount + " - " status);
    }
    
    // Default method that can be overridden
    default double calculateFee(double amount) {
        return amount * 0.03; // 3% default fee
    }
    
    // Default method calling other default method
    default void processPaymentWithLogging(double amount) {
        boolean success = processPayment(amount);
        logTransaction(amount, success);
        
        if (success) {
            double fee = calculateFee(amount);
            System.out.println("Processing fee: $" + String.format("%.2f", fee));
        }
    }
    
    // Private helper method (Java 9+)
    private String getCurrentTimestamp() {
        return java.time.LocalDateTime.now().toString();
    }
    
    // Static method
    static boolean isValidAmount(double amount) {
        return amount > 0 && amount <= 10000;
    }
    
    // Static method with complex logic
    static PaymentProcessor createProcessor(String type) {
        switch (type.toLowerCase()) {
            case "credit":
                return new CreditCardProcessor();
            case "paypal":
                return new PayPalProcessor();
            case "crypto":
                return new CryptoCurrencyProcessor();
            default:
                throw new IllegalArgumentException("Unknown payment type: " + type);
        }
    }
}

/**
 * Credit card payment processor
 */
class CreditCardProcessor implements PaymentProcessor {
    private String cardNumber;
    private String cardHolder;
    
    public CreditCardProcessor() {
        this.cardNumber = "**** **** **** 1234";
        this.cardHolder = "John Doe";
    }
    
    @Override
    public boolean processPayment(double amount) {
        if (!PaymentProcessor.isValidAmount(amount)) {
            System.out.println("Invalid payment amount: $" + amount);
            return false;
        }
        
        // Simulate payment processing
        System.out.println("Processing credit card payment of $" + amount);
        System.out.println("Card: " + cardNumber + " (" + cardHolder + ")");
        
        // Simulate success/failure (90% success rate)
        return Math.random() < 0.9;
    }
    
    @Override
    public String getPaymentMethod() {
        return "CREDIT_CARD";
    }
    
    // Override default method to provide custom fee calculation
    @Override
    public double calculateFee(double amount) {
        return amount * 0.025; // 2.5% fee for credit cards
    }
}

/**
 * PayPal payment processor
 */
class PayPalProcessor implements PaymentProcessor {
    private String email;
    
    public PayPalProcessor() {
        this.email = "user@example.com";
    }
    
    @Override
    public boolean processPayment(double amount) {
        if (!PaymentProcessor.isValidAmount(amount)) {
            System.out.println("Invalid payment amount: $" + amount);
            return false;
        }
        
        System.out.println("Processing PayPal payment of $" + amount);
        System.out.println("PayPal account: " + email);
        
        return Math.random() < 0.95; // 95% success rate
    }
    
    @Override
    public String getPaymentMethod() {
        return "PAYPAL";
    }
    
    // Use default fee calculation (3%)
}

/**
 * Cryptocurrency payment processor
 */
class CryptoCurrencyProcessor implements PaymentProcessor {
    private String walletAddress;
    
    public CryptoCurrencyProcessor() {
        this.walletAddress = "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa";
    }
    
    @Override
    public boolean processPayment(double amount) {
        if (!PaymentProcessor.isValidAmount(amount)) {
            System.out.println("Invalid payment amount: $" + amount);
            return false;
        }
        
        System.out.println("Processing cryptocurrency payment of $" + amount);
        System.out.println("Wallet: " + walletAddress);
        
        return Math.random() < 0.85; // 85% success rate
    }
    
    @Override
    public String getPaymentMethod() {
        return "CRYPTOCURRENCY";
    }
    
    @Override
    public double calculateFee(double amount) {
        return amount * 0.01; // 1% fee for crypto
    }
    
    // Override default logging to add crypto-specific information
    @Override
    public void logTransaction(double amount, boolean success) {
        String status = success ? "CONFIRMED" : "REJECTED";
        System.out.println("[BLOCKCHAIN] " + getPaymentMethod() + 
                          " transaction of $" + amount + " - " + status);
        if (success) {
            System.out.println("Transaction hash: " + generateTransactionHash());
        }
    }
    
    private String generateTransactionHash() {
        return "0x" + Integer.toHexString((int)(Math.random() * 1000000));
    }
}
```

### Advanced Interface Features

```java
/**
 * Interface demonstrating advanced features
 */
public interface DataAnalyzer<T> {
    // Generic method
    void analyze(T data);
    
    // Default method with generics
    default void analyzeMultiple(T[] dataArray) {
        System.out.println("Analyzing " + dataArray.length + " data points");
        for (T data : dataArray) {
            analyze(data);
        }
        System.out.println("Analysis complete");
    }
    
    // Default method with complex logic
    default void generateReport(T[] dataArray, String reportType) {
        System.out.println("=== " + reportType.toUpperCase() + " REPORT ===");
        analyzeMultiple(dataArray);
        
        // Additional reporting logic
        switch (reportType.toLowerCase()) {
            case "summary":
                System.out.println("Summary: Processed " + dataArray.length + " items");
                break;
            case "detailed":
                System.out.println("Detailed analysis completed");
                System.out.println("Data type: " + getDataTypeName());
                break;
            default:
                System.out.println("Standard report generated");
        }
    }
    
    // Abstract method for getting data type name
    String getDataTypeName();
    
    // Static utility method
    static <U> void printArray(U[] array) {
        System.out.print("[");
        for (int i = 0; i < array.length; i++) {
            System.out.print(array[i]);
            if (i < array.length - 1) {
                System.out.print(", ");
            }
        }
        System.out.println("]");
    }
    
    // Static factory method
    static DataAnalyzer<String> createStringAnalyzer() {
        return new StringDataAnalyzer();
    }
    
    static DataAnalyzer<Integer> createNumberAnalyzer() {
        return new NumberDataAnalyzer();
    }
}

/**
 * String data analyzer implementation
 */
class StringDataAnalyzer implements DataAnalyzer<String> {
    @Override
    public void analyze(String data) {
        System.out.println("Analyzing string: '" + data + "' (length: " + data.length() + ")");
    }
    
    @Override
    public String getDataTypeName() {
        return "String";
    }
    
    // Additional string-specific analysis
    public void analyzeStringPattern(String data) {
        boolean hasNumbers = data.matches(".*\\d.*");
        boolean hasSpecialChars = data.matches(".*[^a-zA-Z0-9\\s].*");
        
        System.out.println("Pattern analysis:");
        System.out.println("  Contains numbers: " + hasNumbers);
        System.out.println("  Contains special characters: " + hasSpecialChars);
    }
}

/**
 * Number data analyzer implementation
 */
class NumberDataAnalyzer implements DataAnalyzer<Integer> {
    @Override
    public void analyze(Integer data) {
        System.out.println("Analyzing number: " + data + " (even: " + (data % 2 == 0) + ")");
    }
    
    @Override
    public String getDataTypeName() {
        return "Integer";
    }
    
    // Override default method for specialized behavior
    @Override
    public void analyzeMultiple(Integer[] dataArray) {
        System.out.println("Performing numerical analysis on " + dataArray.length + " numbers");
        
        int sum = 0;
        int min = dataArray[0];
        int max = dataArray[0];
        
        for (Integer number : dataArray) {
            analyze(number);
            sum += number;
            min = Math.min(min, number);
            max = Math.max(max, number);
        }
        
        double average = (double) sum / dataArray.length;
        System.out.println("Statistical summary:");
        System.out.println("  Sum: " + sum);
        System.out.println("  Average: " + String.format("%.2f", average));
        System.out.println("  Min: " + min);
        System.out.println("  Max: " + max);
    }
}
```

### Default and Static Methods Demo

```java
public class DefaultStaticMethodsDemo {
    public static void main(String[] args) {
        System.out.println("=== Default and Static Methods Demo ===");
        
        // Test payment processors
        System.out.println("--- Payment Processing ---");
        
        // Create processors using static factory method
        PaymentProcessor creditCard = PaymentProcessor.createProcessor("credit");
        PaymentProcessor paypal = PaymentProcessor.createProcessor("paypal");
        PaymentProcessor crypto = PaymentProcessor.createProcessor("crypto");
        
        // Test payments with default methods
        double amount = 100.0;
        
        System.out.println("Testing Credit Card:");
        creditCard.processPaymentWithLogging(amount);
        
        System.out.println("\nTesting PayPal:");
        paypal.processPaymentWithLogging(amount);
        
        System.out.println("\nTesting Cryptocurrency:");
        crypto.processPaymentWithLogging(amount);
        
        // Test static validation method
        System.out.println("\n--- Static Method Validation ---");
        System.out.println("$50 valid: " + PaymentProcessor.isValidAmount(50));
        System.out.println("$15000 valid: " + PaymentProcessor.isValidAmount(15000));
        System.out.println("$-10 valid: " + PaymentProcessor.isValidAmount(-10));
        
        // Test data analyzers
        System.out.println("\n--- Data Analysis ---");
        
        // Create analyzers using static factory methods
        DataAnalyzer<String> stringAnalyzer = DataAnalyzer.createStringAnalyzer();
        DataAnalyzer<Integer> numberAnalyzer = DataAnalyzer.createNumberAnalyzer();
        
        // Test string analysis
        String[] strings = {"Hello", "World123", "Java!", "Programming"};
        System.out.println("String data:");
        DataAnalyzer.printArray(strings);
        stringAnalyzer.generateReport(strings, "detailed");
        
        // Test number analysis
        Integer[] numbers = {10, 25, 7, 42, 15, 8, 33};
        System.out.println("\nNumber data:");
        DataAnalyzer.printArray(numbers);
        numberAnalyzer.generateReport(numbers, "summary");
    }
}
```

## Functional Interfaces and Lambda Expressions

A functional interface is an interface with exactly one abstract method. They can be used with lambda expressions and method references.

### Built-in Functional Interfaces

```java
import java.util.function.*;
import java.util.Arrays;
import java.util.List;
import java.util.ArrayList;

/**
 * Demonstration of built-in functional interfaces
 */
public class BuiltInFunctionalInterfaces {
    
    public static void demonstratePredicate() {
        System.out.println("=== Predicate<T> Examples ===");
        
        // Predicate for checking even numbers
        Predicate<Integer> isEven = number -> number % 2 == 0;
        
        // Predicate for checking positive numbers
        Predicate<Integer> isPositive = number -> number > 0;
        
        // Predicate for checking strings
        Predicate<String> isLongString = str -> str.length() > 5;
        
        // Test predicates
        List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, -5, -2);
        
        System.out.println("Original numbers: " + numbers);
        
        // Filter even numbers
        List<Integer> evenNumbers = filterList(numbers, isEven);
        System.out.println("Even numbers: " + evenNumbers);
        
        // Filter positive numbers
        List<Integer> positiveNumbers = filterList(numbers, isPositive);
        System.out.println("Positive numbers: " + positiveNumbers);
        
        // Combine predicates
        Predicate<Integer> evenAndPositive = isEven.and(isPositive);
        List<Integer> evenAndPositiveNumbers = filterList(numbers, evenAndPositive);
        System.out.println("Even and positive: " + evenAndPositiveNumbers);
        
        // Negate predicate
        Predicate<Integer> isOdd = isEven.negate();
        List<Integer> oddNumbers = filterList(numbers, isOdd);
        System.out.println("Odd numbers: " + oddNumbers);
        
        // String predicate example
        List<String> words = Arrays.asList("Java", "Python", "JavaScript", "C++", "Go", "Rust");
        List<String> longWords = filterList(words, isLongString);
        System.out.println("Long words: " + longWords);
    }
    
    public static void demonstrateFunction() {
        System.out.println("\n=== Function<T, R> Examples ===");
        
        // Function to square a number
        Function<Integer, Integer> square = x -> x * x;
        
        // Function to convert to uppercase
        Function<String, String> toUpperCase = String::toUpperCase;
        
        // Function to get string length
        Function<String, Integer> getLength = String::length;
        
        // Function composition
        Function<Integer, String> numberToString = Object::toString;
        Function<Integer, String> squareAndStringify = square.andThen(numberToString);
        
        // Test functions
        List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5);
        List<Integer> squared = transformList(numbers, square);
        System.out.println("Original: " + numbers);
        System.out.println("Squared: " + squared);
        
        List<String> words = Arrays.asList("hello", "world", "java", "programming");
        List<String> upperCased = transformList(words, toUpperCase);
        System.out.println("Original words: " + words);
        System.out.println("Upper cased: " + upperCased);
        
        List<Integer> lengths = transformList(words, getLength);
        System.out.println("Word lengths: " + lengths);
        
        // Function composition example
        List<String> squaredStrings = transformList(numbers, squareAndStringify);
        System.out.println("Squared and stringified: " + squaredStrings);
    }
    
    public static void demonstrateConsumer() {
        System.out.println("\n=== Consumer<T> Examples ===");
        
        // Consumer to print with prefix
        Consumer<String> printWithPrefix = str -> System.out.println(">> " + str);
        
        // Consumer to print number info
        Consumer<Integer> printNumberInfo = num -> {
            System.out.println("Number: " + num + 
                             " (Even: " + (num % 2 == 0) + 
                             ", Square: " + (num * num) + ")");
        };
        
        // BiConsumer for key-value pairs
        BiConsumer<String, Integer> printKeyValue = (key, value) -> 
            System.out.println(key + " -> " + value);
        
        // Test consumers
        List<String> words = Arrays.asList("Java", "Python", "JavaScript");
        System.out.println("Processing words:");
        processEach(words, printWithPrefix);
        
        List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5);
        System.out.println("\nProcessing numbers:");
        processEach(numbers, printNumberInfo);
        
        // Chain consumers
        Consumer<String> printAndLog = printWithPrefix.andThen(str -> 
            System.out.println("Logged: " + str));
        
        System.out.println("\nChained consumer:");
        printAndLog.accept("Hello World");
    }
    
    public static void demonstrateSupplier() {
        System.out.println("\n=== Supplier<T> Examples ===");
        
        // Supplier for random numbers
        Supplier<Integer> randomNumber = () -> (int)(Math.random() * 100);
        
        // Supplier for current timestamp
        Supplier<String> currentTime = () -> java.time.LocalTime.now().toString();
        
        // Supplier for default values
        Supplier<List<String>> emptyStringList = ArrayList::new;
        
        // Test suppliers
        System.out.println("Random numbers:");
        for (int i = 0; i < 5; i++) {
            System.out.println("Random: " + randomNumber.get());
        }
        
        System.out.println("\nCurrent times:");
        for (int i = 0; i < 3; i++) {
            System.out.println("Time: " + currentTime.get());
            try { Thread.sleep(1000); } catch (InterruptedException e) {}
        }
        
        // Use supplier for lazy initialization
        List<String> lazyList = emptyStringList.get();
        lazyList.add("First item");
        lazyList.add("Second item");
        System.out.println("Lazy initialized list: " + lazyList);
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
    }
}
```

### Custom Functional Interfaces

```java
/**
 * Custom functional interfaces for specific use cases
 */

// Simple calculation interface
@FunctionalInterface
interface Calculator {
    double calculate(double a, double b);
    
    // Default method
    default void printResult(double a, double b) {
        double result = calculate(a, b);
        System.out.println("Result: " + a + " op " + b + " = " + result);
    }
    
    // Static method
    static Calculator add() {
        return (a, b) -> a + b;
    }
    
    static Calculator multiply() {
        return (a, b) -> a * b;
    }
}

// String processor interface
@FunctionalInterface
interface StringProcessor {
    String process(String input);
    
    // Default method for chaining
    default StringProcessor andThen(StringProcessor after) {
        return input -> after.process(this.process(input));
    }
}

// Validator interface with generic type
@FunctionalInterface
interface Validator<T> {
    boolean isValid(T item);
    
    default Validator<T> and(Validator<T> other) {
        return item -> this.isValid(item) && other.isValid(item);
    }
    
    default Validator<T> or(Validator<T> other) {
        return item -> this.isValid(item) || other.isValid(item);
    }
}

// Event handler interface
@FunctionalInterface
interface EventHandler<T> {
    void handle(T event);
    
    default EventHandler<T> andThen(EventHandler<T> after) {
        return event -> {
            this.handle(event);
            after.handle(event);
        };
    }
}

// Data transformer with exception handling
@FunctionalInterface
interface DataTransformer<T, R> {
    R transform(T input) throws Exception;
    
    default <V> DataTransformer<T, V> andThen(DataTransformer<R, V> after) {
        return input -> after.transform(this.transform(input));
    }
}

/**
 * Demonstration class for custom functional interfaces
 */
public class CustomFunctionalInterfaces {
    
    public static void demonstrateCalculator() {
        System.out.println("=== Calculator Interface ===");
        
        // Using lambda expressions
        Calculator add = (a, b) -> a + b;
        Calculator subtract = (a, b) -> a - b;
        Calculator multiply = (a, b) -> a * b;
        Calculator divide = (a, b) -> b != 0 ? a / b : 0;
        
        // Using static factory methods
        Calculator staticAdd = Calculator.add();
        Calculator staticMultiply = Calculator.multiply();
        
        // Test calculations
        double x = 10, y = 5;
        
        System.out.println("Lambda expressions:");
        add.printResult(x, y);
        subtract.printResult(x, y);
        multiply.printResult(x, y);
        divide.printResult(x, y);
        
        System.out.println("Static factory methods:");
        staticAdd.printResult(x, y);
        staticMultiply.printResult(x, y);
        
        // Using method references
        Calculator power = Math::pow;
        power.printResult(2, 8);
    }
    
    public static void demonstrateStringProcessor() {
        System.out.println("\n=== String Processor Interface ===");
        
        // Define processors
        StringProcessor trim = String::trim;
        StringProcessor toUpperCase = String::toUpperCase;
        StringProcessor removeSpaces = str -> str.replaceAll("\\s+", "");
        StringProcessor addPrefix = str -> "PROCESSED: " + str;
        
        // Chain processors
        StringProcessor complexProcessor = trim
            .andThen(toUpperCase)
            .andThen(removeSpaces)
            .andThen(addPrefix);
        
        // Test string processing
        String input = "  Hello World Java Programming  ";
        System.out.println("Original: '" + input + "'");
        System.out.println("Trimmed: '" + trim.process(input) + "'");
        System.out.println("Upper case: '" + toUpperCase.process(input) + "'");
        System.out.println("Complex processing: '" + complexProcessor.process(input) + "'");
    }
    
    public static void demonstrateValidator() {
        System.out.println("\n=== Validator Interface ===");
        
        // String validators
        Validator<String> notEmpty = str -> str != null && !str.isEmpty();
        Validator<String> minLength = str -> str.length() >= 3;
        Validator<String> maxLength = str -> str.length() <= 20;
        Validator<String> alphaNumeric = str -> str.matches("[a-zA-Z0-9]+");
        
        // Number validators
        Validator<Integer> positive = num -> num > 0;
        Validator<Integer> inRange = num -> num >= 1 && num <= 100;
        
        // Combine validators
        Validator<String> validUsername = notEmpty.and(minLength).and(maxLength).and(alphaNumeric);
        Validator<Integer> validScore = positive.and(inRange);
        
        // Test validators
        String[] usernames = {"john", "jo", "johnsmith123", "john@smith", "", "verylongusernamethatshouldberejected"};
        Integer[] scores = {85, -5, 150, 0, 50, 101};
        
        System.out.println("Username validation:");
        for (String username : usernames) {
            System.out.println("'" + username + "' -> " + validUsername.isValid(username));
        }
        
        System.out.println("\nScore validation:");
        for (Integer score : scores) {
            System.out.println(score + " -> " + validScore.isValid(score));
        }
    }
    
    public static void demonstrateEventHandler() {
        System.out.println("\n=== Event Handler Interface ===");
        
        // Define event handlers
        EventHandler<String> logger = event -> System.out.println("[LOG] " + event);
        EventHandler<String> emailNotifier = event -> System.out.println("[EMAIL] Notification: " + event);
        EventHandler<String> databaseSaver = event -> System.out.println("[DB] Saved: " + event);
        
        // Chain handlers
        EventHandler<String> multiHandler = logger.andThen(emailNotifier).andThen(databaseSaver);
        
        // Test event handling
        System.out.println("Single handler:");
        logger.handle("User logged in");
        
        System.out.println("\nMultiple handlers:");
        multiHandler.handle("User registered");
        multiHandler.handle("Order placed");
    }
    
    public static void demonstrateDataTransformer() {
        System.out.println("\n=== Data Transformer Interface ===");
        
        // Define transformers
        DataTransformer<String, Integer> stringToLength = String::length;
        DataTransformer<Integer, String> intToString = Object::toString;
        DataTransformer<String, String> toUpperCase = String::toUpperCase;
        
        // Chain transformers
        DataTransformer<String, String> lengthToString = stringToLength.andThen(intToString);
        
        try {
            // Test transformations
            String input = "Hello World";
            System.out.println("Input: " + input);
            System.out.println("Length: " + stringToLength.transform(input));
            System.out.println("Length as string: " + lengthToString.transform(input));
            System.out.println("Upper case: " + toUpperCase.transform(input));
            
            // Example with exception handling
            DataTransformer<String, Integer> stringToInt = Integer::parseInt;
            
            System.out.println("\nParsing numbers:");
            System.out.println("'123' -> " + stringToInt.transform("123"));
            
            try {
                System.out.println("'abc' -> " + stringToInt.transform("abc"));
            } catch (NumberFormatException e) {
                System.out.println("'abc' -> Error: " + e.getMessage());
            }
            
        } catch (Exception e) {
            System.out.println("Error: " + e.getMessage());
        }
    }
    
    public static void main(String[] args) {
        demonstrateCalculator();
        demonstrateStringProcessor();
        demonstrateValidator();
        demonstrateEventHandler();
        demonstrateDataTransformer();
    }
}
```

### Lambda Expressions Advanced Usage

```java
import java.util.*;
import java.util.stream.Collectors;

/**
 * Advanced lambda expressions and functional programming examples
 */
public class LambdaAdvancedUsage {
    
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
    
    static class Product {
        private String name;
        private String category;
        private double price;
        private int rating;
        
        public Product(String name, String category, double price, int rating) {
            this.name = name;
            this.category = category;
            this.price = price;
            this.rating = rating;
        }
        
        public String getName() { return name; }
        public String getCategory() { return category; }
        public double getPrice() { return price; }
        public int getRating() { return rating; }
        
        @Override
        public String toString() {
            return String.format("%s (%s, $%.2f, %d stars)", name, category, price, rating);
        }
    }
    
    public static void demonstrateComplexLambdas() {
        System.out.println("=== Complex Lambda Expressions ===");
        
        // Sample employee data
        List<Employee> employees = Arrays.asList(
            new Employee("Alice Johnson", "Engineering", 85000, 28),
            new Employee("Bob Smith", "Marketing", 65000, 35),
            new Employee("Charlie Brown", "Engineering", 75000, 24),
            new Employee("Diana Prince", "Sales", 70000, 30),
            new Employee("Eve Adams", "Engineering", 90000, 32),
            new Employee("Frank Miller", "Marketing", 60000, 29)
        );
        
        System.out.println("All employees:");
        employees.forEach(System.out::println);
        
        // Complex filtering with lambda
        List<Employee> highEarningYoungEngineers = employees.stream()
            .filter(emp -> emp.getDepartment().equals("Engineering"))
            .filter(emp -> emp.getAge() < 30)
            .filter(emp -> emp.getSalary() > 70000)
            .collect(Collectors.toList());
        
        System.out.println("\nHigh-earning young engineers:");
        highEarningYoungEngineers.forEach(System.out::println);
        
        // Grouping with lambda
        Map<String, List<Employee>> employeesByDepartment = employees.stream()
            .collect(Collectors.groupingBy(Employee::getDepartment));
        
        System.out.println("\nEmployees by department:");
        employeesByDepartment.forEach((dept, empList) -> {
            System.out.println(dept + ":");
            empList.forEach(emp -> System.out.println("  " + emp));
        });
        
        // Statistical operations
        DoubleSummaryStatistics salaryStats = employees.stream()
            .mapToDouble(Employee::getSalary)
            .summaryStatistics();
        
        System.out.println("\nSalary statistics:");
        System.out.println("Count: " + salaryStats.getCount());
        System.out.println("Average: $" + String.format("%.2f", salaryStats.getAverage()));
        System.out.println("Min: $" + salaryStats.getMin());
        System.out.println("Max: $" + salaryStats.getMax());
        System.out.println("Sum: $" + salaryStats.getSum());
    }
    
    public static void demonstrateStreamOperations() {
        System.out.println("\n=== Stream Operations with Lambdas ===");
        
        List<Product> products = Arrays.asList(
            new Product("Laptop", "Electronics", 999.99, 4),
            new Product("Mouse", "Electronics", 29.99, 5),
            new Product("Keyboard", "Electronics", 79.99, 4),
            new Product("Chair", "Furniture", 199.99, 3),
            new Product("Desk", "Furniture", 299.99, 4),
            new Product("Book", "Education", 19.99, 5),
            new Product("Pen", "Education", 2.99, 4)
        );
        
        System.out.println("All products:");
        products.forEach(System.out::println);
        
        // Find most expensive product
        Optional<Product> mostExpensive = products.stream()
            .max(Comparator.comparing(Product::getPrice));
        
        mostExpensive.ifPresent(product -> 
            System.out.println("\nMost expensive: " + product));
        
        // Find average price by category
        Map<String, Double> avgPriceByCategory = products.stream()
            .collect(Collectors.groupingBy(
                Product::getCategory,
                Collectors.averagingDouble(Product::getPrice)
            ));
        
        System.out.println("\nAverage price by category:");
        avgPriceByCategory.forEach((category, avgPrice) ->
            System.out.println(category + ": $" + String.format("%.2f", avgPrice)));
        
        // Complex filtering and transformation
        List<String> expensiveHighRatedProductNames = products.stream()
            .filter(p -> p.getPrice() > 50)
            .filter(p -> p.getRating() >= 4)
            .map(Product::getName)
            .sorted()
            .collect(Collectors.toList());
        
        System.out.println("\nExpensive, high-rated products:");
        expensiveHighRatedProductNames.forEach(name -> System.out.println("  " + name));
        
        // Custom collector
        String productSummary = products.stream()
            .map(Product::getName)
            .collect(Collectors.joining(", ", "Products: [", "]"));
        
        System.out.println("\n" + productSummary);
    }
    
    public static void demonstrateMethodReferences() {
        System.out.println("\n=== Method References ===");
        
        List<String> words = Arrays.asList("java", "python", "javascript", "kotlin", "scala");
        
        // Static method reference
        System.out.println("Original words: " + words);
        
        // Instance method reference
        List<String> upperCased = words.stream()
            .map(String::toUpperCase)  // Method reference
            .collect(Collectors.toList());
        System.out.println("Upper cased: " + upperCased);
        
        List<Integer> lengths = words.stream()
            .map(String::length)       // Method reference
            .collect(Collectors.toList());
        System.out.println("Lengths: " + lengths);
        
        // Constructor reference
        List<StringBuilder> stringBuilders = words.stream()
            .map(StringBuilder::new)   // Constructor reference
            .collect(Collectors.toList());
        
        System.out.println("StringBuilder objects:");
        stringBuilders.forEach(sb -> System.out.println("  " + sb.toString()));
        
        // Reference to instance method of particular object
        String prefix = "Language: ";
        List<String> prefixed = words.stream()
            .map(prefix::concat)       // Instance method reference
            .collect(Collectors.toList());
        System.out.println("Prefixed: " + prefixed);
    }
    
    public static void demonstrateFunctionalComposition() {
        System.out.println("\n=== Functional Composition ===");
        
        // Function composition
        Function<String, String> trim = String::trim;
        Function<String, String> upperCase = String::toUpperCase;
        Function<String, Integer> length = String::length;
        
        // Compose functions
        Function<String, String> trimAndUpper = trim.andThen(upperCase);
        Function<String, Integer> trimUpperLength = trimAndUpper.andThen(length);
        
        String input = "  hello world  ";
        System.out.println("Original: '" + input + "'");
        System.out.println("Trim and upper: '" + trimAndUpper.apply(input) + "'");
        System.out.println("Length after processing: " + trimUpperLength.apply(input));
        
        // Predicate composition
        Predicate<String> notEmpty = s -> !s.isEmpty();
        Predicate<String> longEnough = s -> s.length() > 3;
        Predicate<String> startsWithA = s -> s.toLowerCase().startsWith("a");
        
        Predicate<String> validAndStartsWithA = notEmpty.and(longEnough).and(startsWithA);
        
        List<String> testStrings = Arrays.asList("apple", "app", "application", "", "banana", "avocado");
        
        System.out.println("\nTesting combined predicate (not empty AND length > 3 AND starts with 'a'):");
        testStrings.forEach(s -> 
            System.out.println("'" + s + "' -> " + validAndStartsWithA.test(s)));
    }
    
    public static void main(String[] args) {
        demonstrateComplexLambdas();
        demonstrateStreamOperations();
        demonstrateMethodReferences();
        demonstrateFunctionalComposition();
    }
}
```

## Summary

In this tenth part of our Java tutorial series, you've learned:

✅ **Interface Fundamentals**: Defining contracts and implementing multiple interfaces  
✅ **Default Methods**: Providing default implementations while maintaining backward compatibility  
✅ **Static Methods**: Adding utility methods to interfaces  
✅ **Functional Interfaces**: Single abstract method interfaces for lambda expressions  
✅ **Lambda Expressions**: Concise function implementations and functional programming  
✅ **Method References**: Simplified syntax for referring to existing methods  
✅ **Advanced Patterns**: Composition, chaining, and complex functional operations  

### Key Takeaways

1. **Interfaces vs Classes**: Interfaces define contracts; classes provide implementations
2. **Multiple Inheritance**: Classes can implement multiple interfaces for flexible design
3. **Default Methods**: Enable interface evolution without breaking existing code
4. **Functional Programming**: Lambda expressions make code more concise and expressive
5. **Composition over Inheritance**: Interfaces promote composition-based design

### Best Practices

1. **Use interfaces for contracts** - Define what classes should do, not how
2. **Prefer composition** - Implement multiple interfaces rather than complex inheritance
3. **Keep interfaces focused** - Single responsibility principle applies to interfaces
4. **Use default methods carefully** - Only when they provide genuine default behavior
5. **Leverage functional interfaces** - Use built-in functional interfaces when possible

### Common Interface Patterns

1. **Marker Interfaces**: Interfaces with no methods (like `Serializable`)
2. **Functional Interfaces**: Single method interfaces for lambda expressions
3. **Mixin Interfaces**: Interfaces providing additional capabilities
4. **Strategy Pattern**: Using interfaces to define interchangeable algorithms
5. **Observer Pattern**: Using interfaces for event handling

### What's Next?

In **Part 11: Exception Handling**, we'll explore:
- Try-catch blocks and exception handling
- Checked vs unchecked exceptions
- Throwing and creating custom exceptions
- Best practices for error handling
- Exception hierarchy and handling strategies

### Practice Exercises

Before moving on, try these exercises:

1. **Shape Drawing System**: Create interfaces for drawable shapes with default methods
2. **Plugin Architecture**: Design interfaces for a plugin system with different capabilities
3. **Functional Calculator**: Build a calculator using functional interfaces and lambdas
4. **Event System**: Create an event handling system using functional interfaces
5. **Data Processing Pipeline**: Build a data transformation pipeline using function composition

Ready to dive into exception handling and error management? Let's continue to Part 11!

---

*This tutorial is part of our comprehensive Java Tutorial Series. Interfaces are fundamental to creating flexible, maintainable Java applications, so practice these concepts thoroughly.*