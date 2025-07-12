import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import React from 'react';

interface SensorData {
  timestamp: string;
  temperature: number;
  luminance: number;
  ultraviolet: number;
  humidity: number;
  motion: number;
}

export default function SensorLineChart({ data }: { data: SensorData[] }) {
  const formatTime = (iso: string) => {
    const date = new Date(iso);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="flex gap-4 w-full">
      {/* Temperature Chart */}
      <div className="min-w-[300px] flex-1 bg-white rounded-xl shadow p-4">
        <h2 className="text-md font-semibold mb-2">🌡️ Temperature (°C)</h2>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="timestamp" tickFormatter={formatTime} />
            <YAxis width={30} />
            <Tooltip labelFormatter={formatTime} />
            <Legend />
            <Line type="monotone" dataKey="temperature" stroke="#f97316" name="Temperature" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Humidity Chart */}
      <div className="min-w-[300px] flex-1 bg-white rounded-xl shadow p-4">
        <h2 className="text-md font-semibold mb-2">💧 Humidity (%)</h2>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="timestamp" tickFormatter={formatTime} />
            <YAxis width={30} />
            <Tooltip labelFormatter={formatTime} />
            <Legend />
            <Line type="monotone" dataKey="humidity" stroke="#3b82f6" name="Humidity" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Motion Chart */}
      <div className="min-w-[300px] flex-1 bg-white rounded-xl shadow p-4">
        <h2 className="text-md font-semibold mb-2">🧍 Motion</h2>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="timestamp" tickFormatter={formatTime} />
            <YAxis domain={[0, 1]} width={30} />
            <Tooltip labelFormatter={formatTime} />
            <Legend />
            <Line type="monotone" dataKey="motion" stroke="#22c55e" name="Motion" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
