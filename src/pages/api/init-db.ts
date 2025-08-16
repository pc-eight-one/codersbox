import type { APIRoute } from 'astro';
import { initializeDatabase, testConnection } from '../../lib/database';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    // Simple authentication check - in production, use proper authentication
    const authHeader = request.headers.get('authorization');
    const expectedAuth = `Bearer ${process.env.DATABASE_INIT_TOKEN || 'dev-token'}`;
    
    if (authHeader !== expectedAuth) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Test database connection first
    const connectionTest = await testConnection();
    if (!connectionTest) {
      return new Response(
        JSON.stringify({ 
          error: 'Database connection failed. Check your TURSO_DATABASE_URL and TURSO_AUTH_TOKEN.' 
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Initialize database tables
    const result = await initializeDatabase();
    
    if (!result.success) {
      console.error('Database initialization error:', result.error);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to initialize database tables',
          details: result.error 
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Database tables initialized successfully' 
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Database initialization API error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
};

export const GET: APIRoute = async () => {
  try {
    // Test connection only
    const connectionTest = await testConnection();
    
    return new Response(
      JSON.stringify({ 
        connected: connectionTest,
        message: connectionTest ? 'Database connection successful' : 'Database connection failed'
      }),
      { 
        status: connectionTest ? 200 : 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Database connection test error:', error);
    
    return new Response(
      JSON.stringify({ 
        connected: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
};