# The Chain Reaction — Backend

FastAPI backend for The Chain Reaction, an AI-powered engineering
intelligence platform. Sprint 9 built the modular, production-ready
application skeleton; Sprint 10 added PDF upload and structured text/
metadata extraction; Sprint 11 added recursive document chunking;
Sprint 12 added OpenAI embedding generation; Sprint 13 added local
persistent vector storage (ChromaDB); Sprint 14 adds semantic
similarity search over that store. Claude API, chat generation,
calculation logic, and authentication are still not implemented —
those are built in future sprints.

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
| `VECTOR_DB_PATH`    | Directory the ChromaDB PersistentClient stores its database in (default `./data/chromadb`) |
| `UPLOAD_DIR`        | Directory uploaded PDFs are persisted to (created automatically) |
| `MAX_UPLOAD_SIZE_MB`| Maximum accepted upload size in megabytes (default `25`) |
| `CHUNK_SIZE`        | Target maximum characters per chunk (default `1000`) |
| `CHUNK_OVERLAP`     | Characters repeated at the start of each chunk after the first (default `200`) |

## Project structure

```
backend/
├── app/
│   ├── api/routes/       # One module per resource; thin, typed, no business logic yet
│   │                     # (vectorstore.py: collection-level status/delete/reset)
│   ├── core/             # config.py, logging.py, constants.py — cross-cutting concerns
│   ├── services/
│   │   ├── parser/       # pdf_parser.py (PyMuPDF) + exceptions.py — implemented
│   │   ├── chunker/      # chunker.py + models.py + exceptions.py — implemented
│   │   ├── embeddings/   # embedding_service.py (OpenAI) + models.py + exceptions.py —
│   │   │                 # implemented
│   │   ├── vectorstore/  # vector_store.py (ChromaDB) + models.py + exceptions.py —
│   │   │                 # implemented
│   │   └── retrieval/    # retrieval_service.py + models.py + exceptions.py —
│   │                     # implemented. claude, calculations remain empty, for future sprints
│   ├── schemas/          # Pydantic request/response models, one module per resource
│   │                     # (pdf.py holds the parser's structured output schemas; the
│   │                     # chunker's, embedding service's, vector store's, and retrieval
│   │                     # service's own output models live in services/*/models.py,
│   │                     # next to the code that builds them)
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
| POST   | `/documents/store`   | **Real** — persists an EmbeddingResult into ChromaDB (see below) |
| GET    | `/vectorstore/status`| **Real** — collection existence, vector count, model, health (see below) |
| DELETE | `/vectorstore/document/{document_id}` | **Real** — deletes all vectors for one document |
| DELETE | `/vectorstore/reset` | **Real** — resets the entire vector database              |
| POST   | `/documents/retrieve`| **Real** — semantic similarity search over stored vectors (see below) |
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
  "chunk_id", "chunk_index", "chunk_text", "filename", "page_number",
  "embedding_model", "vector_dimension", "embedding": [/* floats */],
  "created_at" } ] }
```
`chunk_text`, `filename`, and `page_number` were added to `Embedding`
in Sprint 13 (additive, backward compatible) — the vector store needs
each vector's source text and page to be self-contained in the object
it's handed, since its declared input contract is `EmbeddingResult`
alone, with no separate lookup back into the chunker's output.

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

## Vector store (ChromaDB)

Takes the `EmbeddingResult` returned by `/documents/embed` and
persists every embedding into a local, on-disk ChromaDB collection
(`app/services/vectorstore/vector_store.py`, `PersistentClient` only —
never the in-memory client) — the single source of vector persistence
for the RAG pipeline. Data lives at `VECTOR_DB_PATH`
(default `./data/chromadb`) and survives process restarts.

**`chunk_id` is the collection's primary identifier.** Every write goes
through ChromaDB's `upsert`, so storing a `chunk_id` that's already
present replaces its vector and metadata in place — the collection
never accumulates duplicates, confirmed by storing the same 100
vectors twice and re-storing with changed vectors for the same ids.

```
POST   /documents/store                    → { stored_vectors, collection_name, database_path }
GET    /vectorstore/status                  → { collection_exists, collection_name, total_vectors,
                                                 embedding_model, vector_dimension, database_path, health }
DELETE /vectorstore/document/{document_id}  → { document_id, deleted_count }
DELETE /vectorstore/reset                   → { status, collection_name }
```

Each stored vector's metadata (and the `documents` field, used for
`chunk_text`) includes: `document_id`, `chunk_id`, `chunk_index`,
`filename`, `page_number`, `chunk_text`, `embedding_model`,
`vector_dimension`, `created_at`. The collection itself
(`chain_reaction_documents`) is tagged at creation time with
`embedding_model`, `vector_dimension`, and `created_at` — set once by
whichever request creates the collection first and never overwritten
by later requests, matching how `get_or_create_collection` behaves.

Validation (`422 Unprocessable Entity`):
- empty embedding list
- a declared `vector_dimension` that doesn't match the actual vector length
- embeddings in the same request that disagree on dimension
- missing required metadata (blank `document_id`/`chunk_id`/`filename`)
- the same `chunk_id` appearing twice within one request

`GET /vectorstore/status`'s `health` field comes from ChromaDB's own
`heartbeat()` call — `"ok"` if the client responds, `"unhealthy"`
otherwise. `embedding_model`/`vector_dimension` are `null` when the
collection doesn't exist yet (e.g. right after a reset).

Every stage (storage started/completed with duration, collection
created vs. reused, document deleted, database reset) is logged via
the centralized logger.

## Semantic retrieval (`POST /documents/retrieve`)

Takes a natural-language query and returns the most similar stored
chunks (`app/services/retrieval/retrieval_service.py`) — the single
source of similarity search for the RAG pipeline. No Claude API, no
prompt construction, no chat generation: retrieval only.

```
Embedding Vector
      |
   ChromaDB
      |
Similarity Search
      |
  Top-K Results
      |
    Metadata
      |
   REST API
```

Workflow:
1. Validate the request (non-empty query, `top_k` in range).
2. Embed the query — reuses the embedding service
   (`generate_query_embedding`), with the **same embedding model used
   at indexing time**, so query and stored vectors are directly
   comparable. No model override is exposed on the request for this
   reason: embedding a query with a different model than the one used
   to index would make cosine distance meaningless.
3. Query the vector store — reuses `VectorStoreService.query_similar`,
   a nearest-neighbor search over the `chain_reaction_documents`
   collection.
4. Sort matches by similarity score (highest first) — computed
   explicitly in code rather than assumed from ChromaDB's own result
   ordering.
5. Optionally filter by `similarity_threshold`.
6. Return each match with its full source metadata.

A query that matches nothing (empty vector store, or every match
below `similarity_threshold`) is **not an error** — it returns `200`
with an empty `results` list, since "no results" is a valid outcome of
a search, not a failure.

Request/response:
```json
// POST /documents/retrieve
{ "query": "What is the required safety factor for a steel beam?", "top_k": 5 }

// 200 OK
{ "query": "...", "results": [ { "document_id", "chunk_id", "chunk_index",
  "page_number", "similarity_score", "chunk_text",
  "metadata": { "filename", "created_at" }, "embedding_model" } ] }
```
`top_k` defaults to 5 and must be between 1 and 100. `similarity_threshold`
is optional; when set, only matches with `similarity_score >=
similarity_threshold` are returned.

The vector store's collection is created with `hnsw:space: cosine`
(Sprint 14 addition to `VectorStoreService.create_collection` — cosine
is the standard, documented comparison metric for OpenAI's embedding
models), so `similarity_score = 1 - cosine_distance`.

Error handling:

| Failure                                    | Status                    |
| -------------------------------------------- | --------------------------- |
| Empty query                                  | 422 Unprocessable Entity   |
| `top_k` outside 1-100                        | 422 Unprocessable Entity   |
| Query embedding failure (missing key, invalid model, auth, rate limit, timeout, other API error) | same status as `/documents/embed` — the exact same exception types propagate unwrapped |
| Vector store query fails (database error)    | 503 Service Unavailable    |

Every stage (retrieval started, embedding generated, vector search
started, matches found, retrieval completed with duration) is logged
via the centralized logger.

## Verification

```bash
mypy app --strict     # type checking
ruff check app         # linting
```
