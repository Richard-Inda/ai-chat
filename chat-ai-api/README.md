# AI Chat Backend

TypeScript + Express backend for an AI chat application that connects:

- OpenAI (`gpt-4o-mini`) for AI responses
- Stream Chat for chat channels/messages
- Neon Postgres + Drizzle ORM for persistence

Frontend deployment: [www.RichardAi.chat](https://www.RichardAi.chat)  
Backend hosting: Render

## Tech Stack

- Node.js + Express
- TypeScript
- OpenAI SDK
- Stream Chat
- Neon Serverless Postgres
- Drizzle ORM

## Features

- Registers users in Stream Chat and in Postgres
- Generates AI replies from conversation context
- Stores user/assistant chat history
- Returns chat history for a user
- Clears all messages for a user

## API Endpoints

Base URL (local): `http://localhost:5000`

### `POST /register-user`

Registers a user in Stream Chat and the database.

Request body:

```json
{
  "name": "Richard",
  "email": "richard@example.com"
}
```

Response:

```json
{
  "userId": "richard_example_com",
  "name": "Richard",
  "email": "richard@example.com"
}
```

### `POST /chat`

Sends a message to the AI, stores the result, and returns the AI reply.

Request body:

```json
{
  "userId": "richard_example_com",
  "message": "Hello, who are you?"
}
```

Response:

```json
{
  "reply": "..."
}
```

### `POST /get-messages`

Gets stored chat history for a user.

Request body:

```json
{
  "userId": "richard_example_com"
}
```

### `POST /clear-messages`

Deletes all stored chat rows for a user.

Request body:

```json
{
  "userId": "richard_example_com"
}
```

## Environment Variables

Create a `.env` file in the project root:

```env
PORT=5000
OPENAI_API_KEY=your_openai_api_key
STREAM_API_KEY=your_stream_api_key
STREAM_API_SECRET=your_stream_api_secret
DATABASE_URL=your_neon_database_url
```

## Local Development

Install dependencies:

```bash
npm install
```

Run in development mode:

```bash
npm run dev
```

Build:

```bash
npm run build
```

Run production build:

```bash
npm start
```

## Deployment

- Backend is deployed on Render.
- Frontend is deployed on Vercel at [www.RichardAi.chat](https://www.RichardAi.chat).

If you add a new frontend domain, update CORS configuration in `src/server.ts` before deploying.
