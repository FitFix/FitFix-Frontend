import { apiFetch } from './client';

export const getProfile = () => apiFetch('/api/plan/profile');
export const saveProfile = (body) => apiFetch('/api/plan/profile', { method: 'PUT', body: JSON.stringify(body) });
export const getFeasibleGoals = () => apiFetch('/api/plan/feasible-goals');
export const generatePlan = (goalId) => apiFetch('/api/plan/generate', { method: 'POST', body: JSON.stringify({ goalId }) });
export const getPlan = () => apiFetch('/api/plan');
