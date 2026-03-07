"""SQLAlchemy model for the ``messages`` table."""

import uuid
from datetime import datetime

from sqlalchemy import BigInteger, DateTime, ForeignKey, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Message(Base):
    """Maps to ``public.messages``.

    Each message belongs to a specific quest and is sent by a profile.
    Chat is scoped to active quest sessions.
    """

    __tablename__ = "messages"
    __table_args__ = {"schema": "public"}

    # ── columns ──────────────────────────────────────────────
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    quest_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("public.quests.id", ondelete="CASCADE"),
        nullable=False,
    )
    sender_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("public.profiles.id", ondelete="CASCADE"),
        nullable=False,
    )
    text: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    # ── relationships ────────────────────────────────────────
    quest = relationship("Quest", back_populates="messages")
    sender = relationship("Profile", back_populates="messages")
