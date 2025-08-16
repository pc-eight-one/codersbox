import type { APIRoute } from 'astro';
import { getNewsletterSubscribers, unsubscribeFromNewsletter } from '../../lib/database';

export const prerender = false;

// Get all subscribers
export const GET: APIRoute = async ({ request }) => {
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

    const result = await getNewsletterSubscribers();
    
    if (!result.success) {
      return new Response(
        JSON.stringify({ 
          error: 'Failed to fetch subscribers',
          details: result.error 
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        subscribers: result.data || [],
        count: result.data?.length || 0
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Subscribers API error:', error);
    
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

// Unsubscribe a user
export const DELETE: APIRoute = async ({ request }) => {
  try {
    const { email } = await request.json();

    // Validate email
    if (!email || typeof email !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Please enter a valid email address' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const result = await unsubscribeFromNewsletter(email.toLowerCase());
    
    if (!result.success) {
      return new Response(
        JSON.stringify({ 
          error: 'Failed to unsubscribe',
          details: result.error 
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Successfully unsubscribed from newsletter'
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Unsubscribe API error:', error);
    
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