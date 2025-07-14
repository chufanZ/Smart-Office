import csv
from pymongo import MongoClient

uri = "mongodb+srv://chufanzhang1995:2025@cluster.ejbbx7s.mongodb.net/?retryWrites=true&w=majority&appName=Cluster"
client = MongoClient(uri)
db = client['smartOffice']
collection = db['sensorData']

csv_path = "sensor_data.csv"

try:
	with open(csv_path, "r") as file:
		reader = csv.DictReader(file)
		rows = list(reader)
		
		if not rows:
			print("Empty CSV...")
		else:
			last_row = rows[-1]
			doc = {
				"timestamp": last_row["timestamp"],
				"node": int(last_row["node"]),
				"temperature": float(last_row["temperature"]),
				"motion": int(last_row["motion"]),
				"humidity": int(last_row["humidity"]),
				"luminance": int(last_row["luminance"]),
				"ultraviolet": int(last_row["ultraviolet"]),
				"battery": int(last_row["battery"])
			}
			result = collection.insert_one(doc)
			print("Data upload successful!")
				
except Exception as e:
	print("Some error during reading...", e)
