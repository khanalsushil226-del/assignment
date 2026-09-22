import React, { useState } from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppShell from './components/AppShell';
import Login from './screens/Login';
import Register from './screens/Register';
import Dashboard from './screens/Dashboard';
import MyTasks from './screens/MyTasks';
import Submissions from './screens/Submissions';
import CalendarScreen from './screens/Calendar';
import Settings from './screens/Settings';
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