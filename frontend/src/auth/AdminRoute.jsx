import { Navigate, Outlet } from 'react-router-dom';
import { Spinner } from '../components/ui/Spinner.jsx';
import { useAuth } from './useAuth.js';

export const AdminRoute = () => {
  const { user, isAuthenticated, isLoading, isDeactivated } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Spinner label="Checking your access" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={isDeactivated ? '/account-deactivated' : '/login'} replace />;
  }
  if (user?.role !== 'admin') return <Navigate to="/home" replace />;

  return <Outlet />;
};
