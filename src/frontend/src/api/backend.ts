// src/api/axios.ts
import axios from 'axios';

const baseURL = import.meta.env.VITE_BACKEND_BASE_URL || 'http://localhost:8000';

export const backendApi = axios.create({
  baseURL: `${baseURL}`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});
