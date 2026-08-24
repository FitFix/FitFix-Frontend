import { apiFetch } from './client';

export const getWorkoutSummary = (userId = 'me') => apiFetch(`/api/workouts/summary/${userId}`);
export const createWorkoutSession = (data) => apiFetch('/api/workouts/sessions', { method: 'POST', body: JSON.stringify(data) });
export const getExercises = () => apiFetch('/api/ai/exercises');
export const analyzeFrame = (exerciseId, base64Image) => apiFetch(`/api/ai/exercises/${exerciseId}/analyze`, {
  method: 'POST',
  body: JSON.stringify({ image: base64Image })
});
