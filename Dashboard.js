import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Typography from "../components/Typography";
import Layout from "../components/Layout";
import { Ionicons } from "@expo/vector-icons";
import { useProfileStore } from "../store/profile";
import Loader from "../components/Loader";

export default function Dashboard({ navigation }) {

  const user = useProfileStore((state) => state.profile);

  const notificationsCount = 2;

  const tiles = [
    { label: "Attendance", screen: "Attendance", icon: "🧾" },
    { label: "Room Allocation", screen: "RoomAllocation", icon: "🏠" },
    { label: "Billing & Invoice", screen: "BillingInvoice", icon: "💳" },
    { label: "Services", screen: "Services", icon: "🛠️" },
    { label: "Complaint Box", screen: "ComplaintBox", icon: "💬" },
    { label: "Mess", screen: "Mess", icon: "🍽️" },
    { label: "Transport", screen: "TransportManagement", icon: "🚌" },
    { label: "Nearby Hostels", screen: "NearbyHostels", icon: "📍" },
    { label: "Leave Log", screen: "LeaveLog", icon: "🗓️" },
    {
      label: "Notifications & Alerts",
      screen: "NotificationsAlerts",
      icon: "🔔",
      badge: notificationsCount,
    },
  ];

  if (!user) return <Loader />
  return (
    <Layout noHeader>
      {/* Profile Card */}
      <TouchableOpacity
        style={styles.profileCard}
        activeOpacity={0.85}
        onPress={() => navigation.navigate("Profile")}
      >
        <View style={styles.avatarContainer}>
          <View style={styles.avatarCircle}>
            <Ionicons name="person-circle-outline" size={44} color="#fff" />
          </View>

          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.userName}>{user.fullName}</Text>
            <Text style={styles.userDetails}>
              SAP-{user.email.split("@")[0]} • Room {user.room?.roomNumber}
            </Text>
          </View>
        </View>

        <Ionicons name="chevron-forward" size={22} color="#fff" />
      </TouchableOpacity>


      {/* Quick Access */}
      <Typography
        variant="subheading"
        style={{ marginTop: 16, marginBottom: 8 }}
      >
        Quick Access
      </Typography>

      <View style={styles.grid}>
        {tiles.map((t) => (
          <TouchableOpacity
            key={t.label}
            style={styles.tile}
            onPress={() => t.screen && navigation.navigate(t.screen)}
            activeOpacity={0.9}
          >
            <View style={styles.tileHeader}>
              <Text style={{ fontSize: 24 }}>{t.icon}</Text>
              <Text style={styles.arrowSmall}>›</Text>
            </View>
            <Text style={styles.tileText}>{t.label}</Text>

            {t.badge ? (
              <View style={styles.badge}>
                <Text style={{ color: "#fff", fontSize: 12 }}>{t.badge}</Text>
              </View>
            ) : null}
          </TouchableOpacity>
        ))}
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2563EB",
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 3,
    marginBottom: 4,
  },
  avatarContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  userName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  userDetails: {
    color: "#D1D5DB",
    fontSize: 13,
    marginTop: 3,
  },
  arrow: {
    fontSize: 24,
    color: "#E7EEFF",
    marginLeft: 4,
  },
  arrowSmall: {
    fontSize: 18,
    color: "#9CA3AF",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
  },
  tile: {
    width: "47%",
    backgroundColor: "#FFF",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    position: "relative",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
  },
  tileHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tileText: {
    marginTop: 10,
    color: "#111827",
    fontWeight: "600",
  },
  badge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#EF4444",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
});
