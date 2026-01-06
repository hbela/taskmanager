import React, { useState } from 'react';
import { View, SectionList, StyleSheet, ScrollView, RefreshControl } from 'react-native';
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
  Chip,
  IconButton,
  Menu,
} from 'react-native-paper';
import { useTasks } from '../../hooks/use-tasks';
import { router } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Task } from '@taskmanager/shared';

export default function TasksScreen() {
  const { tasks, isLoading, isRefetching, createTask, toggleTask, refetch } = useTasks();
  const [dialogVisible, setDialogVisible] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [menuVisible, setMenuVisible] = useState<string | null>(null);

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

  const isOverdue = (task: Task) => {
    if (!task.dueDate || task.completed) return false;
    return new Date(task.dueDate) < new Date();
  };

  // Group tasks into sections
  const pendingTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  const sections = [
    ...(pendingTasks.length > 0 ? [{ title: 'Pending', data: pendingTasks }] : []),
    ...(completedTasks.length > 0 ? [{ title: 'Completed', data: completedTasks }] : []),
  ];

  const renderTaskItem = ({ item }: { item: Task }) => (
    <List.Item
      title={item.title}
      description={item.description || undefined}
      titleStyle={[
        item.completed && styles.completedText,
        isOverdue(item) && styles.overdueText,
      ]}
      onPress={() => router.push(`/(app)/task/${item.id}`)}
      left={() => (
        <Checkbox
          status={item.completed ? 'checked' : 'unchecked'}
          onPress={() => toggleTask(item.id!)}
        />
      )}
      right={() => (
        <View style={styles.rightContainer}>
          {item.dueDate && (
            <Chip 
              mode="outlined" 
              compact
              style={[
                styles.dateChip,
                isOverdue(item) && styles.overdueDateChip,
              ]}
              textStyle={isOverdue(item) && styles.overdueChipText}
            >
              {formatDate(new Date(item.dueDate))}
            </Chip>
          )}
          <Menu
            visible={menuVisible === item.id}
            onDismiss={() => setMenuVisible(null)}
            anchor={
              <IconButton
                icon="dots-vertical"
                size={20}
                onPress={() => setMenuVisible(item.id!)}
              />
            }
          >
            <Menu.Item 
              onPress={() => {
                setMenuVisible(null);
                router.push(`/(app)/task/${item.id}`);
              }} 
              title="Edit" 
              leadingIcon="pencil"
            />
          </Menu>
        </View>
      )}
      style={[
        styles.listItem,
        isOverdue(item) && styles.overdueItem,
      ]}
    />
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator animating={true} size="large" color="#6200ee" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id!}
        contentContainerStyle={styles.listContent}
        renderItem={renderTaskItem}
        renderSectionHeader={({ section: { title } }) => (
          <Text variant="titleMedium" style={styles.sectionHeader}>
            {title}
          </Text>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text variant="titleMedium" style={styles.emptyText}>
              No tasks yet
            </Text>
            <Text variant="bodyMedium" style={styles.emptySubtext}>
              Tap the "New Task" button to create your first task
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            colors={['#6200ee']}
          />
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
        label="New Task"
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
  sectionHeader: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 8,
    paddingHorizontal: 4,
    fontWeight: 'bold',
    color: '#6200ee',
  },
  listItem: {
    backgroundColor: 'white',
    marginBottom: 8,
    borderRadius: 8,
    elevation: 2,
  },
  overdueItem: {
    borderLeftWidth: 4,
    borderLeftColor: '#d32f2f',
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: 'gray',
  },
  overdueText: {
    color: '#d32f2f',
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateChip: {
    alignSelf: 'center',
  },
  overdueDateChip: {
    backgroundColor: '#ffebee',
    borderColor: '#d32f2f',
  },
  overdueChipText: {
    color: '#d32f2f',
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
  clearDateChip: {
    alignSelf: 'flex-start',
    marginTop: 8,
  },
});
