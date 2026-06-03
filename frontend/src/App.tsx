import { Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import JobList from './pages/JobList';
import JobForm from './pages/JobForm';
import Login from './pages/Login';
import Register from './pages/Register'; // Import the Register component

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 1000 * 30 } },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
      
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} /> {/* Add route for registration */}
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