import {
  redis, cors, errorJson,
  DRIVER_COUNT, COOLDOWN_MS, SESSION_BUDGET, SESSION_TTL,
} from "./_lib.js";

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------
function validatePayload(body) {
  const { f, m, k } = body || {};
  if (f == null || m == null || k == null) return false;
  const ids = [Number(f), Number(m), Number(k)];
  if (ids.some((id) => !Number.isInteger(id) || id < 1 || id > DRIVER_COUNT)) return false;
  if (new Set(ids).size !== 3) return false;
  return ids; // [fId, mId, kId]
}

// ---------------------------------------------------------------------------
// Assemble full tallies object (same helper used by /api/tallies)
// ---------------------------------------------------------------------------
async function assembleTallies() {
  const pipe = redis.pipeline();
  for (let i = 1; i <= DRIVER_COUNT; i++) pipe.hgetall(`driver:${i}`);
  pipe.get("totalVotes");
  const results = await pipe.exec();

  const tallies = {};
  for (let i = 0; i < DRIVER_COUNT; i++) {
    const raw = results[i]; // null or { f, m, k }
    tallies[i + 1] = {
      f: Number(raw?.f) || 0,
      m: Number(raw?.m) || 0,
      k: Number(raw?.k) || 0,
    };
  }
  const totalVotes = Number(results[DRIVER_COUNT]) || 0;
  return { tallies, totalVotes };
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------
export default async function handler(req, res) {
  if (cors(req, res)) return;
  if (req.method !== "POST") {
    return errorJson(res, 405, "method_not_allowed", "POST only.");
  }

  try {
    // ── Parse & validate payload ────────────────────────────────
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const ids = validatePayload(body);
    if (!ids) {
      return errorJson(res, 400, "invalid_vote", "Vote must contain three distinct driver IDs (1-22) for f, m, and k.");
    }
    const [fId, mId, kId] = ids;

    // ── Validate session token ──────────────────────────────────
    const token = body.token;
    if (!token || typeof token !== "string" || !/^[0-9a-f]{32}$/.test(token)) {
      return errorJson(res, 401, "invalid_token", "Missing or malformed session token.");
    }

    const sessionKey = `session:${token}`;
    const session = await redis.hgetall(sessionKey);
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

    // ── Atomic tally increments (pipelined) ─────────────────────
    const pipe = redis.pipeline();
    pipe.hincrby(`driver:${fId}`, "f", 1);
    pipe.hincrby(`driver:${mId}`, "m", 1);
    pipe.hincrby(`driver:${kId}`, "k", 1);
    pipe.incr("totalVotes");
    // Update session: bump lastVote timestamp + vote counter
    pipe.hset(sessionKey, { lastVote: now, votes: votes + 1 });
    pipe.expire(sessionKey, SESSION_TTL); // refresh TTL on activity
    await pipe.exec();

    // ── Return updated tallies ──────────────────────────────────
    const data = await assembleTallies();
    return res.status(200).json(data);
  } catch (err) {
    console.error("POST /api/vote error:", err);
    return errorJson(res, 500, "internal", "Could not process vote.");
  }
}
