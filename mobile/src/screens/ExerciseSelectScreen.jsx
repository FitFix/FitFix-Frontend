import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Dumbbell, Camera, ChevronRight } from 'lucide-react-native';
import { getExercises } from '../api/workout';
import exerciseRules from '../engine/ExerciseLogic';

export default function ExerciseSelectScreen({ navigation }) {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await getExercises();
        setExercises(data);
      } catch (e) {
        // Fallback to local catalog if API fails
        const fallback = Object.entries(exerciseRules).map(([id, r]) => ({
          id,
          name: r.name,
          description: r.description,
          targetJoints: r.targetJoints,
          hasPose: true
        }));
        setExercises(fallback);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.8}
      style={styles.card}
      onPress={() => navigation.navigate('CameraWorkout', { exerciseId: item.id })}
    >
      <View style={styles.cardHeader}>
        <View style={styles.iconBox}>
          <Dumbbell size={20} color="#00E5FF" />
        </View>
        <Camera size={18} color="#00E5FF" />
      </View>
      <Text style={styles.title}>{item.name}</Text>
      <Text style={styles.desc} numberOfLines={2}>{item.description}</Text>
      <View style={styles.cardFooter}>
        <Text style={styles.joints}>{(item.targetJoints || []).join(' · ')}</Text>
        <ChevronRight size={16} color="#6B7280" />
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00E5FF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Select Exercise</Text>
      <Text style={styles.subtitle}>Train with real-time pose AI form correction</Text>
      <FlatList
        data={exercises}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        numColumns={1}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0C',
    padding: 20,
    paddingTop: 50
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0A0A0C',
    justifyContent: 'center',
    alignItems: 'center'
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '900'
  },
  subtitle: {
    color: '#9CA3AF',
    fontSize: 13,
    marginBottom: 20,
    marginTop: 2
  },
  list: {
    paddingBottom: 20
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  iconBox: {
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
    padding: 8,
    borderRadius: 10
  },
  title: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800'
  },
  desc: {
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 4,
    marginBottom: 12
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    pt: 8
  },
  joints: {
    color: '#6B7280',
    fontSize: 11,
    textTransform: 'uppercase',
    fontWeight: '600'
  }
});
