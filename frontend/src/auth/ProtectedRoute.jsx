import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Spinner } from '../components/ui/Spinner.jsx';
import { useAuth } from './useAuth.js';

export const ProtectedRoute = () => {
  const { isAuthenticated, isLoading, isDeactivated } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Spinner label="Restoring your session" />
      </div>
    );
  }

  if (!isAuthenticated) {
    if (isDeactivated) return <Navigate to="/account-deactivated" replace />;
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
};

export const GuestRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return isAuthenticated ? <Navigate to="/home" replace /> : <Outlet />;
};
