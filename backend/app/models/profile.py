"""SQLAlchemy model for the ``profiles`` table."""

import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Profile(Base):
    """Maps to ``public.profiles``.

    The primary key is the Supabase ``auth.users.id`` UUID, inserted
    automatically by the ``handle_new_user`` trigger defined in the
    SQL migration.
    """

    __tablename__ = "profiles"
    __table_args__ = {"schema": "public"}

    # ── columns ──────────────────────────────────────────────
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    email: Mapped[str | None] = mapped_column(
        Text, unique=True, index=True
    )
    display_name: Mapped[str] = mapped_column(Text, nullable=False)
    credits: Mapped[int] = mapped_column(
        Integer, nullable=False, default=0
    )
    notoriety: Mapped[int] = mapped_column(
        Integer, nullable=False, default=0
    )
    is_verified_student: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=False
    )
    profile_image_url: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    # ── relationships ────────────────────────────────────────
    created_quests = relationship(
        "Quest", back_populates="creator", foreign_keys="Quest.creator_id"
    )
    hunted_quests = relationship(
        "Quest", back_populates="hunter", foreign_keys="Quest.hunter_id"
    )
    messages = relationship("Message", back_populates="sender")
    attendance_submissions = relationship(
        "AttendanceSubmission", back_populates="user"
    )
    reward_logs = relationship("RewardLog", back_populates="user")
