# Squad Health Check

A web app for running Spotify-style Squad Health Checks with your team. Built with React, Vite, Tailwind CSS, and Supabase.

## Features

- **No login required** — team members vote via a shared link
- **Admin PIN** — 4-digit PIN gates the results page (enforced by Supabase RLS via an `x-admin-pin` header)
- **Customisable card deck** — edit, add, or remove cards before launching (10 Spotify-style defaults)
- **Live results** — Supabase Realtime subscription updates the page as new votes land; RAG bars, heatmap, trend arrows (vs. the previous session with the same name), and anonymised comments
- **Export** — copy a plain-text summary to clipboard
- **My Sessions** — the Landing page lists sessions you've created on this browser (stored in `localStorage`) for quick access to their results
- **Mobile friendly** — optimised for voting on phones

## Setup

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Open the **SQL Editor** in the Supabase dashboard
3. Copy the contents of `schema.sql` and run it — this creates the `sessions` and `responses` tables with Row Level Security policies. The file also contains optional `pg_cron` snippets to auto-delete sessions older than 90 days to stay within the Supabase free tier.

### 2. Configure Environment Variables

Create a `.env` file in the project root with your Supabase credentials:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

You can find these values in your Supabase dashboard under **Settings → API**.

### 3. Install & Run Locally

```bash
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

## Deploy to Vercel

1. Push this repo to GitHub
2. Import it in [vercel.com](https://vercel.com)
3. Add the two environment variables (`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`) in the Vercel project settings
4. Vercel will auto-detect Vite and deploy

The build command is `npm run build` and the output directory is `dist`.

## How It Works

### Admin Flow

1. Visit the app and click **Create New Session**
2. Enter a session name, set a 4-digit PIN, and optionally customise the card deck
3. Share the generated link with your team
4. View results by entering your PIN on the results page

### Team Member Flow

1. Open the shared link
2. Vote on each card: Awesome (green) / OK (amber) / Struggling (red)
3. Optionally leave a comment per card
4. Submit — a token is stored in localStorage to prevent duplicate submissions

## Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS v4
- **Backend**: Supabase (PostgreSQL + Row Level Security, Realtime for live results)
- **Routing**: React Router v7 with hash-based routing (`#/session/:id`)
- **Sanitization**: DOMPurify strips unsafe HTML from comments before they're stored
- **Tests**: Vitest + React Testing Library (`npm test`)
