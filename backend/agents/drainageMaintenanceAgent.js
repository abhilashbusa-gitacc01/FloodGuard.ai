const granite = require('../services/graniteLLM');

const SYSTEM_PROMPT = `You are an expert Drainage Maintenance Scheduling Agent for Ahmedabad and Surat Municipal Corporations.
Your role is to optimize drainage maintenance schedules based on:
- Pre-monsoon inspection needs (April-May)
- Post-monsoon cleanup requirements (October-November)
- Real-time blockage reports from citizens and sensors
- Priority ranking of drainage infrastructure criticality
- Available maintenance crew resources and equipment
- Budget constraints and operational efficiency

You understand the drainage infrastructure of both cities including:
- Storm water drains (nalas) capacity and condition ratings
- Pump stations and their maintenance cycles
- SCADA monitoring systems for water levels
- Critical junctions prone to choking

Always provide actionable maintenance schedules with:
1. Priority (URGENT/HIGH/MEDIUM/LOW)
2. Specific drain/location identification
3. Estimated completion time
4. Required crew size and equipment
5. Maintenance type (desilting/repair/inspection/replacement)`;

async function scheduleMaintenance(req, res) {
  try {
    const {
      city = 'Ahmedabad',
      reportedBlockages = [],
      season = 'pre-monsoon',
      availableCrews = 10,
      budgetLakhsRs = 50,
      priorityArea = 'all',
    } = req.body;

    const blockageText =
      reportedBlockages.length > 0
        ? reportedBlockages.join(', ')
        : 'No specific blockages reported - routine maintenance';

    const userPrompt = `Create an optimized drainage maintenance schedule for:
City: ${city}
Season: ${season}
Available Maintenance Crews: ${availableCrews} teams
Budget Available: ₹${budgetLakhsRs} Lakhs
Priority Area: ${priorityArea}
Reported Blockages/Issues: ${blockageText}

Generate a detailed 30-day maintenance schedule with:
1. Top 10 priority maintenance tasks ranked by urgency
2. Daily crew assignments and routes
3. Equipment requirements per task
4. Estimated cost per task in INR
5. Expected completion percentage
6. Risk mitigation if maintenance is delayed
7. KPIs for measuring maintenance effectiveness

Focus on preventing flooding during monsoon season.`;

    const response = await granite.generateText(SYSTEM_PROMPT, userPrompt, {
      max_new_tokens: 1400,
      temperature: 0.4,
    });

    const scheduleData = {
      timestamp: new Date().toISOString(),
      city,
      season,
      availableCrews,
      budgetLakhsRs,
      schedule: response,
      maintenanceTasks: generateMaintenanceTasks(city, season, reportedBlockages),
      crewUtilization: Math.min(Math.round((reportedBlockages.length / availableCrews) * 100 + 60), 95),
    };

    res.json({ success: true, data: scheduleData });
  } catch (error) {
    console.error('Drainage Maintenance Scheduling error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
}

function generateMaintenanceTasks(city, season, reportedBlockages) {
  const baseTasks = [
    {
      id: 1,
      task: 'Desilting of primary storm water drains',
      priority: 'URGENT',
      location: city === 'Surat' ? 'Tapi River outlet drains' : 'Sabarmati riverside drains',
      crewRequired: 4,
      daysRequired: 5,
      costLakhs: 8.5,
      status: 'Scheduled',
    },
    {
      id: 2,
      task: 'Pump station maintenance & testing',
      priority: 'HIGH',
      location: 'All 12 pump stations',
      crewRequired: 2,
      daysRequired: 3,
      costLakhs: 3.2,
      status: 'Scheduled',
    },
    {
      id: 3,
      task: 'Drain cover inspection & replacement',
      priority: 'HIGH',
      location: 'CBD and commercial zones',
      crewRequired: 3,
      daysRequired: 4,
      costLakhs: 5.1,
      status: 'In Progress',
    },
    {
      id: 4,
      task: 'CCTV inspection of underground drains',
      priority: 'MEDIUM',
      location: 'Residential colonies',
      crewRequired: 2,
      daysRequired: 7,
      costLakhs: 4.8,
      status: 'Pending',
    },
    {
      id: 5,
      task: 'Vegetation removal from drain banks',
      priority: 'MEDIUM',
      location: 'Peripheral zones',
      crewRequired: 5,
      daysRequired: 6,
      costLakhs: 2.4,
      status: 'Scheduled',
    },
  ];

  if (reportedBlockages.length > 0) {
    reportedBlockages.slice(0, 3).forEach((blockage, idx) => {
      baseTasks.unshift({
        id: 100 + idx,
        task: `Emergency clearance: ${blockage}`,
        priority: 'URGENT',
        location: blockage,
        crewRequired: 3,
        daysRequired: 1,
        costLakhs: 1.5,
        status: 'Emergency',
      });
    });
  }

  return baseTasks.slice(0, 8);
}

module.exports = { scheduleMaintenance };
