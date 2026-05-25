/**
 * Conversion utilities for metric ↔ imperial units
 */

// Weight conversions
export const kgToLbs = (kg: number): number => Math.round(kg * 2.20462 * 10) / 10;
export const lbsToKg = (lbs: number): number => Math.round(lbs / 2.20462 * 10) / 10;

// Height/Length conversions
export const cmToInches = (cm: number): number => Math.round(cm / 2.54 * 10) / 10;
export const inchesToCm = (inches: number): number => Math.round(inches * 2.54 * 10) / 10;

// Format weight for display
export const formatWeight = (kg: number, isMetric: boolean): string => {
  if (isMetric) {
    return `${kg.toFixed(1)} kg`;
  }
  return `${kgToLbs(kg).toFixed(1)} lbs`;
};

// Format height for display
export const formatHeight = (cm: number, isMetric: boolean): string => {
  if (isMetric) {
    return `${cm} cm`;
  }
  const inches = cmToInches(cm);
  const feet = Math.floor(inches / 12);
  const remainingInches = Math.round(inches % 12);
  return `${feet}'${remainingInches}"`;
};

// Parse weight input and convert to kg internally
export const parseWeight = (input: string, isMetric: boolean): number | null => {
  const num = parseFloat(input);
  if (isNaN(num)) return null;
  return isMetric ? num : lbsToKg(num);
};

// Parse height input and convert to cm internally
export const parseHeight = (input: string, isMetric: boolean): number | null => {
  const num = parseFloat(input);
  if (isNaN(num)) return null;
  return isMetric ? num : inchesToCm(num);
};
