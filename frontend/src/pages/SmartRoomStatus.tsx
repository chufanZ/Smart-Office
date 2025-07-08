import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import EnvironmentGauges from "../components/EnvironmentGauge";
import SensorLineChart from '../components/SensorLineChart'
import meetingroomImg from '../assets/image.png';
import SmartRoomIllustration from "../components/SmartRoomIllustration";
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
      
      console.log("Sensor data1:", data);
    });

    return () => {
      socket.off("sensor-data");
    };
  }, []);

  return (
    //  style={{ width: "1000px" }}
    // <div className="w-full h-full flex flex-col gap-4 p-4  w-500 " style={{width: "100%", maxWidth: "1200px"}}>
    <div className=" w-screen p-4 flex flex-col gap-8 overflow-hidden bg-white">
 
      <div className="flex flex-1 flex-row gap-4 ">
        
  {/* gauge */}
        <div className="w-1/4 p-6 rounded-lg shadow-md">
            {/* gauge */}
            {/* <div className="p-6 space-y-4"> */}
            <EnvironmentGauges temperature={temp} humidity={humi} />
            {/* </div> */}
          </div>
      
        {/* 2 */}
        <div className="flex flex-row gap-4 ">
        <SensorLineChart />
        {/* <HistoricalSensorChart /> */}
        </div>
      </div>


{/* bottom */}
        <div className="flex flex-row gap-4 ">
{ /*in real time  */}
        <div className="w-1/5 bg-gray-200">
          <h2 className="text-xl font-bold mb-4 text-gray-800">📡 Real-time Sensor Status</h2>
          {sensorData ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700">
              {/* Motion */}
              <div className="flex items-center gap-2">
                <span className="text-xl">🧍</span>
                <span className="font-medium">Presence:</span>
                <span className={sensorData.motion ? "text-green-600" : "text-gray-400"}>
                  {sensorData.motion ? "Yes" : "No"}
                </span>
              </div>

            
              {/* Humidity */}
              <div className="flex items-center gap-2">
                <span className="text-xl">💧</span>
                <span className="font-medium">Humidity:</span>
                <span>{sensorData.humidity}%</span>
              </div>
            
             {/* Temperature */}
              <div className="flex items-center gap-1">
                <span className="text-x2">🌡️</span>
                <span className="font-medium">Temperature:</span>
                <span>{sensorData.temperature}°C</span>
              </div>

               {/* Light */}
              <div className="flex items-center gap-2">
                <span className="text-xl">💡</span>
                <span className="font-medium">Light:</span>
                <span className={sensorData.light === "on" ? "text-yellow-500" : "text-gray-400"}>
                  {sensorData.light}
                </span>
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
        
          {/* 4 */}
          <div className="flex-1 relative h-64">
            {/* <img src={meetingroomImg} alt="meetingroom"  className="w-full h-full object-cover rounded"/> */}
            {/* <SmartRoomIllustration motion={sensorData.motion}  /> */}
            <SmartRoomIllustration motion={sensorData?.motion || 0} humidity={sensorData?.humidity||0}
            luminance={sensorData?.luminance ||0} temperature ={sensorData?.temperature||0}/>
          </div>
      
      </div>
    
    </div>
  
  );
}
