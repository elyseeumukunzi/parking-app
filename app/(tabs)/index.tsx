import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { Surface, Text, useTheme } from 'react-native-paper';
import CONFIG from '../config';

interface TodayStats {
  total_entries: number;
  paid_entries: number;
  unpaid_entries: number;
  total_revenue: number;
  active_entries: number;
  busiest_hour: string;
}

interface LocationStats {
  name: string;
  available: number;
  total: number;
}

export default function HomeScreen() {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [stats, setStats] = useState<TodayStats | null>(null);
  const [locations, setLocations] = useState<LocationStats[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        const userId = await AsyncStorage.getItem('userId');
        
        if (!token || !userId) {
          router.replace('/(auth)/splash');
          return;
        }

        setAuthenticated(true);
        fetchDashboardData(userId);
      } catch (e) {
        console.error('Auth error:', e);
        setError('Authentication error');
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const fetchDashboardData = async (userId: string) => {
    try {
      const response = await axios.post(`${CONFIG.API_BASE_URL}today_stats`, {
        user_id: userId
      });

      if (response.data.success) {
        setStats(response.data.stats);
        setLocations(response.data.locations);
      } else {
        setError('Failed to load dashboard data');
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      {/* Today's Overview */}
      <Surface style={styles.card}>
        <Text variant="headlineMedium" style={styles.cardTitle}>Today's Overview</Text>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text variant="displayMedium">{stats?.total_entries || 0}</Text>
            <Text variant="bodyMedium">Total</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text variant="displayMedium" style={{ color: '#4CAF50' }}>
              {stats?.paid_entries || 0}
            </Text>
            <Text variant="bodyMedium">Paid</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text variant="displayMedium" style={{ color: '#F44336' }}>
              {stats?.unpaid_entries || 0}
            </Text>
            <Text variant="bodyMedium">Unpaid</Text>
          </View>
        </View>

        <View style={styles.revenueContainer}>
          <Text variant="titleMedium">
            Total Revenue: {stats?.total_revenue?.toLocaleString() || '0'} RWF
          </Text>
          <Text variant="bodyMedium">
            Busiest Hour: {stats?.busiest_hour || 'N/A'}
          </Text>
          <Text variant="bodySmall" style={{ marginTop: 4, color: '#666' }}>
            Active Parkings: {stats?.active_entries || 0}
          </Text>
        </View>
      </Surface>

      {/* Available Parking */}
      <Surface style={styles.card}>
        <Text variant="headlineSmall" style={styles.cardTitle}>Available Parking</Text>
        {locations.length > 0 ? (
          locations.map((location, index) => (
            <View key={index} style={styles.locationItem}>
              <Text>{location.name}</Text>
              <Text>
                <Text style={{ color: location.available > 0 ? '#4CAF50' : '#F44336' }}>
                  {location.available}
                </Text>
                {` / ${location.total} available`}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.noDataText}>No parking location data available</Text>
        )}
      </Surface>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#F44336',
    fontSize: 16,
  },
  noDataText: {
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 16,
  },
  card: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    elevation: 2,
  },
  cardTitle: {
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  revenueContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  locationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
});
