"""Database seeding logic for BuffQuest."""

import logging
from sqlalchemy import select
from app.core.database import Base, engine, AsyncSessionLocal
from app.models.building_zone import BuildingZone

logger = logging.getLogger("buffquest.seed")

# Initial seed data for CU Boulder campus
SEED_BUILDINGS = [
    {
        "name": "University Memorial Center (UMC)",
        "latitude": 40.0067,
        "longitude": -105.2711,
        "radius_meters": 100.0,
    },
    {
        "name": "Norlin Library",
        "latitude": 40.0089,
        "longitude": -105.2707,
        "radius_meters": 100.0,
    },
    {
        "name": "Engineering Center",
        "latitude": 40.0075,
        "longitude": -105.2635,
        "radius_meters": 150.0,
    },
    {
        "name": "Fiske Planetarium",
        "latitude": 40.0035,
        "longitude": -105.2631,
        "radius_meters": 80.0,
    },
    {
        "name": "Student Recreation Center",
        "latitude": 40.0102,
        "longitude": -105.2678,
        "radius_meters": 120.0,
    },
]

async def seed_db():
    """Initialize schema and seed initial data."""
    logger.info("Starting database initialization and seeding...")
    
    async with engine.begin() as conn:
        # Create tables if they don't exist
        # Note: In production with migrations, this might be handled by Alembic,
        # but the user requested create_all for Railway migration.
        await conn.run_sync(Base.metadata.create_all)
    
    async with AsyncSessionLocal() as session:
        # Check if building zones already exist
        result = await session.execute(select(BuildingZone).limit(1))
        if result.scalar_one_or_none() is None:
            logger.info("Seeding building zones...")
            for building_data in SEED_BUILDINGS:
                zone = BuildingZone(**building_data)
                session.add(zone)
            await session.commit()
            logger.info(f"Successfully seeded {len(SEED_BUILDINGS)} building zones.")
        else:
            logger.info("Building zones already exist, skipping seeding.")
    
    logger.info("Database initialization complete.")
