import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

const http: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor to log API responses
http.interceptors.response.use(
  (response) => {
    console.log(`API Response [${response.config.method?.toUpperCase()} ${response.config.url}]:`, {
      status: response.status,
      data: response.data,
      dataType: typeof response.data,
      isArray: Array.isArray(response.data),
      dataKeys: response.data && typeof response.data === 'object' ? Object.keys(response.data) : 'N/A',
      headers: response.headers
    });
    
    // Extra logging for list endpoints
    if (response.config.url?.includes('/api/products?') || response.config.url?.includes('/api/categories?')) {
      console.log('📦 LIST RESPONSE DATA:', JSON.stringify(response.data, null, 2));
    }
    
    return response;
  },
  (error) => {
    console.error(`API Error [${error.config?.method?.toUpperCase()} ${error.config?.url}]:`, {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
    return Promise.reject(error);
  }
);

export const get = async <T = any>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> => {
  const response = await http.get<T>(url, config);
  return response.data;
};

export const post = async <T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<T> => {
  const response = await http.post<T>(url, data, config);
  return response.data;
};

export const put = async <T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<T> => {
  const response = await http.put<T>(url, data, config);
  return response.data;
};

export const patch = async <T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<T> => {
  const response = await http.patch<T>(url, data, config);
  return response.data;
};

export const del = async <T = any>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> => {
  const response = await http.delete<T>(url, config);
  return response.data;
};

export default http;