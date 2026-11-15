# Node.js – Express Backend for ODD17

## Setup

```bash
cd backend-node
npm install
cp .env.example .env   # edit .env as needed
npm run dev
```

## Environment

Copy `.env.example` to `.env` and set:
- `PORT` – API port (default 5000)
- `CLIENT_URL` – React dev server URL (default http://localhost:3000)
- `JWT_SECRET` – strong secret string
- `DB_PATH` – path to your SQLite file (default ../backend/database/database.sqlite)

## Endpoints (mirrors Laravel exactly)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/ping | - | Health check |
| GET | /api/stats | - | Global stats |
| GET | /api/indicators | - | Key indicators |
| GET | /api/categories | - | All categories |
| GET | /api/cities | - | Cities with events |
| GET | /api/events | - | Events list (filter/search/paginate) |
| GET | /api/events/:idOrSlug | - | Event details |
| POST | /api/contact | - | Contact form |
| POST | /api/register | - | Register |
| POST | /api/login | - | Login |
| POST | /api/forgot-password | - | Forgot password |
| GET | /api/user | ✓ | Current user |
| GET | /api/me | ✓ | Current user |
| POST | /api/logout | ✓ | Logout |
| POST | /api/events | ✓ (assoc/admin) | Create event |
| PUT | /api/events/:id | ✓ (owner/admin) | Update event |
| DELETE | /api/events/:id | ✓ (owner/admin) | Delete event |
| POST | /api/events/:id/participate | ✓ (volunteer) | Apply to event |
| GET | /api/my-participations | ✓ | My participations |
| POST | /api/events/:id/partnerships | ✓ (enterprise) | Propose partnership |
| GET | /api/my-partnerships | ✓ | My partnerships |
| GET | /api/dashboard | ✓ | Dashboard by role |
