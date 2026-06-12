// Vercel serverless function — keeps the Anthropic API key on the server.
// Lives at /api/ai in the deployed app.

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "AI not configured" });
  }

  const { mode, text } = req.body || {};
  if (!text || !["intensity", "polish"].includes(mode)) {
    return res.status(400).json({ error: "Bad request" });
  }

  const prompts = {
    intensity: `You categorise questions for Wonder, a conversation app for two people in a relationship. Categorise this question by emotional intensity:

- green: light, warm, easy to answer (favourites, memories, everyday life)
- amber: deeper, requires personal reflection (values, identity, the relationship)
- red: vulnerable, requires real openness (fears, unsaid things, insecurities, the future of the relationship)
- spicy: flirtatious, romantic desire, physical intimacy

Respond with ONLY one word: green, amber, red, or spicy.

Question: "${text}"`,
    polish: `You help people phrase questions for their partner in Wonder, a conversation app. Rewrite this question to be warmer, clearer and more inviting, keeping its exact meaning and intent. Make it feel like a thoughtful person asking, not a therapist or a quiz. Keep it under 25 words. Do not add assumptions that aren't in the original. Respond with ONLY the rewritten question, no preamble or quotes.

Question: "${text}"`,
  };

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 100,
        messages: [{ role: "user", content: prompts[mode] }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(502).json({ error: `AI error: ${err.slice(0, 200)}` });
    }

    const data = await response.json();
    const output = (data.content?.[0]?.text || "").trim();

    if (mode === "intensity") {
      const word = output.toLowerCase().replace(/[^a-z]/g, "");
      if (!["green", "amber", "red", "spicy"].includes(word)) {
        return res.status(200).json({ result: "amber" });
      }
      return res.status(200).json({ result: word });
    }

    return res.status(200).json({ result: output });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
