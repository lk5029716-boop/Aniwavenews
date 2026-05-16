# AnimeX

A free anime streaming website that scrapes Aniwaves.ru and supports multiple CDN servers (Echovideo, Vidplay, MegaCloud, WeneverBeenFree).

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080 in dev, assigned by workflow)
- `pnpm --filter @workspace/animex run dev` — run the frontend (port 19786)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5, axios, cheerio, crypto-js, node-cache
- Frontend: React + Vite, hls.js, TanStack Query, Wouter router, Tailwind CSS, sonner
- No database — everything is scraped on-demand with in-memory caching
- Build: esbuild (CJS bundle for api-server)

## Where things live

- `lib/api-spec/openapi.yaml` — source of truth for all API contracts
- `artifacts/api-server/src/lib/anime/` — all scraping and streaming logic
  - `scraper.ts` — Aniwaves.ru scraper (search, details, episodes, servers, embed URLs)
  - `cache.ts` — in-memory NodeCache with per-resource TTLs
  - `types.ts` — shared TypeScript types
  - `providers/` — per-CDN extractors (echovideo, vidplay, megacloud, weneverbeenfree)
- `artifacts/api-server/src/routes/anime.ts` — all anime API routes
- `artifacts/animex/src/` — React frontend
  - `pages/home.tsx` — landing page with search
  - `pages/search.tsx` — search results
  - `pages/anime.tsx` — anime details + episode grid
  - `pages/watch.tsx` — video player with server + sub/dub buttons
  - `components/player/HlsPlayer.tsx` — hls.js-powered HLS player

## Architecture decisions

- No database — anime data is fetched and cached in-memory (NodeCache). Cache TTLs: search=5min, details=30min, episodes=10min, servers=5min. Streams are NOT cached (time-scoped CDN tokens).
- All m3u8 streams are proxied through `/api/proxy` to handle CORS/CDN restrictions. The proxy rewrites relative segment paths to absolute proxied URLs.
- Each server button requests ONLY that specific server — no silent auto-retry to another server. If the server fails, the user sees the error and can pick a different one manually.
- Provider dispatch: URL hostname and server name are used to route to the correct extractor (Echovideo → `/embed-N/getSources`, MegaCloud → `/embed-2/ajax/e-1/getSources`, Vidplay → `/mediainfo/{encodedId}`, WeneverBeenFree → heartbeat API).

## Product

- Search anime by keyword (backed by Aniwaves.ru)
- View anime details (poster, description, genres, episode count, status)
- Episode list with filler markers
- Watch page with:
  - Visible Sub/Dub toggle buttons
  - Visible server buttons (Echovideo, Vidplay, MegaCloud, WeneverBeenFree, etc.)
  - Each server plays ONLY from that server — no hidden fallbacks
  - HLS.js player with proxied m3u8 streams
  - Episode sidebar for quick navigation

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- The `minimumReleaseAge: 1440` in pnpm-workspace.yaml causes `pnpm install` to fail silently when new packages haven't been published for >1 day. Use `pnpm --filter <pkg> add <dep>` explicitly.
- hls.js ships its own TypeScript declarations since v1.x — do NOT add `@types/hls.js`.
- The api-server tsconfig should NOT have `"types": ["node"]` — the base tsconfig has `"types": []` and removing the override lets all installed `@types/*` packages work.
- Streams must be proxied through `/api/proxy` — direct m3u8 URLs from CDNs are CORS-blocked in the browser.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
