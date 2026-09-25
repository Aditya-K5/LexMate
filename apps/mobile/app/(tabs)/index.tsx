import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, ActivityIndicator } from 'react-native';
import { ENV } from '../../src/constants/env';
import { useAuthStore } from '../../src/stores/auth.store';

export default function TechnicalVerificationScreen() {
  const [apiStatus, setApiStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [apiDetails, setApiDetails] = useState<string>('');
  const { user, organization, isAuthenticated, isLoading } = useAuthStore();

  const checkApiHealth = async () => {
    setApiStatus('checking');
    try {
      // Pings NestJS health check endpoint
      const healthUrl = `${ENV.apiUrl}/health`;
      const res = await fetch(healthUrl);
      if (res.ok) {
        const json = await res.json();
        setApiStatus('connected');
        setApiDetails(json?.status === 'ok' ? 'Online (Database Connected)' : 'Online');
      } else {
        setApiStatus('disconnected');
        setApiDetails(`HTTP ${res.status}`);
      }
    } catch (err: unknown) {
      setApiStatus('disconnected');
      setApiDetails(err instanceof Error ? err.message : 'Network error');
    }
  };

  useEffect(() => {
    checkApiHealth();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>LexMate</Text>
      <Text style={styles.subtitle}>Development Build</Text>

      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.label}>API:</Text>
          {apiStatus === 'checking' ? (
            <ActivityIndicator size="small" color="#666" />
          ) : (
            <Text
              style={[
                styles.value,
                apiStatus === 'connected' ? styles.statusGreen : styles.statusRed,
              ]}
            >
              {apiStatus === 'connected' ? `Connected (${apiDetails})` : `Disconnected (${apiDetails})`}
            </Text>
          )}
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Environment:</Text>
          <Text style={styles.value}>
            {ENV.environment.charAt(0).toUpperCase() + ENV.environment.slice(1)}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Authentication:</Text>
          <Text style={[styles.value, !isLoading ? styles.statusGreen : styles.statusAmber]}>
            {isLoading ? 'Initializing...' : 'Ready'}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Auth Status:</Text>
          <Text style={styles.value}>
            {isAuthenticated && user
              ? `Logged in as ${user.name} (${user.role}) @ ${organization?.name}`
              : 'Not logged in (Guest)'}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>API Base URL:</Text>
          <Text style={styles.monoValue}>{ENV.apiUrl}</Text>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <Button title="Refresh Connection" onPress={checkApiHealth} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 20,
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#444',
  },
  value: {
    fontSize: 14,
    color: '#222',
  },
  monoValue: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#555',
  },
  statusGreen: {
    color: '#1b5e20',
    fontWeight: '600',
  },
  statusRed: {
    color: '#b71c1c',
    fontWeight: '600',
  },
  statusAmber: {
    color: '#e65100',
    fontWeight: '600',
  },
  buttonContainer: {
    marginTop: 8,
  },
});
