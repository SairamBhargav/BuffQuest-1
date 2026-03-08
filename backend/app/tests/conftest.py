"""Ensure all SQLAlchemy models are imported before tests run.

SQLAlchemy needs every model class to be imported so that
relationship() references (e.g. Profile -> 'Message') can be resolved
when the mapper configures itself.
"""

# Import all models so the mapper registry is fully populated
from app.models.profile import Profile          # noqa: F401
from app.models.quest import Quest              # noqa: F401
from app.models.message import Message          # noqa: F401
from app.models.reward_log import RewardLog     # noqa: F401
from app.models.building_zone import BuildingZone  # noqa: F401
from app.models.attendance import AttendanceSubmission  # noqa: F401
