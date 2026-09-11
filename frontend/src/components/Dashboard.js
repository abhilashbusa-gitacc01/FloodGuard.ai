import React, { useState, useEffect, useCallback } from 'react';
import { dashboardAPI } from '../services/api';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, LineElement, PointElement,
  Title, Tooltip, Legend, ArcElement
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, LineElement, PointElement,
  Title, Tooltip, Legend, ArcElement
);

const CHART_OPTS = {
  responsive: true,
  plugins: { legend: { labels: { color: '#94a3b8', font: { size: 11 } } } },
  scales: {
    x: { ticks: { color: '#64748b' }, grid: { color: 'rgba(30,58,138,0.3)' } },
    y: { ticks: { color: '#64748b' }, grid: { color: 'rgba(30,58,138,0.3)' } },
  },
};

function getRiskColor(level) {
  const map = { CRITICAL: '#ef4444', HIGH: '#f97316', MEDIUM: '#f59e0b', LOW: '#10b981', GREEN: '#10b981', YELLOW: '#f59e0b', ORANGE: '#f97316', RED: '#ef4444' };
  return map[level] || '#64748b';
}

function StatusBadge({ status }) {
  const colors = { GREEN: '#10b981', YELLOW: '#f59e0b', ORANGE: '#f97316', RED: '#ef4444' };
  return (
    <span style={{
      display: 'inline-block', padding: '2px 10px', borderRadius: 20,
      background: `${colors[status] || '#64748b'}22`,
      color: colors[status] || '#94a3b8',
      border: `1px solid ${colors[status] || '#64748b'}`,
      fontSize: '0.75rem', fontWeight: 700
    }}>{status || 'UNKNOWN'}</span>
  );
}

function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [city, setCity] = useState('both');

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await dashboardAPI.getInsights({ city, timeframe: '24 hours' });
      setData(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [city]);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  const rainfallChartData = data ? {
    labels: data.rainfallTrend.slice(-12).map(d => d.hour),
    datasets: [
      {
        label: 'Ahmedabad (mm)',
        data: data.rainfallTrend.slice(-12).map(d => d.ahmedabad),
        borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.15)', tension: 0.4, fill: true,
      },
      {
        label: 'Surat (mm)',
        data: data.rainfallTrend.slice(-12).map(d => d.surat),
        borderColor: '#8b5cf6', backgroundColor: 'rgba(139,92,246,0.15)', tension: 0.4, fill: true,
      },
    ],
  } : null;

  const zoneRiskData = data?.floodMapData ? {
    labels: Object.values(data.floodMapData).flat().slice(0, 8).map(z => z.zone),
    datasets: [{
      label: 'Water Depth (cm)',
      data: Object.values(data.floodMapData).flat().slice(0, 8).map(z => z.waterDepth),
      backgroundColor: Object.values(data.floodMapData).flat().slice(0, 8).map(z => getRiskColor(z.risk) + '88'),
      borderColor: Object.values(data.floodMapData).flat().slice(0, 8).map(z => getRiskColor(z.risk)),
      borderWidth: 1,
    }],
  } : null;

  if (loading) return (
    <div className="loading-spinner">
      <div className="spinner" />
      <span>Fetching live data from all monitoring systems...</span>
    </div>
  );

  if (error) return (
    <div className="alert-banner error" style={{ marginTop: '2rem' }}>
      ⚠️ Dashboard Error: {error}. Please configure credentials in .env file.
    </div>
  );

  const m = data.metrics;

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ color: '#60a5fa', fontSize: '1.3rem' }}>Urban Resilience Dashboard</h2>
          <p style={{ color: '#64748b', fontSize: '0.8rem' }}>Last updated: {new Date(data.timestamp).toLocaleString()}</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <select className="form-control" style={{ width: 'auto' }} value={city} onChange={e => setCity(e.target.value)}>
            <option value="both">Both Cities</option>
            <option value="Ahmedabad">Ahmedabad</option>
            <option value="Surat">Surat</option>
          </select>
          <button className="btn btn-primary" onClick={fetchDashboard}>🔄 Refresh</button>
        </div>
      </div>

      {/* City Status */}
      <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
        <div className="card" style={{ padding: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Ahmedabad Status</div>
              <StatusBadge status={m.ahmedabadStatus} />
            </div>
            <span style={{ fontSize: '2rem' }}>🏙️</span>
          </div>
        </div>
        <div className="card" style={{ padding: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Surat Status</div>
              <StatusBadge status={m.suratStatus} />
            </div>
            <span style={{ fontSize: '2rem' }}>🌆</span>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
        {[
          { value: m.totalReports, label: 'Citizen Reports', icon: '📱', change: '+12 today', dir: 'up' },
          { value: m.activeIncidents, label: 'Active Incidents', icon: '🚨', change: 'Live', dir: 'up' },
          { value: `${m.drainageHealth}%`, label: 'Drainage Health', icon: '🔧', change: m.drainageHealth > 80 ? 'Good' : 'Needs attention', dir: m.drainageHealth > 80 ? 'down' : 'up' },
          { value: `${m.avgRainfall}mm`, label: 'Avg Rainfall (24h)', icon: '🌧️', change: 'Current', dir: 'up' },
          { value: m.pumpStations + '/12', label: 'Pump Stations OK', icon: '⚙️', change: 'Operational', dir: 'down' },
          { value: m.evacuationCenters, label: 'Evac Centers Active', icon: '🏕️', change: 'Ready', dir: 'down' },
          { value: m.peopleEvacuated, label: 'People Evacuated', icon: '🚶', change: 'Total', dir: 'up' },
          { value: m.rescueOps, label: 'Rescue Ops Done', icon: '⛑️', change: 'Completed', dir: 'down' },
        ].map((metric, i) => (
          <div key={i} className="metric-card">
            <span style={{ fontSize: '1.5rem' }}>{metric.icon}</span>
            <span className="metric-value">{metric.value}</span>
            <div className="metric-label">{metric.label}</div>
            <div className={`metric-change ${metric.dir}`}>{metric.change}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <span className="card-icon">📈</span>
            <span className="card-title">24-Hour Rainfall Trend</span>
          </div>
          {rainfallChartData && <Line data={rainfallChartData} options={CHART_OPTS} />}
        </div>
        <div className="card">
          <div className="card-header">
            <span className="card-icon">🗺️</span>
            <span className="card-title">Zone Water Depth (cm)</span>
          </div>
          {zoneRiskData && <Bar data={zoneRiskData} options={CHART_OPTS} />}
        </div>
      </div>

      {/* Flood Map Table */}
      <div className="card">
        <div className="card-header">
          <span className="card-icon">📍</span>
          <span className="card-title">Flood Zone Risk Map</span>
          <span className="card-subtitle">Real-time zone status</span>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Zone</th>
              <th>City</th>
              <th>Risk Level</th>
              <th>Water Depth</th>
              <th>Coordinates</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(data.floodMapData).flatMap(([c, zones]) =>
              zones.map((z, i) => (
                <tr key={`${c}-${i}`}>
                  <td>{z.zone}</td>
                  <td>{c}</td>
                  <td><span className={`badge badge-${z.risk.toLowerCase()}`}>{z.risk}</span></td>
                  <td>{z.waterDepth} cm</td>
                  <td style={{ color: '#64748b', fontSize: '0.75rem' }}>{z.lat}, {z.lng}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* AI Insights */}
      <div className="card">
        <div className="card-header">
          <span className="card-icon">🤖</span>
          <span className="card-title">AI Insights — IBM Granite 4-8B</span>
          <span className="card-subtitle">Urban Resilience Dashboard Agent</span>
        </div>
        <div className="ai-response-box">
          <div className="ai-response-header">
            <span>🧠</span>
            <span>Granite LLM Analysis</span>
          </div>
          <div className="agent-response">{data.insights}</div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
