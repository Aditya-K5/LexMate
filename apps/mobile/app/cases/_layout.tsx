import { Stack } from 'expo-router';

export default function CasesLayout() {
  return (
    <Stack>
      <Stack.Screen name="[id]" options={{ title: 'Case Details' }} />
      <Stack.Screen name="new" options={{ title: 'New Case' }} />
    </Stack>
  );
}
