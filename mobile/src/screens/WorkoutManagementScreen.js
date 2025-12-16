import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  Dimensions,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import api from '../config/api';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import {
  scaleWidth,
  scaleHeight,
  getResponsiveFontSize,
  getResponsivePadding,
  getResponsiveMargin,
  getResponsiveIconSize,
  getResponsiveHeaderHeight,
  getMaxContentWidth,
  isTablet,
  isDesktop,
} from '../utils/responsive';

// Use responsive utilities for screen width
const getScreenWidth = () => Dimensions.get('window').width;

const WorkoutManagementScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [workoutPlans, setWorkoutPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [activeTab, setActiveTab] = useState('Workout');
  const [loading, setLoading] = useState(true);
  const [sidebarVisible, setSidebarVisible] = useState(false);

  useEffect(() => {
    fetchWorkoutPlans();
  }, []);

  // Refresh when screen comes into focus (e.g., when returning from AddWorkoutPlan)
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchWorkoutPlans();
      // Reset to Workout tab when screen comes into focus
      setActiveTab('Workout');
    });
    return unsubscribe;
  }, [navigation]);

  const fetchWorkoutPlans = async () => {
    try {
      setLoading(true);
      const response = await api.get('/workouts');
      setWorkoutPlans(response.data);
      if (response.data.length > 0 && !selectedPlan) {
        setSelectedPlan(response.data[0]._id);
      }
    } catch (error) {
      console.error('Error fetching workout plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchWorkoutPlans();
  };

  const handleDeletePlan = async (planId) => {
    Alert.alert(
      'Delete Workout Plan',
      'Are you sure you want to delete this workout plan?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/workouts/${planId}`);
              fetchWorkoutPlans();
            } catch (error) {
              console.error('Error deleting workout plan:', error);
              alert('Failed to delete workout plan');
            }
          },
        },
      ]
    );
  };

  const currentPlan = workoutPlans.find((plan) => plan._id === selectedPlan);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => setSidebarVisible(true)}
        >
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Workout Management</Text>
        <TouchableOpacity onPress={handleRefresh}>
          <Text style={styles.refreshIcon}>↻</Text>
        </TouchableOpacity>
      </View>

      {/* Sidebar */}
      <Sidebar
        visible={sidebarVisible}
        onClose={() => setSidebarVisible(false)}
      />

      {/* Tabs */}
      <View style={styles.tabsWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContainer}
        >
          <TouchableOpacity
            style={[styles.tab, activeTab === 'Workout' && styles.activeTab]}
            onPress={() => setActiveTab('Workout')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'Workout' && styles.activeTabText,
              ]}
            >
              Workout
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'Client' && styles.activeTab]}
            onPress={() => setActiveTab('Client')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'Client' && styles.activeTabText,
              ]}
            >
              Client
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'Availability' && styles.activeTab]}
            onPress={() => {
              setActiveTab('Availability');
              navigation.navigate('SetAvailability');
            }}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'Availability' && styles.activeTabText,
              ]}
            >
              Availability
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'BookSlots' && styles.activeTab]}
            onPress={() => {
              setActiveTab('BookSlots');
              navigation.navigate('BookSlots');
            }}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'BookSlots' && styles.activeTabText,
              ]}
            >
              Book Slots
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Content */}
      {activeTab === 'Workout' && (
        <ScrollView style={styles.content}>
          {/* Dropdown */}
          <TouchableOpacity style={styles.dropdown}>
            <Text style={styles.dropdownText}>Custom Workout Plans</Text>
            <Text style={styles.dropdownArrow}>▼</Text>
          </TouchableOpacity>

          {/* Workout Plans List */}
          {workoutPlans.map((plan) => (
            <View key={plan._id} style={styles.planItem}>
              <Text style={styles.planName}>{plan.name}</Text>
              <TouchableOpacity
                onPress={() => handleDeletePlan(plan._id)}
                style={styles.deleteButton}
              >
                <Text style={styles.deleteIcon}>🗑️</Text>
              </TouchableOpacity>
            </View>
          ))}

          {/* Add Button */}
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('AddWorkoutPlan')}
          >
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const getStyles = () => {
  const maxWidth = getMaxContentWidth();
  const padding = getResponsivePadding();
  const margin = getResponsiveMargin();
  const headerHeight = getResponsiveHeaderHeight();
  const isLargeScreen = isTablet() || isDesktop();
  
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#FFFFFF',
    },
    header: {
      backgroundColor: '#28A745',
      height: scaleHeight(headerHeight),
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: getResponsivePadding(16),
      paddingTop: Platform.OS === 'ios' ? scaleHeight(40) : scaleHeight(10),
    },
    menuButton: {
      width: scaleWidth(35),
      height: scaleWidth(35),
      justifyContent: 'center',
      alignItems: 'center',
    },
    menuIcon: {
      color: '#FFFFFF',
      fontSize: getResponsiveIconSize(24),
    },
    headerTitle: {
      fontFamily: 'Poppins',
      fontSize: getResponsiveFontSize(21),
      fontWeight: '600',
      color: '#FFFFFF',
    },
    headerRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: scaleWidth(16),
    },
    refreshIcon: {
      color: '#FFFFFF',
      fontSize: getResponsiveIconSize(24),
    },
    tabsWrapper: {
      borderBottomWidth: 1,
      borderBottomColor: '#737373',
    },
    tabsContainer: {
      flexDirection: 'row',
      paddingLeft: getResponsivePadding(20),
      paddingRight: getResponsivePadding(20),
      paddingTop: getResponsivePadding(20),
      paddingBottom: scaleHeight(8),
      alignItems: 'center',
      minHeight: scaleHeight(50),
    },
    tab: {
      marginRight: scaleWidth(25),
      paddingBottom: scaleHeight(8),
      paddingHorizontal: scaleWidth(8),
      minWidth: scaleWidth(60),
    },
    activeTab: {
      borderBottomWidth: scaleHeight(4),
      borderBottomColor: '#28A745',
    },
    tabText: {
      fontFamily: 'Poppins',
      fontSize: getResponsiveFontSize(18),
      fontWeight: '600',
      color: '#333333',
    },
    activeTabText: {
      color: '#28A745',
    },
    content: {
      flex: 1,
      padding: padding,
      maxWidth: isLargeScreen ? maxWidth : getScreenWidth(),
      alignSelf: isLargeScreen ? 'center' : 'stretch',
      width: '100%',
    },
    dropdown: {
      backgroundColor: '#F6F6F8',
      borderRadius: scaleWidth(8),
      padding: padding,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: margin,
      shadowColor: '#737373',
      shadowOffset: { width: 0, height: scaleHeight(3) },
      shadowOpacity: 0.25,
      shadowRadius: scaleWidth(3),
      elevation: 3,
    },
    dropdownText: {
      fontFamily: 'Poppins',
      fontSize: getResponsiveFontSize(18),
      fontWeight: '500',
      color: '#333333',
    },
    dropdownArrow: {
      fontSize: getResponsiveFontSize(12),
      color: '#333333',
    },
    planItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: scaleHeight(12),
      borderBottomWidth: 1,
      borderBottomColor: '#737373',
    },
    planName: {
      fontFamily: 'Poppins',
      fontSize: getResponsiveFontSize(18),
      fontWeight: '500',
      color: '#333333',
      flex: 1,
    },
    deleteButton: {
      padding: scaleWidth(8),
    },
    deleteIcon: {
      fontSize: getResponsiveIconSize(20),
    },
    addButton: {
      width: scaleWidth(45),
      height: scaleWidth(45),
      borderRadius: scaleWidth(22.5),
      backgroundColor: '#28A745',
      justifyContent: 'center',
      alignItems: 'center',
      alignSelf: 'center',
      marginTop: margin,
      marginBottom: margin * 2,
    },
    addButtonText: {
      color: '#FFFFFF',
      fontSize: getResponsiveFontSize(30),
      fontWeight: 'bold',
    },
  });
};

const styles = getStyles();

export default WorkoutManagementScreen;

