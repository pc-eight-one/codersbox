import { s as subscribeToNewsletter } from '../../chunks/database_D2AU70Yi.mjs';
import { a as sendNewsletterWelcome } from '../../chunks/resend_CZGwOYdV.mjs';
export { renderers } from '../../renderers.mjs';

const prerender = false;
const rateLimit = async (ip) => {
  if (typeof process !== "undefined" && process.env.KV_REST_API_URL) {
    try {
      const kvUrl = process.env.KV_REST_API_URL;
      const kvToken = process.env.KV_REST_API_TOKEN;
      const key = `newsletter_rate_limit:${ip}`;
      const response = await fetch(`${kvUrl}/get/${key}`, {
        headers: { Authorization: `Bearer ${kvToken}` }
      });
      if (response.ok) {
        const data = await response.json();
        const count = parseInt(data.result || "0");
        if (count >= 5) {
          return false;
        }
        await fetch(`${kvUrl}/set/${key}`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${kvToken}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ value: count + 1, ex: 3600 })
          // Expire in 1 hour
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
    const ip = clientAddress || request.headers.get("x-forwarded-for") || "unknown";
    const canProceed = await rateLimit(ip);
    if (!canProceed) {
      return new Response(
        JSON.stringify({ error: "Too many requests. Please try again later." }),
        { status: 429, headers: { "Content-Type": "application/json" } }
      );
    }
    const { email } = await request.json();
    if (!email || typeof email !== "string") {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: "Please enter a valid email address" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    const dbResult = await subscribeToNewsletter({
      email: email.toLowerCase(),
      source: "website"
    });
    if (!dbResult.success) {
      console.error("Database error:", dbResult.error);
      return new Response(
        JSON.stringify({ error: "Failed to subscribe. Please try again." }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
    console.log("Newsletter subscription:", {
      email: email.toLowerCase(),
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      ip,
      userAgent: request.headers.get("user-agent")
    });
    const emailResult = await sendNewsletterWelcome(email);
    if (!emailResult.success) {
      console.warn("Failed to send welcome email:", emailResult.error);
    }
    return new Response(
      JSON.stringify({
        success: true,
        message: "Successfully subscribed to newsletter! Check your email for confirmation."
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache"
        }
      }
    );
  } catch (error) {
    console.error("Newsletter subscription error:", error);
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
