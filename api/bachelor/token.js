import crypto from "crypto";
import {
  redis, cors, errorJson,
  SESSION_TTL, TOKEN_RATE_LIMIT_TTL,
  BACHELOR_SESSION_PREFIX, BACHELOR_IP_LIMIT_PREFIX,
} from "../_lib.js";

export default async function handler(req, res) {
  if (cors(req, res)) return;
  if (req.method !== "GET") {
    return errorJson(res, 405, "method_not_allowed", "GET only.");
  }

  try {
    // ── IP rate limit: 1 new token per IP per TOKEN_RATE_LIMIT_TTL ──
    const ip =
      (req.headers["x-forwarded-for"] || "").split(",")[0].trim() ||
      req.socket?.remoteAddress ||
      "unknown";

    const ipKey = `${BACHELOR_IP_LIMIT_PREFIX}${ip}`;
    const allowed = await redis.set(ipKey, 1, {       // 1 command
      nx: true,
      ex: TOKEN_RATE_LIMIT_TTL,
    });

    if (allowed === null) {
      return errorJson(
        res, 429, "token_rate_limit",
        "Please wait a moment before requesting a new session."
      );
    }

    // ── Generate token + create session (pipelined) ─────────────
    const token = crypto.randomBytes(16).toString("hex");
    const sessionKey = `${BACHELOR_SESSION_PREFIX}${token}`;

    const pipe = redis.pipeline();
    pipe.hset(sessionKey, { lastVote: 0, votes: 0 });
    pipe.expire(sessionKey, SESSION_TTL);
    await pipe.exec();                                // 1 pipeline call (2 commands)

    return res.status(200).json({ token });
  } catch (err) {
    console.error("GET /api/bachelor/token error:", err);
    return errorJson(res, 500, "internal", "Could not issue session token.");
  }
}
