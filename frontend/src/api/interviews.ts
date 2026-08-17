import api from './client';
import type { Interview, InterviewFormData, PaginatedResponse } from '../types/job';

export const interviewsApi = {
  getAll: (params?: { application?: number }) =>
    api.get<PaginatedResponse<Interview>>('/interviews/', { params }),

  create: (data: InterviewFormData) => api.post<Interview>('/interviews/', data),

  update: (id: number, data: Partial<InterviewFormData>) =>
    api.patch<Interview>(`/interviews/${id}/`, data),

  delete: (id: number) => api.delete(`/interviews/${id}/`),
};