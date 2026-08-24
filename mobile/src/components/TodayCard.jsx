import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Camera, Check, Dumbbell, Utensils } from 'lucide-react-native';

const todayName = () => new Date().toLocaleDateString('en-US', { weekday: 'long' });
const doneKey = () => `ffx-done-${new Date().toISOString().slice(0, 10)}`;

export default function TodayCard({ plan, onNavigateWorkout }) {
  const [done, setDone] = React.useState(new Set());

  React.useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(doneKey());
        if (raw) setDone(new Set(JSON.parse(raw)));
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  const toggle = async (id) => {
    const next = new Set(done);
    next.has(id) ? next.delete(id) : next.add(id);
    setDone(next);
    await AsyncStorage.setItem(doneKey(), JSON.stringify([...next]));
  };

  const today = todayName();
  const w = (plan?.workoutPlan || []).find((d) => d.day === today) || null;
  const di = (plan?.dietPlan || []).find((d) => d.day === today) || null;
  const isTraining = w && w.type !== 'Rest' && w.exercises?.length > 0;
  const burned = isTraining ? w.exercises.filter((e) => done.has(e.exerciseId)).reduce((t, e) => t + (e.calories || 0), 0) : 0;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.todaySub}>TODAY · {today.toUpperCase()}</Text>
          <Text style={styles.title}>{isTraining ? `${w.type} Day` : 'Rest Day'}</Text>
        </View>
        {isTraining && (
          <View style={styles.burnBox}>
            <Text style={styles.burnLabel}>BURNED</Text>
            <Text style={styles.burnVal}>{burned} <Text style={styles.burnMax}>/ {w.dayBurn} kcal</Text></Text>
          </View>
        )}
      </View>

      {/* Workout section */}
      <View style={styles.section}>
        <View style={styles.sectionTitleRow}>
          <Dumbbell size={16} color="#00E5FF" />
          <Text style={styles.sectionTitle}>Workout</Text>
        </View>
        {isTraining ? (
          w.exercises.map((ex) => {
            const isDone = done.has(ex.exerciseId);
            return (
              <View key={ex.exerciseId} style={styles.exRow}>
                <Text style={[styles.exName, isDone && styles.strikethrough]}>{ex.name}</Text>
                <Text style={styles.exMeta}>{ex.sets}×{ex.reps}</Text>
                {ex.hasPose ? (
                  <TouchableOpacity onPress={() => onNavigateWorkout && onNavigateWorkout(ex.exerciseId)} style={styles.camBtn}>
                    <Camera size={16} color="#00E5FF" />
                  </TouchableOpacity>
                ) : null}
                <TouchableOpacity onPress={() => toggle(ex.exerciseId)} style={[styles.checkBtn, isDone && styles.checkBtnDone]}>
                  {isDone ? <Check size={14} color="#000" /> : null}
                </TouchableOpacity>
              </View>
            );
          })
        ) : (
          <Text style={styles.restText}>{w ? w.focus : 'Rest / easy walk — recover well.'}</Text>
        )}
      </View>

      {/* Meals section */}
      {di && (
        <View style={[styles.section, { marginTop: 14 }]}>
          <View style={styles.sectionTitleRow}>
            <Utensils size={16} color="#00E5FF" />
            <Text style={styles.sectionTitle}>Meals ({di.totals.kcal} kcal)</Text>
          </View>
          {di.meals.map((m, idx) => (
            <View key={idx} style={styles.mealRow}>
              <Text style={styles.mealSlot}>{m.slot.toUpperCase()}</Text>
              <Text style={styles.mealName}>{m.name}</Text>
              <Text style={styles.mealKcal}>{m.kcal} kcal</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderColor: 'rgba(0, 229, 255, 0.3)',
    borderWidth: 1,
    borderRadius: 20,
    padding: 18,
    marginBottom: 16
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  todaySub: {
    color: '#00E5FF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8
  },
  title: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    marginTop: 2
  },
  burnBox: {
    alignItems: 'flex-end'
  },
  burnLabel: {
    color: '#9CA3AF',
    fontSize: 10,
    fontWeight: '700'
  },
  burnVal: {
    color: '#00E5FF',
    fontSize: 16,
    fontWeight: '900'
  },
  burnMax: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '500'
  },
  section: {
    marginTop: 6
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10
  },
  sectionTitle: {
    color: '#E5E7EB',
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 6
  },
  exRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)'
  },
  exName: {
    flex: 1,
    color: '#D1D5DB',
    fontSize: 14
  },
  strikethrough: {
    textDecorationLine: 'line-through',
    color: '#6B7280'
  },
  exMeta: {
    color: '#9CA3AF',
    fontSize: 13,
    marginRight: 10
  },
  camBtn: {
    padding: 4,
    marginRight: 8
  },
  checkBtn: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#4B5563',
    alignItems: 'center',
    justifyContent: 'center'
  },
  checkBtnDone: {
    backgroundColor: '#00E5FF',
    borderColor: '#00E5FF'
  },
  restText: {
    color: '#6B7280',
    fontSize: 13
  },
  mealRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4
  },
  mealSlot: {
    color: '#6B7280',
    fontSize: 10,
    fontWeight: '700',
    width: 75
  },
  mealName: {
    flex: 1,
    color: '#D1D5DB',
    fontSize: 13
  },
  mealKcal: {
    color: '#9CA3AF',
    fontSize: 12
  }
});
