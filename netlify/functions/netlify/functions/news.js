const URLS = {
  articles: () => "https://api.spaceflightnewsapi.net/v4/articles/?limit=12&ordering=-published_at",
  launches: () => "https://ll.thespacedevs.com/2.2.0/launch/upcoming/?limit=8",
  apod: () => "https://api.nasa.gov/planetary/apod?api_key=" + encodeURIComponent(process.env.NASA_API_KEY || "DEMO_KEY")
};
exports.handler = async (event) => {
  const f = (event.queryStringParameters || {}).feed;
  if (!URLS[f]) return { statusCode: 400, body: "{}" };
  try {
    const r = await fetch(URLS[f]());
    const t = await r.text();
    return { statusCode: r.status, headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=600" }, body: t };
  } catch (e) { return { statusCode: 502, body: "{}" }; }
};
