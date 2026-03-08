"""Authentication & DB verification for better-auth sessions.

Provides FastAPI dependencies to protect routes:

* ``get_current_user``  - extracts and validates the Bearer token
  against the `session` table in the database,
  returns the authenticated user's string ID.
"""

from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db

# Reusable security scheme (auto-documents the "Authorize" button in
# Swagger UI).
_bearer_scheme = HTTPBearer()

# ------------------------------------------------------------------
# FastAPI dependencies
# ------------------------------------------------------------------

async def get_current_user(
    credentials: Annotated[
        HTTPAuthorizationCredentials, Depends(_bearer_scheme)
    ],
    db: AsyncSession = Depends(get_db),
) -> str:
    """Dependency that returns the authenticated user's ID string.

    Validates the provided Bearer token against the better-auth `session` table.
    
    Usage::

        @router.get("/protected")
        async def protected(user_id: str = Depends(get_current_user)):
            ...
    """
    token = credentials.credentials
    
    # Check if session exists in better-auth's `session` table and is active
    stmt = text(
        'SELECT "userId" FROM session WHERE token = :token AND "expiresAt" > NOW()'
    )
    result = await db.execute(stmt, {"token": token})
    user_id = result.scalar_one_or_none()
    
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired session token",
        )
        
    return user_id


def require_role(*allowed_roles: str):
    """Dependency factory that enforces role-based access.

    (In better-auth, you would typically check a role column in the 'user' table).
    For now, this assumes all users have standard access. To use this properly
    with better-auth, you'd extend the user table with a 'role' column.

    Usage::

        @router.delete("/admin-only", dependencies=[Depends(require_role("admin"))])
        async def admin_only():
            ...
    """

    async def _check_role(
        credentials: Annotated[
            HTTPAuthorizationCredentials, Depends(_bearer_scheme)
        ],
        db: AsyncSession = Depends(get_db)
    ) -> str:
        # Currently just verifies they are logged in. 
        # Add actual role check if you add roles to the user model.
        user_id = await get_current_user(credentials, db)
        return user_id

    return _check_role
