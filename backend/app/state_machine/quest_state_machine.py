from datetime import datetime
from enum import Enum
from typing import Dict, Optional
from fastapi import HTTPException, status
from pydantic import BaseModel

class QuestStatus(str, Enum):
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    PENDING_VERIFICATION = "pending_verification"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class Quest(BaseModel):
    id: str
    creator_id: str
    title: str
    description: str
    status: QuestStatus = QuestStatus.OPEN
    created_at: datetime
    hunter_id: Optional[str] = None
    claimed_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None


# In-memory dictionary acting as a temporary database for quests
quest_db: Dict[str, Quest] = {}


def claim_quest(quest_id: str, user_id: str) -> Quest:
    """
    Claims an open quest for the given user.
    """
    if quest_id not in quest_db:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quest not found")

    quest = quest_db[quest_id]

    if quest.status != QuestStatus.OPEN:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Quest is not open for claiming")

    if quest.creator_id == user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot claim your own quest")

    # Update quest state
    quest.hunter_id = user_id
    quest.status = QuestStatus.IN_PROGRESS
    quest.claimed_at = datetime.utcnow()

    return quest


def complete_quest(quest_id: str, user_id: str) -> Quest:
    """
    Marks an in-progress quest as pending verification by the assigned hunter.
    """
    if quest_id not in quest_db:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quest not found")

    quest = quest_db[quest_id]

    if quest.status != QuestStatus.IN_PROGRESS:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Quest is not in progress")

    if quest.hunter_id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only the assigned hunter can complete this quest")

    # Update quest state
    quest.status = QuestStatus.PENDING_VERIFICATION
    quest.completed_at = datetime.utcnow()

    return quest
