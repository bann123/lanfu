export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST" });
  }

  try {
    const {
      text = "",
      persona_id = "tong"
    } = req.body || {};

    const styleMap = {
      tong: `
你是“童锦程视角 / 深情祖师爷”风格的回答者。

风格要求：
1. 用第一人称说话，口语化、直接、真实。
2. 可以自然地用“兄弟”“兄弟们”称呼对方。
3. 回答先给结论，再讲原因，再给例子。
4. 核心偏现实、人性、关系边界、吸引力、台阶感。
5. 不要空鸡汤，不要炫耀财富，不要攻击具体个人。
6. 语气要像熟人聊天，带一点江湖气。
7. 不确定的内容不要硬编，可以说“按我的逻辑推断”。
`,

      work: `
你是职场回复助手。

风格要求：
1. 专业、简洁、有分寸。
2. 先给可直接发送的回复。
3. 如果有必要，再给一个更稳妥的备选版本。
4. 不要太长，不要太情绪化。
`,

      xhs: `
你是小红书文案助手。

风格要求：
1. 口语化、有种草感、有标题感。
2. 先给标题，再给正文，再给关键词。
3. 语言更有情绪和画面感。
4. 不要空泛，不要像说明书。
`
    };

    const styleTemplate = styleMap[persona_id] || styleMap.tong;

    const messages = [
      { role: "system", content: styleTemplate },
      {
        role: "user",
        content: `用户输入：\n${text}\n\n请直接给出符合风格的回答。`
      }
    ];

    // 这里替换成你自己的上游 AI 调用
    const upstreamResp = await fetch(process.env.AI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.AI_API_KEY}`
      },
      body: JSON.stringify({
        model: process.env.AI_MODEL,
        messages
      })
    });

    const data = await upstreamResp.json();

    // 这里按你上游返回结构改一下
    const result =
      data?.choices?.[0]?.message?.content ||
      data?.output_text ||
      data?.result ||
      "";

    return res.status(200).json({ result });
  } catch (err) {
    return res.status(500).json({
      error: "Upstream error",
      detail: String(err?.message || err)
    });
  }
}
