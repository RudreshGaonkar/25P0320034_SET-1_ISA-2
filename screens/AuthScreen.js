// screens/AuthScreen.js
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// Firebase imports
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

export default function AuthScreen({ onLoginSuccess }) {
  // --- UI State ---
  // isRegistering: false = Login mode, true = Register mode
  const [isRegistering, setIsRegistering] = useState(false);

  // Form input fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Error handling & loading state
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Toggle between Login and Register modes
  const toggleAuthMode = () => {
    setIsRegistering(!isRegistering);
    setErrorMessage(''); // Clear previous errors when switching mode
  };

  // --- Form Validation (Simple if-else conditions) ---
  const validateForm = () => {
    // 1. Name Validation (Register Mode Only)
    if (isRegistering) {
      if (!name || name.trim().length === 0) {
        setErrorMessage('Name is required.');
        return false;
      } else if (name.trim().length < 2) {
        setErrorMessage('Name must be at least 2 characters long.');
        return false;
      }
    }

    // 2. Email Validation (Both Modes)
    if (!email || email.trim().length === 0) {
      setErrorMessage('Email is required.');
      return false;
    } else if (!email.includes('@') || !email.includes('.')) {
      setErrorMessage('Email must contain both "@" and "."');
      return false;
    } else {
      const atIndex = email.indexOf('@');
      const lastDotIndex = email.lastIndexOf('.');

      // '@' must appear before the last '.' and not at index 0
      if (atIndex <= 0 || lastDotIndex <= atIndex + 1) {
        setErrorMessage('Please enter a valid email format.');
        return false;
      }


      // Check TLD length: characters after the last '.' must be between 2 and 3 characters long
      const tld = email.substring(lastDotIndex + 1);
      if (tld.length < 2 || tld.length > 3) {
        setErrorMessage('Characters after the last "." must be between 2 and 3 characters long (e.g., .com, .in).');
        return false;
      }
    }

    // 3. Password Validation (Both Modes)
    if (!password || password.length === 0) {
      setErrorMessage('Password is required.');
      return false;
    } else if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return false;
    }

    // All checks passed
    setErrorMessage('');
    return true;
  };

  // --- Authentication Handler ---
  const handleAuth = async () => {
    // Step 1: Validate form inputs
    const isValid = validateForm();
    if (!isValid) {
      return; // Halt execution if validation fails
    }

    setLoading(true);
    setErrorMessage('');

    if (isRegistering) {
      // --- Registration Flow ---
      try {
        // Step 2: Create user in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email.trim(),
          password
        );
        const user = userCredential.user;

        // Step 3: Store user details (name & email) in Firestore under users/{user.uid}
        await setDoc(doc(db, 'users', user.uid), {
          name: name.trim(),
          email: email.trim(),
          createdAt: new Date().toISOString(),
        });

        // Step 4: Navigate to Home screen on success
        if (onLoginSuccess) {
          onLoginSuccess(user);
        }
      } catch (error) {
        // Step 5: Error handling with user-friendly messages
        let friendlyMessage = 'Registration failed. Please try again.';
        if (error.code === 'auth/email-already-in-use') {
          friendlyMessage = 'This email address is already in use.';
        } else if (error.code === 'auth/invalid-email') {
          friendlyMessage = 'The email address is invalid.';
        } else if (error.code === 'auth/weak-password') {
          friendlyMessage = 'The password is too weak.';
        } else if (error.message) {
          friendlyMessage = error.message;
        }
        setErrorMessage(friendlyMessage);
      } finally {
        setLoading(false);
      }
    } else {
      // --- Login Flow ---
      try {
        // Step 2: Sign in user in Firebase Auth
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email.trim(),
          password
        );
        const user = userCredential.user;

        // Step 3: Navigate to Home screen on success
        if (onLoginSuccess) {
          onLoginSuccess(user);
        }
      } catch (error) {
        // Step 4: Error handling with user-friendly messages
        let friendlyMessage = 'Login failed. Please check your credentials.';
        if (
          error.code === 'auth/user-not-found' ||
          error.code === 'auth/wrong-password' ||
          error.code === 'auth/invalid-credential'
        ) {
          friendlyMessage = 'Invalid email or password.';
        } else if (error.code === 'auth/invalid-email') {
          friendlyMessage = 'The email address is invalid.';
        } else if (error.code === 'auth/too-many-requests') {
          friendlyMessage = 'Too many failed attempts. Please try again later.';
        } else if (error.message) {
          friendlyMessage = error.message;
        }
        setErrorMessage(friendlyMessage);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          {/* App Header / Title */}
          <Text style={styles.appName}>MyTasks</Text>
          <Text style={styles.headerTitle}>
            {isRegistering ? 'Create Account' : 'Welcome Back'}
          </Text>
          <Text style={styles.headerSubtitle}>
            {isRegistering
              ? 'Sign up to start organizing your tasks'
              : 'Sign in to access your tasks'}
          </Text>

          {/* Form Fields */}
          <View style={styles.form}>
            {/* Name Input (Visible ONLY when in Register mode) */}
            {isRegistering && (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Name</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter your name"
                  placeholderTextColor="#8e8e93"
                  value={name}
                  onChangeText={(text) => {
                    setName(text);
                    if (errorMessage) setErrorMessage('');
                  }}
                  autoCapitalize="words"
                />
              </View>
            )}

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter your email"
                placeholderTextColor="#8e8e93"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (errorMessage) setErrorMessage('');
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Password Input (Masked) */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Password</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter your password (min 8 characters)"
                placeholderTextColor="#8e8e93"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (errorMessage) setErrorMessage('');
                }}
                secureTextEntry={true}
                autoCapitalize="none"
              />
            </View>

            {/* Primary Submit Button (LOGIN / REGISTER) */}
            <TouchableOpacity
              style={[styles.primaryButton, loading && styles.buttonDisabled]}
              onPress={handleAuth}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.primaryButtonText}>
                  {isRegistering ? 'REGISTER' : 'LOGIN'}
                </Text>
              )}
            </TouchableOpacity>

            {/* Text Toggle Link */}
            <TouchableOpacity
              style={styles.toggleContainer}
              onPress={toggleAuthMode}
              activeOpacity={0.7}
            >
              <Text style={styles.toggleText}>
                {isRegistering
                  ? 'Already have an account? Login'
                  : 'New user? Register'}
              </Text>
            </TouchableOpacity>

            {/* Error Message Container (Red text) */}
            {errorMessage ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  appName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3B82F6',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginBottom: 6,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  form: {
    gap: 16,
  },
  inputContainer: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  textInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111827',
  },
  primaryButton: {
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
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  toggleContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  toggleText: {
    color: '#2563EB',
    fontSize: 14,
    fontWeight: '600',
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
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 18,
  },
});
