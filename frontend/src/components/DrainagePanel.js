import React, { useState } from 'react';
import { drainageAPI } from '../services/api';
import { toast } from 'react-toastify';

const PRIORITY_COLORS = { URGENT: '#ef4444', HIGH: '#f97316', MEDIUM: '#f59e0b', LOW: '#10b981', Emergency: '#dc2626' };

function DrainagePanel() {
  const [form, setForm] = useState({
    city: 'Ahmedabad',
    season: 'pre-monsoon',
    availableCrews: 10,
    budgetLakhsRs: 50,
    priorityArea: 'all',
    reportedBlockages: '',
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
      const payload = {
        ...form,
        availableCrews: parseInt(form.availableCrews),
        budgetLakhsRs: parseFloat(form.budgetLakhsRs),
        reportedBlockages: form.reportedBlockages
          ? form.reportedBlockages.split('\n').filter(l => l.trim())
          : [],
      };
      const res = await drainageAPI.schedule(payload);
      setResult(res.data);
      toast.success('Maintenance schedule generated!');
    } catch (err) {
      toast.error(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="alert-banner info">
        🔧 <strong>Drainage Maintenance Scheduling Agent</strong> — Optimizes maintenance schedules to prevent pre/post-monsoon flooding.
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <span className="card-icon">⚙️</span>
            <span className="card-title">Schedule Parameters</span>
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
                <label className="form-label">Season</label>
                <select name="season" className="form-control" value={form.season} onChange={handleChange}>
                  <option value="pre-monsoon">Pre-Monsoon (Apr-May)</option>
                  <option value="monsoon">Monsoon (Jun-Sep)</option>
                  <option value="post-monsoon">Post-Monsoon (Oct-Nov)</option>
                  <option value="winter">Winter (Dec-Feb)</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Available Crews</label>
                <input type="number" name="availableCrews" className="form-control" value={form.availableCrews} onChange={handleChange} min="1" max="100" />
              </div>
              <div className="form-group">
                <label className="form-label">Budget (₹ Lakhs)</label>
                <input type="number" name="budgetLakhsRs" className="form-control" value={form.budgetLakhsRs} onChange={handleChange} min="1" />
              </div>
              <div className="form-group">
                <label className="form-label">Priority Area</label>
                <select name="priorityArea" className="form-control" value={form.priorityArea} onChange={handleChange}>
                  <option value="all">All Areas</option>
                  <option value="flood prone">Flood-Prone Zones</option>
                  <option value="industrial">Industrial Areas</option>
                  <option value="residential">Residential Colonies</option>
                  <option value="commercial">Commercial Areas</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Reported Blockages (one per line)</label>
              <textarea
                name="reportedBlockages"
                className="form-control"
                value={form.reportedBlockages}
                onChange={handleChange}
                placeholder="e.g. Maninagar Ward 12 drain&#10;Odhav GIDC drain near Gate 5"
                rows={3}
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
              {loading ? '🔄 Scheduling...' : '🗓️ Generate Maintenance Schedule'}
            </button>
          </form>
        </div>

        {result && (
          <div className="card">
            <div className="card-header">
              <span className="card-icon">📋</span>
              <span className="card-title">Priority Task List</span>
              <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: '#10b981' }}>
                Crew Utilization: {result.crewUtilization}%
              </span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Priority</th>
                    <th>Task</th>
                    <th>Location</th>
                    <th>Crew</th>
                    <th>Days</th>
                    <th>Cost (₹L)</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {result.maintenanceTasks?.map((task) => (
                    <tr key={task.id}>
                      <td>
                        <span style={{
                          padding: '2px 8px', borderRadius: 12,
                          background: `${PRIORITY_COLORS[task.priority] || '#64748b'}22`,
                          color: PRIORITY_COLORS[task.priority] || '#94a3b8',
                          border: `1px solid ${PRIORITY_COLORS[task.priority] || '#64748b'}`,
                          fontSize: '0.72rem', fontWeight: 700
                        }}>{task.priority}</span>
                      </td>
                      <td style={{ maxWidth: 200, fontSize: '0.82rem' }}>{task.task}</td>
                      <td style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{task.location}</td>
                      <td>{task.crewRequired}</td>
                      <td>{task.daysRequired}</td>
                      <td style={{ color: '#f59e0b' }}>₹{task.costLakhs}L</td>
                      <td>
                        <span style={{ fontSize: '0.78rem', color: task.status === 'Emergency' ? '#ef4444' : task.status === 'In Progress' ? '#3b82f6' : '#94a3b8' }}>
                          {task.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {loading && (
        <div className="loading-spinner">
          <div className="spinner" />
          <span>IBM Granite 4-8B optimizing maintenance schedule...</span>
        </div>
      )}

      {result && (
        <div className="card">
          <div className="card-header">
            <span className="card-icon">🤖</span>
            <span className="card-title">AI Maintenance Schedule</span>
            <span className="card-subtitle">Drainage Maintenance Scheduling Agent</span>
          </div>
          <div className="ai-response-box">
            <div className="ai-response-header">
              <span>🧠</span>
              <span>IBM Granite 4-8B Response</span>
            </div>
            <div className="agent-response">{result.schedule}</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DrainagePanel;
