import sys

def control_conditioner(action):

    if action == "on":
        print("Turning on the conditioner ...")
    elif action == "off":
        print("Turning off the conditioner ...")
    else:
        print("Invalid action. Use 'on' or 'off'.")

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python control_conditioner.py <on|off>")
    else:
        control_conditioner(sys.argv[1])
