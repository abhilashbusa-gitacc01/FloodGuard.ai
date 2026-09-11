import React, { useState, useEffect } from 'react';
import { citizenReportAPI } from '../services/api';
import { toast } from 'react-toastify';

const WATER_LEVELS = ['ankle', 'knee', 'waist', 'chest', 'neck'];
const SEVERITY_COLORS = { Emergency: '#ef4444', High: '#f97316', Medium: '#f59e0b', Low: '#10b981' };

function CitizenReportPanel() {
  const [form, setForm] = useState({
    city: 'Ahmedabad',
    location: '',
    description: '',
    waterLevel: 'knee',
    peopleStranded: 0,
    reporterPhone: '',
  });
  const [result, setResult] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingReports, setLoadingReports] = useState(false);

  useEffect(() => { loadReports(); }, []);

  const loadReports = async () => {
    setLoadingReports(true);
    try {
      const res = await citizenReportAPI.getReports({ limit: 15 });
      setReports(res.data || []);
    } catch (err) {}
    setLoadingReports(false);
  };

  const handleChange = (e) => {
    const val = e.target.type === 'number' ? parseInt(e.target.value) : e.target.value;
    setForm({ ...form, [e.target.name]: val });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.location || !form.description) {
      toast.error('Please provide location and description');
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const res = await citizenReportAPI.submit(form);
      setResult(res.data);
      loadReports();
      toast.success(`✅ Report #${res.data.reportId} submitted successfully!`);
      setForm({ ...form, location: '', description: '', peopleStranded: 0, reporterPhone: '' });
    } catch (err) {
      toast.error(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="alert-banner success">
        📱 <strong>Citizen Flood Reporting Agent</strong> — Report flood conditions in your area to help coordinate emergency response.
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <span className="card-icon">📱</span>
            <span className="card-title">Submit Flood Report</span>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">City *</label>
                <select name="city" className="form-control" value={form.city} onChange={handleChange}>
                  <option value="Ahmedabad">Ahmedabad</option>
                  <option value="Surat">Surat</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Water Level</label>
                <select name="waterLevel" className="form-control" value={form.waterLevel} onChange={handleChange}>
                  {WATER_LEVELS.map(l => <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)} deep</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Location (Area/Ward/Street) *</label>
              <input
                type="text" name="location" className="form-control" value={form.location} onChange={handleChange}
                placeholder="e.g. Near Maninagar Railway Station, Ward 25"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Situation Description *</label>
              <textarea
                name="description" className="form-control" value={form.description} onChange={handleChange}
                placeholder="Describe what you see: flooding severity, blocked roads, people stranded, infrastructure damage..."
                rows={4}
              />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">People Stranded</label>
                <input type="number" name="peopleStranded" className="form-control" value={form.peopleStranded} onChange={handleChange} min="0" />
              </div>
              <div className="form-group">
                <label className="form-label">Phone (Optional)</label>
                <input type="tel" name="reporterPhone" className="form-control" value={form.reporterPhone} onChange={handleChange} placeholder="98XXXXXXXX" />
              </div>
            </div>
            <button type="submit" className="btn btn-success" disabled={loading} style={{ width: '100%' }}>
              {loading ? '🔄 Submitting...' : '📤 Submit Flood Report'}
            </button>
          </form>
        </div>

        {result && (
          <div className="card">
            <div className="card-header">
              <span className="card-icon">✅</span>
              <span className="card-title">Report Submitted</span>
              <span style={{
                padding: '3px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700,
                background: `${SEVERITY_COLORS[result.severityLevel]}22`,
                color: SEVERITY_COLORS[result.severityLevel],
                border: `1px solid ${SEVERITY_COLORS[result.severityLevel]}`
              }}>{result.severityLevel}</span>
            </div>
            <div style={{ display: 'grid', gap: '10px', marginBottom: '1rem' }}>
              <div style={{ background: 'rgba(16,185,129,0.1)', padding: '12px', borderRadius: 8 }}>
                <div style={{ color: '#6ee7b7', fontSize: '0.8rem' }}>Report ID</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#10b981', fontFamily: 'monospace' }}>#{result.reportId}</div>
              </div>
              <div style={{ background: 'rgba(59,130,246,0.1)', padding: '10px', borderRadius: 8, fontSize: '0.85rem' }}>
                <strong style={{ color: '#60a5fa' }}>📬 {result.message}</strong>
              </div>
              <div style={{ background: 'rgba(249,115,22,0.1)', padding: '10px', borderRadius: 8, fontSize: '0.82rem', color: '#fdba74' }}>
                ⏱️ Estimated Response: <strong>{result.estimatedResponse}</strong>
              </div>
              {result.dispatchRequired && (
                <div className="alert-banner error" style={{ margin: 0 }}>
                  🚨 Emergency dispatch has been activated for this location!
                </div>
              )}
            </div>
            <div className="ai-response-box">
              <div className="ai-response-header"><span>🧠</span><span>AI Safety Guidance</span></div>
              <div className="agent-response">{result.immediateGuidance}</div>
            </div>
          </div>
        )}
      </div>

      {loading && (
        <div className="loading-spinner">
          <div className="spinner" />
          <span>IBM Granite 4-8B processing your report...</span>
        </div>
      )}

      {/* Recent Reports */}
      <div className="card">
        <div className="card-header">
          <span className="card-icon">📋</span>
          <span className="card-title">Recent Citizen Reports</span>
          <button className="btn btn-primary" style={{ marginLeft: 'auto', padding: '6px 14px', fontSize: '0.8rem' }} onClick={loadReports}>
            🔄 Refresh
          </button>
        </div>
        {loadingReports ? (
          <div className="loading-spinner" style={{ padding: '1rem' }}>
            <div className="spinner" />
          </div>
        ) : reports.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#64748b', padding: '2rem' }}>
            No reports yet. Be the first to report!
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr><th>Report ID</th><th>City</th><th>Location</th><th>Water Level</th><th>Stranded</th><th>Severity</th><th>Time</th></tr>
            </thead>
            <tbody>
              {reports.map(r => (
                <tr key={r.id}>
                  <td style={{ fontFamily: 'monospace', color: '#60a5fa', fontSize: '0.8rem' }}>#{r.id}</td>
                  <td>{r.city}</td>
                  <td style={{ maxWidth: 160, fontSize: '0.82rem' }}>{r.location}</td>
                  <td>{r.waterLevel}</td>
                  <td style={{ color: r.peopleStranded > 0 ? '#ef4444' : '#64748b' }}>
                    {r.peopleStranded > 0 ? `⚠️ ${r.peopleStranded}` : '0'}
                  </td>
                  <td>
                    <span style={{
                      padding: '2px 8px', borderRadius: 12, fontSize: '0.72rem', fontWeight: 700,
                      background: `${SEVERITY_COLORS[r.severityLevel]}22`,
                      color: SEVERITY_COLORS[r.severityLevel] || '#94a3b8',
                      border: `1px solid ${SEVERITY_COLORS[r.severityLevel] || '#64748b'}`
                    }}>{r.severityLevel}</span>
                  </td>
                  <td style={{ color: '#64748b', fontSize: '0.78rem' }}>{new Date(r.timestamp).toLocaleTimeString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default CitizenReportPanel;
