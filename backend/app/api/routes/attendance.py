"""Attendance endpoints - ``/attendance/…``."""

from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.attendance import AttendanceSubmission, AttendanceVerificationStatus
from app.models.profile import Profile
from app.models.reward_log import RewardLog, RewardSourceType
from app.schemas.attendance import AttendanceSubmissionCreate, AttendanceSubmissionRead

router = APIRouter(prefix="/attendance", tags=["attendance"])


# ------------------------------------------------------------------
# POST /attendance/check-in
# ------------------------------------------------------------------
@router.post(
    "/check-in",
    response_model=AttendanceSubmissionRead,
    status_code=status.HTTP_201_CREATED,
)
async def check_in(
    payload: AttendanceSubmissionCreate,
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Submit a class attendance check-in.
    
    Checks for daily duplicates per class and auto-approves,
    awarding 5 credits immediately.
    """
    # Duplicate check: same user, same class, same day
    today = date.today()
    stmt = (
        select(AttendanceSubmission)
        .where(
            AttendanceSubmission.user_id == user_id,
            AttendanceSubmission.class_name == payload.class_name,
            func.date(AttendanceSubmission.submission_time) == today,
            AttendanceSubmission.verification_status == AttendanceVerificationStatus.APPROVED
        )
    )
    result = await db.execute(stmt)
    if result.scalars().first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"You have already checked into '{payload.class_name}' today."
        )

    submission = AttendanceSubmission(
        user_id=user_id,
        schedule_image_url=payload.schedule_image_url,
        class_photo_url=payload.class_photo_url,
        class_name=payload.class_name,
        building_zone_id=payload.building_zone_id,
        scheduled_start_time=payload.scheduled_start_time,
        verification_status=AttendanceVerificationStatus.APPROVED,
        reward_issued=True,
    )
    db.add(submission)
    
    # Award credits and add reward log
    result_profile = await db.execute(select(Profile).where(Profile.id == user_id))
    profile = result_profile.scalar_one_or_none()
    if profile:
        profile.credits += 5
        reward_log = RewardLog(
            user_id=user_id,
            source_type=RewardSourceType.ATTENDANCE_REWARD,
            credit_delta=5,
            notoriety_delta=0
        )
        db.add(reward_log)

    await db.commit()
    await db.refresh(submission)
    return submission


# ------------------------------------------------------------------
# GET /attendance/history
# ------------------------------------------------------------------
@router.get("/history", response_model=list[AttendanceSubmissionRead])
async def get_attendance_history(
    user_id: str = Depends(get_current_user),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    """Return the authenticated user's attendance submissions."""
    stmt = (
        select(AttendanceSubmission)
        .where(AttendanceSubmission.user_id == user_id)
        .order_by(AttendanceSubmission.submission_time.desc())
        .offset(offset)
        .limit(limit)
    )
    result = await db.execute(stmt)
    return result.scalars().all()
