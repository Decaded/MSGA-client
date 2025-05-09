import { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, logout as apiLogout } from '../services/mockBackend';

const AuthContext = createContext();

export function AuthProvider({ children }) {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {

		const storedUser = localStorage.getItem('user');
		if (storedUser) {
			try {
				setUser(JSON.parse(storedUser));
			} catch (e) {
				localStorage.removeItem('user');
			}
		}
		setLoading(false);
	}, []);

	const login = async credentials => {
		try {
			const userData = await apiLogin(credentials);
			setUser(userData);
			localStorage.setItem('user', JSON.stringify(userData));
			return userData;
		} catch (error) {
			throw error; 
		}
	};

	const logout = () => {
		apiLogout();
		setUser(null);
		localStorage.removeItem('user');
	};

	const isAdmin = () => user?.role === 'admin';
	const isModerator = () => user?.role === 'admin' || user?.role === 'user';

	return (
		<AuthContext.Provider
			value={{
				user,
				loading,
				login,
				logout,
				isAdmin,
				isModerator,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	return useContext(AuthContext);
}
