import {
  View,
  Text,
  TouchableOpacity,
 StyleSheet,
 Dimensions
} from "react-native";
import { LineChart } from "react-native-chart-kit";

  const weightData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        data: [82, 79, 78, 76, 75.5, 75],
        color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`, // Black line
        strokeWidth:2,
      },
    ],
  };

export default function WeightChart() {
  const { width } = Dimensions.get("window");
    return (
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
            backgroundColor: "#fff",
            backgroundGradientFrom: "#fff",
            backgroundGradientTo: "#fff",
            decimalPlaces: 1,
            color: (opacity = 1) => `rgba(250, 250, 250, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(150, 150, 150, ${opacity})`,
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: "4",
              strokeWidth: "1.5",
              stroke: "#ffffff",
              fill: "#ff0000",
            },
            propsForBackgroundLines: {
              strokeDasharray: "", // Solid lines
              stroke: "#f0f0f0",
            },
          }}
          bezier
          style={styles.chart}
        />
      </View>
    )
}
const styles = StyleSheet.create({ 
    chart: {
    borderRadius: 16,
    paddingRight: 40, // fix for chart kit padding
    marginVertical: 10
},
sectionContainer: {
    marginTop: 30,
    paddingHorizontal: 5,
  },
  habitsContainer: {
    marginTop: 30,
    paddingHorizontal: 20,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 15,
    paddingHorizontal: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#000",
    letterSpacing: 0.5,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#888",
    marginBottom: 20,
    marginTop: -5,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#888",
  },
})
