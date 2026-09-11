import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' },
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.error || error.message || 'Unknown error occurred';
    return Promise.reject(new Error(message));
  }
);

export const floodRiskAPI = {
  predict: (data) => api.post('/agents/flood-risk', data),
};

export const drainageAPI = {
  schedule: (data) => api.post('/agents/drainage-maintenance', data),
};

export const civicResponseAPI = {
  coordinate: (data) => api.post('/agents/civic-response', data),
  getIncidents: () => api.get('/agents/civic-response/incidents'),
  updateIncident: (id, data) => api.put(`/agents/civic-response/incidents/${id}`, data),
};

export const citizenReportAPI = {
  submit: (data) => api.post('/agents/citizen-report', data),
  getReports: (params) => api.get('/agents/citizen-reports', { params }),
};

export const dashboardAPI = {
  getInsights: (params) => api.get('/agents/dashboard', { params }),
};

export const damageAPI = {
  assess: (data) => api.post('/agents/damage-assessment', data),
  getAssessments: (params) => api.get('/agents/damage-assessments', { params }),
};

export const healthAPI = {
  check: () => api.get('/health'),
};

export default api;
