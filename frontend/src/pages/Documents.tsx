import { useState, Fragment } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { documentsApi } from '../api/documents';
import { applicationsApi } from '../api/applications';
import type { DocumentType } from '../types/job';

export default function Documents() {
  const [file, setFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<DocumentType>('resume');
  const [applicationId, setApplicationId] = useState<string>('');
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const qc = useQueryClient();

  const { data: documents, isLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: () => documentsApi.getAll().then((r) => r.data.results),
  });

  const { data: applications } = useQuery({
    queryKey: ['applications', 'for-select'],
    queryFn: () => applicationsApi.getAll({ page: 1 }).then((r) => r.data.results),
  });

  const uploadMutation = useMutation({
    mutationFn: () => {
      if (!file) throw new Error('No file selected');
      return documentsApi.upload(file, documentType, applicationId ? Number(applicationId) : undefined);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['documents'] });
      setFile(null);
      setApplicationId('');
      setError('');
    },
    onError: () => setError('Upload failed. Please try again.'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => documentsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['documents'] }),
  });

  const parseMutation = useMutation({
    mutationFn: ({ id, force }: { id: number; force?: boolean }) => documentsApi.parse(id, force),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['documents'] });
      setExpandedId(res.data.id);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please choose a file first.');
      return;
    }
    setError('');
    uploadMutation.mutate();
  };

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Documents</h1>
          <p className="page-subtitle">Upload your resumes and cover letters</p>
        </div>
      </header>

      <div className="card form-card">
        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">File *</label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Document Type *</label>
                <select
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value as DocumentType)}
                  className="form-select"
                >
                  <option value="resume">Resume</option>
                  <option value="cover_letter">Cover Letter</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Link to Application (optional)</label>
                <select
                  value={applicationId}
                  onChange={(e) => setApplicationId(e.target.value)}
                  className="form-select"
                >
                  <option value="">— General / Not linked —</option>
                  {applications?.map((app) => (
                    <option key={app.id} value={app.id}>
                      {app.position} @ {app.company_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {error && <div className="form-error-banner">{error}</div>}

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={uploadMutation.isPending}>
              {uploadMutation.isPending ? 'Uploading…' : 'Upload Document'}
            </button>
          </div>
        </form>
      </div>

      <div className="card table-card" style={{ marginTop: '1.5rem' }}>
        {parseMutation.isError && (
          <div className="form-error-banner" style={{ margin: '1rem' }}>
            {(parseMutation.error as any)?.response?.data?.error ?? 'AI analysis failed. Please try again.'}
          </div>
        )}
        {isLoading ? (
          <div className="page-loading">Loading…</div>
        ) : !documents?.length ? (
          <div className="empty-state-full">
            <p>No documents uploaded yet.</p>
          </div>
        ) : (
          <table className="jobs-table">
            <thead>
              <tr>
                <th>File Name</th>
                <th>Type</th>
                <th>Linked Application</th>
                <th>Status</th>
                <th>Uploaded</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => {
                const isParsing = parseMutation.isPending && parseMutation.variables?.id === doc.id;
                const isExpanded = expandedId === doc.id;
                const hasProfile = doc.document_type === 'resume' && !!doc.candidate_profile;

                return (
                  <Fragment key={doc.id}>
                    <tr>
                      <td>
                        <a href={doc.file} target="_blank" rel="noopener noreferrer">
                          {doc.file_name}
                        </a>
                      </td>
                      <td className="muted-cell">{doc.document_type === 'resume' ? 'Resume' : 'Cover Letter'}</td>
                      <td className="muted-cell">
                        {applications?.find((a) => a.id === doc.application)?.position ?? '— General —'}
                      </td>
                      <td className="muted-cell">
                        {doc.parse_status === 'failed' ? (
                          <span style={{ color: 'var(--red)' }}>failed</span>
                        ) : (
                          doc.parse_status
                        )}
                      </td>
                      <td className="muted-cell">{new Date(doc.uploaded_at).toLocaleDateString()}</td>
                      <td>
                        <div className="action-btns">
                          {doc.document_type === 'resume' && (
                            hasProfile ? (
                              <button
                                className="btn btn-sm"
                                onClick={() => setExpandedId(isExpanded ? null : doc.id)}
                              >
                                {isExpanded ? 'Hide Results' : 'View AI Results'}
                              </button>
                            ) : (
                              <button
                                className="btn btn-sm btn-primary"
                                onClick={() => parseMutation.mutate({ id: doc.id })}
                                disabled={isParsing}
                              >
                                {isParsing ? 'Analyzing…' : 'Analyze with AI'}
                              </button>
                            )
                          )}
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => deleteMutation.mutate(doc.id)}
                            disabled={deleteMutation.isPending}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>

                    {isExpanded && doc.candidate_profile && (
                      <tr>
                        <td colSpan={6} style={{ background: 'var(--purple-pale)', padding: '1.25rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                            <strong style={{ fontSize: '13px' }}>AI-Extracted Profile</strong>
                            <button
                              className="btn btn-sm"
                              onClick={() => parseMutation.mutate({ id: doc.id, force: true })}
                              disabled={isParsing}
                            >
                              {isParsing ? 'Re-analyzing…' : 'Re-analyze'}
                            </button>
                          </div>

                          <div className="form-grid-2" style={{ gap: '1.25rem' }}>
                            <div>
                              <p style={{ fontWeight: 600, fontSize: '12.5px', marginBottom: '0.4rem' }}>Skills</p>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                {doc.candidate_profile.skills.map((s) => (
                                  <span key={s} className="status-badge" style={{ background: '#fff' }}>{s}</span>
                                ))}
                              </div>
                            </div>

                            <div>
                              <p style={{ fontWeight: 600, fontSize: '12.5px', marginBottom: '0.4rem' }}>Education</p>
                              {doc.candidate_profile.education.map((e, i) => (
                                <p key={i} style={{ fontSize: '12.5px', marginBottom: '4px' }}>
                                  {e.degree} — {e.institution} ({e.years})
                                </p>
                              ))}
                            </div>
                          </div>

                          <div style={{ marginTop: '1rem' }}>
                            <p style={{ fontWeight: 600, fontSize: '12.5px', marginBottom: '0.4rem' }}>Experience</p>
                            {doc.candidate_profile.experience.map((e, i) => (
                              <div key={i} style={{ marginBottom: '0.5rem' }}>
                                <p style={{ fontSize: '12.5px', fontWeight: 600 }}>{e.title} — {e.company} ({e.duration})</p>
                                <p style={{ fontSize: '12px', color: 'var(--muted)' }}>{e.summary}</p>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}