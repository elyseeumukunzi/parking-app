import * as React from 'react';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, HelperText, RadioButton, Surface, Text, TextInput } from 'react-native-paper';

export default function AddParkingScreen() {
  const [category, setCategory] = useState('Car');
  const [plate, setPlate] = useState('');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10)); // YYYY-MM-DD
  const [payment, setPayment] = useState('200');
  const [status, setStatus] = useState('paid');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    // Here you would send data to your backend
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 2000);
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <Surface style={styles.container} elevation={4}>
        <Text variant="headlineMedium" style={styles.title}>Add New Parking</Text>

        <Text variant="titleSmall" style={styles.label}>Vehicle Category</Text>
        <RadioButton.Group onValueChange={setCategory} value={category}>
          <View style={styles.radioRow}>
            <RadioButton.Item label="Imodoka" value="3" />
            <RadioButton.Item label="Moto" value="2" />
            <RadioButton.Item label="Igare" value="1" />
          </View>
        </RadioButton.Group> 

        <TextInput
          label="Plate Number"
          value={plate}
          onChangeText={setPlate}
          style={styles.input}
          mode="outlined"
        />
        <HelperText type="info" visible={true}>
          Example: RAA123B
        </HelperText>

        <TextInput
          label="Phone Number"
          value={phone}
          onChangeText={setPhone}
          style={styles.input}
          mode="outlined"
          keyboardType="phone-pad"
        />

        <TextInput
          label="Date"
          value={date}
          onChangeText={setDate}
          style={styles.input}
          mode="outlined"
          editable={false}
        />

        <TextInput
          label="Payment Amount (RWF)"
          value={payment}
          onChangeText={setPayment}
          style={styles.input}
          mode="outlined"
          keyboardType="numeric"
        />

        <Text variant="titleSmall" style={styles.label}>Payment Status</Text>
        <RadioButton.Group onValueChange={setStatus} value={status}>
          <View style={styles.radioRow}>
            <RadioButton.Item label="Paid" value="paid" />
            <RadioButton.Item label="Unpaid" value="unpaid" />
          </View>
        </RadioButton.Group>

        <Button mode="contained" onPress={handleSubmit} style={styles.button}>
          Add Parking
        </Button>
        {submitted && <Text style={styles.success}>Parking details added!</Text>}
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
    margin: 16,
    padding: 20,
    borderRadius: 14,
    backgroundColor: '#f7f7fa',
  },
  title: {
    marginBottom: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  label: {
    marginTop: 14,
    marginBottom: 2,
    fontWeight: '600',
  },
  input: {
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  radioRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  button: {
    marginTop: 18,
    paddingVertical: 6,
    borderRadius: 8,
  },
  success: {
    color: 'green',
    marginTop: 14,
    textAlign: 'center',
    fontWeight: 'bold',
  },
});
