import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import api from '../config/api';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';

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
      <View style={styles.tabsContainer}>
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
          <Text style={styles.tabText}>Book Slots</Text>
        </TouchableOpacity>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: '#28A745',
    height: 125,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 40,
  },
  menuButton: {
    width: 35,
    height: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuIcon: {
    color: '#FFFFFF',
    fontSize: 24,
  },
  headerTitle: {
    fontFamily: 'Poppins',
    fontSize: 21,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  refreshIcon: {
    color: '#FFFFFF',
    fontSize: 24,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 25,
    paddingTop: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#737373',
  },
  tab: {
    marginRight: 30,
    paddingBottom: 8,
  },
  activeTab: {
    borderBottomWidth: 4,
    borderBottomColor: '#28A745',
  },
  tabText: {
    fontFamily: 'Poppins',
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  activeTabText: {
    color: '#28A745',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  dropdown: {
    backgroundColor: '#F6F6F8',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#737373',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 3,
  },
  dropdownText: {
    fontFamily: 'Poppins',
    fontSize: 18,
    fontWeight: '500',
    color: '#333333',
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#333333',
  },
  planItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#737373',
  },
  planName: {
    fontFamily: 'Poppins',
    fontSize: 18,
    fontWeight: '500',
    color: '#333333',
  },
  deleteButton: {
    padding: 8,
  },
  deleteIcon: {
    fontSize: 20,
  },
  addButton: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#28A745',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: 'bold',
  },
});

export default WorkoutManagementScreen;

