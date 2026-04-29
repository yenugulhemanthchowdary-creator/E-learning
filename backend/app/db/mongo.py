from collections.abc import AsyncGenerator

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from pymongo import ReturnDocument

from app.core.config import settings

client = AsyncIOMotorClient(settings.mongo_url)
database = client[settings.mongo_db_name]


async def get_db() -> AsyncGenerator[AsyncIOMotorDatabase, None]:
    """Yield the shared MongoDB database for request-scoped access."""

    yield database


async def next_sequence(name: str) -> int:
    """Return the next monotonically increasing integer for a collection."""

    result = await database["counters"].find_one_and_update(
        {"_id": name},
        {"$inc": {"seq": 1}},
        upsert=True,
        return_document=ReturnDocument.AFTER,
    )
    return int(result["seq"])


async def ensure_sequence(name: str, value: int) -> None:
    """Seed or reset a named sequence counter to a known value."""

    await database["counters"].update_one({"_id": name}, {"$set": {"seq": value}}, upsert=True)
