import api from './axios';

export const pingApi = async () => {
  const response = await api.get('/ping');
  return response.data;
};

export const loginApi = async (credentials) => {
  const response = await api.post('/login', credentials);
  return response.data;
};

export const registerApi = async (userData) => {
  const response = await api.post('/register', userData);
  return response.data;
};

export const logoutApi = async () => {
  const response = await api.post('/logout');
  return response.data;
};

export const getUserApi = async () => {
  const response = await api.get('/user');
  return response.data;
};

export const forgotPasswordApi = async (email) => {
  const response = await api.post('/forgot-password', { email });
  return response.data;
};
