import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState } from 'react'
import SmartRoomStatus from './pages/SmartRoomStatus'
import MeetingSchedule from "./pages/MeetingSchedule";
import './App.css'
import './index.css'
// import SensorLineChart from './components/SensorLineChart'

function App() {
  
  
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 p-4">
        <Routes>
          <Route path="/" element={<Navigate to="/smartroom" />} />
          <Route path="/smartroom" element={<SmartRoomStatus />} />
          <Route path="/schedule" element={<MeetingSchedule />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
