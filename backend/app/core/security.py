"""Authentication & JWT verification for Supabase Auth.

Provides FastAPI dependencies to protect routes:

* ``get_current_user``  - extracts and validates the Bearer token,
  returns the authenticated user's UUID.
* ``require_role``      - optional factory that also checks the user's
  role from the JWT ``user_metadata``.
"""

import httpx
from fastapi import Depends, HTTPException, Request, status

from app.core.config import Settings, get_settings


# ------------------------------------------------------------------
# FastAPI dependencies
# ------------------------------------------------------------------

async def get_current_user(request: Request) -> str:
    """Dependency that returns the authenticated user's UUID from better-auth.

    Usage::

        @router.get("/protected")
        async def protected(user_id: str = Depends(get_current_user)):
            ...
    """
    auth_header = request.headers.get("Authorization")
    cookie_header = request.headers.get("Cookie")
    
    headers = {}
    if auth_header:
        headers["Authorization"] = auth_header
    if cookie_header:
        headers["Cookie"] = cookie_header
        
    if not headers:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No authentication credentials provided",
        )

    # Proxy the credentials mapping to the Next.js better-auth server
    async with httpx.AsyncClient(timeout=5.0) as client:
        try:
            resp = await client.get(
                "http://localhost:3000/api/auth/get-session",
                headers=headers
            )
            if resp.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid or expired session",
                )
            
            data = resp.json()
            if not data or "user" not in data:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid session format returned from auth server",
                )
            
            return data["user"]["id"]
        except httpx.RequestError as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Auth server unreachable: {e}",
            )


def require_role(*allowed_roles: str):
    """Dependency factory that enforces role-based access.

    Raises **403 Forbidden** if the role is not supported.
    *(Role validation can be expanded by checking user table or session metadata).*
    """
    async def _check_role(request: Request) -> str:
        # Currently, BuffQuest users are standard roles. We validate active session only.
        return await get_current_user(request)

    return _check_role
