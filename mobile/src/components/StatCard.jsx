import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function StatCard({ icon, label, value, sub }) {
  return (
    <View style={styles.card}>
      <View style={styles.iconBox}>{icon}</View>
      <View style={styles.content}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
        {sub ? <Text style={styles.sub}>{sub}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  iconBox: {
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
    padding: 12,
    borderRadius: 12,
    marginRight: 14
  },
  content: {
    flex: 1
  },
  label: {
    color: '#9CA3AF',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8
  },
  value: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    marginTop: 2
  },
  sub: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 2
  }
});
