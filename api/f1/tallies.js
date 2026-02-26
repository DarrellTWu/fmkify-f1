import { cors, errorJson, readTallies } from "../_lib.js";

export default async function handler(req, res) {
  if (cors(req, res)) return;
  if (req.method !== "GET") {
    return errorJson(res, 405, "method_not_allowed", "GET only.");
  }

  try {
    const data = await readTallies(); // 1 Redis command

    // Light caching — 5 s at the edge, always revalidate
    res.setHeader("Cache-Control", "public, s-maxage=5, stale-while-revalidate=10");
    return res.status(200).json(data);
  } catch (err) {
    console.error("GET /api/f1/tallies error:", err);
    return errorJson(res, 500, "internal", "Could not retrieve tallies.");
  }
}
