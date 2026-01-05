import { Redirect, Slot } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { authClient } from '../../lib/auth-client';

export default function AppLayout() {
  const { data: session, isPending } = authClient.useSession();

  // 1. Handle the loading state
  if (isPending) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#6200ee" />
      </View>
    );
  }

  // 2. Redirect to login if no session exists
  if (!session) {
    return <Redirect href="/auth/login" />;
  }

  // 3. Render the authenticated routes
  return <Slot />;
}
