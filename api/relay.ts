export default async function handler(req: Request) {
  if (req.method !== "POST") {
    return new Response("Only POST", { status: 405 });
  }

  const body = await req.json();
  const text = String(body.text || "").trim();
  if (!text) {
    return Response.json({ error: "Missing text" }, { status: 400 });
  }

  const persona = body.persona || "职场回复助手";
  const mode = body.mode || "reply";
  const tone = body.tone || "简洁、礼貌、专业";
  const max_length = body.max_length || 120;

  const prompt = `你现在扮演。

任务场景：${mode}
语气要求：${tone}
长度要求：尽量控制在 ${max_length} 字以内

规则：
1. 只输出最终结果，不要解释思路
2. 优先保持自然、可直接使用
3. 如果信息不足，尽量补全为更实用的表达

原始内容：
${text}

请直接输出结果：`;

  const resp = await fetch(process.env.AI_API_URL!, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.AI_API_KEY!}`,
    },
    body: JSON.stringify({
      model: process.env.AI_MODEL,
      messages: [
        { role: "system", content: "你是一个高质量的中文助手。" },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 1024,
    }),
  });

  const data = await resp.json();

  const result =
    data?.choices?.[0]?.message?.content ||
    data?.choices?.[0]?.text ||
    data?.result ||
    "";

  return Response.json({ result });
}
