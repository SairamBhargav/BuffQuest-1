"""Business logic for attendance checking."""

from datetime import date

from fastapi import HTTPException, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.attendance import AttendanceSubmission, AttendanceVerificationStatus
from app.models.profile import Profile
from app.models.reward_log import RewardLog, RewardSourceType
from app.schemas.attendance import AttendanceSubmissionCreate
from app.services.location_service import verify_user_in_zone

async def process_attendance_checkin(
    db: AsyncSession,
    user_id: str,
    payload: AttendanceSubmissionCreate
) -> AttendanceSubmission:
    """Validate geofencing, check for duplicates, and issue attendance rewards."""
    
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

    # Ensure profile exists before issuing rewards and saving submission
    result_profile = await db.execute(select(Profile).where(Profile.id == user_id))
    profile = result_profile.scalar_one_or_none()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User profile not found."
        )

    # Validate physical presence if checking into a designated campus building
    if payload.building_zone_id is not None:
        await verify_user_in_zone(
            db=db,
            building_zone_id=payload.building_zone_id,
            user_lat=payload.user_lat,
            user_lon=payload.user_lon,
            allowed_radius_meters=150.0
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
    profile.credits += 5
    reward_log = RewardLog(
        user_id=user_id,
        source_type=RewardSourceType.ATTENDANCE_REWARD,
        credit_delta=5,
        notoriety_delta=0
    )
    db.add(reward_log)

    return submission
