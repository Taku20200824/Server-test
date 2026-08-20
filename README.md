# Server-test The Isle Community

This repository is now set up as a Vercel-ready Next.js app inspired by `THE-ISLE`, but it must use its own separate Firebase project for live site data.

Important: do not connect this repo to `taku-f8db6`. That Firebase project belongs to `THE-ISLE`.

## Stack

- Next.js 15 App Router
- TypeScript
- Firebase client SDK
- Firestore security rules
- Vercel deployment config

The old IRIS/Laravel files are still in the repository, but the root `package.json` and `src/app` project are what Vercel will build.

## Local Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Create A Separate Firebase Project

1. Open Firebase Console.
2. Create a new project for this repo, for example `server-test-the-isle`.
3. Add a Web App inside that Firebase project.
4. Copy only that new Web App config into Vercel Environment Variables and `.env.local`.
5. Enable Firestore Database.
6. Create `serverStatus/main` in the new project.
7. Deploy the rules from `firestore.rules`.

Required variables:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_SITE_NAME=ASIA JP,MNG,KR Test
NEXT_PUBLIC_DISCORD_URL=https://discord.gg/vmn3YjCZSE
NEXT_PUBLIC_SERVER_IP=209.102.250.73
NEXT_PUBLIC_SERVER_PORT=9075
NEXT_PUBLIC_SERVER_LOCATION=Singapore
```

Example `serverStatus/main` document for the new Firebase project:

```json
{
  "serverName": "ASIA JP,MNG,KR Test",
  "status": "online",
  "ip": "209.102.250.73",
  "port": 9075,
  "location": "Singapore",
  "onlinePlayers": 0,
  "maxPlayers": 32,
  "version": "Evrima",
  "map": "Gateway",
  "discordUrl": "https://discord.gg/vmn3YjCZSE",
  "hostingProvider": "BisectHosting"
}
```

## Firestore Collections

The rules already allow public reads and admin-only writes for these collections:

```text
serverStatus
siteText
announcements
newsCards
features
rules
dinosaurs
scores
events
staff
mapMarkers
gallery
playerProfiles
admins
```

To make yourself an admin, create this document after enabling Firebase Auth:

```text
admins/{yourFirebaseUid}
```

## Vercel

Use these settings if Vercel does not detect them automatically:

```text
Framework Preset: Next.js
Install Command: npm install
Build Command: npm run build
Output Directory: .next
```

Then add the new Firebase project's environment variables in Vercel Project Settings -> Environment Variables and redeploy.
