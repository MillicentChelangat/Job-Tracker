import api from './client';
import type { Document, DocumentType, PaginatedResponse } from '../types/job';

export const documentsApi = {
  getAll: (params?: { application?: number }) =>
    api.get<PaginatedResponse<Document>>('/documents/', { params }),

  upload: (file: File, documentType: DocumentType, applicationId?: number) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('document_type', documentType);
    if (applicationId) formData.append('application', String(applicationId));

    return api.post<Document>('/documents/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  delete: (id: number) => api.delete(`/documents/${id}/`),
    parse: (id: number, force = false) =>
    api.post<Document>(`/documents/${id}/parse/`, {}, { params: force ? { force: 'true' } : {} }),
};