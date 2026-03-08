"""SQLAlchemy model for the ``quests`` table."""

import enum
from datetime import datetime

from sqlalchemy import BigInteger, DateTime, Enum, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


# ── enums (mirror Postgres enums) ────────────────────────────
class QuestStatus(str, enum.Enum):
    OPEN = "open"
    CLAIMED = "claimed"
    COMPLETED = "completed"
    VERIFIED = "verified"
    REWARDED = "rewarded"
    CANCELLED = "cancelled"
    EXPIRED = "expired"


class ModerationStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class Quest(Base):
    """Maps to ``public.quests``."""

    __tablename__ = "quests"

    # ── columns ──────────────────────────────────────────────
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    creator_id: Mapped[str] = mapped_column(
        String,
        ForeignKey('user.id', ondelete="CASCADE"),
        nullable=False,
    )
    hunter_id: Mapped[str | None] = mapped_column(
        String,
        ForeignKey('user.id', ondelete="SET NULL"),
    )
    title: Mapped[str] = mapped_column(Text, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    building_zone_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("building_zones.id", ondelete="RESTRICT"),
        nullable=False,
    )
    cost_credits: Mapped[int] = mapped_column(
        Integer, nullable=False, default=0
    )
    reward_credits: Mapped[int] = mapped_column(
        Integer, nullable=False, default=0
    )
    reward_notoriety: Mapped[int] = mapped_column(
        Integer, nullable=False, default=0
    )
    status: Mapped[QuestStatus] = mapped_column(
        String,
        nullable=False,
        default=QuestStatus.OPEN,
    )
    moderation_status: Mapped[ModerationStatus] = mapped_column(
        String,
        nullable=False,
        default=ModerationStatus.PENDING,
    )
    moderation_reason: Mapped[str | None] = mapped_column(Text)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    claimed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    verified_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    rewarded_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    # ── relationships ────────────────────────────────────────
    creator = relationship(
        "Profile",
        back_populates="created_quests",
        foreign_keys="Quest.creator_id",
    )
    hunter = relationship(
        "Profile",
        back_populates="hunted_quests",
        foreign_keys="Quest.hunter_id",
    )
    building_zone = relationship("BuildingZone", back_populates="quests")
    messages = relationship(
        "Message", back_populates="quest", cascade="all, delete-orphan"
    )
