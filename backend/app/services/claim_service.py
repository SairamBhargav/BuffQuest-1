"""Business logic separation for quest claiming operations."""

import uuid
from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.quest import Quest, QuestStatus
from app.schemas.quest import QuestClaimCreate
from app.services.location_service import verify_user_in_zone

async def process_quest_claim(
    db: AsyncSession,
    quest_id: int,
    user_id: str,
    payload: QuestClaimCreate
) -> Quest:
    """Validate geofence location and atomically claim the quest."""
    
    # 1. First extract the quest to find the intended building zone
    stmt_get = select(Quest).where(Quest.id == quest_id)
    result_get = await db.execute(stmt_get)
    target_quest = result_get.scalar_one_or_none()
    
    if not target_quest:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Quest not found")
        
    # 2. Prevent claiming own quest BEFORE geolocation to save compute
    if target_quest.creator_id == user_id:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Cannot claim your own quest")
        
    if target_quest.status != QuestStatus.OPEN or target_quest.hunter_id is not None:
        raise HTTPException(status.HTTP_409_CONFLICT, "Quest is no longer available for claiming")
        
    # 3. Verify physical proximity using the Haversine Service
    await verify_user_in_zone(
        db=db,
        building_zone_id=target_quest.building_zone_id,
        user_lat=payload.user_lat,
        user_lon=payload.user_lon,
        allowed_radius_meters=150.0  # Must be within 150m of the building
    )
    
    # 4. Atomic conditional update to prevent race conditions during claim
    stmt = (
        update(Quest)
        .where(
            Quest.id == quest_id,
            Quest.status == QuestStatus.OPEN,
            Quest.hunter_id.is_(None)
        )
        .values(
            hunter_id=user_id,
            status=QuestStatus.CLAIMED,
            claimed_at=datetime.now(timezone.utc),
        )
        .returning(Quest)
    )
    
    result = await db.execute(stmt)
    quest = result.scalar_one_or_none()
    
    if quest is None:
        # Race condition lost
        raise HTTPException(
            status.HTTP_409_CONFLICT,
            "Quest was just claimed by another user."
        )

    return quest
