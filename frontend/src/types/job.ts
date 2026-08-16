export type ApplicationStatus = 'applied' | 'interview' | 'offer' | 'rejected';
export type EmploymentType = 'full_time' | 'part_time' | 'contract' | 'internship' | '';
export type WorkMode = 'remote' | 'onsite' | 'hybrid' | '';

export interface Company {
  id: number;
  name: string;
  website: string;
  location: string;
  email: string;
  phone: string;
  industry: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export type CompanyFormData = Omit<Company, 'id' | 'created_at' | 'updated_at'>;

export interface Application {
  id: number;
  company: number;          // company id — this is what gets sent to the backend
  company_name: string;     // read-only, comes from the serializer for display
  position: string;
  status: ApplicationStatus;
  employment_type: EmploymentType;
  work_mode: WorkMode;
  date_applied: string;
  deadline: string | null;
  follow_up_date: string | null;
  job_url: string;
  job_description: string;
  salary: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export type ApplicationFormData = Omit<Application, 'id' | 'company_name' | 'created_at' | 'updated_at'>;

export interface DashboardStats {
  total: number;
  by_status: Partial<Record<ApplicationStatus, number>>;
  upcoming_followups: Application[];
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export type DocumentType = 'resume' | 'cover_letter';
export type ParseStatus = 'pending' | 'parsed' | 'failed';

export interface Document {
  id: number;
  application: number | null;
  document_type: DocumentType;
  file: string;          // URL to the stored file
  file_name: string;
  parse_status: ParseStatus;
  parsed_at: string | null;
  uploaded_at: string;
}