"""Pydantic schemas for the ``profiles`` table."""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ProfileRead(BaseModel):
    """Full profile response returned from the API."""

    model_config = ConfigDict(from_attributes=True)

    id: str
    id: str
    email: str | None = None
    name: str
    credits: int
    notoriety: int
    is_verified_student: bool
    image: str | None = None
    createdAt: datetime
    updatedAt: datetime


class ProfileUpdate(BaseModel):
    """Fields a user may update on their own profile."""

    name: str | None = Field(None, min_length=1, max_length=100)
    image: str | None = None


class ProfileStats(BaseModel):
    """Lightweight credits / notoriety summary."""

    model_config = ConfigDict(from_attributes=True)

    credits: int
    notoriety: int
