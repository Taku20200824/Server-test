# Server-test The Isle Community

This repository now uses the same Next.js application structure as `Taku20200824/THE-ISLE`, but it is wired for its own Firebase project:

- Firebase project: `server-test-ef8cb`
- Vercel project: `server-test`
- Production URL: `https://server-test-pi-eight.vercel.app`

Do not connect this repo to `taku-f8db6`; that Firebase project belongs to THE-ISLE.

## Local Setup

```bash
pnpm install
cp .env.example .env
pnpm prisma:generate
pnpm dev
```

## Firebase

Firestore is enabled in `asia-northeast2` and seeded with Server-test data collections such as `serverStatus`, `announcements`, `features`, `rules`, `events`, `staff`, `siteText`, `scores`, `mapMarkers`, and `gallery`.

Public reads are allowed for site content. Writes are admin-only by `firestore.rules`.

## Vercel

Set the Firebase public variables from `.env.example` in Vercel Environment Variables. Admin/private variables can stay empty until admin features are needed.
