const granite = require('../services/graniteLLM');
const { citizenReports } = require('./citizenReportingAgent');

const SYSTEM_PROMPT = `You are an Urban Resilience Dashboard Agent for Ahmedabad and Surat Smart City Mission.
Your role is to:
- Aggregate data from all monitoring systems into a unified situational awareness view
- Generate executive summaries for municipal commissioners and disaster management teams
- Track key performance indicators for flood response effectiveness
- Identify trends and patterns in flooding events over time
- Provide data-driven recommendations for long-term urban resilience improvements
- Monitor compliance with NDMA (National Disaster Management Authority) guidelines

You analyze data from:
- Weather stations and IMD (India Meteorological Department) feeds
- River gauge stations (Sabarmati, Tapi)
- SCADA drain monitoring systems
- Citizen reports and social media
- Historical flood databases (2005 Surat floods, 2017 Ahmedabad floods)

Generate clear, decision-ready intelligence for civic leaders.`;

async function getDashboardInsights(req, res) {
  try {
    const {
      city = 'both',
      timeframe = '24 hours',
      includeForecasting = true,
    } = req.query;

    // Aggregate mock real-time metrics
    const metrics = generateCurrentMetrics(city);

    const userPrompt = `Generate a comprehensive Urban Resilience Dashboard Report:

Timeframe: Last ${timeframe}
Cities: ${city === 'both' ? 'Ahmedabad and Surat' : city}
Current Metrics:
- Total Citizen Reports: ${metrics.totalReports}
- Active Flood Incidents: ${metrics.activeIncidents}
- Drainage System Health: ${metrics.drainageHealth}%
- Pump Stations Operational: ${metrics.pumpStations}/12
- Average Rainfall Today: ${metrics.avgRainfall}mm
- Evacuation Centers Active: ${metrics.evacuationCenters}
- People Evacuated: ${metrics.peopleEvacuated}
- Roads Closed: ${metrics.roadsClosed}
- Rescue Operations: ${metrics.rescueOps} completed
- Infrastructure Alerts: ${metrics.infraAlerts}

Provide:
1. EXECUTIVE SUMMARY (3-4 sentences for municipal commissioner)
2. REAL-TIME STATUS INDICATORS with traffic light ratings (Green/Yellow/Red)
3. TOP 3 PRIORITY ACTIONS needed in next 4 hours
4. RESOURCE UTILIZATION ANALYSIS
5. TREND ANALYSIS: Is situation improving or deteriorating?
6. FORECAST: Expected conditions for next 12 hours
7. RECOMMENDATIONS for long-term resilience improvement`;

    const response = await granite.generateText(SYSTEM_PROMPT, userPrompt, {
      max_new_tokens: 1400,
      temperature: 0.4,
    });

    const dashboardData = {
      timestamp: new Date().toISOString(),
      city,
      metrics,
      insights: response,
      floodMapData: generateFloodMapData(city),
      rainfallTrend: generateRainfallTrend(),
      responseEfficiency: Math.round(70 + Math.random() * 20),
    };

    res.json({ success: true, data: dashboardData });
  } catch (error) {
    console.error('Dashboard Insights error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
}

function generateCurrentMetrics(city) {
  const reports = citizenReports.length;
  return {
    totalReports: reports + Math.floor(Math.random() * 20) + 5,
    activeIncidents: Math.floor(Math.random() * 8) + 1,
    drainageHealth: Math.floor(Math.random() * 20) + 70,
    pumpStations: Math.floor(Math.random() * 3) + 9,
    avgRainfall: Math.floor(Math.random() * 60) + 20,
    evacuationCenters: Math.floor(Math.random() * 4) + 1,
    peopleEvacuated: Math.floor(Math.random() * 500) + 50,
    roadsClosed: Math.floor(Math.random() * 12) + 2,
    rescueOps: Math.floor(Math.random() * 30) + 10,
    infraAlerts: Math.floor(Math.random() * 6) + 1,
    ahmedabadStatus: ['GREEN', 'YELLOW', 'ORANGE', 'RED'][Math.floor(Math.random() * 4)],
    suratStatus: ['GREEN', 'YELLOW', 'ORANGE', 'RED'][Math.floor(Math.random() * 4)],
  };
}

function generateFloodMapData(city) {
  const zones = {
    Ahmedabad: [
      { zone: 'Maninagar', lat: 22.9868, lng: 72.6046, risk: 'HIGH', waterDepth: 45 },
      { zone: 'Vatva', lat: 22.9646, lng: 72.6394, risk: 'MEDIUM', waterDepth: 25 },
      { zone: 'Juhapura', lat: 23.0030, lng: 72.5310, risk: 'HIGH', waterDepth: 60 },
      { zone: 'Nikol', lat: 23.0415, lng: 72.6418, risk: 'LOW', waterDepth: 10 },
      { zone: 'Odhav', lat: 22.9976, lng: 72.6523, risk: 'MEDIUM', waterDepth: 30 },
    ],
    Surat: [
      { zone: 'Katargam', lat: 21.2168, lng: 72.8472, risk: 'CRITICAL', waterDepth: 90 },
      { zone: 'Limbayat', lat: 21.1773, lng: 72.8605, risk: 'HIGH', waterDepth: 65 },
      { zone: 'Udhna', lat: 21.1718, lng: 72.8449, risk: 'HIGH', waterDepth: 55 },
      { zone: 'Adajan', lat: 21.2073, lng: 72.8028, risk: 'MEDIUM', waterDepth: 35 },
      { zone: 'Varachha', lat: 21.2198, lng: 72.8739, risk: 'MEDIUM', waterDepth: 28 },
    ],
  };

  if (city === 'both') return { ...zones };
  return zones[city] || zones.Ahmedabad;
}

function generateRainfallTrend() {
  const hours = [];
  for (let i = 23; i >= 0; i--) {
    hours.push({
      hour: `${i}:00`,
      ahmedabad: Math.max(0, Math.floor(Math.random() * 40) + (i < 6 ? 30 : 5)),
      surat: Math.max(0, Math.floor(Math.random() * 50) + (i < 8 ? 35 : 8)),
    });
  }
  return hours.reverse();
}

module.exports = { getDashboardInsights };
