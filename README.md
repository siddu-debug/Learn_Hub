# LearnHub — Community-Driven AI Learning Platform

> The GitHub for Learning. Create, fork, and learn from AI-generated courses.

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Yarn
- Docker & Docker Compose
- PostgreSQL 16 with pgvector (or use Docker)
- OpenAI API key

---

## 📦 Local Development

### 1. Clone and install
```bash
git clone https://github.com/your-org/learnhub.git
cd learnhub
yarn install
```

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env and fill in required values:
# - OPENAI_API_KEY
# - JWT_SECRET (random 64-char string)
# - JWT_REFRESH_SECRET (random 64-char string)
# - GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET (optional for OAuth)
```

### 3. Start database (Docker)
```bash
docker compose up postgres redis -d
```

### 4. Run migrations and seed
```bash
yarn db:migrate
yarn db:seed
```

### 5. Start both apps
```bash
yarn dev
```

- **Frontend**: http://localhost:3000
- **API**: http://localhost:4000
- **API Docs**: http://localhost:4000/api/docs

### Default accounts (after seed)
| Email | Password | Role |
|-------|----------|------|
| admin@learnhub.dev | admin123456 | ADMIN |
| demo@learnhub.dev | demo123456 | USER |

---

## 🐳 Full Docker Setup

```bash
# Copy and configure environment
cp .env.example .env

# Build and start all services
docker compose up --build -d

# Run migrations
docker compose exec api npx prisma migrate deploy
docker compose exec api yarn db:seed
```

---

## ☁️ Deploy to Render

### Option A: One-click with render.yaml
1. Fork this repo to your GitHub account
2. Go to https://render.com → New → Blueprint
3. Connect your repo — Render will auto-detect `render.yaml`
4. Fill in environment variables:
   - `OPENAI_API_KEY`
   - `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`
   - `FRONTEND_URL` (your Render web URL)
   - `API_URL` (your Render API URL)
   - `NEXT_PUBLIC_API_URL` (your Render API URL + `/api/v1`)
5. Deploy

### Option B: Manual
**Database:**
1. Create a PostgreSQL instance on Render (free tier)
2. Note the connection string

**API Service:**
- Environment: Node
- Build: `cd apps/api && yarn install && npx prisma generate && yarn build`
- Start: `cd apps/api && npx prisma migrate deploy && node dist/main`
- Add all env vars from `.env.example`

**Web Service:**
- Environment: Node
- Build: `cd apps/web && yarn install && yarn build`
- Start: `cd apps/web && yarn start`
- Add `NEXT_PUBLIC_API_URL` pointing to your API service

---

## 🏗️ Architecture

```
learnhub/
├── apps/
│   ├── api/          # NestJS REST API
│   │   ├── src/
│   │   │   ├── auth/         # JWT + Google OAuth
│   │   │   ├── users/        # User profiles
│   │   │   ├── courses/      # CRUD + fork + version
│   │   │   ├── chapters/     # Chapter management
│   │   │   ├── lessons/      # Lesson CRUD + completion
│   │   │   ├── quizzes/      # Quiz engine
│   │   │   ├── ai/           # Generation + RAG tutor
│   │   │   ├── search/       # Full-text search
│   │   │   ├── progress/     # Learning tracking
│   │   │   └── admin/        # Admin panel
│   │   └── prisma/           # Schema + seed
│   └── web/          # Next.js 15 Frontend
│       └── src/app/
│           ├── (landing)     # Home page
│           ├── login/        # Auth pages
│           ├── register/
│           ├── dashboard/    # Learning dashboard
│           ├── courses/      # Browse + create + learn
│           ├── search/       # Search interface
│           ├── profile/      # User profiles
│           ├── settings/     # Account settings
│           └── admin/        # Admin dashboard
├── docker/           # Dockerfiles
├── database/         # SQL migrations
└── .github/          # CI/CD workflows
```

---

## 🔑 Key Features

| Feature | Description |
|---------|-------------|
| **AI Generation** | Create courses from prompt, PDF, URL, or GitHub repo using Groq Llama 3.3 70B (free) |
| **RAG Tutor** | Chat with AI grounded in course content. Embeddings via HuggingFace free API (BAAI/bge-small-en-v1.5), gracefully degrades if key not set |
| **Fork System** | Fork any published course like a Git repo |
| **Version History** | Automatic snapshots on every course update |
| **Quiz Engine** | AI-generated MCQ quizzes with scoring and explanations |
| **Progress Tracking** | Per-lesson completion tracking with dashboard |
| **Vector Search** | pgvector embeddings for semantic course search |
| **Admin Panel** | Manage users and courses |

---

## 🆓 Free API Keys Setup

This project uses **100% free AI APIs** — no credit card required.

### 1. Groq (for course generation + AI tutor chat)
1. Go to [console.groq.com](https://console.groq.com)
2. Sign up (free)
3. Create an API key
4. Add to `.env`: `GROQ_API_KEY=gsk_...`
5. Free tier: **14,400 requests/day** — plenty for MVP

**Available free models** (set via `GROQ_MODEL`):
| Model | Speed | Quality |
|-------|-------|---------|
| `llama-3.3-70b-versatile` | Medium | ⭐⭐⭐⭐⭐ (recommended) |
| `llama-3.1-8b-instant` | Very fast | ⭐⭐⭐ |
| `mixtral-8x7b-32768` | Fast | ⭐⭐⭐⭐ |
| `gemma2-9b-it` | Fast | ⭐⭐⭐ |

### 2. HuggingFace (for RAG vector embeddings)
1. Go to [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)
2. Sign up (free) → Create token (read access is enough)
3. Add to `.env`: `HUGGINGFACE_API_KEY=hf_...`
4. Model used: `BAAI/bge-small-en-v1.5` (384-dim vectors)
5. Free tier is sufficient for MVP

> **Note:** If you skip `HUGGINGFACE_API_KEY`, course generation still works fully. The AI tutor also still works — it falls back to fetching lesson text directly instead of vector search. RAG quality is slightly lower but fully functional.

---



| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, React, TypeScript, Tailwind CSS |
| Backend | NestJS, Prisma ORM, REST API |
| Database | PostgreSQL 16 + pgvector |
| Cache | Redis |
| AI | Groq (free) + HuggingFace Inference API (free) |
| Auth | JWT + Google OAuth 2.0 |
| Deployment | Docker, Render |

---

## 📋 API Reference

Full Swagger docs at: `http://localhost:4000/api/docs`

### Key Endpoints
```
POST /api/v1/auth/register
POST /api/v1/auth/login
GET  /api/v1/auth/google

GET  /api/v1/courses           # List published
POST /api/v1/courses           # Create
GET  /api/v1/courses/:id       # Get one
PUT  /api/v1/courses/:id       # Update
POST /api/v1/courses/:id/fork  # Fork
POST /api/v1/courses/:id/publish

POST /api/v1/ai/generate       # Generate from prompt/URL/GitHub
POST /api/v1/ai/generate/pdf   # Generate from PDF
POST /api/v1/ai/courses/:id/chat  # AI Tutor chat

POST /api/v1/lessons/:id/complete
POST /api/v1/quizzes/:id/attempt

GET  /api/v1/search?q=...
GET  /api/v1/progress/dashboard
```

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feat/my-feature`
3. Commit changes: `git commit -m 'feat: add my feature'`
4. Push: `git push origin feat/my-feature`
5. Open a Pull Request

---

## 📄 License

MIT — see [LICENSE](LICENSE)
