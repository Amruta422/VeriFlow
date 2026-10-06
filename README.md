# VeriFlow · MPloyChek software intern challenge

A small Angular and Node.js application for employment verification workflows. The interface and demo data are original to this project. The API uses a local JSON file as its lightweight challenge storage, with seeded accounts and role-aware record access.

## Requirements

- Node.js 18.13+ and npm 8+
- A modern browser

## Run locally

```sh
npm install
npm start
```

The Angular app runs at `http://localhost:4200`; the API runs at `http://localhost:3000`. The Angular development server proxies `/api` requests to the API. To run separately, use `npm run api` and `npm run client` in two terminals. `npm run build` creates the production client build; `npm run build:api` compiles the TypeScript API.

## Demo sign-ins

| Role | User ID | Password |
| --- | --- | --- |
| General user | `amruta` | `demo123` |
| Admin | `melody` | `demo123` |

Other seeded accounts: `jordan`, `samira`, and `alex`; all use `demo123`. Choose the matching role on the sign-in screen. General users see only records assigned to their account. Admins can view all records and manage workspace accounts.

## Async processing

The response delay selector on the dashboard changes the delay used for API requests. The API accepts a `delay` query parameter, clamps it between 0 and 5,000 ms, then completes the request asynchronously. Loading states are shown while records and user data are fetched.

## API

- `POST /api/auth/login?delay=700` — validate demo credentials and issue a session token.
- `GET /api/me?delay=700` — return the current user profile.
- `GET /api/records?delay=700` — return role-filtered verification records.
- `GET /api/users?delay=700` — administrator-only user list.
- `POST /api/users?delay=700` — administrator-only account creation.
- `PATCH /api/users/:id?delay=700` — administrator-only account updates.
- `DELETE /api/users/:id?delay=700` — administrator-only account removal.

API responses omit passwords and internal login IDs. Role checks run on the API, not only in the Angular interface. Sessions are in-memory demo tokens, and passwords are plain seeded demo values in `data/database.json`; this is deliberately a local challenge implementation and is not production authentication. In a deployed system, replace these with a managed identity provider, hashed credentials, durable database storage, TLS, and audited access policies.

## Project layout

```text
src/app/core/        auth state, interceptor, guards, API client
src/app/features/    sign-in, dashboard, admin directory
src/app/models.ts    shared front-end types
server/              typed REST API and file store
data/database.json   seeded local demo data and persisted account edits
```
