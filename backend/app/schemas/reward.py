"""Pydantic schemas for reward responses."""

import uuid

from pydantic import BaseModel, ConfigDict


class RewardResult(BaseModel):
    """Response returned after a reward is issued."""

    model_config = ConfigDict(from_attributes=True)

    quest_id: int
    hunter_id: uuid.UUID
    credits_awarded: int
    notoriety_awarded: int
    status: str
