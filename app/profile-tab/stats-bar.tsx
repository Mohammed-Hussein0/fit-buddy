import Ionicons from '@expo/vector-icons/Ionicons'
import { Text, View,StyleSheet } from 'react-native'

interface StatsBarProps{
    weight:string,
    workouts:string,
    streak:string
}

export default function Statsbar({weight,workouts,streak}:StatsBarProps) {
    return (
       <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>
                    {weight}
                    <Text style={styles.statUnit}> kg</Text>
                  </Text>
                  <Text style={styles.statLabel}>Current</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{workouts}</Text>
                  <Text style={styles.statLabel}>Total Workouts</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}> {streak}<Ionicons name='flame' size={20} color={'#ff0000'}/></Text>
                  <Text style={styles.statLabel}>Day Streak</Text>
                </View>
              </View>
    )
  }
  const styles = StyleSheet.create({
    statsGrid: {
    flexDirection: "row",
    backgroundColor: "#f9f9f9",
    borderRadius: 16,
    paddingVertical: 12,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  divider: {
    width: 1,
    height: "80%",
    backgroundColor: "#e0e0e0",
    alignSelf: "center",
  },
  statValue: {
    fontSize: 22,
    fontWeight: "800",
    color: "#000",
    marginBottom: 4,
  },
  statUnit: {
    fontSize: 14,
    fontWeight: "600",
    color: "#888",
  },
  statLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#999",
    textTransform: "uppercase",
  }})
