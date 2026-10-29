// screens/HomeScreen.js
// Screen 2 (Home Screen) for MyTasks App

import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Firebase imports
import { signOut } from 'firebase/auth';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

export default function HomeScreen({ user, onLogout, onNavigateToAddTask }) {
  // --- Component State ---
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- Real-time Firestore Listener for Tasks ---
  useEffect(() => {
    // If there is no authenticated user, stop
    if (!user || !user.uid) {
      setLoading(false);
      return;
    }

    // Reference to user's subcollection: users/{user.uid}/tasks
    const tasksCollectionRef = collection(db, 'users', user.uid, 'tasks');

    // Order tasks by createdAt (newest first)
    const tasksQuery = query(tasksCollectionRef, orderBy('createdAt', 'desc'));

    // Set up real-time listener with onSnapshot
    const unsubscribe = onSnapshot(
      tasksQuery,
      (snapshot) => {
        const taskList = [];
        snapshot.forEach((docSnap) => {
          taskList.push({
            id: docSnap.id,
            ...docSnap.data(),
          });
        });
        setTasks(taskList);
        setLoading(false);
      },
      (error) => {
        console.log('Error fetching tasks in real-time:', error);
        setLoading(false);
      }
    );

    // Clean up listener when component unmounts
    return () => unsubscribe();
  }, [user]);

  // --- Logout Action ---
  const handleLogout = async () => {
    try {
      await signOut(auth);
      if (onLogout) {
        onLogout();
      }
    } catch (error) {
      console.log('Logout error:', error);
      Alert.alert('Error', 'Failed to log out. Please try again.');
    }
  };

  // --- Toggle Completed Status ---
  const handleToggleTask = async (task) => {
    try {
      const taskDocRef = doc(db, 'users', user.uid, 'tasks', task.id);
      // Toggle completed boolean: if true -> false, if false -> true
      await updateDoc(taskDocRef, {
        completed: !task.completed,
      });
    } catch (error) {
      console.log('Error updating task status:', error);
      Alert.alert('Error', 'Could not update task status.');
    }
  };

  // --- Delete Task Action ---
  const handleDeleteTask = async (taskId) => {
    try {
      const taskDocRef = doc(db, 'users', user.uid, 'tasks', taskId);
      await deleteDoc(taskDocRef);
    } catch (error) {
      console.log('Error deleting task:', error);
      Alert.alert('Error', 'Could not delete task.');
    }
  };

  // --- Live Task Counter Calculation ---
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((item) => item.completed === true).length;

  // --- Render Each Task Item ---
  const renderTaskItem = ({ item }) => {
    const isCompleted = item.completed === true;

    return (
      <View style={styles.taskCard}>
        {/* Checkbox and Task Title (Tappable to toggle status) */}
        <TouchableOpacity
          style={styles.taskContent}
          onPress={() => handleToggleTask(item)}
          activeOpacity={0.7}
        >
          {/* Checkbox / Status Indicator */}
          <View style={[styles.checkbox, isCompleted && styles.checkboxCompleted]}>
            <Text style={[styles.checkboxText, isCompleted && styles.checkboxCompletedText]}>
              {isCompleted ? '✓' : ''}
            </Text>
          </View>

          {/* Task Title with optional strikethrough if completed */}
          <Text
            style={[styles.taskTitle, isCompleted && styles.taskTitleCompleted]}
            numberOfLines={2}
          >
            {item.title || 'Untitled Task'}
          </Text>
        </TouchableOpacity>

        {/* Delete Button (Del) */}
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteTask(item.id)}
          activeOpacity={0.7}
        >
          <Text style={styles.deleteButtonText}>Del</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* 1. Header: User Email & Logout Button */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.appTitle}>MyTasks</Text>
            <Text style={styles.userEmail} numberOfLines={1}>
              Hi, {user?.email || 'User'}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* 2. Live Task Counter Summary Header */}
        <View style={styles.summaryBar}>
          <Text style={styles.summaryText}>
            {completedTasks} of {totalTasks} tasks completed
          </Text>
        </View>

        {/* 3. Task List or Empty State */}
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#2563EB" />
            <Text style={styles.loadingText}>Loading tasks...</Text>
          </View>
        ) : tasks.length === 0 ? (
          <View style={styles.centerContainer}>
            <Text style={styles.emptyStateTitle}>No tasks yet</Text>
            <Text style={styles.emptyStateSubtitle}>
              Tap the (+) button below to create your first task!
            </Text>
          </View>
        ) : (
          <FlatList
            data={tasks}
            keyExtractor={(item) => item.id}
            renderItem={renderTaskItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* 4. Floating Add Task Button (+) */}
        <TouchableOpacity
          style={styles.floatingButton}
          onPress={onNavigateToAddTask}
          activeOpacity={0.8}
        >
          <Text style={styles.floatingButtonText}>+</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  container: {
    flex: 1,
    position: 'relative',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerLeft: {
    flex: 1,
    marginRight: 12,
  },
  appTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  userEmail: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginTop: 2,
  },
  logoutButton: {
    backgroundColor: '#FEE2E2',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  logoutButtonText: {
    color: '#DC2626',
    fontWeight: '700',
    fontSize: 13,
  },
  summaryBar: {
    backgroundColor: '#EFF6FF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#DBEAFE',
  },
  summaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1D4ED8',
  },
  listContent: {
    padding: 16,
    paddingBottom: 90, // Leave room for floating action button
    gap: 12,
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  taskContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#9CA3AF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    backgroundColor: '#FFFFFF',
  },
  checkboxCompleted: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  checkboxText: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '800',
  },
  checkboxCompletedText: {
    color: '#FFFFFF',
  },
  taskTitle: {
    fontSize: 15,
    color: '#1F2937',
    fontWeight: '500',
    flex: 1,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
  },
  deleteButton: {
    backgroundColor: '#FEE2E2',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  deleteButtonText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '700',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    color: '#6B7280',
    fontSize: 14,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 6,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    maxWidth: 240,
  },
  floatingButton: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  floatingButtonText: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: '400',
    lineHeight: 36,
  },
});
