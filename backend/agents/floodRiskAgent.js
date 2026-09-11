const granite = require('../services/graniteLLM');

const SYSTEM_PROMPT = `You are an expert Flood Risk Prediction Agent for Ahmedabad and Surat cities in India.
Your role is to analyze rainfall data, topography, drainage capacity, and historical flood data to predict flood-prone zones.
You have deep knowledge of:
- Sabarmati River basin and Tapi River basin flood patterns
- Low-lying areas and historical flood zones in both cities
- Monsoon patterns (June-September) and their intensity levels
- Urban drainage capacity and infrastructure vulnerabilities
- Real-time risk assessment and zone classification

Always provide structured, actionable flood risk assessments with:
1. Risk level (CRITICAL/HIGH/MEDIUM/LOW)
2. Affected zones with specific area names
3. Expected water accumulation levels
4. Time to peak flood risk
5. Recommended evacuation or precautionary measures`;

async function predictFloodRisk(req, res) {
  try {
    const {
      rainfallMm = 50,
      city = 'Ahmedabad',
      duration = '3 hours',
      currentWaterLevel = 'normal',
      drainageStatus = 'operational',
      windSpeed = 15,
      temperature = 28,
    } = req.body;

    const userPrompt = `Analyze flood risk for the following conditions:
City: ${city}
Rainfall: ${rainfallMm}mm in ${duration}
Current Water Level: ${currentWaterLevel}
Drainage System Status: ${drainageStatus}
Wind Speed: ${windSpeed} km/h
Temperature: ${temperature}°C

Provide a detailed flood risk prediction including:
1. Overall risk level (CRITICAL/HIGH/MEDIUM/LOW)
2. Top 5 most vulnerable zones with risk percentages
3. Expected flooding timeline
4. Water accumulation estimates
5. Immediate action recommendations
6. Affected population estimate

Format the response as a structured JSON-compatible analysis.`;

    const response = await granite.generateText(SYSTEM_PROMPT, userPrompt, {
      max_new_tokens: 1200,
      temperature: 0.5,
    });

    // Parse and structure the response
    const riskData = {
      timestamp: new Date().toISOString(),
      city,
      rainfallMm,
      duration,
      analysis: response,
      riskLevel: extractRiskLevel(response),
      vulnerableZones: extractZones(city, rainfallMm),
      recommendation: extractRecommendation(response),
    };

    res.json({ success: true, data: riskData });
  } catch (error) {
    console.error('Flood Risk Prediction error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
}

function extractRiskLevel(text) {
  if (text.includes('CRITICAL')) return 'CRITICAL';
  if (text.includes('HIGH')) return 'HIGH';
  if (text.includes('MEDIUM')) return 'MEDIUM';
  return 'LOW';
}

function extractZones(city, rainfall) {
  const ahmedabadZones = [
    { zone: 'Maninagar', riskScore: 85, population: 45000 },
    { zone: 'Vatva Industrial Area', riskScore: 78, population: 12000 },
    { zone: 'Juhapura', riskScore: 72, population: 38000 },
    { zone: 'Nikol', riskScore: 68, population: 55000 },
    { zone: 'Odhav', riskScore: 65, population: 29000 },
  ];
  const suratZones = [
    { zone: 'Katargam', riskScore: 88, population: 62000 },
    { zone: 'Limbayat', riskScore: 82, population: 48000 },
    { zone: 'Udhna', riskScore: 76, population: 35000 },
    { zone: 'Adajan', riskScore: 70, population: 41000 },
    { zone: 'Varachha', riskScore: 67, population: 53000 },
  ];

  const zones = city === 'Surat' ? suratZones : ahmedabadZones;
  const multiplier = Math.min(rainfall / 50, 2.0);
  return zones.map((z) => ({
    ...z,
    riskScore: Math.min(Math.round(z.riskScore * multiplier), 99),
  }));
}

function extractRecommendation(text) {
  const lines = text.split('\n').filter((l) => l.trim().length > 0);
  const recLine = lines.find(
    (l) => l.toLowerCase().includes('recommend') || l.toLowerCase().includes('action')
  );
  return recLine || 'Monitor drainage systems and prepare emergency response teams.';
}

module.exports = { predictFloodRisk };
