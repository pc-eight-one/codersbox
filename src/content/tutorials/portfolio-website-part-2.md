---
title: "Build a Portfolio Website - Part 2: Styling and Layout"
description: "Create beautiful, responsive styles for your portfolio website. Learn modern CSS techniques, animations, and responsive design."
publishDate: 2025-01-13
tags: ["CSS", "Responsive Design", "Animation", "Web Development"]
difficulty: "beginner"
series: "Portfolio Website"
part: 2
estimatedTime: "60 minutes"
totalParts: 5
featured: false
---

# Build a Portfolio Website - Part 2: Styling and Layout

Welcome back! In Part 1, we set up our project structure and created the HTML foundation. Now it's time to bring our portfolio to life with modern CSS styling, responsive design, and smooth animations.

## What We'll Cover

- Modern CSS layout techniques
- Responsive navigation with mobile menu
- Hero section styling with animations
- Typography and color schemes
- CSS Grid and Flexbox
- Dark mode implementation

## Setting Up Our Main Stylesheet

Let's start by creating our main CSS file:

```css
/* css/styles.css */

/* Import component styles */
@import url('components/header.css');
@import url('components/hero.css');
@import url('components/about.css');
@import url('components/projects.css');
@import url('components/contact.css');
@import url('components/footer.css');
@import url('utils/utilities.css');

/* Base Styles */
body {
    font-family: var(--font-family-primary);
    font-size: var(--font-size-base);
    line-height: 1.6;
    color: var(--color-text-primary);
    background-color: var(--color-bg-primary);
    transition: background-color var(--transition-normal);
}

/* Container */
.container {
    max-width: var(--container-max-width);
    margin: 0 auto;
    padding: 0 var(--container-padding);
}

@media (min-width: 768px) {
    .container {
        padding: 0 var(--spacing-xl);
    }
}

/* Section Spacing */
section {
    padding: var(--spacing-3xl) 0;
}

@media (min-width: 768px) {
    section {
        padding: 5rem 0;
    }
}

/* Section Titles */
.section__title {
    font-size: var(--font-size-3xl);
    font-weight: 700;
    text-align: center;
    margin-bottom: var(--spacing-3xl);
    color: var(--color-text-primary);
    position: relative;
}

.section__title::after {
    content: '';
    position: absolute;
    bottom: -var(--spacing-md);
    left: 50%;
    transform: translateX(-50%);
    width: 4rem;
    height: 0.25rem;
    background: linear-gradient(90deg, var(--color-primary), var(--color-accent));
    border-radius: var(--radius-sm);
}

@media (min-width: 768px) {
    .section__title {
        font-size: var(--font-size-4xl);
    }
}
```

## Creating the Header and Navigation

Let's style our responsive navigation:

```css
/* css/components/header.css */

.header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid var(--color-gray-200);
    z-index: var(--z-header);
    transition: all var(--transition-normal);
}

[data-theme="dark"] .header {
    background: rgba(15, 23, 42, 0.95);
    border-bottom-color: var(--color-gray-700);
}

.nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--spacing-md) 0;
    min-height: 4rem;
}

.nav__logo {
    font-size: var(--font-size-xl);
    font-weight: 700;
    color: var(--color-primary);
    transition: color var(--transition-fast);
}

.nav__logo:hover {
    color: var(--color-primary-dark);
}

.nav__menu {
    display: none;
    align-items: center;
    gap: var(--spacing-xl);
}

@media (min-width: 768px) {
    .nav__menu {
        display: flex;
    }
}

.nav__menu--open {
    display: flex;
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    flex-direction: column;
    background: var(--color-bg-primary);
    border-bottom: 1px solid var(--color-gray-200);
    padding: var(--spacing-lg);
    gap: var(--spacing-lg);
    box-shadow: var(--shadow-lg);
}

[data-theme="dark"] .nav__menu--open {
    border-bottom-color: var(--color-gray-700);
}

.nav__link {
    position: relative;
    font-weight: 500;
    color: var(--color-text-secondary);
    transition: color var(--transition-fast);
    padding: var(--spacing-xs) 0;
}

.nav__link:hover {
    color: var(--color-primary);
}

.nav__link::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 0;
    height: 2px;
    background: var(--color-primary);
    transition: width var(--transition-normal);
}

.nav__link:hover::after {
    width: 100%;
}

.nav__actions {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
}

/* Theme Toggle */
.theme-toggle {
    position: relative;
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
    background: var(--color-gray-100);
    border: 2px solid var(--color-gray-200);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all var(--transition-normal);
}

.theme-toggle:hover {
    background: var(--color-gray-200);
    transform: scale(1.05);
}

.theme-toggle__icon {
    position: relative;
    width: 1rem;
    height: 1rem;
    border-radius: 50%;
    background: var(--color-accent);
    transition: all var(--transition-normal);
}

.theme-toggle__icon::before {
    content: '';
    position: absolute;
    top: -0.25rem;
    left: -0.25rem;
    width: 1.5rem;
    height: 1.5rem;
    border: 2px solid var(--color-accent);
    border-radius: 50%;
    clip-path: polygon(0 0, 50% 0, 50% 100%, 0 100%);
    transition: all var(--transition-normal);
}

[data-theme="dark"] .theme-toggle {
    background: var(--color-gray-700);
    border-color: var(--color-gray-600);
}

[data-theme="dark"] .theme-toggle__icon::before {
    clip-path: polygon(50% 0, 100% 0, 100% 100%, 50% 100%);
}

/* Mobile Menu Toggle */
.nav__toggle {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    width: 1.5rem;
    height: 1.5rem;
    justify-content: center;
}

@media (min-width: 768px) {
    .nav__toggle {
        display: none;
    }
}

.nav__toggle span {
    width: 100%;
    height: 2px;
    background: var(--color-text-primary);
    border-radius: 2px;
    transition: all var(--transition-normal);
    transform-origin: center;
}

.nav__toggle--open span:nth-child(1) {
    transform: rotate(45deg) translate(0.375rem, 0.375rem);
}

.nav__toggle--open span:nth-child(2) {
    opacity: 0;
}

.nav__toggle--open span:nth-child(3) {
    transform: rotate(-45deg) translate(0.375rem, -0.375rem);
}
```

## Styling the Hero Section

Now let's create an impressive hero section:

```css
/* css/components/hero.css */

.hero {
    min-height: 100vh;
    display: flex;
    align-items: center;
    position: relative;
    overflow: hidden;
    background: linear-gradient(135deg, var(--color-bg-primary) 0%, var(--color-gray-50) 100%);
}

[data-theme="dark"] .hero {
    background: linear-gradient(135deg, var(--color-gray-900) 0%, var(--color-gray-800) 100%);
}

.hero::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
        radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(245, 158, 11, 0.1) 0%, transparent 50%);
    pointer-events: none;
}

.hero .container {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--spacing-3xl);
    align-items: center;
    position: relative;
    z-index: 1;
}

@media (min-width: 768px) {
    .hero .container {
        grid-template-columns: 1fr 1fr;
        gap: var(--spacing-3xl);
    }
}

.hero__content {
    text-align: center;
    animation: slideInLeft 1s ease-out;
}

@media (min-width: 768px) {
    .hero__content {
        text-align: left;
    }
}

.hero__title {
    font-size: var(--font-size-3xl);
    font-weight: 800;
    line-height: 1.2;
    margin-bottom: var(--spacing-md);
    color: var(--color-text-primary);
}

@media (min-width: 768px) {
    .hero__title {
        font-size: var(--font-size-5xl);
    }
}

.hero__name {
    background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    position: relative;
}

.hero__subtitle {
    font-size: var(--font-size-xl);
    font-weight: 600;
    color: var(--color-primary);
    margin-bottom: var(--spacing-lg);
    position: relative;
}

@media (min-width: 768px) {
    .hero__subtitle {
        font-size: var(--font-size-2xl);
    }
}

.hero__subtitle::after {
    content: '';
    position: absolute;
    bottom: -0.5rem;
    left: 50%;
    transform: translateX(-50%);
    width: 3rem;
    height: 0.125rem;
    background: var(--color-accent);
    border-radius: 2px;
}

@media (min-width: 768px) {
    .hero__subtitle::after {
        left: 0;
        transform: none;
    }
}

.hero__description {
    font-size: var(--font-size-lg);
    color: var(--color-text-secondary);
    margin-bottom: var(--spacing-xl);
    max-width: 500px;
    margin-left: auto;
    margin-right: auto;
}

@media (min-width: 768px) {
    .hero__description {
        margin-left: 0;
        margin-right: 0;
    }
}

.hero__actions {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
    align-items: center;
}

@media (min-width: 480px) {
    .hero__actions {
        flex-direction: row;
        justify-content: center;
    }
}

@media (min-width: 768px) {
    .hero__actions {
        justify-content: flex-start;
    }
}

.hero__image {
    position: relative;
    animation: slideInRight 1s ease-out;
}

.hero__image img {
    width: 100%;
    max-width: 400px;
    height: auto;
    border-radius: var(--radius-xl);
    box-shadow: var(--shadow-lg);
    margin: 0 auto;
    display: block;
}

.hero__image::before {
    content: '';
    position: absolute;
    top: -1rem;
    left: -1rem;
    right: 1rem;
    bottom: 1rem;
    background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
    border-radius: var(--radius-xl);
    z-index: -1;
    opacity: 0.2;
}

/* Animations */
@keyframes slideInLeft {
    from {
        opacity: 0;
        transform: translateX(-2rem);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}

@keyframes slideInRight {
    from {
        opacity: 0;
        transform: translateX(2rem);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(2rem);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Disable animations for users who prefer reduced motion */
@media (prefers-reduced-motion: reduce) {
    .hero__content,
    .hero__image {
        animation: none;
    }
}
```

## Creating Button Components

Let's add stylish button components:

```css
/* css/utils/utilities.css */

/* Button Styles */
.btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: var(--spacing-sm) var(--spacing-xl);
    font-size: var(--font-size-base);
    font-weight: 600;
    text-decoration: none;
    border-radius: var(--radius-lg);
    border: 2px solid transparent;
    cursor: pointer;
    transition: all var(--transition-normal);
    position: relative;
    overflow: hidden;
    min-width: 140px;
}

.btn:focus {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
}

.btn--primary {
    background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
    color: white;
    box-shadow: var(--shadow-md);
}

.btn--primary:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
}

.btn--primary:active {
    transform: translateY(0);
}

.btn--secondary {
    background: transparent;
    color: var(--color-primary);
    border-color: var(--color-primary);
}

.btn--secondary:hover {
    background: var(--color-primary);
    color: white;
    transform: translateY(-2px);
}

/* Card Styles */
.card {
    background: var(--color-bg-primary);
    border-radius: var(--radius-lg);
    padding: var(--spacing-xl);
    box-shadow: var(--shadow-sm);
    border: 1px solid var(--color-gray-200);
    transition: all var(--transition-normal);
}

.card:hover {
    box-shadow: var(--shadow-lg);
    transform: translateY(-4px);
}

[data-theme="dark"] .card {
    border-color: var(--color-gray-700);
}

/* Utility Classes */
.text-center { text-align: center; }
.text-left { text-align: left; }
.text-right { text-align: right; }

.sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
}

/* Responsive Utilities */
@media (max-width: 767px) {
    .hide-mobile { display: none !important; }
}

@media (min-width: 768px) {
    .hide-desktop { display: none !important; }
}

/* Focus Styles */
.focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
}

/* Loading States */
.loading {
    opacity: 0.6;
    pointer-events: none;
}

.loading::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 1rem;
    height: 1rem;
    margin: -0.5rem 0 0 -0.5rem;
    border: 2px solid transparent;
    border-top-color: currentColor;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}
```

## Enhanced JavaScript for Smooth Interactions

Let's improve our JavaScript with better interactions:

```javascript
// js/main.js (enhanced version)
document.addEventListener('DOMContentLoaded', function() {
    console.log('Portfolio loaded successfully!');
    
    // Initialize components
    initNavigation();
    initThemeToggle();
    initSmoothScrolling();
    initScrollEffects();
    initLazyLoading();
});

function initNavigation() {
    const navToggle = document.querySelector('.nav__toggle');
    const navMenu = document.querySelector('.nav__menu');
    const navLinks = document.querySelectorAll('.nav__link');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            const isOpen = navMenu.classList.contains('nav__menu--open');
            
            if (isOpen) {
                closeMenu();
            } else {
                openMenu();
            }
        });
        
        // Close menu when clicking on a link
        navLinks.forEach(link => {
            link.addEventListener('click', closeMenu);
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
                closeMenu();
            }
        });
    }
    
    function openMenu() {
        navMenu.classList.add('nav__menu--open');
        navToggle.classList.add('nav__toggle--open');
        navToggle.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
    }
    
    function closeMenu() {
        navMenu.classList.remove('nav__menu--open');
        navToggle.classList.remove('nav__toggle--open');
        navToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    }
}

function initThemeToggle() {
    const themeToggle = document.querySelector('.theme-toggle');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Get saved theme or use system preference
    let currentTheme = localStorage.getItem('theme');
    if (!currentTheme) {
        currentTheme = prefersDark.matches ? 'dark' : 'light';
    }
    
    // Set initial theme
    setTheme(currentTheme);
    
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            setTheme(newTheme);
        });
    }
    
    // Listen for system theme changes
    prefersDark.addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            setTheme(e.matches ? 'dark' : 'light');
        }
    });
    
    function setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        
        // Update theme toggle aria-label
        if (themeToggle) {
            themeToggle.setAttribute('aria-label', 
                `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`
            );
        }
    }
}

function initSmoothScrolling() {
    const navLinks = document.querySelectorAll('a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetSection.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Update URL without causing scroll
                history.pushState(null, null, targetId);
            }
        });
    });
}

function initScrollEffects() {
    const header = document.querySelector('.header');
    let lastScrollY = window.scrollY;
    
    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        
        // Header background opacity based on scroll
        if (currentScrollY > 50) {
            header.style.background = header.style.background.replace('0.95', '0.98');
        } else {
            header.style.background = header.style.background.replace('0.98', '0.95');
        }
        
        // Hide/show header on scroll direction change
        if (currentScrollY > lastScrollY && currentScrollY > 100) {
            header.style.transform = 'translateY(-100%)';
        } else {
            header.style.transform = 'translateY(0)';
        }
        
        lastScrollY = currentScrollY;
    });
}

function initLazyLoading() {
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    observer.unobserve(img);
                }
            });
        });
        
        const lazyImages = document.querySelectorAll('img[data-src]');
        lazyImages.forEach(img => imageObserver.observe(img));
    }
}

// Add scroll reveal animation
function addScrollReveal() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    const elementsToReveal = document.querySelectorAll('.reveal');
    elementsToReveal.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// Initialize scroll reveal after DOM is loaded
document.addEventListener('DOMContentLoaded', addScrollReveal);
```

## Testing Our Styles

Now let's test our responsive design:

1. **Desktop View** (1200px+)
   - Navigation should be horizontal
   - Hero section should be side-by-side layout
   - All animations should work smoothly

2. **Tablet View** (768px - 1199px)
   - Navigation remains horizontal
   - Hero section adapts with proper spacing
   - Typography scales appropriately

3. **Mobile View** (< 768px)
   - Navigation becomes hamburger menu
   - Hero section stacks vertically
   - Touch targets are at least 44px

## Performance Optimizations

### CSS Optimizations

1. **Use CSS custom properties** for consistent theming
2. **Minimize repaints** by using transform instead of changing layout properties
3. **Use will-change** sparingly for animations
4. **Optimize font loading** with font-display: swap

### JavaScript Optimizations

1. **Debounce scroll events** for better performance
2. **Use passive event listeners** where possible
3. **Implement intersection observer** for scroll-triggered animations
4. **Lazy load images** below the fold

## Accessibility Improvements

1. **Focus management** for mobile menu
2. **ARIA labels** for interactive elements
3. **Reduced motion** support
4. **Color contrast** meeting WCAG guidelines
5. **Keyboard navigation** support

## What's Next?

In **Part 3**, we'll:

- Create the About section with skills showcase
- Build an interactive projects gallery
- Add contact form with validation
- Implement advanced animations
- Add blog functionality

## Key Takeaways

- **Mobile-first design** ensures responsive layouts
- **CSS custom properties** enable easy theming
- **Performance matters** - optimize animations and images
- **Accessibility** should be built-in, not added later
- **Progressive enhancement** improves user experience

## Homework

Before Part 3:

1. **Test your site** on different devices and browsers
2. **Check accessibility** using tools like WAVE or axe-core
3. **Optimize images** by compressing and using appropriate formats
4. **Gather content** for your About section and projects

Ready to continue? In **Part 3**, we'll add the About section and create an impressive projects showcase!