import React, { useState, useEffect } from 'react';
import { damageAPI } from '../services/api';
import { toast } from 'react-toastify';

function DamageAssessmentPanel() {
  const [form, setForm] = useState({
    city: 'Ahmedabad',
    affectedArea: '',
    floodDurationHours: 24,
    peakWaterDepthCm: 60,
    affectedHouseholds: 100,
    affectedBusinesses: 20,
    reportedByOfficer: 'Field Officer',
    infrastructureDamage: '',
  });
  const [result, setResult] = useState(null);
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { loadAssessments(); }, []);

  const loadAssessments = async () => {
    try {
      const res = await damageAPI.getAssessments({ limit: 10 });
      setAssessments(res.data || []);
    } catch (err) {}
  };

  const handleChange = (e) => {
    const val = e.target.type === 'number' ? parseFloat(e.target.value) : e.target.value;
    setForm({ ...form, [e.target.name]: val });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.affectedArea) { toast.error('Please specify affected area'); return; }
    setLoading(true);
    setResult(null);
    try {
      const payload = {
        ...form,
        floodDurationHours: parseInt(form.floodDurationHours),
        peakWaterDepthCm: parseInt(form.peakWaterDepthCm),
        affectedHouseholds: parseInt(form.affectedHouseholds),
        affectedBusinesses: parseInt(form.affectedBusinesses),
        infrastructureDamage: form.infrastructureDamage
          ? form.infrastructureDamage.split(',').map(s => s.trim()).filter(Boolean)
          : [],
      };
      const res = await damageAPI.assess(payload);
      setResult(res.data);
      loadAssessments();
      toast.success(`Assessment ${res.data.id} completed!`);
    } catch (err) {
      toast.error(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="alert-banner warning">
        🏗️ <strong>Post-Disaster Damage Assessment Agent</strong> — Systematically assess flood damage, calculate losses, and generate recovery plans.
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <span className="card-icon">📋</span>
            <span className="card-title">Assessment Parameters</span>
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
                <label className="form-label">Assessment Officer</label>
                <input type="text" name="reportedByOfficer" className="form-control" value={form.reportedByOfficer} onChange={handleChange} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Affected Area/Zone *</label>
              <input type="text" name="affectedArea" className="form-control" value={form.affectedArea} onChange={handleChange}
                placeholder="e.g. Katargam Ward 8, Surat" />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Flood Duration (hours)</label>
                <input type="number" name="floodDurationHours" className="form-control" value={form.floodDurationHours} onChange={handleChange} min="1" max="720" />
              </div>
              <div className="form-group">
                <label className="form-label">Peak Water Depth (cm)</label>
                <input type="number" name="peakWaterDepthCm" className="form-control" value={form.peakWaterDepthCm} onChange={handleChange} min="5" max="500" />
              </div>
              <div className="form-group">
                <label className="form-label">Affected Households</label>
                <input type="number" name="affectedHouseholds" className="form-control" value={form.affectedHouseholds} onChange={handleChange} min="0" />
              </div>
              <div className="form-group">
                <label className="form-label">Affected Businesses</label>
                <input type="number" name="affectedBusinesses" className="form-control" value={form.affectedBusinesses} onChange={handleChange} min="0" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Infrastructure Damaged (comma-separated)</label>
              <input type="text" name="infrastructureDamage" className="form-control" value={form.infrastructureDamage} onChange={handleChange}
                placeholder="Roads, Drainage, Electrical poles, Bridges" />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
              {loading ? '🔄 Assessing...' : '🏗️ Generate Damage Assessment'}
            </button>
          </form>
        </div>

        {result && (
          <div className="card">
            <div className="card-header">
              <span className="card-icon">💰</span>
              <span className="card-title">Damage Summary</span>
              <span style={{ fontFamily: 'monospace', color: '#60a5fa', fontSize: '0.8rem' }}>{result.id}</span>
            </div>
            <div style={{ display: 'grid', gap: '12px' }}>
              <div style={{ background: 'rgba(239,68,68,0.1)', padding: '12px', borderRadius: 8, textAlign: 'center' }}>
                <div style={{ color: '#fca5a5', fontSize: '0.8rem' }}>Total Estimated Damage</div>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: '#ef4444' }}>₹{result.damageEstimateLakhs}L</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Lakhs (INR)</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div style={{ background: 'rgba(59,130,246,0.1)', padding: '10px', borderRadius: 8, textAlign: 'center' }}>
                  <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#60a5fa' }}>{result.affectedHouseholds}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Households Affected</div>
                </div>
                <div style={{ background: 'rgba(16,185,129,0.1)', padding: '10px', borderRadius: 8, textAlign: 'center' }}>
                  <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#10b981' }}>{result.compensationEligible}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>SDRF Eligible</div>
                </div>
                <div style={{ background: 'rgba(249,115,22,0.1)', padding: '10px', borderRadius: 8, textAlign: 'center' }}>
                  <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#f97316' }}>{result.floodDurationHours}h</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Flood Duration</div>
                </div>
                <div style={{ background: 'rgba(245,158,11,0.1)', padding: '10px', borderRadius: 8, textAlign: 'center' }}>
                  <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#f59e0b' }}>{result.peakWaterDepthCm}cm</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Peak Water Depth</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {loading && (
        <div className="loading-spinner">
          <div className="spinner" />
          <span>IBM Granite 4-8B conducting damage assessment...</span>
        </div>
      )}

      {result && (
        <div className="card">
          <div className="card-header">
            <span className="card-icon">🤖</span>
            <span className="card-title">AI Damage Assessment Report</span>
            <span className="card-subtitle">Post-Disaster Assessment Agent</span>
          </div>
          <div className="ai-response-box">
            <div className="ai-response-header"><span>🧠</span><span>IBM Granite 4-8B Response</span></div>
            <div className="agent-response">{result.detailedAssessment}</div>
          </div>
        </div>
      )}

      {assessments.length > 0 && (
        <div className="card">
          <div className="card-header">
            <span className="card-icon">📂</span>
            <span className="card-title">Previous Assessments</span>
          </div>
          <table className="data-table">
            <thead>
              <tr><th>ID</th><th>City</th><th>Area</th><th>Households</th><th>Damage (₹L)</th><th>Date</th></tr>
            </thead>
            <tbody>
              {assessments.map(a => (
                <tr key={a.id}>
                  <td style={{ fontFamily: 'monospace', color: '#60a5fa', fontSize: '0.8rem' }}>{a.id}</td>
                  <td>{a.city}</td>
                  <td style={{ maxWidth: 180, fontSize: '0.82rem' }}>{a.affectedArea}</td>
                  <td>{a.affectedHouseholds}</td>
                  <td style={{ color: '#ef4444', fontWeight: 600 }}>₹{a.damageEstimateLakhs}L</td>
                  <td style={{ color: '#64748b', fontSize: '0.78rem' }}>{new Date(a.timestamp).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default DamageAssessmentPanel;
