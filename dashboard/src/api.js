import axios from 'axios';

// Ensure this matches the Flask port
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const fetchEmployees = async () => {
  const res = await api.get('/employees');
  return res.data;
};

export const fetchEmployeeReport = async (empId, date) => {
  const query = date ? `?date=${date}` : '';
  const res = await api.get(`/employee/${empId}/report${query}`);
  return res.data;
};

export const fetchEmployeeGoals = async (empId, date) => {
  const query = date ? `?date=${date}` : '';
  const res = await api.get(`/employee/${empId}/goals${query}`);
  return res.data;
};

export const completeGoal = async (empId, goalId, date) => {
  const query = date ? `?date=${date}` : '';
  const res = await api.post(`/employee/${empId}/goals/${goalId}/complete${query}`);
  return res.data;
};

export const assignGoal = async (empId, goalData, date) => {
  const query = date ? `?date=${date}` : '';
  const res = await api.post(`/employee/${empId}/goals${query}`, goalData);
  return res.data;
};

export const fetchEmployeeBreaks = async (empId, date) => {
  const query = date ? `?date=${date}` : '';
  const res = await api.get(`/employee/${empId}/breaks${query}`);
  return res.data;
};

export const startBreak = async (empId, date) => {
  const query = date ? `?date=${date}` : '';
  const res = await api.post(`/employee/${empId}/breaks/start${query}`);
  return res.data;
};

export const endBreak = async (empId, date) => {
  const query = date ? `?date=${date}` : '';
  const res = await api.post(`/employee/${empId}/breaks/end${query}`);
  return res.data;
};

export const fetchBurnout = async (empId, role, date) => {
  const dQuery = date ? `&date=${date}` : '';
  const res = await api.get(`/employee/${empId}/burnout?role=${role}${dQuery}`);
  return res.data;
};

export const fetchTeamProgress = async (date) => {
  const query = date ? `?date=${date}` : '';
  const res = await api.get(`/team/progress${query}`);
  return res.data;
};

export const fetchEmployeeHistory = async (empId, date) => {
  const query = date ? `?date=${date}` : '';
  const res = await api.get(`/employee/${empId}/history${query}`);
  return res.data;
};

export const fetchTeamHistory = async (date) => {
  const query = date ? `?date=${date}` : '';
  const res = await api.get(`/team/history${query}`);
  return res.data;
};

export default api;
