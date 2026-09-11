const granite = require('../services/graniteLLM');
const { v4: uuidv4 } = require('uuid');

const SYSTEM_PROMPT = `You are a Citizen Flood Reporting Agent for Ahmedabad and Surat Smart City initiatives.
Your role is to:
- Receive and validate citizen flood reports via multiple channels
- Classify report severity and authenticity
- Extract actionable location and situation information
- Prioritize reports for emergency response teams
- Provide immediate safety guidance to citizens
- Aggregate crowd-sourced data to build real-time flood map

You support multiple languages (English, Gujarati, Hindi) and assist citizens who may be in distress.

Always respond with:
1. Acknowledgment of the report
2. Immediate safety instructions
3. Severity classification
4. Next steps for the citizen
5. Escalation to emergency services if needed`;

// In-memory store for citizen reports
const citizenReports = [];

async function submitReport(req, res) {
  try {
    const {
      city = 'Ahmedabad',
      location,
      description,
      waterLevel = 'ankle',
      peopleStranded = 0,
      reporterPhone = '',
      latitude = null,
      longitude = null,
      imageUrl = null,
    } = req.body;

    if (!location || !description) {
      return res.status(400).json({ success: false, error: 'Location and description are required' });
    }

    const userPrompt = `Process this citizen flood report:

City: ${city}
Location: ${location}
Situation: ${description}
Water Level: ${waterLevel}
People Stranded/At Risk: ${peopleStranded}
GPS Coordinates: ${latitude ? `${latitude}, ${longitude}` : 'Not provided'}

Provide:
1. SEVERITY LEVEL (Emergency/High/Medium/Low)
2. Immediate safety instructions for the citizen
3. Whether emergency dispatch is needed (Yes/No + reason)
4. Additional information needed
5. Estimated response time
6. Public safety message for this area

Keep the response clear, calm, and actionable.`;

    const aiResponse = await granite.generateText(SYSTEM_PROMPT, userPrompt, {
      max_new_tokens: 800,
      temperature: 0.4,
    });

    const reportId = uuidv4().slice(0, 8).toUpperCase();
    const severityLevel = extractSeverity(aiResponse, waterLevel, peopleStranded);

    const report = {
      id: reportId,
      timestamp: new Date().toISOString(),
      city,
      location,
      description,
      waterLevel,
      peopleStranded,
      reporterPhone: reporterPhone ? reporterPhone.replace(/\d{6}$/, '******') : 'Anonymous',
      latitude,
      longitude,
      imageUrl,
      severityLevel,
      aiResponse,
      status: 'Received',
      dispatchRequired: severityLevel === 'Emergency' || peopleStranded > 0,
    };

    citizenReports.unshift(report);
    if (citizenReports.length > 100) citizenReports.pop();

    res.json({
      success: true,
      data: {
        reportId,
        severityLevel,
        message: `Your report #${reportId} has been received and is being processed.`,
        immediateGuidance: aiResponse,
        dispatchRequired: report.dispatchRequired,
        estimatedResponse: severityLevel === 'Emergency' ? '15-30 minutes' : '1-3 hours',
      },
    });
  } catch (error) {
    console.error('Citizen Flood Report error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
}

async function getReports(req, res) {
  const { city, severity, limit = 20 } = req.query;
  let filtered = [...citizenReports];

  if (city) filtered = filtered.filter((r) => r.city.toLowerCase() === city.toLowerCase());
  if (severity) filtered = filtered.filter((r) => r.severityLevel === severity);

  res.json({ success: true, data: filtered.slice(0, parseInt(limit)), total: filtered.length });
}

function extractSeverity(text, waterLevel, stranded) {
  if (stranded > 5 || waterLevel === 'chest' || waterLevel === 'neck' || text.includes('Emergency')) return 'Emergency';
  if (stranded > 0 || waterLevel === 'waist' || text.includes('High')) return 'High';
  if (waterLevel === 'knee' || text.includes('Medium')) return 'Medium';
  return 'Low';
}

module.exports = { submitReport, getReports, citizenReports };
