"""Pydantic schemas for the ``building_zones`` table."""

from datetime import datetime
from pydantic import BaseModel, ConfigDict


class BuildingZoneRead(BaseModel):
    """Full building zone response returned from the API."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    latitude: float | None = None
    longitude: float | None = None
    radius_meters: float | None = None
    is_active: bool
    created_at: datetime
    updated_at: datetime
