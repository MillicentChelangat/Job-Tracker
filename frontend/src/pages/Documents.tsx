import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { documentsApi } from '../api/documents';
import { applicationsApi } from '../api/applications';
import type { DocumentType } from '../types/job';

export default function Documents() {
  const [file, setFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<DocumentType>('resume');
  const [applicationId, setApplicationId] = useState<string>('');
  const [error, setError] = useState('');
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
              {documents.map((doc) => (
                <tr key={doc.id}>
                  <td>
                    <a href={doc.file} target="_blank" rel="noopener noreferrer">
                      {doc.file_name}
                    </a>
                  </td>
                  <td className="muted-cell">{doc.document_type === 'resume' ? 'Resume' : 'Cover Letter'}</td>
                  <td className="muted-cell">
                    {applications?.find((a) => a.id === doc.application)?.position ?? '— General —'}
                  </td>
                  <td className="muted-cell">{doc.parse_status}</td>
                  <td className="muted-cell">{new Date(doc.uploaded_at).toLocaleDateString()}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => deleteMutation.mutate(doc.id)}
                      disabled={deleteMutation.isPending}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}