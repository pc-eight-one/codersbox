import { createClient } from "@libsql/client/web";

// Initialize the Turso libSQL client
export const turso = createClient({
  url: process.env.TURSO_DATABASE_URL || import.meta.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN || import.meta.env.TURSO_AUTH_TOKEN,
});

// Type definitions for common database operations
export interface DatabaseResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// Helper function to execute queries with error handling
export async function executeQuery<T = any>(
  query: string,
  params?: any[]
): Promise<DatabaseResult<T[]>> {
  try {
    const result = await turso.execute({
      sql: query,
      args: params || [],
    });

    return {
      success: true,
      data: result.rows as T[],
    };
  } catch (error) {
    console.error("Database query error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown database error",
    };
  }
}

// Helper function to execute a single query and return first result
export async function executeQuerySingle<T = any>(
  query: string,
  params?: any[]
): Promise<DatabaseResult<T>> {
  try {
    const result = await turso.execute({
      sql: query,
      args: params || [],
    });

    return {
      success: true,
      data: result.rows[0] as T,
    };
  } catch (error) {
    console.error("Database query error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown database error",
    };
  }
}

// Helper function for transactions
export async function executeTransaction(
  queries: Array<{ sql: string; args?: any[] }>
): Promise<DatabaseResult> {
  try {
    const transaction = await turso.transaction();
    
    for (const query of queries) {
      await transaction.execute({
        sql: query.sql,
        args: query.args || [],
      });
    }
    
    await transaction.commit();
    
    return {
      success: true,
    };
  } catch (error) {
    console.error("Database transaction error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown transaction error",
    };
  }
}

// Database connection test
export async function testConnection(): Promise<boolean> {
  try {
    await turso.execute("SELECT 1");
    return true;
  } catch (error) {
    console.error("Database connection test failed:", error);
    return false;
  }
}