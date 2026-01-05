import React, { useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { List, Checkbox, TextInput, FAB, ActivityIndicator, Text } from 'react-native-paper';
import { useTasks } from '../../hooks/use-tasks';
import { Stack } from 'expo-router';

export default function MobileDashboard() {
  const { tasks, isLoading, createTask, toggleTask } = useTasks();
  const [text, setText] = useState("");

  const handleAdd = () => {
    if (!text.trim()) return;
    createTask(text);
    setText("");
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
      
      <View style={styles.inputContainer}>
        <TextInput
          label="New Task"
          value={text}
          onChangeText={setText}
          mode="outlined"
          onSubmitEditing={handleAdd}
          right={<TextInput.Icon icon="plus" onPress={handleAdd} />}
        />
      </View>

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id!}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <List.Item
            title={item.title}
            titleStyle={item.completed ? styles.completedText : undefined}
            left={() => (
              <Checkbox
                status={item.completed ? 'checked' : 'unchecked'}
                onPress={() => toggleTask(item.id!)}
              />
            )}
            style={styles.listItem}
          />
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No tasks yet. Add one!</Text>
        }
      />
      
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => {
          // Focus input or open modal
          // For now, assume adding via top input
        }}
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
  inputContainer: {
    padding: 16,
    backgroundColor: '#fff',
    elevation: 2,
  },
  listContent: {
    padding: 16,
    paddingBottom: 80, // Space for FAB
  },
  listItem: {
    backgroundColor: 'white',
    marginBottom: 8,
    borderRadius: 8,
    elevation: 1,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: 'gray',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    color: '#888',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#6200ee',
  },
});
