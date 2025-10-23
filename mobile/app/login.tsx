import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useAuth } from '@/contexts/auth-context';
import { apiService } from '@/services/api';
import { router } from 'expo-router';
import NetworkStatus from '@/components/NetworkStatus';

export default function LoginScreen() {
  const [ email, setEmail ] = useState('');
  const [ otp, setOtp ] = useState('');
  const [ step, setStep ] = useState<'email' | 'otp'>('email');
  const [ isLoading, setIsLoading ] = useState(false);
  const { login } = useAuth();

  const handleSendOTP = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiService.generateOTP(email);
      if (response.success) {
        setStep('otp');
        Alert.alert('Success', 'OTP sent to your email address');
      }
    } catch (error: any) {
      console.error('Send OTP error:', error);
      Alert.alert('Error', error.message || 'Failed to send OTP. Please check your internet connection and ensure the backend server is running.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsLoading(true);
    try {
      const response = await apiService.resendOTP(email);
      if (response.success) {
        Alert.alert('Success', 'New OTP sent to your email address');
      }
    } catch (error: any) {
      console.error('Resend OTP error:', error);
      Alert.alert('Error', error.message || 'Failed to resend OTP. Please check your internet connection and ensure the backend server is running.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp.trim()) {
      Alert.alert('Error', 'Please enter the OTP');
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiService.verifyOTP(email, otp);
      if (response.success && response.user) {
        await login(response.user, {
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
        });
        // Navigate after a small delay to ensure state is updated
        setTimeout(() => {
          router.replace('/(tabs)');
        }, 100);
      }
    } catch (error: any) {
      console.error('Verify OTP error:', error);
      Alert.alert('Error', error.message || 'Invalid OTP. Please check your internet connection and ensure the backend server is running.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToEmail = () => {
    setStep('email');
    setOtp('');
  };


  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <NetworkStatus />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.content}>
          <Text style={styles.title}>Tile Depot Admin</Text>
          <Text style={styles.subtitle}>
            {step === 'email' ? 'Enter your email to continue' : 'Enter the OTP sent to your email'}
          </Text>

          {step === 'email' ? (
            <View style={styles.form}>
              <TextInput
                style={styles.input}
                placeholder="Email address"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
              <TouchableOpacity
                style={[ styles.button, isLoading && styles.buttonDisabled ]}
                onPress={handleSendOTP}
                disabled={isLoading}
              >
                <Text style={styles.buttonText}>
                  {isLoading ? 'Sending...' : 'Send OTP'}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.form}>
              <TextInput
                style={styles.input}
                placeholder="Enter OTP"
                value={otp}
                onChangeText={setOtp}
                keyboardType="numeric"
                maxLength={6}
                editable={!isLoading}
              />
              <TouchableOpacity
                style={[ styles.button, isLoading && styles.buttonDisabled ]}
                onPress={handleVerifyOTP}
                disabled={isLoading}
              >
                <Text style={styles.buttonText}>
                  {isLoading ? 'Verifying...' : 'Verify OTP'}
                </Text>
              </TouchableOpacity>

              <View style={styles.otpActions}>
                <TouchableOpacity
                  style={styles.linkButton}
                  onPress={handleBackToEmail}
                  disabled={isLoading}
                >
                  <Text style={styles.linkText}>Change Email</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.linkButton}
                  onPress={handleResendOTP}
                  disabled={isLoading}
                >
                  <Text style={styles.linkText}>Resend OTP</Text>
                </TouchableOpacity>
              </View>

            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#1f2937',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    color: '#6b7280',
  },
  form: {
    gap: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9fafb',
  },
  button: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#9ca3af',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  otpActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  linkButton: {
    padding: 8,
  },
  linkText: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '500',
  },
});
