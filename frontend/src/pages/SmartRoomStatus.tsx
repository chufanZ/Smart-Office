import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import EnvironmentGauges from "../components/EnvironmentGauge";
import SensorLineChart from "../components/SensorLineChart";
import SmartRoomIllustration from "../components/SmartRoomIllustration";

const socket = io("http://localhost:3000");

export default function SmartRoomStatus() {
  const [sensorData, setSensorData] = useState<any>(null);
  const [sensorHistory, setSensorHistory] = useState<any[]>([]);
  const [plugStates, setPlugStates] = useState({
    plug1: false,
    plug2: false,
    plug3: false,
    notification: false,
  });
  const [emailSent, setEmailSent] = useState(false); // 🔧 新增邮件状态

  const [timestamp, setPlanTimestamp] = useState<string>("");
  const [temp, setTemp] = useState(0);
  const [humi, setHumi] = useState(0);


  // 
  useEffect(() => {
    const fetchEmailStatus = async () => {
      try {
        const res = await fetch("http://localhost:4444/api/notification-status");
        const json = await res.json();
        console.log("Email status:!!!", json);
        setEmailSent(json.notified); // true / false
      } catch (err) {
        console.error("Failed to fetch email status:", err);
      }
    };

    fetchEmailStatus();
    const interval = setInterval(fetchEmailStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/sensordata");
        const json = await res.json();
        if (!Array.isArray(json) || json.length === 0) return;
        setSensorHistory(json);
      } catch (err) {
        console.error("Failed to fetch sensor data:", err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/plans");
        const plans = await res.json();

        // Default states
        let plug1: boolean | null = null;
        let plug2: boolean | null = null;
        let plug3: boolean | null = null;
        let notification = false;

        // Scan plans from newest to oldest
        for (let i = plans.length - 1; i >= 0; i--) {
          const actions = plans[i].actions || [];

          if (plug1 === null) {
            if (actions.includes("turn_on_plug1")) plug1 = true;
            if (actions.includes("turn_off_plug1")) plug1 = false;
          }

          if (plug2 === null) {
            if (actions.includes("turn_on_plug2")) plug2 = true;
            if (actions.includes("turn_off_plug2")) plug2 = false;
          }

          if (plug3 === null) {
            if (actions.includes("turn_on_plug3")) plug3 = true;
            if (actions.includes("turn_off_plug3")) plug3 = false;
          }

          if (!notification && actions.includes("send-notification")) {
            notification = true;
          }

          // All plug states determined, we can break early
          if (plug1 !== null && plug2 !== null && plug3 !== null && notification) break;
        }

        // Fallback to false if not found
        setPlugStates({
          plug1: plug1 ?? false,
          plug2: plug2 ?? false,
          plug3: plug3 ?? false,
          notification,
        });

        // Still show the latest timestamp for UI display
        const latestPlan = plans[plans.length - 1] || {};
        const time: string = latestPlan.timestamp || "";
        setPlanTimestamp(time);

        const matchedSensor = sensorHistory.find(
          (s) => s.timestamp.slice(0, 19) === time.slice(0, 19)
        );

        if (matchedSensor) {
          setSensorData(matchedSensor);
          setTemp(parseFloat(parseFloat(matchedSensor.temperature).toFixed(1)));
          setHumi(parseFloat(parseFloat(matchedSensor.humidity).toFixed(1)));
        } else {
          setSensorData(null);
        }

      } catch (e) {
        console.error("Failed to fetch plans:", e);
      }
    };

    fetchPlan();
    const interval = setInterval(fetchPlan, 3000);
    return () => clearInterval(interval);
  }, [sensorHistory]);

  useEffect(() => {
  if (plugStates.notification && emailSent) {
    fetch("http://localhost:4444/api/notification-shown", { method: "POST" }).catch(console.error);
  }
}, [plugStates.notification, emailSent]);


  return (
    <div className="w-screen p-4 flex flex-col gap-8 overflow-hidden bg-white">
      <div className="flex flex-1 flex-row gap-4">
        <div className="w-1/4 p-6 rounded-lg shadow-md">
          <EnvironmentGauges temperature={temp} humidity={humi} />
        </div>
        <div className="flex flex-row gap-4">
          <SensorLineChart data={sensorHistory} />
        </div>
      </div>

      <div className="flex flex-row gap-4">
        <div className="w-1/5 bg-gray-200">
          <h2 className="text-xl font-bold mb-4 text-gray-800">📡 Real-time Sensor Status</h2>
           <div className="text-sm text-gray-600 mb-2 gap-8">
            🕒  {timestamp.slice(0, 19)}
          </div>
          {sensorData ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <span className="text-xl">🧍</span>
                <span className="font-medium">Presence:</span>
                <span className={sensorData.motion|| plugStates.plug1 == true||plugStates.plug2 == true ? "text-green-600" : "text-gray-400"}>
                  {sensorData.motion||plugStates.plug1 == true ||plugStates.plug2 == true ? "Yes" : "No"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl">💧</span>
                <span className="font-medium">Humidity:</span>
                <span>{sensorData.humidity}%</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-x2">🌡️</span>
                <span className="font-medium">Temperature:</span>
                <span>{sensorData.temperature.toFixed(1)}°C</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl">💡</span>
                <span className="font-medium">Light:</span>
                <span className={plugStates.plug1 ? "text-yellow-500" : "text-gray-400"}>
                  {plugStates.plug1 ? "on" : "off"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl">🔆</span>
                <span className="font-medium">Luminance:</span>
                <span>{sensorData.luminance}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl">☀️</span>
                <span className="font-medium">Ultraviolet</span>
                <span>{sensorData.ultraviolet}</span>
              </div>
         
            </div>
          ) : (
            <p className="text-gray-500">Waiting for data...</p>
          )}
        </div>

        <div className="flex-1 relative h-64">
          <SmartRoomIllustration
            plug1={plugStates.plug1}
            plug2={plugStates.plug2}
            plug3={plugStates.plug3}
            hasNotification={
               plugStates.notification && emailSent}
          />
        </div>
      </div>

      
    </div>
  );
}
