import { useState } from 'react';
import { useNavigate, Navigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff } from "lucide-react";


export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const justRegistered = searchParams[0].get('registered') === '1';
  const [showPassword, setShowPassword] = useState(false);


  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch {
      setError('Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <span className="brand-icon lg"></span>
          <h1 className="auth-title">JobTrack</h1>
          <p className="auth-subtitle">Your job search, organized.</p>
        </div>

        {justRegistered && (
          <div className="auth-success">
            <p>Account created successfully!</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Type your email address"
              autoFocus
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input pr-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Type your password"
                required
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3 flex items-center"
              >
                {showPassword ? (
                  <EyeOff size={20} className="text-gray-500" />
                ) : (
                  <Eye size={20} className="text-gray-500" />
                )}
              </button>
            </div>

            <div>
              <label className="form-label">
                Don't have an account? <a href="/register" className="auth-link">Sign up</a>
              </label>
              <div style={{ height: '0.5rem' }} />
              <label className="form-label">
                <a href="/forgot-password" className="auth-link">Forgot password?</a>
              </label>
            </div>

            {error && <p className="field-error">{error}</p>}

            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? 'Login…' : 'Login'}
            </button>
          </div>
        </form>
      </div>
    </div>     
  );
}