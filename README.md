# Server-test

Server-test is an IRIS/Laravel-oriented employee registration and user search workspace.

The root Next.js site is a lightweight status dashboard for the project. Its behavior is connected to the separate Firebase project `server-test-ef8cb`, so Firestore updates can change the displayed system status without rebuilding Vercel.

## Main areas

- Employee registration samples in `Test/EmployeeReg.cls`
- User search sample in `DEMO/UserSearch.cls`
- Laravel front-end/API work under `laravel-front/`
- Mobile/API register sample in `iris-mobile-api-with-register.cls`
- Next.js Firebase dashboard under `src/`

## Firebase

Vercel should use the `NEXT_PUBLIC_FIREBASE_*` variables from `.env.example`. The dashboard reads `serverStatus/main` from Firestore.
