import React, { createContext, useContext, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const login = useCallback(async ({ username, password }) => {
    const stored = await AsyncStorage.getItem('users');
    const users = stored ? JSON.parse(stored) : [];
    const userData = users.find(
      (u) => u.username === username && u.password === password
    );
    if (userData) {
      setUser({ ...userData, loggedIn: true });
      return userData;
    }
    throw new Error('Invalid username or password');
  }, []);

  const register = useCallback(async ({ username, password, role }) => {
    const stored = await AsyncStorage.getItem('users');
    const users = stored ? JSON.parse(stored) : [];
    if (users.some((u) => u.username === username)) {
      throw new Error('Username already exists');
    }
    const newUser = { username, password, role, loggedIn: true };
    await AsyncStorage.setItem('users', JSON.stringify([...users, newUser]));
    setUser(newUser);
    return newUser;
  }, []);

  const logout = useCallback(async () => {
    await AsyncStorage.removeItem('users');
    setUser(null);
  }, []);

  if (isLoading) {
    return <null />;
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};