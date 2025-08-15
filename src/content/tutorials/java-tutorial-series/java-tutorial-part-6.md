---
title: "Java Tutorial Series - Part 6: Object-Oriented Programming Basics"
description: "Learn the fundamentals of Object-Oriented Programming in Java including classes, objects, constructors, instance variables, methods, and the this keyword."
publishDate: 2025-01-15
tags: ["Java", "OOP", "Classes", "Objects", "Constructors", "Instance Methods", "this keyword"]
difficulty: "beginner"
series: "Java Tutorial Series"
part: 6
estimatedTime: "100 minutes"
totalParts: 24
featured: false
---

# Java Tutorial Series - Part 6: Object-Oriented Programming Basics

Object-Oriented Programming (OOP) is a programming paradigm that organizes code around objects rather than functions and logic. Java is fundamentally an object-oriented language, and understanding OOP concepts is crucial for effective Java programming. In this part, we'll explore the core concepts of classes, objects, and the fundamental building blocks of OOP.

## Introduction to Object-Oriented Programming

### What is Object-Oriented Programming?

Object-Oriented Programming is a programming paradigm based on the concept of "objects," which can contain data (attributes) and code (methods). The main idea is to bundle data and the methods that operate on that data into a single unit called a class.

### Key OOP Principles

**1. Encapsulation**: Bundling data and methods together and controlling access to them
**2. Inheritance**: Creating new classes based on existing classes
**3. Polymorphism**: Using one interface for different underlying forms
**4. Abstraction**: Hiding complex implementation details while showing only essential features

### Benefits of OOP

- **Modularity**: Code is organized into separate, interchangeable components
- **Reusability**: Objects can be reused across different programs
- **Scalability**: Easy to extend and modify existing code
- **Maintainability**: Changes to one part don't affect other parts
- **Real-world Modeling**: Objects represent real-world entities naturally

## Classes and Objects

### Understanding Classes

A class is a blueprint or template for creating objects. It defines the structure and behavior that objects of that type will have.

```java
/**
 * A simple class representing a Student
 */
public class Student {
    // Instance variables (attributes/fields)
    String name;
    int age;
    String studentId;
    double gpa;
    String major;
    
    // Method to display student information
    void displayInfo() {
        System.out.println("Student Information:");
        System.out.println("Name: " + name);
        System.out.println("Age: " + age);
        System.out.println("Student ID: " + studentId);
        System.out.println("GPA: " + gpa);
        System.out.println("Major: " + major);
    }
    
    // Method to update GPA
    void updateGPA(double newGPA) {
        if (newGPA >= 0.0 && newGPA <= 4.0) {
            gpa = newGPA;
            System.out.println("GPA updated successfully to: " + gpa);
        } else {
            System.out.println("Invalid GPA. Must be between 0.0 and 4.0");
        }
    }
    
    // Method to check if student is on honor roll
    boolean isOnHonorRoll() {
        return gpa >= 3.5;
    }
}
```

### Creating and Using Objects

```java
public class StudentDemo {
    public static void main(String[] args) {
        System.out.println("=== Creating and Using Objects ===");
        
        // Creating objects (instances) of the Student class
        Student student1 = new Student();
        Student student2 = new Student();
        Student student3 = new Student();
        
        // Setting values for student1
        student1.name = "Alice Johnson";
        student1.age = 20;
        student1.studentId = "STU001";
        student1.gpa = 3.8;
        student1.major = "Computer Science";
        
        // Setting values for student2
        student2.name = "Bob Smith";
        student2.age = 19;
        student2.studentId = "STU002";
        student2.gpa = 3.2;
        student2.major = "Mathematics";
        
        // Setting values for student3
        student3.name = "Charlie Brown";
        student3.age = 21;
        student3.studentId = "STU003";
        student3.gpa = 3.9;
        student3.major = "Physics";
        
        // Using methods on objects
        System.out.println("--- Student 1 ---");
        student1.displayInfo();
        System.out.println("Honor Roll: " + student1.isOnHonorRoll());
        
        System.out.println("\n--- Student 2 ---");
        student2.displayInfo();
        System.out.println("Honor Roll: " + student2.isOnHonorRoll());
        
        System.out.println("\n--- Student 3 ---");
        student3.displayInfo();
        System.out.println("Honor Roll: " + student3.isOnHonorRoll());
        
        // Updating student information
        System.out.println("\n--- Updating Student 2's GPA ---");
        student2.updateGPA(3.7);
        System.out.println("Honor Roll status after update: " + student2.isOnHonorRoll());
        
        // Demonstrating object independence
        System.out.println("\n--- Demonstrating Object Independence ---");
        System.out.println("Student 1 GPA: " + student1.gpa);
        System.out.println("Student 2 GPA: " + student2.gpa);
        System.out.println("Student 3 GPA: " + student3.gpa);
    }
}
```

### More Complex Class Example

```java
/**
 * A more comprehensive class representing a Book
 */
public class Book {
    // Instance variables with different data types
    private String title;
    private String author;
    private String isbn;
    private int pages;
    private double price;
    private boolean isAvailable;
    private String genre;
    private int publicationYear;
    
    // Method to display book information
    public void displayBookInfo() {
        System.out.println("=== Book Information ===");
        System.out.println("Title: " + title);
        System.out.println("Author: " + author);
        System.out.println("ISBN: " + isbn);
        System.out.println("Pages: " + pages);
        System.out.println("Price: $" + price);
        System.out.println("Genre: " + genre);
        System.out.println("Publication Year: " + publicationYear);
        System.out.println("Available: " + (isAvailable ? "Yes" : "No"));
    }
    
    // Method to set book details
    public void setBookDetails(String title, String author, String isbn, 
                              int pages, double price, String genre, int year) {
        this.title = title;
        this.author = author;
        this.isbn = isbn;
        this.pages = pages;
        this.price = price;
        this.genre = genre;
        this.publicationYear = year;
        this.isAvailable = true; // New books are available by default
    }
    
    // Method to borrow the book
    public boolean borrowBook() {
        if (isAvailable) {
            isAvailable = false;
            System.out.println("Book '" + title + "' has been borrowed successfully.");
            return true;
        } else {
            System.out.println("Sorry, book '" + title + "' is currently not available.");
            return false;
        }
    }
    
    // Method to return the book
    public void returnBook() {
        if (!isAvailable) {
            isAvailable = true;
            System.out.println("Book '" + title + "' has been returned successfully.");
        } else {
            System.out.println("Book '" + title + "' was not borrowed.");
        }
    }
    
    // Method to apply discount
    public void applyDiscount(double discountPercentage) {
        if (discountPercentage > 0 && discountPercentage <= 50) {
            double discountAmount = price * (discountPercentage / 100);
            price = price - discountAmount;
            System.out.printf("%.1f%% discount applied. New price: $%.2f%n", 
                            discountPercentage, price);
        } else {
            System.out.println("Invalid discount percentage. Must be between 0 and 50.");
        }
    }
    
    // Method to get book age
    public int getBookAge() {
        return 2025 - publicationYear;
    }
    
    // Method to check if book is recent
    public boolean isRecentBook() {
        return getBookAge() <= 5;
    }
}
```

## Constructors

Constructors are special methods used to initialize objects when they are created. They have the same name as the class and don't have a return type.

### Default Constructor

```java
/**
 * Class demonstrating constructors
 */
public class Car {
    // Instance variables
    String brand;
    String model;
    int year;
    String color;
    double price;
    boolean isElectric;
    
    // Default constructor (no parameters)
    public Car() {
        System.out.println("Creating a new car with default values...");
        brand = "Unknown";
        model = "Unknown";
        year = 2023;
        color = "White";
        price = 25000.0;
        isElectric = false;
    }
    
    // Method to display car information
    public void displayCarInfo() {
        System.out.println("=== Car Information ===");
        System.out.println("Brand: " + brand);
        System.out.println("Model: " + model);
        System.out.println("Year: " + year);
        System.out.println("Color: " + color);
        System.out.println("Price: $" + price);
        System.out.println("Electric: " + (isElectric ? "Yes" : "No"));
    }
    
    // Method to start the car
    public void startCar() {
        if (isElectric) {
            System.out.println("The " + brand + " " + model + " is starting silently...");
        } else {
            System.out.println("The " + brand + " " + model + " engine is starting...");
        }
    }
    
    // Method to calculate depreciation
    public double calculateDepreciation() {
        int age = 2025 - year;
        double depreciationRate = 0.15; // 15% per year
        double currentValue = price * Math.pow(1 - depreciationRate, age);
        return Math.max(currentValue, price * 0.1); // Minimum 10% of original price
    }
}
```

### Parameterized Constructors

```java
/**
 * Enhanced Car class with multiple constructors
 */
public class EnhancedCar {
    // Instance variables
    private String brand;
    private String model;
    private int year;
    private String color;
    private double price;
    private boolean isElectric;
    private int mileage;
    
    // Default constructor
    public EnhancedCar() {
        this("Unknown", "Unknown", 2023, "White", 25000.0, false);
        System.out.println("Default constructor called");
    }
    
    // Constructor with brand and model
    public EnhancedCar(String brand, String model) {
        this(brand, model, 2023, "White", 25000.0, false);
        System.out.println("Constructor with brand and model called");
    }
    
    // Constructor with brand, model, and year
    public EnhancedCar(String brand, String model, int year) {
        this(brand, model, year, "White", 25000.0, false);
        System.out.println("Constructor with brand, model, and year called");
    }
    
    // Constructor with most parameters
    public EnhancedCar(String brand, String model, int year, String color, double price) {
        this(brand, model, year, color, price, false);
        System.out.println("Constructor with 5 parameters called");
    }
    
    // Full constructor (all parameters)
    public EnhancedCar(String brand, String model, int year, String color, 
                      double price, boolean isElectric) {
        System.out.println("Full constructor called");
        this.brand = brand;
        this.model = model;
        this.year = year;
        this.color = color;
        this.price = price;
        this.isElectric = isElectric;
        this.mileage = 0; // New car starts with 0 mileage
        
        // Validation
        if (year < 1900 || year > 2025) {
            System.out.println("Warning: Invalid year. Setting to 2023.");
            this.year = 2023;
        }
        
        if (price < 0) {
            System.out.println("Warning: Invalid price. Setting to $25,000.");
            this.price = 25000.0;
        }
    }
    
    // Getter methods
    public String getBrand() { return brand; }
    public String getModel() { return model; }
    public int getYear() { return year; }
    public String getColor() { return color; }
    public double getPrice() { return price; }
    public boolean isElectric() { return isElectric; }
    public int getMileage() { return mileage; }
    
    // Setter methods
    public void setBrand(String brand) { this.brand = brand; }
    public void setModel(String model) { this.model = model; }
    public void setColor(String color) { this.color = color; }
    public void setPrice(double price) { 
        if (price >= 0) {
            this.price = price; 
        } else {
            System.out.println("Price cannot be negative");
        }
    }
    
    // Method to add mileage
    public void drive(int miles) {
        if (miles > 0) {
            mileage += miles;
            System.out.println("Drove " + miles + " miles. Total mileage: " + mileage);
        } else {
            System.out.println("Miles must be positive");
        }
    }
    
    // Method to display car information
    public void displayInfo() {
        System.out.println("=== Car Details ===");
        System.out.println("Brand: " + brand);
        System.out.println("Model: " + model);
        System.out.println("Year: " + year);
        System.out.println("Color: " + color);
        System.out.println("Price: $" + String.format("%.2f", price));
        System.out.println("Electric: " + (isElectric ? "Yes" : "No"));
        System.out.println("Mileage: " + mileage + " miles");
    }
}
```

### Constructor Demonstration

```java
public class ConstructorDemo {
    public static void main(String[] args) {
        System.out.println("=== Constructor Demonstration ===");
        
        // Using different constructors
        System.out.println("\n1. Default constructor:");
        EnhancedCar car1 = new EnhancedCar();
        car1.displayInfo();
        
        System.out.println("\n2. Constructor with brand and model:");
        EnhancedCar car2 = new EnhancedCar("Toyota", "Camry");
        car2.displayInfo();
        
        System.out.println("\n3. Constructor with brand, model, and year:");
        EnhancedCar car3 = new EnhancedCar("Honda", "Civic", 2022);
        car3.displayInfo();
        
        System.out.println("\n4. Constructor with 5 parameters:");
        EnhancedCar car4 = new EnhancedCar("BMW", "X5", 2023, "Black", 60000.0);
        car4.displayInfo();
        
        System.out.println("\n5. Full constructor:");
        EnhancedCar car5 = new EnhancedCar("Tesla", "Model 3", 2023, "Red", 45000.0, true);
        car5.displayInfo();
        
        // Testing methods
        System.out.println("\n=== Testing Car Methods ===");
        car5.drive(150);
        car5.drive(75);
        car5.setColor("Blue");
        car5.displayInfo();
    }
}
```

## Instance Variables and Methods

### Understanding Instance Variables

Instance variables are attributes that belong to each object instance. Each object has its own copy of instance variables.

```java
/**
 * Class demonstrating instance variables and methods
 */
public class BankAccount {
    // Instance variables (each account has its own values)
    private String accountNumber;
    private String accountHolderName;
    private double balance;
    private String accountType;
    private boolean isActive;
    private int transactionCount;
    
    // Constructor
    public BankAccount(String accountNumber, String accountHolderName, 
                      String accountType, double initialDeposit) {
        this.accountNumber = accountNumber;
        this.accountHolderName = accountHolderName;
        this.accountType = accountType;
        this.balance = initialDeposit;
        this.isActive = true;
        this.transactionCount = 0;
        
        System.out.println("Account created successfully for " + accountHolderName);
        System.out.println("Account Number: " + accountNumber);
        System.out.println("Initial Balance: $" + balance);
    }
    
    // Instance method to deposit money
    public void deposit(double amount) {
        if (!isActive) {
            System.out.println("Cannot deposit to inactive account");
            return;
        }
        
        if (amount > 0) {
            balance += amount;
            transactionCount++;
            System.out.println("Deposited $" + amount);
            System.out.println("New balance: $" + balance);
        } else {
            System.out.println("Deposit amount must be positive");
        }
    }
    
    // Instance method to withdraw money
    public void withdraw(double amount) {
        if (!isActive) {
            System.out.println("Cannot withdraw from inactive account");
            return;
        }
        
        if (amount > 0) {
            if (balance >= amount) {
                balance -= amount;
                transactionCount++;
                System.out.println("Withdrew $" + amount);
                System.out.println("New balance: $" + balance);
            } else {
                System.out.println("Insufficient funds. Current balance: $" + balance);
            }
        } else {
            System.out.println("Withdrawal amount must be positive");
        }
    }
    
    // Instance method to transfer money to another account
    public void transferTo(BankAccount targetAccount, double amount) {
        if (!isActive) {
            System.out.println("Cannot transfer from inactive account");
            return;
        }
        
        if (!targetAccount.isActive) {
            System.out.println("Cannot transfer to inactive account");
            return;
        }
        
        if (amount > 0 && balance >= amount) {
            this.withdraw(amount);
            targetAccount.deposit(amount);
            System.out.println("Transfer completed successfully");
        } else if (amount <= 0) {
            System.out.println("Transfer amount must be positive");
        } else {
            System.out.println("Insufficient funds for transfer");
        }
    }
    
    // Instance method to display account information
    public void displayAccountInfo() {
        System.out.println("=== Account Information ===");
        System.out.println("Account Number: " + accountNumber);
        System.out.println("Account Holder: " + accountHolderName);
        System.out.println("Account Type: " + accountType);
        System.out.println("Balance: $" + String.format("%.2f", balance));
        System.out.println("Status: " + (isActive ? "Active" : "Inactive"));
        System.out.println("Transaction Count: " + transactionCount);
    }
    
    // Instance method to calculate interest (based on account type)
    public double calculateInterest() {
        double interestRate;
        switch (accountType.toLowerCase()) {
            case "savings":
                interestRate = 0.025; // 2.5%
                break;
            case "checking":
                interestRate = 0.001; // 0.1%
                break;
            case "premium":
                interestRate = 0.035; // 3.5%
                break;
            default:
                interestRate = 0.01; // 1% default
        }
        return balance * interestRate;
    }
    
    // Instance method to apply interest
    public void applyInterest() {
        if (isActive) {
            double interest = calculateInterest();
            balance += interest;
            transactionCount++;
            System.out.println("Interest applied: $" + String.format("%.2f", interest));
            System.out.println("New balance: $" + String.format("%.2f", balance));
        }
    }
    
    // Instance method to close account
    public void closeAccount() {
        if (balance > 0) {
            System.out.println("Cannot close account with positive balance: $" + balance);
            System.out.println("Please withdraw all funds first");
        } else {
            isActive = false;
            System.out.println("Account " + accountNumber + " has been closed");
        }
    }
    
    // Getter methods
    public String getAccountNumber() { return accountNumber; }
    public String getAccountHolderName() { return accountHolderName; }
    public double getBalance() { return balance; }
    public String getAccountType() { return accountType; }
    public boolean isActive() { return isActive; }
    public int getTransactionCount() { return transactionCount; }
}
```

### Instance Methods in Action

```java
public class BankAccountDemo {
    public static void main(String[] args) {
        System.out.println("=== Bank Account Management System ===");
        
        // Creating multiple bank accounts
        BankAccount account1 = new BankAccount("ACC001", "Alice Johnson", "Savings", 1000.0);
        BankAccount account2 = new BankAccount("ACC002", "Bob Smith", "Checking", 500.0);
        BankAccount account3 = new BankAccount("ACC003", "Charlie Brown", "Premium", 2000.0);
        
        System.out.println("\n=== Initial Account States ===");
        account1.displayAccountInfo();
        System.out.println();
        account2.displayAccountInfo();
        System.out.println();
        account3.displayAccountInfo();
        
        System.out.println("\n=== Performing Transactions ===");
        
        // Deposits
        System.out.println("\n--- Deposits ---");
        account1.deposit(250.0);
        account2.deposit(100.0);
        account3.deposit(500.0);
        
        // Withdrawals
        System.out.println("\n--- Withdrawals ---");
        account1.withdraw(150.0);
        account2.withdraw(50.0);
        account3.withdraw(300.0);
        
        // Transfers
        System.out.println("\n--- Transfers ---");
        account1.transferTo(account2, 200.0);
        account3.transferTo(account1, 100.0);
        
        // Apply interest
        System.out.println("\n--- Applying Interest ---");
        account1.applyInterest();
        account2.applyInterest();
        account3.applyInterest();
        
        System.out.println("\n=== Final Account States ===");
        account1.displayAccountInfo();
        System.out.println();
        account2.displayAccountInfo();
        System.out.println();
        account3.displayAccountInfo();
        
        // Demonstrate instance variable independence
        System.out.println("\n=== Demonstrating Instance Variable Independence ===");
        System.out.println("Account 1 balance: $" + account1.getBalance());
        System.out.println("Account 2 balance: $" + account2.getBalance());
        System.out.println("Account 3 balance: $" + account3.getBalance());
        
        // Each account maintains its own state
        account1.deposit(1000.0);
        System.out.println("\nAfter depositing $1000 to Account 1:");
        System.out.println("Account 1 balance: $" + account1.getBalance());
        System.out.println("Account 2 balance: $" + account2.getBalance()); // Unchanged
        System.out.println("Account 3 balance: $" + account3.getBalance()); // Unchanged
    }
}
```

## The `this` Keyword

The `this` keyword refers to the current object instance. It's used to differentiate between instance variables and parameters/local variables when they have the same name.

### Using `this` for Variable Disambiguation

```java
/**
 * Class demonstrating the use of 'this' keyword
 */
public class Employee {
    // Instance variables
    private String name;
    private int id;
    private String department;
    private double salary;
    private int yearsOfExperience;
    
    // Constructor using 'this' to distinguish parameters from instance variables
    public Employee(String name, int id, String department, double salary, int yearsOfExperience) {
        this.name = name;                        // this.name refers to instance variable
        this.id = id;                           // name refers to parameter
        this.department = department;
        this.salary = salary;
        this.yearsOfExperience = yearsOfExperience;
        
        // Without 'this', we would need different parameter names:
        // this.name = employeeName;
        // this.id = employeeId;
    }
    
    // Method using 'this' for method chaining
    public Employee setName(String name) {
        this.name = name;
        return this; // Returns current object for method chaining
    }
    
    public Employee setDepartment(String department) {
        this.department = department;
        return this;
    }
    
    public Employee setSalary(double salary) {
        this.salary = salary;
        return this;
    }
    
    // Method that takes a parameter with same name as instance variable
    public void updateSalary(double salary) {
        if (salary > this.salary) {
            double increase = salary - this.salary;
            this.salary = salary;
            System.out.println("Salary updated. Increase: $" + increase);
        } else {
            System.out.println("New salary must be higher than current salary: $" + this.salary);
        }
    }
    
    // Method using 'this' to call another method of the same object
    public void giveRaise(double percentage) {
        double newSalary = this.salary * (1 + percentage / 100);
        this.updateSalary(newSalary); // 'this' is optional here but makes it clear
    }
    
    // Method to compare with another employee
    public boolean earnedMoreThan(Employee other) {
        return this.salary > other.salary;
    }
    
    // Method using 'this' to pass current object as parameter
    public void compareWith(Employee other) {
        System.out.println("Comparing " + this.name + " with " + other.name);
        
        if (this.earnedMoreThan(other)) {
            System.out.println(this.name + " earns more than " + other.name);
        } else if (other.earnedMoreThan(this)) {
            System.out.println(other.name + " earns more than " + this.name);
        } else {
            System.out.println("Both employees earn the same amount");
        }
    }
    
    // Method to display employee information
    public void displayInfo() {
        System.out.println("=== Employee Information ===");
        System.out.println("Name: " + this.name);
        System.out.println("ID: " + this.id);
        System.out.println("Department: " + this.department);
        System.out.println("Salary: $" + String.format("%.2f", this.salary));
        System.out.println("Years of Experience: " + this.yearsOfExperience);
    }
    
    // Method demonstrating 'this' with conditional logic
    public void processPerformanceReview(double rating) {
        if (rating >= 4.5) {
            this.giveRaise(10); // 10% raise for excellent performance
            System.out.println(this.name + " received excellent rating!");
        } else if (rating >= 3.5) {
            this.giveRaise(5);  // 5% raise for good performance
            System.out.println(this.name + " received good rating!");
        } else if (rating >= 2.5) {
            System.out.println(this.name + " received average rating. No raise this time.");
        } else {
            System.out.println(this.name + " needs improvement.");
        }
    }
    
    // Getter methods
    public String getName() { return this.name; }
    public int getId() { return this.id; }
    public String getDepartment() { return this.department; }
    public double getSalary() { return this.salary; }
    public int getYearsOfExperience() { return this.yearsOfExperience; }
}
```

### Constructor Chaining with `this`

```java
/**
 * Class demonstrating constructor chaining using 'this'
 */
public class Product {
    private String name;
    private String category;
    private double price;
    private int quantity;
    private String description;
    
    // Primary constructor
    public Product(String name, String category, double price, int quantity, String description) {
        this.name = name;
        this.category = category;
        this.price = price;
        this.quantity = quantity;
        this.description = description;
        System.out.println("Primary constructor called for: " + name);
    }
    
    // Constructor with 4 parameters - calls primary constructor
    public Product(String name, String category, double price, int quantity) {
        this(name, category, price, quantity, "No description available");
        System.out.println("4-parameter constructor called");
    }
    
    // Constructor with 3 parameters - calls 4-parameter constructor
    public Product(String name, String category, double price) {
        this(name, category, price, 0);
        System.out.println("3-parameter constructor called");
    }
    
    // Constructor with 2 parameters - calls 3-parameter constructor
    public Product(String name, String category) {
        this(name, category, 0.0);
        System.out.println("2-parameter constructor called");
    }
    
    // Default constructor - calls 2-parameter constructor
    public Product() {
        this("Unknown Product", "Unknown Category");
        System.out.println("Default constructor called");
    }
    
    // Method to display product information
    public void displayProduct() {
        System.out.println("=== Product Information ===");
        System.out.println("Name: " + this.name);
        System.out.println("Category: " + this.category);
        System.out.println("Price: $" + this.price);
        System.out.println("Quantity: " + this.quantity);
        System.out.println("Description: " + this.description);
    }
    
    // Method demonstrating method chaining with 'this'
    public Product updatePrice(double price) {
        this.price = price;
        return this;
    }
    
    public Product updateQuantity(int quantity) {
        this.quantity = quantity;
        return this;
    }
    
    public Product updateDescription(String description) {
        this.description = description;
        return this;
    }
}
```

### Comprehensive `this` Demonstration

```java
public class ThisKeywordDemo {
    public static void main(String[] args) {
        System.out.println("=== Demonstrating 'this' Keyword ===");
        
        // Creating employees
        Employee emp1 = new Employee("Alice Johnson", 101, "Engineering", 75000, 5);
        Employee emp2 = new Employee("Bob Smith", 102, "Marketing", 65000, 3);
        
        System.out.println("\n--- Initial Employee Information ---");
        emp1.displayInfo();
        System.out.println();
        emp2.displayInfo();
        
        // Demonstrating method chaining with 'this'
        System.out.println("\n--- Method Chaining ---");
        emp1.setName("Alice Williams")
            .setDepartment("Senior Engineering")
            .setSalary(80000);
        
        emp1.displayInfo();
        
        // Demonstrating salary updates
        System.out.println("\n--- Salary Updates ---");
        emp1.updateSalary(85000);
        emp2.giveRaise(15); // 15% raise
        
        // Comparing employees
        System.out.println("\n--- Employee Comparison ---");
        emp1.compareWith(emp2);
        
        // Performance reviews
        System.out.println("\n--- Performance Reviews ---");
        emp1.processPerformanceReview(4.7);
        emp2.processPerformanceReview(3.8);
        
        // Product constructor chaining demonstration
        System.out.println("\n=== Product Constructor Chaining ===");
        
        Product product1 = new Product();
        System.out.println();
        
        Product product2 = new Product("Laptop", "Electronics");
        System.out.println();
        
        Product product3 = new Product("Smartphone", "Electronics", 599.99);
        System.out.println();
        
        Product product4 = new Product("Tablet", "Electronics", 299.99, 10);
        System.out.println();
        
        Product product5 = new Product("Headphones", "Audio", 99.99, 25, "High-quality wireless headphones");
        
        System.out.println("\n--- Product Method Chaining ---");
        product2.updatePrice(899.99)
                .updateQuantity(5)
                .updateDescription("High-performance laptop for professionals");
        
        product2.displayProduct();
    }
}
```

## Practical OOP Example: Library Management System

Let's create a comprehensive example that demonstrates all the concepts we've learned:

```java
/**
 * A comprehensive library management system demonstrating OOP concepts
 */

// Book class
class LibraryBook {
    private String isbn;
    private String title;
    private String author;
    private String genre;
    private boolean isAvailable;
    private String borrower;
    private int totalBorrows;
    
    // Constructor
    public LibraryBook(String isbn, String title, String author, String genre) {
        this.isbn = isbn;
        this.title = title;
        this.author = author;
        this.genre = genre;
        this.isAvailable = true;
        this.borrower = null;
        this.totalBorrows = 0;
    }
    
    // Method to borrow book
    public boolean borrowBook(String borrowerName) {
        if (this.isAvailable) {
            this.isAvailable = false;
            this.borrower = borrowerName;
            this.totalBorrows++;
            System.out.println("Book '" + this.title + "' borrowed by " + borrowerName);
            return true;
        } else {
            System.out.println("Book '" + this.title + "' is currently borrowed by " + this.borrower);
            return false;
        }
    }
    
    // Method to return book
    public void returnBook() {
        if (!this.isAvailable) {
            System.out.println("Book '" + this.title + "' returned by " + this.borrower);
            this.isAvailable = true;
            this.borrower = null;
        } else {
            System.out.println("Book '" + this.title + "' was not borrowed");
        }
    }
    
    // Method to display book information
    public void displayBookInfo() {
        System.out.println("ISBN: " + this.isbn);
        System.out.println("Title: " + this.title);
        System.out.println("Author: " + this.author);
        System.out.println("Genre: " + this.genre);
        System.out.println("Available: " + (this.isAvailable ? "Yes" : "No"));
        if (!this.isAvailable) {
            System.out.println("Borrowed by: " + this.borrower);
        }
        System.out.println("Total borrows: " + this.totalBorrows);
    }
    
    // Getters
    public String getIsbn() { return this.isbn; }
    public String getTitle() { return this.title; }
    public String getAuthor() { return this.author; }
    public String getGenre() { return this.genre; }
    public boolean isAvailable() { return this.isAvailable; }
    public String getBorrower() { return this.borrower; }
    public int getTotalBorrows() { return this.totalBorrows; }
}

// Library Member class
class LibraryMember {
    private String memberId;
    private String name;
    private String email;
    private int booksBorrowed;
    private int maxBooksAllowed;
    
    // Constructor
    public LibraryMember(String memberId, String name, String email) {
        this.memberId = memberId;
        this.name = name;
        this.email = email;
        this.booksBorrowed = 0;
        this.maxBooksAllowed = 3; // Default limit
    }
    
    // Constructor with custom book limit
    public LibraryMember(String memberId, String name, String email, int maxBooksAllowed) {
        this(memberId, name, email);
        this.maxBooksAllowed = maxBooksAllowed;
    }
    
    // Method to borrow a book
    public boolean borrowBook(LibraryBook book) {
        if (this.booksBorrowed >= this.maxBooksAllowed) {
            System.out.println(this.name + " has reached the maximum book limit (" + this.maxBooksAllowed + ")");
            return false;
        }
        
        if (book.borrowBook(this.name)) {
            this.booksBorrowed++;
            System.out.println(this.name + " now has " + this.booksBorrowed + " book(s) borrowed");
            return true;
        }
        return false;
    }
    
    // Method to return a book
    public void returnBook(LibraryBook book) {
        if (book.getBorrower() != null && book.getBorrower().equals(this.name)) {
            book.returnBook();
            this.booksBorrowed--;
            System.out.println(this.name + " now has " + this.booksBorrowed + " book(s) borrowed");
        } else {
            System.out.println(this.name + " did not borrow this book");
        }
    }
    
    // Method to display member information
    public void displayMemberInfo() {
        System.out.println("=== Member Information ===");
        System.out.println("Member ID: " + this.memberId);
        System.out.println("Name: " + this.name);
        System.out.println("Email: " + this.email);
        System.out.println("Books borrowed: " + this.booksBorrowed + "/" + this.maxBooksAllowed);
    }
    
    // Getters
    public String getMemberId() { return this.memberId; }
    public String getName() { return this.name; }
    public String getEmail() { return this.email; }
    public int getBooksBorrowed() { return this.booksBorrowed; }
    public int getMaxBooksAllowed() { return this.maxBooksAllowed; }
}

// Library class
class Library {
    private String name;
    private LibraryBook[] books;
    private LibraryMember[] members;
    private int bookCount;
    private int memberCount;
    private int maxBooks;
    private int maxMembers;
    
    // Constructor
    public Library(String name, int maxBooks, int maxMembers) {
        this.name = name;
        this.maxBooks = maxBooks;
        this.maxMembers = maxMembers;
        this.books = new LibraryBook[maxBooks];
        this.members = new LibraryMember[maxMembers];
        this.bookCount = 0;
        this.memberCount = 0;
        System.out.println("Library '" + this.name + "' created successfully");
    }
    
    // Method to add a book to the library
    public boolean addBook(LibraryBook book) {
        if (this.bookCount < this.maxBooks) {
            this.books[this.bookCount] = book;
            this.bookCount++;
            System.out.println("Book '" + book.getTitle() + "' added to library");
            return true;
        } else {
            System.out.println("Library is full. Cannot add more books");
            return false;
        }
    }
    
    // Method to add a member to the library
    public boolean addMember(LibraryMember member) {
        if (this.memberCount < this.maxMembers) {
            this.members[this.memberCount] = member;
            this.memberCount++;
            System.out.println("Member '" + member.getName() + "' added to library");
            return true;
        } else {
            System.out.println("Library membership is full");
            return false;
        }
    }
    
    // Method to find a book by title
    public LibraryBook findBookByTitle(String title) {
        for (int i = 0; i < this.bookCount; i++) {
            if (this.books[i].getTitle().equalsIgnoreCase(title)) {
                return this.books[i];
            }
        }
        return null;
    }
    
    // Method to find a member by name
    public LibraryMember findMemberByName(String name) {
        for (int i = 0; i < this.memberCount; i++) {
            if (this.members[i].getName().equalsIgnoreCase(name)) {
                return this.members[i];
            }
        }
        return null;
    }
    
    // Method to display library statistics
    public void displayLibraryStats() {
        System.out.println("=== " + this.name + " Statistics ===");
        System.out.println("Total books: " + this.bookCount + "/" + this.maxBooks);
        System.out.println("Total members: " + this.memberCount + "/" + this.maxMembers);
        
        int availableBooks = 0;
        int borrowedBooks = 0;
        
        for (int i = 0; i < this.bookCount; i++) {
            if (this.books[i].isAvailable()) {
                availableBooks++;
            } else {
                borrowedBooks++;
            }
        }
        
        System.out.println("Available books: " + availableBooks);
        System.out.println("Borrowed books: " + borrowedBooks);
    }
    
    // Method to list all available books
    public void listAvailableBooks() {
        System.out.println("=== Available Books ===");
        boolean hasAvailableBooks = false;
        
        for (int i = 0; i < this.bookCount; i++) {
            if (this.books[i].isAvailable()) {
                System.out.println("- " + this.books[i].getTitle() + " by " + this.books[i].getAuthor());
                hasAvailableBooks = true;
            }
        }
        
        if (!hasAvailableBooks) {
            System.out.println("No books are currently available");
        }
    }
}

// Main demonstration class
public class LibraryManagementDemo {
    public static void main(String[] args) {
        System.out.println("=== Library Management System Demo ===");
        
        // Create library
        Library library = new Library("City Central Library", 100, 50);
        
        // Create books
        LibraryBook book1 = new LibraryBook("978-0134685991", "Effective Java", "Joshua Bloch", "Programming");
        LibraryBook book2 = new LibraryBook("978-0596009205", "Head First Java", "Kathy Sierra", "Programming");
        LibraryBook book3 = new LibraryBook("978-0134052274", "Java: The Complete Reference", "Herbert Schildt", "Programming");
        LibraryBook book4 = new LibraryBook("978-0544003415", "The Lord of the Rings", "J.R.R. Tolkien", "Fantasy");
        
        // Add books to library
        library.addBook(book1);
        library.addBook(book2);
        library.addBook(book3);
        library.addBook(book4);
        
        // Create members
        LibraryMember member1 = new LibraryMember("M001", "Alice Johnson", "alice@email.com");
        LibraryMember member2 = new LibraryMember("M002", "Bob Smith", "bob@email.com", 5); // Higher limit
        LibraryMember member3 = new LibraryMember("M003", "Charlie Brown", "charlie@email.com");
        
        // Add members to library
        library.addMember(member1);
        library.addMember(member2);
        library.addMember(member3);
        
        // Display initial library state
        System.out.println("\n=== Initial Library State ===");
        library.displayLibraryStats();
        library.listAvailableBooks();
        
        // Simulate borrowing
        System.out.println("\n=== Borrowing Books ===");
        member1.borrowBook(book1);
        member1.borrowBook(book2);
        member2.borrowBook(book3);
        member3.borrowBook(book4);
        
        // Try to borrow an already borrowed book
        System.out.println("\n--- Trying to borrow already borrowed book ---");
        member2.borrowBook(book1);
        
        // Display member information
        System.out.println("\n=== Member Information ===");
        member1.displayMemberInfo();
        System.out.println();
        member2.displayMemberInfo();
        System.out.println();
        member3.displayMemberInfo();
        
        // Display library state after borrowing
        System.out.println("\n=== Library State After Borrowing ===");
        library.displayLibraryStats();
        library.listAvailableBooks();
        
        // Return some books
        System.out.println("\n=== Returning Books ===");
        member1.returnBook(book1);
        member3.returnBook(book4);
        
        // Final library state
        System.out.println("\n=== Final Library State ===");
        library.displayLibraryStats();
        library.listAvailableBooks();
    }
}
```

## Summary

In this sixth part of our Java tutorial series, you've learned:

✅ **Classes and Objects**: Creating blueprints and instances with attributes and behaviors  
✅ **Constructors**: Initializing objects with default and parameterized constructors  
✅ **Instance Variables**: Understanding object-specific data storage  
✅ **Instance Methods**: Implementing object behaviors and operations  
✅ **The `this` Keyword**: Referencing current object and enabling method chaining  
✅ **Practical Application**: Building a complete library management system  

### Key Takeaways

1. **Encapsulation**: Bundle data and methods together in classes
2. **Object Independence**: Each object maintains its own state
3. **Constructor Overloading**: Multiple ways to initialize objects
4. **Method Design**: Create methods that perform specific, well-defined tasks
5. **Code Organization**: Use OOP to model real-world problems effectively

### Best Practices Learned

1. **Use meaningful class and method names** that clearly indicate their purpose
2. **Initialize all instance variables** in constructors
3. **Validate input parameters** in methods and constructors
4. **Use `this` keyword** when parameter names match instance variable names
5. **Design methods to be independent** and perform single responsibilities

### What's Next?

In **Part 7: Inheritance**, we'll explore:
- Extending classes to create specialized versions
- Method overriding and the `super` keyword
- Access modifiers and their impact on inheritance
- Abstract classes and methods
- The Object class and its methods

### Practice Exercises

Before moving on, try these exercises:

1. **Student Management System**: Create classes for Student, Course, and Grade with appropriate relationships
2. **Banking System**: Extend the BankAccount example with different account types (Savings, Checking, Credit)
3. **Inventory Management**: Build a system with Product, Category, and Store classes
4. **Game Characters**: Create a character system with different types of players and abilities
5. **Employee Payroll**: Design classes for Employee, Department, and Payroll calculations

Ready to dive deeper into inheritance and advanced OOP concepts? Let's continue to Part 7!

---

*This tutorial is part of our comprehensive Java Tutorial Series. Object-Oriented Programming is fundamental to Java development, so practice these concepts thoroughly before moving to inheritance.*