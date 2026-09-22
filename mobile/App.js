import React, { useState } from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import AppShell from './src/components/AppShell';
import Login from './src/screens/Login';
import Register from './src/screens/Register';
import Dashboard from './src/screens/Dashboard';
import MyTasks from './src/screens/MyTasks';
import Submissions from './src/screens/Submissions';
import CalendarScreen from './src/screens/Calendar';
import Settings from './src/screens/Settings';
import { colors } from './src/theme';

function AuthScreens() {
  const [mode, setMode] = useState('login');

  if (mode === 'login') {
    return <Login onSwitchToRegister={() => setMode('register')} onSwitchToLogin={() => setMode('login')} />;
  }

  return <Register onSwitchToLogin={() => setMode('login')} />;
}

function Main() {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AppShell
      tab={tab}
      setTab={setTab}
      username={user?.username}
      role={user?.role}
      onLogout={logout}
      sidebarOpen={sidebarOpen}
      setSidebarOpen={setSidebarOpen}
    >
      {tab === 'dashboard' && <Dashboard onNavigate={setTab} />}
      {tab === 'tasks' && <MyTasks />}
      {tab === 'submissions' && <Submissions />}
      {tab === 'calendar' && <CalendarScreen />}
      {tab === 'settings' && <Settings />}
    </AppShell>
  );
}

function Root() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <View style={styles.splash} />;
  }

  return user ? <Main /> : <AuthScreens />;
}

export default function App() {
  return (
    <AuthProvider>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <Root />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
