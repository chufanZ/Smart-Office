import time
import os
import csv
import paho.mqtt.client as mqtt
import json
from plan_mongodb import save_plan_mongodb

CSV_PATH = "sensor_data.csv"
DOMAIN_FILE = "domain.pddl"
PROBLEM_FILE = "problem.pddl"
LAST_STATE_FILE = "last_state.json"
PLANNER_CMD = "/home/pi/downward/fast-downward.py /home/pi/Desktop/collection_sensordata/domain.pddl /home/pi/Desktop/collection_sensordata/problem.pddl --search \"astar(blind())\""

def load_last_state():
    default = {"light": "off", "conditioner": "off", "dehumidifier": "off"}
    if not os.path.exists(LAST_STATE_FILE):
        return default
    try:
        with open(LAST_STATE_FILE, "r") as f:
            state = json.load(f)
        for key in default:
            if key not in state:
                state[key] = default[key]
        return state
    except Exception:
        return default
        
def save_last_state(state):
    with open(LAST_STATE_FILE, "w") as f:
        json.dump(state, f)

def read_sensor_data(csv_path = CSV_PATH):
    with open(CSV_PATH, newline='') as csvfile:
        reader = csv.DictReader(csvfile)
        rows = list(reader)
        if not rows:
            return None
        lastest = rows[-1]
        return {
            "temperature": float(lastest["temperature"]),
            "motion": int(lastest["motion"]),
            "luminance": float(lastest["luminance"]),
            "humidity": float(lastest["humidity"]),
            "timestamp": lastest["timestamp"]
        }


def generate_problem_file(data, output_path = PROBLEM_FILE):
    motion = data["motion"]
    temp = data["temperature"]
    light = data["luminance"]
    humidity = data["humidity"]
    
    goal_conditions = []
    init_conditions = [
        "(room meeting1)",
        "(light plugwise1)",
        "(conditioner plugwise2)",
        "(dehumidifier plugwise3)",
        "(installed-in-light plugwise1 meeting1)",
        "(installed-in-conditioner plugwise2 meeting1)",
        "(installed-in-dehumidifier plugwise3 meeting1)",
        "(light-off plugwise1)",
        "(conditioner-off plugwise2)",
        "(dehumidifier-off plugwise3)"
    ]
    if motion:
        init_conditions.append("(motion-in meeting1)")
        goal_conditions.append("(notified meeting1)")
        
        if light <= 100:
            init_conditions.append("(dark meeting1)")
            goal_conditions.append("(light-on plugwise1)")
        if temp >= 26:
            init_conditions.append("(hot meeting1)")
            goal_conditions.append("(conditioner-on plugwise2)")
    else:
        goal_conditions.append("(light-off plugwise1)")
        goal_conditions.append("(conditioner-off plugwise2)")
    
    if humidity >= 75:
        init_conditions.append("(humidity meeting1)")
        goal_conditions.append("(dehumidifier-on plugwise3)")
    else:
        goal_conditions.append("(dehumidifier-off plugwise3)")

    with open(output_path, "w") as f:
        f.write("(define (problem control-meeting)\n")
        f.write("  (:domain smart-office)\n")
        f.write("  (:objects plugwise1 plugwise2 plugwise3 - device meeting1 - room)\n")
        f.write("  (:init\n")
        for cond in init_conditions:
            f.write(f"    {cond}\n")
        f.write(f"  )\n")
        if goal_conditions:
            f.write("  (:goal\n")
            f.write("    (and\n")
            for goal in goal_conditions:
                f.write(f"      {goal}\n")
            f.write(f"     )\n")
            f.write(f"  )\n")
        else:
            f.write("   (:goal (and))\n")
        f.write(")\n")
        
def send_mqtt_actions(actions):
    client = mqtt.Client()
    client.connect("localhost", 1883, 60)
    payload = json.dumps({"actions": actions})
    client.publish("htn/commands", payload)
    client.disconnect()
    print("[INFO] Notify action found.")
                            

def execute_plan(plan_file = "sas_plan"):
    if not os.path.exists(plan_file):
        print("No plan file generated.")
        return
        
    actions = []
    data = read_sensor_data()
        
    with open(plan_file, "r") as f:
        for line in f:
            action = line.strip().lower()
            print(f"Executing: {action}")

            if "turn-on-light" in action:
                #os.system("python3 controller_mqtt.py turn_on_plug1")
                actions.append("turn_on_plug1")
            elif "turn-off-light" in action:
                #os.system("python3 controller_mqtt.py turn_off_plug1")
                actions.append("turn_off_plug1")
            elif "turn-on-conditioner" in action:
                #os.system("python3 controller_mqtt.py turn_on_plug2")
                actions.append("turn_on_plug2")
            elif "turn-off-conditioner" in action:
                #os.system("python3 controller_mqtt.py turn_off_plug2")
                actions.append("turn_off_plug2")
            elif "send-notification" in action:
                actions.append("send-notification")
                print("[COMMAND] send-notification meeting1")
            elif "turn-on-dehumidifier" in action:
                actions.append("turn_on_plug3")
            elif "turn-off-dehumidifier" in action:
                actions.append("turn_off_plug3")
                
    send_mqtt_actions(actions)
    
    timestamp = data["timestamp"]
    save_plan_mongodb(actions, timestamp)
    
    
    return actions
    
def main():
    if os.path.exists("sas_plan"):
        os.remove("sas_plan")
    print("Reading sensor data ...")
    data = read_sensor_data()
    
    if not data:
        print("[ERROR] No sensor data found.")
        return
    
    motion = data["motion"]
    light = data["luminance"]
    temp = data["temperature"]
    humidity = data["humidity"]
    timestamp = data["timestamp"]
    
    last_state = load_last_state()
    desired_state = last_state.copy()
    actions = []
    
    if motion:
        print("[INFO] Detected motion.")
        if light <= 100 and last_state["light"] == "off":
            actions.append("turn_on_plug1")
            desired_state["light"] = "on"
        if temp >= 26 and last_state["conditioner"] == "off":
            actions.append("turn_on_plug2")
            desired_state["conditioner"] = "on"
        elif temp < 26 and last_state["conditioner"] == "on":
            actions.append("turn_off_plug2")
            desired_state["conditioner"] = "off"
    else:
        print("[INFO] No motion detected.")
        if last_state["light"] == "on":
            actions.append("turn_off_plug1")
            desired_state["light"] = "off"
        if last_state["conditioner"] == "on":
            actions.append("turn_off_plug2")
            desired_state["conditioner"] = "off"
            
    if humidity >= 75 and last_state["dehumidifier"] == "off":
        actions.append("turn_on_plug3")
        desired_state["dehumidifier"] = "on"
    elif humidity < 75 and last_state["dehumidifier"] == "on":
        actions.append("turn_off_plug3")
        desired_state["dehumidifier"] = "off"

    if actions:
        print("[STEP] Sending MQTT actions ...")
        send_mqtt_actions(actions)
        save_last_state(desired_state)
    else:
        print("[INFO] No state changes needed.")

    print("[DONE]")
    
    print("Generating problem file ...")
    generate_problem_file(data)
    print("Executing planner ...")
    os.system(PLANNER_CMD)
    print("Executing plan ...")
    execute_plan()
    print("Save ...")
    #save_plan_mongodb(actions, timestamp)
    print("Done.")

if __name__ == "__main__":
    main()
