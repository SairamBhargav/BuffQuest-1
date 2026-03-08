<<<<<<< HEAD
"""Pydantic schemas for the reward system."""

import uuid

from pydantic import BaseModel


class RewardResult(BaseModel):
    """Response returned after issuing quest rewards."""

    quest_id: int
    hunter_id: uuid.UUID | None = None
=======
"""Pydantic schemas for reward responses."""

import uuid

from pydantic import BaseModel, ConfigDict


class RewardResult(BaseModel):
    """Response returned after a reward is issued."""

    model_config = ConfigDict(from_attributes=True)

    quest_id: int
    hunter_id: uuid.UUID
>>>>>>> 522ab92119b12e18df445ea17a444a9b6c8bd447
    credits_awarded: int
    notoriety_awarded: int
    status: str
