import axios from 'axios';
import type { Job, JobFormData, DashboardStats, PaginatedResponse } from '../types/job';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refresh = localStorage.getItem('refresh_token');
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/auth/token/refresh/`,
          { refresh }
        );
        localStorage.setItem('access_token', data.access);
        original.headers.Authorization = `Bearer ${data.access}`;
        return api(original);
      } catch {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export const jobsApi = {
  getAll: (params?: { search?: string; status?: string; ordering?: string; page?: number }) =>
    api.get<PaginatedResponse<Job>>('/jobs/', { params }),

  getOne: (id: number) => api.get<Job>(`/jobs/${id}/`),

  create: (data: JobFormData) => api.post<Job>('/jobs/', data),

  update: (id: number, data: Partial<JobFormData>) => api.patch<Job>(`/jobs/${id}/`, data),

  delete: (id: number) => api.delete(`/jobs/${id}/`),

  getStats: () => api.get<DashboardStats>('/jobs/stats/'),
};

export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ access: string; refresh: string }>('/auth/token/', {
      username: email,  // Django JWT expects username
      password,
    }),

  register: (email: string, password: string, confirm_password: string) =>
    api.post('/auth/register/', { email, password }),  // confirm_password validated frontend-side only

  me: () => {
    const token = localStorage.getItem('access_token');
    return api.get('/auth/me/', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};

export default api;