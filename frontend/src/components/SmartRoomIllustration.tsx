import React from "react";
import { motion as framerMotion } from "framer-motion";

interface Props {
  motion: number;     // Human presence sensor data: > 0 means someone is present
  humidity: number;   // Humidity data
  luminance?: number; // Optional luminance data
  temperature?: number; // Optional temperature data
}
//有人时 光照luminance<=100. 打开灯 
// 温度>26 开空调 ；湿度都是大于等于75默认开
export default function SmartRoomIllustration({ motion, humidity,luminance,temperature }: Props) {
  const isOccupied = motion > 0;
  const isDehumidifierOn = humidity < 75;
  const isLight = luminance ? luminance <= 100 : false; // Optional luminance check
  const isAirCon = temperature ? temperature >= 26 : false; // Optional temperature check
  console.log("motion is", motion);
  console.log("humidity is", humidity);

  return (
    <div className="w-full h-[300px] p-4 bg-white rounded-lg shadow flex items-center justify-center">
      <svg width="100%" height="100%" viewBox="0 0 500 250" xmlns="http://www.w3.org/2000/svg">
        {/* Conference table */}
        <rect x="150" y="80" width="200" height="80" fill="#c4a484" rx="8" />

        {/* Chairs (top row + bottom row) */}
        {Array.from({ length: 6 }).map((_, i) => (
          <rect key={i} x={100 + i * 50} y={60} width="30" height="15" fill="#444" rx="4" />
        ))}
        {Array.from({ length: 6 }).map((_, i) => (
          <rect key={i + 6} x={100 + i * 50} y={170} width="30" height="15" fill="#444" rx="4" />
        ))}

        {/* Light */}
        <circle cx="250" cy="30" r="12" fill={isOccupied && isLight? "#facc15" : "#ccc"} />
        <text x="240" y="20" fontSize="10" fill="#666">Light</text>

        {/* Air Conditioner */}
        <rect x="400" y="20" width="90" height="25" rx="4" fill={isOccupied && isAirCon? "#3b82f6" : "#9ca3af"} />
        <text x="405" y="38" fontSize="10" fill="white">Air Conditioner</text>

        {/* Airflow animation */}
        {isOccupied  && isAirCon && (
          <framerMotion.line
            x1="430"
            y1="45"
            x2="430"
            y2="65"
            stroke="#60a5fa"
            strokeWidth="2"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: [0, 1, 0], y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}

        {/* Dehumidifier */}
        <rect x="20" y="20" width="80" height="25" rx="4" fill={isDehumidifierOn ? "#2563eb" : "#9ca3af"} />
        <text x="25" y="38" fontSize="10" fill="white">Dehumidifier</text>

        {/* Dehumidifier animation */}
        {isDehumidifierOn && (
          <framerMotion.line
            x1="60"
            y1="45"
            x2="60"
            y2="65"
            stroke="#3b82f6"
            strokeWidth="2"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: [0, 1, 0], y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}

        {/* Status message */}
        <text x="20" y="230" fontSize="14" fill={isOccupied ? "#16a34a" : "#888"}>
          {isOccupied ? "Meeting is starting, devices are running" : "Meeting is over, devices are off"}
        </text>
      </svg>
    </div>
  );
}
