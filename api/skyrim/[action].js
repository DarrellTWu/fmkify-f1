import crypto from "crypto";
import {
  redis, cors, errorJson,
  COOLDOWN_MS, SESSION_BUDGET, SESSION_TTL, TOKEN_RATE_LIMIT_TTL,
  SKYRIM_COUNT, SKYRIM_TALLIES_KEY, SKYRIM_SESSION_PREFIX, SKYRIM_IP_LIMIT_PREFIX,
  readTalliesFor,
} from "../_lib.js";

// All three Skyrim endpoints live in this one dynamic-route function
// (token / tallies / vote) instead of three files like the other games:
// the Vercel Hobby plan allows 12 serverless functions per deployment and
// the fourth game would have pushed the count to 13. URLs are unchanged —
// /api/skyrim/token, /api/skyrim/tallies, /api/skyrim/vote.

// ---------------------------------------------------------------------------
// GET /api/skyrim/token
// ---------------------------------------------------------------------------
async function token(req, res) {
  if (req.method !== "GET") {
    return errorJson(res, 405, "method_not_allowed", "GET only.");
  }

  // ── IP rate limit: 1 new token per IP per TOKEN_RATE_LIMIT_TTL ──
  const ip =
    (req.headers["x-forwarded-for"] || "").split(",")[0].trim() ||
    req.socket?.remoteAddress ||
    "unknown";

  const ipKey = `${SKYRIM_IP_LIMIT_PREFIX}${ip}`;
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
  const newToken = crypto.randomBytes(16).toString("hex");
  const sessionKey = `${SKYRIM_SESSION_PREFIX}${newToken}`;

  const pipe = redis.pipeline();
  pipe.hset(sessionKey, { lastVote: 0, votes: 0 });
  pipe.expire(sessionKey, SESSION_TTL);
  await pipe.exec();                                // 1 pipeline call (2 commands)

  return res.status(200).json({ token: newToken });
}

// ---------------------------------------------------------------------------
// GET /api/skyrim/tallies
// ---------------------------------------------------------------------------
async function tallies(req, res) {
  if (req.method !== "GET") {
    return errorJson(res, 405, "method_not_allowed", "GET only.");
  }

  const data = await readTalliesFor(SKYRIM_TALLIES_KEY, SKYRIM_COUNT); // 1 Redis command

  // Light caching — 5 s at the edge, always revalidate
  res.setHeader("Cache-Control", "public, s-maxage=5, stale-while-revalidate=10");
  return res.status(200).json(data);
}

// ---------------------------------------------------------------------------
// POST /api/skyrim/vote
// ---------------------------------------------------------------------------
function validatePayload(body) {
  const { f, m, k } = body || {};
  if (f == null || m == null || k == null) return false;
  const ids = [Number(f), Number(m), Number(k)];
  if (ids.some((id) => !Number.isInteger(id) || id < 1 || id > SKYRIM_COUNT)) return false;
  if (new Set(ids).size !== 3) return false;
  return ids; // [fId, mId, kId]
}

async function vote(req, res) {
  if (req.method !== "POST") {
    return errorJson(res, 405, "method_not_allowed", "POST only.");
  }

  // ── Parse & validate payload ────────────────────────────────
  const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  const ids = validatePayload(body);
  if (!ids) {
    return errorJson(res, 400, "invalid_vote", `Vote must contain three distinct character IDs (1-${SKYRIM_COUNT}) for f, m, and k.`);
  }
  const [fId, mId, kId] = ids;

  // ── Validate session token ──────────────────────────────────
  const sessionToken = body.token;
  if (!sessionToken || typeof sessionToken !== "string" || !/^[0-9a-f]{32}$/.test(sessionToken)) {
    return errorJson(res, 401, "invalid_token", "Missing or malformed session token.");
  }

  const sessionKey = `${SKYRIM_SESSION_PREFIX}${sessionToken}`;
  const session = await redis.hgetall(sessionKey);            // 1 command
  if (!session || Object.keys(session).length === 0) {
    return errorJson(res, 401, "invalid_token", "Session expired or not found. Please refresh the page.");
  }

  // ── Cooldown check (1 s) ────────────────────────────────────
  const now = Date.now();
  const lastVote = Number(session.lastVote) || 0;
  if (now - lastVote < COOLDOWN_MS) {
    return errorJson(res, 429, "cooldown", "Please wait a moment between votes.");
  }

  // ── Budget check (900 votes) ────────────────────────────────
  const votes = Number(session.votes) || 0;
  if (votes >= SESSION_BUDGET) {
    return errorJson(
      res, 429, "budget_exceeded",
      "You've been playing for a while! Take a quick break and come back in a few minutes."
    );
  }

  // ── Read-modify-write tallies (2 commands) ──────────────────
  const data = await readTalliesFor(SKYRIM_TALLIES_KEY, SKYRIM_COUNT); // 1 command

  // Apply vote in memory
  if (!data.tallies[fId]) data.tallies[fId] = { f: 0, m: 0, k: 0 };
  if (!data.tallies[mId]) data.tallies[mId] = { f: 0, m: 0, k: 0 };
  if (!data.tallies[kId]) data.tallies[kId] = { f: 0, m: 0, k: 0 };
  data.tallies[fId].f += 1;
  data.tallies[mId].m += 1;
  data.tallies[kId].k += 1;
  data.totalVotes += 1;

  // Write tallies + update session in a pipeline (3 commands)
  const pipe = redis.pipeline();
  pipe.set(SKYRIM_TALLIES_KEY, JSON.stringify(data));
  pipe.hset(sessionKey, { lastVote: now, votes: votes + 1 });
  pipe.expire(sessionKey, SESSION_TTL);
  await pipe.exec();

  // ── Return updated tallies (no extra read needed) ───────────
  return res.status(200).json(data);
}

// ---------------------------------------------------------------------------
// Dispatcher
// ---------------------------------------------------------------------------
export default async function handler(req, res) {
  if (cors(req, res)) return;

  const action = req.query.action;
  try {
    if (action === "token")   return await token(req, res);
    if (action === "tallies") return await tallies(req, res);
    if (action === "vote")    return await vote(req, res);
    return errorJson(res, 404, "not_found", "Unknown endpoint.");
  } catch (err) {
    console.error(`/api/skyrim/${action} error:`, err);
    return errorJson(res, 500, "internal", "Could not process request.");
  }
}
