import axios from 'axios';
import { getUserId } from '@/utils/userSession';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  timeout: 5000,
});

api.interceptors.request.use((config) => {
  config.headers['user-id'] = getUserId();
  return config;
});

export default api;
