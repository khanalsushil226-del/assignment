import React from 'react';
import { Pressable, StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native';
import { colors } from '../theme';
import Sidebar from './Sidebar';

const titles = {
  dashboard: 'Dashboard',
  tasks: 'My Tasks',
  submissions: 'Submissions',
  calendar: 'Calendar',
  settings: 'Settings',
};

export default function AppShell({ tab, setTab, username, role, onLogout, sidebarOpen, setSidebarOpen, children }) {
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

      <View style={styles.header}>
        <Pressable style={styles.menu} onPress={() => setSidebarOpen(true)}>
          <Text style={styles.menuIcon}>{'\u2630'}</Text>
        </Pressable>

        <View style={styles.headerTitle}>
          <Text style={styles.headerName}>Assignments</Text>
          <Text style={styles.headerSub}>Manage your academic activities</Text>
        </View>

        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{(username || 'S').charAt(0).toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.content}>{children}</View>

      <Sidebar
        visible={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        active={tab}
        onSelect={setTab}
        username={username}
        role={role}
        onLogout={onLogout}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menu: {
    padding: 4,
  },
  menuIcon: {
    fontSize: 26,
    color: colors.text,
  },
  headerTitle: {
    flex: 1,
  },
  headerName: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  headerSub: {
    fontSize: 10,
    color: colors.muted,
    marginTop: 2,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '800',
  },
  content: {
    flex: 1,
    backgroundColor: colors.background,
  },
});