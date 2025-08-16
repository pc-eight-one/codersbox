import { c as createContactFormSubmission } from '../../chunks/database_D2AU70Yi.mjs';
import { s as sendContactFormNotification } from '../../chunks/resend_CZGwOYdV.mjs';
export { renderers } from '../../renderers.mjs';

const prerender = false;
const rateLimit = async (ip) => {
  if (typeof process !== "undefined" && process.env.KV_REST_API_URL) {
    try {
      const kvUrl = process.env.KV_REST_API_URL;
      const kvToken = process.env.KV_REST_API_TOKEN;
      const key = `contact_rate_limit:${ip}`;
      const response = await fetch(`${kvUrl}/get/${key}`, {
        headers: { Authorization: `Bearer ${kvToken}` }
      });
      if (response.ok) {
        const data = await response.json();
        const count = parseInt(data.result || "0");
        if (count >= 3) {
          return false;
        }
        await fetch(`${kvUrl}/set/${key}`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${kvToken}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ value: count + 1, ex: 3600 })
        });
      }
    } catch (error) {
      console.warn("Rate limiting error:", error);
    }
  }
  return true;
};
const POST = async ({ request, clientAddress }) => {
  try {
    const { name, email, subject, message } = await request.json();
    const errors = [];
    if (!name || typeof name !== "string" || name.trim().length < 2) {
      errors.push("Name must be at least 2 characters");
    }
    if (!email || typeof email !== "string") {
      errors.push("Email is required");
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        errors.push("Please enter a valid email address");
      }
    }
    if (!message || typeof message !== "string" || message.trim().length < 10) {
      errors.push("Message must be at least 10 characters");
    }
    if (errors.length > 0) {
      return new Response(
        JSON.stringify({ error: errors.join(", ") }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    const contactData = {
      name: name.trim(),
      email: email.trim(),
      subject: subject?.trim() || "Contact Form Submission",
      message: message.trim(),
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      userAgent: request.headers.get("user-agent"),
      ip: request.headers.get("x-forwarded-for") || "unknown"
    };
    console.log("Contact form submission:", contactData);
    const rateLimitPassed = await rateLimit(contactData.ip);
    if (!rateLimitPassed) {
      return new Response(
        JSON.stringify({ error: "Too many requests. Please wait before submitting again." }),
        { status: 429, headers: { "Content-Type": "application/json" } }
      );
    }
    const dbResult = await createContactFormSubmission({
      name: contactData.name,
      email: contactData.email,
      subject: contactData.subject,
      message: contactData.message
    });
    if (!dbResult.success) {
      console.error("Database error:", dbResult.error);
    }
    const emailResult = await sendContactFormNotification(contactData);
    if (!emailResult.success) {
      console.warn("Failed to send email notification:", emailResult.error);
    }
    return new Response(
      JSON.stringify({
        success: true,
        message: "Message sent successfully. Thank you for reaching out!"
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("Contact form submission error:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error. Please try again later."
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
