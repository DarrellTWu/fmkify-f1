import { Redis } from "@upstash/redis";

// Single Redis instance reused across warm invocations.
// UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be set in
// Vercel environment variables.
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// ---------------------------------------------------------------------------
// CORS
// ---------------------------------------------------------------------------
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "https://fmkify-f1.vercel.app";

export function cors(req, res) {
  res.setHeader("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Max-Age", "86400");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return true; // signal: response already sent
  }
  return false;
}

// ---------------------------------------------------------------------------
// Error helper
// ---------------------------------------------------------------------------
export function errorJson(res, status, code, message) {
  return res.status(status).json({ error: code, message });
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
export const DRIVER_COUNT = 22;
export const SESSION_TTL = 86400;       // 24 h
export const COOLDOWN_MS = 1000;        // 1 s between votes
export const SESSION_BUDGET = 900;      // max votes per session
export const TOKEN_RATE_LIMIT_TTL = 5;  // 5 s between new tokens per IP
export const TALLIES_KEY = "f1:tallies"; // single JSON key for all vote data

// NBA game — same mechanics, separate roster + Redis namespace.
export const NBA_PLAYER_COUNT = 52;
export const NBA_TALLIES_KEY = "nba:tallies";
export const NBA_SESSION_PREFIX = "nba:session:";
export const NBA_IP_LIMIT_PREFIX = "nba:ip-limit:";

// ---------------------------------------------------------------------------
// Tallies helpers — single-key storage
// ---------------------------------------------------------------------------
// Shape: { tallies: { "1": { f, m, k }, ... }, totalVotes: N }
// Generic versions take the roster size + Redis key so each game can reuse them.
export function emptyTalliesFor(count) {
  const tallies = {};
  for (let i = 1; i <= count; i++) tallies[i] = { f: 0, m: 0, k: 0 };
  return { tallies, totalVotes: 0 };
}

export async function readTalliesFor(key, count) {
  const raw = await redis.get(key);           // 1 command
  if (!raw) return emptyTalliesFor(count);
  return typeof raw === "string" ? JSON.parse(raw) : raw;
}

// F1 wrappers — kept so existing /api/f1/* handlers are untouched.
export function emptyTallies() {
  return emptyTalliesFor(DRIVER_COUNT);
}

export async function readTallies() {
  return readTalliesFor(TALLIES_KEY, DRIVER_COUNT);
}

export async function writeTallies(data) {
  await redis.set(TALLIES_KEY, JSON.stringify(data)); // 1 command
}
