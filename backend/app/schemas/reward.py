"""Pydantic schemas for the reward system."""

import uuid

from pydantic import BaseModel


class RewardResult(BaseModel):
    """Response returned after issuing quest rewards."""

    quest_id: int
    hunter_id: uuid.UUID | None = None
    credits_awarded: int
    notoriety_awarded: int
    status: str
