Vendored from `swagger-ui-dist@5.32.8` (npm) so `/docs` renders without an
outbound request to a third-party CDN — this sandbox's egress policy blocks
`cdn.jsdelivr.net`, and the PyPI `swagger-ui-bundle` package bundles a stale
Swagger UI (4.15.5) that predates OpenAPI 3.1 support (what FastAPI + Pydantic
v2 emit by default), so it can't render this app's schema either.

Files included: `swagger-ui-bundle.js`, `swagger-ui.css`, `favicon-16x16.png`,
`favicon-32x32.png`, `LICENSE` (Apache-2.0, from the swagger-ui-dist package).
