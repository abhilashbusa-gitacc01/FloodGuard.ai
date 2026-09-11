import React, { useState } from 'react';
import { floodRiskAPI } from '../services/api';
import { toast } from 'react-toastify';

const RISK_COLORS = { CRITICAL: '#ef4444', HIGH: '#f97316', MEDIUM: '#f59e0b', LOW: '#10b981' };

function getRiskBadgeClass(level) {
  return `badge badge-${(level || 'low').toLowerCase()}`;
}

function FloodRiskPanel() {
  const [form, setForm] = useState({
    city: 'Ahmedabad',
    rainfallMm: 75,
    duration: '3 hours',
    currentWaterLevel: 'normal',
    drainageStatus: 'operational',
    windSpeed: 20,
    temperature: 28,
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const val = e.target.type === 'number' ? parseFloat(e.target.value) : e.target.value;
    setForm({ ...form, [e.target.name]: val });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await floodRiskAPI.predict(form);
      setResult(res.data);
      toast.success('Flood risk analysis complete!');
    } catch (err) {
      toast.error(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="alert-banner info">
        🌊 <strong>Flood Risk Prediction Agent</strong> — Powered by IBM Granite 4-8B. Analyze rainfall scenarios to predict flood-prone zones.
      </div>

      <div className="grid-2">
        {/* Input Form */}
        <div className="card">
          <div className="card-header">
            <span className="card-icon">⚙️</span>
            <span className="card-title">Input Parameters</span>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">City</label>
                <select name="city" className="form-control" value={form.city} onChange={handleChange}>
                  <option value="Ahmedabad">Ahmedabad</option>
                  <option value="Surat">Surat</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Rainfall (mm)</label>
                <input type="number" name="rainfallMm" className="form-control" value={form.rainfallMm} onChange={handleChange} min="0" max="500" />
              </div>
              <div className="form-group">
                <label className="form-label">Duration</label>
                <select name="duration" className="form-control" value={form.duration} onChange={handleChange}>
                  <option value="1 hour">1 hour</option>
                  <option value="3 hours">3 hours</option>
                  <option value="6 hours">6 hours</option>
                  <option value="12 hours">12 hours</option>
                  <option value="24 hours">24 hours</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Current Water Level</label>
                <select name="currentWaterLevel" className="form-control" value={form.currentWaterLevel} onChange={handleChange}>
                  <option value="normal">Normal</option>
                  <option value="elevated">Elevated</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Drainage Status</label>
                <select name="drainageStatus" className="form-control" value={form.drainageStatus} onChange={handleChange}>
                  <option value="operational">Operational</option>
                  <option value="partial blockage">Partial Blockage</option>
                  <option value="major blockage">Major Blockage</option>
                  <option value="overloaded">Overloaded</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Wind Speed (km/h)</label>
                <input type="number" name="windSpeed" className="form-control" value={form.windSpeed} onChange={handleChange} min="0" max="200" />
              </div>
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
              {loading ? '🔄 Analyzing...' : '🌊 Predict Flood Risk'}
            </button>
          </form>
        </div>

        {/* Zone Risk Visualization */}
        {result && (
          <div className="card">
            <div className="card-header">
              <span className="card-icon">📊</span>
              <span className="card-title">Zone Risk Analysis</span>
              <span className={getRiskBadgeClass(result.riskLevel)}>{result.riskLevel}</span>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '8px' }}>
                {result.city} | {result.rainfallMm}mm | {new Date(result.timestamp).toLocaleTimeString()}
              </div>
              {result.vulnerableZones?.map((z, i) => (
                <div key={i} className="zone-item">
                  <span className="zone-name">{z.zone}</span>
                  <div className="zone-bar-container">
                    <div
                      className="zone-bar"
                      style={{
                        width: `${z.riskScore}%`,
                        background: z.riskScore > 80 ? RISK_COLORS.CRITICAL : z.riskScore > 60 ? RISK_COLORS.HIGH : z.riskScore > 40 ? RISK_COLORS.MEDIUM : RISK_COLORS.LOW
                      }}
                    />
                  </div>
                  <span className="zone-score" style={{ color: z.riskScore > 80 ? RISK_COLORS.CRITICAL : z.riskScore > 60 ? RISK_COLORS.HIGH : RISK_COLORS.MEDIUM }}>
                    {Math.min(z.riskScore, 99)}%
                  </span>
                </div>
              ))}
            </div>
            <div style={{ padding: '10px', background: 'rgba(30,58,138,0.2)', borderRadius: 8, fontSize: '0.82rem', color: '#93c5fd' }}>
              <strong>👥 Affected Population:</strong> ~{result.vulnerableZones?.reduce((s, z) => s + z.population, 0).toLocaleString()} residents
            </div>
          </div>
        )}
      </div>

      {/* AI Analysis */}
      {loading && (
        <div className="loading-spinner">
          <div className="spinner" />
          <span>IBM Granite 4-8B analyzing flood risk patterns...</span>
        </div>
      )}

      {result && (
        <div className="card">
          <div className="card-header">
            <span className="card-icon">🤖</span>
            <span className="card-title">AI Flood Risk Analysis</span>
            <span className="card-subtitle">Flood Risk Prediction Agent</span>
          </div>
          <div className="ai-response-box">
            <div className="ai-response-header">
              <span>🧠</span>
              <span>IBM Granite 4-8B Response</span>
            </div>
            <div className="agent-response">{result.analysis}</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FloodRiskPanel;
