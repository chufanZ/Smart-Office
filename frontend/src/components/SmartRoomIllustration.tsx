import React from "react";
import { motion as framerMotion } from "framer-motion";

interface Props {
  plug1: boolean; // Light
  plug2: boolean; // Air Conditioner
  plug3: boolean; // Dehumidifier
  hasNotification: boolean;
}

export default function SmartRoomIllustration({
  plug1,
  plug2,
  plug3,
  hasNotification,
}: Props) {
  return (
    <div className="w-full h-[300px] p-4 bg-white rounded-lg shadow flex items-center justify-center">
      <svg width="100%" height="100%" viewBox="0 0 500 250">
        <rect x="150" y="80" width="200" height="80" fill="#c4a484" rx="8" />
        {Array.from({ length: 6 }).map((_, i) => (
          <rect key={i} x={100 + i * 50} y={60} width="30" height="15" fill="#444" rx="4" />
        ))}
        {Array.from({ length: 6 }).map((_, i) => (
          <rect key={i + 6} x={100 + i * 50} y={170} width="30" height="15" fill="#444" rx="4" />
        ))}

        <circle cx="250" cy="30" r="12" fill={plug1 ? "#facc15" : "#ccc"} />
        <text x="240" y="20" fontSize="10" fill="#666">Light</text>

        <rect x="400" y="20" width="90" height="25" rx="4" fill={plug2 ? "#3b82f6" : "#9ca3af"} />
        <text x="405" y="38" fontSize="10" fill="white">Air Conditioner</text>
        {plug2 && (
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

        <rect x="20" y="20" width="80" height="25" rx="4" fill={plug3 ? "#2563eb" : "#9ca3af"} />
        <text x="25" y="38" fontSize="10" fill="white">Dehumidifier</text>
        {plug3 && (
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

        {hasNotification && (
          <text x="20" y="230" fontSize="14" fill="#16a34a">
            📧 Email notification sent, meeting will start!
          </text>
        )}
      </svg>
    </div>
  );
}
