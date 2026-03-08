"""Quest chat endpoints - ``/quests/{quest_id}/messages``."""

from fastapi import APIRouter, Depends, HTTPException, Query, WebSocket, WebSocketDisconnect, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.message import Message
from app.models.quest import Quest
from app.schemas.message import MessageCreate, MessageRead

router = APIRouter(prefix="/quests", tags=["messages"])


# ------------------------------------------------------------------
# GET /quests/{quest_id}/messages
# ------------------------------------------------------------------
@router.get("/{quest_id}/messages", response_model=list[MessageRead])
async def list_messages(
    quest_id: int,
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List chat messages for a quest.

    Only the creator and hunter of the quest may view messages.
    """
    quest = await _get_quest_or_404(quest_id, db)
    _assert_participant(quest, user_id)

    stmt = (
        select(Message)
        .where(Message.quest_id == quest_id)
        .order_by(Message.created_at.asc())
        .offset(offset)
        .limit(limit)
    )
    result = await db.execute(stmt)
    return result.scalars().all()


# ------------------------------------------------------------------
# POST /quests/{quest_id}/messages
# ------------------------------------------------------------------
@router.post(
    "/{quest_id}/messages",
    response_model=MessageRead,
    status_code=status.HTTP_201_CREATED,
)
async def send_message(
    quest_id: int,
    payload: MessageCreate,
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Send a chat message within an active quest session.

    Only the creator or hunter may send messages, and the quest must
    be in an active state (``claimed`` or ``completed``).
    """
    quest = await _get_quest_or_404(quest_id, db)
    _assert_participant(quest, user_id)

    if quest.status not in ("claimed", "completed"):
        raise HTTPException(
            status.HTTP_409_CONFLICT,
            "Chat is only available while the quest is active",
        )

    message = Message(
        quest_id=quest_id,
        sender_id=user_id,
        text=payload.text,
    )
    db.add(message)
    await db.commit()
    await db.refresh(message)
    return message


# ------------------------------------------------------------------
# helpers
# ------------------------------------------------------------------
async def _get_quest_or_404(quest_id: int, db: AsyncSession) -> Quest:
    result = await db.execute(select(Quest).where(Quest.id == quest_id))
    quest = result.scalar_one_or_none()
    if quest is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Quest not found")
    return quest


def _assert_participant(quest: Quest, user_id: str) -> None:
    if user_id not in (quest.creator_id, quest.hunter_id):
        raise HTTPException(
            status.HTTP_403_FORBIDDEN,
            "Only quest participants can access chat",
        )
