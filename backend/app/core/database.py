"""Async SQLAlchemy engine, session factory, and FastAPI dependency."""

from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase

from app.core.config import get_settings


# ================================
# Base Model Class
# ================================

class Base(DeclarativeBase):
    pass


# ================================
# SQLAlchemy Async Engine
# ================================

engine = create_async_engine(
    get_settings().DATABASE_URL,
    echo=False,          # set True for debugging SQL queries
    pool_pre_ping=True,  # verifies connections before using them
)


# ================================
# Session Factory
# ================================

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


# ================================
# FastAPI Dependency
# ================================

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Dependency that provides a database session
    and automatically closes it after the request.
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
