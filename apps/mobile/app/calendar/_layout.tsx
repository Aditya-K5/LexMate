import { Stack } from 'expo-router';

export default function CalendarLayout() {
  return (
    <Stack>
      <Stack.Screen name="[id]" options={{ title: 'Hearing Details' }} />
    </Stack>
  );
}
