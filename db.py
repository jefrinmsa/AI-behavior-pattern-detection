"""
WorkSense — Centralized MongoDB Connection Module
All backend scripts import from here.
"""
from pymongo import MongoClient

MONGO_URI = "mongodb+srv://msajefrin1_db_user:zCoCRsVGMNYktnvc@cluster0.5at5d9f.mongodb.net/?appName=Cluster0"
DB_NAME = "worksense"

_client = None
_db = None

def get_db():
    """Returns the MongoDB database handle. Reuses connection across calls."""
    global _client, _db
    if _db is None:
        _client = MongoClient(MONGO_URI)
        _db = _client[DB_NAME]
    return _db

def get_collection(name):
    """Shorthand to get a collection by name."""
    return get_db()[name]
