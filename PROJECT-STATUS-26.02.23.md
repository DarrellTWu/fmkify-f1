# FMKify F1 — Project Status & Architecture Reference

Last updated: 2026-02-23

---

## What This Is

FMKify F1 is a "Fuck, Marry, Kill" community voting game for the 2026 Formula 1 grid. Users are shown 3 random drivers, assign F/M/K to each, and submit. Votes are tallied globally and viewable on a Rankings page. The app is a single-page React component with a serverless API backend.

**Live URL:** https://fmkify-f1.vercel.app
**Repo:** github.com/DarrellTWu/fmkify-f1 (private)
**Owner:** dtjwnba (Vercel Hobby tier)

---

## Architecture

```
Browser                         Vercel (fmkify-f1.vercel.app)               Upstash Redis
┌─────────────────┐             ┌──────────────────────────────┐            ┌──────────────┐
│  index.html      │────GET────▶│  Static: index.html          │            │              │
│  (loads React +  │            │  Static: fmkify-f1.jsx       │            │  driver:{1-22}│
│   Babel, fetches │            │                              │            │  totalVotes   │
│   & compiles JSX)│            │  GET  /api/token   → token.js│───────────▶│  session:*    │
│                  │───API─────▶│  POST /api/vote    → vote.js │◀──────────▶│  ip-limit:*   │
│                  │  calls     │  GET  /api/tallies → tallies.js│──────────▶│              │
└─────────────────┘             └──────────────────────────────┘            └──────────────┘
```

### Client Layer

**Single-file React component** (`fmkify-f1.jsx`, ~530 lines) containing all UI, styles, and logic. No build step, no bundler, no npm dependencies on the client side.

**Served via `index.html`** which loads React 18 and Babel standalone from unpkg CDN, then fetches `fmkify-f1.jsx` as raw text, patches out the ES module `import`/`export` syntax (since React is loaded as UMD globals), compiles the JSX via Babel in the browser, and mounts the `App` component. This is a deliberate tradeoff — no build tooling required, at the cost of ~1s Babel compilation on page load. The JSX file retains its `import { useState, ... } from "react"` and `export default function App` syntax for compatibility with Claude artifacts and other environments; the `index.html` regex-replaces these at runtime.

**Session token** is stored in a React `useRef` (not localStorage/sessionStorage). Refreshing the page gets a new token, which is intentional — it's how users resume after hitting the 900-vote session budget.

**Data contract:** The entire app consumes a single shape: `{ tallies: { [driverId]: { f: number, m: number, k: number } }, totalVotes: number }`. All 22 drivers (IDs 1–22) are always present. This shape flows from the API through `globalData` state in the `App` component to `GameView` and `RankingsView`. Preserving this shape is critical — any backend change must return this exact structure.

**Submit flow** (GameView lines ~217–245): The submit callback is `async`. It awaits the API response before showing confetti. On `budget_exceeded`, it shows a friendly ☕ overlay with the server's message and a refresh button. On `cooldown`, it silently waits 1.1s and retries once. On `invalid_token` or `internal`, it silently fails and unlocks for the next attempt. Success triggers confetti and advances the round.

### API Layer

Three **Vercel Serverless Functions** in the `api/` directory, plus a shared `_lib.js` module:

**`api/_lib.js`** — Shared across all routes. Initializes the Upstash Redis client (HTTP-based, no persistent connections), exports a CORS helper that reads `ALLOWED_ORIGIN` from env vars, an error response helper, and constants (driver count, session TTL, cooldown, budget, rate limit TTL).

**`GET /api/token`** — Issues a 128-bit random hex session token (32 chars, via `crypto.randomBytes(16)`). Stores a session hash in Redis (`session:{token}` with fields `lastVote: 0, votes: 0`, TTL 24h). Rate-limited to 1 new token per IP per 30 seconds via a short-lived Redis key (`ip-limit:{ip}`, TTL 30s, set with NX).

**`POST /api/vote`** — Accepts `{ f, m, k, token }`. Validates: token exists and matches `/^[0-9a-f]{32}$/`, session exists in Redis, cooldown (1s since last vote), budget (< 900 votes), and payload (3 distinct IDs, each 1–22). On success, pipelines 3× `HINCRBY` on the driver hashes + 1× `INCR` on `totalVotes` + session update, all in a single Redis round-trip. Returns the full updated tallies object. No read-modify-write cycle — increments are atomic.

**`GET /api/tallies`** — Public, unauthenticated. Reads all 22 `driver:{N}` hashes + `totalVotes` in a single Redis pipeline. Missing keys coalesce to `{ f: 0, m: 0, k: 0 }` / `0`. Returns `Cache-Control: public, s-maxage=5, stale-while-revalidate=10` for light edge caching.

**Error responses** follow a consistent schema across all endpoints: `{ "error": "<code>", "message": "<human-readable>" }` with appropriate HTTP status codes (400, 401, 429, 500).

### Data Layer

**Upstash Redis** (serverless, HTTP-based, us-east-1 region). No persistent connections — each function invocation makes HTTP requests to the Upstash REST API.

**Key schema:**

| Key pattern | Type | Contents | TTL |
|---|---|---|---|
| `driver:{1-22}` | Hash | `{ f: int, m: int, k: int }` | None (persistent) |
| `totalVotes` | String | Integer counter | None (persistent) |
| `session:{hex32}` | Hash | `{ lastVote: epoch_ms, votes: int }` | 24 hours (refreshed on activity) |
| `ip-limit:{ip}` | String | `"1"` | 30 seconds |

**Cold start:** No pre-seeding needed. `HINCRBY` and `INCR` auto-create keys starting from 0. A fresh Redis instance works immediately.

### Anti-Stuffing

Three layers combining to cap a single-IP attacker at ~3,484 votes/hour:

1. **1-second cooldown** per session (primary throttle)
2. **900-vote budget** per session (caps sustained abuse; user refreshes to resume)
3. **IP-based token rate limit** — 1 new session per IP per 30 seconds (prevents parallel session farming)

No authentication. No proof-of-work. These were evaluated and deferred as future escalation steps if abuse becomes a problem.

---

## Deployment Details

### Hosting

- **Platform:** Vercel (Hobby tier, free)
- **Project:** fmkify-f1 under dtjwnba's account
- **Region:** iad1 (Washington D.C. / US East)
- **Domain:** fmkify-f1.vercel.app (no custom domain configured yet)
- **Auto-deploy:** Yes — pushes to `main` branch on GitHub trigger automatic redeployment

### Environment Variables (set in Vercel dashboard)

| Key | Purpose |
|---|---|
| `UPSTASH_REDIS_REST_URL` | Upstash Redis HTTP endpoint |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis auth token |
| `ALLOWED_ORIGIN` | CORS origin, currently `https://fmkify-f1.vercel.app` |

### CORS

CORS is enforced in two places and both must match:

1. **Server-side** in `api/_lib.js` — reads `ALLOWED_ORIGIN` env var, sets headers on every response
2. **Edge-level** in `vercel.json` — hardcoded `Access-Control-Allow-Origin` header for preflight responses

If the domain changes, both must be updated. The env var handles (1); `vercel.json` must be edited and pushed for (2).

### File Structure (as deployed)

```
fmkify-f1/
├── api/
│   ├── _lib.js          # Shared: Redis client, CORS, constants
│   ├── tallies.js       # GET /api/tallies
│   ├── token.js         # GET /api/token
│   └── vote.js          # POST /api/vote
├── fmkify-f1.jsx        # React component (static asset, fetched as text)
├── index.html           # Entry point, loads React + Babel, compiles JSX
├── package.json         # Server-side dependency: @upstash/redis
├── vercel.json          # CORS headers config
├── .env.example         # Template for env vars
└── DEPLOYMENT.md        # Implementation notes from FB-001
```

Vercel treats `api/*.js` as serverless functions and everything else as static assets. The `_lib.js` file is prefixed with underscore so Vercel bundles it as a shared module rather than exposing it as a route.

---

## Nuances and Gotchas

**The JSX file has dual compatibility.** It contains `import { useState, ... } from "react"` and `export default function App` for use in environments that handle ES modules (like Claude artifacts). But in the deployed `index.html`, these lines are regex-replaced at runtime because React is loaded as a UMD global. If you add new imports or change the export syntax, the regexes in `index.html` lines 32–38 must be updated to match.

**No build step exists.** There is no webpack, vite, or any bundler. The JSX is compiled by Babel standalone in the browser on every page load. This adds ~1s to initial load. If performance becomes a concern, the natural next step is adding a build step (e.g. Vite) that pre-compiles the JSX — but this changes the deployment model and file structure significantly.

**The `fmkify-f1.jsx` file must keep its `.jsx` extension.** The `index.html` fetches it by that exact filename. An earlier attempt to rename it to `.js` for browser module compatibility was abandoned in favor of the Babel standalone approach.

**Vercel Hobby tier limits.** Serverless functions have a 10-second execution timeout (plenty for Redis HTTP calls). 100GB bandwidth/month. No spend limit concerns at current scale.

**Upstash free tier limits.** 10,000 commands/day. Each vote costs ~7 commands; each tallies read costs ~23. This means roughly 400+ votes/day or 430+ tallies reads/day before hitting the limit. If the app gets meaningful traffic, upgrade to pay-as-you-go ($0.20/100K commands).

**The tallies endpoint has a 5-second edge cache.** This means two users checking rankings within 5 seconds of each other may see slightly stale data. This is intentional to reduce Redis reads.

**Session tokens are not signed or structured.** They are opaque random hex strings used as Redis lookup keys. There is no JWT, no HMAC, no expiration encoded in the token itself — expiration is handled by Redis TTL. This is by design per the feature brief.

**The IP rate limit uses `x-forwarded-for`.** On Vercel this is reliable, but behind other proxies it could be spoofed. The rate limit is a deterrent, not a security boundary.

---

## Version History

| Version | Date | Change |
|---|---|---|
| v1.0.1 | 2026-02-15 | Added self-contained dark background, "Drag or tap" instruction text |
| v1.1.0 | 2026-02-15 | Updated driver photo URLs to 2026 Cloudinary CDN (FB-002) |
| v1.2.0 | 2026-02-15 | "Rosé After Dark" color palette — warm dusty rose/plum theme |
| v2.0.0 | 2026-02-23 | FB-001: Replaced window.storage with Vercel + Upstash Redis backend |

---

## What's Not Done / Future Considerations

- **Custom domain** — not configured yet; instructions in DEPLOY-GUIDE.md
- **No build tooling** — Babel standalone in browser is a dev convenience, not a production best practice
- **No monitoring/alerting** — relies on Vercel's built-in dashboard and Upstash console
- **No authentication** — votes are anonymous; anti-stuffing is rate-limit-based only
- **No real-time updates** — Rankings page fetches on view, doesn't live-update
- **Driver data is hardcoded** — the DRIVERS array and DRIVER_PHOTOS map are in the JSX; adding/removing drivers requires a code change
- **Proof-of-work and OAuth** — evaluated and deferred per feature brief; see FB-001 Alternative Approaches section
