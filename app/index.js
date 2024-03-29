import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  AsyncStorage,
  StyleSheet,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const TodoApp = () => {
  const [task, setTask] = useState('');
  const [taskList, setTaskList] = useState([]);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editedTaskTitle, setEditedTaskTitle] = useState('');

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const storedTasks = await AsyncStorage.getItem('@tasks');
      if (storedTasks !== null) {
        setTaskList(JSON.parse(storedTasks));
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  const saveTasks = async tasks => {
    try {
      await AsyncStorage.setItem('@tasks', JSON.stringify(tasks));
    } catch (error) {
      console.error('Error saving tasks:', error);
    }
  };

  const addTask = () => {
    if (task.trim() !== '') {
      const newTaskList = [...taskList, { id: Date.now(), title: task, completed: false }];
      setTaskList(newTaskList);
      saveTasks(newTaskList);
      setTask('');
      Keyboard.dismiss();
    }
  };

  const deleteTask = id => {
    const filteredTasks = taskList.filter(task => task.id !== id);
    setTaskList(filteredTasks);
    saveTasks(filteredTasks);
  };

  const toggleTaskCompletion = id => {
    const updatedTasks = taskList.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    );
    setTaskList(updatedTasks);
    saveTasks(updatedTasks);
  };

  const startEditingTask = id => {
    const taskToEdit = taskList.find(task => task.id === id);
    setEditingTaskId(id);
    setEditedTaskTitle(taskToEdit.title);
  };

  const cancelEditingTask = () => {
    setEditingTaskId(null);
    setEditedTaskTitle('');
  };

  const saveEditedTask = () => {
    const updatedTasks = taskList.map(task =>
      task.id === editingTaskId ? { ...task, title: editedTaskTitle } : task
    );
    setTaskList(updatedTasks);
    saveTasks(updatedTasks);
    setEditingTaskId(null);
    setEditedTaskTitle('');
  };

  const renderItem = ({ item }) => (
    <View style={[styles.taskItem, item.completed && styles.completedTaskItem]}>
      {editingTaskId === item.id ? (
        <View style={styles.editingContainer}>
          <TextInput
            style={styles.input}
            value={editedTaskTitle}
            onChangeText={text => setEditedTaskTitle(text)}
          />
          <TouchableOpacity style={styles.saveButton} onPress={saveEditedTask}>
            <Text style={styles.buttonText}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={cancelEditingTask}>
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <Text style={[styles.taskText, item.completed && styles.completedTaskText]}>
            {item.title}
          </Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.deleteButton]}
              onPress={() => deleteTask(item.id)}
            >
              <Ionicons name="trash-bin" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.editButton]}
              onPress={() => startEditingTask(item.id)}
            >
              <Ionicons name="create" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.toggleButton, item.completed && styles.toggleButtonCompleted]}
              onPress={() => toggleTaskCompletion(item.id)}
            >
              <Ionicons
                name={item.completed ? 'checkbox-outline' : 'square-outline'}
                size={24}
                color="#fff"
              />
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Todo List</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Add Task"
          value={task}
          onChangeText={text => setTask(text)}
        />
        <TouchableOpacity style={styles.addButton} onPress={addTask}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      <FlatList
        data={taskList}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        style={styles.taskList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2C5C4F', // Light gray background color
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#000000', // Dark gray color
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: '#fff', // White background color
    borderRadius: 12,
    paddingHorizontal: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  input: {
    flex: 1,
    height: 50,
    paddingHorizontal: 20,
    fontSize: 16,
    color: '#333', // Dark gray color
  },
  addButton: {
    backgroundColor: '#6C63FF', // Purple button color
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginLeft: 10,
    shadowColor: '#6C63FF',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 5,
  },
  taskList: {
    flex: 1,
    backgroundColor: '#fff', // White background color
    borderRadius: 12,
    padding: 10,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F4F3EE', // Lighter shade of gray for task items
    borderRadius: 12,
    marginBottom: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  taskText: {
    fontSize: 18,
    color: '#333', // Dark gray color
    flex: 1,
  },
  completedTaskText: {
    textDecorationLine: 'line-through',
    color: '#777', // Gray color for completed tasks
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    padding: 10,
    borderRadius: 5,
    marginLeft: 10,
  },
  deleteButton: {
    backgroundColor: '#FF5C5C', // Red button color
  },
  editButton: {
    backgroundColor: '#6C63FF', // Purple button color
  },
  toggleButton: {
    backgroundColor: '#4CAF50', // Green button color
  },
  toggleButtonCompleted: {
    backgroundColor: '#777', // Gray color for completed tasks
  },
  buttonText: {
    color: '#E0AFA0', // Light pink button text color
    fontSize: 16,
    fontWeight: 'bold',
    padding: 10,
    borderRadius: 5,
  },
});

export default TodoApp;
