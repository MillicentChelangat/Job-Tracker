import api from './client';
import type { Profile, ProfileFormData } from '../types/job';

export const profileApi = {
  get: () => api.get<Profile>('/profile/'),
  update: (data: Partial<ProfileFormData>) => api.patch<Profile>('/profile/', data),
};