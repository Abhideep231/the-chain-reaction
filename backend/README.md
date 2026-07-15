# The Chain Reaction — Backend

FastAPI backend for The Chain Reaction, an AI-powered engineering
intelligence platform. Sprint 9 built the modular, production-ready
application skeleton; Sprint 10 added PDF upload and structured text/
metadata extraction; Sprint 11 added recursive document chunking;
Sprint 12 adds OpenAI embedding generation for those chunks. Vector
database persistence, retrieval, Claude API, calculation logic, and
authentication are still not implemented — those are built in future
sprints.

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
| `OPENAI_API_KEY`    | Required for `/documents/embed`; no default, must be set to call OpenAI |
| `EMBEDDING_MODEL`   | OpenAI embedding model name (default `text-embedding-3-large`) |
| `VECTOR_DB_PATH`    | Placeholder — wired up when ChromaDB integration ships |
| `UPLOAD_DIR`        | Directory uploaded PDFs are persisted to (created automatically) |
| `MAX_UPLOAD_SIZE_MB`| Maximum accepted upload size in megabytes (default `25`) |
| `CHUNK_SIZE`        | Target maximum characters per chunk (default `1000`) |
| `CHUNK_OVERLAP`     | Characters repeated at the start of each chunk after the first (default `200`) |

## Project structure

```
backend/
├── app/
│   ├── api/routes/       # One module per resource; thin, typed, no business logic yet
│   ├── core/             # config.py, logging.py, constants.py — cross-cutting concerns
│   ├── services/
│   │   ├── parser/       # pdf_parser.py (PyMuPDF) + exceptions.py — implemented
│   │   ├── chunker/      # chunker.py + models.py + exceptions.py — implemented
│   │   └── embeddings/   # embedding_service.py (OpenAI) + models.py + exceptions.py —
│   │                     # implemented. vectorstore, retrieval, claude, calculations
│   │                     # remain empty, for future sprints
│   ├── schemas/          # Pydantic request/response models, one module per resource
│   │                     # (pdf.py holds the parser's structured output schemas; the
│   │                     # chunker's and embedding service's own output models live in
│   │                     # services/*/models.py, next to the code that builds them)
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
| POST   | `/documents/chunk`   | **Real** — splits a parsed document into overlapping text chunks (see below) |
| POST   | `/documents/embed`   | **Real** — generates OpenAI embeddings for a chunked document (see below) |
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

## Document chunker (`POST /documents/chunk`)

Takes a `document_id` plus the `parse_result` returned by
`/documents/upload` and splits every page's text into overlapping
chunks (`app/services/chunker/chunker.py`) — the single source of
document chunking for the RAG pipeline. Future embedding/retrieval
sprints consume its `Chunk` objects rather than re-implementing
splitting logic.

Each page is chunked independently (a chunk never spans two pages), in
this order per page:
1. Recursively split the page's text on the highest-priority boundary
   that's actually present — paragraph, then line, then sentence, then
   word — only falling back to a hard character split for a single
   "word" longer than the chunk size (e.g. a very long token).
2. Greedily pack the resulting pieces into chunks up to `CHUNK_SIZE`
   characters, seeding each new chunk with the trailing `CHUNK_OVERLAP`
   characters of the previous chunk.

Because every split step slices the original string without adding,
removing, or reordering characters, concatenating a page's chunks (and
subtracting each chunk's overlap prefix) always reconstructs the
original page text exactly — the overlap is the *only* intentionally
duplicated text.

Request/response:
```json
// POST /documents/chunk
{ "document_id": "...", "parse_result": { /* from /documents/upload */ } }

// 200 OK
{ "total_chunks": 20, "chunks": [ { "chunk_id", "document_id", "chunk_index",
  "page_number", "text", "character_count", "estimated_token_count", "metadata" } ] }
```
`estimated_token_count` is a rough `ceil(characters / 4)` heuristic —
no tokenizer dependency is introduced for a value that's only ever an
approximation. `metadata` carries the source filename, page number,
total pages, and a creation timestamp.

Rejected with `422 Unprocessable Entity`:
- the document has zero pages
- any page has no extractable (non-whitespace) text

Every stage (chunking started/completed, total chunks, average chunk
size, processing time) is logged via the centralized logger.

## Embedding generation (`POST /documents/embed`)

Takes the `ChunkingResult` returned by `/documents/chunk` and generates
an OpenAI embedding vector for every chunk
(`app/services/embeddings/embedding_service.py`) — the single source
of embedding generation for the RAG pipeline. **Embeddings are
returned in the response only; nothing is persisted.** Vector storage
is a future sprint.

Request/response:
```json
// POST /documents/embed
{ "total_chunks": 20, "chunks": [ /* from /documents/chunk */ ] }

// 200 OK
{ "total_embeddings": 20, "embedding_model": "text-embedding-3-large",
  "vector_dimension": 3072, "embeddings": [ { "embedding_id", "document_id",
  "chunk_id", "chunk_index", "embedding_model", "vector_dimension",
  "embedding": [/* floats */], "created_at" } ] }
```

Chunks are sent to OpenAI in batches of 100 per request (a large
document never becomes one request per chunk), and the response is
re-sorted by OpenAI's own per-item `index` before being mapped back to
chunks — defensive against a provider ever returning results
out of order. `vector_dimension` is read from the actual response
(`len(embedding)`), never hardcoded per model name, so a model change
via `EMBEDDING_MODEL` doesn't require a code change.

The OpenAI client is injectable (`generate_embeddings(..., client=...)`),
so the service itself never constructs a network client when a caller
supplies one — this is what makes the error-handling paths below
testable without a real API key or network access.

Error handling, mapped to distinct HTTP statuses:

| Failure                                   | Status                   |
| ------------------------------------------ | ------------------------- |
| Empty chunk list                           | 422 Unprocessable Entity  |
| A chunk has no text                        | 422 Unprocessable Entity  |
| `OPENAI_API_KEY` not configured            | 500 Internal Server Error |
| OpenAI rejects the configured model        | 500 Internal Server Error |
| OpenAI rejects the API key                 | 500 Internal Server Error |
| OpenAI rate limit exceeded                 | 429 Too Many Requests     |
| Request to OpenAI timed out                | 504 Gateway Timeout       |
| Any other OpenAI API error                 | 502 Bad Gateway           |

Every stage (embedding started/completed, chunks processed, model
used, vector dimension, processing duration) is logged via the
centralized logger — including when a request fails before ever
reaching OpenAI (e.g. a missing API key), so an attempted embed is
never silent in the logs.

## Verification

```bash
mypy app --strict     # type checking
ruff check app         # linting
```
