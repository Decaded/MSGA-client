import type { PropsWithChildren } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { useEffect } from 'react';

interface Props extends PropsWithChildren {
  requiredRole: string | null;
}

export default function ProtectedRoute({ children, requiredRole }: Props) {
  const { user, loading, isAdmin, authError, clearAuthError } = useAuth();

  useEffect(() => {
    if (authError) {
      clearAuthError();
    }
  }, [authError, clearAuthError]);

  if (loading) return null;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole === 'admin' && !isAdmin()) {
    return <Navigate to="/" replace />;
  }

  return children;
}
