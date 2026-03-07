"""BuffQuest API entry point."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

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

app = FastAPI(title="BuffQuest API", version="0.1.0")

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
