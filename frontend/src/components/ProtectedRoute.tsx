import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { ReactNode } from 'react';

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="page-loading">Loading…</div>;
  return user ? <>{children}</> : <Navigate to="/login" replace />;
}