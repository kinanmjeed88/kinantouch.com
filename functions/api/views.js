export async function onRequestPost(context) {
  try {
    const { request, env } = context;

    /* ---------- Validate KV ---------- */
    if (!env.ARTICLE_VIEWS) {
      return json({ error: "KV not bound" }, 500);
    }

    /* ---------- Bot Protection ---------- */
    const ua = request.headers.get("user-agent") || "";
    if (isBot(ua)) {
      return json({ views: 0 });
    }

    /* ---------- Parse Body ---------- */
    const body = await request.json();
    let slug = body.slug;

    if (!slug || typeof slug !== "string") {
      return json({ error: "Missing slug" }, 400);
    }

    /* ---------- Sanitize slug ---------- */
    slug = slug.toLowerCase().replace(/[^a-z0-9\-]/g, "");

    /* ---------- Get Real IP ---------- */
    const ip =
      request.headers.get("cf-connecting-ip") ||
      request.headers.get("x-forwarded-for") ||
      "unknown";

    /* ---------- Hash IP ---------- */
    const hashedIP = await hashIP(ip);

    const viewKey = `views:${slug}`;
    const ipKey = `viewed:${slug}:${hashedIP}`;

    /* ---------- Check last visit ---------- */
    const alreadyViewed = await env.ARTICLE_VIEWS.get(ipKey);

    if (!alreadyViewed) {
      const currentViews = await env.ARTICLE_VIEWS.get(viewKey);
      const viewsNumber = currentViews ? parseInt(currentViews, 10) : 0;

      const newViews = viewsNumber + 1;

      /* ---------- Update Counter ---------- */
      await env.ARTICLE_VIEWS.put(viewKey, newViews.toString());

      /* ---------- Count once every 6 hours ---------- */
      await env.ARTICLE_VIEWS.put(ipKey, "1", {
        expirationTtl: 21600
      });

      return json({ views: newViews });
    }

    /* ---------- Return existing views ---------- */
    const existingViews = await env.ARTICLE_VIEWS.get(viewKey);
    const safeViews = existingViews ? parseInt(existingViews, 10) : 0;

    return json({ views: safeViews });

  } catch (error) {
    return json({ error: error.message }, 500);
  }
}

/* ================= Helpers ================= */

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store"
    }
  });
}

/* ---------- IP Hash ---------- */
async function hashIP(ip) {
  const encoder = new TextEncoder();
  const data = encoder.encode(ip);
  const buffer = await crypto.subtle.digest("SHA-256", data);

  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

/* ---------- Bot Detection ---------- */
function isBot(ua) {
  const bots = [
    "bot",
    "crawler",
    "spider",
    "google",
    "bing",
    "yandex",
    "baidu",
    "duckduck",
    "facebook",
    "preview"
  ];
  const lower = ua.toLowerCase();
  return bots.some(b => lower.includes(b));
}
