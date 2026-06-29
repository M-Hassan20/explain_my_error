# Explain My Error

A personal debugging knowledge base that uses AI to explain errors, suggest fixes, and save solutions for future reference.

Built with the MERN stack + Gemini AI.

![Stack](https://img.shields.io/badge/MongoDB-4EA94B?style=flat&logo=mongodb&logoColor=white)
![Stack](https://img.shields.io/badge/Express.js-000000?style=flat&logo=express&logoColor=white)
![Stack](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![Stack](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)
![Stack](https://img.shields.io/badge/Gemini_AI-8E75B2?style=flat&logo=google&logoColor=white)

## What it does

Paste any Node.js, React, SQL, or TypeScript error and get an instant AI-powered breakdown:

- **What happened** — plain English explanation of the error
- **Root cause** — the actual underlying reason, not just the surface symptom
- **Fix** — a concrete code snippet or step-by-step solution
- **Watch out for** — common variants of the same error

Save solutions to your personal database and search them later. Mark solutions as verified once they've actually worked.

## Features

- AI error analysis powered by Google Gemini 2.5 Flash
- Save, search, and browse your error history
- Tag-based filtering with auto-generated tags
- Verified flag to mark solutions that actually worked
- Full-text search across error messages and titles
- Dashboard with stats — total errors, verified solutions, most common tags
- VS Code-inspired dark theme

## Tech Stack

**Frontend**
- Vite + React
- Tailwind CSS
- Recharts (dashboard charts)
- date-fns (relative timestamps)
- Lucide React (icons)

**Backend**
- Node.js + Express
- MongoDB Atlas + Mongoose
- Google Gemini 2.5 Flash API
- Rate limiting + Helmet for security

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas account
- Google Gemini API key

### Backend

```bash
cd backend
npm install
cp .env.example .env
```

Fill in your `.env`:

```
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/explain-my-error
GEMINI_API_KEY=your_gemini_api_key
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

```bash
npm run dev
```

### Frontend

```bash
cd frontend
npm install
```

Create a `.env` file:

```
VITE_API_URL=http://localhost:5000
```

```bash
npm run dev
```

App runs at `http://localhost:5173`.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/analyze` | Analyze an error with Gemini AI |
| `POST` | `/api/errors` | Save an analyzed error |
| `GET` | `/api/errors` | Get all errors (paginated) |
| `GET` | `/api/errors/search?q=&tags=` | Search errors by text or tags |
| `GET` | `/api/errors/:id` | Get a single error |
| `PATCH` | `/api/errors/:id` | Update verified status, tags, or solution |
| `DELETE` | `/api/errors/:id` | Delete an error |

## Deployment

- **Backend** — Render https://explain-my-error-z7xp.onrender.com
- **Frontend** — Netlify https://merry-hummingbird-5e7c8d.netlify.app
- **Database** — MongoDB Atlas

## License

MIT
