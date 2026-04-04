import axios from 'axios';
import { useStore } from './store/store';

// Create an Axios instance pointing to the backend API
export const api = axios.create({
  baseURL: '/api',
});

// Add a request interceptor to add the auth token
api.interceptors.request.use((config) => {
  const token = useStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
