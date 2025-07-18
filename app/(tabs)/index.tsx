import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Surface, Text, useTheme } from 'react-native-paper';

export default function IndexScreen() {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          router.replace('/(auth)/splash');
        } else {
          setAuthenticated(true);
        }
      } catch (e) {
        router.replace('/(auth)/splash');
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  if (loading) return null;
  if (!authenticated) return null;

  // Mocked dashboard data
  const todayStats = {
    totalCars: 120,
    entries: 90,
    exits: 80,
    revenue: 35000, // in local currency
    busiestHour: '10:00 - 11:00',
  };
  const availableLocations = [
    { name: 'Main Market', available: 12, total: 50 },
    { name: 'Bus Park', available: 3, total: 30 },
    { name: 'Mall Parking', available: 20, total: 40 },
  ];
  const now = new Date();

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <Surface style={styles.container} elevation={4}>
        <Text variant="headlineLarge" style={styles.title}>MUSESU Parking Dashboard</Text>
        <Text variant="bodyLarge" style={styles.subtitle}>
          {now.toLocaleDateString()} | {now.toLocaleTimeString()}
        </Text>

        {/* Statistics Cards */}
        <View style={styles.cardRow}>
          <Surface style={styles.card} elevation={2}>
            <Text variant="titleMedium">Total Cars Today</Text>
            <Text variant="displaySmall" style={styles.stat}>{todayStats.totalCars}</Text>
          </Surface>
          <Surface style={styles.card} elevation={2}>
            <Text variant="titleMedium">Entries</Text>
            <Text variant="displaySmall" style={styles.stat}>{todayStats.entries}</Text>
          </Surface>
          <Surface style={styles.card} elevation={2}>
            <Text variant="titleMedium">Exits</Text>
            <Text variant="displaySmall" style={styles.stat}>{todayStats.exits}</Text>
          </Surface>
        </View>

        <View style={styles.cardRow}>
          <Surface style={styles.card} elevation={2}>
            <Text variant="titleMedium">Today's Revenue</Text>
            <Text variant="displaySmall" style={styles.stat}>{todayStats.revenue} RWF</Text>
          </Surface>
          <Surface style={styles.card} elevation={2}>
            <Text variant="titleMedium">Busiest Hour</Text>
            <Text variant="displaySmall" style={styles.stat}>{todayStats.busiestHour}</Text>
          </Surface>
        </View>

        {/* Available Parking Locations */}
        <Text variant="titleMedium" style={{marginTop: 24, marginBottom: 8}}>Available Parking Locations</Text>
        <View style={styles.locationList}>
          {availableLocations.map((loc, idx) => (
            <Surface key={idx} style={styles.locationCard} elevation={1}>
              <Text variant="bodyLarge" style={{fontWeight: 'bold'}}>{loc.name}</Text>
              <Text variant="bodyMedium">Available: <Text style={{color: 'green'}}>{loc.available}</Text> / {loc.total}</Text>
            </Surface>
          ))}
        </View>
      </Surface>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingVertical: 24,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 24,
  },
  title: {
    marginBottom: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 16,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 12,
  },
  card: {
    flex: 1,
    marginHorizontal: 4,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#f7f7fa',
  },
  stat: {
    fontWeight: 'bold',
    color: '#0a4d1a',
    marginTop: 8,
  },
  locationList: {
    gap: 10,
  },
  locationCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    marginBottom: 8,
    borderRadius: 10,
    backgroundColor: '#e6f2ff',
  },
});
