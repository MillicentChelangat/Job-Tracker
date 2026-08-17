import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileApi } from '../api/profile';
import type { ProfileFormData } from '../types/job';

const emptyForm: ProfileFormData = {
  first_name: '',
  last_name: '',
  phone: '',
  location: '',
  bio: '',
};

export default function Profile() {
  const qc = useQueryClient();
  const [form, setForm] = useState<ProfileFormData>(emptyForm);
  const [saved, setSaved] = useState(false);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => profileApi.get().then((r) => r.data),
  });

  useEffect(() => {
    if (profile) {
      setForm({
        first_name: profile.first_name,
        last_name: profile.last_name,
        phone: profile.phone,
        location: profile.location,
        bio: profile.bio,
      });
    }
  }, [profile]);

  const mutation = useMutation({
    mutationFn: (data: ProfileFormData) => profileApi.update(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['profile'] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    },
  });

  if (isLoading) return <div className="page-loading">Loading…</div>;

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Profile</h1>
          <p className="page-subtitle">Your account details</p>
        </div>
      </header>

      <div className="card form-card">
        <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(form); }}>
          <div className="form-section">
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" value={profile?.email ?? ''} disabled />
              </div>

              <div className="form-group" />

              <div className="form-group">
                <label className="form-label">First Name</label>
                <input
                  className="form-input"
                  value={form.first_name}
                  onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Last Name</label>
                <input
                  className="form-input"
                  value={form.last_name}
                  onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone</label>
                <input
                  className="form-input"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="e.g. 0725 995 840"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Location</label>
                <input
                  className="form-input"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="e.g. Nairobi, Kenya"
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Bio</label>
            <textarea
              className="form-textarea"
              rows={4}
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              placeholder="A short summary about yourself…"
            />
          </div>

          <div className="form-actions">
            {saved && <span style={{ color: '#639922', alignSelf: 'center' }}>Saved ✓</span>}
            <button type="submit" className="btn btn-primary" disabled={mutation.isPending}>
              {mutation.isPending ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}