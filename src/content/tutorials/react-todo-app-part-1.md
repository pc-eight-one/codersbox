---
title: "Build a React Todo App - Part 1: Setup and Basic Components"
description: "Learn React fundamentals by building a todo application from scratch. Part 1 covers project setup, components, and state management."
publishDate: 2025-01-14
tags: ["React", "JavaScript", "Components", "State Management"]
difficulty: "intermediate"
series: "React Todo App"
part: 1
estimatedTime: "90 minutes"
totalParts: 3
featured: false
---

# Build a React Todo App - Part 1: Setup and Basic Components

Welcome to this comprehensive React tutorial series! We'll build a fully functional todo application that demonstrates core React concepts including components, state management, hooks, and modern development practices.

## What We'll Build

Our todo app will feature:

- **Add/Edit/Delete todos** with validation
- **Mark todos as complete** with visual feedback
- **Filter todos** by status (all, active, completed)
- **Drag and drop reordering** for better UX
- **Local storage persistence** to save data
- **Responsive design** for all devices
- **Dark/light theme toggle**
- **Keyboard shortcuts** for power users

## Project Setup

### Creating the React App

Let's start by creating a new React application using Vite for faster development:

```bash
# Create new React app with Vite
npm create vite@latest react-todo-app -- --template react
cd react-todo-app

# Install dependencies
npm install

# Install additional packages we'll need
npm install uuid date-fns clsx

# Install development dependencies
npm install -D tailwindcss postcss autoprefixer @types/uuid
npx tailwindcss init -p
```

### Configuring Tailwind CSS

Update your `tailwind.config.js`:

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      animation: {
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'bounce-in': 'bounceIn 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceIn: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
```

Update your `src/index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    scroll-behavior: smooth;
  }
  
  body {
    @apply bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200;
  }
}

@layer components {
  .btn {
    @apply px-4 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2;
  }
  
  .btn-primary {
    @apply bg-black hover:bg-gray-900 text-white focus:ring-blue-500;
  }
  
  .btn-secondary {
    @apply bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 focus:ring-gray-500;
  }
  
  .btn-danger {
    @apply bg-red-600 hover:bg-red-700 text-white focus:ring-red-500;
  }
  
  .input {
    @apply w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200;
  }
}
```

## Project Structure

Let's organize our project with a clean structure:

```
src/
├── components/
│   ├── ui/
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   └── Modal.jsx
│   ├── TodoItem.jsx
│   ├── TodoList.jsx
│   ├── TodoForm.jsx
│   ├── TodoFilters.jsx
│   └── ThemeToggle.jsx
├── hooks/
│   ├── useTodos.js
│   ├── useTheme.js
│   └── useLocalStorage.js
├── utils/
│   ├── todoHelpers.js
│   └── constants.js
├── types/
│   └── todo.js
├── App.jsx
└── main.jsx
```

## Defining Data Types

Let's start by defining our todo data structure:

```javascript
// src/types/todo.js

/**
 * Todo item structure
 * @typedef {Object} Todo
 * @property {string} id - Unique identifier
 * @property {string} text - Todo description
 * @property {boolean} completed - Completion status
 * @property {Date} createdAt - Creation timestamp
 * @property {Date} updatedAt - Last update timestamp
 * @property {string} priority - Priority level (low, medium, high)
 * @property {string} category - Optional category
 */

/**
 * Filter options for todos
 * @typedef {Object} TodoFilter
 * @property {string} status - 'all' | 'active' | 'completed'
 * @property {string} priority - 'all' | 'low' | 'medium' | 'high'
 * @property {string} category - category name or 'all'
 */

export const TODO_FILTERS = {
  STATUS: {
    ALL: 'all',
    ACTIVE: 'active',
    COMPLETED: 'completed'
  },
  PRIORITY: {
    ALL: 'all',
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high'
  }
};

export const TODO_PRIORITIES = [
  { value: 'low', label: 'Low', color: 'green' },
  { value: 'medium', label: 'Medium', color: 'yellow' },
  { value: 'high', label: 'High', color: 'red' }
];
```

## Creating UI Components

### Button Component

```jsx
// src/components/ui/Button.jsx
import { clsx } from 'clsx';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  disabled = false,
  loading = false,
  className,
  ...props 
}) => {
  const baseClasses = 'btn inline-flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    danger: 'btn-danger',
    ghost: 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  };
  
  return (
    <button
      className={clsx(
        baseClasses,
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {children}
    </button>
  );
};

export default Button;
```

### Input Component

```jsx
// src/components/ui/Input.jsx
import { clsx } from 'clsx';
import { forwardRef } from 'react';

const Input = forwardRef(({ 
  label, 
  error, 
  helpText,
  className,
  ...props 
}, ref) => {
  return (
    <div className="space-y-1">
      {label && (
        <label 
          htmlFor={props.id} 
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {label}
        </label>
      )}
      
      <input
        ref={ref}
        className={clsx(
          'input',
          error && 'border-red-500 focus:ring-red-500',
          className
        )}
        {...props}
      />
      
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      
      {helpText && !error && (
        <p className="text-sm text-gray-500 dark:text-gray-400">{helpText}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
```

## Custom Hooks

### useLocalStorage Hook

```javascript
// src/hooks/useLocalStorage.js
import { useState, useEffect } from 'react';

export const useLocalStorage = (key, initialValue) => {
  // Get value from localStorage or use initial value
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Update localStorage when state changes
  const setValue = (value) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
};
```

### useTheme Hook

```javascript
// src/hooks/useTheme.js
import { useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';

export const useTheme = () => {
  const [theme, setTheme] = useLocalStorage('theme', 'light');

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove previous theme class
    root.classList.remove('light', 'dark');
    
    // Add current theme class
    root.classList.add(theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  return { theme, setTheme, toggleTheme };
};
```

### useTodos Hook

```javascript
// src/hooks/useTodos.js
import { useState, useCallback, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { v4 as uuidv4 } from 'uuid';
import { TODO_FILTERS } from '../types/todo';

export const useTodos = () => {
  const [todos, setTodos] = useLocalStorage('todos', []);
  const [filter, setFilter] = useState({
    status: TODO_FILTERS.STATUS.ALL,
    priority: TODO_FILTERS.PRIORITY.ALL,
    category: 'all'
  });

  // Add new todo
  const addTodo = useCallback((todoData) => {
    const newTodo = {
      id: uuidv4(),
      text: todoData.text.trim(),
      completed: false,
      priority: todoData.priority || 'medium',
      category: todoData.category || 'general',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setTodos(prevTodos => [newTodo, ...prevTodos]);
    return newTodo;
  }, [setTodos]);

  // Update todo
  const updateTodo = useCallback((id, updates) => {
    setTodos(prevTodos =>
      prevTodos.map(todo =>
        todo.id === id
          ? { 
              ...todo, 
              ...updates, 
              updatedAt: new Date().toISOString() 
            }
          : todo
      )
    );
  }, [setTodos]);

  // Delete todo
  const deleteTodo = useCallback((id) => {
    setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id));
  }, [setTodos]);

  // Toggle todo completion
  const toggleTodo = useCallback((id) => {
    updateTodo(id, { 
      completed: !todos.find(todo => todo.id === id)?.completed 
    });
  }, [todos, updateTodo]);

  // Clear completed todos
  const clearCompleted = useCallback(() => {
    setTodos(prevTodos => prevTodos.filter(todo => !todo.completed));
  }, [setTodos]);

  // Filtered todos based on current filter
  const filteredTodos = useMemo(() => {
    return todos.filter(todo => {
      // Filter by status
      if (filter.status === TODO_FILTERS.STATUS.ACTIVE && todo.completed) {
        return false;
      }
      if (filter.status === TODO_FILTERS.STATUS.COMPLETED && !todo.completed) {
        return false;
      }

      // Filter by priority
      if (filter.priority !== TODO_FILTERS.PRIORITY.ALL && todo.priority !== filter.priority) {
        return false;
      }

      // Filter by category
      if (filter.category !== 'all' && todo.category !== filter.category) {
        return false;
      }

      return true;
    });
  }, [todos, filter]);

  // Statistics
  const stats = useMemo(() => {
    const total = todos.length;
    const completed = todos.filter(todo => todo.completed).length;
    const active = total - completed;
    
    return {
      total,
      completed,
      active,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  }, [todos]);

  return {
    todos: filteredTodos,
    allTodos: todos,
    filter,
    setFilter,
    stats,
    addTodo,
    updateTodo,
    deleteTodo,
    toggleTodo,
    clearCompleted
  };
};
```

## Todo Components

### TodoItem Component

```jsx
// src/components/TodoItem.jsx
import { useState } from 'react';
import { clsx } from 'clsx';
import Button from './ui/Button';
import Input from './ui/Input';
import { TODO_PRIORITIES } from '../types/todo';

const TodoItem = ({ todo, onUpdate, onDelete, onToggle }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);

  const priority = TODO_PRIORITIES.find(p => p.value === todo.priority);

  const handleEdit = () => {
    setIsEditing(true);
    setEditText(todo.text);
  };

  const handleSave = () => {
    if (editText.trim()) {
      onUpdate(todo.id, { text: editText.trim() });
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditText(todo.text);
    setIsEditing(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <div className={clsx(
      'group flex items-center space-x-3 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-all duration-200',
      'hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600',
      todo.completed && 'opacity-75'
    )}>
      {/* Checkbox */}
      <button
        onClick={() => onToggle(todo.id)}
        className={clsx(
          'flex-shrink-0 w-5 h-5 rounded border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
          todo.completed
            ? 'bg-blue-600 border-blue-600 text-white'
            : 'border-gray-300 dark:border-gray-600 hover:border-blue-500'
        )}
      >
        {todo.completed && (
          <svg className="w-3 h-3 mx-auto" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </button>

      {/* Priority Indicator */}
      <div
        className={clsx(
          'flex-shrink-0 w-3 h-3 rounded-full',
          priority?.color === 'red' && 'bg-red-500',
          priority?.color === 'yellow' && 'bg-yellow-500',
          priority?.color === 'green' && 'bg-green-500'
        )}
        title={`Priority: ${priority?.label}`}
      />

      {/* Todo Text */}
      <div className="flex-grow min-w-0">
        {isEditing ? (
          <Input
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onKeyDown={handleKeyPress}
            onBlur={handleSave}
            className="text-sm"
            autoFocus
          />
        ) : (
          <p
            className={clsx(
              'text-sm cursor-pointer transition-colors duration-200',
              todo.completed
                ? 'line-through text-gray-500 dark:text-gray-400'
                : 'text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400'
            )}
            onClick={handleEdit}
          >
            {todo.text}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex-shrink-0 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        {!isEditing && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEdit}
              className="p-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(todo.id)}
              className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default TodoItem;
```

### TodoForm Component

```jsx
// src/components/TodoForm.jsx
import { useState } from 'react';
import Button from './ui/Button';
import Input from './ui/Input';
import { TODO_PRIORITIES } from '../types/todo';

const TodoForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    text: '',
    priority: 'medium',
    category: 'general'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.text.trim()) return;

    setIsSubmitting(true);
    
    try {
      await onSubmit(formData);
      setFormData({
        text: '',
        priority: 'medium',
        category: 'general'
      });
    } catch (error) {
      console.error('Error adding todo:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex space-x-3">
        <div className="flex-grow">
          <Input
            type="text"
            value={formData.text}
            onChange={(e) => handleInputChange('text', e.target.value)}
            placeholder="What needs to be done?"
            className="text-lg"
            disabled={isSubmitting}
          />
        </div>
        
        <Button
          type="submit"
          loading={isSubmitting}
          disabled={!formData.text.trim()}
          className="px-6"
        >
          Add Todo
        </Button>
      </div>

      <div className="flex space-x-3">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Priority
          </label>
          <select
            value={formData.priority}
            onChange={(e) => handleInputChange('priority', e.target.value)}
            className="input text-sm"
            disabled={isSubmitting}
          >
            {TODO_PRIORITIES.map(priority => (
              <option key={priority.value} value={priority.value}>
                {priority.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Category
          </label>
          <input
            type="text"
            value={formData.category}
            onChange={(e) => handleInputChange('category', e.target.value)}
            placeholder="general"
            className="input text-sm"
            disabled={isSubmitting}
          />
        </div>
      </div>
    </form>
  );
};

export default TodoForm;
```

## Main App Component

```jsx
// src/App.jsx
import { useTodos } from './hooks/useTodos';
import { useTheme } from './hooks/useTheme';
import TodoForm from './components/TodoForm';
import TodoItem from './components/TodoItem';
import Button from './components/ui/Button';

function App() {
  const { 
    todos, 
    stats, 
    addTodo, 
    updateTodo, 
    deleteTodo, 
    toggleTodo,
    clearCompleted 
  } = useTodos();
  
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
              Todo App
            </h1>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="p-2"
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )}
            </Button>
          </div>
          
          {/* Stats */}
          <div className="flex justify-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
            <span>Total: {stats.total}</span>
            <span>Active: {stats.active}</span>
            <span>Completed: {stats.completed}</span>
            <span>Progress: {stats.completionRate}%</span>
          </div>
        </header>

        {/* Todo Form */}
        <div className="mb-8">
          <TodoForm onSubmit={addTodo} />
        </div>

        {/* Todo List */}
        <div className="space-y-3">
          {todos.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              <p className="text-gray-500 dark:text-gray-400">No todos yet. Add one above to get started!</p>
            </div>
          ) : (
            todos.map(todo => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onUpdate={updateTodo}
                onDelete={deleteTodo}
                onToggle={toggleTodo}
              />
            ))
          )}
        </div>

        {/* Actions */}
        {stats.completed > 0 && (
          <div className="mt-6 text-center">
            <Button
              variant="secondary"
              onClick={clearCompleted}
              className="text-sm"
            >
              Clear Completed ({stats.completed})
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
```

## Testing Our App

Let's test our basic todo functionality:

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Test basic functionality**:
   - Add new todos with different priorities
   - Toggle completion status
   - Edit todos by clicking on them
   - Delete todos using the delete button
   - Test theme toggle

3. **Check responsive design**:
   - Test on mobile and desktop viewports
   - Verify touch targets are appropriately sized
   - Ensure text is readable at all sizes

## What's Next?

In **Part 2**, we'll add:

- **Advanced filtering and search** functionality
- **Drag and drop reordering** for todos
- **Categories and tags** system
- **Keyboard shortcuts** for power users
- **Animations and transitions** for better UX

## Key Takeaways

- **Custom hooks** help separate logic from UI components
- **Compound components** make complex UIs more manageable
- **Local storage** provides simple data persistence
- **Accessibility** should be considered from the start
- **TypeScript** (or prop types) help catch errors early

## Homework

Before Part 2:

1. **Add validation** to prevent empty todos
2. **Implement keyboard shortcuts** (Ctrl+Enter to add, Escape to cancel edit)
3. **Add todo timestamps** to show when items were created
4. **Experiment with animations** using CSS or Framer Motion

Ready for Part 2? We'll add advanced features and make our todo app truly powerful!