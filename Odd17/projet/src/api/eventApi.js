import api from './axios';

export const getStats = async () => {
  const response = await api.get('/stats');
  return response.data;
};

export const getIndicators = async () => {
  const response = await api.get('/indicators');
  return response.data;
};

export const getCategories = async () => {
  const response = await api.get('/categories');
  return response.data;
};

export const getCities = async () => {
  const response = await api.get('/cities');
  return response.data;
};

export const getEvents = async (params = {}) => {
  const response = await api.get('/events', { params });
  return response.data;
};

export const getEvent = async (idOrSlug) => {
  const response = await api.get(`/events/${idOrSlug}`);
  return response.data;
};

export const createEvent = async (eventData) => {
  const response = await api.post('/events', eventData);
  return response.data;
};

export const updateEvent = async (id, eventData) => {
  const response = await api.put(`/events/${id}`, eventData);
  return response.data;
};

export const deleteEvent = async (id) => {
  const response = await api.delete(`/events/${id}`);
  return response.data;
};

export const participateInEvent = async (eventId, data) => {
  const response = await api.post(`/events/${eventId}/participate`, data);
  return response.data;
};

export const proposePartnership = async (eventId, data) => {
  const response = await api.post(`/events/${eventId}/partnerships`, data);
  return response.data;
};

export const sendContactMessage = async (data) => {
  const response = await api.post('/contact', data);
  return response.data;
};

export const getDashboard = async () => {
  const response = await api.get('/dashboard');
  return response.data;
};

export const updateParticipationStatus = async (id, status) => {
  const response = await api.patch(`/participations/${id}/status`, { status });
  return response.data;
};

export const deleteParticipation = async (id) => {
  const response = await api.delete(`/participations/${id}`);
  return response.data;
};

export const updatePartnershipStatus = async (id, status) => {
  const response = await api.patch(`/partnerships/${id}/status`, { status });
  return response.data;
};

export const deletePartnership = async (id) => {
  const response = await api.delete(`/partnerships/${id}`);
  return response.data;
};

export const getUsers = async () => {
  const response = await api.get('/users');
  return response.data;
};

export const updateUserStatus = async (id, status) => {
  const response = await api.patch(`/users/${id}/status`, { status });
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await api.delete(`/users/${id}`);
  return response.data;
};
