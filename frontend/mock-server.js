// mock-server.js
import { Server } from "socket.io";
import { createServer } from "http";

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);
});

setInterval(() => {
  io.emit("sensor-data", {
    timestamp: new Date().toISOString(),
    temperature: (25 + Math.random() * 5).toFixed(1),
    humidity: 40 + Math.floor(Math.random() * 20),
    ultraviolet: Math.floor(Math.random() * 3),
    motion: Math.random() > 0.5 ? 1 : 0,
    light: Math.random() > 0.5 ? "on" : "off",
    ac: Math.random() > 0.5 ? 24 : null,
    luminance: Math.floor(Math.random() * 100),
  });
}, 3000);

httpServer.listen(3000, () => {
  console.log("✅ Mock WebSocket server running on http://localhost:3300");
});

