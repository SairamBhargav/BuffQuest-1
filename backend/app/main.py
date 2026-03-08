"""BuffQuest API entry point."""

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.routes import (
    attendance,
    auth,
    claims,
    leaderboard,
    messages,
    moderation,
    quests,
    users,
)
from app.core.seed import seed_db

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database and seed data
    await seed_db()
    yield

app = FastAPI(title="BuffQuest API", version="0.1.0", lifespan=lifespan)

# -- CORS --
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -- Routers --
app.include_router(auth.router, prefix="/api")
app.include_router(users.router, prefix="/api")
app.include_router(quests.router, prefix="/api")
app.include_router(claims.router, prefix="/api")
app.include_router(messages.router, prefix="/api")
app.include_router(attendance.router, prefix="/api")
app.include_router(leaderboard.router, prefix="/api")
app.include_router(moderation.router, prefix="/api")


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger = logging.getLogger("buffquest.error")
    logger.exception("Unhandled exception occurred")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal Server Error"}
    )
