import axios from 'axios';

const API_URL = 'http://localhost:8000/api/v1';

export const login = async (email, password) => {
  const response = await axios.post(`${API_URL}/auth/jwt/create/`, {
    email,
    password,
  });
  if (response.data.access) {
    localStorage.setItem('token', response.data.access);
    localStorage.setItem('refresh', response.data.refresh);
  }
  return response.data;
};

export const register = async (email, username, password, re_password) => {
  const response = await axios.post(`${API_URL}/auth/users/`, {
    email,
    username,
    password,
    re_password,
  });
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refresh');
};

export const getCurrentUser = async () => {
  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    const response = await axios.get(`${API_URL}/auth/users/me/`, {
      headers: {
        Authorization: `JWT ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    logout();
    return null;
  }
}; 