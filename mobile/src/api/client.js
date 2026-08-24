import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config/config';

export const getAuthHeaders = async () => {
  const token = await AsyncStorage.getItem('token');
  return {
    'Authorization': token ? `Bearer ${token}` : '',
    'Content-Type': 'application/json'
  };
};

export const apiFetch = async (endpoint, options = {}) => {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: { ...headers, ...(options.headers || {}) }
  });

  const data = await res.json().catch(err => {
    console.error('JSON parse error:', err);
    throw new Error('Invalid response from server');
  });

  if (!res.ok) {
    throw new Error(data.error || 'API Request failed');
  }

  return data;
};
