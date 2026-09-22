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

export default function Register({ onSwitchToLogin }) {
  const { register } = useAuth();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState(null);

  async function handleRegister() {
    setError(null);

    if (!username.trim() || !password) {
      setError('Please fill in all fields.');
      return;
    }

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      await register({
        username: username.trim(),
        email: email.trim(),
        password,
        role,
      });
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
          <Text style={styles.hero}>Create Account</Text>
          <Text style={styles.sub}>
            Fill out the form to register your account.
          </Text>
        </View>

        <Text style={styles.label}>Choose your role</Text>
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

        <Field
          label="Username"
          value={username}
          onChangeText={setUsername}
          placeholder="Enter your username"
        />

        <Field
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="Enter your email"
          keyboardType="email-address"
        />

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Password</Text>
          <TextInput
            style={[styles.input, styles.passwordInput]}
            placeholder="Enter your password"
            placeholderTextColor="#9aa69d"
            secureTextEntry={true}
            value={password}
            onChangeText={setPassword}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Confirm Password</Text>
          <TextInput
            style={[styles.input, styles.passwordInput]}
            placeholder="Confirm your password"
            placeholderTextColor="#9aa69d"
            secureTextEntry={true}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
        </View>

        <Message message={error} />

        <PrimaryButton title="Create Account" onPress={handleRegister} />

        <Text style={styles.footer}>
          Already have an account?{' '}
          <Text style={styles.footerLink} onPress={onSwitchToLogin}>
            Sign in
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
    marginBottom: 16,
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
  passwordInput: { flex: 1 },
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
