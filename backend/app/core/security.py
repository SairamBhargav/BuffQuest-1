"""Authentication & Session verification for Better Auth.

Provides FastAPI dependencies to protect routes:

* ``get_current_user``  - extracts and validates the session token against
  the database, returns the authenticated user's ID.
* ``require_role``      - factory that also checks the user's role 
  from the database.
"""

from datetime import datetime, timezone
from typing import Annotated

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import Settings, get_settings
from app.core.database import get_db

# Reusable security scheme (auto-documents the "Authorize" button in Swagger UI).
# auto_error=False allows us to manually check cookies if the header is missing
_bearer_scheme = HTTPBearer(auto_error=False)


# ------------------------------------------------------------------
# FastAPI dependencies
# ------------------------------------------------------------------

async def get_current_user(
    request: Request,
    credentials: Annotated[
        HTTPAuthorizationCredentials | None, Depends(_bearer_scheme)
    ],
    db: AsyncSession = Depends(get_db),
) -> str:
    """Dependency that returns the authenticated Better Auth user's ID.

    Extracts the token from the `Authorization: Bearer` header or the
    `better-auth.session_token` cookie, then validates it directly 
    against the Neon database session table.
    """
    token = None
    if credentials and credentials.credentials:
        token = credentials.credentials
    else:
        # Check standard and secure cookie names for better-auth
        token = request.cookies.get("better-auth.session_token")
        if not token:
            token = request.cookies.get("__Secure-better-auth.session_token")

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )

    # Query the session table to validate the token
    stmt = text('SELECT "userId", "expiresAt" FROM "session" WHERE token = :token')
    result = await db.execute(stmt, {"token": token})
    row = result.first()

    if not row:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session not found or invalid",
        )

    user_id, expires_at = row

    if expires_at and expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
        
    if expires_at and expires_at < datetime.now(timezone.utc):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired",
        )

    return str(user_id)


def require_role(*allowed_roles: str):
    """Dependency factory that enforces role-based access by checking DB.

    Reads ``role`` from the ``user`` table for the authenticated session.
    """

    async def _check_role(
        user_id: str = Depends(get_current_user),
        db: AsyncSession = Depends(get_db),
    ) -> str:
        stmt = text('SELECT "role" FROM "user" WHERE id = :user_id')
        result = await db.execute(stmt, {"user_id": user_id})
        user_role = result.scalar()

        if not user_role or user_role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Role '{user_role}' is not authorized for this action",
            )

        return user_id

    return _check_role

