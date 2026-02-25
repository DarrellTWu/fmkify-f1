import { redis, cors, errorJson, DRIVER_COUNT } from "../_lib.js";

export default async function handler(req, res) {
  if (cors(req, res)) return;
  if (req.method !== "GET") {
    return errorJson(res, 405, "method_not_allowed", "GET only.");
  }

  try {
    const pipe = redis.pipeline();
    for (let i = 1; i <= DRIVER_COUNT; i++) pipe.hgetall(`driver:${i}`);
    pipe.get("totalVotes");
    const results = await pipe.exec();

    const tallies = {};
    for (let i = 0; i < DRIVER_COUNT; i++) {
      const raw = results[i];
      tallies[i + 1] = {
        f: Number(raw?.f) || 0,
        m: Number(raw?.m) || 0,
        k: Number(raw?.k) || 0,
      };
    }
    const totalVotes = Number(results[DRIVER_COUNT]) || 0;

    // Light caching — 5 s at the edge, always revalidate
    res.setHeader("Cache-Control", "public, s-maxage=5, stale-while-revalidate=10");
    return res.status(200).json({ tallies, totalVotes });
  } catch (err) {
    console.error("GET /api/tallies error:", err);
    return errorJson(res, 500, "internal", "Could not retrieve tallies.");
  }
}
