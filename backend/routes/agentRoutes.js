const express = require('express');
const router = express.Router();
const { predictFloodRisk } = require('../agents/floodRiskAgent');
const { scheduleMaintenance } = require('../agents/drainageMaintenanceAgent');
const { coordinateResponse, getActiveIncidents, updateIncidentStatus } = require('../agents/civicResponseAgent');
const { submitReport, getReports } = require('../agents/citizenReportingAgent');
const { getDashboardInsights } = require('../agents/dashboardAgent');
const { assessDamage, getAssessments } = require('../agents/postDisasterAgent');

// Health check
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Smart Urban Flooding & Drainage Management System - API is running',
    timestamp: new Date().toISOString(),
    agents: [
      'Flood Risk Prediction Agent',
      'Drainage Maintenance Scheduling Agent',
      'Real-Time Civic Response Coordination Agent',
      'Citizen Flood Reporting Agent',
      'Urban Resilience Dashboard Agent',
      'Post-Disaster Damage Assessment Agent',
    ],
  });
});

// Agent 1: Flood Risk Prediction
router.post('/agents/flood-risk', predictFloodRisk);

// Agent 2: Drainage Maintenance Scheduling
router.post('/agents/drainage-maintenance', scheduleMaintenance);

// Agent 3: Real-Time Civic Response Coordination
router.post('/agents/civic-response', coordinateResponse);
router.get('/agents/civic-response/incidents', getActiveIncidents);
router.put('/agents/civic-response/incidents/:id', updateIncidentStatus);

// Agent 4: Citizen Flood Reporting
router.post('/agents/citizen-report', submitReport);
router.get('/agents/citizen-reports', getReports);

// Agent 5: Urban Resilience Dashboard
router.get('/agents/dashboard', getDashboardInsights);

// Agent 6: Post-Disaster Damage Assessment
router.post('/agents/damage-assessment', assessDamage);
router.get('/agents/damage-assessments', getAssessments);

module.exports = router;
