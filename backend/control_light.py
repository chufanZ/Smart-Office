import sys

def control_light(action):
    if action == "on":
        print("Turning on the light ...")
    elif action == "off":
        print("Turning off the light ...")
    else:
        print("Invalid action. Use 'on' or 'off'.")

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python control_light.py <on|off>")
    else:
        control_light(sys.argv[1])
