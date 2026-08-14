import api from './client';
import type { Application, ApplicationFormData, DashboardStats, PaginatedResponse } from '../types/job';

export const applicationsApi = {
  getAll: (params?: { search?: string; status?: string; ordering?: string; page?: number }) =>
    api.get<PaginatedResponse<Application>>('/applications/', { params }),

  getOne: (id: number) => api.get<Application>(`/applications/${id}/`),

  create: (data: ApplicationFormData) => api.post<Application>('/applications/', data),

  update: (id: number, data: Partial<ApplicationFormData>) =>
    api.patch<Application>(`/applications/${id}/`, data),

  delete: (id: number) => api.delete(`/applications/${id}/`),

  getStats: () => api.get<DashboardStats>('/applications/stats/'),
};