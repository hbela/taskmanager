import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { 
  TextInput, 
  Button, 
  Text, 
  ActivityIndicator,
  Chip,
  Divider,
  Switch,
} from 'react-native-paper';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { useTasks } from '../../../hooks/use-tasks';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { tasks, isLoading, updateTask, deleteTask, toggleTask } = useTasks();
  
  const task = tasks.find(t => t.id === id);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [completed, setCompleted] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize form with task data
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setDueDate(task.dueDate ? new Date(task.dueDate) : null);
      setCompleted(task.completed);
    }
  }, [task]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDueDate(selectedDate);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Task title is required');
      return;
    }

    setIsSaving(true);
    try {
      await updateTask({
        id: id!,
        data: {
          title: title.trim(),
          description: description.trim() || undefined,
          dueDate: dueDate?.toISOString(),
          completed,
        },
      });
      setIsEditing(false);
      Alert.alert('Success', 'Task updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update task');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Task',
      `Are you sure you want to delete "${task?.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTask(id!);
              router.back();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete task');
            }
          },
        },
      ]
    );
  };

  const handleToggleComplete = () => {
    setCompleted(!completed);
    toggleTask(id!);
  };

  const handleCancel = () => {
    // Reset to original values
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setDueDate(task.dueDate ? new Date(task.dueDate) : null);
      setCompleted(task.completed);
    }
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator animating={true} size="large" color="#6200ee" />
      </View>
    );
  }

  if (!task) {
    return (
      <View style={styles.errorContainer}>
        <Text variant="titleMedium">Task not found</Text>
        <Button mode="contained" onPress={() => router.back()} style={styles.backButton}>
          Go Back
        </Button>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: isEditing ? 'Edit Task' : 'Task Details',
          headerRight: () => !isEditing ? (
            <Button 
              mode="text" 
              textColor="#fff"
              onPress={() => setIsEditing(true)}
            >
              Edit
            </Button>
          ) : null,
        }} 
      />
      
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {isEditing ? (
          // Edit Mode
          <>
            <TextInput
              label="Task Title *"
              value={title}
              onChangeText={setTitle}
              mode="outlined"
              style={styles.input}
            />
            
            <TextInput
              label="Description"
              value={description}
              onChangeText={setDescription}
              mode="outlined"
              multiline
              numberOfLines={4}
              style={styles.input}
            />
            
            <Button
              mode="outlined"
              onPress={() => setShowDatePicker(true)}
              icon="calendar"
              style={styles.dateButton}
            >
              {dueDate ? formatDate(dueDate) : 'Set Due Date'}
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
              />
            )}
            
            <View style={styles.switchContainer}>
              <Text variant="bodyLarge">Mark as completed</Text>
              <Switch
                value={completed}
                onValueChange={setCompleted}
                color="#6200ee"
              />
            </View>
            
            <Divider style={styles.divider} />
            
            <View style={styles.buttonRow}>
              <Button 
                mode="outlined" 
                onPress={handleCancel}
                style={styles.cancelButton}
              >
                Cancel
              </Button>
              <Button 
                mode="contained" 
                onPress={handleSave}
                loading={isSaving}
                disabled={isSaving || !title.trim()}
                style={styles.saveButton}
              >
                Save Changes
              </Button>
            </View>
          </>
        ) : (
          // View Mode
          <>
            <View style={styles.header}>
              <Text 
                variant="headlineSmall" 
                style={[styles.title, completed && styles.completedTitle]}
              >
                {task.title}
              </Text>
              <Chip 
                mode="flat"
                style={[
                  styles.statusChip,
                  completed ? styles.completedChip : styles.pendingChip
                ]}
              >
                {completed ? 'Completed' : 'Pending'}
              </Chip>
            </View>
            
            {task.description && (
              <View style={styles.section}>
                <Text variant="labelLarge" style={styles.sectionLabel}>Description</Text>
                <Text variant="bodyLarge" style={styles.description}>
                  {task.description}
                </Text>
              </View>
            )}
            
            {task.dueDate && (
              <View style={styles.section}>
                <Text variant="labelLarge" style={styles.sectionLabel}>Due Date</Text>
                <Chip 
                  icon="calendar"
                  mode="outlined"
                  style={[
                    styles.dueDateChip,
                    new Date(task.dueDate) < new Date() && !completed && styles.overdueChip
                  ]}
                >
                  {formatDate(new Date(task.dueDate))}
                </Chip>
              </View>
            )}
            
            <Divider style={styles.divider} />
            
            <View style={styles.actionsSection}>
              <Button 
                mode="contained"
                onPress={handleToggleComplete}
                icon={completed ? 'checkbox-blank-outline' : 'checkbox-marked'}
                style={styles.actionButton}
              >
                {completed ? 'Mark as Pending' : 'Mark as Complete'}
              </Button>
              
              <Button 
                mode="outlined"
                onPress={() => setIsEditing(true)}
                icon="pencil"
                style={styles.actionButton}
              >
                Edit Task
              </Button>
              
              <Button 
                mode="outlined"
                onPress={handleDelete}
                icon="delete"
                textColor="#d32f2f"
                style={[styles.actionButton, styles.deleteButton]}
              >
                Delete Task
              </Button>
            </View>
          </>
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  backButton: {
    marginTop: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  title: {
    flex: 1,
    marginRight: 12,
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    color: '#888',
  },
  statusChip: {
    alignSelf: 'flex-start',
  },
  completedChip: {
    backgroundColor: '#e8f5e9',
  },
  pendingChip: {
    backgroundColor: '#fff3e0',
  },
  section: {
    marginBottom: 20,
  },
  sectionLabel: {
    color: '#666',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  description: {
    color: '#333',
    lineHeight: 24,
  },
  dueDateChip: {
    alignSelf: 'flex-start',
  },
  overdueChip: {
    backgroundColor: '#ffebee',
    borderColor: '#d32f2f',
  },
  divider: {
    marginVertical: 24,
  },
  actionsSection: {
    gap: 12,
  },
  actionButton: {
    marginBottom: 0,
  },
  deleteButton: {
    borderColor: '#d32f2f',
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  dateButton: {
    marginBottom: 12,
  },
  clearDateChip: {
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 1,
  },
});
