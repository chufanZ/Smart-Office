import paho.mqtt.client as mqtt
import json
import sys
sys.path.insert(0, "/home/pi/python-plugwise")

from plugwise.api import Stick, Circle

# MQTT configuration
MQTT_BROKER = "localhost"
MQTT_PORT = 1883

# Topics
MQTT_TOPIC_COMMAND = "htn/commands"
MQTT_TOPIC_STATUS_PREFIX = "htn/status"

PLUG_ID_MAP = {
    "plug1": "000D6F0004B1EF8A",
    "plug2": "000D6F0000990773"
}

DEFAULT_PORT = "/dev/ttyUSB0"

stick = Stick(DEFAULT_PORT)

client = None

def publish_status(plug_name, state):
    topic = f"{MQTT_TOPIC_STATUS_PREFIX}/{plug_name}"
    payload = json.dumps({"state": state.upper()})
    client.publish(topic, payload)
    print(f"[MQTT] Published -> {topic}: {state.upper()}")

# Control function
def control_plug(plug_name, state):
    mac = PLUG_ID_MAP.get(plug_name)
    if not mac:
        if plug_name == "plug3":
            print(f"[INFO] Skipping control for {plug_name} (manual only)")
        else:
            print(f"[INFO] Unknown plug: {plug_name}")
    
    try:
        circle = Circle(mac, stick)
        if state.lower() == "on":
            circle.switch_on()
            print(f"[ACTION] {plug_name} (ID: {mac}) turned ON")
        elif state.lower() == "off":
            circle.switch_off()
            print(f"[ACTION] {plug_name} (ID: {mac}) turned OFF")
        else:
            print(f"[ERROR] Unknown state: {state}")

        publish_status(plug_name, state)
    except Exception as e:
        print(f"[ERROR] Failed to control {plug_name}: {e}")
    #payload = json.dumps({"state": state.upper()})
    #client.publish(topic, payload)
    #print(f"[ACTION] Plug {plug_id} turned {state.upper()}")

# HTN command handler
def process_htn_signal(actions):
    for action in actions:
        if action == "turn_on_plug1":
            control_plug("plug1", "ON")
        elif action == "turn_off_plug1":
            control_plug("plug1", "OFF")
        elif action == "turn_on_plug2":
            control_plug("plug2", "ON")
        elif action == "turn_off_plug2":
            control_plug("plug2", "OFF")
        else:
            print(f"[WARNING] Unknown action: {action}")

# MQTT event: on message received
def on_message(client, userdata, msg):
    print(f"[RECEIVED] Topic: {msg.topic}")
    # payload = msg.payload.decode("utf-8")
    try:
        payload = json.loads(msg.payload.decode("utf-8"))
        actions = payload.get("actions", [])
        process_htn_signal(actions)
    except Exception as e:
        print(f"[ERROR] Failed to process message: {e}")

# MQTT event: on connect
def on_connect(client, userdata, flags, rc):
    print(f"[CONNECTED] MQTT broker with result code {rc}")
    client.subscribe(MQTT_TOPIC_COMMAND)
    print(f"[SUBSCRIBED] Listening to topic: {MQTT_TOPIC_COMMAND}")

# --- Main MQTT loop ---
def main():
    global client
    client = mqtt.Client()
    client.on_connect = on_connect
    client.on_message = on_message
    
    client.connect(MQTT_BROKER, MQTT_PORT, 60)

    print("[RUNNING] Waiting for HTN signals...")
    client.loop_forever()

if __name__ == "__main__":
    main()
