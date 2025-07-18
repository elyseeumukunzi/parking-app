import * as React from 'react';
import { View, StyleSheet } from 'react-native';
import { Surface, Text, TextInput, Button, Divider } from 'react-native-paper';

export default function SettingsScreen() {
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [newUser, setNewUser] = React.useState('');
  const [newUserPassword, setNewUserPassword] = React.useState('');

  return (
    <Surface style={styles.container} elevation={2}>
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
      <Button mode="contained" style={styles.button} onPress={() => {}}>
        Add User
      </Button>
      <Divider style={{ marginVertical: 20 }} />
      <Button mode="outlined" style={styles.logoutButton} onPress={() => {}}>
        Logout
      </Button>
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
});
