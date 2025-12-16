import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';

import AuthScreen from './src/screens/AuthScreen';
import WorkoutManagementScreen from './src/screens/WorkoutManagementScreen';
import AddWorkoutPlanScreen from './src/screens/AddWorkoutPlanScreen';
import BookSlotsScreen from './src/screens/BookSlotsScreen';
import SetAvailabilityScreen from './src/screens/SetAvailabilityScreen';
import { AuthProvider, useAuth } from './src/context/AuthContext';

const Stack = createStackNavigator();

function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return null; // You can add a loading screen here
  }

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
            <Stack.Screen name="WorkoutManagement" component={WorkoutManagementScreen} />
            <Stack.Screen name="AddWorkoutPlan" component={AddWorkoutPlanScreen} />
            <Stack.Screen name="BookSlots" component={BookSlotsScreen} />
            <Stack.Screen name="SetAvailability" component={SetAvailabilityScreen} />
          </>
        ) : (
          <Stack.Screen name="Auth" component={AuthScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}

