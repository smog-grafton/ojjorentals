# Ojjo Rentals – Frontend

Property management frontend for [Ojjo Rentals](https://github.com/smog-grafton/ojjorentals), built with Next.js. It uses a **Laravel API backend** for auth, tenants, invoices, payments, and ioTec Pay.

- **Backend (Laravel):** [https://ojjorentals.eavisualarts.org](https://ojjorentals.eavisualarts.org) (production)
- **Frontend:** Deploy on [Vercel](https://vercel.com) or run locally.

---

## Environment variables

Copy `.env.example` to `.env` and set the values below. **Never commit `.env`** (it is in `.gitignore`).

### Local development

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_APP_URL` | Full URL of this Next.js app | `http://localhost:3000` |
| `NEXTAUTH_URL` | NextAuth callback URL | `http://localhost:3000/api/auth` |
| `NEXTAUTH_SECRET` | Secret for NextAuth (generate with `openssl rand -base64 32`) | (random string) |
| `NEXT_PUBLIC_API_URL` | Laravel API base URL (no trailing slash) | `http://127.0.0.1:8000` |
| `API_URL` | Same as above (server-side calls) | `http://127.0.0.1:8000` |

Optional: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` (Google OAuth), `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` (maps).

### Production (e.g. Vercel)

Use your **live** frontend URL and the **production Laravel backend**:

| Variable | Production value |
|----------|-------------------|
| `NEXT_PUBLIC_APP_URL` | Your frontend URL, e.g. `https://your-app.vercel.app` |
| `NEXTAUTH_URL` | `https://your-app.vercel.app/api/auth` |
| `NEXTAUTH_SECRET` | Strong random secret (e.g. from `openssl rand -base64 32`) |
| `NEXT_PUBLIC_API_URL` | `https://ojjorentals.eavisualarts.org` |
| `API_URL` | `https://ojjorentals.eavisualarts.org` |

The Laravel backend at **https://ojjorentals.eavisualarts.org** must have CORS and `FRONTEND_URL` set so the production frontend can call the API and use the pay link in emails.

---

## Quick start (local)

```bash
# Install dependencies
npm install

# Copy env and edit .env (point NEXT_PUBLIC_API_URL / API_URL to your Laravel backend)
cp .env.example .env

# Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Ensure the Laravel backend is running (e.g. `php artisan serve` in the backend repo) at the URL set in `NEXT_PUBLIC_API_URL` and `API_URL`.

---

## Deploy on Vercel

1. **Import the repo**  
   In [Vercel](https://vercel.com): Add New Project → Import `smog-grafton/ojjorentals`.

2. **Set environment variables** (Project → Settings → Environment Variables)  
   Add the **Production** variables from the table above:
   - `NEXT_PUBLIC_APP_URL` = your Vercel URL (e.g. `https://ojjorentals.vercel.app`)
   - `NEXTAUTH_URL` = `https://<your-vercel-domain>/api/auth`
   - `NEXTAUTH_SECRET` = (generate a new secret)
   - `NEXT_PUBLIC_API_URL` = `https://ojjorentals.eavisualarts.org`
   - `API_URL` = `https://ojjorentals.eavisualarts.org`

3. **Deploy**  
   Vercel will detect Next.js. Build command: `npm run build`. No extra config needed.

---

## Backend (Laravel) production notes

The frontend expects the API at **https://ojjorentals.eavisualarts.org**. On the Laravel server:

- Set **CORS** so your Vercel (and local) frontend origins are allowed (e.g. in `config/cors.php`).
- Set **`FRONTEND_URL`** in `.env` to your live frontend URL (e.g. `https://your-app.vercel.app`) so invoice/reminder emails and PDFs contain the correct “Pay online” link.

---

## Project structure

- `src/app/` – Next.js App Router (including `[lang]/(blank-layout-pages)/pay/` for public pay page)
- `src/views/` – Main views (dashboards, rentals, Pay, etc.)
- `src/components/` – Reusable UI
- `src/services/` – API client
- `src/contexts/` – React context (e.g. auth, settings)

---

## License

Apache-2.0 (see [LICENSE](LICENSE)).
