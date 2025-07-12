const mongoose = require("mongoose");

const meetingSchema = new mongoose.Schema({
  startTime: String, // e.g. "2025-07-10T15:50"
  notified: { type: Boolean, default: false }
});

module.exports = mongoose.model("Meeting", meetingSchema);
