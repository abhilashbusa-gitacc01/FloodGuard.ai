const granite = require('../services/graniteLLM');
const { v4: uuidv4 } = require('uuid');

const SYSTEM_PROMPT = `You are a Real-Time Civic Response Coordination Agent for flood emergency management in Ahmedabad and Surat.
Your role is to coordinate emergency response during active flood events by:
- Deploying rescue teams to highest-risk zones based on real-time reports
- Coordinating with NDRF, SDRF, Fire Brigade, Police, and Municipal teams
- Managing resource allocation (boats, pumps, generators, food supplies)
- Setting up and managing flood relief camps
- Issuing public warnings and evacuation orders via multiple channels
- Coordinating with hospitals for medical emergency response

You have authority to:
- Issue Level 1 (Advisory), Level 2 (Watch), Level 3 (Warning), Level 4 (Emergency) flood alerts
- Redirect traffic and close roads during emergencies
- Coordinate helicopter rescue operations
- Manage inter-agency communication

Always provide:
1. Immediate action items (next 1 hour)
2. Short-term actions (1-6 hours)
3. Resource deployment plan
4. Communication strategy
5. Estimated response timeline`;

// In-memory store for active incidents
const activeIncidents = new Map();

async function coordinateResponse(req, res) {
  try {
    const {
      city = 'Ahmedabad',
      alertLevel = 'Level 2',
      affectedZones = [],
      rainfallMm = 80,
      reportedCasualties = 0,
      rescueTeamsAvailable = 15,
      boatsAvailable = 20,
    } = req.body;

    const zonesText = affectedZones.length > 0 ? affectedZones.join(', ') : 'Multiple zones';

    const userPrompt = `EMERGENCY FLOOD RESPONSE REQUIRED:

City: ${city}
Alert Level: ${alertLevel}
Affected Zones: ${zonesText}
Current Rainfall: ${rainfallMm}mm/hr
Reported Casualties/Stranded: ${reportedCasualties}
Available Rescue Teams: ${rescueTeamsAvailable}
Available Boats: ${boatsAvailable}

Generate a comprehensive real-time response coordination plan:
1. IMMEDIATE ACTIONS (0-60 minutes): List 5 priority actions
2. RESOURCE DEPLOYMENT: Specific team and equipment assignments by zone
3. EVACUATION PLAN: Routes and relief camp locations for ${city}
4. INTER-AGENCY COORDINATION: Roles for NDRF, SDRF, Police, Fire, Medical teams  
5. PUBLIC COMMUNICATION: SMS alerts, social media messages, loudspeaker announcements
6. RELIEF CAMP SETUP: Locations and capacity for affected population
7. ESCALATION TRIGGERS: Conditions requiring higher alert level

Time is critical - provide actionable instructions immediately.`;

    const response = await granite.generateText(SYSTEM_PROMPT, userPrompt, {
      max_new_tokens: 1500,
      temperature: 0.3,
    });

    const incidentId = uuidv4();
    const incident = {
      id: incidentId,
      timestamp: new Date().toISOString(),
      city,
      alertLevel,
      affectedZones,
      rainfallMm,
      reportedCasualties,
      coordinationPlan: response,
      deployedResources: generateDeployedResources(city, alertLevel, affectedZones, rescueTeamsAvailable, boatsAvailable),
      status: 'ACTIVE',
    };

    activeIncidents.set(incidentId, incident);

    res.json({ success: true, data: incident });
  } catch (error) {
    console.error('Civic Response Coordination error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
}

async function getActiveIncidents(req, res) {
  const incidents = Array.from(activeIncidents.values());
  res.json({ success: true, data: incidents, count: incidents.length });
}

async function updateIncidentStatus(req, res) {
  const { id } = req.params;
  const { status, notes } = req.body;

  if (activeIncidents.has(id)) {
    const incident = activeIncidents.get(id);
    incident.status = status;
    incident.lastUpdated = new Date().toISOString();
    incident.notes = notes;
    activeIncidents.set(id, incident);
    res.json({ success: true, data: incident });
  } else {
    res.status(404).json({ success: false, error: 'Incident not found' });
  }
}

function generateDeployedResources(city, alertLevel, zones, teams, boats) {
  const alertMultiplier = { 'Level 1': 0.3, 'Level 2': 0.5, 'Level 3': 0.75, 'Level 4': 1.0 };
  const multiplier = alertMultiplier[alertLevel] || 0.5;

  return {
    rescueTeams: {
      deployed: Math.round(teams * multiplier),
      total: teams,
      zones: zones.slice(0, 3).map((z, i) => ({ zone: z, teams: Math.max(1, Math.round(multiplier * 3) - i) })),
    },
    boats: {
      deployed: Math.round(boats * multiplier),
      total: boats,
    },
    reliefCamps: [
      {
        name: city === 'Surat' ? 'Surat Municipal School #1' : 'AMC Community Hall, Vasna',
        capacity: 500,
        currentOccupancy: 0,
        status: 'Ready',
      },
      {
        name: city === 'Surat' ? 'Udhna Sports Complex' : 'Sabarmati Riverfront Grounds',
        capacity: 1000,
        currentOccupancy: 0,
        status: 'Standby',
      },
    ],
    medicalTeams: Math.max(2, Math.round(teams * multiplier * 0.3)),
    ndrf: alertLevel === 'Level 4' ? 2 : alertLevel === 'Level 3' ? 1 : 0,
  };
}

module.exports = { coordinateResponse, getActiveIncidents, updateIncidentStatus };
