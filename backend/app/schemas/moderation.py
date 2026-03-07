"""Pydantic schemas for the AI moderation pipeline."""

from pydantic import BaseModel


class ModerationResult(BaseModel):
    """Response from the moderation service.

    The moderation pipeline evaluates quest submissions and returns
    one of: ``approved``, ``flagged``, or ``rejected``.
    """

    status: str  # "approved" | "flagged" | "rejected"
    reason: str | None = None
