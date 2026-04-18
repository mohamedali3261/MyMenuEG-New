import { Navigate, Outlet } from 'react-router-dom';
import { useStore } from '../store/store';

interface ProtectedRouteProps {
  permission?: string;
}

export default function ProtectedRoute({ permission }: ProtectedRouteProps) {
  const { user, token, authChecked } = useStore();

  if (!authChecked) {
    return null;
  }

  if (!token || !user) {
    return <Navigate to="/admin/login" replace />;
  }

  // If a specific permission is required, check if user has it or is super admin
  if (permission && !user.is_super_admin) {
    const hasPermission = user.permissions.includes(permission) || user.permissions.includes('all');
    if (!hasPermission) {
      return <Navigate to="/admin" replace />;
    }
  }

  return <Outlet />;
}
