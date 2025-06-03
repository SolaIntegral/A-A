import axios from 'axios';

const API_URL = 'http://localhost:8000/api/v1';

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const login = async (email, password) => {
  try {
    const response = await axiosInstance.post('/auth/jwt/create/', {
      email,
      password,
    });
    if (response.data.access) {
      localStorage.setItem('token', response.data.access);
      localStorage.setItem('refresh', response.data.refresh);
      axiosInstance.defaults.headers.common['Authorization'] = `JWT ${response.data.access}`;
    }
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const register = async (email, username, password, re_password) => {
  try {
    const response = await axiosInstance.post('/auth/users/', {
      email,
      username,
      password,
      re_password,
    });
    return response.data;
  } catch (error) {
    console.error('Register error:', error);
    throw error;
  }
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refresh');
  delete axiosInstance.defaults.headers.common['Authorization'];
};

export const getCurrentUser = async () => {
  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    axiosInstance.defaults.headers.common['Authorization'] = `JWT ${token}`;
    const response = await axiosInstance.get('/auth/users/me/');
    return response.data;
  } catch (error) {
    console.error('Get current user error:', error);
    logout();
    return null;
  }
}; 