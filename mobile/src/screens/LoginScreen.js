import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import { COLORS } from '../utils/constants';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Validation', 'Please enter both email and password.');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email: email.trim(), password });
      if (data.role !== 'student') {
        Alert.alert('Access Denied', 'This app is for students only. Admins should use the web panel.');
        return;
      }
      await AsyncStorage.setItem('token', data.token);
      navigation.replace('Home');
    } catch (err) {
      Alert.alert('Login Failed', err.response?.data?.error || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resetEmail.trim()) {
      Alert.alert('Validation', 'Please enter your email address.');
      return;
    }
    setResetLoading(true);
    try {
      await api.post('/auth/reset-password', { email: resetEmail.trim() });
      Alert.alert('Success', 'If this email exists in our system, a password reset link has been sent.');
      setShowReset(false);
      setResetEmail('');
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || 'Something went wrong.');
    } finally {
      setResetLoading(false);
    }
  };

  if (showReset) {
    return (
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.subtitle}>Enter your email address and we'll send you instructions to reset your password.</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={resetEmail}
          onChangeText={setResetEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TouchableOpacity style={styles.button} onPress={handleResetPassword} disabled={resetLoading}>
          {resetLoading ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.buttonText}>Send Reset Link</Text>}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setShowReset(false)} style={styles.linkBtn}>
          <Text style={styles.linkText}>Back to Login</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Text style={styles.title}>Student Portal</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        {loading ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.buttonText}>Login</Text>}
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setShowReset(true)} style={styles.linkBtn}>
        <Text style={styles.linkText}>Forgot Password?</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: COLORS.background },
  title: { fontSize: 28, fontWeight: 'bold', color: COLORS.primary, textAlign: 'center', marginBottom: 12 },
  subtitle: { fontSize: 14, color: COLORS.textLight, textAlign: 'center', marginBottom: 24, lineHeight: 20 },
  input: { backgroundColor: COLORS.white, padding: 14, borderRadius: 8, marginBottom: 16, fontSize: 16, borderWidth: 1, borderColor: '#E0E0E0' },
  button: { backgroundColor: COLORS.primary, padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 4 },
  buttonText: { color: COLORS.white, fontSize: 16, fontWeight: '600' },
  linkBtn: { marginTop: 16, alignItems: 'center' },
  linkText: { color: COLORS.secondary, fontSize: 14, fontWeight: '500' },
});
