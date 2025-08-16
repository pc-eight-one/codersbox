import type { APIRoute } from 'astro';
import { testResendConnection } from '../../lib/resend';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    // Simple authentication check
    const authHeader = request.headers.get('authorization');
    const expectedAuth = `Bearer ${process.env.DATABASE_INIT_TOKEN || 'dev-token'}`;
    
    if (authHeader !== expectedAuth) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('Testing Resend connection...');
    const isConnected = await testResendConnection();
    
    return new Response(
      JSON.stringify({ 
        success: isConnected,
        message: isConnected 
          ? 'Resend connection successful! Test email sent.' 
          : 'Resend connection failed. Check your API key and configuration.',
        resend_configured: !!process.env.RESEND_API_KEY,
        from_email: process.env.RESEND_FROM_EMAIL || 'Not configured'
      }),
      { 
        status: isConnected ? 200 : 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Resend test API error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
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