import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="scanner" />
      <Stack.Screen name="results" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="premium" />
      <Stack.Screen name="history" />
    </Stack>
  );
}