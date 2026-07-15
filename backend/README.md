# The Chain Reaction — Backend

FastAPI backend for The Chain Reaction, an AI-powered engineering
intelligence platform. This is the **Sprint 9 foundation**: a modular,
production-ready application skeleton with placeholder endpoints only.
No PDF parsing, chunking, embeddings, vector database, Claude API,
calculation logic, authentication, or persistence is implemented yet —
those are built in future sprints on top of this structure.

## Requirements

- Python 3.12
- pip

## Setup

```bash
cd backend
python3.12 -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env              # edit values as needed
```

## Running the server

```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

- Swagger UI: http://127.0.0.1:8000/docs
- OpenAPI schema: http://127.0.0.1:8000/openapi.json
- Health check: http://127.0.0.1:8000/health

Swagger UI's static assets are vendored into `app/static/swagger-ui`
rather than loaded from a CDN, so `/docs` also works in network
environments that block third-party CDN access. See
`app/static/swagger-ui/VENDORED.md` for details.

## Configuration

All settings are read from environment variables (or a local `.env`
file — see `.env.example`) via `app/core/config.py`. Nothing is
hardcoded:

| Variable          | Purpose                                             |
| ------------------ | ---------------------------------------------------- |
| `APP_NAME`          | Application display name                              |
| `API_VERSION`       | API version string                                    |
| `ENVIRONMENT`       | `development` / `staging` / `production`              |
| `ALLOWED_ORIGINS`   | JSON array of origins allowed by CORS                 |
| `LOG_LEVEL`         | Root logger level (`DEBUG`, `INFO`, ...)              |
| `CLAUDE_API_KEY`    | Placeholder — wired up when the Claude service ships  |
| `OPENAI_API_KEY`    | Placeholder — wired up when the embeddings service ships |
| `VECTOR_DB_PATH`    | Placeholder — wired up when ChromaDB integration ships |
| `UPLOAD_DIR`        | Placeholder — wired up when document upload ships     |

## Project structure

```
backend/
├── app/
│   ├── api/routes/       # One module per resource; thin, typed, no business logic yet
│   ├── core/             # config.py, logging.py, constants.py — cross-cutting concerns
│   ├── services/         # One package per future domain concern (parser, chunker,
│   │                     # embeddings, vectorstore, retrieval, claude, calculations) —
│   │                     # empty in this sprint, implemented in future sprints
│   ├── schemas/          # Pydantic request/response models, one module per resource
│   ├── models/           # Internal domain/DB models — empty until persistence ships
│   ├── utils/            # Shared, stateless helpers
│   ├── static/swagger-ui/# Vendored Swagger UI assets (see VENDORED.md)
│   └── main.py           # App factory: routers, CORS, lifespan, docs
├── requirements.txt
├── .env.example
├── pyproject.toml        # mypy (strict) + ruff configuration
└── .gitignore
```

## API routes (Sprint 9 — placeholders only)

| Method | Path             | Behavior                                   |
| ------ | ---------------- | ------------------------------------------- |
| GET    | `/health`         | Returns app status/name/version/environment |
| GET    | `/documents`      | Returns an empty document list              |
| POST   | `/documents`      | Echoes back upload metadata with a mock ID  |
| POST   | `/chat`           | Returns a fixed placeholder reply           |
| POST   | `/calculations`   | Returns `status: "not_implemented"`         |
| GET    | `/admin/status`   | Returns app status plus process uptime      |

Every endpoint is fully typed (Pydantic request/response models,
`response_model` set, no `Any`) so future sprints implement real logic
behind the same contracts without changing route signatures.

## Verification

```bash
mypy app --strict     # type checking
ruff check app         # linting
```
