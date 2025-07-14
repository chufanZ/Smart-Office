const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const fetch = require("node-fetch");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const PORT = 4444;

let notified = false;
let meetingStart = null;

app.use(express.json());
app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST"],
}));

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
  // send or not?
  res.json({ notified });
});

app.post("/api/notification-shown", (req, res) => {
  if (notified) {
    console.log("🔁 Resetting notification status");
    notified = false;
  }
  res.sendStatus(200);
});

function findLatestPlanWithAction(plans, actionName) {
  for (let i = plans.length - 1; i >= 0; i--) {
    if (plans[i]?.actions?.includes(actionName)) {
      return plans[i];
    }
  }
  return null;
}
setInterval(async () => {
  if (!meetingStart) return;


  try {
    const planRes = await fetch("http://localhost:3000/api/plans");
    const plans = await planRes.json();

    const sensorRes = await fetch("http://localhost:3000/api/sensordata");
    const sensorData = await sensorRes.json();

    const latestPlan = findLatestPlanWithAction(plans, "send-notification");

    if (!latestPlan) return;

    const matchingSensor = sensorData.find(
      (s) => s.timestamp.slice(0, 19) === latestPlan.timestamp.slice(0, 19)
    );
  
  //const sensorTimeStr = matchingSensor?.timestamp; // e.g. "2025-07-14 13:45:34"
  const meetingDate = new Date(meetingStart).getTime(); // e.g. 2025-07-14T13:47:00.000Z
 const sensorDate = new Date(matchingSensor.timestamp.replace(" ", "T") + "Z").getTime();
 
  const timeDiff = meetingDate - sensorDate; 
  const within10Min = timeDiff > 0 && timeDiff <= 10 * 60 * 1000;
    console.log("transfer to",meetingDate," ",within10Min)
    console.log("matchingSensor", sensorDate)
  //  const within50MinPast = now - meetingStart < 50 * 60 * 1000;



    const hasMotion = matchingSensor?.motion === 1;
  
    console.log("sensorData",matchingSensor)
    console.log("⏰ Meeting:", meetingStart);
    // console.log("📅 Sensor time:", sensorTime);
   
    
    console.log("🔍 Conditions:", { within10Min, hasMotion, notified });
    if (within10Min && hasMotion && !notified) {
        notified = true; 
      console.log("📨 Sending notification email...");
      await sendNotificationEmail();
    }

    // if (!within50MinPast) {
    //   notified = true;
    // }
  } catch (err) {
    console.error("❌ Error checking plans/sensor:", err);
  }
}, 5000);


app.listen(PORT, () => {
  console.log(`📡 Email server running on http://localhost:${PORT}`);
});
