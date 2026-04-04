import axios from 'axios';

// Create an Axios instance pointing to the backend API
export const api = axios.create({
  baseURL: '/api',
});
