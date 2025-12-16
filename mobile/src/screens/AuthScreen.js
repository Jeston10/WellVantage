import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

const AuthScreen = () => {
  const { continueAsGuest } = useAuth();
  const [loading, setLoading] = React.useState(false);

  const handleContinueAsGuest = async () => {
    try {
      setLoading(true);
      continueAsGuest();
    } catch (error) {
      console.error('Error continuing as guest:', error);
    } finally {
      setLoading(false);
    }
  };


  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Sign Up</Text>
        
        <Text style={styles.welcomeText}>
          Welcome! Manage, Track and Grow your Gym with WellVantage.
        </Text>

        <TouchableOpacity
          style={styles.guestButton}
          onPress={handleContinueAsGuest}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.guestButtonText}>Continue as Guest</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontFamily: 'Poppins',
    fontSize: 25,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 40,
    marginTop: 73,
  },
  welcomeText: {
    fontFamily: 'Poppins',
    fontSize: 25,
    fontWeight: '600',
    color: '#333333',
    textAlign: 'center',
    lineHeight: 35,
    marginBottom: 100,
    paddingHorizontal: 20,
  },
  guestButton: {
    width: 300,
    height: 50,
    backgroundColor: '#28A745',
    borderRadius: 8,
    shadowColor: '#28A745',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  guestButtonText: {
    fontFamily: 'Poppins',
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default AuthScreen;

