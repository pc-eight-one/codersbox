---
title: "Build a Portfolio Website - Part 1: Planning and Setup"
description: "Start building your developer portfolio from scratch. Learn planning, setup, and project structure in this comprehensive tutorial series."
publishDate: 2025-01-12
tags: ["HTML", "CSS", "Portfolio", "Web Development"]
difficulty: "beginner"
series: "Portfolio Website"
part: 1
estimatedTime: "45 minutes"
totalParts: 5
featured: true
---

# Build a Portfolio Website - Part 1: Planning and Setup

Welcome to this comprehensive tutorial series where we'll build a professional developer portfolio website from scratch! In this first part, we'll plan our project, set up our development environment, and create the basic structure.

## What We'll Build

By the end of this series, you'll have a fully functional portfolio website featuring:

- **Responsive design** that works on all devices
- **Project showcase** with detailed case studies
- **About section** highlighting your skills and experience
- **Contact form** for potential clients or employers
- **Blog section** to share your thoughts and expertise
- **Dark/light theme toggle**
- **Smooth animations** and modern UI/UX

## Planning Our Portfolio

### Target Audience

Before we start coding, let's identify who will visit your portfolio:

- **Potential employers** looking to hire developers
- **Clients** seeking freelance services
- **Fellow developers** in your network
- **Recruiters** searching for talent

### Essential Sections

Based on our target audience, our portfolio needs these key sections:

1. **Hero Section** - First impression with your name and headline
2. **About** - Your story, skills, and what makes you unique
3. **Projects** - Showcase of your best work
4. **Experience** - Professional background and achievements
5. **Skills** - Technical abilities and tools you use
6. **Contact** - How people can reach you
7. **Blog** (optional) - Thoughts and tutorials

### Design Principles

We'll follow these design principles:

- **Clean and minimal** - Let your work speak for itself
- **Fast loading** - Optimize for performance
- **Accessible** - Usable by everyone
- **Mobile-first** - Most visitors will be on mobile
- **Professional** - Reflects your attention to detail

## Setting Up Our Development Environment

### Required Tools

Make sure you have these tools installed:

1. **Code Editor** - VS Code (recommended)
2. **Web Browser** - Chrome or Firefox for testing
3. **Version Control** - Git for tracking changes

### VS Code Extensions

Install these helpful extensions:

- **Live Server** - For local development server
- **Prettier** - Code formatting
- **Auto Rename Tag** - Automatically rename paired HTML tags
- **Color Highlight** - Visualize colors in CSS
- **HTML CSS Support** - Better CSS support in HTML

### Project Structure

Let's create our project structure:

```
portfolio/
├── index.html
├── css/
│   ├── styles.css
│   ├── components/
│   │   ├── header.css
│   │   ├── hero.css
│   │   ├── about.css
│   │   ├── projects.css
│   │   ├── contact.css
│   │   └── footer.css
│   └── utils/
│       ├── variables.css
│       ├── reset.css
│       └── utilities.css
├── js/
│   ├── main.js
│   ├── components/
│   │   ├── navigation.js
│   │   ├── theme-toggle.js
│   │   └── smooth-scroll.js
│   └── utils/
│       └── helpers.js
├── images/
│   ├── profile/
│   ├── projects/
│   └── icons/
└── assets/
    ├── resume.pdf
    └── favicon.ico
```

## Creating Our Base HTML Structure

Let's start with a semantic HTML5 structure:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="John Doe - Full Stack Developer Portfolio">
    <title>John Doe | Full Stack Developer</title>
    
    <!-- Preconnect to external domains -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    
    <!-- CSS -->
    <link rel="stylesheet" href="css/utils/reset.css">
    <link rel="stylesheet" href="css/utils/variables.css">
    <link rel="stylesheet" href="css/styles.css">
    
    <!-- Favicon -->
    <link rel="icon" type="image/x-icon" href="assets/favicon.ico">
</head>
<body>
    <!-- Skip to main content for accessibility -->
    <a href="#main" class="skip-link">Skip to main content</a>
    
    <!-- Header -->
    <header class="header">
        <nav class="nav">
            <a href="#home" class="nav__logo">John Doe</a>
            
            <ul class="nav__menu">
                <li><a href="#about" class="nav__link">About</a></li>
                <li><a href="#projects" class="nav__link">Projects</a></li>
                <li><a href="#experience" class="nav__link">Experience</a></li>
                <li><a href="#contact" class="nav__link">Contact</a></li>
            </ul>
            
            <div class="nav__actions">
                <button class="theme-toggle" aria-label="Toggle dark mode">
                    <span class="theme-toggle__icon"></span>
                </button>
                <button class="nav__toggle" aria-label="Toggle navigation menu">
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
            </div>
        </nav>
    </header>

    <!-- Main Content -->
    <main id="main" class="main">
        <!-- Hero Section -->
        <section id="home" class="hero">
            <div class="container">
                <div class="hero__content">
                    <h1 class="hero__title">
                        Hi, I'm <span class="hero__name">John Doe</span>
                    </h1>
                    <p class="hero__subtitle">Full Stack Developer</p>
                    <p class="hero__description">
                        I build exceptional digital experiences that combine 
                        beautiful design with robust functionality.
                    </p>
                    <div class="hero__actions">
                        <a href="#projects" class="btn btn--primary">View My Work</a>
                        <a href="#contact" class="btn btn--secondary">Get In Touch</a>
                    </div>
                </div>
                <div class="hero__image">
                    <img src="images/profile/hero-image.jpg" alt="John Doe" loading="lazy">
                </div>
            </div>
        </section>

        <!-- About Section -->
        <section id="about" class="about">
            <div class="container">
                <h2 class="section__title">About Me</h2>
                <!-- Content will be added in Part 2 -->
            </div>
        </section>

        <!-- Projects Section -->
        <section id="projects" class="projects">
            <div class="container">
                <h2 class="section__title">Featured Projects</h2>
                <!-- Content will be added in Part 3 -->
            </div>
        </section>

        <!-- Experience Section -->
        <section id="experience" class="experience">
            <div class="container">
                <h2 class="section__title">Experience</h2>
                <!-- Content will be added in Part 4 -->
            </div>
        </section>

        <!-- Contact Section -->
        <section id="contact" class="contact">
            <div class="container">
                <h2 class="section__title">Let's Work Together</h2>
                <!-- Content will be added in Part 5 -->
            </div>
        </section>
    </main>

    <!-- Footer -->
    <footer class="footer">
        <div class="container">
            <p>&copy; 2025 John Doe. All rights reserved.</p>
            <div class="footer__social">
                <a href="https://github.com/johndoe" target="_blank" rel="noopener noreferrer">GitHub</a>
                <a href="https://linkedin.com/in/johndoe" target="_blank" rel="noopener noreferrer">LinkedIn</a>
                <a href="https://twitter.com/johndoe" target="_blank" rel="noopener noreferrer">Twitter</a>
            </div>
        </div>
    </footer>

    <!-- JavaScript -->
    <script src="js/main.js"></script>
</body>
</html>
```

## Setting Up CSS Foundation

### CSS Reset (css/utils/reset.css)

```css
/* Modern CSS Reset */
*, *::before, *::after {
    box-sizing: border-box;
}

* {
    margin: 0;
    padding: 0;
}

html {
    scroll-behavior: smooth;
}

body {
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}

img, picture, video, canvas, svg {
    display: block;
    max-width: 100%;
}

input, button, textarea, select {
    font: inherit;
}

button {
    border: none;
    background: none;
    cursor: pointer;
}

a {
    text-decoration: none;
    color: inherit;
}

ul, ol {
    list-style: none;
}

/* Accessibility */
.skip-link {
    position: absolute;
    top: -40px;
    left: 6px;
    background: var(--color-primary);
    color: white;
    padding: 8px;
    text-decoration: none;
    border-radius: 0 0 4px 4px;
    z-index: 1000;
}

.skip-link:focus {
    top: 0;
}

/* Reduce motion for users who prefer it */
@media (prefers-reduced-motion: reduce) {
    html {
        scroll-behavior: auto;
    }
    
    *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
    }
}
```

### CSS Variables (css/utils/variables.css)

```css
:root {
    /* Colors */
    --color-primary: #3b82f6;
    --color-primary-dark: #1e40af;
    --color-secondary: #64748b;
    --color-accent: #f59e0b;
    
    /* Neutral Colors */
    --color-white: #ffffff;
    --color-gray-50: #f8fafc;
    --color-gray-100: #f1f5f9;
    --color-gray-200: #e2e8f0;
    --color-gray-300: #cbd5e1;
    --color-gray-400: #94a3b8;
    --color-gray-500: #64748b;
    --color-gray-600: #475569;
    --color-gray-700: #334155;
    --color-gray-800: #1e293b;
    --color-gray-900: #0f172a;
    
    /* Text Colors */
    --color-text-primary: var(--color-gray-900);
    --color-text-secondary: var(--color-gray-600);
    --color-text-muted: var(--color-gray-500);
    
    /* Background Colors */
    --color-bg-primary: var(--color-white);
    --color-bg-secondary: var(--color-gray-50);
    
    /* Typography */
    --font-family-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    --font-size-xs: 0.75rem;
    --font-size-sm: 0.875rem;
    --font-size-base: 1rem;
    --font-size-lg: 1.125rem;
    --font-size-xl: 1.25rem;
    --font-size-2xl: 1.5rem;
    --font-size-3xl: 1.875rem;
    --font-size-4xl: 2.25rem;
    --font-size-5xl: 3rem;
    
    /* Spacing */
    --spacing-xs: 0.5rem;
    --spacing-sm: 0.75rem;
    --spacing-md: 1rem;
    --spacing-lg: 1.5rem;
    --spacing-xl: 2rem;
    --spacing-2xl: 3rem;
    --spacing-3xl: 4rem;
    
    /* Layout */
    --container-max-width: 1200px;
    --container-padding: var(--spacing-md);
    
    /* Shadows */
    --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    
    /* Border Radius */
    --radius-sm: 0.25rem;
    --radius-md: 0.5rem;
    --radius-lg: 0.75rem;
    --radius-xl: 1rem;
    
    /* Transitions */
    --transition-fast: 150ms ease-out;
    --transition-normal: 250ms ease-out;
    --transition-slow: 350ms ease-out;
    
    /* Z-index */
    --z-dropdown: 100;
    --z-modal: 200;
    --z-header: 300;
}

/* Dark mode variables */
[data-theme="dark"] {
    --color-text-primary: var(--color-gray-100);
    --color-text-secondary: var(--color-gray-300);
    --color-text-muted: var(--color-gray-400);
    
    --color-bg-primary: var(--color-gray-900);
    --color-bg-secondary: var(--color-gray-800);
}
```

## Basic JavaScript Setup

Let's create a basic JavaScript foundation:

```javascript
// js/main.js
document.addEventListener('DOMContentLoaded', function() {
    console.log('Portfolio loaded successfully!');
    
    // Initialize components
    initNavigation();
    initThemeToggle();
    initSmoothScrolling();
});

function initNavigation() {
    const navToggle = document.querySelector('.nav__toggle');
    const navMenu = document.querySelector('.nav__menu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('nav__menu--open');
            navToggle.classList.toggle('nav__toggle--open');
        });
    }
}

function initThemeToggle() {
    const themeToggle = document.querySelector('.theme-toggle');
    const currentTheme = localStorage.getItem('theme') || 'light';
    
    // Set initial theme
    document.documentElement.setAttribute('data-theme', currentTheme);
    
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }
}

function initSmoothScrolling() {
    const navLinks = document.querySelectorAll('.nav__link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Close mobile menu if open
                const navMenu = document.querySelector('.nav__menu');
                const navToggle = document.querySelector('.nav__toggle');
                
                if (navMenu.classList.contains('nav__menu--open')) {
                    navMenu.classList.remove('nav__menu--open');
                    navToggle.classList.remove('nav__toggle--open');
                }
            }
        });
    });
}
```

## Testing Our Setup

Now let's test our basic setup:

1. **Create the project folder** and add all the files
2. **Open with Live Server** in VS Code
3. **Test responsive design** by resizing the browser
4. **Check accessibility** using browser dev tools
5. **Verify smooth scrolling** between sections

## What's Next?

In **Part 2**, we'll:

- Style our hero section with modern CSS
- Create responsive navigation
- Add beautiful typography
- Implement the theme toggle functionality
- Add smooth animations and transitions

## Key Takeaways

- **Planning is crucial** - Know your audience and goals
- **Semantic HTML** improves accessibility and SEO
- **CSS custom properties** make theming easier
- **Mobile-first approach** ensures responsive design
- **Performance matters** - optimize from the start

## Homework

Before the next tutorial:

1. **Customize the content** with your own information
2. **Add your profile image** to the images folder
3. **Think about your color scheme** - what represents you?
4. **Gather your project screenshots** for the projects section

Ready to continue? Check out **Part 2** where we'll bring our portfolio to life with stunning styles and animations!