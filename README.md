# Whisp

Whisp is a voice-only social network prototype focused on fast audio-first creation and moderation workflows. This monorepo uses pnpm workspaces and Next.js App Router.

## Repository layout

```
apps/
  web/                # Next.js 14 app with API routes, UI, auth, ranking, moderation dashboards
packages/
  config/             # Shared tsconfig + eslint settings
  types/              # Zod schemas + ranking config
  ui/                 # Reusable React components (Card, WaveformPreview)
prisma/               # Prisma schema + seed script
```

## Features

- Browser recording with MediaRecorder, waveform preview via Web Audio API, silence trimming stub, 60s limit @ 48kHz.
- Direct-to-S3 uploads with presigned URLs via `/api/upload-url`.
- NextAuth (Email magic link + GitHub OAuth) with JWT sessions.
- Voice-only entities: Posts, Comments, Reactions ("vibes"), DMs, transcripts, moderation reports.
- Ranking utility blending Wilson score, Reddit-style hot ranking, and social affinity boosts with Vitest unit tests.
- Transcription interface with default Whisper CLI integration and hooks for external providers.
- Perspective API text moderation with configurable thresholds, quarantine queue, and admin dashboard.
- Messaging MVP with TODO for E2EE (Double Ratchet) in comments.
- Notifications plumbing and placeholders for push/web push.
- Docker Compose for Postgres + MinIO + Redis.
- Prisma schema + seed script for demo users/posts.
- ESLint, Prettier, lint-staged, Husky hooks, Vitest, and GitHub Actions CI (typecheck + tests).
- README disclaimer: captions are assistive only; moderation never relies solely on ASR.

## Getting started

```bash
pnpm install
cp .env.example .env
pnpm exec prisma generate
pnpm dev # runs Next.js web app
```

### Dockerized services

```
docker compose up -d
```

Services:

- `postgres:5432` – application database.
- `minio:9000` – S3-compatible storage (console on :9001). Configure bucket `whisp`.
- `redis:6379` – placeholder for queues / rate limiting.

### Environment variables

- `.env` at repo root powers Prisma + backend utilities.
- `apps/web/.env` extends for Next.js runtime (copy from `.env.example`).
- Never commit secrets; use `direnv` or 1Password for sensitive values.

Important vars:

- `DATABASE_URL` – Postgres DSN.
- `NEXTAUTH_SECRET`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `EMAIL_*` – Auth.js providers.
- `S3_UPLOAD_URL`, `MOCK_PRESIGN` – presigned upload target.
- `PERSPECTIVE_API_KEY` – Google Perspective API key.
- `WHISPER_BIN`, `TRANSCRIBER` – transcription pipeline switches.

## Recording UX

- Feature-detects MediaRecorder MIME support (prefers WebM/Opus, fallback MP4/AAC for Safari).
- Shows live waveform via `AnalyserNode` and duration/loudness estimate.
- Trim-leading/trailing silence stub uses amplitude threshold; replace with production VAD as needed.
- Enforces 60s max duration and 48kHz target sample rate.
- Optional `ffmpeg.wasm` integration can be added later for transcoding.

## Upload flow

1. Client records audio, runs silence-trim + loudness normalization.
2. Client calls `POST /api/upload-url` with `{contentType, ext}` (validated with Zod) to get presigned S3 (or MinIO) URL.
3. Client PUT/POSTs file directly to storage using returned headers/fields.
4. Client creates the Post via `POST /api/posts` with audio metadata (duration, codec, waveform, loudness, hash) + optional caption.
5. Server transcribes audio, runs Perspective moderation on transcript, stores metadata + transcript segments in Postgres, and queues notifications.

For local dev, keep `MOCK_PRESIGN=true` to bypass real S3 writes or configure MinIO credentials in `.env`.

### Captions & moderation disclaimer

Captions are provided for accessibility only and may be inaccurate. Safety reviews and moderation must never rely solely on ASR outputs.

## Prisma & database

- Schema covers Users, Profiles, Follow/Block/Mute equivalents, Posts, AudioAsset, Comment, Reaction (vibes), Like, Repost, Messages, Conversations, Transcript/Segments, Reports, Notifications.
- `pnpm prisma:migrate` to create the schema, `pnpm prisma:seed` to load demo users/posts.

## Testing & quality

- `pnpm lint` – ESLint for all packages.
- `pnpm typecheck` – strict TypeScript.
- `pnpm test` – Vitest (ranking utilities) plus placeholder for future Playwright flows (record → post → feed).
- GitHub Actions ensures typecheck + tests on pushes and PRs.

## Playwright smoke tests

Add future tests under `apps/web/tests` to cover record -> upload -> feed ingestion. Configure CI headless browser once network storage is ready.

## Troubleshooting

- **Presigned uploads / CORS**: ensure MinIO bucket has CORS policy allowing `PUT` from `http://localhost:3000`. Update `S3_UPLOAD_URL` to match MinIO gateway.
- **Safari recording**: uses AAC fallback; ensure MIME detection remains in sync with MediaRecorder support.
- **Prisma client**: regenerate after schema changes with `pnpm prisma:generate`.
- **Docker networking**: Next.js server expects `postgres` and `minio` hostnames when running inside containers.

## Data privacy & safety

- Treat raw voice data as personal data; expose delete/export APIs before GA.
- Do **not** attempt biometric voiceprints.
- Sanitize filenames, enforce MIME/duration limits server-side, and rotate presigned URLs quickly.
- Rate limit per-user and per-IP when wiring API middleware (Redis placeholder included).

## Key code references

- Recording UX: `apps/web/components/recorder.tsx`
- Upload client: `apps/web/lib/uploads.ts`
- Ranking utility + tests: `apps/web/lib/ranking`
- Storage presign stub: `apps/web/lib/storage.ts`
- Transcription/moderation pipeline: `apps/web/lib/transcriber.ts`, `apps/web/lib/moderation.ts`
- Prisma schema: `prisma/schema.prisma`
- API routes: `apps/web/app/api/*`
- Admin moderation page: `apps/web/app/admin/moderation/page.tsx`

Enjoy building Whisp! Contributions welcome.
