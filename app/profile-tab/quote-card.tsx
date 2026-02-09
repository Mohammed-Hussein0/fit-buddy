import React from 'react';
import { View,Text, StyleSheet } from 'react-native';

export default function QuoteCard() {
    return (
      <View style={styles.quoteContainer}>
            <Text style={styles.quoteText}>
              &quot;The only bad workout is the one that did not happen.&quot;
            </Text>
          </View>
        );
}
const styles = StyleSheet.create({
  quoteContainer: {
    marginVertical:30,
    marginHorizontal: 20,
    backgroundColor: "#000",
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
  },
  quoteText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    fontStyle: "italic",
    lineHeight: 26,
  },
})