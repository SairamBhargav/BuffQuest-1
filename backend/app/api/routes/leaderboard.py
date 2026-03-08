"""Leaderboard endpoint - ``/leaderboard``."""

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.profile import Profile
from app.schemas.profile import ProfileRead

router = APIRouter(prefix="/leaderboard", tags=["leaderboard"])


# ------------------------------------------------------------------
# GET /leaderboard
# ------------------------------------------------------------------
@router.get("/", response_model=list[ProfileRead])
async def get_leaderboard(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    """Return top users ranked by notoriety (descending)."""
    stmt = (
        select(Profile)
        .order_by(Profile.notoriety.desc())
        .offset(offset)
        .limit(limit)
    )
    result = await db.execute(stmt)
    return result.scalars().all()
