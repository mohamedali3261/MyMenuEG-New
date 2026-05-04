import axios from 'axios';
import { useStore } from './store/store';

// Create an Axios instance pointing to the backend API v1
export const api = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
});

// Customer API paths that use customerToken instead of admin token
const CUSTOMER_PATHS = [
  '/customer-data/',
  '/customers/me',
  '/orders/my-orders',
  '/customers/me/notifications',
  '/notifications/customer',
  '/notifications/read'
];

// Add a request interceptor to add the correct auth token automatically
api.interceptors.request.use((config) => {
  const url = String(config.url || '');
  const isCustomerUrl = CUSTOMER_PATHS.some(p => url.includes(p));

  if (isCustomerUrl) {
    const customerToken = useStore.getState().customerToken;
    if (customerToken) {
      config.headers.Authorization = `Bearer ${customerToken}`;
    }
  } else {
    const token = useStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

let refreshPromise: Promise<string | null> | null = null;
let customerRefreshPromise: Promise<string | null> | null = null;

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

const refreshCustomerToken = async (): Promise<string | null> => {
  if (!customerRefreshPromise) {
    const oldToken = useStore.getState().customerToken;
    customerRefreshPromise = api
      .post('/auth/customer/refresh', {}, { headers: { Authorization: `Bearer ${oldToken}` } })
      .then((response) => {
        const token = response.data?.token as string | undefined;
        const customer = response.data?.customer;
        if (token && customer) {
          useStore.getState().setCustomer(customer, token);
          return token;
        }
        return null;
      })
      .catch(() => {
        useStore.getState().setCustomer(null, null);
        return null;
      })
      .finally(() => {
        customerRefreshPromise = null;
      });
  }
  return customerRefreshPromise;
};

// Add a response interceptor to refresh expired access tokens
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = (error.config || {}) as any;
    const status = error.response?.status;
    const url = String(originalRequest.url || '');

    if (status === 403 && error.response?.data?.error?.includes('معطل')) {
      useStore.getState().logoutCustomer();
      window.location.href = '/login';
      return Promise.reject(error);
    }

    if (status === 401 && !originalRequest._retry) {
      const isCustomerUrl =
        url.includes('/customer-data/') ||
        url.includes('/customers/') ||
        url.includes('/orders/my-orders') ||
        url.includes('/notifications/customer') ||
        url.includes('/notifications/read');
      const skipRefresh =
        url.includes('/auth/login') ||
        url.includes('/auth/register') ||
        url.includes('/auth/refresh') ||
        url.includes('/auth/customer/refresh') ||
        url.includes('/auth/logout');

      if (!skipRefresh) {
        originalRequest._retry = true;

        if (isCustomerUrl) {
          // Try to refresh customer token first
          const newToken = await refreshCustomerToken();
          if (newToken) {
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return api(originalRequest);
          }
        } else {
          // Try to refresh admin token
          const token = await refreshAccessToken();
          if (token) {
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          }
        }
      }

      // Refresh failed - clear appropriate session
      if (isCustomerUrl) {
        useStore.getState().setCustomer(null, null);
      } else {
        useStore.getState().clearAuthSession();
      }
    }

    return Promise.reject(error);
  }
);
