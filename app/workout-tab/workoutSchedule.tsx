import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

// --- Types ---
interface Workout {
  id: string;
  title: string;
  duration: string;
  image: string;
  date: Date;
}

interface Program {
  id: string;
  title: string;
  status: string;
  progress: string;
  image: string;
}

interface DailyScheduleProps {
  activeProgram: Program;
  handleBackToPrograms: () => void;
}

// --- Constants & Data ---
const ITEM_HEIGHT = 80; // Height of a normal row
const ACTIVE_ITEM_HEIGHT = 340; // Height of the "Today" expanded card area

const d = (offset: number) => {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return date;
};

const WORKOUT_SCHEDULE: Workout[] = [
  { id: '1', title: 'Chest Foundation', duration: '45 min', date: d(-2), image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=200' },
  { id: '2', title: 'Back & Biceps', duration: '50 min', date: d(-1), image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=200' },
  { id: '3', title: 'LEG DAY DESTRUCTION', duration: '60 min', date: d(0), image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600' },
  { id: '4', title: 'Shoulder Press', duration: '40 min', date: d(1), image: 'https://images.unsplash.com/photo-1544367563-12123d8975b9?w=200' },
  { id: '5', title: 'Active Recovery', duration: '30 min', date: d(2), image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=200' },
  { id: '6', title: 'Upper Power', duration: '55 min', date: d(3), image: 'https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?w=200' },
  { id: '7', title: 'Lower Hypertrophy', duration: '50 min', date: d(4), image: 'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?w=200' },
  { id: '8', title: 'Abs & Cardio', duration: '25 min', date: d(5), image: 'https://images.unsplash.com/photo-1574680096141-1cddd70fb668?w=200' },
  { id: '9', title: 'Full Body A', duration: '60 min', date: d(6), image: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=200' },
  { id: '10', title: 'Full Body B', duration: '60 min', date: d(7), image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=200' },
];

export default function DailySchedule({ activeProgram, handleBackToPrograms }: DailyScheduleProps) {
  const flatListRef = useRef<FlatList>(null);
  
  // 1. Define today BEFORE using it
  const today = new Date();
  
  // 2. Data source
  const data = WORKOUT_SCHEDULE;

  // 3. Find index
  const todayIndex = data.findIndex(
    (item) =>
      item.date.getDate() === today.getDate() &&
      item.date.getMonth() === today.getMonth()
  );

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.circleBtn} onPress={handleBackToPrograms}>
          <Ionicons name="grid-outline" size={20} color="#000" />
        </TouchableOpacity>
        <Text style={styles.programName}>
          {activeProgram ? activeProgram.title.toUpperCase() : 'PROGRAM'}
        </Text>
        <TouchableOpacity style={styles.circleBtn}>
          <Ionicons name="ellipsis-horizontal" size={20} color="#000" />
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={data}
        keyExtractor={(item) => item.id}
        // Scroll to specific item logic
        initialScrollIndex={todayIndex !== -1 ? todayIndex : 0}
        onScrollToIndexFailed={(info) => {
          const wait = new Promise((resolve) => setTimeout(resolve, 500));
          wait.then(() => {
            flatListRef.current?.scrollToIndex({ index: info.index, animated: true });
          });
        }}
        getItemLayout={(data, index) => {
          let offset = 0;
          let length = ITEM_HEIGHT;

          if (todayIndex !== -1) {
            if (index < todayIndex) {
              // Items before today are all small
              offset = index * ITEM_HEIGHT;
            } else if (index === todayIndex) {
              // The today item itself
              offset = index * ITEM_HEIGHT;
              length = ACTIVE_ITEM_HEIGHT;
            } else {
              // Items after today: (Number of previous small items * small height) + (1 big item height)
              // Simplified: (Index * 80) + (Difference between Big and Small)
              offset = (index * ITEM_HEIGHT) + (ACTIVE_ITEM_HEIGHT - ITEM_HEIGHT);
            }
          } else {
            offset = index * ITEM_HEIGHT;
          }

          return { length, offset, index };
        }}
        renderItem={({ item, index }) => {
          const isToday = index === todayIndex; // Use index check for speed
          const dateStr = item.date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
          }).toUpperCase();

          if (isToday) {
            return (
              <View style={[styles.todayContainer, { height: ACTIVE_ITEM_HEIGHT }]}>
                <Text style={styles.sectionHeader}>TODAYS FOCUS</Text>
                <TouchableOpacity style={styles.bigCard} activeOpacity={0.95}>
                  <Image source={{ uri: item.image }} style={styles.bigImage} />
                  <View style={styles.overlay} />
                  <View style={styles.bigTextContent}>
                    <View style={styles.tag}>
                      <Text style={styles.tagText}>CURRENT</Text>
                    </View>
                    <Text style={styles.bigTitle}>{item.title}</Text>
                    <Text style={styles.bigSubtitle}>{item.duration} • Heavy</Text>
                  </View>
                </TouchableOpacity>
              </View>
            );
          }

          return (
            <View style={[styles.rowWrapper, { height: ITEM_HEIGHT }]}>
              {/* Timeline Line */}
              <View style={styles.timelineLine} />
              
              <TouchableOpacity style={styles.row}>
                <Image source={{ uri: item.image }} style={styles.smallImage} />
                <View style={styles.rowContent}>
                  <Text style={styles.dateLabel}>{dateStr}</Text>
                  <Text style={styles.rowTitle}>{item.title}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#ccc" />
              </TouchableOpacity>
            </View>
          );
        }}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff', 
    paddingTop: 60 
  },
  listContent: { 
    paddingHorizontal: 20, 
    paddingBottom: 100 
  },
  topBar: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingBottom: 20 
  },
  programName: { 
    fontSize: 14, 
    fontWeight: '800', 
    letterSpacing: 1 
  },
  circleBtn: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    backgroundColor: '#f4f4f4', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  
  // Normal Row Styles
  rowWrapper: { 
    position: 'relative', 
    justifyContent: 'center',
    // Height is handled inline or via constant
  },
  timelineLine: { 
    position: 'absolute', 
    left: 25, // Center of the 50px image (25px)
    top: -40, // Reach up to previous item
    bottom: -40, // Reach down to next item
    width: 2, 
    backgroundColor: '#f0f0f0', 
    zIndex: -1 
  },
  row: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#fff', 
    paddingVertical: 10 
  },
  smallImage: { 
    width: 50, 
    height: 50, 
    borderRadius: 10, 
    backgroundColor: '#eee' 
  },
  rowContent: { 
    flex: 1, 
    marginLeft: 15 
  },
  dateLabel: { 
    fontSize: 10, 
    fontWeight: '700', 
    color: '#999', 
    marginBottom: 2 
  },
  rowTitle: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: '#333' 
  },

  // Today / Big Card Styles
  todayContainer: { 
    justifyContent: 'center',
    marginVertical: 10,
    // Height is handled inline
  },
  sectionHeader: { 
    fontSize: 12, 
    paddingLeft:30,
    fontWeight: 'bold', 
    color: '#888', 
    marginBottom: 10, 
    letterSpacing: 1 
  },
  bigCard: { 
    flex: 1,
    borderRadius: 24, 
    overflow: 'hidden', 
    backgroundColor: '#000', 
    justifyContent: 'flex-end',
    marginBottom: 10
  },
  bigImage: { 
    ...StyleSheet.absoluteFillObject 
  },
  overlay: { 
    ...StyleSheet.absoluteFillObject, 
    backgroundColor: 'rgba(0,0,0,0.3)' 
  },
  bigTextContent: { 
    padding: 25 
  },
  tag: { 
    backgroundColor: '#fff', 
    paddingHorizontal: 10, 
    paddingVertical: 5, 
    borderRadius: 6, 
    alignSelf: 'flex-start', 
    marginBottom: 10 
  },
  tagText: { 
    fontSize: 10, 
    fontWeight: '900', 
    color: '#000' 
  },
  bigTitle: { 
    color: '#fff', 
    fontSize: 28, 
    fontWeight: '800', 
    marginBottom: 5 
  },
  bigSubtitle: { 
    color: '#ddd', 
    fontSize: 14, 
    fontWeight: '500' 
  },
});