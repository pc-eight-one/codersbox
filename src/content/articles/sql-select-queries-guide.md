---
title: "SQL SELECT Queries: From Basic to Advanced"
description: "Master SQL SELECT queries with practical examples using an Indian e-commerce dataset. Learn filtering, joins, aggregations, and window functions."
publishDate: 2025-01-10
author: "codersbox"
tags: ["SQL", "Database", "SELECT", "Queries", "Tutorial", "MySQL", "PostgreSQL"]
readTime: "12 min read"
difficulty: "beginner"
estimatedTime: "30 minutes"
featured: true
---

# SQL SELECT Queries: From Basic to Advanced

SQL SELECT retrieves data from databases. This guide covers basic to advanced queries using a single Indian e-commerce dataset with realistic names, dates, and rupee amounts.

## Dataset

We'll use an online store with three tables: `customers`, `orders`, and `products`.

**customers:**
```sql
CREATE TABLE customers (
    customer_id INT PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100),
    city VARCHAR(50),
    state VARCHAR(50),
    joined_date DATE
);

INSERT INTO customers VALUES
(1, 'Rajesh Kumar', 'rajesh.k@email.com', 'Mumbai', 'Maharashtra', '2023-01-15'),
(2, 'Priya Sharma', 'priya.s@email.com', 'Delhi', 'Delhi', '2023-02-20'),
(3, 'Amit Patel', 'amit.p@email.com', 'Ahmedabad', 'Gujarat', '2023-03-10'),
(4, 'Sunita Reddy', 'sunita.r@email.com', 'Hyderabad', 'Telangana', '2023-04-05'),
(5, 'Vikram Singh', 'vikram.s@email.com', 'Jaipur', 'Rajasthan', '2023-05-12'),
(6, 'Anjali Desai', 'anjali.d@email.com', 'Pune', 'Maharashtra', '2023-06-18'),
(7, 'Rahul Gupta', 'rahul.g@email.com', 'Bangalore', 'Karnataka', '2023-07-22'),
(8, 'Deepa Iyer', 'deepa.i@email.com', 'Chennai', 'Tamil Nadu', '2023-08-30'),
(9, 'Suresh Menon', 'suresh.m@email.com', 'Kochi', 'Kerala', '2023-09-14'),
(10, 'Kavita Joshi', 'kavita.j@email.com', 'Mumbai', 'Maharashtra', '2023-10-25');
```

**products:**
```sql
CREATE TABLE products (
    product_id INT PRIMARY KEY,
    product_name VARCHAR(100),
    category VARCHAR(50),
    price DECIMAL(10, 2)
);

INSERT INTO products VALUES
(101, 'Samsung Galaxy M34', 'Electronics', 18999.00),
(102, 'Boat Airdopes 131', 'Electronics', 1299.00),
(103, 'Puma Running Shoes', 'Footwear', 2499.00),
(104, 'Levi''s Jeans', 'Clothing', 2999.00),
(105, 'Prestige Pressure Cooker', 'Home & Kitchen', 1899.00),
(106, 'Milton Water Bottle', 'Home & Kitchen', 349.00),
(107, 'Noise ColorFit Watch', 'Electronics', 2499.00),
(108, 'Nike Sports T-Shirt', 'Clothing', 1299.00),
(109, 'Woodland Casual Shoes', 'Footwear', 3499.00),
(110, 'Havells Table Fan', 'Home & Kitchen', 1699.00);
```

**orders:**
```sql
CREATE TABLE orders (
    order_id INT PRIMARY KEY,
    customer_id INT,
    product_id INT,
    quantity INT,
    order_date DATE,
    total_amount DECIMAL(10, 2),
    status VARCHAR(20),
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
    FOREIGN KEY (product_id) REFERENCES products(product_id)
);

INSERT INTO orders VALUES
(1001, 1, 101, 1, '2024-01-10', 18999.00, 'Delivered'),
(1002, 2, 103, 2, '2024-01-12', 4998.00, 'Delivered'),
(1003, 3, 105, 1, '2024-01-15', 1899.00, 'Delivered'),
(1004, 1, 102, 2, '2024-01-18', 2598.00, 'Delivered'),
(1005, 4, 104, 1, '2024-01-20', 2999.00, 'Shipped'),
(1006, 5, 107, 1, '2024-01-22', 2499.00, 'Delivered'),
(1007, 2, 106, 3, '2024-01-25', 1047.00, 'Delivered'),
(1008, 6, 101, 1, '2024-02-01', 18999.00, 'Delivered'),
(1009, 7, 109, 1, '2024-02-05', 3499.00, 'Shipped'),
(1010, 3, 108, 2, '2024-02-08', 2598.00, 'Delivered'),
(1011, 8, 110, 1, '2024-02-10', 1699.00, 'Delivered'),
(1012, 1, 107, 1, '2024-02-12', 2499.00, 'Cancelled'),
(1013, 9, 103, 1, '2024-02-15', 2499.00, 'Delivered'),
(1014, 10, 105, 2, '2024-02-18', 3798.00, 'Shipped'),
(1015, 4, 102, 1, '2024-02-20', 1299.00, 'Delivered');
```

## Basic SELECT

**All columns:**
```sql
SELECT *
FROM customers;
```

How it works: `SELECT *` retrieves all columns from the customers table. The asterisk (*) is a wildcard meaning "all columns". SQL reads the entire table and returns every row with all column values.

Result (10 rows):
```
customer_id | name          | email               | city       | state        | joined_date
------------|---------------|---------------------|------------|--------------|------------
1           | Rajesh Kumar  | rajesh.k@email.com  | Mumbai     | Maharashtra  | 2023-01-15
2           | Priya Sharma  | priya.s@email.com   | Delhi      | Delhi        | 2023-02-20
3           | Amit Patel    | amit.p@email.com    | Ahmedabad  | Gujarat      | 2023-03-10
...
```

**Specific columns:**
```sql
SELECT name, city, state
FROM customers;
```

How it works: Instead of `*`, we specify exact columns. SQL scans the customers table but only returns the three requested columns (name, city, state) for each row. This is more efficient than `SELECT *` when you don't need all data.

Result:
```
name          | city       | state
--------------|------------|-------------
Rajesh Kumar  | Mumbai     | Maharashtra
Priya Sharma  | Delhi      | Delhi
Amit Patel    | Ahmedabad  | Gujarat
...
```

**Limit results:**
```sql
SELECT name, email
FROM customers
LIMIT 5;
```

How it works: `LIMIT 5` tells SQL to stop after returning 5 rows. SQL processes the query normally but halts execution after the first 5 matching rows. Useful for testing queries or pagination.

Result (5 rows):
```
name          | email
--------------|--------------------
Rajesh Kumar  | rajesh.k@email.com
Priya Sharma  | priya.s@email.com
Amit Patel    | amit.p@email.com
Sunita Reddy  | sunita.r@email.com
Vikram Singh  | vikram.s@email.com
```

## WHERE Clause

**Exact match:**
```sql
SELECT name, city
FROM customers
WHERE state = 'Maharashtra';
```

How it works: SQL scans each row in the customers table. For each row, it checks if the `state` column equals 'Maharashtra'. Only rows where this condition is true are included in the result. The comparison is case-sensitive in most databases.

Selection process:
1. Read row 1: state = 'Maharashtra' ✓ (include Rajesh Kumar)
2. Read row 2: state = 'Delhi' ✗ (skip)
3. Read row 3: state = 'Gujarat' ✗ (skip)
...continues through all rows

Result:
```
name          | city
--------------|--------
Rajesh Kumar  | Mumbai
Anjali Desai  | Pune
Kavita Joshi  | Mumbai
```

**Comparison operators:**
```sql
SELECT product_name, price
FROM products
WHERE price > 2000;
```

How it works: SQL evaluates `price > 2000` for each product. The `>` operator performs numeric comparison. Rows where price is greater than 2000 are selected. Other operators: `<`, `>=`, `<=`, `!=` or `<>`.

Result:
```
product_name         | price
---------------------|----------
Samsung Galaxy M34   | 18999.00
Puma Running Shoes   | 2499.00
Levi's Jeans         | 2999.00
Noise ColorFit Watch | 2499.00
Woodland Casual Shoes| 3499.00
```

**Multiple conditions (AND):**
```sql
SELECT order_id, total_amount, status
FROM orders
WHERE total_amount > 2000
  AND status = 'Delivered';
```

How it works: Both conditions must be true for a row to be selected. SQL evaluates each condition separately, then combines results with AND logic. If `total_amount > 2000` is false OR `status = 'Delivered'` is false, the row is excluded.

Selection logic:
- Order 1001: amount=18999 (>2000 ✓) AND status='Delivered' ✓ → Include
- Order 1003: amount=1899 (>2000 ✗) AND status='Delivered' ✓ → Exclude
- Order 1012: amount=2499 (>2000 ✓) AND status='Cancelled' ✗ → Exclude

Result:
```
order_id | total_amount | status
---------|--------------|----------
1001     | 18999.00     | Delivered
1002     | 4998.00      | Delivered
1006     | 2499.00      | Delivered
1008     | 18999.00     | Delivered
1009     | 3499.00      | Delivered
1010     | 2598.00      | Delivered
1013     | 2499.00      | Delivered
1014     | 3798.00      | Delivered
```

**Multiple conditions (OR):**
```sql
SELECT name, state
FROM customers
WHERE state = 'Maharashtra'
   OR state = 'Karnataka';
```

How it works: With OR, only ONE condition needs to be true. SQL includes a row if either `state = 'Maharashtra'` OR `state = 'Karnataka'` is true. More permissive than AND.

Selection logic:
- Rajesh Kumar: state='Maharashtra' ✓ → Include (first condition matches)
- Priya Sharma: state='Delhi' ✗ AND state='Delhi' ✗ → Exclude (neither matches)
- Rahul Gupta: state='Karnataka' ✓ → Include (second condition matches)

Result:
```
name          | state
--------------|-------------
Rajesh Kumar  | Maharashtra
Anjali Desai  | Maharashtra
Rahul Gupta   | Karnataka
Kavita Joshi  | Maharashtra
```

**IN operator:**
```sql
SELECT product_name, category, price
FROM products
WHERE category IN ('Electronics', 'Footwear');
```

How it works: `IN` is shorthand for multiple OR conditions. SQL checks if the category value exists in the provided list. Equivalent to: `WHERE category = 'Electronics' OR category = 'Footwear'`. Cleaner syntax when checking against multiple values.

Result:
```
product_name         | category    | price
---------------------|-------------|----------
Samsung Galaxy M34   | Electronics | 18999.00
Boat Airdopes 131    | Electronics | 1299.00
Puma Running Shoes   | Footwear    | 2499.00
Noise ColorFit Watch | Electronics | 2499.00
Woodland Casual Shoes| Footwear    | 3499.00
```

**BETWEEN:**
```sql
SELECT order_id, order_date, total_amount
FROM orders
WHERE order_date BETWEEN '2024-02-01' AND '2024-02-15';
```

How it works: `BETWEEN` includes both boundary values. It's equivalent to `WHERE order_date >= '2024-02-01' AND order_date <= '2024-02-15'`. SQL selects rows where order_date falls within the inclusive range.

Selection process:
- Order 1008: date='2024-02-01' (>= start ✓, <= end ✓) → Include
- Order 1007: date='2024-01-25' (< start ✗) → Exclude
- Order 1014: date='2024-02-18' (> end ✗) → Exclude

Result:
```
order_id | order_date  | total_amount
---------|-------------|-------------
1008     | 2024-02-01  | 18999.00
1009     | 2024-02-05  | 3499.00
1010     | 2024-02-08  | 2598.00
1011     | 2024-02-10  | 1699.00
1012     | 2024-02-12  | 2499.00
1013     | 2024-02-15  | 2499.00
```

**LIKE (pattern matching):**
```sql
SELECT name, email
FROM customers
WHERE name LIKE 'R%';
```

How it works: `LIKE` performs pattern matching. The `%` wildcard matches zero or more characters. `'R%'` means "starts with R followed by anything". SQL checks each name against this pattern.

Pattern examples:
- `'R%'` → starts with R (Rajesh, Rahul)
- `'%Kumar'` → ends with Kumar
- `'%a%'` → contains 'a' anywhere
- `'_ajesh'` → second letter onwards is 'ajesh' (_ matches exactly one character)

Result:
```
name         | email
-------------|-------------------
Rajesh Kumar | rajesh.k@email.com
Rahul Gupta  | rahul.g@email.com
```

```sql
SELECT name
FROM customers
WHERE name LIKE '%Kumar%';
```

Result:
```
name
-------------
Rajesh Kumar
```

**IS NULL / IS NOT NULL:**
```sql
SELECT product_name, price
FROM products
WHERE price IS NOT NULL;
```

## ORDER BY

**Ascending order:**
```sql
SELECT product_name, price
FROM products
ORDER BY price ASC;
```

Result:
```
product_name              | price
--------------------------|----------
Milton Water Bottle       | 349.00
Boat Airdopes 131         | 1299.00
Nike Sports T-Shirt       | 1299.00
Havells Table Fan         | 1699.00
Prestige Pressure Cooker  | 1899.00
Puma Running Shoes        | 2499.00
Noise ColorFit Watch      | 2499.00
Levi's Jeans              | 2999.00
Woodland Casual Shoes     | 3499.00
Samsung Galaxy M34        | 18999.00
```

**Descending order:**
```sql
SELECT name, joined_date
FROM customers
ORDER BY joined_date DESC;
```

Result:
```
name          | joined_date
--------------|------------
Kavita Joshi  | 2023-10-25
Suresh Menon  | 2023-09-14
Deepa Iyer    | 2023-08-30
Rahul Gupta   | 2023-07-22
...
```

**Multiple columns:**
```sql
SELECT name, state, city
FROM customers
ORDER BY state ASC, city ASC;
```

Result (sorted by state, then city):
```
name          | state        | city
--------------|--------------|----------
Priya Sharma  | Delhi        | Delhi
Amit Patel    | Gujarat      | Ahmedabad
Rahul Gupta   | Karnataka    | Bangalore
...
```

## Aggregate Functions

**COUNT:**
```sql
SELECT COUNT(*) AS total_customers
FROM customers;
```

Result:
```
total_customers
---------------
10
```

**SUM:**
```sql
SELECT SUM(total_amount) AS revenue
FROM orders
WHERE status = 'Delivered';
```

Result:
```
revenue
----------
67933.00
```

**AVG:**
```sql
SELECT AVG(price) AS average_price
FROM products;
```

Result:
```
average_price
-------------
3794.10
```

**MIN and MAX:**
```sql
SELECT
    MIN(price) AS cheapest_product,
    MAX(price) AS costliest_product
FROM products;
```

Result:
```
cheapest_product | costliest_product
-----------------|------------------
349.00           | 18999.00
```

## GROUP BY

**Count orders per customer:**
```sql
SELECT
    customer_id,
    COUNT(*) AS order_count
FROM orders
GROUP BY customer_id
ORDER BY order_count DESC;
```

How it works: `GROUP BY` combines rows with the same customer_id into groups. For each group, `COUNT(*)` counts the number of rows. The result has one row per unique customer_id.

Grouping process:
1. SQL sorts/groups orders by customer_id
2. Customer 1: orders 1001, 1004, 1012 → COUNT = 3
3. Customer 2: orders 1002, 1007 → COUNT = 2
4. Customer 5: order 1006 → COUNT = 1
...and so on

Without GROUP BY, COUNT(*) would return total rows (15). With GROUP BY, it returns count per group.

Result:
```
customer_id | order_count
------------|------------
1           | 3
2           | 2
3           | 2
4           | 2
5           | 1
6           | 1
7           | 1
8           | 1
9           | 1
10          | 1
```

**Total sales by category:**
```sql
SELECT
    p.category,
    SUM(o.total_amount) AS category_revenue
FROM orders o
JOIN products p ON o.product_id = p.product_id
WHERE o.status = 'Delivered'
GROUP BY p.category
ORDER BY category_revenue DESC;
```

Result:
```
category       | category_revenue
---------------|------------------
Electronics    | 45094.00
Footwear       | 9996.00
Home & Kitchen | 7395.00
Clothing       | 5597.00
```

**Average order value by state:**
```sql
SELECT
    c.state,
    AVG(o.total_amount) AS avg_order_value
FROM orders o
JOIN customers c ON o.customer_id = c.customer_id
GROUP BY c.state
ORDER BY avg_order_value DESC;
```

Result:
```
state        | avg_order_value
-------------|----------------
Maharashtra  | 8235.67
Karnataka    | 3499.00
Telangana    | 2149.00
Gujarat      | 2165.33
...
```

## HAVING

Filter grouped results (WHERE filters rows before grouping, HAVING filters after):

```sql
SELECT
    customer_id,
    COUNT(*) AS order_count,
    SUM(total_amount) AS total_spent
FROM orders
GROUP BY customer_id
HAVING SUM(total_amount) > 5000
ORDER BY total_spent DESC;
```

Result:
```
customer_id | order_count | total_spent
------------|-------------|------------
1           | 3           | 24096.00
2           | 2           | 6045.00
```

**Multiple conditions:**
```sql
SELECT
    c.state,
    COUNT(o.order_id) AS order_count,
    AVG(o.total_amount) AS avg_amount
FROM orders o
JOIN customers c ON o.customer_id = c.customer_id
WHERE o.status = 'Delivered'
GROUP BY c.state
HAVING COUNT(o.order_id) >= 2
   AND AVG(o.total_amount) > 2000;
```

Result:
```
state        | order_count | avg_amount
-------------|-------------|------------
Maharashtra  | 4           | 6036.25
Gujarat      | 2           | 2248.50
```

## JOINS

**INNER JOIN (matching records only):**
```sql
SELECT
    c.name,
    o.order_id,
    o.order_date,
    o.total_amount
FROM customers c
INNER JOIN orders o ON c.customer_id = o.customer_id
LIMIT 5;
```

How it works: `INNER JOIN` combines rows from two tables where the join condition matches. SQL takes each customer row, finds all matching orders (where customer_id equals), and combines them into result rows.

Join process:
1. Start with customers table (c)
2. For each customer, look in orders table (o)
3. Find orders where o.customer_id = c.customer_id
4. Combine matching rows: customer data + order data
5. Only include customers who have placed orders

Example: Rajesh Kumar (customer_id=1) matches orders 1001, 1004, 1012 → creates 3 result rows.

Result:
```
name          | order_id | order_date  | total_amount
--------------|----------|-------------|-------------
Rajesh Kumar  | 1001     | 2024-01-10  | 18999.00
Priya Sharma  | 1002     | 2024-01-12  | 4998.00
Amit Patel    | 1003     | 2024-01-15  | 1899.00
Rajesh Kumar  | 1004     | 2024-01-18  | 2598.00
Sunita Reddy  | 1005     | 2024-01-20  | 2999.00
```

**LEFT JOIN (all customers, even without orders):**
```sql
SELECT
    c.name,
    c.city,
    COUNT(o.order_id) AS order_count
FROM customers c
LEFT JOIN orders o ON c.customer_id = o.customer_id
GROUP BY c.customer_id, c.name, c.city
ORDER BY order_count DESC;
```

How it works: `LEFT JOIN` keeps all rows from the left table (customers) even if there's no match in the right table (orders). When no match exists, order columns are NULL.

Difference from INNER JOIN:
- INNER JOIN: Only customers with orders appear
- LEFT JOIN: All customers appear; order_count is 0 for customers without orders

In our dataset, all 10 customers have placed orders, so LEFT JOIN and INNER JOIN return the same customers. But LEFT JOIN ensures no customer is excluded.

Result:
```
name          | city       | order_count
--------------|------------|------------
Rajesh Kumar  | Mumbai     | 3
Priya Sharma  | Delhi      | 2
Amit Patel    | Ahmedabad  | 2
Sunita Reddy  | Hyderabad  | 2
Vikram Singh  | Jaipur     | 1
Anjali Desai  | Pune       | 1
Rahul Gupta   | Bangalore  | 1
Deepa Iyer    | Chennai    | 1
Suresh Menon  | Kochi      | 1
Kavita Joshi  | Mumbai     | 1
```

**Multiple JOINs:**
```sql
SELECT
    c.name AS customer_name,
    p.product_name,
    o.quantity,
    o.total_amount,
    o.order_date
FROM orders o
INNER JOIN customers c ON o.customer_id = c.customer_id
INNER JOIN products p ON o.product_id = p.product_id
WHERE o.order_date >= '2024-02-01'
ORDER BY o.order_date DESC
LIMIT 5;
```

How it works: Chain multiple JOINs to combine data from three or more tables. SQL processes JOINs left to right.

Execution steps:
1. Start with orders table (o)
2. JOIN customers: match o.customer_id = c.customer_id → get customer names
3. JOIN products: match o.product_id = p.product_id → get product details
4. Apply WHERE filter: keep only orders from Feb 2024 onwards
5. Sort by order_date descending
6. Return top 5 rows

Each order now has: order info + customer name + product name.

Result:
```
customer_name | product_name              | quantity | total_amount | order_date
--------------|---------------------------|----------|--------------|------------
Sunita Reddy  | Boat Airdopes 131         | 1        | 1299.00      | 2024-02-20
Kavita Joshi  | Prestige Pressure Cooker  | 2        | 3798.00      | 2024-02-18
Suresh Menon  | Puma Running Shoes        | 1        | 2499.00      | 2024-02-15
Rajesh Kumar  | Noise ColorFit Watch      | 1        | 2499.00      | 2024-02-12
Deepa Iyer    | Havells Table Fan         | 1        | 1699.00      | 2024-02-10
```

## Subqueries

**IN subquery:**
```sql
SELECT name, city
FROM customers
WHERE customer_id IN (
    SELECT customer_id
    FROM orders
    WHERE total_amount > 3000
);
```

How it works: A subquery (inner query) runs first, returns a list of values, then the outer query uses those values. Think of it as a two-step process.

Execution order:
1. **Inner query runs first**:
   - SELECT customer_id FROM orders WHERE total_amount > 3000
   - Returns: (1, 2, 6, 7, 3, 10) — customers who placed high-value orders

2. **Outer query uses result**:
   - SELECT name, city FROM customers WHERE customer_id IN (1, 2, 6, 7, 3, 10)
   - Fetches customer details for those IDs

Equivalent to a JOIN but sometimes more readable for simple filters.

Result:
```
name          | city
--------------|----------
Rajesh Kumar  | Mumbai
Priya Sharma  | Delhi
Anjali Desai  | Pune
Rahul Gupta   | Bangalore
Amit Patel    | Ahmedabad
Kavita Joshi  | Mumbai
```

**Scalar subquery:**
```sql
SELECT
    product_name,
    price,
    (SELECT AVG(price) FROM products) AS avg_price,
    price - (SELECT AVG(price) FROM products) AS price_difference
FROM products
ORDER BY price_difference DESC;
```

**EXISTS:**
```sql
SELECT name, email
FROM customers c
WHERE EXISTS (
    SELECT 1
    FROM orders o
    WHERE o.customer_id = c.customer_id
      AND o.status = 'Cancelled'
);
```
Returns customers with at least one cancelled order

**Correlated subquery:**
```sql
SELECT
    c.name,
    c.city,
    (SELECT COUNT(*)
     FROM orders o
     WHERE o.customer_id = c.customer_id) AS total_orders,
    (SELECT SUM(total_amount)
     FROM orders o
     WHERE o.customer_id = c.customer_id) AS total_spent
FROM customers c;
```

## CASE Statements

**Simple CASE:**
```sql
SELECT
    product_name,
    price,
    CASE
        WHEN price < 1000 THEN 'Budget'
        WHEN price BETWEEN 1000 AND 5000 THEN 'Mid-Range'
        ELSE 'Premium'
    END AS price_category
FROM products
ORDER BY price;
```

Result:
```
product_name              | price     | price_category
--------------------------|-----------|----------------
Milton Water Bottle       | 349.00    | Budget
Boat Airdopes 131         | 1299.00   | Mid-Range
Nike Sports T-Shirt       | 1299.00   | Mid-Range
Havells Table Fan         | 1699.00   | Mid-Range
Prestige Pressure Cooker  | 1899.00   | Mid-Range
Puma Running Shoes        | 2499.00   | Mid-Range
Noise ColorFit Watch      | 2499.00   | Mid-Range
Levi's Jeans              | 2999.00   | Mid-Range
Woodland Casual Shoes     | 3499.00   | Mid-Range
Samsung Galaxy M34        | 18999.00  | Premium
```

**With aggregation:**
```sql
SELECT
    status,
    COUNT(*) AS order_count,
    SUM(total_amount) AS revenue,
    SUM(CASE
        WHEN total_amount > 3000 THEN 1
        ELSE 0
    END) AS high_value_orders
FROM orders
GROUP BY status;
```

## DISTINCT

**Unique values:**
```sql
SELECT DISTINCT state
FROM customers
ORDER BY state;
```

**Count unique values:**
```sql
SELECT COUNT(DISTINCT customer_id) AS unique_customers
FROM orders;
```

**Multiple columns:**
```sql
SELECT DISTINCT state, city
FROM customers
ORDER BY state, city;
```

## String Functions

**CONCAT:**
```sql
SELECT
    CONCAT(name, ' (', city, ')') AS customer_info,
    email
FROM customers;
```
Returns: "Rajesh Kumar (Mumbai)"

**UPPER / LOWER:**
```sql
SELECT
    UPPER(name) AS name_upper,
    LOWER(email) AS email_lower
FROM customers
LIMIT 3;
```

**SUBSTRING:**
```sql
SELECT
    name,
    SUBSTRING(email, 1, POSITION('@' IN email) - 1) AS username
FROM customers;
```

**LENGTH:**
```sql
SELECT
    product_name,
    LENGTH(product_name) AS name_length
FROM products
WHERE LENGTH(product_name) > 15;
```

## Date Functions

**YEAR, MONTH, DAY:**
```sql
SELECT
    order_id,
    order_date,
    YEAR(order_date) AS order_year,
    MONTH(order_date) AS order_month,
    DAY(order_date) AS order_day
FROM orders
WHERE YEAR(order_date) = 2024;
```

**DATE_FORMAT (MySQL):**
```sql
SELECT
    order_id,
    DATE_FORMAT(order_date, '%d/%m/%Y') AS formatted_date
FROM orders;
```
Returns: 10/01/2024

**DATEDIFF:**
```sql
SELECT
    name,
    joined_date,
    DATEDIFF(CURDATE(), joined_date) AS days_since_joined
FROM customers
ORDER BY days_since_joined DESC;
```

**Extract month name:**
```sql
SELECT
    DATE_FORMAT(order_date, '%M %Y') AS month_year,
    COUNT(*) AS orders,
    SUM(total_amount) AS revenue
FROM orders
GROUP BY month_year
ORDER BY MIN(order_date);
```

## Window Functions

**ROW_NUMBER:**
```sql
SELECT
    name,
    city,
    joined_date,
    ROW_NUMBER() OVER (ORDER BY joined_date) AS signup_sequence
FROM customers;
```

How it works: Window functions perform calculations across a set of rows related to the current row, WITHOUT collapsing them into groups (unlike GROUP BY).

`ROW_NUMBER()` assigns sequential numbers to rows based on the ORDER BY clause in the OVER() section.

Execution:
1. SQL sorts customers by joined_date
2. Assigns number 1 to first row (earliest date)
3. Number 2 to second row, and so on
4. Each row keeps all its original data + gets a row number

Key difference from GROUP BY: All 10 customer rows remain; we just add a calculated column.

Result:
```
name          | city       | joined_date | signup_sequence
--------------|------------|-------------|----------------
Rajesh Kumar  | Mumbai     | 2023-01-15  | 1
Priya Sharma  | Delhi      | 2023-02-20  | 2
Amit Patel    | Ahmedabad  | 2023-03-10  | 3
Sunita Reddy  | Hyderabad  | 2023-04-05  | 4
Vikram Singh  | Jaipur     | 2023-05-12  | 5
...
```

**RANK by total spent:**
```sql
SELECT
    c.name,
    SUM(o.total_amount) AS total_spent,
    RANK() OVER (ORDER BY SUM(o.total_amount) DESC) AS spending_rank
FROM customers c
LEFT JOIN orders o ON c.customer_id = o.customer_id
GROUP BY c.customer_id, c.name;
```

**PARTITION BY:**
```sql
SELECT
    c.state,
    c.name,
    SUM(o.total_amount) AS total_spent,
    RANK() OVER (
        PARTITION BY c.state
        ORDER BY SUM(o.total_amount) DESC
    ) AS rank_in_state
FROM customers c
LEFT JOIN orders o ON c.customer_id = o.customer_id
GROUP BY c.customer_id, c.state, c.name;
```

How it works: `PARTITION BY` divides rows into separate groups (partitions), then applies the window function independently within each partition. Think of it as "GROUP BY for window functions."

Execution:
1. GROUP BY creates one row per customer with their total_spent
2. PARTITION BY state separates customers by their state
3. Within each state partition, RANK() orders customers by spending
4. Ranking resets for each new state (rank 1 appears multiple times)

Example partitions:
- **Maharashtra partition**: Rajesh (24096) → rank 1, Anjali (18999) → rank 2, Kavita (3798) → rank 3
- **Delhi partition**: Priya (6045) → rank 1
- **Gujarat partition**: Amit (4497) → rank 1

Result (partial):
```
state        | name          | total_spent | rank_in_state
-------------|---------------|-------------|---------------
Maharashtra  | Rajesh Kumar  | 24096.00    | 1
Maharashtra  | Anjali Desai  | 18999.00    | 2
Maharashtra  | Kavita Joshi  | 3798.00     | 3
Delhi        | Priya Sharma  | 6045.00     | 1
Gujarat      | Amit Patel    | 4497.00     | 1
Karnataka    | Rahul Gupta   | 3499.00     | 1
...
```

**Running total:**
```sql
SELECT
    order_date,
    order_id,
    total_amount,
    SUM(total_amount) OVER (
        ORDER BY order_date, order_id
    ) AS running_total
FROM orders
ORDER BY order_date, order_id;
```

**Moving average (last 3 orders):**
```sql
SELECT
    order_date,
    order_id,
    total_amount,
    AVG(total_amount) OVER (
        ORDER BY order_date, order_id
        ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
    ) AS moving_avg
FROM orders
ORDER BY order_date, order_id;
```

## Advanced Examples

**Top 3 products by revenue:**
```sql
SELECT
    p.product_name,
    p.category,
    COUNT(o.order_id) AS times_ordered,
    SUM(o.total_amount) AS revenue
FROM products p
INNER JOIN orders o ON p.product_id = o.product_id
WHERE o.status != 'Cancelled'
GROUP BY p.product_id, p.product_name, p.category
ORDER BY revenue DESC
LIMIT 3;
```

**Customers who haven't ordered in 2024:**
```sql
SELECT
    c.name,
    c.city,
    MAX(o.order_date) AS last_order_date
FROM customers c
LEFT JOIN orders o ON c.customer_id = o.customer_id
GROUP BY c.customer_id, c.name, c.city
HAVING MAX(o.order_date) < '2024-01-01'
    OR MAX(o.order_date) IS NULL;
```

**Month-over-month growth:**
```sql
WITH monthly_sales AS (
    SELECT
        DATE_FORMAT(order_date, '%Y-%m') AS month,
        SUM(total_amount) AS revenue
    FROM orders
    WHERE status = 'Delivered'
    GROUP BY month
)
SELECT
    month,
    revenue,
    LAG(revenue) OVER (ORDER BY month) AS prev_month_revenue,
    revenue - LAG(revenue) OVER (ORDER BY month) AS growth,
    ROUND(
        ((revenue - LAG(revenue) OVER (ORDER BY month))
         / LAG(revenue) OVER (ORDER BY month)) * 100,
        2
    ) AS growth_pct
FROM monthly_sales
ORDER BY month;
```

**Customer segmentation by purchase behavior:**
```sql
SELECT
    c.customer_id,
    c.name,
    COUNT(o.order_id) AS order_count,
    SUM(o.total_amount) AS total_spent,
    AVG(o.total_amount) AS avg_order_value,
    CASE
        WHEN COUNT(o.order_id) >= 3 AND SUM(o.total_amount) > 10000 THEN 'VIP'
        WHEN COUNT(o.order_id) >= 2 AND SUM(o.total_amount) > 5000 THEN 'Regular'
        ELSE 'Occasional'
    END AS customer_segment
FROM customers c
LEFT JOIN orders o ON c.customer_id = o.customer_id
GROUP BY c.customer_id, c.name
ORDER BY total_spent DESC;
```

Result:
```
customer_id | name          | order_count | total_spent | avg_order_value | customer_segment
------------|---------------|-------------|-------------|-----------------|------------------
1           | Rajesh Kumar  | 3           | 24096.00    | 8032.00         | VIP
2           | Priya Sharma  | 2           | 6045.00     | 3022.50         | Regular
6           | Anjali Desai  | 1           | 18999.00    | 18999.00        | Occasional
10          | Kavita Joshi  | 1           | 3798.00     | 3798.00         | Occasional
4           | Sunita Reddy  | 2           | 4298.00     | 2149.00         | Occasional
3           | Amit Patel    | 2           | 4497.00     | 2248.50         | Occasional
7           | Rahul Gupta   | 1           | 3499.00     | 3499.00         | Occasional
5           | Vikram Singh  | 1           | 2499.00     | 2499.00         | Occasional
9           | Suresh Menon  | 1           | 2499.00     | 2499.00         | Occasional
8           | Deepa Iyer    | 1           | 1699.00     | 1699.00         | Occasional
```

**Products never ordered:**
```sql
SELECT
    p.product_id,
    p.product_name,
    p.category,
    p.price
FROM products p
LEFT JOIN orders o ON p.product_id = o.product_id
WHERE o.order_id IS NULL;
```

**Best selling day of the week:**
```sql
SELECT
    DAYNAME(order_date) AS day_of_week,
    COUNT(*) AS order_count,
    SUM(total_amount) AS revenue,
    AVG(total_amount) AS avg_order_value
FROM orders
WHERE status = 'Delivered'
GROUP BY day_of_week
ORDER BY revenue DESC;
```

**Find duplicate emails (if any):**
```sql
SELECT
    email,
    COUNT(*) AS email_count
FROM customers
GROUP BY email
HAVING COUNT(*) > 1;
```

## Common Table Expressions (CTE)

**Basic CTE:**
```sql
WITH high_value_orders AS (
    SELECT
        customer_id,
        order_id,
        total_amount
    FROM orders
    WHERE total_amount > 3000
)
SELECT
    c.name,
    c.city,
    h.order_id,
    h.total_amount
FROM high_value_orders h
JOIN customers c ON h.customer_id = c.customer_id
ORDER BY h.total_amount DESC;
```

**Multiple CTEs:**
```sql
WITH customer_stats AS (
    SELECT
        customer_id,
        COUNT(*) AS order_count,
        SUM(total_amount) AS total_spent
    FROM orders
    GROUP BY customer_id
),
avg_spending AS (
    SELECT AVG(total_spent) AS avg_customer_spent
    FROM customer_stats
)
SELECT
    c.name,
    c.city,
    cs.order_count,
    cs.total_spent,
    ROUND(cs.total_spent - a.avg_customer_spent, 2) AS diff_from_avg
FROM customer_stats cs
JOIN customers c ON cs.customer_id = c.customer_id
CROSS JOIN avg_spending a
WHERE cs.total_spent > a.avg_customer_spent
ORDER BY cs.total_spent DESC;
```
Returns customers spending above average

## Performance Tips

**Use indexes on frequently queried columns:**
```sql
CREATE INDEX idx_customer_state ON customers(state);
CREATE INDEX idx_order_date ON orders(order_date);
CREATE INDEX idx_order_status ON orders(status);
```

**Select only needed columns** instead of `SELECT *`

**Use EXPLAIN to analyze queries:**
```sql
EXPLAIN SELECT
    c.name,
    COUNT(o.order_id) AS order_count
FROM customers c
LEFT JOIN orders o ON c.customer_id = o.customer_id
GROUP BY c.customer_id, c.name;
```

**Filter early with WHERE** before JOIN when possible

**Use LIMIT** for large result sets during development

## Practice Queries

Try these on your own:

1. Find customers from Maharashtra who ordered Electronics
2. Calculate the total quantity sold for each product category
3. List orders with product names where total_amount > average order amount
4. Find the most popular product in each category
5. Get customers who ordered the same product more than once
6. Calculate each customer's percentage contribution to total revenue
7. Find orders placed on weekends
8. List products that are priced above their category average

## Summary

- **SELECT** retrieves data with optional column selection
- **WHERE** filters rows before grouping
- **GROUP BY** aggregates data
- **HAVING** filters grouped results
- **JOIN** combines tables
- **Subqueries** nest queries for complex logic
- **Window functions** perform calculations across row sets
- **CTEs** improve query readability

Start with basic SELECT and WHERE, then progress to joins and aggregations. Master these patterns and you'll handle most real-world SQL tasks.
