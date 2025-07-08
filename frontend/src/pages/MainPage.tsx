import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import EnvironmentGauges from "../components/EnvironmentGauge";
import SensorLineChart from '../components/SensorLineChart'

const socket = io("http://localhost:3000");

export default function SmartRoomStatus() {
  const [sensorData, setSensorData] = useState<any>(null);
  //gauge  
  const [temp, setTemp] = useState(0);
  const [humi, setHumi] = useState(0);

  useEffect(() => {
    socket.on("sensor-data", (data) => {
        console.log("Received sensor data:", data.node);
      setSensorData(data);
        // Update gauges
        setTemp(parseFloat(data.temperature));
        setHumi(parseFloat(data.humidity));
      

    });

    return () => {
      socket.off("sensor-data");
    };
  }, []);

  return (
    //  style={{ width: "1000px" }}
    <div >

        {1 /*in real time  */}
      <div>
        <h2 className="text-xl font-bold mb-4 text-gray-800">📡 Real-time Sensor Status</h2>
        {sensorData ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700">
            {/* Temperature */}
            <div className="flex items-center gap-2">
              <span className="text-xl">🌡️</span>
              <span className="font-medium">Temperature:</span>
              <span>{sensorData.temperature}°C</span>
            </div>

            {/* Humidity */}
            <div className="flex items-center gap-2">
              <span className="text-xl">💧</span>
              <span className="font-medium">Humidity:</span>
              <span>{sensorData.humidity}%</span>
            </div>

            {/* Luminance */}
            <div className="flex items-center gap-2">
              <span className="text-xl">🔆</span>
              <span className="font-medium">Luminance:</span>
              <span>{sensorData.luminance}</span>
            </div>

            {/* Ultraviolet */}
            <div className="flex items-center gap-2">
              <span className="text-xl">☀️</span>
              <span className="font-medium">UV Index:</span>
              <span>{sensorData.ultraviolet}</span>
            </div>

            {/* Motion */}
            <div className="flex items-center gap-2">
              <span className="text-xl">🧍</span>
              <span className="font-medium">Presence:</span>
              <span className={sensorData.motion ? "text-green-600" : "text-gray-400"}>
                {sensorData.motion ? "Yes" : "No"}
              </span>
            </div>

            {/* Light */}
            <div className="flex items-center gap-2">
              <span className="text-xl">💡</span>
              <span className="font-medium">Light:</span>
              <span className={sensorData.light === "on" ? "text-yellow-500" : "text-gray-400"}>
                {sensorData.light}
              </span>
            </div>

            {/* Air Conditioner */}
            <div className="flex items-center gap-2 col-span-full">
              <span className="text-xl">❄️</span>
              <span className="font-medium">AC Temperature:</span>
              <span className={sensorData.ac ? "text-blue-500" : "text-gray-400"}>
                {sensorData.ac ? `${sensorData.ac}°C` : "Off"}
              </span>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">Waiting for data...</p>
        )}
      </div>

{/* 2 */}
   <SensorLineChart />
      {/* <HistoricalSensorChart /> */}
    

      {3/* gauge */}
      <div className="  shadow rounded-xl p-6">
        {/* gauge */}
        <div className="p-6 space-y-4">
        <EnvironmentGauges temperature={temp} humidity={humi} />
        </div>
      </div>
   
    {/* 4 */}
    <div>
      <img src="../assert/image.png" alt="meetingroom" />
    </div>
   
    </div>
  );
}
