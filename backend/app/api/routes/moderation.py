"""Moderation endpoints - ``/moderation/…``.

The AI moderation pipeline is a placeholder for now. These endpoints
define the contract that integration will fulfill.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import Settings, get_settings
from app.core.database import get_db
from app.models.quest import ModerationStatus, Quest
from app.schemas.moderation import ModerationResult

router = APIRouter(prefix="/moderation", tags=["moderation"])


# ------------------------------------------------------------------
# POST /moderation/review
# ------------------------------------------------------------------
@router.post("/review", response_model=ModerationResult)
async def review_quest(
    quest_id: int,
    db: AsyncSession = Depends(get_db),
):
    """Submit a quest for moderation review.

    This is a placeholder that auto-approves all quests. Replace the
    body with an actual AI moderation call when the pipeline is ready.
    """
    result = await db.execute(select(Quest).where(Quest.id == quest_id))
    quest = result.scalar_one_or_none()
    if quest is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Quest not found")

    # TODO: call AI moderation service here
    quest.moderation_status = ModerationStatus.APPROVED
    quest.moderation_reason = None
    await db.commit()

    return ModerationResult(status="approved", reason=None)


# ------------------------------------------------------------------
# GET /moderation/{quest_id}
# ------------------------------------------------------------------
@router.get("/{quest_id}", response_model=ModerationResult)
async def get_moderation_status(
    quest_id: int,
    db: AsyncSession = Depends(get_db),
):
    """Get the current moderation status of a quest."""
    result = await db.execute(select(Quest).where(Quest.id == quest_id))
    quest = result.scalar_one_or_none()
    if quest is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Quest not found")

    return ModerationResult(
        status=quest.moderation_status,
        reason=quest.moderation_reason,
    )
