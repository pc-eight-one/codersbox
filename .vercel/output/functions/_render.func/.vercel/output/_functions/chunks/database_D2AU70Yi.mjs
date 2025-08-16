import { createClient } from '@libsql/client/web';

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL || undefined                                  ,
  authToken: process.env.TURSO_AUTH_TOKEN || undefined                                
});
async function executeQuery(query, params) {
  try {
    const result = await turso.execute({
      sql: query,
      args: params || []
    });
    return {
      success: true,
      data: result.rows
    };
  } catch (error) {
    console.error("Database query error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown database error"
    };
  }
}
async function executeQuerySingle(query, params) {
  try {
    const result = await turso.execute({
      sql: query,
      args: params || []
    });
    return {
      success: true,
      data: result.rows[0]
    };
  } catch (error) {
    console.error("Database query error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown database error"
    };
  }
}
async function executeTransaction(queries) {
  try {
    const transaction = await turso.transaction();
    for (const query of queries) {
      await transaction.execute({
        sql: query.sql,
        args: query.args || []
      });
    }
    await transaction.commit();
    return {
      success: true
    };
  } catch (error) {
    console.error("Database transaction error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown transaction error"
    };
  }
}

async function createContactFormSubmission(contact) {
  const query = `
    INSERT INTO contact_forms (name, email, subject, message, created_at, status)
    VALUES (?, ?, ?, ?, datetime('now'), 'new')
    RETURNING *
  `;
  return executeQuerySingle(query, [
    contact.name,
    contact.email,
    contact.subject,
    contact.message
  ]);
}
async function subscribeToNewsletter(subscription) {
  const query = `
    INSERT OR REPLACE INTO newsletter_subscriptions (email, name, subscribed_at, is_active, source)
    VALUES (?, ?, datetime('now'), true, ?)
    RETURNING *
  `;
  return executeQuerySingle(query, [
    subscription.email,
    subscription.name || null,
    subscription.source || "website"
  ]);
}
async function unsubscribeFromNewsletter(email) {
  const query = `
    UPDATE newsletter_subscriptions 
    SET is_active = false 
    WHERE email = ?
  `;
  return executeQuery(query, [email]);
}
async function getNewsletterSubscriptions(activeOnly = true) {
  const query = activeOnly ? "SELECT * FROM newsletter_subscriptions WHERE is_active = true ORDER BY subscribed_at DESC" : "SELECT * FROM newsletter_subscriptions ORDER BY subscribed_at DESC";
  return executeQuery(query);
}
async function getNewsletterSubscribers(activeOnly = true) {
  return getNewsletterSubscriptions(activeOnly);
}
async function initializeDatabase() {
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
async function testConnection() {
  try {
    const result = await executeQuery("SELECT 1 as test");
    return result.success;
  } catch (error) {
    console.error("Database connection test failed:", error);
    return false;
  }
}

export { createContactFormSubmission as c, getNewsletterSubscribers as g, initializeDatabase as i, subscribeToNewsletter as s, testConnection as t, unsubscribeFromNewsletter as u };
