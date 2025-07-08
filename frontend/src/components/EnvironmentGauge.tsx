import React from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";


interface Props {
  temperature: number;
  humidity: number;
}

export default function EnvironmentGauges({ temperature, humidity }: Props) {
  const tempColor =
    temperature > 30 ? "#ef4444" : temperature > 22 ? "#facc15" : "#34d399";

  const humColor =
    humidity > 70 ? "#60a5fa" : humidity > 40 ? "#10b981" : "#fde68a";

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start">
      {/* Temperature Gauge */}
      <div className="w-48 h-48 text-left">
        <h3 className="text-sm font-medium mb-2">🌡️ Temperature</h3>
        <CircularProgressbar
          value={temperature}
          maxValue={40}
          text={`${temperature.toFixed(1)}°C`}
          styles={buildStyles({
            pathColor: tempColor,
            textColor: "#1f2937",
            trailColor: "#e5e7eb",
          })}
        />
      </div>

      {/* Humidity Gauge */}
      <div className="w-48 h-48 text-left">
        <h3 className="text-sm font-medium mb-2">💧 Humidity</h3>
        <CircularProgressbar
          value={humidity}
          maxValue={100}
          text={`${humidity.toFixed(0)}%`}
          styles={buildStyles({
            pathColor: humColor,
            textColor: "#1f2937",
            trailColor: "#e5e7eb",
          })}
        />
      </div>
    </div>
  );
}
