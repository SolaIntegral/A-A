import axios from 'axios';

const API_URL = 'http://localhost:8000/api/v1';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `JWT ${token}` } : {};
};

export const getTasks = async () => {
  const response = await axios.get(`${API_URL}/tasks/`, {
    headers: getAuthHeader(),
  });
  return response.data;
};

export const getTask = async (id) => {
  const response = await axios.get(`${API_URL}/tasks/${id}/`, {
    headers: getAuthHeader(),
  });
  return response.data;
};

export const createTask = async (taskData) => {
  const response = await axios.post(`${API_URL}/tasks/`, taskData, {
    headers: getAuthHeader(),
  });
  return response.data;
};

export const updateTask = async (id, taskData) => {
  const response = await axios.patch(`${API_URL}/tasks/${id}/`, taskData, {
    headers: getAuthHeader(),
  });
  return response.data;
};

export const deleteTask = async (id) => {
  const response = await axios.delete(`${API_URL}/tasks/${id}/`, {
    headers: getAuthHeader(),
  });
  return response.data;
};

export const completeTask = async (id) => {
  const response = await axios.post(`${API_URL}/tasks/${id}/complete/`, {}, {
    headers: getAuthHeader(),
  });
  return response.data;
};

export const snoozeTask = async (id, reason) => {
  const response = await axios.post(`${API_URL}/tasks/${id}/snooze/`, { reason }, {
    headers: getAuthHeader(),
  });
  return response.data;
};

export const getDashboardTasks = async () => {
  const response = await axios.get(`${API_URL}/tasks/?is_daily_top=true`, {
    headers: getAuthHeader(),
  });
  return response.data;
}; 