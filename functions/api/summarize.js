export async function onRequestPost(context) {
  const { request, env } = context;

  const { content } = await request.json();

  if (!content || content.length < 50) {
    return new Response(
      JSON.stringify({ error: "Content too short" }),
      { status: 400 }
    );
  }

  try {
    const result = await summarizeWithGroq(content, env);
    return json(result);
  } catch (e1) {
    try {
      const result = await summarizeWithGemini(content, env);
      return json(result);
    } catch (e2) {
      try {
        const result = await summarizeWithHF(content, env);
        return json(result);
      } catch (e3) {
        return json("All providers failed", 500);
      }
    }
  }
}

function json(data, status = 200) {
  return new Response(JSON.stringify({ summary: data }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

const SYSTEM_PROMPT = `
أنت خبير محتوى تقني ومحرر SEO محترف. مهمتك تلخيص المقال المقدم باللغة العربية في هيكلية محددة جداً وجذابة.
المطلوب:
1. عنوان فرعي جذاب للملخص (مثلاً: 📌 الزبدة التقنية).
2. استخراج 5 نقاط رئيسية مركزة وواضحة جداً (Bullet points).
3. أسلوب الكتابة يجب أن يكون مباشراً، خالياً من الحشو، ومناسباً للقراءة السريعة (Skimming).
4. استخدم التنسيق التالي بدقة (Markdown):

### 🚀 الخلاصة في نقاط
* **النقطة الأولى القوية:** شرح مختصر.
* **النقطة الثانية:** شرح مختصر.
* **النقطة الثالثة:** شرح مختصر.
* **النقطة الرابعة:** شرح مختصر.
* **النقطة الخامسة:** شرح مختصر.

لا تضف أي مقدمات أو خاتمات خارج هذا الهيكل.
`;

async function summarizeWithGroq(content, env) {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${env.GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content }
      ],
      temperature: 0.3
    }),
  });

  if (!response.ok) throw new Error("Groq failed");
  const data = await response.json();
  return data.choices[0].message.content;
}

async function summarizeWithGemini(content, env) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: SYSTEM_PROMPT },
              { text: content }
            ]
          }
        ]
      }),
    }
  );

  if (!response.ok) throw new Error("Gemini failed");
  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
}

async function summarizeWithHF(content, env) {
  // HuggingFace models usually take plain text, prompt engineering is harder here but we try.
  const response = await fetch(
    "https://api-inference.huggingface.co/models/facebook/bart-large-cnn",
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.HF_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs: "Summarize this in 5 bullet points in Arabic: " + content }),
    }
  );

  if (!response.ok) throw new Error("HF failed");
  const data = await response.json();
  return data[0].summary_text;
}