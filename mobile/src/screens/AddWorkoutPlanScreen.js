import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
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

const AddWorkoutPlanScreen = () => {
  const navigation = useNavigation();
  const [planName, setPlanName] = useState('');
  const [days, setDays] = useState([
    {
      dayNumber: 1,
      dayName: 'Chest',
      exercises: [],
      notes: '',
    },
  ]);
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [exerciseName, setExerciseName] = useState('');
  const [sets, setSets] = useState('');
  const [reps, setReps] = useState('');

  const addExercise = () => {
    if (!exerciseName.trim() || !sets.trim() || !reps.trim()) {
      Alert.alert('Error', 'Please fill in all exercise fields');
      return;
    }

    const newDays = [...days];
    newDays[currentDayIndex].exercises.push({
      name: exerciseName,
      sets: sets,
      reps: reps,
    });

    setDays(newDays);
    setExerciseName('');
    setSets('');
    setReps('');
  };

  const deleteExercise = (exerciseIndex) => {
    const newDays = [...days];
    newDays[currentDayIndex].exercises.splice(exerciseIndex, 1);
    setDays(newDays);
  };

  const addDay = () => {
    setDays([
      ...days,
      {
        dayNumber: days.length + 1,
        dayName: '',
        exercises: [],
        notes: '',
      },
    ]);
    setCurrentDayIndex(days.length);
  };

  const deleteDay = (dayIndex) => {
    if (days.length === 1) {
      Alert.alert('Error', 'You must have at least one day');
      return;
    }
    const newDays = days.filter((_, index) => index !== dayIndex);
    setDays(newDays);
    if (currentDayIndex >= newDays.length) {
      setCurrentDayIndex(newDays.length - 1);
    }
  };

  const updateDayName = (dayIndex, name) => {
    const newDays = [...days];
    newDays[dayIndex].dayName = name;
    setDays(newDays);
  };

  const updateNotes = (dayIndex, notes) => {
    const newDays = [...days];
    newDays[dayIndex].notes = notes;
    setDays(newDays);
  };

  const handleSubmit = async () => {
    if (!planName.trim()) {
      Alert.alert('Error', 'Please enter a workout plan name');
      return;
    }

    try {
      const workoutData = {
        name: planName.trim(),
        days: days.map((day) => ({
          dayNumber: day.dayNumber,
          dayName: day.dayName || `Day ${day.dayNumber}`,
          exercises: day.exercises || [],
          notes: day.notes || '',
        })),
      };
      
      console.log('Creating workout plan:', { 
        planName: workoutData.name, 
        planNameLength: workoutData.name.length,
        daysCount: workoutData.days.length,
        fullData: workoutData 
      });
      
      // Ensure we're sending the data correctly
      if (!workoutData.name || !workoutData.name.trim()) {
        Alert.alert('Error', 'Workout plan name cannot be empty');
        return;
      }
      
      const response = await api.post('/workouts', workoutData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('API POST response received:', response);
      console.log('Workout plan created successfully:', response.data);
      Alert.alert('Success', 'Workout plan created successfully', [
        { text: 'OK', onPress: () => navigation.navigate('WorkoutManagement') },
      ]);
    } catch (error) {
      console.error('Error creating workout plan:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      
      let errorMessage = 'Failed to create workout plan';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Error', errorMessage);
    }
  };

  const currentDay = days[currentDayIndex];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuButton}>
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Workout Plan</Text>
        <TouchableOpacity
          onPress={() => {
            // Reset form
            setPlanName('');
            setDays([{
              dayNumber: 1,
              dayName: 'Chest',
              exercises: [],
              notes: '',
            }]);
            setCurrentDayIndex(0);
            setExerciseName('');
            setSets('');
            setReps('');
          }}
        >
          <Text style={styles.refreshIcon}>↻</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <View style={styles.tab}>
          <Text style={styles.activeTabText}>Workout</Text>
        </View>
        <View style={styles.tab}>
          <Text style={styles.tabText}>Client</Text>
        </View>
        <View style={styles.tab}>
          <Text style={styles.tabText}>Availability</Text>
        </View>
      </View>

      <ScrollView style={[styles.content, (isTablet() || isDesktop()) && { maxWidth: getMaxContentWidth(), alignSelf: 'center', width: '100%' }]}>
        {/* Plan Name */}
        <TextInput
          style={styles.planNameInput}
          placeholder="Beginner's Workout - 3 days"
          value={planName}
          onChangeText={setPlanName}
        />

        {/* Day Selector */}
        <View style={styles.daySelector}>
          {days.map((day, index) => (
            <View key={index} style={styles.dayButtonContainer}>
              <TouchableOpacity
                style={[
                  styles.dayButton,
                  currentDayIndex === index && styles.activeDayButton,
                ]}
                onPress={() => setCurrentDayIndex(index)}
              >
                <Text
                  style={[
                    styles.dayButtonText,
                    currentDayIndex === index && styles.activeDayButtonText,
                  ]}
                >
                  Day {day.dayNumber}
                </Text>
              </TouchableOpacity>
              {index === currentDayIndex && (
                <>
                  <TextInput
                    style={styles.dayNameInput}
                    placeholder="Chest"
                    value={day.dayName}
                    onChangeText={(text) => updateDayName(index, text)}
                  />
                  <TouchableOpacity
                    onPress={() => deleteDay(index)}
                    style={styles.deleteDayButton}
                  >
                    <Text style={styles.deleteIcon}>🗑️</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          ))}
        </View>

        {/* Add Day Button */}
        <TouchableOpacity style={styles.addDayButton} onPress={addDay}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>

        {/* Exercise Input */}
        <View style={styles.exerciseInputContainer}>
          <TextInput
            style={styles.exerciseNameInput}
            placeholder="Exercise Name"
            value={exerciseName}
            onChangeText={setExerciseName}
          />
          <TextInput
            style={styles.setsRepsInput}
            placeholder="Sets"
            value={sets}
            onChangeText={setSets}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.setsRepsInput}
            placeholder="Reps"
            value={reps}
            onChangeText={setReps}
          />
          <TouchableOpacity style={styles.addExerciseButton} onPress={addExercise}>
            <Text style={styles.addExerciseButtonText}>Add</Text>
          </TouchableOpacity>
        </View>

        {/* Exercises List */}
        <View style={styles.exercisesList}>
          <View style={styles.exerciseHeader}>
            <Text style={styles.exerciseHeaderText}>Exercise</Text>
            <Text style={styles.exerciseHeaderText}>Sets</Text>
            <Text style={styles.exerciseHeaderText}>Reps</Text>
          </View>
          {currentDay.exercises.map((exercise, index) => (
            <View key={index} style={styles.exerciseRow}>
              <Text style={styles.exerciseName}>{exercise.name}</Text>
              <View style={styles.setsRepsBox}>
                <Text style={styles.setsRepsText}>{exercise.sets}</Text>
              </View>
              <View style={styles.setsRepsBox}>
                <Text style={styles.setsRepsText}>{exercise.reps}</Text>
              </View>
              <TouchableOpacity
                onPress={() => deleteExercise(index)}
                style={styles.deleteExerciseButton}
              >
                <Text style={styles.deleteIcon}>🗑️</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Add Exercise Button */}
        <TouchableOpacity style={styles.addExerciseIconButton} onPress={addExercise}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>

        {/* Notes */}
        <View style={styles.notesContainer}>
          <TextInput
            style={styles.notesInput}
            placeholder="Bench Press: www.benchpress.com&#10;Eat Oats"
            multiline
            value={currentDay.notes}
            onChangeText={(text) => updateNotes(currentDayIndex, text)}
          />
          <Text style={styles.wordsRemaining}>
            {50 - currentDay.notes.split(' ').length} words remaining
          </Text>
        </View>

        {/* Submit Button */}
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Submit</Text>
        </TouchableOpacity>
      </ScrollView>
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
      height: scaleHeight(headerHeight + 65),
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
    refreshIcon: {
      color: '#FFFFFF',
      fontSize: getResponsiveIconSize(24),
    },
    tabsContainer: {
      flexDirection: 'row',
      paddingHorizontal: getResponsivePadding(25),
      paddingTop: getResponsivePadding(20),
      borderBottomWidth: 1,
      borderBottomColor: '#737373',
      flexWrap: isLargeScreen ? 'wrap' : 'nowrap',
    },
    tab: {
      marginRight: scaleWidth(30),
      paddingBottom: scaleHeight(8),
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
    planNameInput: {
      backgroundColor: '#FFFFFF',
      borderRadius: scaleWidth(8),
      borderWidth: 1,
      borderColor: '#D9D9D9',
      padding: padding * 0.75,
      marginBottom: margin * 1.25,
      fontFamily: 'Poppins',
      fontSize: getResponsiveFontSize(18),
    },
    daySelector: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginBottom: margin * 1.25,
    },
    dayButtonContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: margin * 0.625,
      marginRight: scaleWidth(10),
    },
    dayButton: {
      backgroundColor: '#28A745',
      borderTopLeftRadius: scaleWidth(25),
      borderBottomLeftRadius: scaleWidth(25),
      paddingHorizontal: padding * 1.25,
      paddingVertical: scaleHeight(12),
    },
    activeDayButton: {
      backgroundColor: '#28A745',
    },
    dayButtonText: {
      fontFamily: 'Poppins',
      fontSize: getResponsiveFontSize(18),
      fontWeight: '600',
      color: '#FFFFFF',
    },
    activeDayButtonText: {
      color: '#FFFFFF',
    },
    dayNameInput: {
      backgroundColor: '#FFFFFF',
      borderRadius: scaleWidth(8),
      borderWidth: 1,
      borderColor: '#D9D9D9',
      padding: padding * 0.75,
      flex: 1,
      marginLeft: scaleWidth(10),
      fontFamily: 'Poppins',
      fontSize: getResponsiveFontSize(18),
    },
    deleteDayButton: {
      padding: scaleWidth(8),
      marginLeft: scaleWidth(10),
    },
    addDayButton: {
      width: scaleWidth(45),
      height: scaleWidth(45),
      borderRadius: scaleWidth(22.5),
      backgroundColor: '#28A745',
      justifyContent: 'center',
      alignItems: 'center',
      alignSelf: 'center',
      marginVertical: margin * 1.25,
    },
    addButtonText: {
      color: '#FFFFFF',
      fontSize: getResponsiveFontSize(30),
      fontWeight: 'bold',
    },
    exerciseInputContainer: {
      flexDirection: isLargeScreen ? 'row' : 'column',
      marginBottom: margin * 1.25,
      gap: scaleWidth(10),
    },
    exerciseNameInput: {
      flex: isLargeScreen ? 2 : 0,
      backgroundColor: '#FFFFFF',
      borderRadius: scaleWidth(8),
      borderWidth: 1,
      borderColor: '#D9D9D9',
      padding: padding * 0.75,
      fontFamily: 'Poppins',
      fontSize: getResponsiveFontSize(15),
    },
    setsRepsInput: {
      flex: isLargeScreen ? 1 : 0,
      backgroundColor: '#FFFFFF',
      borderRadius: scaleWidth(8),
      borderWidth: 1,
      borderColor: '#D9D9D9',
      padding: padding * 0.75,
      fontFamily: 'Poppins',
      fontSize: getResponsiveFontSize(15),
    },
    addExerciseButton: {
      backgroundColor: '#28A745',
      borderRadius: scaleWidth(8),
      paddingHorizontal: padding,
      justifyContent: 'center',
    },
    addExerciseButtonText: {
      color: '#FFFFFF',
      fontFamily: 'Poppins',
      fontSize: getResponsiveFontSize(15),
      fontWeight: '600',
    },
    exercisesList: {
      marginBottom: margin * 1.25,
    },
    exerciseHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: scaleHeight(10),
      borderBottomWidth: 1,
      borderBottomColor: '#737373',
    },
    exerciseHeaderText: {
      fontFamily: 'Poppins',
      fontSize: getResponsiveFontSize(18),
      fontWeight: '600',
      color: '#333333',
      flex: 1,
    },
    exerciseRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: scaleHeight(12),
      borderBottomWidth: 1,
      borderBottomColor: '#737373',
    },
    exerciseName: {
      fontFamily: 'Poppins',
      fontSize: getResponsiveFontSize(18),
      fontWeight: '500',
      color: '#333333',
      flex: 1,
    },
    setsRepsBox: {
      backgroundColor: '#FFFFFF',
      borderWidth: 1,
      borderColor: '#28A745',
      borderRadius: scaleWidth(5),
      padding: scaleWidth(8),
      marginHorizontal: scaleWidth(5),
      minWidth: scaleWidth(50),
    },
    setsRepsText: {
      fontFamily: 'Poppins',
      fontSize: getResponsiveFontSize(15),
      fontWeight: '600',
      color: '#737373',
      textAlign: 'center',
    },
    deleteExerciseButton: {
      padding: scaleWidth(8),
    },
    deleteIcon: {
      fontSize: getResponsiveIconSize(20),
    },
    addExerciseIconButton: {
      width: scaleWidth(45),
      height: scaleWidth(45),
      borderRadius: scaleWidth(22.5),
      backgroundColor: '#28A745',
      justifyContent: 'center',
      alignItems: 'center',
      alignSelf: 'center',
      marginVertical: margin * 1.25,
    },
    notesContainer: {
      backgroundColor: '#FFFFFF',
      borderRadius: scaleWidth(8),
      borderWidth: 1,
      borderColor: '#D9D9D9',
      padding: padding,
      marginBottom: margin * 1.25,
      minHeight: scaleHeight(160),
    },
    notesInput: {
      fontFamily: 'Poppins',
      fontSize: getResponsiveFontSize(15),
      color: '#737373',
      minHeight: scaleHeight(100),
      textAlignVertical: 'top',
    },
    wordsRemaining: {
      fontFamily: 'Poppins',
      fontSize: getResponsiveFontSize(15),
      color: '#FF9933',
      textAlign: 'right',
      marginTop: scaleHeight(10),
    },
    submitButton: {
      backgroundColor: '#28A745',
      borderRadius: scaleWidth(15),
      padding: padding * 0.9375,
      alignItems: 'center',
      marginBottom: margin * 2.5,
    },
    submitButtonText: {
      fontFamily: 'Roboto Flex',
      fontSize: getResponsiveFontSize(25),
      fontWeight: '600',
      color: '#FFFFFF',
    },
  });
};

const styles = getStyles();

export default AddWorkoutPlanScreen;

