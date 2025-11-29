const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const { predictNextFlight, getHistory } = require('./predictor');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// API Routes
app.post('/api/predict', (req, res) => {
    try {
        const values = req.body.values || [];
        const prediction = predictNextFlight(values);
        res.json({ success: true, prediction, confidence: prediction.confidence });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

app.get('/api/history', (req, res) => {
    res.json(getHistory());
});

app.post('/api/add-result', (req, res) => {
    const { result } = req.body;
    if (result && result > 0) {
        require('./predictor').addResult(result);
        res.json({ success: true });
    } else {
        res.status(400).json({ success: false });
    }
});

// Serve main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Aviator Predictor running on http://localhost:${PORT}`);
    console.log(`📱 Mobile: http://localhost:${PORT}`);
});
