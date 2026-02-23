# FB-001 Implementation — Storage Backend Migration

## Files

### API Routes (Vercel Serverless Functions)
| File | Purpose |
|---|---|
| `api/_lib.js` | Shared Redis client, CORS helper, constants |
| `api/token.js` | `GET /api/token` — session token issuance with IP rate limit |
| `api/vote.js` | `POST /api/vote` — vote processing with cooldown + budget |
| `api/tallies.js` | `GET /api/tallies` — public read-only tallies endpoint |

### Client
| File | Purpose |
|---|---|
| `fmkify-f1.jsx` | Refactored React component (storage section + App mount + submit flow) |

### Config
| File | Purpose |
|---|---|
| `vercel.json` | CORS headers for API routes |
| `package.json` | Adds `@upstash/redis` dependency |
| `.env.example` | Required environment variables |

---

## Deployment Steps

1. **Create an Upstash Redis instance** at [console.upstash.com](https://console.upstash.com).
2. **Add environment variables** in Vercel project settings (copy from `.env.example`):
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
   - `ALLOWED_ORIGIN` (your production domain)
3. **Deploy API routes first** (or simultaneously with the client update).
4. **Update `ALLOWED_ORIGIN`** in Vercel env vars if your domain differs from `fmkify-f1.vercel.app`.
5. **Update `API_BASE`** in `fmkify-f1.jsx` if the client is served from a different origin than the API.

No Redis pre-seeding is needed. The first vote will create all necessary keys automatically.

---

## What Changed in the Client

All changes are confined to the storage section and App component, per the brief.

### Storage functions (lines 63–103)
- `emptyTallies()` — **unchanged**
- `fetchToken()` — **new** — `GET /api/token`, returns token string or null
- `loadGlobal()` — **rewritten** — `GET /api/tallies` instead of `window.storage.get()`
- `recordVote(vote, token)` — **rewritten** — `POST /api/vote` instead of read-modify-write on `window.storage`. Now returns `{ data, error }` instead of just data/null.

### App component (lines 359–396)
- Added `tokenRef` (useRef) to hold the session token in memory
- Mount effect fetches token + tallies in parallel via `Promise.all`
- `handleVote` passes token to `recordVote` and returns the full `{ data, error }` result

### Submit flow in GameView (lines 217–245)
- **Previously:** fire-and-forget — called `onVote(vote)`, immediately showed confetti
- **Now:** awaits `onVote(vote)`, inspects the result:
  - `budget_exceeded` → shows a friendly overlay with the server's message + refresh button
  - `cooldown` → silently waits 1.1s and retries once
  - `invalid_token` / `internal` → silently fails, unlocks for next attempt
  - Success → shows confetti and advances the round (same as before)

### Slowdown overlay (lines 310–316)
- New UI element: a warm overlay with ☕ emoji, the server's friendly message, and a "Refresh & Resume" button that reloads the page (which issues a new session token).

### Untouched
- `DriverCard`, `GameView` (except submit), `RankingsView` — zero changes
- All CSS, animations, drag-and-drop, confetti — zero changes
- Data contract `{ tallies, totalVotes }` — identical

---

## Redis Key Schema

| Key | Type | Contents |
|---|---|---|
| `driver:{1-22}` | Hash | `{ f: int, m: int, k: int }` |
| `totalVotes` | String (counter) | Total vote count |
| `session:{token}` | Hash | `{ lastVote: epoch_ms, votes: int }` — TTL 24h |
| `ip-limit:{ip}` | String | `1` — TTL 30s |

---

## Anti-Stuffing Summary

| Layer | Mechanism | Effect |
|---|---|---|
| Cooldown | 1s minimum between votes per session | Primary throttle |
| Budget | 900 votes per session | Caps sustained abuse |
| IP limit | 1 new token per IP per 30s | Prevents session farming |
| **Combined** | **~3,484 votes/hour/IP max** | See brief for math |
