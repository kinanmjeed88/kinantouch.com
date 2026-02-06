export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const { slug } = await request.json();

    if (!slug) {
      return json({ error: "Missing slug" }, 400);
    }

    const key = `views:${slug}`;

    // قراءة العدد الحالي
    let currentViews = await env.ARTICLE_VIEWS.get(key);

    if (!currentViews) {
      currentViews = 0;
    } else {
      currentViews = parseInt(currentViews, 10);
    }

    // زيادة العداد
    const updatedViews = currentViews + 1;

    // حفظ القيمة الجديدة
    await env.ARTICLE_VIEWS.put(key, updatedViews.toString());

    return json({
      views: updatedViews
    });

  } catch (error) {
    return json({ error: "Server error" }, 500);
  }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json"
    }
  });
}