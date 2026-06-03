import { useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/jobs';

export default function Register() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      await authApi.register(form.email, form.password, form.confirm);
      navigate('/login?registered=1');
    } catch (err: any) {
      const data = err?.response?.data;
      if (data?.email) setError(`Email: ${data.email[0]}`);
      else if (data?.password) setError(`Password: ${data.password[0]}`);
      else setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-logo"></div>
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Start tracking your job search today</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              className="form-input"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Type your email address"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className="form-input"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Min. 6 characters"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input
              className="form-input"
              name="confirm"
              type="password"
              value={form.confirm}
              onChange={handleChange}
              placeholder="Repeat your password"
              required
            />
          </div>

          {error && <p className="field-error">{error}</p>}

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading}
          >
            {loading ? 'Creating account…' : 'Create Account'}
          </button>

          <p className="auth-switch">
            Already have an account?{' '}
            <Link to="/login">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}