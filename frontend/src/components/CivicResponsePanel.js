import React, { useState, useEffect } from 'react';
import { civicResponseAPI } from '../services/api';
import { toast } from 'react-toastify';

const ALERT_LEVELS = ['Level 1', 'Level 2', 'Level 3', 'Level 4'];
const ALERT_COLORS = { 'Level 1': '#10b981', 'Level 2': '#f59e0b', 'Level 3': '#f97316', 'Level 4': '#ef4444' };

function CivicResponsePanel() {
  const [form, setForm] = useState({
    city: 'Ahmedabad',
    alertLevel: 'Level 2',
    rainfallMm: 80,
    reportedCasualties: 0,
    rescueTeamsAvailable: 15,
    boatsAvailable: 20,
    affectedZones: '',
  });
  const [result, setResult] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { loadIncidents(); }, []);

  const loadIncidents = async () => {
    try {
      const res = await civicResponseAPI.getIncidents();
      setIncidents(res.data || []);
    } catch (err) {}
  };

  const handleChange = (e) => {
    const val = e.target.type === 'number' ? parseFloat(e.target.value) : e.target.value;
    setForm({ ...form, [e.target.name]: val });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const payload = {
        ...form,
        rainfallMm: parseInt(form.rainfallMm),
        reportedCasualties: parseInt(form.reportedCasualties),
        rescueTeamsAvailable: parseInt(form.rescueTeamsAvailable),
        boatsAvailable: parseInt(form.boatsAvailable),
        affectedZones: form.affectedZones ? form.affectedZones.split(',').map(z => z.trim()).filter(Boolean) : [],
      };
      const res = await civicResponseAPI.coordinate(payload);
      setResult(res.data);
      loadIncidents();
      toast.success('🚨 Emergency response plan generated!');
    } catch (err) {
      toast.error(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="alert-banner warning">
        🚨 <strong>Real-Time Civic Response Coordination Agent</strong> — Deploy emergency resources and coordinate inter-agency flood response.
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <span className="card-icon">🚨</span>
            <span className="card-title">Emergency Parameters</span>
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
                <label className="form-label">Alert Level</label>
                <select name="alertLevel" className="form-control" value={form.alertLevel} onChange={handleChange}
                  style={{ borderColor: ALERT_COLORS[form.alertLevel] }}>
                  {ALERT_LEVELS.map(l => <option key={l} value={l}>{l} — {['Advisory', 'Watch', 'Warning', 'Emergency'][ALERT_LEVELS.indexOf(l)]}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Rainfall (mm/hr)</label>
                <input type="number" name="rainfallMm" className="form-control" value={form.rainfallMm} onChange={handleChange} min="0" max="500" />
              </div>
              <div className="form-group">
                <label className="form-label">Casualties/Stranded</label>
                <input type="number" name="reportedCasualties" className="form-control" value={form.reportedCasualties} onChange={handleChange} min="0" />
              </div>
              <div className="form-group">
                <label className="form-label">Rescue Teams Available</label>
                <input type="number" name="rescueTeamsAvailable" className="form-control" value={form.rescueTeamsAvailable} onChange={handleChange} min="1" />
              </div>
              <div className="form-group">
                <label className="form-label">Boats Available</label>
                <input type="number" name="boatsAvailable" className="form-control" value={form.boatsAvailable} onChange={handleChange} min="0" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Affected Zones (comma-separated)</label>
              <input type="text" name="affectedZones" className="form-control" value={form.affectedZones} onChange={handleChange} placeholder="Maninagar, Juhapura, Vatva" />
            </div>
            <button type="submit" className="btn btn-danger" disabled={loading} style={{ width: '100%' }}>
              {loading ? '🔄 Coordinating...' : '🚨 Activate Emergency Response'}
            </button>
          </form>
        </div>

        {result && (
          <div className="card">
            <div className="card-header">
              <span className="card-icon">📦</span>
              <span className="card-title">Deployed Resources</span>
              <span className="badge badge-emergency">{result.alertLevel}</span>
            </div>
            <div style={{ display: 'grid', gap: '10px' }}>
              <div style={{ background: 'rgba(59,130,246,0.1)', padding: '12px', borderRadius: 8 }}>
                <div style={{ color: '#93c5fd', fontSize: '0.8rem', marginBottom: 4 }}>⛑️ Rescue Teams</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#60a5fa' }}>
                  {result.deployedResources?.rescueTeams?.deployed}/{result.deployedResources?.rescueTeams?.total}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Teams deployed</div>
              </div>
              <div style={{ background: 'rgba(16,185,129,0.1)', padding: '12px', borderRadius: 8 }}>
                <div style={{ color: '#6ee7b7', fontSize: '0.8rem', marginBottom: 4 }}>🚤 Rescue Boats</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#10b981' }}>
                  {result.deployedResources?.boats?.deployed}/{result.deployedResources?.boats?.total}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Boats deployed</div>
              </div>
              <div style={{ background: 'rgba(249,115,22,0.1)', padding: '12px', borderRadius: 8 }}>
                <div style={{ color: '#fdba74', fontSize: '0.8rem', marginBottom: 4 }}>🏕️ Relief Camps</div>
                {result.deployedResources?.reliefCamps?.map((camp, i) => (
                  <div key={i} style={{ fontSize: '0.82rem', color: '#cbd5e1', marginTop: 4 }}>
                    {camp.name} — Cap: {camp.capacity} | <span style={{ color: '#10b981' }}>{camp.status}</span>
                  </div>
                ))}
              </div>
              {result.deployedResources?.ndrf > 0 && (
                <div style={{ background: 'rgba(239,68,68,0.1)', padding: '12px', borderRadius: 8 }}>
                  <div style={{ color: '#fca5a5', fontSize: '0.8rem' }}>🪖 NDRF Units: {result.deployedResources.ndrf} deployed</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {loading && (
        <div className="loading-spinner">
          <div className="spinner" />
          <span>IBM Granite 4-8B coordinating emergency response...</span>
        </div>
      )}

      {result && (
        <div className="card">
          <div className="card-header">
            <span className="card-icon">🤖</span>
            <span className="card-title">AI Emergency Response Plan</span>
            <span className="card-subtitle">Civic Response Coordination Agent</span>
          </div>
          <div className="ai-response-box">
            <div className="ai-response-header">
              <span>🧠</span>
              <span>IBM Granite 4-8B Response</span>
            </div>
            <div className="agent-response">{result.coordinationPlan}</div>
          </div>
        </div>
      )}

      {incidents.length > 0 && (
        <div className="card">
          <div className="card-header">
            <span className="card-icon">📋</span>
            <span className="card-title">Active Incidents</span>
            <span className="badge badge-active">{incidents.length} Active</span>
          </div>
          <table className="data-table">
            <thead>
              <tr><th>Incident ID</th><th>City</th><th>Alert Level</th><th>Rainfall</th><th>Time</th><th>Status</th></tr>
            </thead>
            <tbody>
              {incidents.map(inc => (
                <tr key={inc.id}>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#60a5fa' }}>{inc.id.slice(0, 8)}</td>
                  <td>{inc.city}</td>
                  <td><span style={{ color: ALERT_COLORS[inc.alertLevel] }}>{inc.alertLevel}</span></td>
                  <td>{inc.rainfallMm}mm</td>
                  <td style={{ color: '#64748b', fontSize: '0.8rem' }}>{new Date(inc.timestamp).toLocaleString()}</td>
                  <td><span className="badge badge-active">{inc.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default CivicResponsePanel;
