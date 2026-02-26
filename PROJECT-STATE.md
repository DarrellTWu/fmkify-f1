# FMKify — Project State & Architecture

**Last updated:** 2026-02-25
**Repo:** github.com/DarrellTWu/fmkify-f1
**Live:** https://www.fmkify.com
**Admin:** admin@fmkify.com

---

## What This Is

FMKify is a "F*ck, Marry, Kill" voting game platform. Users are shown 3 random people from a roster, assign F/M/K to each, and submit. Community-wide tallies are tracked and displayed on a rankings page.

The first (and currently only) game is **FMKify F1** — the 2026 Formula 1 grid (22 drivers). The site is designed to host multiple games at different subpaths in the future.

---

## Architecture Overview

```
www.fmkify.com/              → Static homepage (index.html) with poll
www.fmkify.com/f1/            → F1 game (single-file React component)
www.fmkify.com/f1/rankings/   → F1 rankings (same React app, URL-routed)
www.fmkify.com/api/f1/*       → F1 game API (Vercel serverless functions)
www.fmkify.com/api/poll        → Homepage poll API
```

**Stack:** Vercel (hosting + serverless) + Upstash Redis (data) + vanilla React (client). No build step. No framework. No bundler.

---

## File Structure (as deployed)

```
fmkify-f1/
├── index.html              # Homepage — static HTML + inline JS for poll
├── vercel.json             # Routing, CORS headers, trailing slash config
├── package.json            # Only dependency: @upstash/redis
├── api/
│   ├── _lib.js             # Shared: Redis client, CORS helper, constants
│   ├── poll.js             # GET/POST /api/poll — homepage "what's next" poll
│   └── f1/
│       ├── tallies.js      # GET /api/f1/tallies — public read-only vote totals
│       ├── token.js        # GET /api/f1/token — session token issuance
│       └── vote.js         # POST /api/f1/vote — vote submission
└── f1/
    ├── index.html          # Loads React + Babel, fetches and compiles the JSX
    └── fmkify-f1.jsx       # The entire F1 game — single-file React component (~595 lines)
```

### Key architectural decisions

- **No build step.** The F1 game is a single `.jsx` file. The `f1/index.html` loads React 18 and Babel standalone from CDN, fetches `fmkify-f1.jsx` as raw text, strips the ES module `import` (React is global via UMD), compiles JSX in the browser, and mounts the app. This was chosen to keep the artifact-origin simplicity of the project — it started as a Claude artifact.

- **No router library.** The game/rankings view toggle uses the History API (`pushState`/`popstate`). The `getInitialView()` function reads the current pathname (stripping trailing slashes) to determine which view to render on load.

- **API routes are Vercel serverless functions.** Any `.js` file inside `api/` becomes an endpoint. Files prefixed with `_` (like `_lib.js`) are NOT deployed as endpoints — Vercel skips them. This is how shared code works.

- **Subpath structure for multi-game future.** The F1 game lives at `/f1/` with its API at `/api/f1/`. New games would follow the same pattern: `/nba/` + `/api/nba/`, etc. The shared `_lib.js` (Redis client, CORS, error helper) sits in `api/` for reuse.

---

## The F1 Client (fmkify-f1.jsx)

A single-file React component, ~595 lines, containing everything: data, components, game logic, CSS.

### Structure (by line range)

| Lines | Section |
|---|---|
| 1–26 | `DRIVERS` array — 22 drivers with id, name, team, number |
| 28–32 | `TC` — team color hex map |
| 34–59 | `F1_CDN` + `DRIVER_PHOTOS` — Cloudinary URLs for driver portraits |
| 63–103 | **Storage functions** — `fetchToken()`, `loadGlobal()`, `recordVote()` — all async fetch to `/api/f1/*` |
| 105–141 | `randomTrio()`, `spawnConfetti()`, keyframe injection, `useIsMobile()` |
| 143–184 | `DriverCard` component — card with photo, team color, F/M/K buttons, drag-drop targets |
| 187–336 | `GameView` component — main game loop, badge bar, submit flow, slowdown overlay |
| 338–370 | `RankingsView` component — sortable leaderboard |
| 375–384 | `Footer` component — links to homepage + poll teaser |
| 386–427 | `App` component — view routing, token fetch, data loading |
| 429–595 | `CSS` template literal — all styles including responsive breakpoints |

### Data contract

The client and server communicate using one shape:

```json
{
  "tallies": {
    "1": { "f": 12, "m": 8, "k": 3 },
    "2": { "f": 5, "m": 14, "k": 6 },
    ...
  },
  "totalVotes": 247
}
```

`emptyTallies()` returns this shape with all zeros. `GameView` and `RankingsView` both consume it identically. If you change this shape, both views and all three API endpoints need updating.

### Submit flow (important)

The submit is **not fire-and-forget**. `GameView.submit()` awaits the API response before showing confetti. Error handling:

- `budget_exceeded` → shows a ☕ overlay with the server's friendly message + "Refresh & Resume" button
- `cooldown` → silently waits 1.1s and retries once
- `invalid_token` / `internal` → silently fails, unlocks the submit button
- Success → confetti, advances round

### Interaction modes for F/M/K assignment

Three ways to assign, all coexisting:

1. **Tap the F/M/K buttons** directly on each driver card
2. **Drag badges** (desktop) from the badge bar onto driver cards
3. **Tap-to-select badges** — click a badge to "pick it up" (it glows/pulses with `.picked` class), then click any driver card to assign. Click the same badge again to deselect.

Used/assigned badges appear faded (`.used` class). Clicking a faded badge unassigns that choice.

### Driver images

Served from the F1 Cloudinary CDN with transformation parameters in the URL:

```
c_fill,g_face,w_480,h_360,y_-30
```

- `c_fill` — fills the frame
- `g_face` — centers on detected face
- `w_480,h_360` — 4:3 landscape crop
- `y_-30` — shifts crop window up so face is in upper third, cuts at mid-chest

**Do not add CSS `object-fit` or `aspect-ratio` cropping on top of this.** We tried multiple CSS-based cropping approaches and they all fought with Cloudinary's face detection. Let Cloudinary deliver the exact crop and display the image at `width:100%` with no additional constraints.

---

## API Endpoints

### F1 Game

All return `{ error, message }` on non-2xx responses.

| Endpoint | Method | Auth | Purpose |
|---|---|---|---|
| `/api/f1/token` | GET | None | Issues 128-bit hex session token. IP rate-limited to 1 per 30s. |
| `/api/f1/vote` | POST | Session token | Validates vote, enforces cooldown (1s) + budget (900), atomically increments tallies. Returns updated tallies. |
| `/api/f1/tallies` | GET | None | Returns current `{ tallies, totalVotes }`. 5s edge cache. |

### Homepage Poll

| Endpoint | Method | Auth | Purpose |
|---|---|---|---|
| `/api/poll` | GET | None | Returns `{ votes: { nba: N, wwe: N, ... } }` |
| `/api/poll` | POST | None | Accepts `{ choice }`. IP-limited to 1 vote per 24h. Client also uses localStorage for instant dedup. |

---

## Anti-Stuffing (F1 Game)

Three layers:

1. **1-second cooldown** per session (Redis timestamp check)
2. **900-vote budget** per session (Redis counter). Friendly message on exhaust, user refreshes to get new session.
3. **IP-based token rate limit** — 1 new session per IP per 30 seconds

Combined theoretical max: ~3,484 votes/hour from a single IP.

---

## Redis Key Schema

| Key | Type | TTL | Contents |
|---|---|---|---|
| `driver:{1-22}` | Hash | None | `{ f: int, m: int, k: int }` |
| `totalVotes` | String | None | Integer counter |
| `session:{token}` | Hash | 24h | `{ lastVote: epoch_ms, votes: int }` |
| `ip-limit:{ip}` | String | 30s | `1` (existence = rate limited) |
| `poll:next-game` | Hash | None | `{ nba: int, wwe: int, ... }` |
| `poll-voted:{ip}` | String | 24h | `1` (existence = already voted) |

No pre-seeding required. All keys are auto-created on first write (`HINCRBY`/`INCR` create missing keys starting from 0).

---

## Deployment Details

### Hosting

- **Platform:** Vercel (Hobby plan / free tier)
- **GitHub repo:** `DarrellTWu/fmkify-f1`, branch `main`
- **Auto-deploy:** Vercel rebuilds on every push to `main`
- **Region:** IAD1 (US East — Washington, D.C.)
- **Node runtime:** 24

### Domain

- **Primary:** `www.fmkify.com`
- **Vercel default:** `fmkify-f1.vercel.app` (still active)
- DNS is configured at the registrar with a CNAME to Vercel. SSL is auto-provisioned.

### Environment Variables (Vercel)

| Variable | Purpose |
|---|---|
| `UPSTASH_REDIS_REST_URL` | Upstash Redis HTTP endpoint |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis auth token |
| `ALLOWED_ORIGIN` | CORS origin for server-side checks (currently `https://www.fmkify.com`) |

### Upstash Redis

- Single regional instance (us-east-1)
- Free tier: 10,000 commands/day
- Eviction: OFF
- Each F1 vote costs ~7 commands. Each tallies read costs ~23 commands.

### vercel.json Configuration

```json
{
  "trailingSlash": true,
  "headers": [{ CORS headers on /api/* }],
  "rewrites": [
    { "/f1/rankings/" → "/f1/index.html" }
  ]
}
```

- `trailingSlash: true` — Vercel auto-redirects `/f1` to `/f1/`. This solved an issue where `/f1` without the trailing slash returned a 404.
- The rewrite for `/f1/rankings/` is necessary because it's a client-side route, not a real file. Without it, direct navigation or refresh on `/f1/rankings/` would 404.
- CORS headers are set both in `vercel.json` (edge-level, for OPTIONS preflight) and in `_lib.js` (function-level, for actual responses). Both must match.

---

## Nuances and Gotchas Learned During Development

### JSX in the browser
Browsers cannot natively execute `.jsx` files. We tried three approaches:
1. **ES module import** — failed because Vercel serves `.jsx` with MIME type `text/jsx`, which browsers reject for module scripts.
2. **Rename to `.js`** — failed because the file still contains JSX syntax (`<div>`, etc.) which is a syntax error in plain JS.
3. **Babel standalone (current approach)** — `f1/index.html` loads Babel from CDN, fetches the JSX as raw text, replaces the `import` statement with global React destructuring, compiles JSX→JS via `Babel.transform()`, injects the compiled code as a `<script>`, and mounts. This works but adds ~200ms of client-side compilation.

If a build step is ever introduced, this entire approach should be replaced with a proper bundler (Vite, esbuild) that compiles JSX at build time.

### CORS origin must match in two places
`vercel.json` handles the CORS headers at the edge (for preflight OPTIONS). `_lib.js` sets them in the function response. If these diverge, you get inconsistent CORS behavior. When changing domains, update both.

### `_lib.js` fallback origin
The `_lib.js` CORS helper falls back to `https://fmkify-f1.vercel.app` if `ALLOWED_ORIGIN` env var is missing. The production env var is set to `https://www.fmkify.com`. If you see CORS errors, check the env var first.

### API import paths depend on directory depth
`api/poll.js` imports from `./_lib.js` (same directory). `api/f1/vote.js` imports from `../_lib.js` (one level up). Getting this wrong causes a `FUNCTION_INVOCATION_FAILED` 500 error with no useful message in the browser — you have to check Vercel's runtime logs.

### Trailing slashes
Vercel's `trailingSlash: true` setting auto-redirects all URLs to include a trailing slash. The client's History API pushes and the `getInitialView()` function both strip trailing slashes before checking paths, to avoid mismatches. If you add new client-side routes, remember to handle both `/path` and `/path/`.

### Cloudinary face cropping
Do NOT layer CSS cropping (`object-fit`, `aspect-ratio`, `object-position`) on top of Cloudinary's `g_face` gravity. They fight each other unpredictably across different driver photos. Let Cloudinary deliver the exact crop via URL parameters and render the image at natural dimensions with `width:100%` only.

### Deployment order
API routes and client must be deployed together (or API first). If the client deploys with new API paths before the routes exist, all fetches 404. In practice this is handled by Vercel's atomic deployments from Git push — everything ships at once.

### `API_BASE` must match the route structure
The client's `API_BASE` constant (currently `"/api/f1"`) is prepended to all fetch paths (`/token`, `/tallies`, `/vote`). If you move the API routes, update this constant. A past bug had `API_BASE = "/api/f1"` with fetch paths still containing `/api/` (e.g., `${API_BASE}/api/token`), producing double-pathed requests to `/api/f1/api/token`.

---

## What's Not Built Yet

- **Other games** (NBA, WWE, Love Island, Bridgerton, The Office) — poll is live collecting interest
- **No build/bundle step** — JSX is compiled in the browser via Babel standalone
- **No CI/CD** beyond Vercel's auto-deploy on push
- **No monitoring/alerting** — relies on Vercel's built-in logs and Upstash's dashboard
- **No admin panel** — Redis data can be viewed/modified through the Upstash console
- **No analytics** — no tracking, no cookies (other than the poll localStorage key `fmkify-poll-voted`)
- **Mobile drag-drop for badges** — works via touch events but the badge bar is hidden on mobile (`display:none!important`). Mobile users use the per-card F/M/K buttons instead.
