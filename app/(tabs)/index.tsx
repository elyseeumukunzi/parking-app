import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Surface, Text, useTheme } from 'react-native-paper';


export default function HomeScreen() {
    const theme = useTheme();
    const [loading, setLoading] = useState(true);
    const [authenticated, setAuthenticated] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const token = await AsyncStorage.getItem('authToken');
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



    return (
        <ScrollView contentContainerStyle={styles.scrollContent}>
            <Text style={[styles.header, { color: theme.colors.primary }]}>
                Dashboard
            </Text>

            <Surface style={styles.card}>
                <Text style={styles.cardTitle}>Today's Overview</Text>
                <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{todayStats.totalCars}</Text>
                        <Text style={styles.statLabel}>Total Cars</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{todayStats.entries}</Text>
                        <Text style={styles.statLabel}>Entries</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{todayStats.exits}</Text>
                        <Text style={styles.statLabel}>Exits</Text>
                    </View>
                </View>
            </Surface>

            <Surface style={styles.card}>
                <Text style={styles.cardTitle}>Available Parking</Text>
                {availableLocations.map((location, index) => (
                    <View key={index} style={styles.locationItem}>
                        <Text>{location.name}</Text>
                        <Text>{`${location.available} / ${location.total} available`}</Text>
                    </View>
                ))}
            </Surface>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        flexGrow: 1,
        padding: 16,
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    card: {
        borderRadius: 8,
        padding: 16,
        marginBottom: 16,
        elevation: 2,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    statLabel: {
        fontSize: 12,
        color: 'gray',
    },
    locationItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
});
