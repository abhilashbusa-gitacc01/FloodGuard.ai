import React from 'react';

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="navbar-logo">🌊</span>
        <div>
          <div className="navbar-title">FloodGuard AI</div>
          <div className="navbar-subtitle">Smart Urban Flooding & Drainage Management | Ahmedabad · Surat</div>
        </div>
      </div>
      <div className="navbar-right">
        <span className="ibm-badge">IBM Granite 4-8B</span>
        <div className="status-indicator">
          <span className="status-dot"></span>
          <span>Live System</span>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
