# Demo Guide

A 5–10 minute walkthrough of The Chain Reaction, in the order features
naturally build on each other. Run `docker compose up --build` (or the
two local dev servers — see the root README) before starting.

## Setup (before the demo)

- Have 1–2 sample PDFs ready (a chain catalogue or maintenance manual
  works well — anything with tables and numbered sections shows off
  citations best).
- Confirm `OPENAI_API_KEY` and `ANTHROPIC_API_KEY` are set in
  `backend/.env` — Ask AI and document upload need them.
- Open the app at http://localhost:3000 and start on the **Dashboard**.

## 1. Dashboard (30s)

Start here to set the scene: an empty or lightly-populated knowledge
base. Point out the real metrics — Total Documents, Indexed Passages,
and the ChromaDB system health tile — versus the clearly-labeled
placeholder sections (Document Types, Recent AI Questions), explaining
that this project draws a hard line between real backend data and mock
data, never fabricating one to look like the other.

## 2. Upload a PDF (1–2 min)

Go to **Knowledge Library** → **Upload**. Pick a PDF and upload it.
Narrate the pipeline as it runs: parse → chunk → embed → store. Once
it completes, show the new document's real metadata — page count,
chunk count, file size, indexed status.

## 3. Ask AI (2–3 min)

Go to **Ask AI** and ask a question you know the uploaded document
answers (e.g. "What is the maximum allowable elongation before
replacement?"). Point out:

- The answer itself, grounded in the document.
- The **citations** — each one names the source document, page number,
  and a text snippet, and can be clicked to jump to that spot in the
  **PDF Viewer**.
- The **confidence indicator**.

Then ask a deliberately unsupported question (something not in the
document) to show the refusal behavior — Claude declines rather than
guessing.

## 4. Conversation Memory (1 min)

Ask a follow-up question that only makes sense in context of the
previous answer (e.g. "What about for the 80 series instead?"). Point
out that it resolves correctly without re-stating the full question —
the backend is tracking the session's conversation history.

## 5. Engineering Calculations (1–2 min)

Go to **Calculations**. Fill in a chain selection scenario (chain
type/standard, load, RPM, service conditions) and submit. Show:

- The deterministic result cards (computed in Python, not by Claude).
- The recommendation and expected-life estimate.
- The optional **"Explain this result"** action, which asks Claude to
  describe the already-computed numbers in plain English — emphasize
  that Claude never performs the calculation itself.

## 6. Knowledge Library (1 min)

Back on **Knowledge Library**, show browsing/filtering the document
list, and delete the document you uploaded in step 2 — show it
disappearing from both the library and the Dashboard's counts, proving
the two views share the same real backend state.

## 7. Dashboard, revisited (30s)

Return to the **Dashboard** to close the loop: the metrics you just
changed by uploading/deleting have moved. This is the "receipt" that
the whole system is wired to one real source of truth, not scattered
mock data.

## Optional talking points if there's time left

- Open `/docs` on the backend (Swagger UI) to show the typed API
  contract.
- Show the CI pipeline (`.github/workflows/ci.yml`) and mention
  `mypy --strict` + `ruff` + `tsc` + `eslint` all gate every push.
- Mention what's intentionally out of scope for this MVP (see the
  README's Future Roadmap) — authentication, persisted analytics,
  deployment automation.
