const SYSTEM = "You are ASTRA's astronaut mentor for students aged 12+. Answer space, rocketry, physics and astronaut-career questions clearly and briefly (under 150 words). Be accurate, say when unsure, and point to NASA, ESA or ISRO for official requirements. Stay on topic.";
const json = (code, obj) => ({ statusCode: code, headers: { "Content-Type": "application/json" }, body: JSON.stringify(obj) });
exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return json(405, { error: "POST only" });
  if (!process.env.ANTHROPIC_API_KEY) return json(500, { error: "mentor not configured" });
  let body; try { body = JSON.parse(event.body || "{}"); } catch { return json(400, { error: "bad json" }); }
  const msgs = (Array.isArray(body.messages) ? body.messages : []).slice(-10)
    .filter(m => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .map(m => ({ role: m.role, content: m.content.slice(0, 1000) }));
  if (!msgs.length || msgs[0].role !== "user") return json(400, { error: "invalid messages" });
  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": process.env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({ model: process.env.MENTOR_MODEL || "claude-haiku-5-5", max_tokens: 400, system: SYSTEM, messages: msgs })
    });
    const j = await r.json();
    if (!r.ok) return json(502, { error: "upstream error" });
    const reply = (j.content || []).map(c => c.text || "").join("").trim();
    return json(200, { reply });
  } catch (e) { return json(502, { error: "upstream unreachable" }); }
};
