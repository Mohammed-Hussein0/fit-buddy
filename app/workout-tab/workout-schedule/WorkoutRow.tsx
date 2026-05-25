import Ionicons from "@expo/vector-icons/Ionicons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Swipeable } from "react-native-gesture-handler";

const DAYS_SHORT = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

export const WorkoutRow = ({
  item,
  isToday,
  onDelete,
  onSelectWorkout,
  colors,
}: any) => {
  const renderRightActions = () => (
    <TouchableOpacity style={styles.deleteAction} onPress={onDelete}>
      <Ionicons name="trash-outline" size={24} color="#fff" />
    </TouchableOpacity>
  );

  return (
    <Swipeable renderRightActions={renderRightActions}>
      <TouchableOpacity
        style={[
          styles.row,
          isToday && [styles.todayRow, { borderColor: colors.icon }],
          { backgroundColor: colors.surface },
        ]}
        onPress={() => onSelectWorkout && onSelectWorkout(item)}
        activeOpacity={0.7}
      >
        <View
          style={[
            styles.dayBadge,
            isToday && styles.todayBadge,
            { backgroundColor: isToday ? "#000" : colors.background },
          ]}
        >
          <Text
            style={[
              styles.dayText,
              isToday && styles.todayDayText,
              { color: isToday ? "#fff" : colors.secondaryText },
            ]}
          >
            {DAYS_SHORT[item.dayOfWeek]}
          </Text>
        </View>
        <View style={styles.rowContent}>
          <Text style={[styles.rowTitle, { color: colors.text }]}>
            {item.title}
          </Text>
          <Text
            style={[styles.rowSubtitle, { color: colors.secondaryText }]}
            numberOfLines={1}
          >
            {item.note}
          </Text>
        </View>
        <Ionicons
          name="chevron-forward"
          size={18}
          color={isToday ? colors.icon : colors.border}
        />
      </TouchableOpacity>
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
    borderRadius: 24,
    marginBottom: 14,
    borderWidth: 1,
  },
  todayRow: { borderWidth: 1.5 },
  dayBadge: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  todayBadge: { backgroundColor: "#000" },
  dayText: { fontSize: 11, fontWeight: "900" },
  todayDayText: { color: "#fff" },
  rowContent: { flex: 1 },
  rowTitle: { fontSize: 17, fontWeight: "800" },
  rowSubtitle: { fontSize: 13, marginTop: 3, fontWeight: "500" },
  deleteAction: {
    backgroundColor: "#ff4444",
    justifyContent: "center",
    alignItems: "center",
    width: 70,
    borderRadius: 24,
    marginBottom: 14,
    marginLeft: 10,
  },
});
