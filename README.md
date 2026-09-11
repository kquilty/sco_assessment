# sco_assessment
An assessment application for S.C.O (MySQL, NestJS, React + TypeScript)

## Setup

**Backend** (from `backend/`):

```bash
docker compose up -d            # MySQL on localhost:3306
cp .env.example .env
npm install
npx prisma migrate deploy       # create tables
npx tsx prisma/seed.ts          # demo patients, plans and sessions
npm run start:dev               # http://localhost:3000
```

**Frontend** (from `frontend/`): `npm install`, then `npm run dev` (http://localhost:5173).

The generated Prisma client is committed, so `prisma generate` is only needed after schema changes.

## Assumptions

- New sessions are added to the patient's first ("active") plan; there's no explicit active flag yet.
- `treated_at` is when the treatment happened (entered by the clinician, stored in UTC); `created_at` is when the record was saved.
- `clinician_id` is free text for now; in a real system it would reference a users table.
- Sessions are create-only, and all data is loaded in one request with no pagination.

## Security and risk

There is no authentication or authorization. Because this is patient health data, every endpoint except the `GET /` health check should require a logged-in clinician, with a check that they can access that patient (IDs are sequential, so they're easy to guess). `clinician_id` should come from the authenticated user rather than the request body, and the hard-coded credentials and open CORS are for local development only.

## Decisions where reasonable engineers might differ

**1. Device parameters as a JSON column.** Settings vary by device and aren't known up front, so a JSON column avoids a migration for every new setting. The trade-off is that the database can't enforce types or required keys, and querying inside the JSON is awkward. With a small, stable set of devices, typed columns or a key/value table would be a reasonable alternative.

**2. Sessions created through the patient, not the plan.** `POST /patients/:id/sessions` lets the server decide which plan a session belongs to, which matches how a clinician thinks ("record a session for this patient"). The alternative, `POST /plans/:id/sessions`, is more explicit, and would respect the plan picked in the frontend, which the current approach ignores. The current approach needs a proper "active plan" flag to be fully correct.

...oh, and the interface: ZERO styling which was hard to let-fly.
