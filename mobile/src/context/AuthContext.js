import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  api,
  getToken,
  setToken,
  getStoredUser,
  setStoredUser,
} from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    (async () => {
      const stored = await getStoredUser();
      const hasToken = await getToken();

      if (mounted) {
        setUser(stored);
      }

      if (!hasToken) {
        if (mounted) setLoading(false);
        return;
      }

      try {
        const data = await api.get('/api/auth/me');
        if (mounted) {
          setUser(data.user);
          await setStoredUser(data.user);
        }
      } catch {
        await logout();
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(async (credentials) => {
    const data = await api.post('/api/auth/login', credentials);
    await setToken(data.token);
    await setStoredUser(data.user);
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (payload) => {
    const data = await api.post('/api/auth/register', payload);
    await setToken(data.token);
    await setStoredUser(data.user);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    await setToken('');
    await setStoredUser(null);
    setUser(null);
  }, []);

  const updateUser = useCallback(async (nextUser) => {
    setUser(nextUser);
    await setStoredUser(nextUser);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, register, logout, updateUser }),
    [user, loading, login, register, logout, updateUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}