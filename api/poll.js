import { redis, cors, errorJson } from "./_lib.js";

const POLL_OPTIONS = ["nba", "wwe", "love-island", "bridgerton", "the-office"];
const POLL_KEY = "poll:next-game";
const POLL_COOLDOWN_TTL = 86400; // 1 vote per IP per 24h

export default async function handler(req, res) {
  if (cors(req, res)) return;

  // ── GET: return current vote counts ───────────────────────────
  if (req.method === "GET") {
    try {
      const raw = await redis.hgetall(POLL_KEY);
      const votes = {};
      POLL_OPTIONS.forEach((id) => {
        votes[id] = Number(raw?.[id]) || 0;
      });
      return res.status(200).json({ votes });
    } catch (err) {
      console.error("GET /api/poll error:", err);
      return errorJson(res, 500, "internal", "Could not retrieve poll data.");
    }
  }

  // ── POST: submit a vote ───────────────────────────────────────
  if (req.method === "POST") {
    try {
      const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
      const choice = body?.choice;

      if (!choice || !POLL_OPTIONS.includes(choice)) {
        return errorJson(res, 400, "invalid_choice", `Choice must be one of: ${POLL_OPTIONS.join(", ")}`);
      }

      // IP-based dedup: 1 vote per IP per 24h
      const ip =
        (req.headers["x-forwarded-for"] || "").split(",")[0].trim() ||
        req.socket?.remoteAddress ||
        "unknown";

      const ipKey = `poll-voted:${ip}`;
      const alreadyVoted = await redis.set(ipKey, 1, {
        nx: true,
        ex: POLL_COOLDOWN_TTL,
      });

      if (alreadyVoted === null) {
        return errorJson(res, 429, "already_voted", "You've already voted! Check back tomorrow.");
      }

      // Atomic increment
      await redis.hincrby(POLL_KEY, choice, 1);

      // Return updated counts
      const raw = await redis.hgetall(POLL_KEY);
      const votes = {};
      POLL_OPTIONS.forEach((id) => {
        votes[id] = Number(raw?.[id]) || 0;
      });

      return res.status(200).json({ votes, voted: choice });
    } catch (err) {
      console.error("POST /api/poll error:", err);
      return errorJson(res, 500, "internal", "Could not record vote.");
    }
  }

  return errorJson(res, 405, "method_not_allowed", "GET or POST only.");
}
