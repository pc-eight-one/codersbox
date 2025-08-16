---
title: "Java Tutorial Series - Part 6: Object-Oriented Programming Basics"
description: "Learn the fundamentals of Object-Oriented Programming in Java including classes, objects, constructors, instance variables, methods, and the this keyword."
publishDate: 2025-01-15
tags: ["Java", "OOP", "Classes", "Objects", "Constructors", "Encapsulation", "this keyword"]
difficulty: "intermediate"
series: "Java Tutorial Series"
part: 6
estimatedTime: "100 minutes"
totalParts: 24
featured: false
---

# Java Tutorial Series - Part 6: Object-Oriented Programming Basics

Object-Oriented Programming (OOP) is one of the most important programming paradigms, and Java is built around OOP principles. In this comprehensive part, we'll explore the fundamentals of OOP including classes, objects, constructors, instance variables, methods, and the essential `this` keyword.

## Introduction to Object-Oriented Programming

### What is Object-Oriented Programming?

Object-Oriented Programming is a programming paradigm that organizes code around objects rather than functions. It's based on the concept of "objects" which contain data (attributes) and code (methods). Java follows OOP principles to create modular, reusable, and maintainable code.

### The Four Pillars of OOP

1. **Encapsulation**: Bundling data and methods together and controlling access to them
2. **Inheritance**: Creating new classes based on existing classes
3. **Polymorphism**: Using one interface to represent different underlying forms
4. **Abstraction**: Hiding complex implementation details and showing only essential features

In this part, we'll focus primarily on encapsulation and basic class concepts.

## Classes and Objects

### Understanding Classes

A class is a blueprint or template for creating objects. It defines the properties (attributes) and behaviors (methods) that objects of that type will have.

```java
// Basic class definition
public class Car {
    // Instance variables (attributes)
    String brand;
    String model;
    int year;
    String color;
    
    // Instance methods (behaviors)
    public void startEngine() {
        System.out.println("The " + brand + " " + model + " engine is starting...");
    }
    
    public void accelerate() {
        System.out.println("The car is accelerating!");
    }
    
    public void brake() {
        System.out.println("The car is braking!");
    }
    
    public void displayInfo() {
        System.out.println("Car Info:");
        System.out.println("Brand: " + brand);
        System.out.println("Model: " + model);
        System.out.println("Year: " + year);
        System.out.println("Color: " + color);
    }
}
```

### Creating and Using Objects

```java
public class CarDemo {
    public static void main(String[] args) {
        // Creating objects (instantiation)
        Car car1 = new Car();
        Car car2 = new Car();
        
        // Setting properties for car1
        car1.brand = "Toyota";
        car1.model = "Camry";
        car1.year = 2023;
        car1.color = "Blue";
        
        // Setting properties for car2
        car2.brand = "Honda";
        car2.model = "Civic";
        car2.year = 2022;
        car2.color = "Red";
        
        // Using methods
        car1.displayInfo();
        car1.startEngine();
        car1.accelerate();
        
        System.out.println(); // Empty line
        
        car2.displayInfo();
        car2.startEngine();
        car2.brake();
        
        // Demonstrating object independence
        System.out.println("\nChanging car1 color...");
        car1.color = "Green";
        car1.displayInfo();
        
        System.out.println("\ncar2 is unchanged:");
        car2.displayInfo();
    }
}
```

### Class vs Object Relationship

```java
public class ClassObjectDemo {
    public static void main(String[] args) {
        // Class is the blueprint
        // Object is the actual instance
        
        // Multiple objects from the same class
        Car[] garage = new Car[3];
        
        // Create three different car objects
        garage[0] = new Car();
        garage[0].brand = "BMW";
        garage[0].model = "X5";
        garage[0].year = 2023;
        garage[0].color = "Black";
        
        garage[1] = new Car();
        garage[1].brand = "Audi";
        garage[1].model = "A4";
        garage[1].year = 2022;
        garage[1].color = "White";
        
        garage[2] = new Car();
        garage[2].brand = "Mercedes";
        garage[2].model = "C-Class";
        garage[2].year = 2024;
        garage[2].color = "Silver";
        
        // Display all cars
        System.out.println("=== My Garage ===");
        for (int i = 0; i < garage.length; i++) {
            System.out.println("Car " + (i + 1) + ":");
            garage[i].displayInfo();
            System.out.println();
        }
    }
}
```

## Constructors

Constructors are special methods that initialize objects when they are created. They have the same name as the class and don't have a return type.

### Default Constructor

```java
public class Student {
    String name;
    int age;
    String major;
    double gpa;
    
    // Default constructor (no parameters)
    public Student() {
        name = "Unknown";
        age = 0;
        major = "Undeclared";
        gpa = 0.0;
        System.out.println("Default constructor called");
    }
    
    public void displayInfo() {
        System.out.println("Student Info:");
        System.out.println("Name: " + name);
        System.out.println("Age: " + age);
        System.out.println("Major: " + major);
        System.out.println("GPA: " + gpa);
    }
}
```

### Parameterized Constructors

```java
public class BankAccount {
    String accountNumber;
    String accountHolder;
    double balance;
    String accountType;
    
    // Default constructor
    public BankAccount() {
        accountNumber = "000000";
        accountHolder = "Unknown";
        balance = 0.0;
        accountType = "Savings";
    }
    
    // Parameterized constructor
    public BankAccount(String accNum, String holder, double initialBalance) {
        accountNumber = accNum;
        accountHolder = holder;
        balance = initialBalance;
        accountType = "Savings"; // Default type
    }
    
    // Another parameterized constructor
    public BankAccount(String accNum, String holder, double initialBalance, String type) {
        accountNumber = accNum;
        accountHolder = holder;
        balance = initialBalance;
        accountType = type;
    }
    
    public void deposit(double amount) {
        if (amount > 0) {
            balance += amount;
            System.out.println("Deposited $" + amount + ". New balance: $" + balance);
        } else {
            System.out.println("Invalid deposit amount");
        }
    }
    
    public void withdraw(double amount) {
        if (amount > 0 && amount <= balance) {
            balance -= amount;
            System.out.println("Withdrew $" + amount + ". New balance: $" + balance);
        } else {
            System.out.println("Invalid withdrawal amount or insufficient funds");
        }
    }
    
    public void displayAccountInfo() {
        System.out.println("Account Information:");
        System.out.println("Account Number: " + accountNumber);
        System.out.println("Account Holder: " + accountHolder);
        System.out.println("Account Type: " + accountType);
        System.out.println("Balance: $" + balance);
    }
}
```

### Constructor Overloading Demo

```java
public class ConstructorDemo {
    public static void main(String[] args) {
        // Using different constructors
        
        // Default constructor
        BankAccount account1 = new BankAccount();
        account1.displayAccountInfo();
        
        System.out.println();
        
        // Constructor with 3 parameters
        BankAccount account2 = new BankAccount("123456", "Alice Johnson", 1000.0);
        account2.displayAccountInfo();
        
        System.out.println();
        
        // Constructor with 4 parameters
        BankAccount account3 = new BankAccount("789012", "Bob Smith", 2500.0, "Checking");
        account3.displayAccountInfo();
        
        // Test banking operations
        System.out.println("\n=== Banking Operations ===");
        account2.deposit(500.0);
        account2.withdraw(200.0);
        account2.withdraw(2000.0); // Should fail
    }
}
```

## Instance Variables and Methods

### Instance Variables

Instance variables are attributes that belong to each object instance. Each object has its own copy of these variables.

```java
public class Book {
    // Instance variables
    String title;
    String author;
    String isbn;
    int pages;
    double price;
    boolean isAvailable;
    
    // Constructor
    public Book(String title, String author, String isbn, int pages, double price) {
        this.title = title;
        this.author = author;
        this.isbn = isbn;
        this.pages = pages;
        this.price = price;
        this.isAvailable = true; // New books are available by default
    }
    
    // Instance methods
    public void borrowBook() {
        if (isAvailable) {
            isAvailable = false;
            System.out.println("Book '" + title + "' has been borrowed.");
        } else {
            System.out.println("Book '" + title + "' is currently unavailable.");
        }
    }
    
    public void returnBook() {
        if (!isAvailable) {
            isAvailable = true;
            System.out.println("Book '" + title + "' has been returned.");
        } else {
            System.out.println("Book '" + title + "' was not borrowed.");
        }
    }
    
    public void displayBookInfo() {
        System.out.println("=== Book Information ===");
        System.out.println("Title: " + title);
        System.out.println("Author: " + author);
        System.out.println("ISBN: " + isbn);
        System.out.println("Pages: " + pages);
        System.out.println("Price: $" + price);
        System.out.println("Available: " + (isAvailable ? "Yes" : "No"));
    }
    
    public double calculateLateFee(int daysLate) {
        double feePerDay = 0.50;
        return daysLate * feePerDay;
    }
}
```

### Static vs Instance Members

```java
public class Counter {
    // Static variable (class variable) - shared by all instances
    static int totalObjects = 0;
    
    // Instance variable - unique to each object
    int instanceId;
    String name;
    
    // Constructor
    public Counter(String name) {
        totalObjects++; // Increment for each new object
        this.instanceId = totalObjects;
        this.name = name;
    }
    
    // Instance method
    public void displayInfo() {
        System.out.println("Instance ID: " + instanceId);
        System.out.println("Name: " + name);
        System.out.println("Total objects created: " + totalObjects);
    }
    
    // Static method
    public static void displayTotalCount() {
        System.out.println("Total Counter objects created: " + totalObjects);
        // Note: Cannot access instance variables directly in static methods
    }
    
    public static void main(String[] args) {
        System.out.println("Creating Counter objects...");
        
        Counter.displayTotalCount(); // 0 objects
        
        Counter c1 = new Counter("First");
        Counter c2 = new Counter("Second");
        Counter c3 = new Counter("Third");
        
        c1.displayInfo();
        System.out.println();
        c2.displayInfo();
        System.out.println();
        c3.displayInfo();
        System.out.println();
        
        Counter.displayTotalCount(); // 3 objects
    }
}
```

## The `this` Keyword

The `this` keyword refers to the current object instance. It's used to distinguish between instance variables and parameters with the same name, and to call other constructors.

### Using `this` for Variable Disambiguation

```java
public class Person {
    String name;
    int age;
    String email;
    String address;
    
    // Constructor with parameters having same names as instance variables
    public Person(String name, int age, String email, String address) {
        // Without 'this', we would be assigning parameters to themselves
        this.name = name;       // this.name refers to instance variable
        this.age = age;         // age refers to parameter
        this.email = email;
        this.address = address;
    }
    
    // Method demonstrating 'this' usage
    public void updateAge(int age) {
        // Without 'this', both would refer to the parameter
        this.age = age; // Clear distinction
        System.out.println("Age updated to: " + this.age);
    }
    
    public void updateEmail(String email) {
        String oldEmail = this.email;
        this.email = email;
        System.out.println("Email changed from " + oldEmail + " to " + this.email);
    }
    
    public Person createCopy() {
        // Using 'this' to access current object's properties
        return new Person(this.name, this.age, this.email, this.address);
    }
    
    public void displayInfo() {
        System.out.println("Person Information:");
        System.out.println("Name: " + this.name);    // 'this' is optional here
        System.out.println("Age: " + age);           // but can be included for clarity
        System.out.println("Email: " + this.email);
        System.out.println("Address: " + this.address);
    }
}
```

### Constructor Chaining with `this()`

```java
public class Rectangle {
    double length;
    double width;
    String color;
    String material;
    
    // Default constructor
    public Rectangle() {
        this(1.0, 1.0, "White", "Wood"); // Call the parameterized constructor
    }
    
    // Constructor with dimensions only
    public Rectangle(double length, double width) {
        this(length, width, "White", "Wood"); // Call the full constructor
    }
    
    // Constructor with dimensions and color
    public Rectangle(double length, double width, String color) {
        this(length, width, color, "Wood"); // Call the full constructor
    }
    
    // Full parameterized constructor
    public Rectangle(double length, double width, String color, String material) {
        this.length = length;
        this.width = width;
        this.color = color;
        this.material = material;
    }
    
    public double calculateArea() {
        return this.length * this.width;
    }
    
    public double calculatePerimeter() {
        return 2 * (this.length + this.width);
    }
    
    public void displayInfo() {
        System.out.println("Rectangle Information:");
        System.out.println("Dimensions: " + this.length + " x " + this.width);
        System.out.println("Color: " + this.color);
        System.out.println("Material: " + this.material);
        System.out.println("Area: " + this.calculateArea());
        System.out.println("Perimeter: " + this.calculatePerimeter());
    }
    
    // Method that returns 'this' for method chaining
    public Rectangle setColor(String color) {
        this.color = color;
        return this; // Return current object for chaining
    }
    
    public Rectangle setMaterial(String material) {
        this.material = material;
        return this;
    }
    
    public static void main(String[] args) {
        // Test different constructors
        Rectangle r1 = new Rectangle();
        Rectangle r2 = new Rectangle(5.0, 3.0);
        Rectangle r3 = new Rectangle(4.0, 6.0, "Blue");
        Rectangle r4 = new Rectangle(7.0, 2.0, "Green", "Metal");
        
        System.out.println("=== Rectangle 1 ===");
        r1.displayInfo();
        
        System.out.println("\n=== Rectangle 2 ===");
        r2.displayInfo();
        
        System.out.println("\n=== Rectangle 3 ===");
        r3.displayInfo();
        
        System.out.println("\n=== Rectangle 4 ===");
        r4.displayInfo();
        
        // Demonstrate method chaining
        System.out.println("\n=== Method Chaining ===");
        Rectangle r5 = new Rectangle(3.0, 4.0)
                        .setColor("Purple")
                        .setMaterial("Plastic");
        r5.displayInfo();
    }
}
```

## Comprehensive Example: Library Management System

Let's create a more complex example that demonstrates all the concepts we've learned:

```java
// Book class
class LibraryBook {
    // Instance variables
    private String title;
    private String author;
    private String isbn;
    private String category;
    private boolean isAvailable;
    private String borrowedBy;
    private int borrowCount;
    
    // Static variable to track total books
    private static int totalBooks = 0;
    
    // Default constructor
    public LibraryBook() {
        this("Unknown", "Unknown", "000-000", "General");
    }
    
    // Parameterized constructor
    public LibraryBook(String title, String author, String isbn, String category) {
        this.title = title;
        this.author = author;
        this.isbn = isbn;
        this.category = category;
        this.isAvailable = true;
        this.borrowedBy = null;
        this.borrowCount = 0;
        totalBooks++;
    }
    
    // Getter methods
    public String getTitle() { return this.title; }
    public String getAuthor() { return this.author; }
    public String getIsbn() { return this.isbn; }
    public boolean isAvailable() { return this.isAvailable; }
    public int getBorrowCount() { return this.borrowCount; }
    
    // Business methods
    public boolean borrowBook(String borrower) {
        if (this.isAvailable) {
            this.isAvailable = false;
            this.borrowedBy = borrower;
            this.borrowCount++;
            System.out.println("Book '" + this.title + "' borrowed by " + borrower);
            return true;
        } else {
            System.out.println("Book '" + this.title + "' is currently borrowed by " + this.borrowedBy);
            return false;
        }
    }
    
    public boolean returnBook() {
        if (!this.isAvailable) {
            System.out.println("Book '" + this.title + "' returned by " + this.borrowedBy);
            this.isAvailable = true;
            this.borrowedBy = null;
            return true;
        } else {
            System.out.println("Book '" + this.title + "' was not borrowed");
            return false;
        }
    }
    
    public void displayBookInfo() {
        System.out.println("=== Book Information ===");
        System.out.println("Title: " + this.title);
        System.out.println("Author: " + this.author);
        System.out.println("ISBN: " + this.isbn);
        System.out.println("Category: " + this.category);
        System.out.println("Available: " + (this.isAvailable ? "Yes" : "No"));
        if (!this.isAvailable) {
            System.out.println("Borrowed by: " + this.borrowedBy);
        }
        System.out.println("Total times borrowed: " + this.borrowCount);
    }
    
    // Static method
    public static int getTotalBooks() {
        return totalBooks;
    }
}

// LibraryMember class
class LibraryMember {
    private String memberID;
    private String name;
    private String email;
    private int booksCurrentlyBorrowed;
    private int totalBooksBorrowed;
    private static final int MAX_BOOKS_ALLOWED = 3;
    
    public LibraryMember(String memberID, String name, String email) {
        this.memberID = memberID;
        this.name = name;
        this.email = email;
        this.booksCurrentlyBorrowed = 0;
        this.totalBooksBorrowed = 0;
    }
    
    public String getName() { return this.name; }
    public String getMemberID() { return this.memberID; }
    public int getBooksCurrentlyBorrowed() { return this.booksCurrentlyBorrowed; }
    
    public boolean canBorrowMore() {
        return this.booksCurrentlyBorrowed < MAX_BOOKS_ALLOWED;
    }
    
    public boolean borrowBook(LibraryBook book) {
        if (this.canBorrowMore() && book.isAvailable()) {
            if (book.borrowBook(this.name)) {
                this.booksCurrentlyBorrowed++;
                this.totalBooksBorrowed++;
                return true;
            }
        } else if (!this.canBorrowMore()) {
            System.out.println("Member " + this.name + " has reached the borrowing limit");
        }
        return false;
    }
    
    public boolean returnBook(LibraryBook book) {
        if (!book.isAvailable() && book.returnBook()) {
            this.booksCurrentlyBorrowed--;
            return true;
        }
        return false;
    }
    
    public void displayMemberInfo() {
        System.out.println("=== Member Information ===");
        System.out.println("Member ID: " + this.memberID);
        System.out.println("Name: " + this.name);
        System.out.println("Email: " + this.email);
        System.out.println("Books currently borrowed: " + this.booksCurrentlyBorrowed);
        System.out.println("Total books borrowed: " + this.totalBooksBorrowed);
        System.out.println("Can borrow more: " + (this.canBorrowMore() ? "Yes" : "No"));
    }
}

// Main demo class
public class LibraryManagementDemo {
    public static void main(String[] args) {
        // Create library books
        LibraryBook book1 = new LibraryBook("Java: The Complete Reference", 
                                          "Herbert Schildt", "978-1259589331", "Programming");
        LibraryBook book2 = new LibraryBook("Clean Code", 
                                          "Robert Martin", "978-0132350884", "Programming");
        LibraryBook book3 = new LibraryBook("The Great Gatsby", 
                                          "F. Scott Fitzgerald", "978-0743273565", "Fiction");
        
        // Create library members
        LibraryMember member1 = new LibraryMember("M001", "Alice Johnson", "alice@email.com");
        LibraryMember member2 = new LibraryMember("M002", "Bob Smith", "bob@email.com");
        
        // Display initial state
        System.out.println("=== Library System Demo ===");
        System.out.println("Total books in library: " + LibraryBook.getTotalBooks());
        System.out.println();
        
        // Display book information
        book1.displayBookInfo();
        System.out.println();
        
        // Display member information
        member1.displayMemberInfo();
        System.out.println();
        
        // Simulate borrowing
        System.out.println("=== Borrowing Books ===");
        member1.borrowBook(book1);
        member1.borrowBook(book2);
        member2.borrowBook(book1); // Should fail - already borrowed
        
        System.out.println();
        
        // Check updated status
        book1.displayBookInfo();
        System.out.println();
        member1.displayMemberInfo();
        
        System.out.println();
        
        // Simulate returning
        System.out.println("=== Returning Books ===");
        member1.returnBook(book1);
        
        System.out.println();
        
        // Try borrowing the returned book
        member2.borrowBook(book1); // Should succeed now
        
        System.out.println();
        
        // Final status
        System.out.println("=== Final Status ===");
        book1.displayBookInfo();
        System.out.println();
        member1.displayMemberInfo();
        System.out.println();
        member2.displayMemberInfo();
    }
}
```

## Best Practices for Classes and Objects

### 1. Encapsulation and Data Hiding

```java
public class BankAccountSecure {
    // Private instance variables (encapsulation)
    private String accountNumber;
    private double balance;
    private String accountHolder;
    
    // Constructor
    public BankAccountSecure(String accountNumber, String accountHolder, double initialBalance) {
        this.accountNumber = accountNumber;
        this.accountHolder = accountHolder;
        this.balance = (initialBalance >= 0) ? initialBalance : 0;
    }
    
    // Getter methods (controlled access)
    public String getAccountNumber() {
        return this.accountNumber;
    }
    
    public String getAccountHolder() {
        return this.accountHolder;
    }
    
    public double getBalance() {
        return this.balance;
    }
    
    // Setter methods with validation
    public void setAccountHolder(String accountHolder) {
        if (accountHolder != null && !accountHolder.trim().isEmpty()) {
            this.accountHolder = accountHolder;
        }
    }
    
    // Business methods with validation
    public boolean deposit(double amount) {
        if (amount > 0) {
            this.balance += amount;
            return true;
        }
        return false;
    }
    
    public boolean withdraw(double amount) {
        if (amount > 0 && amount <= this.balance) {
            this.balance -= amount;
            return true;
        }
        return false;
    }
}
```

### 2. Meaningful Class and Method Names

```java
// Good class design with clear responsibilities
public class StudentGradeCalculator {
    private String studentName;
    private double[] testScores;
    private double[] assignmentScores;
    private double finalExamScore;
    
    public StudentGradeCalculator(String studentName) {
        this.studentName = studentName;
        this.testScores = new double[0];
        this.assignmentScores = new double[0];
        this.finalExamScore = 0.0;
    }
    
    public void addTestScore(double score) {
        if (isValidScore(score)) {
            this.testScores = addScoreToArray(this.testScores, score);
        }
    }
    
    public void addAssignmentScore(double score) {
        if (isValidScore(score)) {
            this.assignmentScores = addScoreToArray(this.assignmentScores, score);
        }
    }
    
    public void setFinalExamScore(double score) {
        if (isValidScore(score)) {
            this.finalExamScore = score;
        }
    }
    
    public double calculateOverallGrade() {
        double testAverage = calculateAverage(this.testScores);
        double assignmentAverage = calculateAverage(this.assignmentScores);
        
        // Weighted calculation: Tests 40%, Assignments 35%, Final 25%
        return (testAverage * 0.40) + (assignmentAverage * 0.35) + (this.finalExamScore * 0.25);
    }
    
    public String getLetterGrade() {
        double grade = calculateOverallGrade();
        if (grade >= 90) return "A";
        if (grade >= 80) return "B";
        if (grade >= 70) return "C";
        if (grade >= 60) return "D";
        return "F";
    }
    
    // Helper methods
    private boolean isValidScore(double score) {
        return score >= 0 && score <= 100;
    }
    
    private double[] addScoreToArray(double[] array, double score) {
        double[] newArray = new double[array.length + 1];
        System.arraycopy(array, 0, newArray, 0, array.length);
        newArray[array.length] = score;
        return newArray;
    }
    
    private double calculateAverage(double[] scores) {
        if (scores.length == 0) return 0.0;
        
        double sum = 0;
        for (double score : scores) {
            sum += score;
        }
        return sum / scores.length;
    }
    
    public void displayGradeReport() {
        System.out.println("=== Grade Report for " + this.studentName + " ===");
        System.out.println("Test Average: " + String.format("%.2f", calculateAverage(this.testScores)));
        System.out.println("Assignment Average: " + String.format("%.2f", calculateAverage(this.assignmentScores)));
        System.out.println("Final Exam Score: " + this.finalExamScore);
        System.out.println("Overall Grade: " + String.format("%.2f", calculateOverallGrade()));
        System.out.println("Letter Grade: " + getLetterGrade());
    }
}
```

## Summary

In this sixth part of our Java tutorial series, you've learned:

✅ **OOP Fundamentals**: Understanding the core principles of object-oriented programming  
✅ **Classes and Objects**: Creating blueprints and instantiating objects from them  
✅ **Constructors**: Default and parameterized constructors for object initialization  
✅ **Instance Variables**: Attributes that belong to each object instance  
✅ **Instance Methods**: Behaviors that operate on object data  
✅ **The `this` Keyword**: Referring to the current object and constructor chaining  
✅ **Encapsulation Basics**: Controlling access to class members  

### Key Takeaways

1. **Classes are Blueprints**: They define the structure and behavior for objects
2. **Objects are Instances**: Each object has its own copy of instance variables
3. **Constructors Initialize Objects**: Use them to set up objects in a valid state
4. **`this` Provides Clarity**: Use it to distinguish between instance variables and parameters
5. **Encapsulation is Essential**: Control access to your class members for better design

### What's Next?

In **Part 7: Encapsulation and Access Modifiers**, we'll explore:
- Access modifiers (public, private, protected, default)
- Getter and setter methods
- Encapsulation principles and benefits
- Package organization
- Data validation and security

### Practice Exercises

Before moving on, try these exercises:

1. **Employee Management System**: Create Employee class with salary calculations and benefits
2. **Shopping Cart**: Build a ShoppingCart class that manages CartItem objects
3. **Game Character**: Design a Player class for a simple game with health, experience, and abilities
4. **Bank Account Hierarchy**: Create different types of bank accounts with specific behaviors

Ready to dive deeper into encapsulation and access control? Let's continue to Part 7!

---

*This tutorial is part of our comprehensive Java Tutorial Series. Object-oriented programming is fundamental to Java development, so practice these concepts thoroughly.*