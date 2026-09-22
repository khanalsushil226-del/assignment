import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  Card,
  Field,
  Loading,
  Message,
  PrimaryButton,
  Screen,
  SecondaryButton,
} from '../components/ui';
import { colors } from '../theme';

export default function Settings() {
  const { user, updateUser } = useAuth();

  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [profileMessage, setProfileMessage] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [securityMessage, setSecurityMessage] = useState(null);
  const [savingPassword, setSavingPassword] = useState(false);

  const [reminders, setReminders] = useState(true);
  const [updates, setUpdates] = useState(true);
  const [compact, setCompact] = useState(false);
  const [prefsLoaded, setPrefsLoaded] = useState(false);

  useEffect(() => {
    async function loadPrefs() {
      try {
        const [r, u, c] = await Promise.all([
          AsyncStorage.getItem('assignmentReminders'),
          AsyncStorage.getItem('submissionUpdates'),
          AsyncStorage.getItem('compactView'),
        ]);
        setReminders(r !== 'false');
        setUpdates(u !== 'false');
        setCompact(c === 'true');
      } finally {
        setPrefsLoaded(true);
      }
    }
    loadPrefs();
  }, []);

  async function toggleReminders(value) {
    setReminders(value);
    await AsyncStorage.setItem('assignmentReminders', String(value));
  }

  async function toggleUpdates(value) {
    setUpdates(value);
    await AsyncStorage.setItem('submissionUpdates', String(value));
  }

  async function toggleCompact(value) {
    setCompact(value);
    await AsyncStorage.setItem('compactView', String(value));
  }

  async function handleProfile() {
    setProfileMessage(null);

    if (!username.trim()) {
      setProfileMessage({ text: 'Username cannot be empty.', color: colors.danger });
      return;
    }

    setSavingProfile(true);
    try {
      const data = await api.patch('/api/profile', {
        username: username.trim(),
        email: email || undefined,
      });
      updateUser(data.user);
      setProfileMessage({ text: 'Profile updated successfully.', color: colors.primary });
    } catch (error) {
      setProfileMessage({ text: error.message, color: colors.danger });
    } finally {
      setSavingProfile(false);
    }
  }

  async function handlePassword() {
    setSecurityMessage(null);

    if (!currentPassword || !newPassword) {
      setSecurityMessage({ text: 'All fields are required.', color: colors.danger });
      return;
    }

    setSavingPassword(true);
    try {
      const data = await api.patch('/api/profile/password', {
        currentPassword,
        newPassword,
      });
      setSecurityMessage({ text: data.message, color: colors.primary });
      setCurrentPassword('');
      setNewPassword('');
    } catch (error) {
      setSecurityMessage({ text: error.message, color: colors.danger });
    } finally {
      setSavingPassword(false);
    }
  }

  const initial = (username || 'S').charAt(0).toUpperCase();
  const roleLabel = user?.role === 'teacher' ? 'Teacher Account' : 'Student Account';

  return (
    <Screen>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={styles.heading}>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>Manage your account and preferences.</Text>
        </View>

        <Card>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Profile Information</Text>
            <Text style={styles.sectionSub}>View and update your basic account information.</Text>
          </View>

          <View style={styles.preview}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initial}</Text>
            </View>
            <View>
              <Text style={styles.previewName}>{username || 'Student'}</Text>
              <Text style={styles.previewRole}>{roleLabel}</Text>
            </View>
          </View>

          <Field
            label="Username"
            value={username}
            onChangeText={setUsername}
            placeholder="Enter username"
          />
          <Field
            label="Email Address"
            value={email || ''}
            onChangeText={setEmail}
            placeholder="Enter email"
            keyboardType="email-address"
          />

          <Message message={profileMessage} />
          <PrimaryButton
            title={savingProfile ? 'Saving...' : 'Save Profile'}
            onPress={handleProfile}
            disabled={savingProfile}
          />
        </Card>

        <Card>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Notifications</Text>
            <Text style={styles.sectionSub}>Control how you receive assignment updates.</Text>
          </View>

          <View style={styles.option}>
            <View style={styles.optionText}>
              <Text style={styles.optionTitle}>Assignment Reminders</Text>
              <Text style={styles.optionSub}>Receive reminders about upcoming deadlines.</Text>
            </View>
            <Switch
              value={reminders}
              onValueChange={toggleReminders}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.white}
              disabled={!prefsLoaded}
            />
          </View>

          <View style={styles.option}>
            <View style={styles.optionText}>
              <Text style={styles.optionTitle}>Submission Updates</Text>
              <Text style={styles.optionSub}>Get notified when submission status changes.</Text>
            </View>
            <Switch
              value={updates}
              onValueChange={toggleUpdates}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.white}
              disabled={!prefsLoaded}
            />
          </View>
        </Card>

        <Card>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Appearance</Text>
            <Text style={styles.sectionSub}>Customize your application appearance.</Text>
          </View>

          <View style={styles.option}>
            <View style={styles.optionText}>
              <Text style={styles.optionTitle}>Compact View</Text>
              <Text style={styles.optionSub}>Use a more compact layout for content.</Text>
            </View>
            <Switch
              value={compact}
              onValueChange={toggleCompact}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.white}
              disabled={!prefsLoaded}
            />
          </View>
        </Card>

        <Card>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Security</Text>
            <Text style={styles.sectionSub}>Manage your account security settings.</Text>
          </View>

          <Field
            label="Current Password"
            value={currentPassword}
            onChangeText={setCurrentPassword}
            placeholder="Enter current password"
            secureTextEntry
          />
          <Field
            label="New Password"
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="Enter new password"
            secureTextEntry
          />

          <Message message={securityMessage} />
          <SecondaryButton
            title={savingPassword ? 'Changing...' : 'Change Password'}
            onPress={handlePassword}
          />
        </Card>

        <Loading visible={false} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  heading: { marginBottom: 16 },
  title: { fontSize: 24, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: 12, color: colors.muted, marginTop: 4 },
  sectionHeader: { marginBottom: 14 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: colors.text },
  sectionSub: { fontSize: 11, color: colors.muted, marginTop: 3 },
  preview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 18,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: colors.primary, fontSize: 22, fontWeight: '800' },
  previewName: { fontSize: 16, fontWeight: '800', color: colors.text },
  previewRole: { fontSize: 11, color: colors.muted, marginTop: 3 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  optionText: { flex: 1, paddingRight: 16 },
  optionTitle: { fontSize: 13, fontWeight: '700', color: colors.text },
  optionSub: { fontSize: 11, color: colors.muted, marginTop: 3, lineHeight: 16 },
});
