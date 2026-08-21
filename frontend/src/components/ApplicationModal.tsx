import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { applicationsApi } from '../api/applications';
import { companiesApi } from '../api/companies';
import type { ApplicationFormData } from '../types/job';

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

export default function ApplicationModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState<FormValues>(defaultValues);
  const [error, setError] = useState('');

  async function resolveCompanyId(name: string): Promise<number> {
    const trimmed = name.trim();
    const res = await companiesApi.getAll({ search: trimmed });
    const existing = res.data.results.find((c) => c.name.toLowerCase() === trimmed.toLowerCase());
    if (existing) return existing.id;
    const created = await companiesApi.create({
      name: trimmed, website: '', location: '', email: '', phone: '', industry: '', notes: '',
    });
    return created.data.id;
  }

  const mutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const { company_name, ...rest } = data;
      const companyId = await resolveCompanyId(company_name);
      return applicationsApi.create({ ...rest, company: companyId });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['applications'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
      onClose();
    },
    onError: () => setError('Failed to save. Please check your inputs and try again.'),
  });

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0 }}>Add Application</h3>
          <button className="btn btn-sm" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); setError(''); mutation.mutate(form); }}>
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Company *</label>
              <input
                className="form-input"
                required
                value={form.company_name}
                onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                placeholder="e.g. Acme Corp"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Position *</label>
              <input
                className="form-input"
                required
                value={form.position}
                onChange={(e) => setForm({ ...form, position: e.target.value })}
                placeholder="e.g. Senior Engineer"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Work Mode / Location</label>
              <input
                className="form-input"
                value={form.work_mode}
                onChange={(e) => setForm({ ...form, work_mode: e.target.value as any })}
                placeholder="Remote / San Francisco"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Salary</label>
              <input
                className="form-input"
                value={form.salary}
                onChange={(e) => setForm({ ...form, salary: e.target.value })}
                placeholder="$120k - $150k"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Job posting URL</label>
              <input
                className="form-input"
                value={form.job_url}
                onChange={(e) => setForm({ ...form, job_url: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div className="form-group">
              <label className="form-label">Applied Date *</label>
              <input
                type="date"
                className="form-input"
                required
                value={form.date_applied}
                onChange={(e) => setForm({ ...form, date_applied: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '0.75rem' }}>
            <label className="form-label">Job Description</label>
            <textarea
              className="form-textarea"
              rows={4}
              value={form.job_description}
              onChange={(e) => setForm({ ...form, job_description: e.target.value })}
              placeholder="Paste the job description here..."
            />
          </div>

          <div className="form-group" style={{ marginTop: '0.75rem' }}>
            <label className="form-label">Notes</label>
            <textarea
              className="form-textarea"
              rows={2}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Any notes about this application..."
            />
          </div>

          {error && <div className="form-error-banner">{error}</div>}

          <div className="modal-actions" style={{ marginTop: '1rem' }}>
            <button type="button" className="btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={mutation.isPending}>
              {mutation.isPending ? 'Adding…' : 'Add Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}