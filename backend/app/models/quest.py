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
    __table_args__ = {"schema": "public"}

    # ── columns ──────────────────────────────────────────────
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    creator_id: Mapped[str] = mapped_column(
        String,
        ForeignKey("public.user.id", ondelete="CASCADE"),
        nullable=False,
    )
    hunter_id: Mapped[str | None] = mapped_column(
        String,
        ForeignKey("public.user.id", ondelete="SET NULL"),
        nullable=True,
    )
    title: Mapped[str] = mapped_column(Text, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    building_zone_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("public.building_zones.id", ondelete="RESTRICT"),
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
        Enum(QuestStatus, name="quest_status", schema="public", create_type=False, values_callable=lambda x: [e.value for e in x]),
        nullable=False,
        default=QuestStatus.OPEN,
    )
    moderation_status: Mapped[ModerationStatus] = mapped_column(
        Enum(ModerationStatus, name="moderation_status", schema="public", create_type=False, values_callable=lambda x: [e.value for e in x]),
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
        foreign_keys=[creator_id],
        back_populates="created_quests",
    )
    hunter = relationship(
        "Profile",
        foreign_keys=[hunter_id],
        back_populates="hunted_quests",
    )
    building_zone = relationship("BuildingZone", back_populates="quests")
    messages = relationship(
        "Message", back_populates="quest", cascade="all, delete-orphan"
    )
