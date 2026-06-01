# TaskPilot AI — Backend API

Express.js REST API for [TaskPilot AI](https://github.com/SumitRaj0/TaskPilot-BE): authentication, task management, and OpenAI-powered features.

## Tech stack

- **Node.js** + **Express.js**
- **MongoDB Atlas** + **Mongoose**
- **JWT** in HttpOnly cookies
- **OpenAI** `gpt-4o-mini` (server-side only)

## Prerequisites

- Node.js 20+
- [MongoDB Atlas](https://www.mongodb.com/atlas) cluster
- [OpenAI API key](https://platform.openai.com/api-keys) with billing enabled (for AI routes only)

## Quick start

```bash
git clone https://github.com/SumitRaj0/TaskPilot-BE.git
cd TaskPilot-BE
npm install
# Create server/.env (see below) — not in git
npm run dev
```

API runs at **http://localhost:5000** (default).

Health check: `GET http://localhost:5000/api/health`

## Environment (one file: `.env`)

Create **`server/.env`** in the project root (this file is gitignored — never commit secrets):

| Variable | Required | Description |
| -------- | -------- | ----------- |
| `PORT` | No | Server port (default `5000`) |
| `NODE_ENV` | No | `development` or `production` |
| `MONGODB_URI` | **Yes** | MongoDB Atlas connection string |
| `JWT_SECRET` | **Yes** | Long random string for signing tokens |
| `JWT_EXPIRES_IN` | No | Token lifetime (default `7d`) |
| `OPENAI_API_KEY` | For AI | OpenAI key (`sk-...`) |
| `CLIENT_URL` | **Yes** | Comma-separated frontend URLs for CORS |

```env
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://USER:PASS@cluster0.xxxxx.mongodb.net/taskpilot?retryWrites=true&w=majority
JWT_SECRET=your-long-random-secret
JWT_EXPIRES_IN=7d
OPENAI_API_KEY=sk-your-openai-api-key
CLIENT_URL=http://localhost:5173,https://task-pilot-fe.vercel.app
```

### MongoDB Atlas

1. Create a cluster and database user.
2. **Network Access** → allow your IP (or `0.0.0.0/0` for cloud hosts like Render).
3. **Connect → Drivers** → copy the URI. Host must look like `cluster0.xxxxx.mongodb.net` (not `cluster.mongodb.net`).

### OpenAI (reviewers)

Auth and tasks work **without** `OPENAI_API_KEY`. AI routes need a valid key with **quota/billing**.

Without a key or quota, AI endpoints return a clear `503` message; the rest of the API is unaffected.

## Scripts

| Command | Description |
| ------- | ----------- |
| `npm run dev` | Start with file watch |
| `npm start` | Production start |

## API endpoints

Base path: `/api`

### Auth

| Method | Endpoint | Auth | Description |
| ------ | -------- | ---- | ----------- |
| `POST` | `/auth/register` | No | Register `{ name, email, password }` |
| `POST` | `/auth/login` | No | Login `{ email, password }` |
| `POST` | `/auth/logout` | No | Clear auth cookie |
| `GET` | `/auth/me` | Yes | Current user |

### Tasks (auth required)

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| `GET` | `/tasks` | List tasks. Query: `status`, `priority`, `category`, `search` |
| `POST` | `/tasks` | Create task |
| `PUT` | `/tasks/:id` | Update task |
| `DELETE` | `/tasks/:id` | Delete task |
| `POST` | `/tasks/bulk` | Bulk create `{ tasks: [...] }` (max 50) |

**Task fields:** `title`, `description`, `category`, `priority` (`Low` \| `Medium` \| `High`), `status` (`Todo` \| `In Progress` \| `Completed`), `dueDate`

### AI (auth required)

| Method | Endpoint | Body | Description |
| ------ | -------- | ---- | ----------- |
| `POST` | `/ai/breakdown` | `{ input }` | Goal → subtask strings |
| `POST` | `/ai/priority` | `{ title, description? }` | Suggested priority |
| `POST` | `/ai/generate` | `{ input }` | NL goal → structured tasks |

## Project structure

```
src/
├── app.js              # Entry point
├── config/db.js        # MongoDB connection
├── controllers/        # Route handlers
├── middleware/         # Auth, validation, errors
├── models/             # User, Task schemas
├── routes/             # API routes
├── services/           # OpenAI integration
└── utils/              # JWT, normalization, AI errors
```

## Deploy on Render

1. Create a **Web Service** and connect this repo.
2. **Root directory:** `.` (repo root is the API).
3. **Build:** `npm install`
4. **Start:** `npm start`
5. Set all env vars from your local `.env` (same keys as above).
6. Set `CLIENT_URL` to your frontend URL (e.g. Vercel app).
7. Set `NODE_ENV=production`.

Optional: use the included `render.yaml` blueprint.

After deploy, set the frontend `VITE_API_URL` to `https://your-service.onrender.com/api`.

## Security

- Passwords hashed with **bcrypt** (12 rounds)
- JWT stored in **HttpOnly** cookies (`secure` + `sameSite` in production)
- Tasks isolated by `userId`
- `OPENAI_API_KEY` never exposed to the client
- Never commit `.env` (see `.gitignore`)

## License

MIT
