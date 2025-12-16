import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  Platform,
  Modal,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import api from '../config/api';
import Sidebar from '../components/Sidebar';

const SetAvailabilityScreen = () => {
  const navigation = useNavigation();
  const [date, setDate] = useState(new Date());
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [sessionName, setSessionName] = useState('PT');
  const [repeatSessions, setRepeatSessions] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [selectedDates, setSelectedDates] = useState({});
  const [isCreating, setIsCreating] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('Availability');

  // Set active tab when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setActiveTab('Availability');
    });
    return unsubscribe;
  }, [navigation]);

  const formatTime = (date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
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
    // Update the main date state for the date picker
    setDate(new Date(dateString));
  };

  const handleSubmit = async () => {
    if (!sessionName.trim()) {
      Alert.alert('Error', 'Please enter a session name');
      return;
    }

    const datesToCreate = Object.keys(selectedDates);
    if (datesToCreate.length === 0) {
      Alert.alert('Error', 'Please select at least one date from the calendar');
      return;
    }

    setIsCreating(true);
    try {
      const promises = datesToCreate.map((dateString) =>
        api.post('/availability', {
          date: new Date(dateString).toISOString(),
          startTime: formatTime(startTime),
          endTime: formatTime(endTime),
          sessionName,
          repeatSessions,
        })
      );

      await Promise.all(promises);
      Alert.alert(
        'Success',
        `Availability created successfully for ${datesToCreate.length} date(s)`,
        [
          {
            text: 'OK',
            onPress: () => {
              // Reset form after successful creation but stay on the page
              handleRefresh();
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error creating availability:', error);
      Alert.alert('Error', 'Failed to create availability. Some dates may have been created.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleRefresh = () => {
    // Reset form to initial state
    setDate(new Date());
    setStartTime(new Date());
    setEndTime(new Date());
    setSessionName('PT');
    setRepeatSessions(false);
    setSelectedDates({});
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
          onPress={() => setActiveTab('Availability')}
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
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.title}>Set Availability</Text>

        {/* Date Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Date*</Text>
          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.inputText}>
              {date.toLocaleDateString('en-US', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </Text>
            <Text style={styles.calendarIcon}>📅</Text>
          </TouchableOpacity>
        </View>

        {/* Time Inputs */}
        <View style={styles.timeInputsContainer}>
          <View style={styles.timeInputGroup}>
            <Text style={styles.label}>Start Time*</Text>
            <TouchableOpacity
              style={styles.input}
              onPress={() => setShowStartTimePicker(true)}
            >
              <Text style={styles.inputText}>{formatTime(startTime)}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.timeInputGroup}>
            <Text style={styles.label}>End Time*</Text>
            <TouchableOpacity
              style={styles.input}
              onPress={() => setShowEndTimePicker(true)}
            >
              <Text style={styles.inputText}>{formatTime(endTime)}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Repeat Sessions Toggle */}
        <View style={styles.toggleContainer}>
          <Text style={styles.label}>Repeat Sessions</Text>
          <TouchableOpacity
            style={[
              styles.toggle,
              repeatSessions && styles.toggleActive,
            ]}
            onPress={() => setRepeatSessions(!repeatSessions)}
          >
            <View
              style={[
                styles.toggleCircle,
                repeatSessions && styles.toggleCircleActive,
              ]}
            />
          </TouchableOpacity>
        </View>

        {/* Selected Dates Count */}
        {Object.keys(selectedDates).length > 0 && (
          <View style={styles.selectedDatesContainer}>
            <Text style={styles.selectedDatesText}>
              {Object.keys(selectedDates).length} date(s) selected
            </Text>
            <TouchableOpacity
              onPress={() => setSelectedDates({})}
              style={styles.clearButton}
            >
              <Text style={styles.clearButtonText}>Clear All</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Calendar */}
        <View style={styles.calendarContainer}>
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
        </View>

        {/* Session Name */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Session Name*</Text>
          <TextInput
            style={styles.input}
            value={sessionName}
            onChangeText={setSessionName}
            placeholder="PT"
          />
        </View>

        {/* Create Button */}
        <TouchableOpacity
          style={[styles.createButton, isCreating && styles.createButtonDisabled]}
          onPress={handleSubmit}
          disabled={isCreating}
        >
          <Text style={styles.createButtonText}>
            {isCreating
              ? `Creating ${Object.keys(selectedDates).length} slot(s)...`
              : `Create ${Object.keys(selectedDates).length || ''} Slot(s)`}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Date Picker */}
      {showDatePicker && Platform.OS === 'android' && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (event.type !== 'dismissed' && selectedDate) {
              setDate(selectedDate);
            }
          }}
        />
      )}
      {Platform.OS === 'ios' && showDatePicker && (
        <Modal
          transparent={true}
          animationType="slide"
          visible={showDatePicker}
          onRequestClose={() => setShowDatePicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Text style={styles.modalCancel}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setShowDatePicker(false);
                  }}
                >
                  <Text style={styles.modalDone}>Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={date}
                mode="date"
                display="spinner"
                onChange={(event, selectedDate) => {
                  if (selectedDate) {
                    setDate(selectedDate);
                  }
                }}
              />
            </View>
          </View>
        </Modal>
      )}

      {/* Start Time Picker */}
      {showStartTimePicker && Platform.OS === 'android' && (
        <DateTimePicker
          value={startTime}
          mode="time"
          display="default"
          is24Hour={false}
          onChange={(event, selectedTime) => {
            setShowStartTimePicker(false);
            if (event.type !== 'dismissed' && selectedTime) {
              setStartTime(selectedTime);
            }
          }}
        />
      )}
      {Platform.OS === 'ios' && showStartTimePicker && (
        <Modal
          transparent={true}
          animationType="slide"
          visible={showStartTimePicker}
          onRequestClose={() => setShowStartTimePicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setShowStartTimePicker(false)}>
                  <Text style={styles.modalCancel}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setShowStartTimePicker(false);
                  }}
                >
                  <Text style={styles.modalDone}>Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={startTime}
                mode="time"
                display="spinner"
                is24Hour={false}
                onChange={(event, selectedTime) => {
                  if (selectedTime) {
                    setStartTime(selectedTime);
                  }
                }}
              />
            </View>
          </View>
        </Modal>
      )}

      {/* End Time Picker */}
      {showEndTimePicker && Platform.OS === 'android' && (
        <DateTimePicker
          value={endTime}
          mode="time"
          display="default"
          is24Hour={false}
          onChange={(event, selectedTime) => {
            setShowEndTimePicker(false);
            if (event.type !== 'dismissed' && selectedTime) {
              setEndTime(selectedTime);
            }
          }}
        />
      )}
      {Platform.OS === 'ios' && showEndTimePicker && (
        <Modal
          transparent={true}
          animationType="slide"
          visible={showEndTimePicker}
          onRequestClose={() => setShowEndTimePicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setShowEndTimePicker(false)}>
                  <Text style={styles.modalCancel}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setShowEndTimePicker(false);
                  }}
                >
                  <Text style={styles.modalDone}>Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={endTime}
                mode="time"
                display="spinner"
                is24Hour={false}
                onChange={(event, selectedTime) => {
                  if (selectedTime) {
                    setEndTime(selectedTime);
                  }
                }}
              />
            </View>
          </View>
        </Modal>
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
    fontFamily: 'Poppins',
    fontSize: 18,
    fontWeight: '600',
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
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontFamily: 'Poppins',
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D9D9D9',
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inputText: {
    fontFamily: 'Poppins',
    fontSize: 15,
    color: '#333333',
  },
  calendarIcon: {
    fontSize: 20,
  },
  timeInputsContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  timeInputGroup: {
    flex: 1,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#D9D9D9',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleActive: {
    backgroundColor: '#28A745',
  },
  toggleCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
  },
  toggleCircleActive: {
    alignSelf: 'flex-end',
  },
  selectedDatesContainer: {
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
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#28A745',
  },
  clearButtonText: {
    fontFamily: 'Poppins',
    fontSize: 14,
    fontWeight: '500',
    color: '#28A745',
  },
  calendarContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D9D9D9',
    padding: 10,
    marginBottom: 20,
  },
  createButtonDisabled: {
    opacity: 0.6,
  },
  createButton: {
    backgroundColor: '#28A745',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    marginBottom: 40,
  },
  createButtonText: {
    fontFamily: 'Poppins',
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalCancel: {
    fontFamily: 'Poppins',
    fontSize: 16,
    color: '#737373',
  },
  modalDone: {
    fontFamily: 'Poppins',
    fontSize: 16,
    fontWeight: '600',
    color: '#28A745',
  },
});

export default SetAvailabilityScreen;

