"""In-process test of the FastAPI app to see the exact response."""
import asyncio
import sys
sys.path.insert(0, '.')

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app, raise_server_exceptions=False)

# Test POST create_quest with user_id param
response = client.post(
    "/api/quests?user_id=00000000-0000-0000-0000-000000000001",
    json={
        "title": "ValidTitle",
        "description": "Valid description for quest",
        "latitude": 40.0,
        "longitude": -105.0,
        "cost_credits": 0,
        "reward_credits": 10,
        "reward_notoriety": 2,
    },
)
print(f"Status: {response.status_code}")
print(f"Body: {response.text[:500]}")
