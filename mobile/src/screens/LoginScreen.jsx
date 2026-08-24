import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import PrimaryButton from '../components/PrimaryButton';
import { login, register } from '../api/auth';

export default function LoginScreen({ navigation, onLoginSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password || (isRegister && !name)) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }
    try {
      setLoading(true);
      if (isRegister) {
        await register({ name, email, password });
      } else {
        await login(email, password);
      }
      if (onLoginSuccess) onLoginSuccess();
    } catch (err) {
      Alert.alert('Authentication Failed', err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.logoTitle}>FitFix<Text style={styles.logoAccent}>AI</Text></Text>
          <Text style={styles.subtitle}>Pose Intelligence & Automated Training</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{isRegister ? 'Create Account' : 'Welcome Back'}</Text>

          {isRegister && (
            <View style={styles.field}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                placeholder="John Doe"
                placeholderTextColor="#6B7280"
                value={name}
                onChangeText={setName}
              />
            </View>
          )}

          <View style={styles.field}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="athlete@fitfix.com"
              placeholderTextColor="#6B7280"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#6B7280"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <PrimaryButton
            title={loading ? 'Processing...' : isRegister ? 'Create Account' : 'Start Training'}
            onPress={handleSubmit}
            disabled={loading}
            style={{ marginTop: 10 }}
          />

          <Text
            onPress={() => setIsRegister(!isRegister)}
            style={styles.switchText}
          >
            {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0C'
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24
  },
  header: {
    alignItems: 'center',
    marginBottom: 32
  },
  logoTitle: {
    fontSize: 40,
    fontWeight: '900',
    color: '#FFFFFF'
  },
  logoAccent: {
    color: '#00E5FF'
  },
  subtitle: {
    color: '#9CA3AF',
    fontSize: 13,
    marginTop: 4
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderRadius: 24,
    padding: 24
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 20
  },
  field: {
    marginBottom: 16
  },
  label: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6
  },
  input: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#FFFFFF',
    fontSize: 15
  },
  switchText: {
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 18,
    fontSize: 13
  }
});
