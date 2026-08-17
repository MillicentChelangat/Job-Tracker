import { Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import JobList from './pages/JobList';
import JobForm from './pages/JobForm';
import Documents from './pages/Documents';
import Login from './pages/Login';
import Register from './pages/Register';
import ApplicationDetail from './pages/ApplicationDetail';
import Profile from './pages/Profile';

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 1000 * 30 } },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>

          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/jobs" element={<JobList />} />
                      <Route path="/jobs/new" element={<JobForm />} />
                      <Route path="/jobs/:id/edit" element={<JobForm />} />
                      <Route path="/documents" element={<Documents />} />
                      <Route path="/jobs/:id" element={<ApplicationDetail />} />
                      <Route path="/profile" element={<Profile />} />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              }
            />
          </Routes>

      </AuthProvider>
    </QueryClientProvider>
  );
}