"""FastAPI application entry point."""

import time
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.docs import get_swagger_ui_html
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles

from app.api.routes import admin, calculations, chat, documents, health, vectorstore
from app.core.config import get_settings
from app.core.logging import configure_logging, get_logger

SWAGGER_UI_DIR = Path(__file__).parent / "static" / "swagger-ui"

settings = get_settings()
configure_logging(settings.log_level)
logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    app.state.start_time = time.monotonic()
    logger.info("%s v%s starting up", settings.app_name, settings.api_version)
    yield
    logger.info("%s shutting down", settings.app_name)


app = FastAPI(
    title=settings.app_name,
    description=settings.app_description,
    version=settings.api_version,
    lifespan=lifespan,
    docs_url=None,
    redoc_url=None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Swagger UI's static assets are vendored and self-hosted rather than pulled
# from a CDN (fastapi's default docs_url uses cdn.jsdelivr.net), so the docs
# also work in network environments that restrict outbound access to
# third-party CDNs. See app/static/swagger-ui/VENDORED.md for provenance.
app.mount("/static/swagger-ui", StaticFiles(directory=SWAGGER_UI_DIR), name="swagger-ui")


@app.get("/docs", include_in_schema=False)
def get_docs() -> HTMLResponse:
    return get_swagger_ui_html(
        openapi_url=app.openapi_url or "/openapi.json",
        title=f"{settings.app_name} - Swagger UI",
        swagger_js_url="/static/swagger-ui/swagger-ui-bundle.js",
        swagger_css_url="/static/swagger-ui/swagger-ui.css",
        swagger_favicon_url="/static/swagger-ui/favicon-32x32.png",
    )


app.include_router(health.router)
app.include_router(chat.router)
app.include_router(documents.router)
app.include_router(calculations.router)
app.include_router(admin.router)
app.include_router(vectorstore.router)
