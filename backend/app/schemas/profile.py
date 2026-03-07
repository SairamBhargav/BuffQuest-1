"""Pydantic schemas for the ``profiles`` table."""

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ProfileRead(BaseModel):
    """Full profile response returned from the API."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    email: str | None = None
    display_name: str
    credits: int
    notoriety: int
    is_verified_student: bool
    profile_image_url: str | None = None
    created_at: datetime
    updated_at: datetime


class ProfileUpdate(BaseModel):
    """Fields a user may update on their own profile."""

    display_name: str | None = Field(None, min_length=1, max_length=100)
    profile_image_url: str | None = None


class ProfileStats(BaseModel):
    """Lightweight credits / notoriety summary."""

    model_config = ConfigDict(from_attributes=True)

    credits: int
    notoriety: int
