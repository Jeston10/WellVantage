import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import {
  scaleWidth,
  scaleHeight,
  getResponsiveFontSize,
  getResponsivePadding,
  getResponsiveMargin,
  getResponsiveButtonHeight,
  getMaxContentWidth,
  isTablet,
  isDesktop,
} from '../utils/responsive';

// Use responsive utilities for screen width
const getScreenWidth = () => Dimensions.get('window').width;

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


  const maxWidth = getMaxContentWidth();
  const isLargeScreen = isTablet() || isDesktop();

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.content, isLargeScreen && { maxWidth, alignSelf: 'center', width: '100%' }]}>
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

const getStyles = () => {
  const padding = getResponsivePadding();
  const margin = getResponsiveMargin();
  const buttonHeight = getResponsiveButtonHeight(50);
  const maxButtonWidth = isTablet() ? scaleWidth(400) : scaleWidth(300);
  
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#FFFFFF',
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: padding,
    },
    title: {
      fontFamily: 'Poppins',
      fontSize: getResponsiveFontSize(25),
      fontWeight: '600',
      color: '#333333',
      marginBottom: margin * 2.5,
      marginTop: scaleHeight(73),
    },
    welcomeText: {
      fontFamily: 'Poppins',
      fontSize: getResponsiveFontSize(isTablet() ? 28 : 25),
      fontWeight: '600',
      color: '#333333',
      textAlign: 'center',
      lineHeight: getResponsiveFontSize(35),
      marginBottom: margin * 6,
      paddingHorizontal: padding,
    },
    guestButton: {
      width: Math.min(maxButtonWidth, getScreenWidth() - padding * 2),
      height: buttonHeight,
      backgroundColor: '#28A745',
      borderRadius: scaleWidth(8),
      shadowColor: '#28A745',
      shadowOffset: { width: 0, height: scaleHeight(2) },
      shadowOpacity: 0.3,
      shadowRadius: scaleWidth(4),
      elevation: 3,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: padding,
    },
    guestButtonText: {
      fontFamily: 'Poppins',
      fontSize: getResponsiveFontSize(16),
      fontWeight: '600',
      color: '#FFFFFF',
    },
  });
};

const styles = getStyles();

export default AuthScreen;

