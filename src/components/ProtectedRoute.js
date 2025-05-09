import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children, requiredRole = null }) {
	const { user, loading, isAdmin } = useAuth();

	if (loading) return null;

	if (!user) {
		return (
			<Navigate
				to='/login'
				replace
			/>
		);
	}

	if (requiredRole === 'admin' && !isAdmin()) {
		return (
			<Navigate
				to='/'
				replace
			/>
		);
	}

	return children;
}
