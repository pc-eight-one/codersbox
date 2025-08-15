import type { APIRoute } from 'astro';

export const prerender = false;

// Rate limiting using Vercel KV
const rateLimit = async (ip: string): Promise<boolean> => {
  if (typeof process !== 'undefined' && process.env.KV_REST_API_URL) {
    try {
      const kvUrl = process.env.KV_REST_API_URL;
      const kvToken = process.env.KV_REST_API_TOKEN;
      
      const key = `contact_rate_limit:${ip}`;
      const response = await fetch(`${kvUrl}/get/${key}`, {
        headers: { Authorization: `Bearer ${kvToken}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        const count = parseInt(data.result || '0');
        
        if (count >= 3) { // Max 3 contact form submissions per hour
          return false;
        }
        
        // Increment counter
        await fetch(`${kvUrl}/set/${key}`, {
          method: 'POST',
          headers: { 
            Authorization: `Bearer ${kvToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ value: count + 1, ex: 3600 })
        });
      }
    } catch (error) {
      console.warn('Rate limiting error:', error);
    }
  }
  return true;
};

// Send email notification using SendGrid
const sendContactNotification = async (contactData: any): Promise<boolean> => {
  if (typeof process !== 'undefined' && process.env.SENDGRID_API_KEY) {
    try {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          personalizations: [{
            to: [{ email: process.env.SENDGRID_TO_EMAIL || 'contact@codersbox.dev' }],
            subject: `Contact Form: ${contactData.subject}`
          }],
          from: { 
            email: process.env.SENDGRID_FROM_EMAIL || 'noreply@codersbox.dev',
            name: 'codersbox Contact Form'
          },
          reply_to: {
            email: contactData.email,
            name: contactData.name
          },
          content: [{
            type: 'text/html',
            value: `
              <h2>New Contact Form Submission</h2>
              <p><strong>Name:</strong> ${contactData.name}</p>
              <p><strong>Email:</strong> ${contactData.email}</p>
              <p><strong>Subject:</strong> ${contactData.subject}</p>
              <p><strong>Message:</strong></p>
              <div style="background: #f5f5f5; padding: 15px; border-left: 4px solid #007acc; margin: 10px 0;">
                ${contactData.message.replace(/\n/g, '<br>')}
              </div>
              <hr>
              <p><small>
                Submitted at: ${contactData.timestamp}<br>
                IP Address: ${contactData.ip}<br>
                User Agent: ${contactData.userAgent}
              </small></p>
            `
          }]
        })
      });
      
      return response.ok;
    } catch (error) {
      console.error('SendGrid contact email error:', error);
      return false;
    }
  }
  return true;
};

export const POST: APIRoute = async ({ request, clientAddress }) => {
  try {
    const { name, email, subject, message } = await request.json();

    // Validate required fields
    const errors: string[] = [];
    
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      errors.push('Name must be at least 2 characters');
    }
    
    if (!email || typeof email !== 'string') {
      errors.push('Email is required');
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        errors.push('Please enter a valid email address');
      }
    }
    
    if (!message || typeof message !== 'string' || message.trim().length < 10) {
      errors.push('Message must be at least 10 characters');
    }

    if (errors.length > 0) {
      return new Response(
        JSON.stringify({ error: errors.join(', ') }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Log the contact form submission
    const contactData = {
      name: name.trim(),
      email: email.trim(),
      subject: subject?.trim() || 'Contact Form Submission',
      message: message.trim(),
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get('user-agent'),
      ip: request.headers.get('x-forwarded-for') || 'unknown'
    };

    console.log('Contact form submission:', contactData);

    // TODO: Integrate with email service or save to database
    // Options include:
    // - Send email via SendGrid, Nodemailer, etc.
    // - Save to database (PostgreSQL, MongoDB, etc.)
    // - Send to Slack/Discord webhook
    // - Create GitHub issue
    // - Forward to support email

    // Example email service integration:
    // await sendEmail({
    //   to: 'your-email@example.com',
    //   from: 'noreply@codersbox.dev',
    //   subject: `Contact Form: ${contactData.subject}`,
    //   html: `
    //     <h2>New Contact Form Submission</h2>
    //     <p><strong>Name:</strong> ${contactData.name}</p>
    //     <p><strong>Email:</strong> ${contactData.email}</p>
    //     <p><strong>Subject:</strong> ${contactData.subject}</p>
    //     <p><strong>Message:</strong></p>
    //     <p>${contactData.message.replace(/\n/g, '<br>')}</p>
    //     <hr>
    //     <p><small>Submitted at: ${contactData.timestamp}</small></p>
    //   `
    // });

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Message sent successfully. Thank you for reaching out!' 
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Contact form submission error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error. Please try again later.' 
      }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
};