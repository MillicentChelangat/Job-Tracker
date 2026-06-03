import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jobsApi } from '../api/jobs';
import StatusBadge from '../components/StatusBadge';
import type { JobStatus } from '../types/job';

const STATUSES: { value: string; label: string }[] = [
  { value: '', label: 'All Statuses' },
  { value: 'applied', label: 'Applied' },
  { value: 'interview', label: 'Interview' },
  { value: 'offer', label: 'Offer' },
  { value: 'rejected', label: 'Rejected' },
];

export default function JobList() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [ordering, setOrdering] = useState('-created_at');
  const [page, setPage] = useState(1);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['jobs', { search, status, ordering, page }],
    queryFn: async () => {
  const res = await jobsApi.getAll({ search, status, ordering, page });
  const raw = res.data;
  // handles plain array OR paginated { count, results }
  if (Array.isArray(raw)) {
    return { count: raw.length, results: raw };
  }
  return raw;
},
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => jobsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['jobs'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
      setConfirmDelete(null);
    },
  });

  const jobs = data?.results ?? [];
  const totalPages = data ? Math.ceil(data.count / 20) : 1;

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Applications</h1>
          <p className="page-subtitle">{data?.count ?? 0} total applications</p>
        </div>
        <Link to="/jobs/new" className="btn btn-primary">+ Add Application</Link>
      </header>

      {/* Filters */}
      <div className="filters-bar">
        <input
          className="search-input"
          type="search"
          placeholder="Search company, role, location…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
        <select className="filter-select" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
          {STATUSES.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <select className="filter-select" value={ordering} onChange={(e) => setOrdering(e.target.value)}>
          <option value="-created_at">Newest first</option>
          <option value="created_at">Oldest first</option>
          <option value="-applied_date">Applied date ↓</option>
          <option value="applied_date">Applied date ↑</option>
          <option value="status">Status</option>
        </select>
      </div>

      {/* Table */}
      <div className="card table-card">
        {isLoading ? (
          <div className="page-loading">Loading…</div>
        ) : jobs.length === 0 ? (
          <div className="empty-state-full">
            <p>No applications found.</p>
            <Link to="/jobs/new" className="btn btn-primary" style={{ marginTop: '1rem' }}>Add your first application</Link>
          </div>
        ) : (
          <table className="jobs-table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Role</th>
                <th>Location</th>
                <th>Status</th>
                <th>Applied</th>
                <th>Follow-up</th>
                <th>Salary</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job.id}>
                  <td>
                    <div className="table-company">
                      <div className="company-avatar sm">{job.company[0]}</div>
                      <span>{job.company}</span>
                    </div>
                  </td>
                  <td className="role-cell">{job.role}</td>
                  <td className="muted-cell">{job.location || '—'}</td>
                  <td><StatusBadge status={job.status as JobStatus} /></td>
                  <td className="muted-cell">{job.applied_date}</td>
                  <td className="muted-cell">{job.follow_up_date || '—'}</td>
                  <td className="muted-cell">{job.salary || '—'}</td>
                  <td>
                    <div className="action-btns">
                      <Link to={`/jobs/${job.id}/edit`} className="btn btn-sm">Edit</Link>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => setConfirmDelete(job.id)}
                      >Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button className="btn btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
          <span className="page-indicator">Page {page} of {totalPages}</span>
          <button className="btn btn-sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next →</button>
        </div>
      )}

      {/* Delete confirmation modal */}
      {confirmDelete !== null && (
        <div className="modal-backdrop" onClick={() => setConfirmDelete(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Delete Application?</h3>
            <p>This action cannot be undone.</p>
            <div className="modal-actions">
              <button className="btn" onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button
                className="btn btn-danger"
                disabled={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate(confirmDelete)}
              >
                {deleteMutation.isPending ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}