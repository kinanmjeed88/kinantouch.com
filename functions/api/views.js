export async function onRequestPost(context) {
  try {
    const { request, env } = context;

    if (!env.ARTICLE_VIEWS) {
      return new Response(JSON.stringify({ error: "KV not bound" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    const body = await request.json();
    const slug = body.slug;

    if (!slug) {
      return new Response(JSON.stringify({ error: "Missing slug" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // IP الحقيقي من Cloudflare
    const ip =
      request.headers.get("cf-connecting-ip") ||
      request.headers.get("x-forwarded-for") ||
      "unknown";

    // Hash للـ IP (لأجل الخصوصية)
    const encoder = new TextEncoder();
    const data = encoder.encode(ip);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashedIP = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

    const viewKey = `views:${slug}`;
    const ipKey = `viewed:${slug}:${hashedIP}`;

    // تحقق هل تم الاحتساب خلال الساعة الماضية
    const alreadyViewed = await env.ARTICLE_VIEWS.get(ipKey);

    if (!alreadyViewed) {
      const currentViews = await env.ARTICLE_VIEWS.get(viewKey);
      const viewsNumber = currentViews ? parseInt(currentViews) : 0;

      const newViews = viewsNumber + 1;

      // تحديث العداد
      await env.ARTICLE_VIEWS.put(viewKey, newViews.toString());

      // تخزين IP لمدة ساعة واحدة (3600 ثانية)
      await env.ARTICLE_VIEWS.put(ipKey, "1", {
        expirationTtl: 3600
      });

      return new Response(JSON.stringify({ views: newViews }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    // إذا سبق احتسابه خلال الساعة
    const existingViews = await env.ARTICLE_VIEWS.get(viewKey);
    const safeViews = existingViews ? parseInt(existingViews) : 0;

    return new Response(JSON.stringify({ views: safeViews }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}