import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { useState } from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Button, List, Surface, Text, TextInput, useTheme } from 'react-native-paper';

// Types
type User = {
  id: number;
  name: string;
  email: string;
};

type Report = {
  id: number;
  date: string;
  entries: number;
  exits: number;
  revenue: number;
};

type ReportsData = {
  [key: number]: Report[];
};

// Mock data for users
const MOCK_USERS: User[] = [
  { id: 1, name: 'John Doe', email: 'john@example.com' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
  { id: 3, name: 'Admin User', email: 'admin@example.com' },
  { id: 4, name: 'Test User', email: 'test@example.com' },
];

// Mock report data
const MOCK_REPORTS: ReportsData = {
  1: [
    { id: 1, date: '2025-07-28', entries: 5, exits: 4, revenue: 5000 },
    { id: 2, date: '2025-07-27', entries: 3, exits: 3, revenue: 3000 },
  ],
  2: [
    { id: 3, date: '2025-07-28', entries: 7, exits: 7, revenue: 7000 },
  ],
};

export default function ReportsScreen() {
  const theme = useTheme();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [showToDatePicker, setShowToDatePicker] = useState(false);

  const onFromDateChange = (event: any, selectedDate?: Date) => {
    setShowFromDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setFromDate(selectedDate);
    }
  };

  const onToDateChange = (event: any, selectedDate?: Date) => {
    setShowToDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setToDate(selectedDate);
    }
  };

  const formatDate = (date: Date | null) => {
    return date ? format(date, 'yyyy-MM-dd') : '';
  };

  const filteredUsers = MOCK_USERS.filter((user: User) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const userReports = selectedUser ? (MOCK_REPORTS[selectedUser.id as keyof typeof MOCK_REPORTS] || []) : [];
  const selectedUserData = MOCK_USERS.find((u: User) => u.id === selectedUser?.id);

  const generateReport = () => {
    // In a real app, this would fetch the report data from your API
    console.log('Generating report for:', selectedUser, 'from', fromDate, 'to', toDate);
  };

  return (
    <ScrollView style={styles.container}>
      <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.primary }]}>
        RAPORO ZABAKOZI
      </Text>

      <Surface style={styles.surface} elevation={2}>
        <Text variant="titleMedium" style={styles.sectionTitle}>Select User</Text>
        <TextInput
          label="Shakisha..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          mode="outlined"
          style={styles.input}
          left={<TextInput.Icon icon="magnify" />}
        />

        {filteredUsers.map((user: User) => (
          <List.Item
            key={user.id}
            title={user.name}
            description={user.email}
            left={props => <List.Icon {...props} icon="account" />}
            onPress={() => setSelectedUser(user)}
            style={[
              styles.userItem,
              selectedUser?.id === user.id && { backgroundColor: theme.colors.surfaceVariant }
            ]}
          />
        ))}
      </Surface>

      {selectedUser && (
        <Surface style={[styles.surface, styles.reportSection]} elevation={2}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Report for {selectedUserData?.name}
          </Text>

          <View style={styles.dateRangeContainer}>
            <View style={styles.dateInputContainer}>
              <Text style={styles.dateLabel}>Kuva tariki</Text>
              <Button
                mode="outlined"
                onPress={() => setShowFromDatePicker(true)}
                style={styles.dateButton}
                icon="calendar"
              >
                {fromDate ? formatDate(fromDate) : 'Hitamo itariki'}
              </Button>
              {showFromDatePicker && (
                <DateTimePicker
                  value={fromDate || new Date()}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={onFromDateChange}
                  maximumDate={toDate || new Date()}
                />
              )}
            </View>

            <View style={styles.dateInputContainer}>
              <Text style={styles.dateLabel}>Kugeza tariki</Text>
              <Button
                mode="outlined"
                onPress={() => setShowToDatePicker(true)}
                style={styles.dateButton}
                icon="calendar"
              >
                {toDate ? formatDate(toDate) : 'Hitamo itariki'}
              </Button>
              {showToDatePicker && (
                <DateTimePicker
                  value={toDate || new Date()}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={onToDateChange}
                  minimumDate={fromDate}
                  maximumDate={new Date()}
                />
              )}
            </View>
          </View>

          <Button
            mode="contained"
            onPress={generateReport}
            style={styles.generateButton}
            icon="file-chart"
          >
            Kurura amakuru
          </Button>

          {userReports.length > 0 && (
            <View style={styles.reportResults}>
              <Text variant="titleSmall" style={styles.resultsTitle}>Report Results</Text>
              {userReports.map((report: Report) => (
                <Surface key={report.id} style={styles.reportItem}>
                  <Text style={styles.reportDate}>{report.date}</Text>
                  <View style={styles.reportStats}>
                    <Text>Entries: {report.entries}</Text>
                    <Text>Exits: {report.exits}</Text>
                    <Text style={styles.revenue}>
                      Revenue: {report.revenue.toLocaleString()} RWF
                    </Text>
                  </View>
                </Surface>
              ))}
            </View>
          )}
        </Surface>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  surface: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: 'white',
  },
  sectionTitle: {
    marginBottom: 16,
    fontWeight: 'bold',
  },
  input: {
    marginBottom: 12,
    backgroundColor: 'white',
  },
  userList: {
    maxHeight: 200,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
  },
  userItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  reportSection: {
    marginTop: 8,
  },
  dateRangeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dateInputContainer: {
    flex: 1,
    marginRight: 8,
  },
  dateLabel: {
    marginBottom: 4,
    marginLeft: 4,
    fontSize: 12,
    color: 'rgba(0, 0, 0, 0.6)',
  },
  dateButton: {
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderColor: 'rgba(0, 0, 0, 0.23)',
  },
  generateButton: {
    marginVertical: 8,
  },
  reportResults: {
    marginTop: 16,
  },
  resultsTitle: {
    marginBottom: 12,
    fontWeight: 'bold',
  },
  reportItem: {
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
    backgroundColor: '#f8f9fa',
  },
  reportDate: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  reportStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  revenue: {
    color: '#2e7d32',
    fontWeight: 'bold',
  },
});
