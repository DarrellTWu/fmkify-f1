import crypto from "crypto";
import {
  redis, cors, errorJson,
  SESSION_TTL, TOKEN_RATE_LIMIT_TTL,
} from "../_lib.js";

export default async function handler(req, res) {
  if (cors(req, res)) return;
  if (req.method !== "GET") {
    return errorJson(res, 405, "method_not_allowed", "GET only.");
  }

  try {
    // ── IP rate limit: 1 new token per IP per 30 s ──────────────
    const ip =
      (req.headers["x-forwarded-for"] || "").split(",")[0].trim() ||
      req.socket?.remoteAddress ||
      "unknown";

    const ipKey = `ip-limit:${ip}`;
    const exists = await redis.set(ipKey, 1, {
      nx: true,
      ex: TOKEN_RATE_LIMIT_TTL,
    });

    if (exists === null) {
      // Key already existed → rate limited
      return errorJson(
        res, 429, "token_rate_limit",
        "Please wait a moment before requesting a new session."
      );
    }

    // ── Generate token ──────────────────────────────────────────
    const token = crypto.randomBytes(16).toString("hex"); // 32-char hex

    // Session hash: lastVote (epoch ms), votes (counter)
    const sessionKey = `session:${token}`;
    await redis.hset(sessionKey, { lastVote: 0, votes: 0 });
    await redis.expire(sessionKey, SESSION_TTL);

    return res.status(200).json({ token });
  } catch (err) {
    console.error("GET /api/token error:", err);
    return errorJson(res, 500, "internal", "Could not issue session token.");
  }
}
