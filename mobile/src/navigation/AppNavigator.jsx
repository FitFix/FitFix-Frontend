import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LayoutDashboard, Dumbbell, Calendar } from 'lucide-react-native';

import DashboardScreen from '../screens/DashboardScreen';
import ExerciseSelectScreen from '../screens/ExerciseSelectScreen';
import MyPlanScreen from '../screens/MyPlanScreen';
import CameraWorkoutScreen from '../screens/CameraWorkoutScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function WorkoutStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ExerciseSelect" component={ExerciseSelectScreen} />
      <Stack.Screen name="CameraWorkout" component={CameraWorkoutScreen} />
    </Stack.Navigator>
  );
}

export default function AppNavigator({ onLogout }) {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0A0A0C',
          borderTopColor: 'rgba(255, 255, 255, 0.1)',
          paddingBottom: 6,
          height: 60
        },
        tabBarActiveTintColor: '#00E5FF',
        tabBarInactiveTintColor: '#6B7280'
      }}
    >
      <Tab.Screen
        name="Dashboard"
        options={{
          tabBarIcon: ({ color, size }) => <LayoutDashboard color={color} size={size} />
        }}
      >
        {(props) => <DashboardScreen {...props} onLogout={onLogout} />}
      </Tab.Screen>

      <Tab.Screen
        name="Workouts"
        component={WorkoutStack}
        options={{
          tabBarIcon: ({ color, size }) => <Dumbbell color={color} size={size} />
        }}
      />

      <Tab.Screen
        name="MyPlan"
        component={MyPlanScreen}
        options={{
          tabBarLabel: 'My Plan',
          tabBarIcon: ({ color, size }) => <Calendar color={color} size={size} />
        }}
      />
    </Tab.Navigator>
  );
}
