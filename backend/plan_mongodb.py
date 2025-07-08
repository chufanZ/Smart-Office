from pymongo import MongoClient
from datetime import datetime

uri = "mongodb+srv://chufanzhang1995:2025@cluster.ejbbx7s.mongodb.net/?retryWrites=true&w=majority&appName=Cluster"
client = MongoClient(uri)
db = client['smartOffice']
collection = db['plan']

def save_plan_mongodb(actions, timestamp):
    try:
        doc = {
            "timestamp": timestamp,
            "actions": actions
        }
        
        collection.insert_one(doc)
    except Exception as e:
        print("[ERROR] MongoDB insert failed:", e)
