export type JobStatus = 'applied' | 'interview' | 'offer' | 'rejected';

export interface Job {
  id: number;
  company: string;
  role: string;
  location: string;
  status: JobStatus;
  applied_date: string;
  follow_up_date: string | null;
  notes: string;
  job_url: string;
  salary: string;
  created_at: string;
  updated_at: string;
}

export type JobFormData = Omit<Job, 'id' | 'created_at' | 'updated_at'>;

export interface DashboardStats {
  total: number;
  by_status: Partial<Record<JobStatus, number>>;
  upcoming_followups: Job[];
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}