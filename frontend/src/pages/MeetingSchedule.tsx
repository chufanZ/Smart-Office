import React, { useState } from "react";

export default function MeetingScheduler() {
  const [time, setTime] = useState("");

  const handleSchedule = async () => {
    console.log("📅 Trying to schedule meeting at:", time);
    // time = time.replace("T", ":").substring(0, 16).replace(":", " ");;
    localStorage.setItem("meetingTime", time.replace("T", ":").substring(0, 16).replace(":", " "));
    console.log("🗓️ Meeting time saved to localStorage:", JSON.stringify({ startTime: time.replace("T", ":").substring(0, 16).replace(":", " ") }));
    try {
      const res = 
      await fetch("/api/meeting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startTime: time.replace("T", ":").substring(0, 16).replace(":", " ") }),
      });

      if (res.ok) {
        alert("✅ Meeting time set!");
        console.log("✅ Meeting time set successfully:", res);
      } else {
        console.error("❌ Failed to set meeting time");
      }
    } catch (err) {
      console.error("❌ Error in fetch:", err);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-2">🗓️ Set Meeting Start Time</h2>
      <input
        type="datetime-local"
        value={time}
        onChange={(e) => setTime(e.target.value)}
        className="border p-2 mr-2"
      />
      <button
        onClick={handleSchedule}
        className="text-black px-4 py-2 border"
      >
        Set
      </button>
    </div>
  );
}
