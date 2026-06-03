import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jobsApi } from '../api/jobs';
import type { JobFormData } from '../types/job';

const defaultValues: JobFormData = {
  company: '',
  role: '',
  location: '',
  status: 'applied',
  applied_date: new Date().toISOString().split('T')[0],
  follow_up_date: null,
  notes: '',
  job_url: '',
  salary: '',
};

export default function JobForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<JobFormData>({
    defaultValues,
  });

  const { data: job, isLoading } = useQuery({
    queryKey: ['job', id],
    queryFn: () => jobsApi.getOne(Number(id)).then((r) => r.data),
    enabled: isEdit,
  });

  useEffect(() => {
    if (job) reset({ ...job, follow_up_date: job.follow_up_date ?? null });
  }, [job, reset]);

  const mutation = useMutation({
    mutationFn: (data: JobFormData) =>
      isEdit ? jobsApi.update(Number(id), data) : jobsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['jobs'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
      navigate('/jobs');
    },
  });

  if (isEdit && isLoading) return <div className="page-loading">Loading…</div>;

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1 className="page-title">{isEdit ? 'Edit Application' : 'Add Application'}</h1>
          <p className="page-subtitle">{isEdit ? `Editing ${job?.role} at ${job?.company}` : 'Track a new job application'}</p>
        </div>
        <button className="btn" onClick={() => navigate(-1)}>← Back</button>
      </header>

      <div className="card form-card">
        <form onSubmit={handleSubmit((data) => mutation.mutate(data))}>

          <div className="form-section">
            <h2 className="form-section-title">Job Details</h2>
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Company *</label>
                <input
                  {...register('company', { required: 'Company is required' })}
                  className={`form-input ${errors.company ? 'input-error' : ''}`}
                  placeholder="e.g. Acme Corp"
                />
                {errors.company && <p className="field-error">{errors.company.message}</p>}
              </div>

              <div className="form-group">
                <label className="form-label">Role *</label>
                <input
                  {...register('role', { required: 'Role is required' })}
                  className={`form-input ${errors.role ? 'input-error' : ''}`}
                  placeholder="e.g. Senior Engineer"
                />
                {errors.role && <p className="field-error">{errors.role.message}</p>}
              </div>

              <div className="form-group">
                <label className="form-label">Location</label>
                <input
                  {...register('location')}
                  className="form-input"
                  placeholder="e.g. Nairobi, Remote"
                />
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
                  {...register('applied_date', { required: 'Applied date is required' })}
                  type="date"
                  className={`form-input ${errors.applied_date ? 'input-error' : ''}`}
                />
                {errors.applied_date && <p className="field-error">{errors.applied_date.message}</p>}
              </div>

              <div className="form-group">
                <label className="form-label">Follow-up Date</label>
                <input
                  {...register('follow_up_date')}
                  type="date"
                  className="form-input"
                />
              </div>
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

          {mutation.isError && (
            <div className="form-error-banner">
              Failed to save. Please check your inputs and try again.
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