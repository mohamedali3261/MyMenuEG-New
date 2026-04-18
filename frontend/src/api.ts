import axios from 'axios';
import { useStore } from './store/store';

// Create an Axios instance pointing to the backend API v1
export const api = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
});

// Add a request interceptor to add the auth token
api.interceptors.request.use((config) => {
  const token = useStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshPromise: Promise<string | null> | null = null;

const refreshAccessToken = async (): Promise<string | null> => {
  if (!refreshPromise) {
    refreshPromise = api
      .post('/auth/refresh')
      .then((response) => {
        const token = response.data?.token as string | undefined;
        const user = response.data?.user;
        if (token && user) {
          useStore.getState().setAuthSession(user, token);
          return token;
        }
        return null;
      })
      .catch(() => {
        useStore.getState().clearAuthSession();
        return null;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
};

// Add a response interceptor to refresh expired access tokens
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = (error.config || {}) as any;
    const status = error.response?.status;
    const url = String(originalRequest.url || '');

    if (status === 401 && !originalRequest._retry) {
      const skipRefresh =
        url.includes('/auth/login') ||
        url.includes('/auth/refresh') ||
        url.includes('/auth/logout');

      if (!skipRefresh) {
        originalRequest._retry = true;
        const token = await refreshAccessToken();
        if (token) {
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }
      }

      useStore.getState().clearAuthSession();
    }

    return Promise.reject(error);
  }
);
