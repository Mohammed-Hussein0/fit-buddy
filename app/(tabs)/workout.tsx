import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Image, 
  TouchableOpacity, 
  StatusBar,
  LayoutAnimation,
  Platform,
  UIManager
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import DailySchedule from '../workout-tab/workoutSchedule';
import ProgramScreen from '../workout-tab/programs';

// Enable layout animation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface Program {
  id: string;
  title: string;
  status: string;
  progress: string;
  image: string;
}
export default function WorkoutScreen() {
  // I changed default to null so you can see the Program List first
  const [activeProgram, setActiveProgram] = useState<Program | null>(null); 

  // Navigation Logic
  const handleBackToPrograms = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setActiveProgram(null);
  };

  const handleSelectProgram = (program: Program) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setActiveProgram(program);
  };



  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <StatusBar barStyle="dark-content" />
      
      {activeProgram ? (
        // CORRECTED: Render as a JSX Component, not a function call
        <DailySchedule 
          activeProgram={activeProgram} 
          handleBackToPrograms={handleBackToPrograms} 
        />
      ) : (
        <ProgramScreen handleSelectProgram={handleSelectProgram}/>
      )}
    </View>
  );
}