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
export const TOKEN_RATE_LIMIT_TTL = 30; // 30 s between new tokens per IP
