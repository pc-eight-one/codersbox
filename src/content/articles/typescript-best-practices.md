---
title: "TypeScript Best Practices for 2025"
description: "Essential TypeScript best practices, patterns, and techniques to write better, more maintainable code."
publishDate: 2025-01-08
tags: ["TypeScript", "JavaScript", "Best Practices", "Programming"]
readTime: "14 min read"
featured: false
---

# TypeScript Best Practices for 2025

TypeScript has become an essential tool for JavaScript developers, providing static type checking and enhanced developer experience. This guide covers the best practices and patterns that will help you write better TypeScript code.

## Type Definitions

### Use Explicit Types When Beneficial

While TypeScript has excellent type inference, explicit types can improve code readability and catch errors early:

```typescript
// ✅ Good: Explicit return type for public APIs
function calculateTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

// ✅ Good: Type inference is sufficient
const userName = getUserName(); // TypeScript can infer the return type

// ❌ Avoid: Unnecessary explicit typing
const count: number = 5; // TypeScript can infer this is a number
```

### Prefer Interfaces Over Type Aliases for Object Shapes

```typescript
// ✅ Good: Interface for object shapes
interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

// ✅ Good: Type alias for unions and computed types
type Status = 'pending' | 'approved' | 'rejected';
type UserKeys = keyof User;

// ❌ Avoid: Type alias for simple object shapes
type UserType = {
  id: string;
  name: string;
  email: string;
};
```

### Use Utility Types

Leverage TypeScript's built-in utility types:

```typescript
interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

// Create user without sensitive data
type PublicUser = Omit<User, 'password'>;

// User creation payload
type CreateUserInput = Pick<User, 'name' | 'email' | 'password'>;

// Partial update
type UpdateUserInput = Partial<Pick<User, 'name' | 'email'>>;

// Make all properties optional except id
type UserUpdate = Partial<User> & Pick<User, 'id'>;
```

## Strict Configuration

### Enable Strict Mode

Always use strict TypeScript configuration:

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true
  }
}
```

### Handle Nullable Values Properly

```typescript
// ✅ Good: Explicit null checking
function processUser(user: User | null): string {
  if (!user) {
    return 'No user found';
  }
  
  return `Hello, ${user.name}`;
}

// ✅ Good: Optional chaining
function getUserEmail(user?: User): string | undefined {
  return user?.email;
}

// ✅ Good: Nullish coalescing
function getDisplayName(user: User): string {
  return user.displayName ?? user.name ?? 'Anonymous';
}

// ❌ Avoid: Non-null assertion without good reason
function dangerousFunction(user: User | null): string {
  return user!.name; // Could throw runtime error
}
```

## Function Types and Generics

### Use Function Overloads for Complex Signatures

```typescript
// Function overloads for different parameter combinations
function createElement(tag: 'div'): HTMLDivElement;
function createElement(tag: 'span'): HTMLSpanElement;
function createElement(tag: 'input'): HTMLInputElement;
function createElement(tag: string): HTMLElement;
function createElement(tag: string): HTMLElement {
  return document.createElement(tag);
}

// Usage with proper type inference
const div = createElement('div'); // Type: HTMLDivElement
const input = createElement('input'); // Type: HTMLInputElement
```

### Write Effective Generic Types

```typescript
// ✅ Good: Constrained generics
interface Repository<T extends { id: string }> {
  findById(id: string): Promise<T | null>;
  create(entity: Omit<T, 'id' | 'createdAt'>): Promise<T>;
  update(id: string, updates: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
}

// ✅ Good: Generic with default type
interface ApiResponse<T = unknown> {
  data: T;
  status: number;
  message: string;
}

// ✅ Good: Multiple generic constraints
function merge<T extends object, U extends object>(
  obj1: T, 
  obj2: U
): T & U {
  return { ...obj1, ...obj2 };
}

// ❌ Avoid: Overly complex generics
interface ComplexGeneric<T, U, V, W extends keyof T, X extends U[keyof U]> {
  // Too many generic parameters make code hard to understand
}
```

## Error Handling

### Use Discriminated Unions for Result Types

```typescript
// Result type pattern
type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };

async function fetchUser(id: string): Promise<Result<User, string>> {
  try {
    const response = await fetch(`/api/users/${id}`);
    if (!response.ok) {
      return { success: false, error: 'User not found' };
    }
    const user = await response.json();
    return { success: true, data: user };
  } catch (error) {
    return { success: false, error: 'Network error' };
  }
}

// Usage with type safety
async function handleUser(id: string) {
  const result = await fetchUser(id);
  
  if (result.success) {
    // TypeScript knows result.data is User
    console.log(result.data.name);
  } else {
    // TypeScript knows result.error is string
    console.error(result.error);
  }
}
```

### Create Custom Error Types

```typescript
abstract class AppError extends Error {
  abstract readonly code: string;
  abstract readonly statusCode: number;
}

class ValidationError extends AppError {
  readonly code = 'VALIDATION_ERROR';
  readonly statusCode = 400;
  
  constructor(
    message: string,
    public readonly field: string
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

class NotFoundError extends AppError {
  readonly code = 'NOT_FOUND';
  readonly statusCode = 404;
  
  constructor(resource: string, id: string) {
    super(`${resource} with id ${id} not found`);
    this.name = 'NotFoundError';
  }
}

// Type-safe error handling
function handleError(error: AppError) {
  switch (error.code) {
    case 'VALIDATION_ERROR':
      // TypeScript knows this is ValidationError
      console.log(`Validation failed for field: ${error.field}`);
      break;
    case 'NOT_FOUND':
      // TypeScript knows this is NotFoundError
      console.log(`Resource not found: ${error.message}`);
      break;
  }
}
```

## Advanced Patterns

### Use Branded Types for Type Safety

```typescript
// Branded types prevent mixing similar types
type UserId = string & { readonly brand: unique symbol };
type PostId = string & { readonly brand: unique symbol };

function createUserId(id: string): UserId {
  return id as UserId;
}

function createPostId(id: string): PostId {
  return id as PostId;
}

function getUser(id: UserId): Promise<User> {
  // Implementation
  return Promise.resolve({} as User);
}

function getPost(id: PostId): Promise<Post> {
  // Implementation
  return Promise.resolve({} as Post);
}

// Usage
const userId = createUserId('user-123');
const postId = createPostId('post-456');

getUser(userId); // ✅ Correct
getPost(postId); // ✅ Correct

// getUser(postId); // ❌ TypeScript error - can't pass PostId to function expecting UserId
```

### Implement Builder Pattern with Types

```typescript
class QueryBuilder<T> {
  private conditions: string[] = [];
  private sortField?: keyof T;
  private sortDirection?: 'asc' | 'desc';
  private limitValue?: number;
  
  where(field: keyof T, operator: string, value: any): this {
    this.conditions.push(`${String(field)} ${operator} ${value}`);
    return this;
  }
  
  orderBy(field: keyof T, direction: 'asc' | 'desc' = 'asc'): this {
    this.sortField = field;
    this.sortDirection = direction;
    return this;
  }
  
  limit(count: number): this {
    this.limitValue = count;
    return this;
  }
  
  build(): string {
    let query = 'SELECT * FROM table';
    
    if (this.conditions.length > 0) {
      query += ` WHERE ${this.conditions.join(' AND ')}`;
    }
    
    if (this.sortField) {
      query += ` ORDER BY ${String(this.sortField)} ${this.sortDirection}`;
    }
    
    if (this.limitValue) {
      query += ` LIMIT ${this.limitValue}`;
    }
    
    return query;
  }
}

// Usage with type safety
interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

const query = new QueryBuilder<User>()
  .where('name', '=', 'John')
  .where('email', 'LIKE', '%@example.com')
  .orderBy('createdAt', 'desc')
  .limit(10)
  .build();
```

## Testing with TypeScript

### Type-Safe Test Utilities

```typescript
// Test helper types
type MockedFunction<T extends (...args: any[]) => any> = jest.MockedFunction<T>;

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Factory function for test data
function createUser(overrides: DeepPartial<User> = {}): User {
  return {
    id: 'user-123',
    name: 'Test User',
    email: 'test@example.com',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  };
}

// Type-safe mocking
interface UserService {
  getUser(id: string): Promise<User>;
  createUser(data: CreateUserInput): Promise<User>;
}

const mockUserService: jest.Mocked<UserService> = {
  getUser: jest.fn(),
  createUser: jest.fn()
};

// Test with proper typing
describe('UserController', () => {
  it('should get user by id', async () => {
    const user = createUser({ name: 'John Doe' });
    mockUserService.getUser.mockResolvedValue(user);
    
    const result = await userController.getUser('user-123');
    
    expect(result).toEqual(user);
    expect(mockUserService.getUser).toHaveBeenCalledWith('user-123');
  });
});
```

## Performance Considerations

### Use const Assertions

```typescript
// ✅ Good: const assertion for immutable data
const themes = ['light', 'dark', 'auto'] as const;
type Theme = typeof themes[number]; // 'light' | 'dark' | 'auto'

const config = {
  apiUrl: 'https://api.example.com',
  timeout: 5000,
  retries: 3
} as const;

// ✅ Good: const assertion for lookup objects
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
} as const;

type HttpStatus = typeof HTTP_STATUS[keyof typeof HTTP_STATUS];
```

### Optimize Bundle Size

```typescript
// ✅ Good: Use type-only imports
import type { User } from './types';
import { validateUser } from './validation';

// ✅ Good: Import only what you need
import { debounce } from 'lodash/debounce';

// ❌ Avoid: Importing entire libraries for types
import * as lodash from 'lodash'; // Imports entire library
```

## Code Organization

### Use Barrel Exports

```typescript
// types/index.ts
export type { User } from './user';
export type { Post } from './post';
export type { Comment } from './comment';

// services/index.ts
export { UserService } from './user-service';
export { PostService } from './post-service';

// utils/index.ts
export { formatDate } from './date';
export { validateEmail } from './validation';

// Usage
import type { User, Post } from '@/types';
import { UserService, PostService } from '@/services';
import { formatDate, validateEmail } from '@/utils';
```

### Organize by Feature

```
src/
├── features/
│   ├── auth/
│   │   ├── types.ts
│   │   ├── service.ts
│   │   ├── hooks.ts
│   │   └── index.ts
│   ├── users/
│   │   ├── types.ts
│   │   ├── service.ts
│   │   ├── hooks.ts
│   │   └── index.ts
└── shared/
    ├── types/
    ├── utils/
    └── hooks/
```

## Conclusion

TypeScript's power lies in its ability to catch errors at compile time and provide excellent developer experience. By following these best practices, you'll write more maintainable, type-safe code that scales well with your project's growth.

Key takeaways:
- Use strict TypeScript configuration
- Leverage utility types and generics effectively
- Implement proper error handling patterns
- Use branded types for additional type safety
- Organize code by features, not by file types
- Keep types simple and readable
- Use const assertions for immutable data
- Optimize for both developer experience and runtime performance