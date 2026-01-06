import React from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { 
  Text, 
  Avatar, 
  Button, 
  Card, 
  List,
  Divider,
  ActivityIndicator,
} from 'react-native-paper';
import { router } from 'expo-router';
import { authClient } from '../../lib/auth-client';
import { useTasks } from '../../hooks/use-tasks';

export default function ProfileScreen() {
  const { data: session, isPending } = authClient.useSession();
  const { tasks } = useTasks();
  
  const user = session?.user;
  
  // Calculate task statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const pendingTasks = totalTasks - completedTasks;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: async () => {
            try {
              await authClient.signOut();
              router.replace('/auth/login');
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          },
        },
      ]
    );
  };

  if (isPending) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator animating={true} size="large" color="#6200ee" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* User Profile Card */}
      <Card style={styles.profileCard}>
        <View style={styles.profileHeader}>
          {user?.image ? (
            <Avatar.Image 
              size={80} 
              source={{ uri: user.image }} 
            />
          ) : (
            <Avatar.Text 
              size={80} 
              label={user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || '?'} 
              style={styles.avatar}
            />
          )}
          <View style={styles.userInfo}>
            <Text variant="headlineSmall" style={styles.userName}>
              {user?.name || 'User'}
            </Text>
            <Text variant="bodyMedium" style={styles.userEmail}>
              {user?.email}
            </Text>
          </View>
        </View>
      </Card>

      {/* Statistics Card */}
      <Card style={styles.statsCard}>
        <Card.Title title="Task Statistics" titleVariant="titleMedium" />
        <Card.Content>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text variant="headlineMedium" style={styles.statNumber}>
                {totalTasks}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                Total Tasks
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text variant="headlineMedium" style={[styles.statNumber, styles.completedNumber]}>
                {completedTasks}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                Completed
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text variant="headlineMedium" style={[styles.statNumber, styles.pendingNumber]}>
                {pendingTasks}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                Pending
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text variant="headlineMedium" style={styles.statNumber}>
                {completionRate}%
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                Completion
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Settings Section */}
      <Card style={styles.settingsCard}>
        <Card.Title title="Settings" titleVariant="titleMedium" />
        <List.Section>
          <List.Item
            title="Notifications"
            description="Manage notification preferences"
            left={props => <List.Icon {...props} icon="bell-outline" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => Alert.alert('Coming Soon', 'Notification settings will be available in a future update.')}
          />
          <Divider />
          <List.Item
            title="Theme"
            description="Light mode"
            left={props => <List.Icon {...props} icon="palette-outline" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => Alert.alert('Coming Soon', 'Theme settings will be available in a future update.')}
          />
          <Divider />
          <List.Item
            title="About"
            description="Version 1.0.0"
            left={props => <List.Icon {...props} icon="information-outline" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => Alert.alert('TaskManager', 'Version 1.0.0\n\nA simple and professional task management app.')}
          />
        </List.Section>
      </Card>

      {/* Sign Out Button */}
      <Button 
        mode="outlined" 
        onPress={handleLogout}
        icon="logout"
        textColor="#d32f2f"
        style={styles.logoutButton}
      >
        Sign Out
      </Button>

      <Text variant="bodySmall" style={styles.footer}>
        TaskManager v1.0.0
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileCard: {
    marginBottom: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  avatar: {
    backgroundColor: '#6200ee',
  },
  userInfo: {
    marginLeft: 16,
    flex: 1,
  },
  userName: {
    fontWeight: 'bold',
  },
  userEmail: {
    color: '#666',
    marginTop: 4,
  },
  statsCard: {
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontWeight: 'bold',
    color: '#6200ee',
  },
  completedNumber: {
    color: '#4caf50',
  },
  pendingNumber: {
    color: '#ff9800',
  },
  statLabel: {
    color: '#666',
    marginTop: 4,
  },
  settingsCard: {
    marginBottom: 24,
  },
  logoutButton: {
    borderColor: '#d32f2f',
    marginBottom: 16,
  },
  footer: {
    textAlign: 'center',
    color: '#999',
  },
});
