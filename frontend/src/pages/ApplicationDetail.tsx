import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { applicationsApi } from '../api/applications';
import { interviewsApi } from '../api/interviews';
import StatusBadge from '../components/StatusBadge';
import type { InterviewFormData, InterviewType, InterviewResult } from '../types/job';

const emptyInterviewForm: InterviewFormData = {
  application: 0,
  interview_date: new Date().toISOString().split('T')[0],
  interview_time: null,
  interview_type: 'phone',
  location: '',
  interviewer: '',
  notes: '',
  result: 'pending',
};

export default function ApplicationDetail() {
  const { id } = useParams<{ id: string }>();
  const applicationId = Number(id);
  const qc = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<InterviewFormData>({ ...emptyInterviewForm, application: applicationId });

  const { data: application, isLoading } = useQuery({
    queryKey: ['application', id],
    queryFn: () => applicationsApi.getOne(applicationId).then((r) => r.data),
  });

  const { data: interviews } = useQuery({
    queryKey: ['interviews', applicationId],
    queryFn: () => interviewsApi.getAll({ application: applicationId }).then((r) => r.data.results),
  });

  const saveMutation = useMutation({
    mutationFn: (data: InterviewFormData) =>
      editingId ? interviewsApi.update(editingId, data) : interviewsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['interviews', applicationId] });
      setShowForm(false);
      setEditingId(null);
      setForm({ ...emptyInterviewForm, application: applicationId });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (interviewId: number) => interviewsApi.delete(interviewId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['interviews', applicationId] }),
  });

  const startEdit = (interview: typeof form & { id?: number }) => {
    setForm(interview);
    setEditingId((interview as any).id);
    setShowForm(true);
  };

  const startAdd = () => {
    setForm({ ...emptyInterviewForm, application: applicationId });
    setEditingId(null);
    setShowForm(true);
  };

  if (isLoading || !application) return <div className="page-loading">Loading…</div>;

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1 className="page-title">{application.position}</h1>
          <p className="page-subtitle">{application.company_name}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Link to={`/jobs/${application.id}/edit`} className="btn">Edit</Link>
          <Link to="/jobs" className="btn">← Back</Link>
        </div>
      </header>

      {/* Application summary */}
      <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div className="form-grid-2">
          <div><strong>Status:</strong> <StatusBadge status={application.status} /></div>
          <div><strong>Work Mode:</strong> {application.work_mode || '—'}</div>
          <div><strong>Applied:</strong> {application.date_applied}</div>
          <div><strong>Deadline:</strong> {application.deadline || '—'}</div>
          <div><strong>Salary:</strong> {application.salary || '—'}</div>
          <div><strong>Job URL:</strong> {application.job_url ? <a href={application.job_url} target="_blank" rel="noreferrer">Link</a> : '—'}</div>
        </div>
        {application.notes && (
          <div style={{ marginTop: '1rem' }}>
            <strong>Notes:</strong>
            <p style={{ marginTop: '0.25rem' }}>{application.notes}</p>
          </div>
        )}
      </div>

      {/* Interviews section */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 className="form-section-title" style={{ margin: 0 }}>Interviews</h2>
          {!showForm && (
            <button className="btn btn-primary btn-sm" onClick={startAdd}>+ Add Interview</button>
          )}
        </div>

        {!interviews?.length && !showForm && (
          <p className="empty-state">No interviews scheduled yet.</p>
        )}

        {interviews && interviews.length > 0 && (
          <ul style={{ listStyle: 'none', padding: 0, marginBottom: showForm ? '1rem' : 0 }}>
            {interviews.map((iv) => (
              <li key={iv.id} className="recent-dash-item" style={{ padding: '0.75rem 0', borderBottom: '1px solid #eee' }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600, marginBottom: '2px' }}>
                    {iv.interview_type.charAt(0).toUpperCase() + iv.interview_type.slice(1)} — {iv.interview_date}
                    {iv.interview_time ? ` at ${iv.interview_time}` : ''}
                  </p>
                  <p className="muted-cell" style={{ fontSize: '13px' }}>
                    {iv.interviewer || '—'} {iv.location ? `· ${iv.location}` : ''} · Result: {iv.result}
                  </p>
                </div>
                <div className="action-btns">
                  <button className="btn btn-sm" onClick={() => startEdit(iv)}>Edit</button>
                  <button className="btn btn-sm btn-danger" onClick={() => deleteMutation.mutate(iv.id)}>Delete</button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {showForm && (
          <form
            onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(form); }}
            style={{ borderTop: interviews?.length ? '1px solid #eee' : 'none', paddingTop: interviews?.length ? '1rem' : 0 }}
          >
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Interview Type</label>
                <select
                  className="form-select"
                  value={form.interview_type}
                  onChange={(e) => setForm({ ...form, interview_type: e.target.value as InterviewType })}
                >
                  <option value="phone">Phone Screen</option>
                  <option value="technical">Technical</option>
                  <option value="behavioral">Behavioral</option>
                  <option value="panel">Panel</option>
                  <option value="final">Final Round</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Result</label>
                <select
                  className="form-select"
                  value={form.result}
                  onChange={(e) => setForm({ ...form, result: e.target.value as InterviewResult })}
                >
                  <option value="pending">Pending</option>
                  <option value="passed">Passed</option>
                  <option value="failed">Failed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={form.interview_date}
                  onChange={(e) => setForm({ ...form, interview_date: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Time</label>
                <input
                  type="time"
                  className="form-input"
                  value={form.interview_time ?? ''}
                  onChange={(e) => setForm({ ...form, interview_time: e.target.value || null })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Interviewer</label>
                <input
                  className="form-input"
                  value={form.interviewer}
                  onChange={(e) => setForm({ ...form, interviewer: e.target.value })}
                  placeholder="e.g. Jane, HR Manager"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Location / Link</label>
                <input
                  className="form-input"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="e.g. Zoom link, office address"
                />
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '0.75rem' }}>
              <label className="form-label">Notes</label>
              <textarea
                className="form-textarea"
                rows={3}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Prep notes, questions asked, how it went…"
              />
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn"
                onClick={() => { setShowForm(false); setEditingId(null); }}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? 'Saving…' : editingId ? 'Save Changes' : 'Add Interview'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}