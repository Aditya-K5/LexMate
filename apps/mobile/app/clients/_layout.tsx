import { Stack } from 'expo-router';

export default function ClientsLayout() {
  return (
    <Stack>
      <Stack.Screen name="[id]" options={{ title: 'Client Profile' }} />
      <Stack.Screen name="new" options={{ title: 'New Client' }} />
    </Stack>
  );
}
