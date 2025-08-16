# Turso Database Setup Guide

This document explains how to set up and use the Turso database integration for the codersbox application.

## Overview

The application uses Turso (libSQL) as the database backend for:
- Contact form submissions
- Newsletter subscriptions  
- Page view analytics
- Rate limiting data

## Prerequisites

1. **Vercel Project**: Make sure your application is deployed on Vercel
2. **Turso Account**: Create an account at [turso.tech](https://turso.tech)
3. **Database**: Create a Turso database for your project

## Setup Steps

### 1. Connect Database to Vercel Project

Follow the Turso + Vercel integration:
- Go to your Turso dashboard
- Connect your database to your existing Vercel project
- This will automatically set up the required environment variables

### 2. Pull Environment Variables Locally

```bash
# Link to your Vercel project (if not already done)
vercel link

# Pull the latest environment variables
vercel env pull .env.development.local
```

This will create `.env.development.local` with your Turso credentials:
```env
TURSO_DATABASE_URL=libsql://your-database-url.turso.io
TURSO_AUTH_TOKEN=your-auth-token-here
```

### 3. Install Dependencies

The libSQL client is already installed, but if you need to reinstall:

```bash
npm install @libsql/client
```

### 4. Initialize Database Tables

After setting up environment variables, initialize the database schema:

**Option A: Using the API endpoint (recommended)**
```bash
# Test connection first
curl http://localhost:4321/api/init-db

# Initialize tables (requires auth token)
curl -X POST http://localhost:4321/api/init-db \
  -H "Authorization: Bearer dev-token" \
  -H "Content-Type: application/json"
```

**Option B: Using Turso CLI (manual)**
```bash
# Install Turso CLI
curl -sSfL https://get.tur.so/install.sh | bash

# Connect to your database
turso db shell your-database-name

# Run the SQL commands from src/lib/database.ts manually
```

## Database Schema

The application creates these tables:

### contact_forms
```sql
CREATE TABLE contact_forms (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TEXT NOT NULL,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied'))
);
```

### newsletter_subscriptions
```sql
CREATE TABLE newsletter_subscriptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  subscribed_at TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  source TEXT DEFAULT 'website'
);
```

### page_views
```sql
CREATE TABLE page_views (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  page_path TEXT NOT NULL,
  user_agent TEXT,
  referrer TEXT,
  ip_address TEXT,
  viewed_at TEXT NOT NULL
);
```

## Usage in Code

### Basic Database Operations

```typescript
import { turso, executeQuery, executeQuerySingle } from '@/lib/turso';
import { createContactFormSubmission, subscribeToNewsletter } from '@/lib/database';

// Save contact form
const result = await createContactFormSubmission({
  name: 'John Doe',
  email: 'john@example.com',
  subject: 'Hello',
  message: 'Test message'
});

// Subscribe to newsletter
const subscription = await subscribeToNewsletter({
  email: 'john@example.com',
  source: 'website'
});
```

### Custom Queries

```typescript
import { executeQuery } from '@/lib/turso';

// Custom query
const result = await executeQuery(
  'SELECT * FROM contact_forms WHERE status = ?',
  ['new']
);

if (result.success) {
  console.log('New submissions:', result.data);
}
```

## API Endpoints

### Contact Form: `POST /api/contact`
```javascript
const response = await fetch('/api/contact', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    subject: 'Hello',
    message: 'Test message'
  })
});
```

### Newsletter: `POST /api/newsletter`
```javascript
const response = await fetch('/api/newsletter', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'john@example.com'
  })
});
```

### Database Health Check: `GET /api/init-db`
```bash
curl http://localhost:4321/api/init-db
```

## Environment Variables

### Required
- `TURSO_DATABASE_URL` - Your Turso database URL
- `TURSO_AUTH_TOKEN` - Your Turso authentication token

### Optional
- `DATABASE_INIT_TOKEN` - Token for database initialization (defaults to 'dev-token')
- `SENDGRID_API_KEY` - For email notifications
- `SENDGRID_FROM_EMAIL` - From email address
- `SENDGRID_TO_EMAIL` - To email address for contact forms

## Development Workflow

1. **Local Development**
   ```bash
   # Start dev server
   npm run dev
   
   # Test database connection
   curl http://localhost:4321/api/init-db
   
   # Initialize tables if needed
   curl -X POST http://localhost:4321/api/init-db \
     -H "Authorization: Bearer dev-token"
   ```

2. **Testing Forms**
   - Visit `http://localhost:4321` and test the contact form
   - Subscribe to newsletter to test database writes
   - Check Turso dashboard for data

3. **Production Deployment**
   - Environment variables are automatically synced via Vercel integration
   - Database tables are created automatically on first API call
   - Monitor via Turso dashboard

## Troubleshooting

### Connection Issues
```typescript
// Test connection manually
import { testConnection } from '@/lib/database';

const isConnected = await testConnection();
console.log('Database connected:', isConnected);
```

### Common Errors

1. **"Database connection failed"**
   - Check `TURSO_DATABASE_URL` format
   - Verify `TURSO_AUTH_TOKEN` is correct
   - Ensure database exists in Turso dashboard

2. **"Table doesn't exist"**
   - Run the initialization endpoint: `POST /api/init-db`
   - Check Turso dashboard for table creation

3. **"Too many requests"**
   - Rate limiting is active
   - Wait or adjust rate limits in API code

## Security Considerations

- Environment variables are automatically secured by Vercel
- Database initialization requires authentication token
- Rate limiting prevents abuse
- Input validation on all form submissions
- SQL injection protection via parameterized queries

## Monitoring

- Check Turso dashboard for database usage
- Monitor Vercel function logs for errors
- Use Vercel Analytics for API endpoint monitoring
- Set up alerts for database connection failures

## Backup & Migration

Turso provides automatic backups, but you can also:

```bash
# Export data using Turso CLI
turso db dump your-database-name --output backup.sql

# Import to new database
turso db shell new-database < backup.sql
```

## Performance Tips

- Indexes are automatically created for common queries
- Use `executeQuerySingle` for single-row results
- Batch operations using `executeTransaction`
- Monitor query performance in Turso dashboard
- Consider pagination for large result sets