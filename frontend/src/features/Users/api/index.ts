import axios from 'axios';

const API_URL = 'http://localhost:3000/users'; 

export const userApi = {
  getAll: async () => {
    const res = await axios.get(API_URL);
    return res.data;
  },

  getById: async (id) => {
    const res = await axios.get(`${API_URL}/${id}`);
    return res.data;
  },

  create: async (userData) => {
    const res = await axios.post(API_URL, userData);
    return res.data;
  },

  update: async (id, userData) => {
    const res = await axios.patch(`${API_URL}/${id}`, userData);
    return res.data;
  },

  delete: async (id) => {
    const res = await axios.delete(`${API_URL}/${id}`);
    return res.data;
  },
};