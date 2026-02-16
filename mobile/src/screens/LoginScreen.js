import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import { COLORS } from '../utils/constants';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      await AsyncStorage.setItem('token', data.token);
      navigation.replace('Home');
    } catch (err) {
      Alert.alert('Login Failed', err.response?.data?.error || 'Something went wrong.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Student Portal</Text>
      <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
      <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: COLORS.background },
  title: { fontSize: 28, fontWeight: 'bold', color: COLORS.primary, textAlign: 'center', marginBottom: 32 },
  input: { backgroundColor: COLORS.white, padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 16 },
  button: { backgroundColor: COLORS.primary, padding: 14, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: COLORS.white, fontSize: 16, fontWeight: '600' },
});
