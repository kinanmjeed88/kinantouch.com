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
        { role: "system", content: "لخص المقال في نقاط مركزة وواضحة." },
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
              { text: "لخص المقال في نقاط واضحة:" },
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
  const response = await fetch(
    "https://api-inference.huggingface.co/models/facebook/bart-large-cnn",
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.HF_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs: content }),
    }
  );

  if (!response.ok) throw new Error("HF failed");
  const data = await response.json();
  return data[0].summary_text;
}