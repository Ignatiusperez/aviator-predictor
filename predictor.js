class AviatorPredictor {
    constructor() {
        this.history = JSON.parse(localStorage.getItem('aviatorHistory') || '[]');
    }

    addResult(result) {
        this.history.push(result);
        if (this.history.length > 100) this.history.shift();
        localStorage.setItem('aviatorHistory', JSON.stringify(this.history));
    }

    getHistory() {
        return this.history.slice(-20);
    }

    predictNextFlight(values) {
        const allData = [...values, ...this.history.slice(-10)];
        
        if (allData.length === 0) {
            return { value: 2.0, confidence: 0.5 };
        }

        // Statistical analysis
        const avg = allData.reduce((a, b) => a + b, 0) / allData.length;
        const recentAvg = allData.slice(-5).reduce((a, b) => a + b, 0) / 5;
        const stdDev = Math.sqrt(allData.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / allData.length);
        
        // Pattern detection
        const lowStreak = allData.slice(-3).every(v => v < 2.0);
        const highStreak = allData.slice(-3).every(v => v > 3.0);
        
        let basePrediction = recentAvg;
        if (lowStreak) basePrediction *= 1.4;
        if (highStreak) basePrediction *= 0.7;
        
        // Add smart variation
        const variation = (Math.random() - 0.5) * stdDev * 0.8;
        const prediction = Math.max(1.01, basePrediction + variation);
        
        const confidence = Math.min(0.95, 0.6 + (stdDev / avg) * 0.2);
        
        return {
            value: Math.round(prediction * 100) / 100,
            confidence: Math.round(confidence * 100) / 100
        };
    }
}

const predictor = new AviatorPredictor();
module.exports = {
    predictNextFlight: (values) => predictor.predictNextFlight(values),
    getHistory: () => predictor.getHistory(),
    addResult: (result) => predictor.addResult(result)
};
