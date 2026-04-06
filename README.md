# AI Chat

A full-stack chat app: users register with name and email, talk to **OpenAI (GPT-4o mini)** through a small **Express** API, and see history in a **Vue 3** UI. Messages are stored in **Postgres (Neon)** via **Drizzle ORM**; **Stream Chat** backs real-time user/channel features alongside the AI replies.

---

## Architecture

The repo is split into two packages:

| Package | Role |
|--------|------|
| **`chat-ai-api`** | REST API: auth-style registration, chat completion, history, clear history. TypeScript + Express. |
| **`chat-ai-ui`** | SPA: home (register), chat view, Pinia state, calls the API over HTTP. Vue 3 + Vite. |

The UI and API run as separate dev servers (e.g. Vite on port 5173, API on `PORT` or 5000). The UI uses `VITE_API_URL` to reach the backend.

---

## Tech stack

### Frontend (`chat-ai-ui`)

- **Vue 3** with **Composition API** and `<script setup>` — modern defaults, good TypeScript integration.
- **Vite** — fast dev server and builds.
- **Vue Router** — `/` (home / register) and `/chat`.
- **Pinia** — user session and chat messages; **pinia-plugin-persistedstate** keeps the user logged in across refreshes (no separate auth server; “login” is register + stored identity).
- **Axios** — HTTP client to the API.
- **Tailwind CSS v4** — utility-first styling with `@tailwindcss/vite`.

### Backend (`chat-ai-api`)

- **Express 5** — minimal REST surface, JSON body parsing, CORS for the SPA.
- **OpenAI Node SDK** — `gpt-4o-mini`; recent DB turns are sent as context for continuity.
- **Stream Chat** — server-side client to upsert users and post assistant messages to a channel (optional real-time / future mobile clients).
- **Drizzle ORM** — schema-first SQL, type-safe queries, migrations via **Drizzle Kit**.
- **Neon + `@neondatabase/serverless`** — serverless Postgres over HTTP; pairs cleanly with Drizzle’s `neon-http` driver.

### Data model (high level)

- **`users`** — `id` is a **string** derived from email (sanitized) so it matches **Stream Chat user IDs** and API `userId` without a separate mapping table.
- **`chats`** — rows per exchange: `user_id`, `message`, `reply`, timestamps.

---

## Design decisions

1. **String user IDs** — Email is normalized to a Stream-safe `userId`; the same value is the Postgres `users.id` and foreign key context in `chats`, avoiding integer IDs that don’t match Stream.
2. **Drizzle + Neon** — Migrations stay in-repo; Neon hosts Postgres without running a local server in production. The serverless driver fits serverless/edge-style deploys later.
3. **Two persistence layers** — Postgres holds durable chat history and user rows; Stream holds chat network features. Clearing history in this project clears **Postgres** only unless you extend the API to truncate Stream channels.
4. **Pinia persistence** — Survives refresh for UX; not a substitute for server-side auth—treat as client-held session for a demo / internal tool.
5. **Vue over React/Next** — Fits a lightweight SPA with router + store; no SSR requirement for the current scope.

---

## Prerequisites

- **Node.js** (LTS recommended)
- **npm**
- Accounts / keys: **OpenAI**, **Stream Chat**, **Neon** (Postgres connection string)

---

## Environment variables

### `chat-ai-api/.env`

Create from this list (values are yours):

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Neon Postgres connection string |
| `OPENAI_API_KEY` | OpenAI API key |
| `STREAM_API_KEY` | Stream Chat API key |
| `STREAM_API_SECRET` | Stream Chat secret |
| `PORT` | Optional; defaults to `5000` |

### `chat-ai-ui/.env`

| Variable | Purpose |
|----------|---------|
| `VITE_API_URL` | Base URL of the API (e.g. `http://localhost:5000`) — no trailing slash |

Vite exposes only variables prefixed with `VITE_`.

---

## Database setup

From **`chat-ai-api`** (with `DATABASE_URL` set):

```bash
npx drizzle-kit generate   # create migration SQL from src/db/schema.ts
npx drizzle-kit migrate    # apply migrations to Neon
```

Use `drizzle.config.ts` in this folder; run commands from `chat-ai-api` so `.env` resolves.

---

## Running locally

**Terminal 1 — API**

```bash
cd chat-ai-api
npm install
# configure .env
npm run dev
```

**Terminal 2 — UI**

```bash
cd chat-ai-ui
npm install
# configure .env (VITE_API_URL)
npm run dev
```

Open the URL Vite prints (typically `http://localhost:5173`). Register on `/`, then use `/chat`.

---

## API overview

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/register-user` | Body: `{ name, email }`. Creates Stream user + DB user; returns `userId`, `name`, `email`. |
| `POST` | `/chat` | Body: `{ message, userId }`. Loads recent history for context, calls OpenAI, saves row, posts to Stream channel. Returns `{ reply }`. |
| `POST` | `/get-messages` | Body: `{ userId }`. Returns `{ chatHistory }`. |
| `POST` | `/clear-messages` | Body: `{ userId }`. Deletes all `chats` rows for that user. |

All JSON bodies; use `Content-Type: application/json`.

---

## Production build

**API**

```bash
cd chat-ai-api
npm run build
npm start
```

**UI**

```bash
cd chat-ai-ui
npm run build
npm run preview   # or serve dist/ with any static host
```

Point `VITE_API_URL` at your deployed API URL when building the UI.

---

## Project layout

```
ai-chat/
├── chat-ai-api/
│   ├── src/
│   │   ├── server.ts          # Express routes
│   │   ├── config/database.ts # Neon + Drizzle
│   │   └── db/schema.ts       # Drizzle tables
│   ├── migrations/            # Generated SQL (after drizzle-kit generate)
│   └── drizzle.config.ts
├── chat-ai-ui/
│   ├── src/
│   │   ├── views/             # HomeView, ChatView
│   │   ├── stores/            # Pinia (user, chat)
│   │   ├── components/
│   │   └── router/
│   └── vite.config.ts
└── README.md
```

---

## Author

Richard Inda
