import { Redirect, Tabs } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { authClient } from '../../lib/auth-client';
import { MaterialCommunityIcons } from '@expo/vector-icons';

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

  // 3. Render the authenticated routes with tab navigation
  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: '#6200ee',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        tabBarActiveTintColor: '#6200ee',
        tabBarInactiveTintColor: '#999',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Tasks',
          tabBarLabel: 'Tasks',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="checkbox-marked-circle-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-circle-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="task/[id]"
        options={{
          href: null, // Hide from tab bar
          headerStyle: {
            backgroundColor: '#6200ee',
          },
          headerTintColor: '#fff',
        }}
      />
    </Tabs>
  );
}
