import {
  createContext,
  useContext,
  useState,
  useEffect,
  type PropsWithChildren
} from 'react';
import {
  login as apiLogin,
  logout as apiLogout,
  setGlobalLogout
} from '../services/api';
import type { User } from '../types/User';
import type { AuthResponse } from '../types/AuthResponse';
import type { LoginCredentials } from '../types/Credentials';

interface Value {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<User>;
  logout: (silent?: boolean) => void;
  isAdmin: () => boolean;
  isModerator: () => boolean;
  authError: string | null;
  clearAuthError: () => void;
}

const AuthContext = createContext<Value>(null!);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    setGlobalLogout((silent, message) => {
      logout(silent);
      if (message) setAuthError(message);
    });
  }, []);

  const clearAuthError = () => setAuthError(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');

    if (storedUser && storedToken) {
      try {
        const { exp } = JSON.parse(atob(storedToken.split('.')[1]));
        const isExpired = exp * 1000 < Date.now();

        if (isExpired) {
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          setUser(null);
        } else {
          setUser(JSON.parse(storedUser));
        }
      } catch {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }

    setLoading(false);
  }, []);

  const login: Value['login'] = async credentials => {
    const response: AuthResponse = await apiLogin(credentials);
    const { token, ...userData } = response;

    const user: User = {
      id: userData.id,
      username: userData.username,
      shProfileURL: userData.shProfileURL,
      role: userData.role,
      approved: userData.approved
    };

    setUser(user);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
    return user;
  };

  const logout = (silent = false) => {
    if (!silent) {
      apiLogout();
    }
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
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
        authError,
        clearAuthError
      }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}
