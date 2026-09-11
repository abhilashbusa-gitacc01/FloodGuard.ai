require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const agentRoutes = require('./routes/agentRoutes');
const granite = require('./services/graniteLLM');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// CORS configuration
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'http://localhost:3000',
    'http://localhost:3001',
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Logging
app.use(morgan('combined'));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// Routes
app.use('/api', agentRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Smart Urban Flooding & Drainage Management System',
    version: '1.0.0',
    description: 'AI-powered flood management for Ahmedabad & Surat using IBM Granite LLM',
    powered_by: 'IBM Watsonx.AI - Granite 4-8B Instruct',
    api_docs: '/api/health',
    cities: ['Ahmedabad', 'Surat'],
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.url} not found` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// Start server
app.listen(PORT, () => {
  console.log('');
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║   Smart Urban Flooding & Drainage Management System          ║');
  console.log('║   IBM Granite 4-8B Instruct | IBM Watsonx.AI                ║');
  console.log(`║   Backend API running at http://localhost:${PORT}            ║`);
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log('Active Agents:');
  console.log('  ✓ Flood Risk Prediction Agent');
  console.log('  ✓ Drainage Maintenance Scheduling Agent');
  console.log('  ✓ Real-Time Civic Response Coordination Agent');
  console.log('  ✓ Citizen Flood Reporting Agent');
  console.log('  ✓ Urban Resilience Dashboard Agent');
  console.log('  ✓ Post-Disaster Damage Assessment Agent');
  console.log('');

  if (granite.shouldUseMock()) {
    console.warn('⚠  WARNING: WATSONX_API_KEY not configured. Running in mock AI response mode. Update .env to enable live Granite LLM.');
  } else {
    console.log('  ✓ IBM Watsonx.AI credentials configured');
  }
});

module.exports = app;
