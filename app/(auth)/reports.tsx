import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Button, List, Surface, Text, TextInput, useTheme } from 'react-native-paper';
import CONFIG from '../config';

// Types
type User = {
  id: number;
  name: string;
  email: string;
};

// Parking record returned by backend
interface ParkingRecord {
  id: number;
  plate_number: string;
  time_in: string;
  time_out: string | null;
  payment_status: string;
  amount_paid: number;
  location: string | null;
}

// Summary structure returned by backend (optional)
interface ReportSummary {
  total_entries: number;
  total_revenue: number;
  completed_entries: number;
  active_entries: number;
  paid_entries: number;
  unpaid_entries: number;
  paid_revenue: number;
  unpaid_revenue: number;
  date_range: {
    from: string;
    to: string;
  };
}



// Users will be fetched from the API

// Parking data will be fetched dynamically from the API when the admin taps "Generate"

export default function ReportsScreen() {
  const theme = useTheme();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [showToDatePicker, setShowToDatePicker] = useState(false);
  const [reportData, setReportData] = useState<ParkingRecord[]>([]);
  const [summary, setSummary] = useState<ReportSummary | null>(null);

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

  // Fetch users once component mounts
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(`${CONFIG.API_BASE_URL}list_users`);
        const json = await response.json();
        if (json.success) {
          setUsers(json.data);
        } else {
          console.warn('Failed to fetch users', json);
        }
      } catch (error) {
        console.error('Error fetching users', error);
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user: User) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedUserData = users.find((u: User) => u.id === selectedUser?.id);

  const generateReport = async () => {
    if (!selectedUser) return;
    try {
      const body = {
        user_id: selectedUser.id,
        from_date: fromDate ? format(fromDate, 'yyyy-MM-dd') : '',
        to_date: toDate ? format(toDate, 'yyyy-MM-dd') : ''
      };
      const response = await fetch(`${CONFIG.API_BASE_URL}user_report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const json = await response.json();
      if (json.success) {
        setReportData(json.data as ParkingRecord[]);
        setSummary(json.summary as ReportSummary);
      } else {
        console.warn('Failed to fetch report', json);
      }
    } catch (error) {
      console.error('Error fetching report', error);
    }
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
                  minimumDate={fromDate ?? undefined}
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

          {reportData.length > 0 && (
            <View style={styles.reportResults}>
              <Text variant="titleSmall" style={styles.resultsTitle}>Report Results ({reportData.length})</Text>
              {reportData.map((report: ParkingRecord) => (
                <Surface key={report.id} style={styles.reportItem} elevation={1}>
                  <Text style={styles.reportDate}>P: {report.plate_number}</Text>
                  <Text>Time In: {report.time_in}</Text>
                  {report.time_out && <Text>Time Out: {report.time_out}</Text>}
                 
                    <Text>Amount: {report.amount_paid} RWF</Text>
                    <Text>Payment: {report.payment_status}</Text>
                    {report.location && <Text>Location: {report.location}</Text>}
                    
                  
                </Surface>
              ))}
            </View>
          )}

          {summary && (
            <Surface style={styles.summaryBox} elevation={1}>
              <Text>Total Entries: {summary.total_entries}</Text>
              <Text>Completed: {summary.completed_entries}</Text>
              <Text>Active: {summary.active_entries}</Text>
              <Text>Paid: {summary.paid_entries}</Text>
              <Text>Unpaid: {summary.unpaid_entries}</Text>
              <Text style={{ marginTop: 4 }}>Revenue - Paid: {summary.paid_revenue} RWF</Text>
              <Text>Revenue - Unpaid: {summary.unpaid_revenue} RWF</Text>
              <Text style={{ marginTop: 4, fontWeight: 'bold' }}>Revenue - Total: {summary.total_revenue} RWF</Text>
            </Surface>
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
  summaryBox: {
    padding: 12,
    borderRadius: 6,
    backgroundColor: '#fff',
    marginTop: 12,
  },
  revenue: {
    color: '#2e7d32',
    fontWeight: 'bold',
  },
});
