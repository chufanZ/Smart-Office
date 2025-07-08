import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

interface SensorData {
  timestamp: string;
  temperature: number;
  luminance: number;
  ultraviolet: number;
  humidity: number;
  motion: number;
}

const socket = io("http://localhost:3000");

export default function SensorLineChart() {
  const [data, setData] = useState<SensorData[]>([]);

  useEffect(() => {
    socket.on("sensor-data", (payload) => {
      const newData: SensorData = {
        timestamp: new Date().toLocaleTimeString(),
        temperature: payload.temperature,
        luminance: payload.luminance,
        ultraviolet: payload.ultraviolet,
        motion: payload.motion,
        humidity: payload.humidity,
      };
      setData(prev => [...prev.slice(-29), newData]);
    });

    return () => {
      socket.off("sensor-data");
    };
  }, []);

  return (
    <div className="flex gap-4 w-full">
      {/* Temperature Chart */}
      <div className="min-w-[300px] flex-1 bg-white rounded-xl shadow p-4 ">
        <h2 className="text-md font-semibold mb-2">🌡️ Temperature (°C)</h2>
        <ResponsiveContainer  width="100%" height={250}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="timestamp" />
            <YAxis width={20} />
            <Tooltip />
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
            <XAxis dataKey="timestamp" />
            <YAxis width={28} />
            <Tooltip />
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
            <XAxis dataKey="timestamp" />
            <YAxis width={35} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="motion" stroke="#22c55e" name="Motion" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// import {
//   LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
// } from 'recharts';
// import React, { useEffect, useState } from 'react';
// import io from 'socket.io-client';

// interface SensorData {
//   timestamp: string;
//   temperature: number;
//   luminance: number;
//   ultraviolet: number;
//   humidity: number;
//   motion: number;
// }

// const socket = io("http://localhost:3000");

// export default function SensorLineChart() {
//   const [data, setData] = useState<SensorData[]>([]);

//   useEffect(() => {
//     socket.on("sensor-data", (payload) => {
//       console.log("Received sen2sor data:", payload.temperature);
//       const newData: SensorData = {
//         timestamp: new Date().toLocaleTimeString(), // 或用 payload.timestamp
//         temperature: payload.temperature,
//         luminance: payload.luminance,
//         ultraviolet: payload.ultraviolet,
//         motion: payload.motion,
//         humidity: payload.humidity,

//       };
//       setData(prev => [...prev.slice(-29), newData]); // 保留30条
//     });

//     return () => {
//       socket.off("sensor-data");
//     };
//   }, []);

//   return (
//     <div className="w-full h-[400px] p-4 bg-white rounded-xl shadow">
//       <h2 className="text-lg font-bold mb-2">Historical Sensor Data</h2>


//       <ResponsiveContainer width="100%" height="90%">
//         <LineChart data={data}>
//           <CartesianGrid strokeDasharray="3 3" />
//           <XAxis dataKey="timestamp" />
//           <YAxis />
//           <Tooltip />
//           <Legend />
//           <Line type="monotone" dataKey="ultraviolet" stroke="#22c55e" name="motion" />
//         </LineChart>
//       </ResponsiveContainer>

//         <ResponsiveContainer width="100%" height="90%">
//         <LineChart data={data}>
//           <CartesianGrid strokeDasharray="3 3" />
//           <XAxis dataKey="timestamp" />
//           <YAxis />
//           <Tooltip />
//           <Legend />
//           <Line type="monotone" dataKey="temperature" stroke="#f97316" name="Temperature" />
//           {/* <Line type="monotone" dataKey="luminance" stroke="#3b82f6" name="亮度" /> */}
//           {/* <Line type="monotone" dataKey="ultraviolet" stroke="#22c55e" name="紫外线" /> */}
//         </LineChart>
//       </ResponsiveContainer>

//         <ResponsiveContainer width="100%" height="90%">
//         <LineChart data={data}>
//           <CartesianGrid strokeDasharray="3 3" />
//           <XAxis dataKey="timestamp" />
//           <YAxis />
//           <Tooltip />
//           <Legend />
//           {/* <Line type="monotone" dataKey="temperature" stroke="#f97316" name="温度" /> */}
//           <Line type="monotone" dataKey="humidity" stroke="#3b82f6" name="humidity" />
//           {/* <Line type="monotone" dataKey="ultraviolet" stroke="#22c55e" name="紫外线" /> */}
//         </LineChart>
//       </ResponsiveContainer>
//     </div>
//   );
// }
