import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { applicationsApi } from '../api/applications';
import { companiesApi } from '../api/companies';
import type { ApplicationFormData } from '../types/job';

// The form works with a plain company name string, same as before.
// We resolve that name to a real Company id behind the scenes on save.
type FormValues = Omit<ApplicationFormData, 'company'> & { company_name: string };

const defaultValues: FormValues = {
  company_name: '',
  position: '',
  status: 'applied',
  employment_type: '',
  work_mode: '',
  date_applied: new Date().toISOString().split('T')[0],
  deadline: null,
  follow_up_date: null,
  job_url: '',
  job_description: '',
  notes: '',
  salary: '',
};

export default function JobForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [resolveError, setResolveError] = useState('');

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    defaultValues,
  });

  const { data: application, isLoading } = useQuery({
    queryKey: ['application', id],
    queryFn: () => applicationsApi.getOne(Number(id)).then((r) => r.data),
    enabled: isEdit,
  });

  useEffect(() => {
    if (application) {
      reset({
        ...application,
        company_name: application.company_name,
        deadline: application.deadline ?? null,
        follow_up_date: application.follow_up_date ?? null,
      });
    }
  }, [application, reset]);

  // Finds a company by name (case-insensitive) among the user's own companies,
  // or creates a new one if none matches. Returns the company id either way.
  async function resolveCompanyId(name: string): Promise<number> {
    const trimmed = name.trim();
    const res = await companiesApi.getAll({ search: trimmed });
    const existing = res.data.results.find(
      (c) => c.name.toLowerCase() === trimmed.toLowerCase()
    );
    if (existing) return existing.id;

    const created = await companiesApi.create({
      name: trimmed,
      website: '',
      location: '',
      email: '',
      phone: '',
      industry: '',
      notes: '',
    });
    return created.data.id;
  }

  const mutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const { company_name, ...rest } = data;
      const companyId = await resolveCompanyId(company_name);
      const payload: ApplicationFormData = { ...rest, company: companyId };
      return isEdit ? applicationsApi.update(Number(id), payload) : applicationsApi.create(payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['applications'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
      navigate('/jobs');
    },
    onError: () => {
      setResolveError('Failed to save. Please check your inputs and try again.');
    },
  });

  if (isEdit && isLoading) return <div className="page-loading">Loading…</div>;

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1 className="page-title">{isEdit ? 'Edit Application' : 'Add Application'}</h1>
          <p className="page-subtitle">
            {isEdit ? `Editing ${application?.position} at ${application?.company_name}` : 'Track a new job application'}
          </p>
        </div>
        <button className="btn" onClick={() => navigate(-1)}>← Back</button>
      </header>

      <div className="card form-card">
        <form onSubmit={handleSubmit((data) => { setResolveError(''); mutation.mutate(data); })}>

          <div className="form-section">
            <h2 className="form-section-title">Job Details</h2>
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Company *</label>
                <input
                  {...register('company_name', { required: 'Company is required' })}
                  className={`form-input ${errors.company_name ? 'input-error' : ''}`}
                  placeholder="e.g. Acme Corp"
                />
                {errors.company_name && <p className="field-error">{errors.company_name.message}</p>}
              </div>

              <div className="form-group">
                <label className="form-label">Position *</label>
                <input
                  {...register('position', { required: 'Position is required' })}
                  className={`form-input ${errors.position ? 'input-error' : ''}`}
                  placeholder="e.g. Senior Engineer"
                />
                {errors.position && <p className="field-error">{errors.position.message}</p>}
              </div>

              <div className="form-group">
                <label className="form-label">Employment Type</label>
                <select {...register('employment_type')} className="form-select">
                  <option value="">—</option>
                  <option value="full_time">Full-time</option>
                  <option value="part_time">Part-time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Work Mode</label>
                <select {...register('work_mode')} className="form-select">
                  <option value="">—</option>
                  <option value="remote">Remote</option>
                  <option value="onsite">On-site</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Salary / Range</label>
                <input
                  {...register('salary')}
                  className="form-input"
                  placeholder="e.g. KES 200,000/mo"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Job URL</label>
                <input
                  {...register('job_url')}
                  type="url"
                  className="form-input"
                  placeholder="https://..."
                />
              </div>

              <div className="form-group">
                <label className="form-label">Status *</label>
                <select {...register('status')} className="form-select">
                  <option value="applied">Applied</option>
                  <option value="interview">Interview</option>
                  <option value="offer">Offer</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2 className="form-section-title">Dates</h2>
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Applied Date *</label>
                <input
                  {...register('date_applied', { required: 'Applied date is required' })}
                  type="date"
                  className={`form-input ${errors.date_applied ? 'input-error' : ''}`}
                />
                {errors.date_applied && <p className="field-error">{errors.date_applied.message}</p>}
              </div>

              <div className="form-group">
                <label className="form-label">Deadline</label>
                <input {...register('deadline')} type="date" className="form-input" />
              </div>

              <div className="form-group">
                <label className="form-label">Follow-up Date</label>
                <input {...register('follow_up_date')} type="date" className="form-input" />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2 className="form-section-title">Job Description</h2>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                {...register('job_description')}
                className="form-textarea"
                rows={5}
                placeholder="Paste the job posting text here…"
              />
            </div>
          </div>

          <div className="form-section">
            <h2 className="form-section-title">Notes</h2>
            <div className="form-group">
              <label className="form-label">Notes & Reminders</label>
              <textarea
                {...register('notes')}
                className="form-textarea"
                rows={5}
                placeholder="Interview prep notes, recruiter contacts, key requirements…"
              />
            </div>
          </div>

          {(mutation.isError || resolveError) && (
            <div className="form-error-banner">
              {resolveError || 'Failed to save. Please check your inputs and try again.'}
            </div>
          )}

          <div className="form-actions">
            <button type="button" className="btn" onClick={() => navigate(-1)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting || mutation.isPending}>
              {mutation.isPending ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}