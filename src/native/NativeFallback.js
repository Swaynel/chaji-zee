import React from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';

export default function NativeFallback() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.card}>
        <Text style={styles.eyebrow}>FightBook</Text>
        <Text style={styles.title}>Web-first architecture enabled</Text>
        <Text style={styles.body}>
          This build now uses a hash router, lazy page modules, and CSS animations on web.
          Native can be added back as a separate experience once the product flow is settled.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#120f0d',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 560,
    padding: 24,
    borderRadius: 28,
    backgroundColor: '#211915',
    borderWidth: 1,
    borderColor: 'rgba(255, 237, 224, 0.12)',
    gap: 12,
  },
  eyebrow: {
    color: '#ffb27e',
    fontSize: 13,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  title: {
    color: '#f8efe7',
    fontSize: 28,
    fontWeight: '700',
  },
  body: {
    color: '#cebba9',
    fontSize: 16,
    lineHeight: 23,
  },
});
