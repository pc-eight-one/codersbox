import { g as getNewsletterSubscribers } from '../../chunks/database_D2AU70Yi.mjs';
import { b as sendNewsletterToSubscribers } from '../../chunks/resend_CZGwOYdV.mjs';
export { renderers } from '../../renderers.mjs';

const prerender = false;
const POST = async ({ request }) => {
  try {
    const authHeader = request.headers.get("authorization");
    const expectedAuth = `Bearer ${process.env.DATABASE_INIT_TOKEN || "dev-token"}`;
    if (authHeader !== expectedAuth) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }
    const { subject, content } = await request.json();
    if (!subject || typeof subject !== "string" || subject.trim().length < 3) {
      return new Response(
        JSON.stringify({ error: "Subject must be at least 3 characters" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    if (!content || typeof content !== "string" || content.trim().length < 10) {
      return new Response(
        JSON.stringify({ error: "Content must be at least 10 characters" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    const subscribersResult = await getNewsletterSubscribers();
    if (!subscribersResult.success || !subscribersResult.data) {
      return new Response(
        JSON.stringify({
          error: "Failed to fetch subscribers",
          details: subscribersResult.error
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
    const subscribers = subscribersResult.data;
    if (subscribers.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "No active subscribers found",
          sent: 0,
          failed: 0
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }
    const result = await sendNewsletterToSubscribers(
      subject.trim(),
      content.trim(),
      subscribers.map((sub) => ({ email: sub.email }))
    );
    return new Response(
      JSON.stringify({
        success: result.success,
        message: `Newsletter sent to ${result.sent} subscribers`,
        sent: result.sent,
        failed: result.failed,
        errors: result.errors,
        total_subscribers: subscribers.length
      }),
      {
        status: result.success ? 200 : 207,
        // 207 = Multi-Status (partial success)
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("Newsletter send API error:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error"
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
