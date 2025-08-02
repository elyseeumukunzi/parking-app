import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import * as React from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { Button, Divider, Surface, Text, TextInput } from 'react-native-paper';

export default function SettingsScreen() {
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [newUser, setNewUser] = React.useState('');
  const [newUserPassword, setNewUserPassword] = React.useState('');
  const [isAdmin] = React.useState(true); // In a real app, this would come from your auth context/state

  const navigateToReports = () => {
    router.push('/(auth)/reports');
  };

   const handleLogout = async () => {
    await AsyncStorage.removeItem('authToken'); // Remove stored token
    router.replace('/login'); // Redirect to login screen
  };
  const handleAddUser = async () => {

  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Surface style={styles.surface} elevation={2}>
      <Text variant="headlineMedium" style={styles.title}>Settings</Text>
      <TextInput
        label="Username"
        value={username}
        onChangeText={setUsername}
        style={styles.input}
        mode="outlined"
      />
      <TextInput
        label="Change Password"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        mode="outlined"
        secureTextEntry
      />
      <Button mode="contained" style={styles.button} onPress={() => {}}>
        Update Profile
      </Button>
      <Divider style={{ marginVertical: 20 }} />
      <Text variant="titleMedium" style={{ marginBottom: 8 }}>Add User</Text>
      <TextInput
        label="New Username"
        value={newUser}
        onChangeText={setNewUser}
        style={styles.input}
        mode="outlined"
      />
      <TextInput
        label="New User Password"
        value={newUserPassword}
        onChangeText={setNewUserPassword}
        style={styles.input}
        mode="outlined"
        secureTextEntry
      />
      <Button mode="contained" style={styles.button}  onPress={handleAddUser}>
        Add User
      </Button>
      <Divider style={{ marginVertical: 20 }} />
      {isAdmin && (
        <Button 
          mode="outlined" 
          style={[styles.button, { marginTop: 16 }]} 
          onPress={navigateToReports}
          icon="file-chart"
        >
          REBA RAPORO
        </Button>
      )}

      <Divider style={{ marginVertical: 20 }} />
      
      <Button 
        mode="outlined" 
        style={[styles.logoutButton, { marginTop: 8 }]} 
        onPress={handleLogout}
        icon="logout"
      >
        Logout
      </Button>
      </Surface>
    </ScrollView>
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
    marginBottom: 14,
  },
  button: {
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  logoutButton: {
    marginTop: 10,
    alignSelf: 'center',
    borderColor: 'red',
    borderWidth: 1,
  },
  accordion: {
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
    marginBottom: 8,
  },
  listItem: {
    paddingLeft: 16,
  },
  surface: {
    padding: 24,
    backgroundColor: '#fff',
    borderRadius: 4,
  }
});
