import AsyncStorage from '@react-native-async-storage/async-storage';
import { Link, router } from 'expo-router';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Surface, Text, useTheme } from 'react-native-paper';

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

  return (
    <Surface style={styles.container} elevation={4}>
      <View style={styles.content}>
        <Text variant="headlineLarge" style={styles.title}>
         MUSESU Parking
        </Text>
        <Text variant="bodyLarge" style={styles.description}>
          Musesu LTD NI COMPANY Ifite imirimo you gucunga umutekano wibinyabiziga bi parika kumasoko nizindi nyubako zihuriraho abantu benshi,
          Iyi sysytem yifashishwa mu gucunga ndetse no gutanga amakuru ajyanye na Parking
        </Text>
      </View>
      <View style={styles.buttonRow}>
        <Link href="/login" asChild>
          <Button mode="contained" style={styles.button}>
            Injira
          </Button>
        </Link>
        <Link href="/signup" asChild>
          <Button mode="outlined" style={styles.button}>
            Iyandikishe
          </Button>
        </Link>
      </View>
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 24,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  title: {
    marginBottom: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 16,
    paddingHorizontal: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    gap: 16,
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
  },
});
