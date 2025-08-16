import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY || undefined                              ;
if (!resendApiKey) {
  throw new Error("RESEND_API_KEY environment variable is required");
}
const resend = new Resend(resendApiKey);
const EMAIL_CONFIG = {
  from: process.env.RESEND_FROM_EMAIL || undefined                                  || "noreply@codersbox.dev",
  replyTo: process.env.RESEND_REPLY_TO || undefined                                || "contact@codersbox.dev",
  domain: process.env.SITE_URL || undefined                         || "https://codersbox.dev",
  siteName: "codersbox"
};
async function sendContactFormNotification(contactData) {
  try {
    const { data, error } = await resend.emails.send({
      from: EMAIL_CONFIG.from,
      to: [process.env.RESEND_TO_EMAIL || "contact@codersbox.dev"],
      replyTo: contactData.email,
      subject: `Contact Form: ${contactData.subject}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Contact Form Submission</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; }
            .content { padding: 30px; }
            .field { margin-bottom: 20px; }
            .label { font-weight: 600; color: #333; margin-bottom: 5px; display: block; }
            .value { background: #f8f9fa; padding: 12px; border-radius: 4px; border-left: 4px solid #667eea; }
            .message { background: #f8f9fa; padding: 15px; border-radius: 4px; border-left: 4px solid #667eea; white-space: pre-wrap; }
            .footer { background: #f8f9fa; padding: 15px; border-top: 1px solid #e9ecef; font-size: 12px; color: #6c757d; }
            .button { background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin-top: 15px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 24px;">📧 New Contact Form Submission</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">From ${EMAIL_CONFIG.siteName}</p>
            </div>
            
            <div class="content">
              <div class="field">
                <span class="label">👤 Name:</span>
                <div class="value">${contactData.name}</div>
              </div>
              
              <div class="field">
                <span class="label">📧 Email:</span>
                <div class="value">${contactData.email}</div>
              </div>
              
              <div class="field">
                <span class="label">📋 Subject:</span>
                <div class="value">${contactData.subject}</div>
              </div>
              
              <div class="field">
                <span class="label">💬 Message:</span>
                <div class="message">${contactData.message.replace(/\n/g, "<br>")}</div>
              </div>
              
              <a href="mailto:${contactData.email}?subject=Re: ${encodeURIComponent(contactData.subject)}" class="button">
                Reply to ${contactData.name}
              </a>
            </div>
            
            <div class="footer">
              <strong>📊 Submission Details:</strong><br>
              📅 Submitted: ${new Date(contactData.timestamp).toLocaleString()}<br>
              🌐 IP Address: ${contactData.ip || "Unknown"}<br>
              🖥️ User Agent: ${contactData.userAgent || "Unknown"}<br>
              <br>
              <small>This email was sent from the ${EMAIL_CONFIG.siteName} contact form.</small>
            </div>
          </div>
        </body>
        </html>
      `
    });
    if (error) {
      console.error("Resend contact form error:", error);
      return { success: false, error: error.message };
    }
    return { success: true, id: data?.id };
  } catch (error) {
    console.error("Resend contact form error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}
async function sendNewsletterWelcome(email, name) {
  try {
    const { data, error } = await resend.emails.send({
      from: EMAIL_CONFIG.from,
      to: [email],
      subject: `Welcome to ${EMAIL_CONFIG.siteName} Newsletter! 🎉`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to ${EMAIL_CONFIG.siteName}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; line-height: 1.6; }
            .highlight { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 600; }
            .features { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .feature { margin: 10px 0; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #6c757d; border-top: 1px solid #e9ecef; }
            .button { background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 20px 0; }
            .unsubscribe { font-size: 12px; color: #999; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 28px;">🎉 Welcome to ${EMAIL_CONFIG.siteName}!</h1>
              <p style="margin: 15px 0 0 0; font-size: 18px; opacity: 0.9;">Thanks for joining our developer community</p>
            </div>
            
            <div class="content">
              <p style="font-size: 18px; margin-bottom: 20px;">
                ${name ? `Hi ${name}!` : "Hello!"} 👋
              </p>
              
              <p>Welcome to the <span class="highlight">${EMAIL_CONFIG.siteName}</span> newsletter! You're now part of a growing community of developers who love to learn and build amazing things.</p>
              
              <div class="features">
                <h3 style="margin-top: 0; color: #333;">🚀 What to expect:</h3>
                <div class="feature">📚 <strong>Weekly Tutorials:</strong> Step-by-step guides on the latest technologies</div>
                <div class="feature">💡 <strong>Coding Tips:</strong> Practical advice to improve your development skills</div>
                <div class="feature">🔧 <strong>Tool Reviews:</strong> In-depth looks at developer tools and resources</div>
                <div class="feature">🎯 <strong>Project Ideas:</strong> Inspiration for your next coding project</div>
                <div class="feature">🌟 <strong>Community Highlights:</strong> Showcasing amazing projects from our readers</div>
              </div>
              
              <p>Our newsletter comes out every <strong>Tuesday</strong> with fresh content to help you level up your coding journey.</p>
              
              <div style="text-align: center;">
                <a href="${EMAIL_CONFIG.domain}" class="button">
                  🌐 Explore ${EMAIL_CONFIG.siteName}
                </a>
              </div>
              
              <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef;">
                <strong>Quick Start:</strong> While you're here, check out our most popular tutorial series:
              </p>
              
              <ul style="padding-left: 20px;">
                <li><a href="${EMAIL_CONFIG.domain}/tutorials/series/java-tutorial-series" style="color: #667eea; text-decoration: none;">☕ Complete Java Tutorial Series</a></li>
                <li><a href="${EMAIL_CONFIG.domain}/tutorials/series/portfolio-website" style="color: #667eea; text-decoration: none;">🎨 Build a Portfolio Website</a></li>
                <li><a href="${EMAIL_CONFIG.domain}/articles" style="color: #667eea; text-decoration: none;">📰 Latest Articles</a></li>
              </ul>
            </div>
            
            <div class="footer">
              <p style="margin: 0 0 10px 0;"><strong>Happy coding!</strong><br>The ${EMAIL_CONFIG.siteName} Team</p>
              
              <div class="unsubscribe">
                <p>You're receiving this because you subscribed to our newsletter.</p>
                <p>Don't want these emails? <a href="${EMAIL_CONFIG.domain}/unsubscribe?email=${encodeURIComponent(email)}" style="color: #999;">Unsubscribe here</a></p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    });
    if (error) {
      console.error("Resend newsletter welcome error:", error);
      return { success: false, error: error.message };
    }
    return { success: true, id: data?.id };
  } catch (error) {
    console.error("Resend newsletter welcome error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}
async function sendNewsletterToSubscribers(subject, content, subscribers) {
  const results = {
    success: true,
    sent: 0,
    failed: 0,
    errors: []
  };
  const batchSize = 10;
  const batches = [];
  for (let i = 0; i < subscribers.length; i += batchSize) {
    batches.push(subscribers.slice(i, i + batchSize));
  }
  for (const batch of batches) {
    const batchPromises = batch.map(async (subscriber) => {
      try {
        const { data, error } = await resend.emails.send({
          from: EMAIL_CONFIG.from,
          to: [subscriber.email],
          subject,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>${subject}</title>
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
                .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; }
                .content { padding: 30px; line-height: 1.6; }
                .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #6c757d; border-top: 1px solid #e9ecef; }
                .unsubscribe { font-size: 12px; color: #999; margin-top: 15px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1 style="margin: 0; font-size: 24px;">${EMAIL_CONFIG.siteName}</h1>
                  <p style="margin: 10px 0 0 0; opacity: 0.9;">Developer Newsletter</p>
                </div>
                
                <div class="content">
                  ${subscriber.name ? `<p>Hi ${subscriber.name}!</p>` : "<p>Hello!</p>"}
                  ${content}
                </div>
                
                <div class="footer">
                  <p style="margin: 0 0 10px 0;"><strong>Happy coding!</strong><br>The ${EMAIL_CONFIG.siteName} Team</p>
                  <p><a href="${EMAIL_CONFIG.domain}" style="color: #667eea; text-decoration: none;">Visit ${EMAIL_CONFIG.siteName}</a></p>
                  
                  <div class="unsubscribe">
                    <p>Don't want these emails? <a href="${EMAIL_CONFIG.domain}/unsubscribe?email=${encodeURIComponent(subscriber.email)}" style="color: #999;">Unsubscribe here</a></p>
                  </div>
                </div>
              </div>
            </body>
            </html>
          `
        });
        if (error) {
          results.failed++;
          results.errors.push(`${subscriber.email}: ${error.message}`);
        } else {
          results.sent++;
        }
      } catch (error) {
        results.failed++;
        results.errors.push(`${subscriber.email}: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    });
    await Promise.all(batchPromises);
    if (batches.indexOf(batch) < batches.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 1e3));
    }
  }
  results.success = results.failed === 0;
  return results;
}
async function testResendConnection() {
  try {
    const { error } = await resend.emails.send({
      from: EMAIL_CONFIG.from,
      to: [EMAIL_CONFIG.from],
      // Send to same address for testing
      subject: "Resend Connection Test",
      html: "<p>This is a test email to verify Resend connection.</p>"
    });
    return !error;
  } catch (error) {
    console.error("Resend connection test failed:", error);
    return false;
  }
}

export { sendNewsletterWelcome as a, sendNewsletterToSubscribers as b, sendContactFormNotification as s, testResendConnection as t };
