# The Chain Reaction — Backend

FastAPI backend for The Chain Reaction, an AI-powered engineering
intelligence platform. Sprint 9 built the modular, production-ready
application skeleton; Sprint 10 adds the first real capability — PDF
upload and structured text/metadata extraction. Chunking, embeddings,
vector database, Claude API, calculation logic, and authentication are
still not implemented — those are built in future sprints.

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
| `UPLOAD_DIR`        | Directory uploaded PDFs are persisted to (created automatically) |
| `MAX_UPLOAD_SIZE_MB`| Maximum accepted upload size in megabytes (default `25`) |

## Project structure

```
backend/
├── app/
│   ├── api/routes/       # One module per resource; thin, typed, no business logic yet
│   ├── core/             # config.py, logging.py, constants.py — cross-cutting concerns
│   ├── services/
│   │   └── parser/       # pdf_parser.py (PyMuPDF) + exceptions.py — implemented.
│   │                     # chunker, embeddings, vectorstore, retrieval, claude,
│   │                     # calculations remain empty, for future sprints
│   ├── schemas/          # Pydantic request/response models, one module per resource
│   │                     # (pdf.py holds the parser's structured output schemas)
│   ├── models/           # Internal domain/DB models — empty until persistence ships
│   ├── utils/            # Shared, stateless helpers
│   ├── static/swagger-ui/# Vendored Swagger UI assets (see VENDORED.md)
│   └── main.py           # App factory: routers, CORS, lifespan, docs
├── requirements.txt
├── .env.example
├── pyproject.toml        # mypy (strict) + ruff configuration
└── .gitignore
```

## API routes

| Method | Path                | Behavior                                                    |
| ------ | ------------------- | ------------------------------------------------------------ |
| GET    | `/health`            | Returns app status/name/version/environment                  |
| GET    | `/documents`         | Placeholder — returns an empty document list                 |
| POST   | `/documents`         | Placeholder — echoes back upload metadata with a mock ID     |
| POST   | `/documents/upload`  | **Real** — validates and parses an uploaded PDF (see below)   |
| POST   | `/chat`              | Placeholder — returns a fixed reply                           |
| POST   | `/calculations`      | Placeholder — returns `status: "not_implemented"`             |
| GET    | `/admin/status`      | Returns app status plus process uptime                        |

Every endpoint is fully typed (Pydantic request/response models,
`response_model` set, no `Any`) so future sprints implement real logic
behind the same contracts without changing route signatures.

## PDF parser (`POST /documents/upload`)

Accepts a single PDF as multipart form data (`file` field) and returns
structured metadata plus per-page extracted text. The parser
(`app/services/parser/pdf_parser.py`, built on PyMuPDF) is the single
source of PDF extraction for the whole app — future chunking/embedding
sprints call it rather than touching PyMuPDF directly.

Validation, in order, with the HTTP status returned on failure:

| Check                                   | Status                     |
| ---------------------------------------- | --------------------------- |
| Filename ends in `.pdf`                  | 415 Unsupported Media Type  |
| Declared content type is a PDF MIME type | 415 Unsupported Media Type  |
| Upload is non-empty                      | 400 Bad Request             |
| Upload is under `MAX_UPLOAD_SIZE_MB`     | 413 Request Entity Too Large|
| Bytes start with the `%PDF-` magic header| 422 Unprocessable Entity    |
| File opens as a valid PDF (not corrupted)| 422 Unprocessable Entity    |
| PDF is not password-protected            | 422 Unprocessable Entity    |
| PDF has at least one page                | 422 Unprocessable Entity    |

On success (`201 Created`), the response includes a generated document
id, the original filename, and a `parse_result` with:
- **metadata**: title, author, creator, producer, subject, creation/
  modification date (each `null` if absent from the PDF), total pages
- **pages**: one entry per page, in reading order — page number,
  extracted text, character count, word count

The original file is persisted to `UPLOAD_DIR` under a generated id
once parsing succeeds. Every stage (upload started/completed, parsing
started/completed with duration, page count, extraction errors) is
logged via the centralized logger.

## Verification

```bash
mypy app --strict     # type checking
ruff check app         # linting
```
