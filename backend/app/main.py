"""BuffQuest API entry point."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import (
    attendance,
    auth,
    building_zones,
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
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
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
app.include_router(building_zones.router, prefix="/api")


@app.get("/health")
async def health():
    return {"status": "ok"}

from fastapi.responses import JSONResponse
import sys
import traceback

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    print("!!! TRACEBACK !!!", file=sys.stderr)
    traceback.print_exc(file=sys.stderr)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal Server Error", "error": str(exc)}
    )
