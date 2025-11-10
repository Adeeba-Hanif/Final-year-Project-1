// screens/Hostels.js
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Layout from "../components/Layout";
import Typography from "../components/Typography";
import { nearbyHostels } from "../dummyData";
import { Ionicons } from "@expo/vector-icons";

export default function NearbyHostels() {
  return (
    <Layout title="Nearby Hostels" showBack scroll>
      <Typography variant="heading" style={{ marginBottom: 10 }}>
        Recommended Hostels Near Campus
      </Typography>

      {nearbyHostels.map((hostel) => (
        <View key={hostel.id} style={styles.card}>
          <Text style={styles.name}>{hostel.name}</Text>
          <Text style={styles.location}>{hostel.location}</Text>
          <Text style={styles.description}>{hostel.description}</Text>

          {/* Rating */}
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={14} color="#FACC15" fill="#FACC15" />
            <Text style={styles.ratingText}>{hostel.rating.toFixed(1)}</Text>
          </View>

          {/* Rate */}
          <Text style={styles.rate}>
            Rs. {hostel.averageRate.toLocaleString()} / month
          </Text>

          {/* Contact Info */}
          <View style={styles.contactContainer}>
            <Text style={styles.contactText}>📧 {hostel.email}</Text>
            <Text style={styles.contactText}>📞 {hostel.phone}</Text>
          </View>
        </View>
      ))}
    </Layout>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 14,
    marginBottom: 14,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  location: {
    fontSize: 13,
    color: "#4B5563",
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    color: "#374151",
    marginBottom: 6,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  ratingText: {
    marginLeft: 4,
    color: "#FACC15",
    fontWeight: "600",
  },
  rate: {
    fontSize: 14,
    fontWeight: "500",
    color: "#2563EB",
    marginBottom: 6,
  },
  contactContainer: {
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingTop: 6,
  },
  contactText: {
    fontSize: 13,
    color: "#374151",
  },
});
