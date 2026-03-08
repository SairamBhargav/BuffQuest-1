"""Reward schemas."""

from pydantic import BaseModel


class RewardResult(BaseModel):
    """Schema for reward issue response."""
    quest_id: int
    hunter_id: str
    credits_awarded: int
    notoriety_awarded: int
    status: str
