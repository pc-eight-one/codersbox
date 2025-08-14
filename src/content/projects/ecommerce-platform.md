---
title: "E-commerce Platform"
description: "A full-stack e-commerce solution built with React, Node.js, and PostgreSQL. Features include user authentication, payment processing, and admin dashboard."
publishDate: 2024-11-20
tech: ["React", "Node.js", "PostgreSQL", "Stripe", "Full-Stack"]
github: "https://github.com/johndoe/ecommerce-platform"
demo: "https://ecommerce-demo-app.vercel.app"
image: "/images/projects/ecommerce-platform.jpg"
featured: true
status: "completed"
---

# E-commerce Platform

A comprehensive full-stack e-commerce solution designed for modern online businesses. Built with React, Node.js, and PostgreSQL, featuring secure payment processing, inventory management, and a powerful admin dashboard.

## 🛒 Features

### Customer Experience
- **Product catalog** with advanced filtering and search
- **Shopping cart** with persistent sessions
- **Secure checkout** with multiple payment options
- **User accounts** with order history and wishlist
- **Product reviews** and ratings system
- **Responsive design** optimized for all devices

### Admin Dashboard
- **Product management** with bulk operations
- **Order processing** and fulfillment tracking
- **Customer management** and support tools
- **Analytics dashboard** with sales insights
- **Inventory tracking** with low-stock alerts
- **Content management** for pages and promotions

### Security & Performance
- **JWT authentication** with refresh tokens
- **Payment security** via Stripe integration
- **Data encryption** for sensitive information
- **Rate limiting** and DDoS protection
- **Optimized queries** and database indexing
- **CDN integration** for fast asset delivery

## 🏗️ Architecture

### Frontend (React)
- **React 18** with Hooks and Context API
- **React Router** for client-side routing
- **Redux Toolkit** for complex state management
- **Material-UI** for consistent design system
- **React Query** for server state management
- **Formik & Yup** for form handling and validation

### Backend (Node.js)
- **Express.js** REST API with middleware
- **PostgreSQL** with Prisma ORM
- **JWT** authentication with refresh tokens
- **Stripe** payment processing integration
- **Nodemailer** for email notifications
- **Cloudinary** for image storage and optimization

### Infrastructure
- **Docker** containerization for development
- **Vercel** frontend deployment
- **Railway** backend and database hosting
- **GitHub Actions** for CI/CD pipeline
- **Sentry** for error monitoring

## 🔧 Technical Implementation

### Database Design
```sql
-- Core e-commerce tables
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role user_role DEFAULT 'customer',
  email_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  sale_price DECIMAL(10,2),
  sku VARCHAR(100) UNIQUE NOT NULL,
  inventory_count INTEGER DEFAULT 0,
  category_id INTEGER REFERENCES categories(id),
  status product_status DEFAULT 'active',
  images JSONB,
  attributes JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  status order_status DEFAULT 'pending',
  total_amount DECIMAL(10,2) NOT NULL,
  shipping_address JSONB NOT NULL,
  billing_address JSONB NOT NULL,
  payment_intent_id VARCHAR(255),
  tracking_number VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL
);

-- Indexes for performance
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order ON order_items(order_id);
```

### API Architecture
```javascript
// Express.js API structure
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});
app.use('/api/', limiter);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/users', require('./routes/users'));
app.use('/api/admin', require('./routes/admin'));

// Error handling middleware
app.use((error, req, res, next) => {
  console.error(error);
  
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      details: error.details
    });
  }
  
  if (error.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: 'Unauthorized'
    });
  }
  
  res.status(500).json({
    error: 'Internal Server Error'
  });
});
```

### Authentication System
```javascript
// JWT authentication with refresh tokens
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

class AuthService {
  static generateTokens(user) {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role
    };

    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '15m'
    });

    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
      expiresIn: '7d'
    });

    return { accessToken, refreshToken };
  }

  static async verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  static async hashPassword(password) {
    return bcrypt.hash(password, 12);
  }

  static async comparePassword(password, hash) {
    return bcrypt.compare(password, hash);
  }
}

// Authentication middleware
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = await AuthService.verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};
```

### Payment Processing
```javascript
// Stripe integration for secure payments
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

class PaymentService {
  static async createPaymentIntent(amount, currency = 'usd', metadata = {}) {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        metadata,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return paymentIntent;
    } catch (error) {
      console.error('Stripe error:', error);
      throw new Error('Payment processing failed');
    }
  }

  static async confirmPayment(paymentIntentId) {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (paymentIntent.status === 'succeeded') {
        return { success: true, paymentIntent };
      } else {
        return { success: false, status: paymentIntent.status };
      }
    } catch (error) {
      console.error('Payment confirmation error:', error);
      throw new Error('Payment confirmation failed');
    }
  }

  static async handleWebhook(rawBody, signature) {
    try {
      const event = stripe.webhooks.constructEvent(
        rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );

      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handleSuccessfulPayment(event.data.object);
          break;
        case 'payment_intent.payment_failed':
          await this.handleFailedPayment(event.data.object);
          break;
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      return { success: true };
    } catch (error) {
      console.error('Webhook error:', error);
      throw new Error('Webhook processing failed');
    }
  }
}
```

### React Frontend Components
```jsx
// ProductCard component with optimistic updates
import React from 'react';
import { useCart } from '../hooks/useCart';
import { useWishlist } from '../hooks/useWishlist';
import { Card, CardMedia, CardContent, Typography, Button, IconButton } from '@mui/material';
import { FavoriteIcon, ShoppingCartIcon } from '@mui/icons-material';

const ProductCard = ({ product }) => {
  const { addToCart, isInCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const handleAddToCart = async () => {
    setIsAddingToCart(true);
    try {
      await addToCart({
        productId: product.id,
        quantity: 1,
        price: product.salePrice || product.price
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      // Show error toast
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleWishlistToggle = () => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  return (
    <Card className="product-card" sx={{ maxWidth: 345, position: 'relative' }}>
      <CardMedia
        component="img"
        height="200"
        image={product.images?.[0] || '/placeholder-product.jpg'}
        alt={product.name}
        loading="lazy"
      />
      
      <IconButton
        className="wishlist-btn"
        onClick={handleWishlistToggle}
        sx={{
          position: 'absolute',
          top: 8,
          right: 8,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          '&:hover': { backgroundColor: 'rgba(255, 255, 255, 1)' }
        }}
      >
        <FavoriteIcon 
          color={isInWishlist(product.id) ? 'error' : 'action'} 
        />
      </IconButton>

      <CardContent>
        <Typography gutterBottom variant="h6" component="h3" noWrap>
          {product.name}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {product.description}
        </Typography>

        <div className="price-section">
          {product.salePrice ? (
            <>
              <Typography variant="h6" color="error" component="span">
                ${product.salePrice}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                component="span"
                sx={{ textDecoration: 'line-through', ml: 1 }}
              >
                ${product.price}
              </Typography>
            </>
          ) : (
            <Typography variant="h6" component="span">
              ${product.price}
            </Typography>
          )}
        </div>

        <Button
          variant="contained"
          fullWidth
          startIcon={<ShoppingCartIcon />}
          onClick={handleAddToCart}
          disabled={isAddingToCart || product.inventoryCount === 0}
          sx={{ mt: 2 }}
        >
          {isAddingToCart ? 'Adding...' : 
           isInCart(product.id) ? 'In Cart' : 
           product.inventoryCount === 0 ? 'Out of Stock' : 
           'Add to Cart'}
        </Button>
      </CardContent>
    </Card>
  );
};
```

### State Management
```javascript
// Redux Toolkit store configuration
import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import cartSlice from './slices/cartSlice';
import productsSlice from './slices/productsSlice';
import ordersSlice from './slices/ordersSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    cart: cartSlice,
    products: productsSlice,
    orders: ordersSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

// Cart slice with optimistic updates
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { cartAPI } from '../api/cart';

export const addToCart = createAsyncThunk(
  'cart/addItem',
  async ({ productId, quantity, price }, { rejectWithValue }) => {
    try {
      const response = await cartAPI.addItem(productId, quantity, price);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    total: 0,
    loading: false,
    error: null,
  },
  reducers: {
    updateQuantityOptimistic: (state, action) => {
      const { productId, quantity } = action.payload;
      const item = state.items.find(item => item.productId === productId);
      if (item) {
        item.quantity = quantity;
        state.total = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      }
    },
    removeItemOptimistic: (state, action) => {
      const productId = action.payload;
      state.items = state.items.filter(item => item.productId !== productId);
      state.total = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addToCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
        state.total = action.payload.total;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to add item to cart';
      });
  },
});
```

## 📊 Performance Optimizations

### Database Optimization
- **Indexed queries** for fast product searches
- **Connection pooling** for efficient database connections
- **Query optimization** with EXPLAIN ANALYZE
- **Read replicas** for scaling read operations
- **Caching layer** with Redis for frequent queries

### Frontend Performance
- **Code splitting** by route and component
- **Image optimization** with next-gen formats
- **Lazy loading** for non-critical components
- **Service worker** for offline functionality
- **Bundle analysis** and optimization

### API Optimization
- **Response caching** with appropriate TTL
- **Request deduplication** to prevent duplicate calls
- **Pagination** for large data sets
- **Compression** for reduced payload sizes
- **CDN** for static asset delivery

## 🔒 Security Measures

### Authentication & Authorization
- **JWT tokens** with short expiration times
- **Refresh token rotation** for enhanced security
- **Role-based access control** (RBAC)
- **Password hashing** with bcrypt
- **Account lockout** after failed attempts

### Data Protection
- **SQL injection prevention** with parameterized queries
- **XSS protection** with input sanitization
- **CSRF protection** with tokens
- **Rate limiting** to prevent abuse
- **HTTPS enforcement** for all connections

### Payment Security
- **PCI DSS compliance** through Stripe
- **No card data storage** on our servers
- **Webhook signature verification**
- **Fraud detection** with Stripe Radar
- **3D Secure** authentication when required

## 🧪 Testing Strategy

### Backend Testing
```javascript
// Jest + Supertest API testing
describe('Products API', () => {
  let authToken;

  beforeAll(async () => {
    // Setup test database and get auth token
    authToken = await getTestAuthToken();
  });

  describe('GET /api/products', () => {
    test('should return paginated products', async () => {
      const response = await request(app)
        .get('/api/products?page=1&limit=10')
        .expect(200);

      expect(response.body).toHaveProperty('products');
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.products).toHaveLength(10);
    });

    test('should filter products by category', async () => {
      const response = await request(app)
        .get('/api/products?category=electronics')
        .expect(200);

      response.body.products.forEach(product => {
        expect(product.category.name).toBe('Electronics');
      });
    });
  });

  describe('POST /api/products', () => {
    test('should create product with admin auth', async () => {
      const productData = {
        name: 'Test Product',
        description: 'Test Description',
        price: 29.99,
        sku: 'TEST-001',
        categoryId: 1
      };

      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send(productData)
        .expect(201);

      expect(response.body.product).toMatchObject(productData);
    });
  });
});
```

### Frontend Testing
```javascript
// React Testing Library + Jest
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { store } from '../store';
import ProductCard from '../components/ProductCard';

const mockProduct = {
  id: 1,
  name: 'Test Product',
  price: 29.99,
  description: 'Test description',
  images: ['/test-image.jpg'],
  inventoryCount: 10
};

const renderWithStore = (component) => {
  return render(
    <Provider store={store}>
      {component}
    </Provider>
  );
};

describe('ProductCard', () => {
  test('renders product information correctly', () => {
    renderWithStore(<ProductCard product={mockProduct} />);
    
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('$29.99')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  test('adds product to cart when button clicked', async () => {
    renderWithStore(<ProductCard product={mockProduct} />);
    
    const addToCartButton = screen.getByText('Add to Cart');
    fireEvent.click(addToCartButton);

    await waitFor(() => {
      expect(screen.getByText('Adding...')).toBeInTheDocument();
    });
  });
});
```

## 📈 Analytics & Monitoring

### Business Analytics
- **Sales tracking** with revenue and conversion metrics
- **Product performance** analysis
- **Customer behavior** insights
- **Inventory turnover** rates
- **Abandoned cart** recovery tracking

### Technical Monitoring
- **Error tracking** with Sentry
- **Performance monitoring** with Web Vitals
- **API response times** and error rates
- **Database query performance**
- **Infrastructure metrics** with uptime monitoring

## 🚀 Deployment Pipeline

```yaml
# GitHub Actions CI/CD
name: Deploy E-commerce Platform

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:13
        env:
          POSTGRES_PASSWORD: test
          POSTGRES_DB: ecommerce_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: |
        npm ci
        cd client && npm ci
    
    - name: Run backend tests
      run: npm run test
      env:
        DATABASE_URL: postgresql://postgres:test@localhost:5432/ecommerce_test
    
    - name: Run frontend tests
      run: cd client && npm run test -- --coverage --watchAll=false
    
    - name: Build frontend
      run: cd client && npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Deploy backend to Railway
      uses: railway/cli@v2
      with:
        command: up
      env:
        RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
    
    - name: Deploy frontend to Vercel
      uses: vercel/action@v1
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
        vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
```

## 📱 Mobile Experience

### Progressive Web App Features
- **App-like experience** with PWA manifest
- **Offline browsing** of previously viewed products
- **Add to home screen** capability
- **Push notifications** for order updates
- **Background sync** for cart updates

### Touch Optimization
- **Touch-friendly interface** with appropriate tap targets
- **Swipe gestures** for product image galleries
- **Pull-to-refresh** functionality
- **Smooth scrolling** and transitions

## 🔮 Future Enhancements

### Planned Features
- **Multi-vendor marketplace** support
- **Advanced search** with AI-powered recommendations
- **Social commerce** integration
- **Subscription products** and recurring billing
- **International expansion** with multi-currency support

### Technical Roadmap
- **Microservices architecture** for better scalability
- **GraphQL API** for more efficient data fetching
- **Real-time features** with WebSocket integration
- **AI/ML recommendations** engine
- **Advanced analytics** with custom dashboards

This e-commerce platform demonstrates enterprise-level architecture while maintaining clean, maintainable code. The combination of modern technologies, security best practices, and user-centered design creates a robust foundation for online retail success.