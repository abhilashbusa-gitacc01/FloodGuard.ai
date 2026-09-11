import React, { useState } from 'react';
import { ToastContainer } from 'react-toastify';
import Dashboard from './components/Dashboard';
import FloodRiskPanel from './components/FloodRiskPanel';
import DrainagePanel from './components/DrainagePanel';
import CivicResponsePanel from './components/CivicResponsePanel';
import CitizenReportPanel from './components/CitizenReportPanel';
import DamageAssessmentPanel from './components/DamageAssessmentPanel';
import './App.css';

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'flood-risk', label: 'Flood Risk', icon: '🌊' },
  { id: 'drainage', label: 'Drainage', icon: '🔧' },
  { id: 'civic-response', label: 'Civic Response', icon: '🚨' },
  { id: 'citizen-report', label: 'Citizen Report', icon: '📱' },
  { id: 'damage-assessment', label: 'Damage Assessment', icon: '🏗️' },
];

function Sidebar({ activeTab, setActiveTab, isOpen, onClose }) {
  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'visible' : ''}`} onClick={onClose} />
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <div className="sidebar-brand-row">
            <span className="brand-icon">🌊</span>
            <h1>FloodGuard AI</h1>
          </div>
          <div className="brand-sub">Smart Urban Flooding & Drainage Management<br />Ahmedabad · Surat</div>
          <div className="sidebar-badge">⚡ IBM Granite 4-8B</div>
        </div>
        <nav className="sidebar-nav">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`sidebar-nav-item ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => { setActiveTab(tab.id); onClose(); }}
              id={`nav-${tab.id}`}
            >
              <span className="nav-icon">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <span className="status-dot" />
          System Online — Mock AI Mode
        </div>
      </aside>
    </>
  );
}

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="mobile-header">
        <button className="hamburger-btn" onClick={() => setSidebarOpen(true)}>☰</button>
        <h1>FloodGuard AI</h1>
      </div>
      <main className="main-content">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'flood-risk' && <FloodRiskPanel />}
        {activeTab === 'drainage' && <DrainagePanel />}
        {activeTab === 'civic-response' && <CivicResponsePanel />}
        {activeTab === 'citizen-report' && <CitizenReportPanel />}
        {activeTab === 'damage-assessment' && <DamageAssessmentPanel />}
      </main>
      <ToastContainer position="bottom-right" theme="dark" autoClose={4000} />
    </div>
  );
}

export default App;
