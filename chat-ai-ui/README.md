# AI Chat Frontend

TypeScript + Vue frontend for an AI chat application that connects:

- Backend API (Express + TypeScript) for user registration and chat requests
- OpenAI-powered responses through the backend
- Stream + Neon-backed history through backend endpoints
- Live deployment: [www.RichardAi.chat](https://www.RichardAi.chat)

## Tech Stack

- Vue 3
- TypeScript
- Vite
- Vue Router
- Pinia
- Pinia Persisted State
- Axios
- Tailwind CSS

## Features

- Register/login flow with name + email
- Persistent user session in local storage via Pinia persisted state
- Chat UI with user and AI messages
- Loads existing chat history for the logged-in user
- Sends prompts to backend AI endpoint and renders replies
- Clears all chat history for the logged-in user
- Auto-scroll behavior for long conversations

## App Routes

Base URL (local): `http://localhost:5173`

- `GET /`
  - Home/login view for creating a chat user
- `GET /chat`
  - Main chat interface (redirects to `/` if no user is set)

## Backend API Calls Used

The frontend calls these backend endpoints through `VITE_API_URL`:

- `POST /register-user`
  - Request body:
  ```json
  {
    "name": "Richard",
    "email": "richard@example.com"
  }
  ```
  - Expected response:
  ```json
  {
    "userId": "richard_example_com",
    "name": "Richard",
    "email": "richard@example.com"
  }
  ```

- `POST /chat`
  - Request body:
  ```json
  {
    "userId": "richard_example_com",
    "message": "Hello, who are you?"
  }
  ```
  - Expected response:
  ```json
  {
    "reply": "..."
  }
  ```

- `POST /get-messages`
  - Request body:
  ```json
  {
    "userId": "richard_example_com"
  }
  ```

- `POST /clear-messages`
  - Request body:
  ```json
  {
    "userId": "richard_example_com"
  }
  ```

## Environment Variables

Create a `.env` file in the project root:

```env
VITE_API_URL=http://localhost:8000
```

> Use your deployed backend URL for production builds.

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

Preview production build locally:

```bash
npm run preview
```

## Deployment

- Frontend is deployed on Vercel at [www.RichardAi.chat](https://www.RichardAi.chat).
- Backend is hosted on Render.
- Ensure `VITE_API_URL` points to the deployed backend before shipping frontend updates.
