# 🌊 FloodGuard AI — Smart Urban Flooding & Drainage Management System

> **IBM Watsonx.AI Challenge 7 | Ahmedabad & Surat | IBM Granite 4-8B Instruct**

## Overview

An AI-powered system for managing urban flood risk in Ahmedabad and Surat using **IBM Granite 4-8B Instruct** via **IBM Watsonx.AI**. The system features 6 specialized AI agents that predict floods, schedule maintenance, coordinate emergency response, and assess damage.

---

## 6 AI Agents

| Agent | Purpose |
|-------|---------|
| 🌊 **Flood Risk Prediction Agent** | Analyzes rainfall + drainage to predict flood-prone zones |
| 🔧 **Drainage Maintenance Scheduling Agent** | Optimizes 30-day maintenance schedules by season |
| 🚨 **Real-Time Civic Response Coordination Agent** | Deploys rescue teams, boats, NDRF during active floods |
| 📱 **Citizen Flood Reporting Agent** | Processes citizen reports with severity classification |
| 📊 **Urban Resilience Dashboard Agent** | Real-time citywide situational awareness |
| 🏗️ **Post-Disaster Damage Assessment Agent** | Calculates damage, SDRF eligibility, recovery roadmaps |

---

## Quick Start

### Prerequisites
- Node.js 16+ ([download](https://nodejs.org))
- IBM Watsonx.AI account with API credentials

### Step 1: Configure Credentials
Edit `backend/.env` and add your IBM credentials:
```env
WATSONX_API_KEY=your_api_key_here
WATSONX_PROJECT_ID=your_project_id_here
WATSONX_URL=https://us-south.ml.cloud.ibm.com
```

### Step 2: Run the Application

**Option A — One-click launcher:**
```
Double-click START.bat
```

**Option B — Manual:**
```bash
# Terminal 1 - Backend
cd backend
npm install
npm start

# Terminal 2 - Frontend
cd frontend
npm install
npm start
```

### Step 3: Access the Application
- **Frontend UI:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **Health Check:** http://localhost:5000/api/health

---

## .bat Files

| File | Purpose |
|------|---------|
| `START.bat` | 🚀 One-click install + start both servers |
| `INSTALL.bat` | 📦 Install all npm dependencies |
| `START_BACKEND.bat` | ⚙️ Start only the backend API |
| `START_FRONTEND.bat` | 🖥️ Start only the React frontend |
| `CREATE_PUBLIC_URL.bat` | 🌐 Create public URL via ngrok |
| `STOP.bat` | 🛑 Stop all running services |

---

## API Endpoints

| Method | Endpoint | Agent |
|--------|----------|-------|
| `POST` | `/api/agents/flood-risk` | Flood Risk Prediction |
| `POST` | `/api/agents/drainage-maintenance` | Drainage Maintenance |
| `POST` | `/api/agents/civic-response` | Civic Response |
| `GET` | `/api/agents/civic-response/incidents` | Active Incidents |
| `POST` | `/api/agents/citizen-report` | Submit Report |
| `GET` | `/api/agents/citizen-reports` | Get Reports |
| `GET` | `/api/agents/dashboard` | Dashboard Insights |
| `POST` | `/api/agents/damage-assessment` | Damage Assessment |

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| AI Model | IBM Granite 4-8B Instruct |
| AI Platform | IBM Watsonx.AI |
| Backend | Node.js + Express |
| Frontend | React 18 + Chart.js |
| Charts | react-chartjs-2 |
| Notifications | react-toastify |

---

## Project Structure

```
flood-management-system/
├── backend/
│   ├── agents/
│   │   ├── floodRiskAgent.js          # Flood Risk Prediction Agent
│   │   ├── drainageMaintenanceAgent.js # Drainage Maintenance Agent
│   │   ├── civicResponseAgent.js       # Civic Response Agent
│   │   ├── citizenReportingAgent.js    # Citizen Reporting Agent
│   │   ├── dashboardAgent.js           # Dashboard Agent
│   │   └── postDisasterAgent.js        # Post-Disaster Agent
│   ├── services/
│   │   └── graniteLLM.js              # IBM Granite LLM Service
│   ├── routes/
│   │   └── agentRoutes.js             # API Routes
│   ├── server.js                       # Express Server
│   ├── .env                           # Credentials (add yours)
│   └── .env-example                   # Credentials template
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.js           # Urban Resilience Dashboard
│   │   │   ├── FloodRiskPanel.js      # Flood Risk UI
│   │   │   ├── DrainagePanel.js       # Drainage Maintenance UI
│   │   │   ├── CivicResponsePanel.js  # Emergency Response UI
│   │   │   ├── CitizenReportPanel.js  # Citizen Reporting UI
│   │   │   └── DamageAssessmentPanel.js # Damage Assessment UI
│   │   ├── services/
│   │   │   └── api.js                 # API Service Layer
│   │   ├── App.js                     # Main App Component
│   │   └── App.css                    # Dark theme styles
│   └── package.json
├── START.bat                          # 🚀 One-click launcher
├── INSTALL.bat                        # 📦 Install dependencies
├── START_BACKEND.bat                  # ⚙️ Backend only
├── START_FRONTEND.bat                 # 🖥️ Frontend only
├── CREATE_PUBLIC_URL.bat              # 🌐 ngrok public URL
└── STOP.bat                           # 🛑 Stop services
```

---

## IBM Granite Model Configuration

The system uses **`ibm/granite-4-8b-instruct`** with the following configuration:
- **Decoding:** Greedy (deterministic for critical decisions)
- **Max tokens:** 800–1600 (per agent complexity)
- **Temperature:** 0.3–0.7 (lower for emergency, higher for analysis)
- **Stop sequences:** Chat template delimiters

---

*Developed for IBM Hackathon — Challenge 7: Smart Urban Flooding & Drainage Management*
