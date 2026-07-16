# The Chain Reaction

An AI-powered engineering intelligence platform for industrial roller
chain documentation. Upload manufacturer PDFs (catalogues, handbooks,
maintenance manuals), then ask natural-language engineering questions
and get answers grounded in — and cited back to — the source documents,
alongside a deterministic chain-selection calculator and a knowledge
base dashboard.

Built as a Retrieval-Augmented Generation (RAG) application: documents
are parsed, chunked, embedded, and stored in a local vector database;
questions are answered by retrieving the most relevant chunks and
passing them to Claude, which is never allowed to answer from
unsupported knowledge or perform a calculation itself.

## Features

- **Ask AI** — ask engineering questions in natural language and get answers
  grounded in the uploaded document set, each backed by source citations
  (document, page, and snippet) and a confidence indicator.
- **Conversation memory** — follow-up questions ("what about the 80 series
  instead?") resolve against the current session's chat history.
- **Engineering calculations** — a deterministic roller-chain selection
  engine (chain type/standard, service factor, expected life) with an
  optional Claude-generated plain-English explanation of the result. Claude
  never performs the calculation itself.
- **Knowledge Library** — upload, browse, and delete PDF documents; view
  real per-document metadata (page count, chunk count, file size, indexed
  status).
- **Dashboard** — knowledge-base health at a glance: document/vector counts,
  document status breakdown, recent indexing activity, and system health
  (including live ChromaDB status).
- **PDF Viewer** — inspect a source document alongside citations pointing
  into it.

## Architecture

```
User
  │
  ▼
Next.js Frontend  (App Router, hooks → API layer → adapters)
  │  HTTP (JSON)
  ▼
FastAPI Backend
  │
  ├─▶ PDF Parser (PyMuPDF)
  ├─▶ Chunking (recursive, overlapping text splitter)
  ├─▶ Embedding Service (OpenAI text-embedding-3-large)
  ├─▶ ChromaDB (persistent local vector store)
  ├─▶ Semantic Retrieval (similarity search over stored chunks)
  ├─▶ Claude API (RAG answer generation, citations, conversation memory)
  ├─▶ Engineering Calculation Engine (deterministic chain selection)
  └─▶ Knowledge Library / Dashboard (aggregated from stored documents)
```

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the full diagram
and a walkthrough of the ask-a-question request flow.

The frontend never calls `fetch` directly from a component: every request
goes `component → hook → API layer (src/lib/api/*.ts) → adapter → FastAPI`.
Adapters are the single seam that convert the backend's snake_case wire
types into the frontend's camelCase domain types, so a backend schema
change is a visible, contained diff on one side of one file.

## Tech Stack

**Frontend**
- Next.js 15 (App Router), React 19, TypeScript (strict mode)
- Tailwind CSS, shadcn/ui (Radix primitives)

**Backend**
- FastAPI, Pydantic v2, Python 3.12
- PyMuPDF (PDF parsing), ChromaDB (vector store)
- OpenAI (`text-embedding-3-large`) for embeddings
- Anthropic Claude for answer generation and calculation explanations

**Tooling**
- `mypy --strict`, `ruff` (backend) · `tsc`, `eslint`, `next build` (frontend)
- Docker + Docker Compose · GitHub Actions CI

## Folder Structure

```
the-chain-reaction/
├── src/                        # Next.js frontend
│   ├── app/(app)/              # Route segments: dashboard, ask-ai,
│   │                           # knowledge-library, calculations,
│   │                           # pdf-viewer, admin, settings
│   ├── components/             # UI components, grouped by feature
│   ├── hooks/                  # use-*.ts — one hook per feature, the only
│   │                           # thing components call into
│   ├── lib/api/                # config, client, errors, types, adapters,
│   │                           # and one file per backend resource
│   ├── lib/*-mock.ts           # Mock data for features with no backend
│   │                           # analogue yet — see the file's own comment
│   ├── types/                  # Shared frontend domain types
│   └── config/                 # Navigation/app-level config
├── backend/                    # FastAPI backend
│   ├── app/api/routes/         # One module per resource
│   ├── app/core/                # Settings, logging, constants
│   ├── app/services/            # parser, chunker, embeddings, vectorstore,
│   │                             # retrieval, claude, conversation, calculations
│   ├── app/schemas/              # Pydantic request/response models
│   ├── app/static/swagger-ui/   # Vendored Swagger UI assets
│   ├── requirements.txt / requirements-dev.txt
│   └── Dockerfile
├── docs/                        # Architecture diagram, demo guide
├── .github/workflows/ci.yml     # CI: ruff, mypy, tsc, eslint, next build
├── Dockerfile                    # Frontend production image
└── docker-compose.yml            # One-command local stack
```

See [`backend/README.md`](backend/README.md) for the full backend API
reference, request/response contracts, and per-service implementation notes.

## Installation

Requirements: Node.js 20+, Python 3.12, npm.

```bash
git clone <this-repo>
cd the-chain-reaction

# Frontend
npm install
cp .env.example .env.local

# Backend
cd backend
python3.12 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # fill in OPENAI_API_KEY / ANTHROPIC_API_KEY
```

## Environment Variables

**Frontend** (`.env.local`, see `.env.example`)

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | Base URL of the FastAPI backend. Defaults to `http://localhost:8000` if unset. |

**Backend** (`backend/.env`, see `backend/.env.example`)

| Variable | Purpose |
| --- | --- |
| `APP_NAME`, `API_VERSION`, `ENVIRONMENT` | App metadata |
| `ALLOWED_ORIGINS` | CORS allowlist (JSON array string) |
| `LOG_LEVEL` | Root logger level |
| `OPENAI_API_KEY` | Required for document upload/embedding |
| `EMBEDDING_MODEL` | OpenAI embedding model (default `text-embedding-3-large`) |
| `ANTHROPIC_API_KEY` | Required for Ask AI and calculation explanations |
| `CLAUDE_MODEL`, `CLAUDE_MAX_TOKENS`, `CLAUDE_TEMPERATURE` | Claude request parameters |
| `VECTOR_DB_PATH` | ChromaDB persistence directory |
| `UPLOAD_DIR` | Uploaded PDF storage directory |
| `MAX_UPLOAD_SIZE_MB` | Upload size cap |
| `CHUNK_SIZE`, `CHUNK_OVERLAP` | Document chunking parameters |

The backend logs a startup warning (not a crash) if `ANTHROPIC_API_KEY` or
`OPENAI_API_KEY` is missing — everything except Ask AI and document
upload still works without them.

## Running Locally

```bash
# Terminal 1 — backend
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000

# Terminal 2 — frontend
npm run dev
```

- Frontend: http://localhost:3000
- Backend: http://localhost:8000 (Swagger UI at `/docs`)

## Docker

```bash
cp backend/.env.example backend/.env   # fill in API keys
docker compose up --build
```

This builds and starts both services with one command:

- `backend` — FastAPI, port `8000`, ChromaDB data and uploads persisted to
  named volumes (`chroma-data`, `upload-data`) so they survive container
  restarts.
- `frontend` — Next.js production build (`output: "standalone"`), port
  `3000`.

## CI

`.github/workflows/ci.yml` runs on every push and pull request:

- **Backend**: `ruff check app`, `mypy --strict app`
- **Frontend**: `tsc --noEmit`, `eslint`, `next build`

No deployment automation — CI is verification-only.

## Screenshots

_Placeholder — add screenshots of the Dashboard, Ask AI, and Knowledge
Library here before sharing externally._

## Future Roadmap

Intentionally out of scope for this MVP:

- Authentication / multi-user accounts
- Persisted conversation history (currently in-memory, per session)
- Aggregated usage analytics (citation coverage, response time, refusal
  rate) — would require a persisted Q&A log
- Real document categorization (product family, document type) — currently
  placeholder metadata
- Production deployment automation (the CI pipeline is verification-only)
- Caching / rate limiting
