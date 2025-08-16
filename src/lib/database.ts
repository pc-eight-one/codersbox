import { executeQuery, executeQuerySingle, executeTransaction, type DatabaseResult } from './turso';

// Database schema interfaces
export interface ContactForm {
  id?: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at?: string;
  status?: 'new' | 'read' | 'replied';
}

export interface NewsletterSubscription {
  id?: number;
  email: string;
  name?: string;
  subscribed_at?: string;
  is_active?: boolean;
  source?: string;
}

export interface PageView {
  id?: number;
  page_path: string;
  user_agent?: string;
  referrer?: string;
  ip_address?: string;
  viewed_at?: string;
}

// Contact form operations
export async function createContactFormSubmission(
  contact: Omit<ContactForm, 'id' | 'created_at' | 'status'>
): Promise<DatabaseResult<ContactForm>> {
  const query = `
    INSERT INTO contact_forms (name, email, subject, message, created_at, status)
    VALUES (?, ?, ?, ?, datetime('now'), 'new')
    RETURNING *
  `;
  
  return executeQuerySingle<ContactForm>(query, [
    contact.name,
    contact.email,
    contact.subject,
    contact.message,
  ]);
}

export async function getContactFormSubmissions(
  limit: number = 50,
  offset: number = 0
): Promise<DatabaseResult<ContactForm[]>> {
  const query = `
    SELECT * FROM contact_forms 
    ORDER BY created_at DESC 
    LIMIT ? OFFSET ?
  `;
  
  return executeQuery<ContactForm>(query, [limit, offset]);
}

export async function updateContactFormStatus(
  id: number,
  status: ContactForm['status']
): Promise<DatabaseResult> {
  const query = `
    UPDATE contact_forms 
    SET status = ? 
    WHERE id = ?
  `;
  
  return executeQuery(query, [status, id]);
}

// Newsletter subscription operations
export async function subscribeToNewsletter(
  subscription: Omit<NewsletterSubscription, 'id' | 'subscribed_at' | 'is_active'>
): Promise<DatabaseResult<NewsletterSubscription>> {
  const query = `
    INSERT OR REPLACE INTO newsletter_subscriptions (email, name, subscribed_at, is_active, source)
    VALUES (?, ?, datetime('now'), true, ?)
    RETURNING *
  `;
  
  return executeQuerySingle<NewsletterSubscription>(query, [
    subscription.email,
    subscription.name || null,
    subscription.source || 'website',
  ]);
}

export async function unsubscribeFromNewsletter(
  email: string
): Promise<DatabaseResult> {
  const query = `
    UPDATE newsletter_subscriptions 
    SET is_active = false 
    WHERE email = ?
  `;
  
  return executeQuery(query, [email]);
}

export async function getNewsletterSubscriptions(
  activeOnly: boolean = true
): Promise<DatabaseResult<NewsletterSubscription[]>> {
  const query = activeOnly
    ? 'SELECT * FROM newsletter_subscriptions WHERE is_active = true ORDER BY subscribed_at DESC'
    : 'SELECT * FROM newsletter_subscriptions ORDER BY subscribed_at DESC';
  
  return executeQuery<NewsletterSubscription>(query);
}

export async function getNewsletterSubscribers(
  activeOnly: boolean = true
): Promise<DatabaseResult<NewsletterSubscription[]>> {
  return getNewsletterSubscriptions(activeOnly);
}

// Analytics operations
export async function recordPageView(
  pageView: Omit<PageView, 'id' | 'viewed_at'>
): Promise<DatabaseResult> {
  const query = `
    INSERT INTO page_views (page_path, user_agent, referrer, ip_address, viewed_at)
    VALUES (?, ?, ?, ?, datetime('now'))
  `;
  
  return executeQuery(query, [
    pageView.page_path,
    pageView.user_agent || null,
    pageView.referrer || null,
    pageView.ip_address || null,
  ]);
}

export async function getPageViewStats(
  days: number = 30
): Promise<DatabaseResult<{ page_path: string; view_count: number }[]>> {
  const query = `
    SELECT page_path, COUNT(*) as view_count
    FROM page_views 
    WHERE viewed_at >= datetime('now', '-${days} days')
    GROUP BY page_path
    ORDER BY view_count DESC
  `;
  
  return executeQuery(query);
}

export async function getTotalPageViews(
  days: number = 30
): Promise<DatabaseResult<{ total_views: number }>> {
  const query = `
    SELECT COUNT(*) as total_views
    FROM page_views 
    WHERE viewed_at >= datetime('now', '-${days} days')
  `;
  
  return executeQuerySingle(query);
}

// Database initialization
export async function initializeDatabase(): Promise<DatabaseResult> {
  const queries = [
    {
      sql: `
        CREATE TABLE IF NOT EXISTS contact_forms (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT NOT NULL,
          subject TEXT NOT NULL,
          message TEXT NOT NULL,
          created_at TEXT NOT NULL,
          status TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied'))
        )
      `
    },
    {
      sql: `
        CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE NOT NULL,
          name TEXT,
          subscribed_at TEXT NOT NULL,
          is_active BOOLEAN DEFAULT true,
          source TEXT DEFAULT 'website'
        )
      `
    },
    {
      sql: `
        CREATE TABLE IF NOT EXISTS page_views (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          page_path TEXT NOT NULL,
          user_agent TEXT,
          referrer TEXT,
          ip_address TEXT,
          viewed_at TEXT NOT NULL
        )
      `
    },
    {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_contact_forms_created_at 
        ON contact_forms(created_at)
      `
    },
    {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_newsletter_email 
        ON newsletter_subscriptions(email)
      `
    },
    {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_page_views_path_date 
        ON page_views(page_path, viewed_at)
      `
    }
  ];

  return executeTransaction(queries);
}

// Database connection test
export async function testConnection(): Promise<boolean> {
  try {
    const result = await executeQuery('SELECT 1 as test');
    return result.success;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
}