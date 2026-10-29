// App.js
// Main entry point for the MyTasks application

import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { registerRootComponent } from 'expo';
import { StatusBar } from 'expo-status-bar';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebaseConfig';

// Import Screens
import AuthScreen from './screens/AuthScreen';
import HomeScreen from './screens/HomeScreen';
import AddTaskScreen from './screens/AddTaskScreen';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [initializing, setInitializing] = useState(true);
  // Simple screen navigation state: 'home' | 'addTask'
  const [currentScreen, setCurrentScreen] = useState('home');

  useEffect(() => {
    // Listen to Firebase Auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (initializing) {
        setInitializing(false);
      }
    });

    return () => unsubscribe();
  }, [initializing]);

  // Handler when user logs in or registers successfully
  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setCurrentScreen('home');
  };

  // Handler when user logs out
  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentScreen('home');
  };

  if (initializing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <StatusBar style="auto" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      {!currentUser ? (
        <AuthScreen onLoginSuccess={handleLoginSuccess} />
      ) : currentScreen === 'addTask' ? (
        <AddTaskScreen
          user={currentUser}
          onBack={() => setCurrentScreen('home')}
        />
      ) : (
        <HomeScreen
          user={currentUser}
          onLogout={handleLogout}
          onNavigateToAddTask={() => setCurrentScreen('addTask')}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
});

// Register root component so Expo / React Native AppRegistry can find "main"
registerRootComponent(App);
