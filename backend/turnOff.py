# test_publish.py
import paho.mqtt.client as mqtt
import json

client = mqtt.Client()
client.connect("172.20.10.12", 1883, 60)
client.loop_start()

msg = { "actions": [ "turn_off_plug1", "turn_off_plug2" ] }
client.publish("htn/commands", json.dumps(msg))
client.loop_stop()
client.disconnect()
