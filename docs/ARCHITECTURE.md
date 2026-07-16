# Architecture

The Chain Reaction is a Retrieval-Augmented Generation (RAG) application:
a Next.js frontend talks to a FastAPI backend, which parses and indexes
PDF documents into a local vector store, then answers questions by
retrieving relevant chunks and passing them to Claude.

## Request Flow

```mermaid
flowchart TD
    User([User]) --> Frontend["Next.js Frontend<br/>(App Router · Hooks → API Layer → Adapters)"]
    Frontend -->|HTTP / JSON| Backend["FastAPI Backend"]

    Backend --> Parser["PDF Parser<br/>(PyMuPDF)"]
    Parser --> Chunking["Chunking<br/>(recursive, overlapping splitter)"]
    Chunking --> Embedding["Embedding Service<br/>(OpenAI text-embedding-3-large)"]
    Embedding --> ChromaDB[("ChromaDB<br/>persistent vector store")]
    ChromaDB --> Retrieval["Semantic Retrieval<br/>(similarity search)"]
    Retrieval --> Claude["Claude API<br/>(RAG answer generation)"]
    Claude --> Answer["Answer + Citations"]
    Answer --> Frontend

    Claude <--> Memory["Conversation Memory<br/>(session-scoped chat history)"]

    Backend --> Calc["Engineering Calculation Engine<br/>(deterministic chain selection)"]
    Calc -.optional explanation.-> Claude

    ChromaDB --> Library["Knowledge Library<br/>(document list, metadata, delete)"]
    ChromaDB --> Dashboard["Dashboard<br/>(document/vector counts, health)"]
    Library --> Frontend
    Dashboard --> Frontend
```

## Component Notes

- **Frontend → API Layer → Adapters**: components never call `fetch`
  directly. Each feature has a hook (`src/hooks/use-*.ts`) that calls a
  typed API-layer function (`src/lib/api/*.ts`), whose response is passed
  through an adapter (`src/lib/api/adapters.ts`) that converts the
  backend's snake_case wire shape into the frontend's camelCase domain
  types.
- **PDF Parser → Chunking → Embedding → ChromaDB**: the document
  ingestion pipeline. Each stage is a separate, independently testable
  service (`backend/app/services/{parser,chunker,embeddings,vectorstore}`).
  Uploading a document runs all four in sequence.
- **Semantic Retrieval → Claude API**: answering a question embeds the
  question, retrieves the most similar stored chunks from ChromaDB, and
  passes them to Claude as grounding context. Claude answers only from
  what it was given — it does not use outside knowledge, and it never
  performs a calculation itself.
- **Conversation Memory**: an in-memory, session-scoped store of prior
  turns in the current conversation, so a follow-up question ("what about
  the 80 series instead?") resolves correctly. Not persisted across
  server restarts — there is no user-account or database layer yet.
- **Engineering Calculation Engine**: a deterministic Python
  implementation of roller-chain selection (chain type/standard, service
  factor, expected life). Claude is only ever asked to explain an
  already-computed result in plain English — never to perform the
  calculation.
- **Knowledge Library / Dashboard**: both are read views over the same
  ChromaDB-backed document store — the Knowledge Library lists and
  manages individual documents; the Dashboard aggregates them into
  knowledge-base-wide health metrics (document/vector counts, status
  breakdown, recent activity, system health).

## Deployment Shape

```mermaid
flowchart LR
    subgraph "docker compose"
        FE["frontend container<br/>Next.js (standalone), port 3000"]
        BE["backend container<br/>FastAPI + uvicorn, port 8000"]
        FE -->|NEXT_PUBLIC_API_URL| BE
        BE --> V1[("chroma-data volume")]
        BE --> V2[("upload-data volume")]
    end
```

Two containers, two named volumes for persistence, no external
dependencies beyond the OpenAI and Anthropic APIs. See the root
[`README.md`](../README.md#docker) for the one-command startup.
