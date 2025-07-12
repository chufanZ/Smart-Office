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

  // 🔧 每 3 秒轮询 email 发信状态
  useEffect(() => {
    const fetchEmailStatus = async () => {
      try {
        const res = await fetch("/api/notification-status");
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
        const latestPlan = plans[plans.length - 1] || {};
        const actions: string[] = latestPlan.actions || [];
        const time: string = latestPlan.timestamp || "";

        setPlanTimestamp(time);
        setPlugStates({
          plug1: actions.includes("turn_on_plug1"),
          plug2: actions.includes("turn_on_plug2"),
          plug3: actions.includes("turn_on_plug3"),
          notification: actions.includes("send-notification"),
        });
        console.log("Latest plan actions:noticifation", actions.includes("send-notification"));
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
    fetch("/api/notification-shown", { method: "POST" }).catch(console.error);
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
                <span className={sensorData.motion ? "text-green-600" : "text-gray-400"}>
                  {sensorData.motion ? "Yes" : "No"}
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
                <span className="font-medium">UV Index:</span>
                <span>{sensorData.ultraviolet}</span>
              </div>
              {/* <div className="flex items-center gap-2 col-span-full">
                <span className="text-xl">❄️</span>
                <span className="font-medium">AC Temperature:</span>
                <span className={plugStates.plug2 ? "text-blue-500" : "text-gray-400"}>
                  {plugStates.plug2 ? `${sensorData.ac}°C` : "Off"}
                </span>
              </div> */}
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
            hasNotification={plugStates.notification && emailSent}
          />
        </div>
      </div>

      
    </div>
  );
}
