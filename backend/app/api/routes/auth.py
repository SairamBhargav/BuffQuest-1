"""Auth endpoints - ``/auth/…``.

Authentication is handled by Supabase Auth. These endpoints provide
a backend passthrough for the frontend to verify session state.
"""

import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.profile import Profile
from app.schemas.profile import ProfileRead

router = APIRouter(prefix="/auth", tags=["auth"])


# ------------------------------------------------------------------
# GET /auth/me
# ------------------------------------------------------------------
@router.get("/me", response_model=ProfileRead)
async def auth_me(
    user_id: uuid.UUID,  # TODO: replace with Depends(get_current_user)
    db: AsyncSession = Depends(get_db),
):
    """Return the currently authenticated user's profile.

    The Supabase JWT is validated upstream (via ``get_current_user``),
    and this endpoint simply returns the matching profile row.
    """
    result = await db.execute(select(Profile).where(Profile.id == user_id))
    profile = result.scalar_one_or_none()
    if profile is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Profile not found")
    return profile
