import {
  createContext,
  useContext,
  useState,
  useEffect,
  type PropsWithChildren
} from 'react';
import {
  login as apiLogin,
  logout as apiLogout
} from '../services/mockBackend';
import type { User } from '../types/User';
import type { Credentials } from '../types/Credentials';

interface Value {
  user: User | null;
  loading: boolean;
  login: (credentials: Credentials) => Promise<User>;
  logout: () => void;
  isAdmin: () => boolean;
  isModerator: () => boolean;
}

const AuthContext = createContext<Value>(null!);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login: Value['login'] = async credentials => {
    const userData = await apiLogin(credentials);
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    return userData;
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
        isModerator
      }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}
