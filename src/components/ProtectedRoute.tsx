import type { PropsWithChildren } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

interface Props extends PropsWithChildren {
  requiredRole: string | null;
}

export default function ProtectedRoute({
  children,
  requiredRole = null
}: Props) {
  const { user, loading, isAdmin } = useAuth();

  if (loading) return null;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole === 'admin' && !isAdmin()) {
    return <Navigate to="/" replace />;
  }

  return children;
}
