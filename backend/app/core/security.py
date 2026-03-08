"""Authentication & JWT verification for Supabase Auth.

Provides FastAPI dependencies to protect routes:

* ``get_current_user``  - extracts and validates the Bearer token,
  returns the authenticated user's UUID.
* ``require_role``      - optional factory that also checks the user's
  role from the JWT ``user_metadata``.
"""

import uuid
from typing import Annotated

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.config import Settings, get_settings

# Reusable security scheme (auto-documents the "Authorize" button in
# Swagger UI).
_bearer_scheme = HTTPBearer(auto_error=False)


# ------------------------------------------------------------------
# Token helpers
# ------------------------------------------------------------------

def verify_token(
    token: str,
    settings: Settings,
    *,
    algorithms: list[str] | None = None,
) -> dict:
    """Decode and verify a Supabase-issued JWT.

    Parameters
    ----------
    token:
        The raw JWT string (without the "Bearer " prefix).
    settings:
        Application settings containing the JWT secret.
    algorithms:
        Allowed signing algorithms.  Defaults to ``["HS256"]``
        (Supabase's default).

    Returns
    -------
    dict
        The decoded JWT payload on success.

    Raises
    ------
    HTTPException (401)
        If the token is expired, malformed, or otherwise invalid.
    """
    if algorithms is None:
        algorithms = ["HS256"]

    try:
        payload: dict = jwt.decode(
            token,
            settings.SUPABASE_JWT_SECRET,
            algorithms=algorithms,
            options={"verify_aud": False},
        )
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
        )

    return payload


# ------------------------------------------------------------------
# FastAPI dependencies
# ------------------------------------------------------------------

async def get_current_user(
    credentials: Annotated[
        HTTPAuthorizationCredentials | None, Depends(_bearer_scheme)
    ],
    settings: Annotated[Settings, Depends(get_settings)],
) -> uuid.UUID | None:
    """Dependency that returns the authenticated Supabase user's UUID, or None if not authenticated."""
    if credentials is None:
        return None

    payload = verify_token(credentials.credentials, settings)

    sub = payload.get("sub")
    if sub is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token missing subject claim",
        )

    try:
        return uuid.UUID(sub)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user ID in token",
        )


def require_role(*allowed_roles: str):
    """Dependency factory that enforces role-based access.

    Reads ``user_metadata.role`` from the Supabase JWT payload and
    raises **403 Forbidden** if the role is not in *allowed_roles*.

    Usage::

        @router.delete("/admin-only", dependencies=[Depends(require_role("admin"))])
        async def admin_only():
            ...
    """

    async def _check_role(
        credentials: Annotated[
            HTTPAuthorizationCredentials, Depends(_bearer_scheme)
        ],
        settings: Annotated[Settings, Depends(get_settings)],
    ) -> uuid.UUID:
        payload = verify_token(credentials.credentials, settings)

        user_meta = payload.get("user_metadata", {})
        role = user_meta.get("role", "user")

        if role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Role '{role}' is not authorized for this action",
            )

        sub = payload.get("sub")
        if sub is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token missing subject claim",
            )

        try:
            return uuid.UUID(sub)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid user ID in token",
            )

    return _check_role
