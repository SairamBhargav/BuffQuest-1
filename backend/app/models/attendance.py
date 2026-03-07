"""SQLAlchemy model for the ``attendance_submissions`` table."""

import enum
import uuid
from datetime import datetime

from sqlalchemy import BigInteger, Boolean, DateTime, ForeignKey, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class AttendanceVerificationStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class AttendanceSubmission(Base):
    """Maps to ``public.attendance_submissions``."""

    __tablename__ = "attendance_submissions"
    __table_args__ = {"schema": "public"}

    # ── columns ──────────────────────────────────────────────
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("public.profiles.id", ondelete="CASCADE"),
        nullable=False,
    )
    schedule_image_url: Mapped[str] = mapped_column(Text, nullable=False)
    class_photo_url: Mapped[str] = mapped_column(Text, nullable=False)
    class_name: Mapped[str] = mapped_column(Text, nullable=False)
    building_zone_id: Mapped[int | None] = mapped_column(
        BigInteger,
        ForeignKey("public.building_zones.id", ondelete="SET NULL"),
    )
    scheduled_start_time: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )
    submission_time: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    verification_status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default=AttendanceVerificationStatus.PENDING.value,
    )
    reward_issued: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    # ── relationships ────────────────────────────────────────
    user = relationship("Profile", back_populates="attendance_submissions")
    building_zone = relationship(
        "BuildingZone", back_populates="attendance_submissions"
    )
