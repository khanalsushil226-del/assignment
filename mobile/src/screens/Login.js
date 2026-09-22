import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { PrimaryButton, Field, Message } from '../components/ui';
import { colors } from '../theme';

export default function Login({ onSwitchToRegister }) {
  const { login, logout } = useAuth();

  const [role, setRole] = useState('student');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);

  async function handleLogin() {
    setError(null);

    if (!username.trim() || !password) {
      setError('Please fill in all fields.');
      return;
    }

    try {
      const user = await login({ username: username.trim(), password });

      if (user.role !== role) {
        await logout();
        setError('The selected role does not match your account.');
      }
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.brandBox}>
          <Text style={styles.brand}>ASSIGNMENTS</Text>
          <Text style={styles.badge}>SMART LEARNING PLATFORM</Text>
          <Text style={styles.hero}>Learn. Submit.{'\n'}Achieve.</Text>
          <Text style={styles.sub}>
            Manage your academic tasks, submit assignments, and stay connected
            with your teachers in one place.
          </Text>
        </View>

        <Text style={styles.label}>WELCOME BACK</Text>
        <Text style={styles.title}>Sign in to your account</Text>
        <Text style={styles.subtitle}>Enter your credentials to continue.</Text>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Login as</Text>
          <View style={styles.segment}>
            {['student', 'teacher'].map((value) => (
              <TouchableOpacity
                key={value}
                style={[
                  styles.segmentBtn,
                  role === value && styles.segmentBtnActive,
                ]}
                onPress={() => setRole(value)}
              >
                <Text
                  style={[
                    styles.segmentText,
                    role === value && styles.segmentTextActive,
                  ]}
                >
                  {value === 'student' ? 'Student' : 'Teacher'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Field
          label="Username"
          value={username}
          onChangeText={setUsername}
          placeholder="Enter your username"
        />

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Password</Text>
          <View style={styles.passwordRow}>
            <TextInput
              style={[styles.input, styles.passwordInput]}
              placeholder="Enter your password"
              placeholderTextColor="#9aa69d"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity
              style={styles.showBtn}
              onPress={() => setShowPassword((value) => !value)}
            >
              <Text style={styles.showBtnText}>
                {showPassword ? 'Hide' : 'Show'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <Message message={error} />

        <PrimaryButton title="Sign In" onPress={handleLogin} />

        <Text style={styles.footer}>
          Don't have an account?{' '}
          <Text style={styles.footerLink} onPress={onSwitchToRegister}>
            Create account
          </Text>
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  container: { padding: 24, paddingBottom: 40 },
  brandBox: {
    backgroundColor: colors.primary,
    borderRadius: 18,
    padding: 24,
    marginBottom: 30,
  },
  brand: {
    color: colors.white,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  badge: {
    color: '#bceac8',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginTop: 22,
  },
  hero: {
    color: colors.white,
    fontSize: 30,
    fontWeight: '800',
    marginTop: 10,
    lineHeight: 36,
  },
  sub: {
    color: '#d0e8d6',
    fontSize: 12,
    lineHeight: 20,
    marginTop: 12,
  },
  label: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    color: colors.primary,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.text,
    marginTop: 10,
  },
  subtitle: {
    fontSize: 13,
    color: colors.muted,
    marginTop: 6,
    marginBottom: 24,
  },
  field: { marginBottom: 16 },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  segment: {
    flexDirection: 'row',
    backgroundColor: colors.primaryLight,
    borderRadius: 10,
    padding: 4,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  segmentBtnActive: {
    backgroundColor: colors.primary,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  segmentTextActive: {
    color: colors.white,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    backgroundColor: colors.white,
    color: colors.text,
    fontSize: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  passwordRow: { flexDirection: 'row', gap: 10 },
  passwordInput: { flex: 1 },
  showBtn: {
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 10,
    backgroundColor: colors.primaryLight,
  },
  showBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  footer: {
    fontSize: 12,
    color: colors.muted,
    textAlign: 'center',
    marginTop: 24,
  },
  footerLink: {
    color: colors.primary,
    fontWeight: '700',
  },
});