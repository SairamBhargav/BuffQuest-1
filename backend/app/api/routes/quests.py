"""Quest endpoints - ``/quests/…``."""

import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.quest import ModerationStatus, Quest, QuestStatus
from app.schemas.quest import QuestCreate, QuestRead, QuestUpdate
from app.schemas.reward import RewardResult
from app.services.reward_service import deduct_quest_cost, issue_reward, refund_quest

router = APIRouter(prefix="/quests", tags=["quests"])


# ------------------------------------------------------------------
# GET /quests
# ------------------------------------------------------------------
@router.get("/", response_model=list[QuestRead])
async def list_quests(
    building_zone_id: int | None = Query(None),
    status_filter: str | None = Query(None, alias="status"),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    """List quests, optionally filtered by building zone or status."""
    stmt = select(Quest)
    if building_zone_id is not None:
        stmt = stmt.where(Quest.building_zone_id == building_zone_id)
    if status_filter is not None:
        stmt = stmt.where(Quest.status == status_filter)
    stmt = stmt.order_by(Quest.created_at.desc()).offset(offset).limit(limit)
    result = await db.execute(stmt)
    return result.scalars().all()


# ------------------------------------------------------------------
# GET /quests/{quest_id}
# ------------------------------------------------------------------
@router.get("/{quest_id}", response_model=QuestRead)
async def get_quest(
    quest_id: int,
    db: AsyncSession = Depends(get_db),
):
    """Get a single quest by ID."""
    result = await db.execute(select(Quest).where(Quest.id == quest_id))
    quest = result.scalar_one_or_none()
    if quest is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Quest not found")
    return quest


# ------------------------------------------------------------------
# POST /quests
# ------------------------------------------------------------------
@router.post("/", response_model=QuestRead, status_code=status.HTTP_201_CREATED)
async def create_quest(
    payload: QuestCreate,
    user_id: uuid.UUID = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new quest (deducts cost_credits from creator)."""
    quest = Quest(
        creator_id=user_id,
        title=payload.title,
        description=payload.description,
        building_zone_id=payload.building_zone_id,
        cost_credits=payload.cost_credits,
        reward_credits=payload.reward_credits,
        reward_notoriety=payload.reward_notoriety,
        expires_at=payload.expires_at,
        status=QuestStatus.OPEN,
        moderation_status=ModerationStatus.PENDING,
    )
    db.add(quest)
    await db.flush()  # get quest.id before logging

    # Deduct credits from creator (raises 402 if insufficient)
    if quest.cost_credits > 0:
        await deduct_quest_cost(db, user_id, quest)

    await db.commit()
    await db.refresh(quest)
    return quest


# ------------------------------------------------------------------
# PATCH /quests/{quest_id}
# ------------------------------------------------------------------
@router.patch("/{quest_id}", response_model=QuestRead)
async def update_quest(
    quest_id: int,
    payload: QuestUpdate,
    user_id: uuid.UUID = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update a quest (only allowed while status is ``open``, creator only)."""
    result = await db.execute(select(Quest).where(Quest.id == quest_id))
    quest = result.scalar_one_or_none()
    if quest is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Quest not found")
    if quest.creator_id != user_id:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Not the quest creator")
    if quest.status != QuestStatus.OPEN:
        raise HTTPException(status.HTTP_409_CONFLICT, "Quest is no longer open")

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(quest, field, value)

    await db.commit()
    await db.refresh(quest)
    return quest


# ------------------------------------------------------------------
# POST /quests/{quest_id}/cancel
# ------------------------------------------------------------------
@router.post("/{quest_id}/cancel", response_model=QuestRead)
async def cancel_quest(
    quest_id: int,
    user_id: uuid.UUID = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Cancel a quest (creator only, must be ``open`` or ``claimed``). Refunds credits."""
    result = await db.execute(select(Quest).where(Quest.id == quest_id))
    quest = result.scalar_one_or_none()
    if quest is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Quest not found")
    if quest.creator_id != user_id:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Not the quest creator")
    if quest.status not in (QuestStatus.OPEN, QuestStatus.CLAIMED):
        raise HTTPException(status.HTTP_409_CONFLICT, "Quest cannot be cancelled in its current state")

    quest.status = QuestStatus.CANCELLED

    # Refund cost_credits to creator
    await refund_quest(db, quest)

    await db.commit()
    await db.refresh(quest)
    return quest


# ------------------------------------------------------------------
# POST /quests/{quest_id}/complete
# ------------------------------------------------------------------
@router.post("/{quest_id}/complete", response_model=QuestRead)
async def complete_quest(
    quest_id: int,
    user_id: uuid.UUID = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Mark a quest as completed (hunter only, must be ``claimed``)."""
    result = await db.execute(select(Quest).where(Quest.id == quest_id))
    quest = result.scalar_one_or_none()
    if quest is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Quest not found")
    if quest.hunter_id != user_id:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Not the quest hunter")
    if quest.status != QuestStatus.CLAIMED:
        raise HTTPException(status.HTTP_409_CONFLICT, "Quest is not currently claimed")

    quest.status = QuestStatus.COMPLETED
    quest.completed_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(quest)
    return quest


# ------------------------------------------------------------------
# POST /quests/{quest_id}/verify
# ------------------------------------------------------------------
@router.post("/{quest_id}/verify", response_model=QuestRead)
async def verify_quest(
    quest_id: int,
    user_id: uuid.UUID = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Verify a completed quest (creator only, must be ``completed``)."""
    result = await db.execute(select(Quest).where(Quest.id == quest_id))
    quest = result.scalar_one_or_none()
    if quest is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Quest not found")
    if quest.creator_id != user_id:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Not the quest creator")
    if quest.status != QuestStatus.COMPLETED:
        raise HTTPException(status.HTTP_409_CONFLICT, "Quest is not in completed state")

    quest.status = QuestStatus.VERIFIED
    quest.verified_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(quest)
    return quest


# ------------------------------------------------------------------
# POST /quests/{quest_id}/reward
# ------------------------------------------------------------------
@router.post("/{quest_id}/reward", response_model=RewardResult)
async def reward_quest(
    quest_id: int,
    user_id: uuid.UUID,  # TODO: replace with Depends(get_current_user)
    db: AsyncSession = Depends(get_db),
):
    """Issue rewards for a verified quest (creator only).

    Transitions ``VERIFIED → REWARDED`` and awards credits + notoriety
    to the hunter. Can only be called once per quest.
    """
    result = await db.execute(select(Quest).where(Quest.id == quest_id))
    quest = result.scalar_one_or_none()
    if quest is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Quest not found")
    if quest.creator_id != user_id:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Not the quest creator")

    log = await issue_reward(db, quest)

    await db.commit()
    await db.refresh(quest)

    return RewardResult(
        quest_id=quest.id,
        hunter_id=quest.hunter_id,
        credits_awarded=quest.reward_credits,
        notoriety_awarded=quest.reward_notoriety,
        status=quest.status.value,
    )
