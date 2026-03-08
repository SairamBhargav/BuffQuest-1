"""Building Zone endpoints - ``/building-zones/…``."""

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.building_zone import BuildingZone
from app.schemas.building_zone import BuildingZoneRead

router = APIRouter(prefix="/building-zones", tags=["building-zones"])


# ------------------------------------------------------------------
# GET /building-zones
# ------------------------------------------------------------------
@router.get("", response_model=list[BuildingZoneRead])
@router.get("/", response_model=list[BuildingZoneRead], include_in_schema=False)
async def list_building_zones(
    is_active: bool | None = Query(True),
    db: AsyncSession = Depends(get_db),
):
    """List building zones, optionally filtered by activity."""
    stmt = select(BuildingZone)
    if is_active is not None:
        stmt = stmt.where(BuildingZone.is_active == is_active)
    stmt = stmt.order_by(BuildingZone.name)
    result = await db.execute(stmt)
    return result.scalars().all()
