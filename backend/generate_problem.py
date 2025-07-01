import time
import os
import csv

CSV_PATH = "sensor_data.csv"
DOMAIN_FILE = "domain.pddl"
PROBLEM_FILE = "problem.pddl"
PLANNER_CMD = "/home/pi/downward/fast-downward.py /home/pi/Desktop/collection_sensordata/domain.pddl /home/pi/Desktop/collection_sensordata/problem.pddl --search \"astar(blind())\""

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
        }

def generate_problem_file(data, output_path = PROBLEM_FILE):
    motion = data["motion"]
    temp = data["temperature"]
    light = data["luminance"]
    
    goal_conditions = []
    init_conditions = [
        "(room meeting1)",
        "(light plugwise1)",
        "(conditioner plugwise2)",
        "(installed-in-light plugwise1 meeting1)",
        "(installed-in-conditioner plugwise2 meeting1)",
        "(light-off plugwise1)",
        "(conditioner-off plugwise2)"
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

    with open(output_path, "w") as f:
        f.write("(define (problem control-meeting)\n")
        f.write("  (:domain smart-office)\n")
        f.write("  (:objects plugwise1 plugwise2 - device meeting1 - room)\n")
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
                            

def execute_plan(plan_file = "sas_plan"):
    if not os.path.exists(plan_file):
        print("No plan file generated.")
        return
        
    with open(plan_file, "r") as f:
        for line in f:
            action = line.strip().lower()
            print(f"Executing: {action}")

            if "turn-on-light" in action:
                os.system("python3 control_light.py on")
            elif "turn-off-light" in action:
                os.system("python3 control_light.py off")
            elif "turn-on-conditioner" in action:
                os.system("python3 control_conditioner.py on")
            elif "turn-off-conditioner" in action:
                os.system("python3 control_conditioner.py off")
            elif "sned-notification" in action:
                print("[COMMAND] send-notification meeting1")
    
def main():
    if os.path.exists("sas_plan"):
        os.remove("sas_plan")
    print("Reading sensor data ...")
    data = read_sensor_data()
    print("Generating problem file ...")
    generate_problem_file(data)
    print("Executing planner ...")
    os.system(PLANNER_CMD)
    print("Executing plan ...")
    execute_plan()
    print("Done.")

if __name__ == "__main__":
    main()
