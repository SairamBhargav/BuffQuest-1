"""Quest claim endpoint - ``/quests/{quest_id}/claim``."""

import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.quest import Quest, QuestStatus
from app.schemas.quest import QuestRead

router = APIRouter(prefix="/quests", tags=["claims"])


# ------------------------------------------------------------------
# POST /quests/{quest_id}/claim
# ------------------------------------------------------------------
@router.post("/{quest_id}/claim", response_model=QuestRead)
async def claim_quest(
    quest_id: int,
    user_id: uuid.UUID,  # TODO: replace with Depends(get_current_user)
    db: AsyncSession = Depends(get_db),
):
    """Atomically claim a quest.

    Uses a conditional UPDATE to prevent two users from claiming the
    same quest concurrently (only succeeds if the quest is still
    ``open`` with no hunter assigned).
    """
    # Atomic conditional update
    stmt = (
        update(Quest)
        .where(
            Quest.id == quest_id,
            Quest.status == QuestStatus.OPEN.value,
            Quest.hunter_id.is_(None),
            Quest.creator_id != user_id,  # cannot claim own quest
        )
        .values(
            hunter_id=user_id,
            status=QuestStatus.CLAIMED.value,
            claimed_at=datetime.now(timezone.utc),
        )
        .returning(Quest)
    )
    result = await db.execute(stmt)
    quest = result.scalar_one_or_none()

    if quest is None:
        # Determine why the claim failed
        check = await db.execute(select(Quest).where(Quest.id == quest_id))
        existing = check.scalar_one_or_none()
        if existing is None:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Quest not found")
        if existing.creator_id == user_id:
            raise HTTPException(status.HTTP_403_FORBIDDEN, "Cannot claim your own quest")
        raise HTTPException(
            status.HTTP_409_CONFLICT,
            "Quest is no longer available for claiming",
        )

    await db.commit()
    await db.refresh(quest)
    return quest
