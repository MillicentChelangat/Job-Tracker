import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { applicationsApi } from '../api/applications';
import StatusBadge from '../components/StatusBadge';
import type { ApplicationStatus } from '../types/job';
import ApplicationModal from '../components/ApplicationModal';


const STATUSES: { value: string; label: string; color?: string }[] = [
  { value: '', label: 'All' },
  { value: 'wishlist', label: 'Wishlist', color: '#9CA3AF' },
  { value: 'applied', label: 'Applied', color: '#7C3AED' },
  { value: 'interview', label: 'Interview', color: '#EF9F27' },
  { value: 'offer', label: 'Offer', color: '#639922' },
  { value: 'rejected', label: 'Rejected', color: '#E24B4A' },
];

export default function JobList() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [ordering, setOrdering] = useState('-created_at');
  const [page, setPage] = useState(1);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['applications', { search, status, ordering, page }],
    queryFn: async () => {
      const res = await applicationsApi.getAll({ search, status, ordering, page });
      const raw = res.data;
      if (Array.isArray(raw)) {
        return { count: raw.length, results: raw };
      }
      return raw;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => applicationsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['applications'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
      setConfirmDelete(null);
    },
  });

  const applications = data?.results ?? [];
  const totalPages = data ? Math.ceil(data.count / 20) : 1;

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Applications</h1>
          <p className="page-subtitle">{data?.count ?? 0} total applications</p>
        </div>
        {showModal && <ApplicationModal onClose={() => setShowModal(false)} />}
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add Application</button>      </header>

      {/* Filters */}
      <div className="filters-bar">
        <input
          className="search-input"
          type="search"
          placeholder="Search company, position…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
        <div className="filter-pills">
          {STATUSES.map(({ value, label, color }) => (
            <button
              key={value}
              className={`filter-pill ${status === value ? 'filter-pill-active' : ''}`}
              style={status === value && color ? { background: color, borderColor: color } : undefined}
              onClick={() => { setStatus(value); setPage(1); }}
            >
              {label}
            </button>
          ))}
        </div>
        <select className="filter-select" value={ordering} onChange={(e) => setOrdering(e.target.value)}>
          <option value="-created_at">Newest first</option>
          <option value="created_at">Oldest first</option>
          <option value="-date_applied">Applied date ↓</option>
          <option value="date_applied">Applied date ↑</option>
          <option value="status">Status</option>
        </select>
      </div>

      {/* Table */}
      <div className="card table-card">
        {isLoading ? (
          <div className="page-loading">Loading…</div>
        ) : applications.length === 0 ? (
          <div className="empty-state-full">
            <p>No applications found.</p>
            <Link to="/jobs/new" className="btn btn-primary" style={{ marginTop: '1rem' }}>Add your first application</Link>
          </div>
        ) : (
          <table className="jobs-table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Position</th>
                <th>Work Mode</th>
                <th>Status</th>
                <th>Applied</th>
                <th>Follow-up</th>
                <th>Salary</th>
                <th>Interviews</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app.id}>
                  <td>
                    <div className="table-company">
                      <div className="company-avatar sm">{app.company_name[0]}</div>
                      
                      <span>{app.company_name}</span>
                    </div>
                  </td>
                  <td className="role-cell">{app.position}</td>
                  <td className="muted-cell">{app.work_mode || '—'}</td>
                  <td><StatusBadge status={app.status as ApplicationStatus} /></td>
                  <td className="muted-cell">{app.date_applied}</td>
                  <td className="muted-cell">{app.follow_up_date || '—'}</td>
                  <td className="muted-cell">{app.salary || '—'}</td>
                  <td className="muted-cell">{app.interview_count > 0 ? `${app.interview_count} scheduled${app.next_interview_date ? ` · Next: ${app.next_interview_date.date} at ${app.next_interview_date.time}` : ''}`: '—'}</td>
                  <td>
                    <div className="action-btns">
                      <Link to={`/jobs/${app.id}/edit`} className="btn btn-sm">Edit</Link>
                      <Link to={`/jobs/${app.id}`} className="btn btn-sm">View</Link>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => setConfirmDelete(app.id)}
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