import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react';
import { api, getToken, setToken, getStoredUser, setStoredUser } from '../api/client';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function restore() {
      try {
        const token = await getToken();
        const stored = await getStoredUser();
        if (!token || !stored) {
          return;
        }
        const data = await api.get('/api/auth/me');
        if (!active) {return;}
        const next = { ...data.user, email: data.user.email ?? stored.email };
        setUser(next);
        await setStoredUser(next);
      } catch {
        await setToken(null);
        await setStoredUser(null);
      } finally {
        if (active) {setIsLoading(false);}
      }
    }

    restore();

    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async ({ username, password }) => {
    const data = await api.post('/api/auth/login', { username, password });
    await setToken(data.token);
    await setStoredUser(data.user);
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async ({ username, email, password, role }) => {
    const data = await api.post('/api/auth/register', {
      username,
      email,
      password,
      role,
    });
    const next = { ...data.user, email };
    await setToken(data.token);
    await setStoredUser(next);
    setUser(next);
    return next;
  }, []);

  const logout = useCallback(async () => {
    await setToken(null);
    await setStoredUser(null);
    setUser(null);
  }, []);

  const updateUser = useCallback((updates) => {
    setUser((prev) => {
      const next = { ...(prev || {}), ...updates };
      setStoredUser(next);
      return next;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
