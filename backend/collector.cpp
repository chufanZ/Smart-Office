#include <Manager.h>
#include <Options.h>
#include <Notification.h>
#include <platform/Log.h>
#include <unistd.h>
#include <iostream>
#include <map>
#include <fstream>
#include <ctime>
#include <string>

using namespace OpenZWave;
using namespace std;

bool g_init = false;

string csvFilePath = "/home/pi/Desktop/collection_sensordata/sensor_data.csv";

float temperature = -1;
int motion = 0;
int humidity = -1;
int luminance = -1;
int ultraviolet = -1;
int battery = -1;
//uint32_t homeId = 0;
uint8_t targetNodeId = 4;

string getCurrentTimestamp() {
	time_t now = time(0);
	char buf[80];
	strftime(buf, sizeof(buf), "%Y-%m-%d %H:%M:%S", localtime(&now));
	return string(buf);
}

// uint32_t g_homeId = 0;
// map<ValueID, string> g_valueLabels;

/*
string GetSensorTypeString(ValueID::SensorType type) {
    switch (type) {
        case ValueID::SensorType_Temperature: return "Temperature (°C)";
        case ValueID::SensorType_Humidity: return "Humidity (%)";
        case ValueID::SensorType_Luminance: return "Luminance (lux)";
        case ValueID::SensorType_Ultraviolet: return "UV Index";
        case ValueID::SensorType_Power: return "Power (W)";
        case ValueID::SensorType_SeismicIntensity: return "Seismic";
        default: return "Other Sensor";
    }
}
*/


void OnNotification(Notification const* notification , void* context) {
	
	ValueID valueId = notification->GetValueID();
	uint8_t nodeId = notification->GetNodeId();
	
	if (nodeId != targetNodeId) { return; }
			
	if(notification->GetType() == Notification::Type_ValueChanged) {
			
		//ValueID valueId = notification->GetValueID();
		//uint8_t nodeId = notification->GetNodeId();
		uint8_t ccid = valueId.GetCommandClassId();
		//string label = Manager::Get()->GetValueLabel(valueId);
		
		if (ccid == 0x30) {
			bool detected;
			if (Manager::Get()->GetValueAsBool(valueId, &detected)) {
					motion = detected ? 1 : 0;
					cout << "Motion detected: " << (motion ? "Yes" : "No") << endl;
				}
		} else if (ccid == 0x31) {
				string label = Manager::Get()->GetValueLabel(valueId);
				string valueStr;
				Manager::Get()->GetValueAsString(valueId, &valueStr);
					
				if (label.find("Temperature") != string::npos) {
					temperature = stof(valueStr);
					if (temperature > 60) {
							temperature = (temperature - 32) * 5.0 / 9.0;
						}
				} else if (label.find("Humidity") != string::npos) {
					humidity = stoi(valueStr);
				} else if (label.find("Luminance") != string::npos) {
					luminance = stoi(valueStr);
				} else if (label.find("Ultraviolet") != string::npos) {
					ultraviolet = stoi(valueStr);
				}
				
				cout << "  " << label << ": " << valueStr << endl;
			} else if (ccid == 0x80) {
				uint8_t val;
				if (Manager::Get()->GetValueAsByte(valueId, &val)) {
					battery = (int)val;
					cout << "Battery: " << battery << endl;
				}
			}
	}
	
	if (notification->GetType() == Notification::Type_NodeQueriesComplete) {
		g_init = true;
		cout << "Node " << (int)nodeId << " ready." << endl;
	}
}
    
	
int main() {
    Options::Create("/etc/openzwave", "", "");
    Options::Get()->AddOptionInt("SaveLogLevel", LogLevel_Detail);
    Options::Get()->AddOptionInt("QueueLogLevel", LogLevel_Debug);
    Options::Get()->AddOptionBool("ConsoleOutput", true);
    Options::Get()->Lock();

    Manager::Create();
    Manager::Get()->AddWatcher(OnNotification, nullptr);

    string devicePath = "/dev/ttyACM0";
    Manager::Get()->AddDriver(devicePath);
    
    //cout << "Waiting for Z-Wave network..." << endl;

    while (!g_init) {
        sleep(1);
    }

    //cout << "Z-Wave device is ready. Listening for notifications..." << endl;
    
    sleep(10);
    
    ofstream outFile(csvFilePath, ios::app);
    if (outFile.tellp() == 0) {
		outFile << "timestamp,node,temperature,motion,humidity,luminance,ultraviolet,battery" << endl;
	}
	
	outFile << getCurrentTimestamp() << ","
			<< (int)targetNodeId << ","
			<< temperature << ","
			<< motion << ","
			<< humidity << ","
			<< luminance << ","
			<< ultraviolet << ","
			<< battery << endl;
    
    outFile.close();
    cout << "Data written to CSV." << endl;

    Manager::Get()->RemoveWatcher(OnNotification, nullptr);
    Manager::Get()->RemoveDriver(devicePath);
    Manager::Destroy();
    Options::Destroy();

    return 0;
}
