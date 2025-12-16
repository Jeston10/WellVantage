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
  Dimensions,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import api from '../config/api';
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
      <View style={styles.tabsWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContainer}
        >
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
        </ScrollView>
      </View>

      <ScrollView style={[styles.content, (isTablet() || isDesktop()) && { maxWidth: getMaxContentWidth(), alignSelf: 'center', width: '100%' }]}>
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

const getStyles = () => {
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
      height: headerHeight,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: getResponsivePadding(16),
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
      fontFamily: 'Poppins',
      fontSize: getResponsiveFontSize(18),
      fontWeight: '600',
      color: '#28A745',
    },
    content: {
      flex: 1,
      padding: padding,
    },
    title: {
      fontFamily: 'Poppins',
      fontSize: getResponsiveFontSize(24),
      fontWeight: '600',
      color: '#333333',
      marginBottom: margin * 1.25,
    },
    inputGroup: {
      marginBottom: margin * 1.25,
    },
    label: {
      fontFamily: 'Poppins',
      fontSize: getResponsiveFontSize(16),
      fontWeight: '500',
      color: '#333333',
      marginBottom: scaleHeight(8),
    },
    input: {
      backgroundColor: '#FFFFFF',
      borderRadius: scaleWidth(8),
      borderWidth: 1,
      borderColor: '#D9D9D9',
      padding: padding * 0.75,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    inputText: {
      fontFamily: 'Poppins',
      fontSize: getResponsiveFontSize(15),
      color: '#333333',
    },
    calendarIcon: {
      fontSize: getResponsiveIconSize(20),
    },
    timeInputsContainer: {
      flexDirection: isLargeScreen ? 'row' : 'column',
      gap: scaleWidth(10),
      marginBottom: margin * 1.25,
    },
    timeInputGroup: {
      flex: isLargeScreen ? 1 : 0,
    },
    toggleContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: margin * 1.25,
    },
    toggle: {
      width: scaleWidth(50),
      height: scaleHeight(30),
      borderRadius: scaleWidth(15),
      backgroundColor: '#D9D9D9',
      justifyContent: 'center',
      paddingHorizontal: scaleWidth(2),
    },
    toggleActive: {
      backgroundColor: '#28A745',
    },
    toggleCircle: {
      width: scaleWidth(26),
      height: scaleWidth(26),
      borderRadius: scaleWidth(13),
      backgroundColor: '#FFFFFF',
    },
    toggleCircleActive: {
      alignSelf: 'flex-end',
    },
    selectedDatesContainer: {
      flexDirection: isLargeScreen ? 'row' : 'column',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: margin,
      padding: padding * 0.75,
      backgroundColor: '#E8F5E9',
      borderRadius: scaleWidth(8),
      borderWidth: 1,
      borderColor: '#28A745',
      gap: scaleWidth(10),
    },
    selectedDatesText: {
      fontFamily: 'Poppins',
      fontSize: getResponsiveFontSize(16),
      fontWeight: '500',
      color: '#28A745',
    },
    clearButton: {
      paddingHorizontal: padding * 0.75,
      paddingVertical: scaleHeight(6),
      backgroundColor: '#FFFFFF',
      borderRadius: scaleWidth(6),
      borderWidth: 1,
      borderColor: '#28A745',
    },
    clearButtonText: {
      fontFamily: 'Poppins',
      fontSize: getResponsiveFontSize(14),
      fontWeight: '500',
      color: '#28A745',
    },
    calendarContainer: {
      backgroundColor: '#FFFFFF',
      borderRadius: scaleWidth(8),
      borderWidth: 1,
      borderColor: '#D9D9D9',
      padding: padding * 0.625,
      marginBottom: margin * 1.25,
    },
    createButtonDisabled: {
      opacity: 0.6,
    },
    createButton: {
      backgroundColor: '#28A745',
      borderRadius: scaleWidth(15),
      padding: padding * 0.9375,
      alignItems: 'center',
      marginBottom: margin * 2.5,
    },
    createButtonText: {
      fontFamily: 'Poppins',
      fontSize: getResponsiveFontSize(18),
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
      borderTopLeftRadius: scaleWidth(20),
      borderTopRightRadius: scaleWidth(20),
      paddingBottom: margin * 1.25,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: padding,
      borderBottomWidth: 1,
      borderBottomColor: '#E0E0E0',
    },
    modalCancel: {
      fontFamily: 'Poppins',
      fontSize: getResponsiveFontSize(16),
      color: '#737373',
    },
    modalDone: {
      fontFamily: 'Poppins',
      fontSize: getResponsiveFontSize(16),
      fontWeight: '600',
      color: '#28A745',
    },
  });
};

const styles = getStyles();

export default SetAvailabilityScreen;

