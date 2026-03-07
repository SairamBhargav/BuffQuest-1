"""Pydantic schemas for the ``attendance_submissions`` table."""

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class AttendanceSubmissionCreate(BaseModel):
    """Payload for submitting an attendance check-in."""

    schedule_image_url: str
    class_photo_url: str
    class_name: str = Field(..., min_length=1)
    building_zone_id: int | None = None
    scheduled_start_time: datetime


class AttendanceSubmissionRead(BaseModel):
    """Full attendance submission response."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: uuid.UUID
    schedule_image_url: str
    class_photo_url: str
    class_name: str
    building_zone_id: int | None = None
    scheduled_start_time: datetime
    submission_time: datetime
    verification_status: str
    reward_issued: bool
    created_at: datetime
