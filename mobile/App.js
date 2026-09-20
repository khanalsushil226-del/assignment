import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaView, StyleSheet, StatusBar } from 'react-native';
import { useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import AppShell from './components/AppShell';
import Login from './screens/Login';
import Register from './screens/Register';

const Stack = createNativeStackNavigator();

function AuthStack({ navigation }) {
  const { user, login, register } = useAuth();
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        ...(user ? { presentation: 'none' } : {}),
      }}
    >
      {user ? null : (
        <>
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Register" component={Register} />
        </>
      )}
    </Stack.Navigator>
  );
}

function MainScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const screens = {
    dashboard: 'Dashboard screen',
    tasks: 'My Tasks screen',
    submissions: 'Submissions screen',
    calendar: 'Calendar screen',
    settings: 'Settings screen',
  };

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerTitle: '',
          headerShown: false,
          ...(tab === 'dashboard' ? { presentation: 'none' } : {}),
        }}
      >
        <Stack.Screen name="Main" component={Main} initial={true} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function Main() {
  const { user } = useAuth();
  const [tab, setTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AppShell
      tab={tab}
      setTab={setTab}
      username={user?.username}
      role={user?.role}
      onLogout={() => {
        // logout called by AuthContext; handle navigation back
        setSidebarOpen(false);
      }}
      sidebarOpen={sidebarOpen}
      setSidebarOpen={setSidebarOpen}
    >
      {/* Active screen based on tab */}
      {tab === 'dashboard' && <Text>Dashboard</Text>}
      {tab === 'tasks' && <Text>My Tasks</Text>}
      {tab === 'submissions' && <Text>Submissions</Text>}
      {tab === 'calendar' && <Text>Calendar</Text>}
      {tab === 'settings' && <Text>Settings</Text>}
    </AppShell>
  );
}

export default function App() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <StatusBar barStyle="dark-content" />;
  }

  return (
    <>
      <AuthProvider>
        {user ? (
          <NavigationContainer>
            <Stack.Navigator
              screenOptions={{
                headerTitle: '',
                headerShown: false,
                ...(tab === 'dashboard' ? { presentation: 'none' } : {}),
              }}
            >
              <Stack.Screen name="Main" component={Main} initial={true} />
            </Stack.Navigator>
          </NavigationContainer>
        ) : (
          <AuthStack />
        )}
      </AuthProvider>
    </>
  );
}