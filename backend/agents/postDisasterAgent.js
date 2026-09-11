const granite = require('../services/graniteLLM');
const { v4: uuidv4 } = require('uuid');

const SYSTEM_PROMPT = `You are a Post-Disaster Damage Assessment Agent for flood recovery operations in Ahmedabad and Surat.
Your role is to:
- Systematically assess flood damage to property, infrastructure, and livelihoods
- Calculate economic losses and compensation requirements
- Prioritize reconstruction and rehabilitation activities
- Generate detailed damage reports for government insurance and relief schemes
- Identify structural vulnerabilities revealed by the flood event
- Recommend flood-proofing measures for future resilience

You follow NDMA (National Disaster Management Authority) guidelines and:
- PM Fasal Bima Yojana for agricultural losses
- State Disaster Response Fund (SDRF) guidelines
- MGNREGS for reconstruction employment
- Smart City Mission restoration protocols

Provide comprehensive, fact-based assessments with actionable recovery roadmaps.`;

const assessments = [];

async function assessDamage(req, res) {
  try {
    const {
      city = 'Ahmedabad',
      affectedArea,
      floodDurationHours = 24,
      peakWaterDepthCm = 60,
      affectedHouseholds = 100,
      affectedBusinesses = 20,
      infrastructureDamage = [],
      reportedByOfficer = 'Field Officer',
    } = req.body;

    if (!affectedArea) {
      return res.status(400).json({ success: false, error: 'Affected area is required' });
    }

    const infraText = infrastructureDamage.length > 0
      ? infrastructureDamage.join(', ')
      : 'Roads, drainage systems, electrical poles';

    const userPrompt = `Conduct comprehensive Post-Flood Damage Assessment:

City: ${city}
Affected Area/Zone: ${affectedArea}
Flood Duration: ${floodDurationHours} hours
Peak Water Depth: ${peakWaterDepthCm} cm
Affected Households: ${affectedHouseholds}
Affected Businesses: ${affectedBusinesses}
Infrastructure Damaged: ${infraText}
Assessment Officer: ${reportedByOfficer}

Generate a detailed damage assessment report:
1. DAMAGE SUMMARY TABLE:
   - Residential property damage (estimated ₹ value)
   - Commercial property damage (estimated ₹ value)
   - Infrastructure damage (estimated ₹ value)
   - Agricultural/livelihood loss (estimated ₹ value)
   - Total estimated damage

2. IMMEDIATE RELIEF REQUIREMENTS:
   - Temporary shelter needs
   - Food & water requirements
   - Medical supplies needed
   - Financial assistance per household (SDRF norms)

3. RECONSTRUCTION PRIORITY LIST (Top 10 items):
   - Infrastructure to restore first
   - Estimated timeline
   - Estimated cost

4. ROOT CAUSE ANALYSIS:
   - Why did this area flood?
   - What drainage failures contributed?

5. FLOOD-PROOFING RECOMMENDATIONS:
   - Structural interventions
   - Green infrastructure solutions
   - Policy recommendations

6. COMPENSATION ELIGIBILITY:
   - Number eligible for SDRF compensation
   - Estimated total compensation amount`;

    const response = await granite.generateText(SYSTEM_PROMPT, userPrompt, {
      max_new_tokens: 1600,
      temperature: 0.3,
    });

    const assessmentId = `DA-${uuidv4().slice(0, 6).toUpperCase()}`;
    const damageEstimate = calculateDamageEstimate(
      affectedHouseholds, affectedBusinesses, peakWaterDepthCm, floodDurationHours
    );

    const assessment = {
      id: assessmentId,
      timestamp: new Date().toISOString(),
      city,
      affectedArea,
      floodDurationHours,
      peakWaterDepthCm,
      affectedHouseholds,
      affectedBusinesses,
      infrastructureDamage,
      reportedByOfficer,
      damageEstimateLakhs: damageEstimate,
      detailedAssessment: response,
      status: 'Completed',
      compensationEligible: Math.round(affectedHouseholds * 0.7),
    };

    assessments.unshift(assessment);
    if (assessments.length > 50) assessments.pop();

    res.json({ success: true, data: assessment });
  } catch (error) {
    console.error('Damage Assessment error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
}

async function getAssessments(req, res) {
  const { city, limit = 10 } = req.query;
  let filtered = [...assessments];
  if (city) filtered = filtered.filter((a) => a.city.toLowerCase() === city.toLowerCase());
  res.json({ success: true, data: filtered.slice(0, parseInt(limit)), total: filtered.length });
}

function calculateDamageEstimate(households, businesses, waterDepth, duration) {
  const residentialDamage = households * (waterDepth > 60 ? 1.5 : waterDepth > 30 ? 0.8 : 0.3);
  const commercialDamage = businesses * (waterDepth > 60 ? 5 : waterDepth > 30 ? 2.5 : 1);
  const infraDamage = (waterDepth / 10) * (duration / 12) * 15;
  return Math.round((residentialDamage + commercialDamage + infraDamage) * 10) / 10;
}

module.exports = { assessDamage, getAssessments };
