import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import AuthNavigator from './src/navigation/AuthNavigator';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      setIsAuthenticated(!!token);
    } catch (e) {
      setIsAuthenticated(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  if (isAuthenticated === null) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00E5FF" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      {isAuthenticated ? (
        <AppNavigator onLogout={() => setIsAuthenticated(false)} />
      ) : (
        <AuthNavigator onLoginSuccess={() => setIsAuthenticated(true)} />
      )}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0A0A0C',
    justifyContent: 'center',
    alignItems: 'center'
  }
});
