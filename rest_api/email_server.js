// email.server.js

const express = require("express");
const nodemailer = require("nodemailer");
const fetch = require("node-fetch");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const PORT = 4444;

let notified = false;
let meetingStart = null;

app.use(express.json());

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendNotificationEmail = () => {
  return new Promise((resolve, reject) => {
    transporter.sendMail(
      {
        from: `"Smart Room" <${process.env.EMAIL_USER}>`,
        to: "cidierlxy@gmail.com",
        subject: "📢 Meeting Reminder",
        text: "⚠️ Someone just entered the room. The meeting will start in 10 minutes!",
      },
      (error, info) => {
        if (error) {
          console.error("❌ Error sending email:", error);
          return reject(error);
        }
        console.log("✅ Email sent:", info.response);
        notified = true;
        resolve(true);
      }
    );
  });
};

app.post("/api/meeting", (req, res) => {
  const raw = req.body.startTime;
  const parsed = new Date(raw);
  if (isNaN(parsed)) {
    console.error("❌ Invalid meeting time:", raw);
    return res.status(400).send("Invalid date");
  }

  meetingStart = parsed;
  notified = false;
  console.log("✅ Meeting start time set to:", meetingStart);
  res.sendStatus(200);
});

app.get("/api/notification-status", (req, res) => {
  res.json({ notified });
});
//reset notification status
app.post("/api/notification-shown", (req, res) => {
  if (notified) {
    console.log("reset notification status");
    notified = false;
  }
  res.sendStatus(200);
});

setInterval(async () => {
  if (!meetingStart) return;

  const now = new Date();
  const timeDiff = meetingStart - now;
  const within10Min = timeDiff > 0 && timeDiff <= 10 * 60 * 1000;
  const within50MinPast = now - meetingStart < 50 * 60 * 1000;

  try {
    const res = await fetch("http://localhost:3000/api/plans");
    const plans = await res.json();
    const last = plans[plans.length - 1];

    const hasMotion = last.actions?.includes("turn_on_plug1");

    if (within10Min && hasMotion && !notified) {
      try {
        await sendNotificationEmail();
      } catch (e) {
        console.error("❌ Email failed:", e);
      }
    }

    if (!within50MinPast) {
      notified = true;
    }
  } catch (err) {
    console.error("❌ Error checking plans:", err);
  }
}, 5000);

app.listen(PORT, () => {
  console.log(`📡 Email server running on http://localhost:${PORT}`);
});
