import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { Activity, Flame, Dumbbell, Utensils } from 'lucide-react-native';
import StatCard from '../components/StatCard';
import { getPlan } from '../api/plan';

export default function MyPlanScreen({ navigation }) {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadPlan = async () => {
    try {
      setLoading(true);
      const res = await getPlan();
      if (res?.plan) setPlan(res.plan);
    } catch (e) {
      console.error('Error fetching plan:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlan();
  }, []);

  if (loading && !plan) {
    return (
      <View style={styles.center}>
        <Text style={styles.loadingText}>Loading your plan...</Text>
      </View>
    );
  }

  if (!plan) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>No active plan</Text>
        <Text style={styles.sub}>Set up your training plan in settings</Text>
      </View>
    );
  }

  const { metrics, goal, workoutPlan = [], dietPlan = [] } = plan;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scroll}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={loadPlan} tintColor="#00E5FF" />}
    >
      <Text style={styles.headerTitle}>My Training & Diet Plan</Text>
      {goal ? <Text style={styles.goalLabel}>{goal.label}</Text> : null}

      {/* Metrics Grid */}
      {metrics ? (
        <View style={styles.metricsGrid}>
          <StatCard icon={<Activity size={20} color="#00E5FF" />} label="BMI" value={metrics.bmi} sub={metrics.bmiBand} />
          <StatCard icon={<Flame size={20} color="#00E5FF" />} label="TDEE" value={`${metrics.tdee} kcal`} sub="Maintenance" />
          {goal ? <StatCard icon={<Utensils size={20} color="#00E5FF" />} label="Target" value={`${goal.dailyCalories} kcal`} sub="Daily Target" /> : null}
        </View>
      ) : null}

      {/* Workout Days */}
      <Text style={styles.sectionHeader}>Training Week</Text>
      {workoutPlan.map((d) => (
        <View key={d.day} style={styles.dayCard}>
          <View style={styles.dayHeader}>
            <Text style={styles.dayName}>{d.day}</Text>
            <Text style={styles.dayType}>{d.type}</Text>
          </View>
          {d.exercises.length > 0 ? (
            d.exercises.map((ex) => (
              <View key={ex.exerciseId} style={styles.exRow}>
                <Text style={styles.exName}>{ex.name}</Text>
                <Text style={styles.exSets}>{ex.sets}×{ex.reps}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.restText}>{d.focus}</Text>
          )}
        </View>
      ))}

      {/* Diet Days */}
      <Text style={[styles.sectionHeader, { marginTop: 20 }]}>Diet Week</Text>
      {dietPlan.map((d) => (
        <View key={d.day} style={styles.dayCard}>
          <View style={styles.dayHeader}>
            <Text style={styles.dayName}>{d.day}</Text>
            <Text style={styles.dayType}>{d.totals.kcal} kcal</Text>
          </View>
          {d.meals.map((m, idx) => (
            <View key={idx} style={styles.mealRow}>
              <Text style={styles.mealSlot}>{m.slot.toUpperCase()}</Text>
              <Text style={styles.mealName}>{m.name}</Text>
              <Text style={styles.mealKcal}>{m.kcal} kcal</Text>
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0C' },
  scroll: { padding: 20, paddingTop: 50 },
  center: { flex: 1, backgroundColor: '#0A0A0C', justifyContent: 'center', alignItems: 'center', padding: 20 },
  loadingText: { color: '#00E5FF', fontSize: 16, fontWeight: '700' },
  headerTitle: { color: '#FFFFFF', fontSize: 26, fontWeight: '900' },
  goalLabel: { color: '#00E5FF', fontSize: 14, fontWeight: '600', marginTop: 2, marginBottom: 16 },
  metricsGrid: { marginBottom: 16 },
  sectionHeader: { color: '#FFFFFF', fontSize: 18, fontWeight: '800', marginBottom: 12 },
  dayCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10
  },
  dayHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  dayName: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  dayType: { color: '#00E5FF', fontSize: 12, fontWeight: '600' },
  exRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  exName: { color: '#D1D5DB', fontSize: 13 },
  exSets: { color: '#9CA3AF', fontSize: 13 },
  restText: { color: '#6B7280', fontSize: 13 },
  mealRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  mealSlot: { color: '#6B7280', fontSize: 10, fontWeight: '700', width: 75 },
  mealName: { flex: 1, color: '#D1D5DB', fontSize: 13 },
  mealKcal: { color: '#9CA3AF', fontSize: 12 }
});
