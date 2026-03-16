import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, SafeAreaView, Animated, Easing } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import { COLORS } from '../utils/constants';

// Module-level animated values so they persist and never reset on re-render.
const lOrb1 = new Animated.ValueXY({ x: 0, y: 0 });
const lOrb2 = new Animated.ValueXY({ x: 0, y: 0 });
const lOrb3 = new Animated.ValueXY({ x: 0, y: 0 });
const lRing1 = new Animated.ValueXY({ x: 0, y: 0 });
const lRing2 = new Animated.ValueXY({ x: 0, y: 0 });
const lGrid = new Animated.ValueXY({ x: 0, y: 0 });

function loginFloat(anim, toX, toY, duration) {
  return Animated.loop(
    Animated.sequence([
      Animated.timing(anim, { toValue: { x: toX, y: toY }, duration, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
      Animated.timing(anim, { toValue: { x: -toX, y: -toY }, duration, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
      Animated.timing(anim, { toValue: { x: 0, y: 0 }, duration: Math.round(duration * 0.6), useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
    ])
  );
}

loginFloat(lOrb1, 12, 18, 9000).start();
loginFloat(lOrb2, -8, -14, 12000).start();
loginFloat(lOrb3, 10, -10, 10500).start();
loginFloat(lRing1, -6, 12, 8500).start();
loginFloat(lRing2, 8, -8, 11500).start();
loginFloat(lGrid, -5, 10, 7500).start();

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  const primaryActionText = showReset ? 'Send Reset Link' : 'Sign In';

  const BackgroundOrnaments = () => (
    <>
      <Animated.View style={[styles.orbOne, { transform: lOrb1.getTranslateTransform() }]} />
      <Animated.View style={[styles.orbTwo, { transform: lOrb2.getTranslateTransform() }]} />
      <Animated.View style={[styles.orbThree, { transform: lOrb3.getTranslateTransform() }]} />
      <Animated.View style={[styles.ringOne, { transform: lRing1.getTranslateTransform() }]} />
      <Animated.View style={[styles.ringTwo, { transform: lRing2.getTranslateTransform() }]} />
      <Animated.View style={[styles.gridAccent, { transform: lGrid.getTranslateTransform() }]} />
    </>
  );

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
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.backgroundLayerTop} />
          <View style={styles.backgroundLayerBottom} />
          <BackgroundOrnaments />

          <View style={styles.headerBlock}>
            <View style={styles.badgeOuter}>
              <View style={styles.badgeInner}>
                <Text style={styles.badgeText}>AVC</Text>
              </View>
            </View>
            <Text style={styles.institutionName}>Abra Valley Colleges</Text>
            <Text style={styles.institutionMeta}>Office of Information and Records</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.subtitle}>Enter your registered email and we will send reset instructions.</Text>

            <Text style={styles.label}>Institutional Email</Text>
            <TextInput
              style={styles.input}
              placeholder="student@avc.edu"
              placeholderTextColor="#8B97A6"
              value={resetEmail}
              onChangeText={setResetEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TouchableOpacity style={styles.button} onPress={handleResetPassword} disabled={resetLoading}>
              {resetLoading ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.buttonText}>{primaryActionText}</Text>}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setShowReset(false)} style={styles.linkBtn}>
              <Text style={styles.linkText}>Back to Login</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footerBlock}>
            <Text style={styles.footerText}>Authorized access only. All sessions are monitored for security and compliance.</Text>
            <Text style={styles.footerCredit}>Developed by Nexionic Inc.</Text>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.backgroundLayerTop} />
        <View style={styles.backgroundLayerBottom} />
        <BackgroundOrnaments />

        <View style={styles.headerBlock}>
          <View style={styles.badgeOuter}>
            <View style={styles.badgeInner}>
              <Text style={styles.badgeText}>AVC</Text>
            </View>
          </View>
          <Text style={styles.institutionName}>Abra Valley Colleges</Text>
          <Text style={styles.institutionMeta}>Student Information System</Text>
        </View>

        <View style={styles.card}>
          <Text style={[styles.title, styles.loginTitle]}>Student Login</Text>
          <Text style={styles.subtitle}>Sign in with your institutional credentials to access enrollment, grades, and schedules.</Text>

          <Text style={styles.label}>Institutional Email</Text>
          <TextInput
            style={styles.input}
            placeholder="student@avc.edu"
            placeholderTextColor="#8B97A6"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordWrapper}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Enter password"
              placeholderTextColor="#8B97A6"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPassword(v => !v)}>
              <Text style={styles.eyeText}>{showPassword ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
            {loading ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.buttonText}>{primaryActionText}</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setShowReset(true)} style={styles.linkBtn}>
            <Text style={styles.linkText}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footerBlock}>
          <Text style={styles.footerText}>By continuing, you agree to institutional acceptable use and data privacy policies.</Text>
          <Text style={styles.footerCredit}>Developed by Nexionic Inc.</Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#EEF2F7' },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 22,
    paddingVertical: 20,
  },
  backgroundLayerTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '42%',
    backgroundColor: '#173A63',
  },
  backgroundLayerBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '58%',
    backgroundColor: '#EEF2F7',
  },
  orbOne: {
    position: 'absolute',
    top: -30,
    right: -34,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#FFFFFF14',
  },
  orbTwo: {
    position: 'absolute',
    top: 72,
    left: -55,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#6FA7DC1C',
  },
  orbThree: {
    position: 'absolute',
    bottom: 55,
    right: -48,
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: '#1C4D7A14',
  },
  ringOne: {
    position: 'absolute',
    top: 108,
    right: 28,
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2,
    borderColor: '#FFFFFF2F',
  },
  ringTwo: {
    position: 'absolute',
    bottom: 142,
    left: 20,
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    borderColor: '#37628A26',
  },
  gridAccent: {
    position: 'absolute',
    bottom: 118,
    left: 32,
    width: 56,
    height: 56,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#6D88A533',
    backgroundColor: '#FFFFFF1C',
  },
  headerBlock: {
    alignItems: 'center',
    marginBottom: 24,
  },
  badgeOuter: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: '#FFFFFF24',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF5E',
    marginBottom: 14,
  },
  badgeInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: '#173A63',
  },
  institutionName: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  institutionMeta: {
    color: '#D2E3F5',
    marginTop: 4,
    fontSize: 13,
    letterSpacing: 0.4,
    textAlign: 'center',
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: '#DCE4EF',
    shadowColor: '#0B1A2B',
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A2F47',
    textAlign: 'center',
    marginBottom: 8,
  },
  loginTitle: {
    fontSize: 24,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 13,
    color: '#5A6E86',
    textAlign: 'center',
    marginBottom: 18,
    lineHeight: 19,
  },
  label: {
    fontSize: 12,
    color: '#304B67',
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: '#F7FAFD',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 14,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#CBD7E5',
    color: '#21384F',
  },
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7FAFD',
    borderRadius: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#CBD7E5',
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    fontSize: 15,
    color: '#21384F',
  },
  eyeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  eyeText: { fontSize: 17 },
  button: {
    backgroundColor: '#173A63',
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 2,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  linkBtn: {
    marginTop: 14,
    alignItems: 'center',
  },
  linkText: {
    color: '#2A5A8A',
    fontSize: 13,
    fontWeight: '600',
  },
  footerText: {
    textAlign: 'center',
    color: '#5A6E86',
    fontSize: 11,
    lineHeight: 16,
    paddingHorizontal: 12,
  },
  footerBlock: {
    marginTop: 16,
    alignItems: 'center',
  },
  footerCredit: {
    marginTop: 6,
    color: '#3A516B',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
