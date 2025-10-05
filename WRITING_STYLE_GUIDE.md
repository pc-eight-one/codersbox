# Writing Style Guide for CodersBox

*Inspired by "The C Programming Language" by Kernighan and Ritchie*

## Core Principles

1. **Be Direct** - Say what you mean. Skip the preamble.
2. **Trust the Reader** - They're smart. Don't over-explain.
3. **Code First, Comments Later** - Let code be self-explanatory. Use prose for context.
4. **Show, Don't Tell** - Demonstrate with examples, not lengthy descriptions.

## What to Avoid

### ❌ Excessive Marketing Language
**Bad:**
> "This comprehensive guide will take you on a journey through the powerful world of ThreadLocal, exploring its numerous use cases and diving deep into..."

**Good:**
> "ThreadLocal gives each thread its own copy of a variable. Here's how to use it in Spring Boot."

### ❌ Over-Commented Code
**Bad:**
```java
// Create a new user context filter
@Component
@Order(1) // Execute this filter first
public class UserContextFilter extends OncePerRequestFilter {

    // Inject the user service
    @Autowired
    private UserService userService;

    // Override the doFilterInternal method
    @Override
    protected void doFilterInternal(...) {
        try {
            // Extract the username from the request
            String username = extractUsername(request);
            // Load the user details from the database
            UserDetails user = userService.loadUserByUsername(username);
            // Set the user in ThreadLocal storage
            UserContext.setCurrentUser(user);
            // Continue the filter chain
            filterChain.doFilter(request, response);
        } finally {
            // CRITICAL: Clean up ThreadLocal to prevent memory leaks
            UserContext.clear();
        }
    }
}
```

**Good:**
```java
@Component
@Order(1)
public class UserContextFilter extends OncePerRequestFilter {

    @Autowired
    private UserService userService;

    @Override
    protected void doFilterInternal(...) {
        try {
            String username = extractUsername(request);
            UserDetails user = userService.loadUserByUsername(username);
            UserContext.setCurrentUser(user);
            filterChain.doFilter(request, response);
        } finally {
            UserContext.clear();
        }
    }
}
```

With explanatory prose:
> "A filter sets the user at the start of each request. The finally block ensures cleanup—without it, you leak memory."

### ❌ Bullet-Point Lists Everywhere
**Bad:**
> **Benefits of this approach:**
> - ✅ Clean code without parameter drilling
> - ✅ Works across all layers
> - ✅ Easy to test
> - ✅ Thread-safe by design
> - ✅ No dependency on web layer

**Good:**
> "This keeps methods clean—no user parameter in every signature. It works in any layer and stays thread-safe."

### ❌ Redundant Section Headers
**Bad:**
```markdown
### The Problem
### The Challenge
### Why This Matters
### The Solution
### Implementation
### How to Implement
```

**Good:**
Pick ONE that fits. Usually just show the code with a brief introduction.

## What to Do Instead

### ✅ Write Like K&R

**Example from "The C Programming Language":**
> "The model of input and output supported by the standard library is very simple. Text input or output, regardless of where it originates or where it goes to, is dealt with as streams of characters."

**Our equivalent:**
> "ThreadLocal stores per-thread copies of a variable. Each thread sees its own value, independent of others."

### ✅ Let Code Breathe

Don't explain what the code obviously does. Explain WHY and WHEN to use it:

```java
public static void clear() {
    currentUser.remove();
}
```

**Don't say:** "This method removes the current user from the ThreadLocal storage variable"
**Do say:** "Call `clear()` in a finally block. Otherwise you leak memory in thread pools."

### ✅ Use Prose for Context, Not Description

**Bad:**
> "The following code snippet demonstrates how to implement a UserContext class that uses ThreadLocal to store user information in a thread-safe manner, ensuring that each thread has its own isolated copy of the user data..."

**Good:**
> "Store the current user in a ThreadLocal:"

### ✅ One Concept, One Example

Show the simplest working code first. Add complexity only when needed:

```java
// Start simple
private static ThreadLocal<String> user = new ThreadLocal<>();

// Then show the real version
private static ThreadLocal<UserDetails> user = new ThreadLocal<>();
```

### ✅ Be Honest About Pitfalls

**Bad:**
> "⚠️ CRITICAL WARNING: It is absolutely essential and of paramount importance that you MUST ALWAYS remember to clean up ThreadLocal variables..."

**Good:**
> "Forget to call `clear()` and you leak memory. In Tomcat's thread pool, this kills your application."

## Code Comment Guidelines

### When to Comment

1. **Non-obvious algorithms** - "Uses Knuth's algorithm for..."
2. **Important gotchas** - "Must be called before initialization"
3. **Performance notes** - "O(n) - consider caching for large lists"
4. **Temporary workarounds** - "TODO: Remove after JIRA-123 is fixed"

### When NOT to Comment

1. **What the code does** - Let the code speak
2. **Parameter types** - They're in the signature
3. **Return values** - Use good names instead
4. **Obvious patterns** - `@Override`, `@Autowired`, etc.

## Structure Guidelines

### Introduction (2-3 sentences)
State the problem and hint at the solution. No fluff.

### Core Content
- Start with the simplest example
- Build complexity gradually
- Use prose between code blocks, not inside them
- One section = one idea

### Examples
- Short and focused
- No "real-world" scenarios that aren't real
- Prefer snippets over full applications

### Conclusion (optional)
- Summary if the article is long
- Next steps if applicable
- Skip it if the article is clear without it

## Tone

- **Confident, not arrogant** - "This solves X" not "This is the ultimate solution"
- **Helpful, not condescending** - "Here's how" not "You should obviously"
- **Direct, not cold** - Friendly but efficient
- **Honest, not dramatic** - "This can leak memory" not "THIS WILL DESTROY YOUR APPLICATION"

## Testing Your Writing

Ask yourself:
1. Can I cut this sentence without losing meaning? → Cut it
2. Would K&R write this? → Probably simplify it
3. Does this comment just repeat the code? → Delete it
4. Am I explaining the obvious? → Trust the reader

## Examples of Good Writing

### From "The C Programming Language"
> "The first program to write is the same for all languages: print the words 'hello, world'."

### Our equivalent
> "The first ThreadLocal example stores a string. Later we'll store complex objects."

---

**Remember:** Readers came to learn, not to be entertained. Give them the information, give it clearly, and get out of their way.
