import subprocess
import time
import os

WATCH_DIR = "/Users/chufanzhang/Uni Stuttgart/SoSe2025/Smart City and Internet of Things/project/Smart-Office/backend"
CSV_PATH = os.path.join(WATCH_DIR, "sensor_data.csv")
LAST_MOD = None

def pull_csv():
    subprocess.run([
        "scp",
        "pi@raspberrypi.local:/home/pi/Desktop/collection_sensordata/sensor_data.csv",
        f"{CSV_PATH}"
    ])

while True:
    pull_csv()
    new_mode = os.path.getmtime(CSV_PATH)
    if LAST_MOD is None or new_mode > LAST_MOD:
        print("[INFO] New CSV detected.")
        subprocess.run(["python3", "sensordata_mongodb.py"])
        subprocess.run(["python3", "generate_problem.py"])
        LAST_MOD = new_mode
    else:
        print("[INFO] No updated.")
    time.sleep(60)
