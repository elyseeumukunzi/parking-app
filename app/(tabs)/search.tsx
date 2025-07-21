import * as React from 'react';
import { Keyboard, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Surface, Text, TextInput } from 'react-native-paper';
import CONFIG from '../config';

export default function SearchScreen() {
  const [editingIdx, setEditingIdx] = React.useState<number | null>(null);
  const [editTimeOut, setEditTimeOut] = React.useState('');
  const [editPaymentStatus, setEditPaymentStatus] = React.useState<'paid' | 'unpaid'>('paid');
  const [plate, setPlate] = React.useState('');
  const [results, setResults] = React.useState<any[]>([]);
  const [searched, setSearched] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [localResults, setLocalResults] = React.useState<any[]>([]);
  const [statusChanged, setStatusChanged] = React.useState(false);

  React.useEffect(() => {
    setLocalResults(results.map(r => ({ ...r })));
  }, [results]);

  const handleSearch = async () => {
    Keyboard.dismiss();
    setLoading(true);
    setSearched(false);

    try {
      const response = await fetch(
        `${CONFIG.API_BASE_URL}get_parking&plate_number=${plate.trim()}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }

      const data = await response.json();

      const formattedData = data.map((item: any) => ({
        plate: item.plate_number,
        owner: item.owner || 'Unknown',
        parkingLocation: item.location_name || 'N/A',
        timeIn: `${item.arrival_date} ${item.arrival_time}`,
        timeOut: item.departure_date && item.departure_time
          ? `${item.departure_date} ${item.departure_time}`
          : '',
        vehicle: item.category || 'Vehicle',
        payment: item.charges || '0',
        status: item.payment_status,
        date: item.arrival_date,
        parkingStatus: item.parking_status,
      }));

      setResults(formattedData);
    } catch (error) {
      console.error('Error fetching parking data:', error);
      setResults([]);
    } finally {
      setSearched(true);
      setLoading(false);
      setStatusChanged(false);
    }
  };

  const handleEdit = (idx: number, result: any) => {
    setEditingIdx(idx);
    setEditTimeOut(result.timeOut || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    setEditPaymentStatus(result.status === 'paid' ? 'paid' : 'unpaid');
  };

  const handleCancel = () => {
    setEditingIdx(null);
    setEditTimeOut('');
    setEditPaymentStatus('paid');
  };

  const handleConfirm = (idx: number) => {
    setLocalResults(prev => {
      const updated = [...prev];
      updated[idx] = {
        ...updated[idx],
        timeOut: editTimeOut,
        status: editPaymentStatus,
        parkingStatus: 'completed',
      };
      return updated;
    });
    setEditingIdx(null);
    setStatusChanged(true);
  };

  const unpaidRecords = localResults.filter(r => r.status === 'unpaid');
  const totalUnpaid = unpaidRecords.reduce((sum, r) => sum + Number(r.payment), 0);

  return (
    <Surface style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>Search Parking by Plate</Text>

      <TextInput
        label="Plate Number"
        value={plate}
        onChangeText={setPlate}
        mode="outlined"
        autoCapitalize="characters"
        style={styles.input}
        left={<TextInput.Icon icon="car" />}
      />

      <Button
        mode="contained"
        onPress={handleSearch}
        loading={loading}
        disabled={!plate.trim()}
        style={styles.button}
      >
        Search
      </Button>

      <ScrollView style={{ flex: 1 }}>
        {searched && unpaidRecords.length > 0 && !loading && (
          <Card style={styles.unpaidCard}>
            <Card.Title title="Unpaid Amounts" />
            <Card.Content>
              <Text>Total unpaid: {totalUnpaid} RWF</Text>
              <Text>Unpaid records: {unpaidRecords.length}</Text>
            </Card.Content>
          </Card>
        )}

        {searched && localResults.length === 0 && !loading && (
          <Text style={styles.noResult}>No parking info found for this plate.</Text>
        )}

        {localResults.map((result, idx) => {
          const isEditing = editingIdx === idx;
          return (
            <Card key={idx} style={styles.resultCard}>
              <Card.Title title={result.vehicle} subtitle={`Owner: ${result.owner}`} />
              <Card.Content>
                <Text>Plate: {result.plate}</Text>
                <Text>Parking Location: {result.parkingLocation}</Text>
                <Text>Date: {result.date}</Text>
                <Text>Time In: {result.timeIn}</Text>
                <Text>Time Out: {result.timeOut}</Text>
                <Text>Payment: {result.payment} RWF ({result.status})</Text>
                <Text>Parking Status: {result.parkingStatus}</Text>

                {!isEditing && result.parkingStatus === 'active' && (
                  <Button
                    mode="contained"
                    onPress={() => handleEdit(idx, result)}
                    style={styles.statusButton}
                  >
                    Remove Vehicle
                  </Button>
                )}

                {isEditing && (
                  <View>
                    <Text style={{ marginTop: 10 }}>Confirm Departure:</Text>
                    <TextInput
                      label="Time Out"
                      value={editTimeOut}
                      onChangeText={setEditTimeOut}
                      mode="outlined"
                      style={{ marginTop: 8 }}
                    />

                    <Text style={{ marginTop: 8 }}>Payment Status</Text>
                    <Button
                      mode={editPaymentStatus === 'paid' ? 'contained' : 'outlined'}
                      onPress={() => setEditPaymentStatus('paid')}
                      style={{ marginTop: 6, marginRight: 8 }}
                    >
                      Paid
                    </Button>
                    <Button
                      mode={editPaymentStatus === 'unpaid' ? 'contained' : 'outlined'}
                      onPress={() => setEditPaymentStatus('unpaid')}
                      style={{ marginTop: 6 }}
                    >
                      Unpaid
                    </Button>

                    <Button
                      mode="contained"
                      onPress={() => handleConfirm(idx)}
                      style={{ marginTop: 12 }}
                    >
                      Confirm Remove
                    </Button>
                    <Button
                      mode="text"
                      onPress={handleCancel}
                      style={{ marginTop: 4 }}
                    >
                      Cancel
                    </Button>
                  </View>
                )}

                {statusChanged && editingIdx === null && (
                  <Text style={{ color: 'green', marginTop: 4 }}>Status updated locally.</Text>
                )}
              </Card.Content>
            </Card>
          );
        })}
      </ScrollView>
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
  },
  title: {
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginBottom: 24,
  },
  unpaidCard: {
    marginTop: 12,
    backgroundColor: '#ffeaea',
    borderColor: '#ff7675',
    borderWidth: 1,
  },
  resultCard: {
    marginTop: 12,
    backgroundColor: '#f6f6f6',
  },
  statusButton: {
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  noResult: {
    marginTop: 16,
    color: 'gray',
    textAlign: 'center',
  },
});
