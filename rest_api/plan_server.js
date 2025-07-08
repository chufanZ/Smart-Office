const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
const uri = 'mongodb+srv://chufanzhang1995:2025@cluster.ejbbx7s.mongodb.net/smartOffice?retryWrites=true&w=majority&appName=Cluster';
mongoose.connect(uri)
    .then(() => {
        console.log("✅ MongoDB connected");

        const planSchema = new mongoose.Schema({
            timestamp: String,
            actions: [String]
        }, { collection: 'plan' });

        const Plan = mongoose.model('Plan', planSchema);

        const sensorDataSchema = new mongoose.Schema({
            timestamp: String,
            node: Number,
            temperature: Number,
            motion: Number,
            humidity: Number,
            luminance: Number,
            ultraviolet: Number,
            battery: Number
        }, { collection: 'sensorData' });

        const SensorData = mongoose.model('SensorData', sensorDataSchema);

        const validFields = [
            'timestamp',
            'node',
            'temperature',
            'motion',
            'humidity',
            'luminance',
            'ultraviolet',
            'battery'
        ];

        app.get('/api/plans', async (req, res) => {
            const plans = await Plan.find();
            res.json(plans);
        });

        app.get('/api/plans/by-timestamp', async (req, res) => {
            const { value } = req.query;
            try {
                const plans = await Plan.find({ timestamp: Number(req.query.value) });
                res.json(plans);
            } catch (err) {
                res.status(500).json({ error: 'Query failed' });
            }
        });

        app.get('/api/plans/by-action', async (req, res) => {
            const { value } = req.query;
            try {
                const plans = await Plan.find({ actions: Number(req.query.value) });
                res.json(plans);
            } catch (err) {
                res.status(500).json({ error: 'Query failed' });
            }
        });

        app.get('/api/sensordata', async (req, res) => {
            const sensordata = await SensorData.find();
            res.json(sensordata);
        });

        app.get('/api/sensordata/by/:field', async (req, res) => {
            const { field } = req.params;
            const { value } = req.query;

            if (!validFields.includes(field)) {
                return res.status(400).json({ error: `Invalid field: ${field}` });
            }

            const query = {};
            query[field] = field === 'timestamp' ? value : Number(value); // 字符串留字符串，其余转数字

            try {
                const sensordata = await SensorData.find(query);
                res.json(sensordata);
            } catch (err) {
                res.status(500).json({ error: 'Query failed', detail: err.message });
            }
        });

        app.listen(port, () => {
            console.log(`🚀 Server is running at http://localhost:${port}`);
        });
    })
    .catch(err => {
        console.error("❌ Connection failed:", err);
    });