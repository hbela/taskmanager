import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, ScrollView } from 'react-native';
import { 
  List, 
  Checkbox, 
  FAB, 
  ActivityIndicator, 
  Text, 
  Portal, 
  Dialog, 
  TextInput, 
  Button,
  Chip
} from 'react-native-paper';
import { useTasks } from '../../hooks/use-tasks';
import { Stack } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { authClient } from '../../lib/auth-client';

export default function MobileDashboard() {
  const { tasks, isLoading, createTask, toggleTask } = useTasks();
  const [dialogVisible, setDialogVisible] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Debug: Check session on mount
  useEffect(() => {
    const checkSession = async () => {
      const session = await authClient.getSession();
      console.log("Dashboard session check:", {
        hasSession: !!session,
        hasToken: !!session?.data?.session?.token,
        token: session?.data?.session?.token?.substring(0, 20) + "...",
      });
    };
    checkSession();
  }, []);

  const handleCreateTask = () => {
    if (!taskTitle.trim()) return;
    
    createTask({
      title: taskTitle,
      description: taskDescription,
      dueDate: dueDate?.toISOString(),
    });
    
    // Reset form
    setTaskTitle("");
    setTaskDescription("");
    setDueDate(null);
    setDialogVisible(false);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDueDate(selectedDate);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator animating={true} size="large" color="#6200ee" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'My Tasks' }} />
      
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id!}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <List.Item
            title={item.title}
            description={item.description || undefined}
            titleStyle={item.completed ? styles.completedText : undefined}
            left={() => (
              <Checkbox
                status={item.completed ? 'checked' : 'unchecked'}
                onPress={() => toggleTask(item.id!)}
              />
            )}
            right={() => item.dueDate ? (
              <Chip 
                mode="outlined" 
                compact
                style={styles.dateChip}
              >
                {formatDate(new Date(item.dueDate))}
              </Chip>
            ) : null}
            style={styles.listItem}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text variant="titleMedium" style={styles.emptyText}>
              No tasks yet
            </Text>
            <Text variant="bodyMedium" style={styles.emptySubtext}>
              Tap the + button to create your first task
            </Text>
          </View>
        }
      />
      
      <Portal>
        <Dialog 
          visible={dialogVisible} 
          onDismiss={() => setDialogVisible(false)}
          style={styles.dialog}
        >
          <Dialog.Title>Create New Task</Dialog.Title>
          <Dialog.Content>
            <ScrollView>
              <TextInput
                label="Task Title *"
                value={taskTitle}
                onChangeText={setTaskTitle}
                mode="outlined"
                style={styles.input}
                autoFocus
              />
              
              <TextInput
                label="Description (optional)"
                value={taskDescription}
                onChangeText={setTaskDescription}
                mode="outlined"
                multiline
                numberOfLines={3}
                style={styles.input}
              />
              
              <Button
                mode="outlined"
                onPress={() => setShowDatePicker(true)}
                icon="calendar"
                style={styles.dateButton}
              >
                {dueDate ? formatDate(dueDate) : 'Set Due Date (optional)'}
              </Button>
              
              {dueDate && (
                <Chip
                  icon="close"
                  onPress={() => setDueDate(null)}
                  style={styles.clearDateChip}
                >
                  Clear date
                </Chip>
              )}
              
              {showDatePicker && (
                <DateTimePicker
                  value={dueDate || new Date()}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                  minimumDate={new Date()}
                />
              )}
            </ScrollView>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialogVisible(false)}>Cancel</Button>
            <Button 
              onPress={handleCreateTask}
              mode="contained"
              disabled={!taskTitle.trim()}
            >
              Create
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => setDialogVisible(true)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center', 
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  listItem: {
    backgroundColor: 'white',
    marginBottom: 8,
    borderRadius: 8,
    elevation: 2,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: 'gray',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
    paddingHorizontal: 40,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    textAlign: 'center',
    color: '#999',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#6200ee',
  },
  dialog: {
    maxHeight: '80%',
  },
  input: {
    marginBottom: 16,
  },
  dateButton: {
    marginBottom: 8,
  },
  dateChip: {
    alignSelf: 'center',
  },
  clearDateChip: {
    alignSelf: 'flex-start',
    marginTop: 8,
  },
});
