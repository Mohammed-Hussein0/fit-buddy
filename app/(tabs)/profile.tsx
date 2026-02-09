import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  Animated,
  TouchableOpacity,
  Image,
  StatusBar,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import Ionicons from '@expo/vector-icons/Ionicons';

const { width } = Dimensions.get('window');

// --- TYPES ---
interface Habit {
  id: string;
  text: string;
  icon: string;
  completed: boolean;
}

export default function ProfileTab() {
  const [fadeAnim] = useState(new Animated.Value(1));
  const [showEmail, setShowEmail] = useState(false);
  
  // State for interactive habits
  const [habits, setHabits] = useState<Habit[]>([
    { id: '1', text: 'Hit 4 workouts this week', icon: 'barbell-outline', completed: true },
    { id: '2', text: 'Drink 3L of water', icon: 'water-outline', completed: false },
    { id: '3', text: 'Sleep 8 hours', icon: 'moon-outline', completed: false },
    { id: '4', text: 'Track macros', icon: 'nutrition-outline', completed: true },
  ]);

  const toggleHabit = (id: string) => {
    setHabits(current =>
      current.map(h => h.id === id ? { ...h, completed: !h.completed } : h)
    );
  };

  // User Data
  const user = {
    username: 'FitWarrior2024',
    email: 'alex.fitness@example.com',
    joinDate: 'Member since 2023',
    stats: {
      weight: '75.5',
      workouts: '142',
      streak: '12',
      calories: '2,400',
    }
  };

  // Chart Data
  const weightData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        data: [82, 79, 78, 76, 75.5, 75],
        color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`, // Black line
        strokeWidth: 3,
      },
    ],
  };

  // Header Animation Loop
  useEffect(() => {
    const loop = setInterval(() => {
      Animated.sequence([
        Animated.timing(fadeAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
        Animated.delay(300),
        Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]).start();

      setTimeout(() => setShowEmail(prev => !prev), 800);
    }, 6000); // Slower, less distracting interval

    return () => clearInterval(loop);
  }, []);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <StatusBar barStyle="dark-content" />

      {/* --- HEADER SECTION --- */}
      <View style={styles.header}>
        <View style={styles.profileRow}>
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=400' }} 
            style={styles.avatar} 
          />
          <View style={styles.profileInfo}>
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeText}>PRO MEMBER</Text>
            </View>
            
            {/* MODIFIED: Added automatic resizing props */}
            <Animated.Text 
              numberOfLines={1} 
              adjustsFontSizeToFit={true}
              minimumFontScale={0.5} 
              style={[styles.username, { opacity: fadeAnim }]}
            >
              {showEmail ? user.email : `@${user.username}`}
            </Animated.Text>

            <Text style={styles.joinDate}>{user.joinDate}</Text>
          </View>
          <TouchableOpacity style={styles.settingsBtn}>
            <Ionicons name="settings-sharp" size={24} color="#000" />
          </TouchableOpacity>
        </View>

        {/* --- QUICK STATS GRID --- */}
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user.stats.weight}<Text style={styles.statUnit}>kg</Text></Text>
            <Text style={styles.statLabel}>Current</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user.stats.workouts}</Text>
            <Text style={styles.statLabel}>Total Workouts</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>🔥 {user.stats.streak}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
        </View>
      </View>

      {/* --- CHART SECTION --- */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>PROGRESS</Text>
          <TouchableOpacity>
             <Text style={styles.seeAllText}>6 Months ▾</Text>
          </TouchableOpacity>
        </View>
        
      <LineChart
          data={weightData}
          width={width - 30} // Width of the graph
          height={220}
          yAxisSuffix=""
          yAxisInterval={1} // Optional, defaults to 1
          segments={5} // <--- THIS FIXES THE VERTICAL ALIGNMENT
          yLabelsOffset={7} // <--- Adjusts horizontal distance from graph
          chartConfig={{
            backgroundColor: '#fff',
            backgroundGradientFrom: '#fff',
            backgroundGradientTo: '#fff',
            decimalPlaces: 1, 
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(150, 150, 150, ${opacity})`,
            style: { 
              borderRadius: 16 
            },
            propsForDots: {
              r: '4',
              strokeWidth: '1',
              stroke: '#ffffff',
              fill: '#ff0000'
            },
            propsForBackgroundLines: {
                strokeDasharray: "", // Solid lines
                stroke: "#f0f0f0"
            }
          }}
          bezier
          style={styles.chart}
        />
      </View>

      {/* --- DAILY HABITS --- */}
      <View style={styles.habitsContainer}>
        <Text style={styles.sectionTitle}>DAILY HABITS</Text>
        <Text style={styles.sectionSubtitle}>Consistency is key.</Text>
        
        {habits.map((habit) => (
          <TouchableOpacity 
            key={habit.id} 
            style={[styles.habitCard, habit.completed && styles.habitCardDone]} 
            onPress={() => toggleHabit(habit.id)}
            activeOpacity={0.8}
          >
            <View style={[styles.iconBox, habit.completed && styles.iconBoxDone]}>
              <Ionicons 
                name={habit.icon as any} 
                size={22} 
                color={habit.completed ? '#fff' : '#000'} 
              />
            </View>
            <Text style={[styles.habitText, habit.completed && styles.habitTextDone]}>
              {habit.text}
            </Text>
            <Ionicons 
              name={habit.completed ? "checkmark-circle" : "ellipse-outline"} 
              size={24} 
              color={habit.completed ? "#000" : "#ddd"} 
            />
          </TouchableOpacity>
        ))}
      </View>

      {/* --- QUOTE CARD --- */}
      <View style={styles.quoteContainer}>
        <Text style={styles.quoteText}>
          &quot;The only bad workout is the one that did not happen.&quot;
        </Text>
      </View>
      
      <View style={{ height: 100 }} /> 
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  // Header
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 20,
    borderWidth: 2,
    borderColor: '#f0f0f0',
  },
  profileInfo: {
    flex: 1,
  },
  badgeContainer: {
    backgroundColor: '#000',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  username: {
    fontSize: 20,
    fontWeight: '800',
    color: '#000',
    marginBottom: 2,
  },
  joinDate: {
    fontSize: 12,
    color: '#888',
    fontWeight: '500',
  },
  settingsBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f8f8f8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f9f9f9',
    borderRadius: 16,
    padding: 20,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  divider: {
    width: 1,
    height: '80%',
    backgroundColor: '#e0e0e0',
    alignSelf: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#000',
    marginBottom: 4,
  },
  statUnit: {
    fontSize: 14,
    fontWeight: '600',
    color: '#888',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#999',
    textTransform: 'uppercase',
  },

  // Sections
  sectionContainer: {
    marginTop: 30,
    paddingHorizontal: 5,
  },
  habitsContainer:
  {
      marginTop: 30,
    paddingHorizontal: 20, 
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 15,
    paddingHorizontal:15
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#000',
    letterSpacing: 0.5,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 20,
    marginTop: -5,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#888',
  },

  // Chart
  chart: {
    borderRadius: 16,
    paddingRight: 40, // fix for chart kit padding
    marginVertical: 10,
  },

  // Habits
  habitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#f0f0f0',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  habitCardDone: {
    backgroundColor: '#f9f9f9',
    borderColor: '#f9f9f9',
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#f4f4f4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  iconBoxDone: {
    backgroundColor: '#000',
  },
  habitText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  habitTextDone: {
    color: '#bbb',
    textDecorationLine: 'line-through',
  },

  // Quote
  quoteContainer: {
    marginTop: 30,
    marginHorizontal: 20,
    backgroundColor: '#000',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
  },
  quoteText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 26,
  },
});