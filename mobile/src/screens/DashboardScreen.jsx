import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { Activity, Flame, Dumbbell, Calendar } from 'lucide-react-native';
import StatCard from '../components/StatCard';
import TodayCard from '../components/TodayCard';
import { getWorkoutSummary } from '../api/workout';
import { getPlan } from '../api/plan';
import { logout } from '../api/auth';

export default function DashboardScreen({ navigation, onLogout }) {
  const [summary, setSummary] = useState(null);
  const [plan, setPlan] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      setRefreshing(true);
      const [sumRes, planRes] = await Promise.allSettled([
        getWorkoutSummary('me'),
        getPlan()
      ]);
      if (sumRes.status === 'fulfilled') setSummary(sumRes.value);
      if (planRes.status === 'fulfilled' && planRes.value?.plan) {
        setPlan(planRes.value.plan);
      }
    } catch (err) {
      console.error('Error loading dashboard:', err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scroll}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadData} tintColor="#00E5FF" />}
    >
      <View style={styles.topRow}>
        <View>
          <Text style={styles.greeting}>Welcome Back</Text>
          <Text style={styles.headerTitle}>FitFix Dashboard</Text>
        </View>
        <TouchableOpacity onPress={async () => { await logout(); if (onLogout) onLogout(); }} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Today's Schedule Card */}
      {plan ? (
        <TodayCard
          plan={plan}
          onNavigateWorkout={(exId) => navigation.navigate('CameraWorkout', { exerciseId: exId })}
        />
      ) : null}

      {/* Stat Cards */}
      <Text style={styles.sectionHeading}>Your Progress</Text>
      <View style={styles.statsGrid}>
        <StatCard
          icon={<Dumbbell size={22} color="#00E5FF" />}
          label="Total Workouts"
          value={summary?.totalWorkouts ?? 0}
          sub="Sessions completed"
        />
        <StatCard
          icon={<Flame size={22} color="#00E5FF" />}
          label="Total Reps"
          value={summary?.totalReps ?? 0}
          sub="Reps tracked by AI"
        />
        <StatCard
          icon={<Calendar size={22} color="#00E5FF" />}
          label="Active Days"
          value={summary?.activeDays ?? 0}
          sub="Days in gym"
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0C'
  },
  scroll: {
    padding: 20,
    paddingTop: 50
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  greeting: {
    color: '#9CA3AF',
    fontSize: 13,
    fontWeight: '600'
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '900'
  },
  logoutBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 10
  },
  logoutText: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '600'
  },
  sectionHeading: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 10,
    marginBottom: 12
  },
  statsGrid: {
    marginTop: 4
  }
});
