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
import { Calendar } from 'react-native-calendars';
import { useNavigation } from '@react-navigation/native';
import api from '../config/api';
import Sidebar from '../components/Sidebar';

const BookSlotsScreen = () => {
  const navigation = useNavigation();
  const [selectedDates, setSelectedDates] = useState({
    [new Date().toISOString().split('T')[0]]: {
      selected: true,
      selectedColor: '#28A745',
    },
  });
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlots, setSelectedSlots] = useState(new Set());
  const [isBooking, setIsBooking] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('BookSlots');

  // Set active tab when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setActiveTab('BookSlots');
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    fetchSlots();
  }, [selectedDates]);

  const fetchSlots = async () => {
    try {
      setLoading(true);
      const dateKeys = Object.keys(selectedDates);
      if (dateKeys.length === 0) {
        setSlots([]);
        setLoading(false);
        return;
      }

      console.log('Fetching slots for dates:', dateKeys);

      // Fetch slots for all selected dates with error handling per request
      const promises = dateKeys.map(async (date) => {
        try {
          const response = await api.get(`/availability?date=${date}`);
          console.log(`Fetched slots for ${date}:`, response.data?.length || 0);
          return response.data || [];
        } catch (error) {
          console.error(`Error fetching slots for date ${date}:`, error);
          // Return empty array for failed requests instead of failing entire operation
          return [];
        }
      });
      
      const results = await Promise.allSettled(promises);
      
      // Combine all slots from all selected dates
      const allSlots = results
        .filter((result) => result.status === 'fulfilled')
        .flatMap((result) => result.value || []);
      
      console.log('Total slots fetched:', allSlots.length);
      setSlots(allSlots);
    } catch (error) {
      console.error('Error fetching slots:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      setSlots([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleDayPress = (day) => {
    const dateString = day.dateString;
    setSelectedDates((prev) => {
      const newDates = { ...prev };
      if (newDates[dateString]) {
        // Deselect if already selected
        delete newDates[dateString];
      } else {
        // Select date
        newDates[dateString] = {
          selected: true,
          selectedColor: '#28A745',
          marked: true,
        };
      }
      return newDates;
    });
  };

  const toggleSlotSelection = (slotId) => {
    setSelectedSlots((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(slotId)) {
        newSet.delete(slotId);
      } else {
        newSet.add(slotId);
      }
      return newSet;
    });
  };

  const handleBookSlot = async (slotId) => {
    try {
      console.log('Booking slot:', slotId);
      const response = await api.post(`/availability/${slotId}/book`);
      console.log('Booking response:', response.data);
      Alert.alert('Success', 'Slot booked successfully');
      fetchSlots(); // Refresh the slots list
      setSelectedSlots((prev) => {
        const newSet = new Set(prev);
        newSet.delete(slotId);
        return newSet;
      });
    } catch (error) {
      console.error('Error booking slot:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      
      let errorMessage = 'Failed to book slot';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Error', errorMessage);
    }
  };

  const handleBulkBook = async () => {
    if (selectedSlots.size === 0) {
      Alert.alert('Error', 'Please select at least one slot to book');
      return;
    }

    setIsBooking(true);
    try {
      const slotIds = Array.from(selectedSlots);
      const promises = slotIds.map((slotId) =>
        api.post(`/availability/${slotId}/book`)
      );

      await Promise.all(promises);
      Alert.alert('Success', `${slotIds.length} slot(s) booked successfully`);
      fetchSlots();
      setSelectedSlots(new Set());
    } catch (error) {
      console.error('Error bulk booking slots:', error);
      Alert.alert(
        'Error',
        'Some slots failed to book. Please try again or book individually.'
      );
    } finally {
      setIsBooking(false);
    }
  };

  const handleDeleteSlot = async (slotId) => {
    Alert.alert(
      'Delete Slot',
      'Are you sure you want to delete this slot?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('Attempting to delete slot:', slotId);
              const response = await api.delete(`/availability/${slotId}`);
              console.log('Delete response:', response.data);
              Alert.alert('Success', 'Slot deleted successfully');
              fetchSlots();
            } catch (error) {
              console.error('Error deleting slot:', error);
              console.error('Error details:', JSON.stringify(error, null, 2));
              
              let errorMessage = 'Failed to delete slot';
              if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
              } else if (error.message) {
                errorMessage = error.message;
              }
              
              Alert.alert('Error', errorMessage);
            }
          },
        },
      ]
    );
  };

  const handleRefresh = () => {
    fetchSlots();
  };

  return (
    <SafeAreaView style={styles.container}>
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

      {/* Navigation Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'Workout' && styles.activeTab]}
          onPress={() => {
            setActiveTab('Workout');
            navigation.navigate('WorkoutManagement');
          }}
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
          onPress={() => {
            setActiveTab('Client');
            navigation.navigate('WorkoutManagement');
          }}
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
          onPress={() => setActiveTab('BookSlots')}
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
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.title}>Book Client Slots</Text>
        <Text style={styles.subtitle}>
          Rahul Verma has 20 sessions left to book by 24 June 2026.
        </Text>

        {/* Selected Dates Info */}
        {Object.keys(selectedDates).length > 0 && (
          <View style={styles.selectedDatesInfo}>
            <Text style={styles.selectedDatesText}>
              {Object.keys(selectedDates).length} date(s) selected
            </Text>
            <TouchableOpacity
              onPress={() => {
                setSelectedDates({
                  [new Date().toISOString().split('T')[0]]: {
                    selected: true,
                    selectedColor: '#28A745',
                  },
                });
              }}
              style={styles.clearDatesButton}
            >
              <Text style={styles.clearDatesButtonText}>Reset</Text>
            </TouchableOpacity>
          </View>
        )}

        <Calendar
          current={new Date().toISOString().split('T')[0]}
          onDayPress={handleDayPress}
          markedDates={selectedDates}
          markingType="multi-dot"
          theme={{
            selectedDayBackgroundColor: '#28A745',
            todayTextColor: '#28A745',
            arrowColor: '#28A745',
          }}
        />

        {/* Bulk Booking Controls */}
        {selectedSlots.size > 0 && (
          <View style={styles.bulkBookingContainer}>
            <Text style={styles.bulkBookingText}>
              {selectedSlots.size} slot(s) selected
            </Text>
            <TouchableOpacity
              style={styles.bulkBookButton}
              onPress={handleBulkBook}
              disabled={isBooking}
            >
              <Text style={styles.bulkBookButtonText}>
                {isBooking ? 'Booking...' : `Book ${selectedSlots.size} Slot(s)`}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setSelectedSlots(new Set())}
              style={styles.clearSlotsButton}
            >
              <Text style={styles.clearSlotsButtonText}>Clear</Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.slotsTitle}>
          Available Slots ({slots.length}):
        </Text>

        {slots.length === 0 ? (
          <Text style={styles.noSlotsText}>
            No slots available for selected dates
          </Text>
        ) : (
          slots.map((slot) => {
            const isSelected = selectedSlots.has(slot._id);
            const slotDate = slot.date
              ? new Date(slot.date).toISOString().split('T')[0]
              : 'Unknown';
            
            return (
              <View
                key={slot._id}
                style={[
                  styles.slotItem,
                  isSelected && styles.slotItemSelected,
                  slot.isBooked && styles.slotItemBooked,
                ]}
              >
                <TouchableOpacity
                  style={styles.slotCheckbox}
                  onPress={() => !slot.isBooked && toggleSlotSelection(slot._id)}
                  disabled={slot.isBooked}
                >
                  <Text style={styles.checkboxText}>
                    {slot.isBooked ? '✓' : isSelected ? '☑' : '☐'}
                  </Text>
                </TouchableOpacity>
                <View style={styles.slotTimeContainer}>
                  <Text style={styles.slotTime}>
                    {slot.startTime} - {slot.endTime}
                  </Text>
                  <Text style={styles.slotDate}>{slotDate}</Text>
                </View>
                <TouchableOpacity
                  style={[
                    styles.statusButton,
                    slot.isBooked && styles.statusButtonBooked,
                  ]}
                  onPress={() => !slot.isBooked && handleBookSlot(slot._id)}
                  disabled={slot.isBooked}
                >
                  <Text
                    style={[
                      styles.statusText,
                      slot.isBooked && styles.statusTextBooked,
                    ]}
                  >
                    {slot.isBooked ? 'Booked' : 'Book'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleDeleteSlot(slot._id)}
                  style={styles.deleteButton}
                >
                  <Text style={styles.deleteIcon}>🗑️</Text>
                </TouchableOpacity>
              </View>
            );
          })
        )}
      </ScrollView>
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
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
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
  title: {
    fontFamily: 'Poppins',
    fontSize: 24,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 10,
  },
  subtitle: {
    fontFamily: 'Poppins',
    fontSize: 16,
    color: '#333333',
    marginBottom: 20,
  },
  slotsTitle: {
    fontFamily: 'Poppins',
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginTop: 20,
    marginBottom: 10,
  },
  selectedDatesInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    padding: 12,
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#28A745',
  },
  selectedDatesText: {
    fontFamily: 'Poppins',
    fontSize: 16,
    fontWeight: '500',
    color: '#28A745',
  },
  clearDatesButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#28A745',
  },
  clearDatesButtonText: {
    fontFamily: 'Poppins',
    fontSize: 14,
    fontWeight: '500',
    color: '#28A745',
  },
  bulkBookingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 15,
    marginBottom: 15,
    padding: 12,
    backgroundColor: '#FFF3CD',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFC107',
    gap: 10,
  },
  bulkBookingText: {
    fontFamily: 'Poppins',
    fontSize: 16,
    fontWeight: '500',
    color: '#856404',
    flex: 1,
  },
  bulkBookButton: {
    backgroundColor: '#28A745',
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  bulkBookButtonText: {
    fontFamily: 'Poppins',
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  clearSlotsButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#856404',
  },
  clearSlotsButtonText: {
    fontFamily: 'Poppins',
    fontSize: 14,
    fontWeight: '500',
    color: '#856404',
  },
  slotItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    gap: 10,
  },
  slotItemSelected: {
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    padding: 4,
  },
  slotItemBooked: {
    opacity: 0.6,
  },
  slotCheckbox: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxText: {
    fontSize: 20,
    color: '#28A745',
  },
  slotTimeContainer: {
    flex: 1,
    backgroundColor: '#E8F5E9',
    borderWidth: 1,
    borderColor: '#28A745',
    borderRadius: 8,
    padding: 12,
  },
  slotTime: {
    fontFamily: 'Poppins',
    fontSize: 15,
    fontWeight: '500',
    color: '#333333',
  },
  slotDate: {
    fontFamily: 'Poppins',
    fontSize: 12,
    color: '#737373',
    marginTop: 4,
  },
  noSlotsText: {
    fontFamily: 'Poppins',
    fontSize: 16,
    color: '#737373',
    textAlign: 'center',
    marginTop: 20,
    fontStyle: 'italic',
  },
  statusButton: {
    backgroundColor: '#E8F5E9',
    borderWidth: 1,
    borderColor: '#28A745',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  statusButtonBooked: {
    backgroundColor: '#D9D9D9',
    borderColor: '#737373',
  },
  statusText: {
    fontFamily: 'Poppins',
    fontSize: 15,
    fontWeight: '500',
    color: '#28A745',
  },
  statusTextBooked: {
    color: '#737373',
  },
  deleteButton: {
    padding: 8,
  },
  deleteIcon: {
    fontSize: 20,
  },
});

export default BookSlotsScreen;

