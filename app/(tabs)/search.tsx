import * as React from 'react';
import { Keyboard, ScrollView, StyleSheet } from 'react-native';
import { Button, Card, Surface, Text, TextInput } from 'react-native-paper';

// Mocked parking data
const MOCKED_PARKING_DATA = [
  {
    plate: 'ABC123',
    owner: 'John Doe',
    parkingLocation: 'Downtown Lot 3',
    timeIn: '2025-07-14 08:30',
    timeOut: '2025-07-14 17:00',
    vehicle: 'Toyota Corolla',
    payment: '200',
    status: 'paid',
    date: '2025-07-14',
    parkingStatus: 'active',
  },
  {
    plate: 'ABC123',
    owner: 'John Doe',
    parkingLocation: 'Downtown Lot 3',
    timeIn: '2025-07-14 08:30',
    timeOut: '2025-07-14 17:00',
    vehicle: 'Toyota Corolla',
    payment: '200',
    status: 'paid',
    date: '2025-07-14',
    parkingStatus: 'completed',
  },
  {
    plate: 'ABC123',
    owner: 'John Doe',
    parkingLocation: 'Mall Parking',
    timeIn: '2025-07-13 09:00',
    timeOut: '2025-07-13 12:00',
    vehicle: 'Toyota Corolla',
    payment: '150',
    status: 'paid',
    date: '2025-07-13',
    parkingStatus: 'completed',
  },
  {
    plate: 'XYZ789',
    owner: 'Jane Smith',
    parkingLocation: 'Airport Lot',
    timeIn: '2025-07-14 10:00',
    timeOut: '2025-07-14 18:00',
    vehicle: 'Honda Fit',
    payment: '250',
    status: 'unpaid',
    date: '2025-07-14',
    parkingStatus: 'active',
  },
];

export default function SearchScreen() {
  const [editingIdx, setEditingIdx] = React.useState<number | null>(null);
  const [editTimeOut, setEditTimeOut] = React.useState('');
  const [editPaymentStatus, setEditPaymentStatus] = React.useState<'paid' | 'unpaid'>('paid');
  const [plate, setPlate] = React.useState('');
  const [results, setResults] = React.useState<any[]>([]);
  const [searched, setSearched] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [localResults, setLocalResults] = React.useState<any[]>([]); // for status change
  const [statusChanged, setStatusChanged] = React.useState(false);

  React.useEffect(() => {
    // Keep local copy for status changes
    setLocalResults(results.map(r => ({ ...r })));
  }, [results]);

  const handleSearch = () => {
    Keyboard.dismiss();
    setLoading(true);
    setTimeout(() => {
      const found = MOCKED_PARKING_DATA.filter(
        (entry) => entry.plate.toUpperCase() === plate.trim().toUpperCase()
      );
      setResults(found);
      setSearched(true);
      setLoading(false);
      setStatusChanged(false);
    }, 600);
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




  // Calculate unpaid summary
  const unpaidRecords = localResults.filter(r => r.status === 'unpaid');
  const totalUnpaid = unpaidRecords.reduce((sum, r) => sum + Number(r.payment), 0);

  return (
    <Surface style={styles.container} elevation={2}>
      <Text variant="headlineMedium" style={styles.title}>Search Parking by Plate</Text>
      <TextInput
        label="Plate Number"
        value={plate}
        onChangeText={setPlate}
        mode="outlined"
        style={styles.input}
        autoCapitalize="characters"
        left={<TextInput.Icon icon="car" />}
      />
      <Button
        mode="contained"
        onPress={handleSearch}
        loading={loading}
        style={styles.button}
        disabled={!plate.trim()}
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
          let parkingStatus = result.parkingStatus || 'active';
          const isEditing = editingIdx === idx;
          return (
            <Card style={styles.resultCard} key={idx}>
              <Card.Title title={result.vehicle} subtitle={`Owner: ${result.owner}`} />
              <Card.Content>
                <Text>Plate: {result.plate}</Text>
                <Text>Parking Location: {result.parkingLocation}</Text>
                <Text>Date: {result.date}</Text>
                <Text>Time In: {result.timeIn}</Text>
                <Text>Time Out: {result.timeOut}</Text>
                <Text>Payment: {result.payment} RWF ({result.status})</Text>
                <Text>Parking Status: {parkingStatus}</Text>
                {parkingStatus === 'active' && !isEditing && (
                  <Button
                    mode="contained"
                    onPress={() => handleEdit(idx, result)}
                    style={styles.statusButton}
                  >
                    Remove Vehicle from Parking
                  </Button>
                )}
                {isEditing && (
                  <>
                    <Text style={{marginTop: 10}}>Confirm Departure Details:</Text>
                    <TextInput
                      label="Time Out"
                      value={editTimeOut}
                      onChangeText={setEditTimeOut}
                      mode="outlined"
                      style={{marginTop: 8}}
                    />
                    <Text style={{marginTop: 8}}>Payment Status</Text>
                    <Button
                      mode={editPaymentStatus === 'paid' ? 'contained' : 'outlined'}
                      onPress={() => setEditPaymentStatus('paid')}
                      style={{marginTop: 6, marginRight: 8, alignSelf: 'flex-start'}}
                    >Paid</Button>
                    <Button
                      mode={editPaymentStatus === 'unpaid' ? 'contained' : 'outlined'}
                      onPress={() => setEditPaymentStatus('unpaid')}
                      style={{marginTop: 6, alignSelf: 'flex-start'}}
                    >Unpaid</Button>
                    <Button
                      mode="contained"
                      onPress={() => handleConfirm(idx)}
                      style={{marginTop: 12, alignSelf: 'flex-start'}}
                    >Confirm Remove</Button>
                    <Button
                      mode="text"
                      onPress={handleCancel}
                      style={{marginTop: 4, alignSelf: 'flex-start'}}
                    >Cancel</Button>
                  </>
                )}
                {statusChanged && editingIdx === null && <Text style={{ color: 'green', marginTop: 4 }}>Status updated!</Text>}
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
    fontWeight: 'bold',
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
