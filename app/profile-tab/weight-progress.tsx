import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import { useMetrics } from "../context/MetricsContext";
import { kgToLbs } from "../utils/metricsConverter";
import Svg, { Path, Circle, Line, Rect } from "react-native-svg";

const weightHistory = [
  { date: "2025-11-20", weight: 82.5 },
  { date: "2025-12-10", weight: 81.9 },
  { date: "2026-01-02", weight: 81.2 },
  { date: "2026-01-25", weight: 80.6 },
  { date: "2026-02-14", weight: 79.6 },
  { date: "2026-03-08", weight: 79.0 },
  { date: "2026-03-30", weight: 78.4 },
  { date: "2026-04-15", weight: 77.8 },
  { date: "2026-04-30", weight: 76.9 },
  { date: "2026-05-05", weight: 75.5 },
  { date: "2026-05-10", weight: 75.0 },
  { date: "2026-05-15", weight: 74.8 },
  { date: "2026-05-18", weight: 74.5 },
  { date: "2026-05-19", weight: 74.4 },
  { date: "2026-05-20", weight: 74.2 },
];

const parseDate = (dateString: string) => new Date(dateString).getTime();
const formatDateLabel = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const getYAxisLabels = (min: number, max: number, steps: number) => {
  const delta = (max - min) / steps;
  return Array.from({ length: steps + 1 }, (_, index) => max - delta * index);
};

const periodOptions = [
  { key: "1M", label: "1 month", months: 1 },
  { key: "4M", label: "4 months", months: 4 },
  { key: "6M", label: "6 months", months: 6 },
  { key: "1Y", label: "1 year", months: 12 },
];
const defaultPeriodIndex = 2;

export default function WeightChart() {
  const { width } = Dimensions.get("window");
  const { colors } = useTheme();
  const { isMetric } = useMetrics();
  const chartWidth = Math.max(260, width - 96);
  const chartHeight = 210;
  const [periodIndex, setPeriodIndex] = useState(defaultPeriodIndex);
  const selectedPeriod = periodOptions[periodIndex];

  const sortedHistory = useMemo(
    () =>
      [...weightHistory].sort((a, b) => parseDate(a.date) - parseDate(b.date)),
    [],
  );

  const filteredHistory = useMemo(() => {
    const today = new Date();
    const cutoff = new Date(today);
    cutoff.setMonth(cutoff.getMonth() - (selectedPeriod.months ?? 6));

    const result = sortedHistory.filter(
      (item) => parseDate(item.date) >= cutoff.getTime(),
    );
    return result.length ? result : sortedHistory;
  }, [selectedPeriod.months, sortedHistory]);

  const points = filteredHistory.map((item) => ({
    x: parseDate(item.date),
    y: isMetric ? item.weight : kgToLbs(item.weight),
    label: formatDateLabel(item.date),
  }));

  const xValues = points.map((point) => point.x);
  const yValues = points.map((point) => point.y);

  const minX = Math.min(...xValues);
  const maxX = Math.max(...xValues);
  const minY = Math.min(...yValues) - 1;
  const maxY = Math.max(...yValues) + 1;

  const xRange = maxX - minX || 1;
  const yRange = maxY - minY || 1;
  const chartInnerWidth = chartWidth - 12;
  const chartInnerHeight = chartHeight - 24;

  const path = points
    .map((point, index) => {
      const x = ((point.x - minX) / xRange) * chartInnerWidth + 6;
      const y =
        chartInnerHeight - ((point.y - minY) / yRange) * chartInnerHeight + 10;
      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  const yLabels = getYAxisLabels(minY, maxY, 4);
  const xLabels = [
    points[0]?.label ?? "",
    points[Math.floor(points.length / 2)]?.label ?? "",
    points[points.length - 1]?.label ?? "",
  ];

  return (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeaderRow}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          PROGRESS
        </Text>
      </View>

      <View style={styles.periodRow}>
        {periodOptions.map((option) => (
          <TouchableOpacity
            key={option.key}
            style={[
              styles.periodButton,
              { backgroundColor: colors.surface },
              selectedPeriod.key === option.key && {
                backgroundColor: colors.text,
              },
            ]}
            onPress={() =>
              setPeriodIndex(
                periodOptions.findIndex((item) => item.key === option.key),
              )
            }
          >
            <Text
              style={
                selectedPeriod.key === option.key
                  ? [styles.periodTextActive, { color: colors.surface }]
                  : [styles.periodText, { color: colors.secondaryText }]
              }
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View
        style={[
          styles.chartWrapper,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <View style={styles.yAxisLabels}>
          {yLabels.map((value) => (
            <Text
              key={value.toFixed(1)}
              style={[styles.yLabel, { color: colors.secondaryText }]}
            >
              {value.toFixed(1)}
            </Text>
          ))}
        </View>

        <View style={[styles.chartArea, { width: chartWidth }]}>
          <Svg width={chartWidth} height={chartHeight}>
            <Rect
              x={0}
              y={0}
              width={chartWidth}
              height={chartHeight}
              rx={16}
              fill={colors.surface}
            />
            {yLabels.map((value, index) => {
              const y = (chartInnerHeight / 4) * index + 10;
              return (
                <Line
                  key={`grid-${index}`}
                  x1={6}
                  y1={y}
                  x2={chartWidth - 6}
                  y2={y}
                  stroke={colors.border}
                  strokeWidth={1}
                />
              );
            })}
            <Path
              d={path}
              fill="none"
              stroke="#ff2b2b"
              strokeWidth={2}
              strokeLinecap="round"
            />
            {points.map((point, index) => {
              const x = ((point.x - minX) / xRange) * chartInnerWidth + 6;
              const y =
                chartInnerHeight -
                ((point.y - minY) / yRange) * chartInnerHeight +
                10;
              return (
                <Circle
                  key={`dot-${index}`}
                  cx={x}
                  cy={y}
                  r={4}
                  fill="#ff2b2b"
                  stroke="#fff"
                  strokeWidth={2}
                />
              );
            })}
          </Svg>

          <View style={styles.xLabelsRow}>
            {xLabels.map((label, index) => (
              <Text
                key={`${label}-${index}`}
                style={[styles.xLabel, { color: colors.secondaryText }]}
                numberOfLines={1}
              >
                {label}
              </Text>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 30,
    paddingHorizontal: 15,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#000",
    letterSpacing: 0.5,
  },
  zoomRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    flexWrap: "wrap",
  },
  zoomLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#888",
  },
  zoomButton: {
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  zoomButtonDisabled: {
    backgroundColor: "#ebebeb",
  },
  zoomButtonText: {
    fontSize: 14,
    color: "#000",
    fontWeight: "700",
  },
  zoomButtonTextDisabled: {
    fontSize: 14,
    color: "#aaa",
    fontWeight: "700",
  },
  selectedPeriodText: {
    fontSize: 12,
    color: "#444",
    fontWeight: "600",
  },
  periodRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 14,
  },
  periodButton: {
    backgroundColor: "#f5f5f5",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    marginRight: 8,
    marginBottom: 8,
  },
  periodButtonActive: {
    backgroundColor: "#000",
  },
  periodText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "600",
  },
  periodTextActive: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "600",
  },
  chartWrapper: {
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 14,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  yAxisLabels: {
    width: 40,
    justifyContent: "space-between",
    height: 210,
  },
  yLabel: {
    fontSize: 11,
    color: "#666",
  },
  chartArea: {
    justifyContent: "space-between",
    flex: 1,
  },
  xLabelsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    paddingHorizontal: 6,
  },
  xLabel: {
    fontSize: 11,
    color: "#666",
    width: 60,
  },
});
