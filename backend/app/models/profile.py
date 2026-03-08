"""SQLAlchemy model for the ``user`` table (better-auth users)."""

from datetime import datetime

from sqlalchemy import Boolean, DateTime, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Profile(Base):
    """Maps to ``public.user`` created by better-auth."""

    __tablename__ = "user"

    # ── columns ──────────────────────────────────────────────
    id: Mapped[str] = mapped_column(String, primary_key=True)
    email: Mapped[str] = mapped_column(Text, unique=True, index=True)
    
    # In better-auth, the column is typically named `name`
    name: Mapped[str] = mapped_column(Text, nullable=False)
    
    # Custom fields we added for BuffQuest
    credits: Mapped[int] = mapped_column(
        Integer, nullable=False, default=0
    )
    notoriety: Mapped[int] = mapped_column(
        Integer, nullable=False, default=0
    )
    is_verified_student: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=False
    )
    
    # In better-auth, the column is typically named `image`
    image: Mapped[str | None] = mapped_column(Text)
    
    # In better-auth these are named createdAt and updatedAt (quoted case-sensitive)
    createdAt: Mapped[datetime] = mapped_column(
        "createdAt", DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    updatedAt: Mapped[datetime] = mapped_column(
        "updatedAt", DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    
    emailVerified: Mapped[bool] = mapped_column(
        "emailVerified", Boolean, nullable=False, default=False
    )

    # ── relationships ────────────────────────────────────────
    created_quests = relationship(
        "Quest",
        back_populates="creator",
        foreign_keys="Quest.creator_id",
    )
    hunted_quests = relationship(
        "Quest",
        back_populates="hunter",
        foreign_keys="Quest.hunter_id",
    )
    messages = relationship(
        "Message",
        back_populates="sender",
        foreign_keys="Message.sender_id",
    )
    attendance_submissions = relationship(
        "AttendanceSubmission",
        back_populates="user",
        foreign_keys="AttendanceSubmission.user_id",
    )
    reward_logs = relationship(
        "RewardLog",
        back_populates="user",
        foreign_keys="RewardLog.user_id",
    )
