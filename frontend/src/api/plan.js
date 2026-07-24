import { API_BASE_URL } from '../config';

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`,
  'Content-Type': 'application/json'
});

async function handle(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const getProfile = () =>
  fetch(`${API_BASE_URL}/api/plan/profile`, { headers: authHeaders() }).then(handle);

export const saveProfile = (body) =>
  fetch(`${API_BASE_URL}/api/plan/profile`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(body) }).then(handle);

export const getFeasibleGoals = () =>
  fetch(`${API_BASE_URL}/api/plan/feasible-goals`, { headers: authHeaders() }).then(handle);

export const generatePlan = (goalId) =>
  fetch(`${API_BASE_URL}/api/plan/generate`, { method: 'POST', headers: authHeaders(), body: JSON.stringify({ goalId }) }).then(handle);

export const getPlan = () =>
  fetch(`${API_BASE_URL}/api/plan`, { headers: authHeaders() }).then(handle);
