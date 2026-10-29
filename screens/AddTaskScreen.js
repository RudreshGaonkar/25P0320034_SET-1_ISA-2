// screens/AddTaskScreen.js
// Screen 3 (Add Task) for MyTasks App

import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Firebase imports
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export default function AddTaskScreen({ user, onBack }) {
  // --- Form Input States ---
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  // --- UI States (Error & Loading) ---
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // --- Form Validation (Simple if-else conditions) ---
  const validateForm = () => {
    // Check if task title is empty
    if (!title || title.trim().length === 0) {
      setErrorMessage('Task title is required!');
      return false; // Stop execution
    } else {
      // Clear error message if valid
      setErrorMessage('');
      return true;
    }
  };

  // --- Save Task to Firestore ---
  const handleSaveTask = async () => {
    // Step 1: Validate input
    const isValid = validateForm();
    if (!isValid) {
      return; // Stop if validation failed
    }

    setLoading(true);
    setErrorMessage('');

    try {
      // Step 2: Firestore Reference: users/{user.uid}/tasks
      const tasksCollectionRef = collection(db, 'users', user.uid, 'tasks');

      // Step 3: Write task document
      await addDoc(tasksCollectionRef, {
        title: title.trim(),
        description: description.trim(),
        completed: false,
        createdAt: serverTimestamp(),
      });

      // Step 4: Reset input fields
      setTitle('');
      setDescription('');
      setLoading(false);

      // Step 5: Navigate back to Screen 2 (Home)
      if (onBack) {
        onBack();
      }
    } catch (error) {
      console.log('Error adding task:', error);
      setLoading(false);
      setErrorMessage('Failed to save task. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Bar */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onBack} style={styles.backButton} activeOpacity={0.7}>
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>3. Add Task</Text>
            <View style={{ width: 50 }} />
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            {/* Task Title Input Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Task Title *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Finish lab record"
                placeholderTextColor="#9CA3AF"
                value={title}
                onChangeText={(text) => {
                  setTitle(text);
                  if (errorMessage) setErrorMessage('');
                }}
                autoCapitalize="sentences"
              />
            </View>

            {/* Description Input Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description (optional)</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="e.g. Include circuit diagrams and conclusion"
                placeholderTextColor="#9CA3AF"
                value={description}
                onChangeText={setDescription}
                multiline={true}
                numberOfLines={4}
                textAlignVertical="top"
                autoCapitalize="sentences"
              />
            </View>

            {/* Save Task Primary Button */}
            <TouchableOpacity
              style={[styles.saveButton, loading && styles.buttonDisabled]}
              onPress={handleSaveTask}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.saveButtonText}>SAVE TASK</Text>
              )}
            </TouchableOpacity>

            {/* Error Message Area (Red text below button) */}
            {errorMessage ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 6,
  },
  backButtonText: {
    color: '#2563EB',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  card: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    gap: 16,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  textInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111827',
  },
  textArea: {
    minHeight: 100,
  },
  saveButton: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  errorContainer: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginTop: 4,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
});
