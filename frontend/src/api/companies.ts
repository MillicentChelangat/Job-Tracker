import api from './client';
import type { Company, CompanyFormData, PaginatedResponse } from '../types/job';

export const companiesApi = {
  getAll: (params?: { search?: string }) =>
    api.get<PaginatedResponse<Company>>('/companies/', { params }),

  getOne: (id: number) => api.get<Company>(`/companies/${id}/`),

  create: (data: CompanyFormData) => api.post<Company>('/companies/', data),

  update: (id: number, data: Partial<CompanyFormData>) =>
    api.patch<Company>(`/companies/${id}/`, data),

  delete: (id: number) => api.delete(`/companies/${id}/`),
};