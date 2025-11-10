import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import Layout from "../components/Layout";
import { useAuthContext } from "../context";
import { notifications as allNotifications } from "../dummyData";

export default function Notifications() {
  const { token } = useAuthContext();
  const [notifs, setNotifs] = useState(
    allNotifications.filter((n) => n.studentId === token)
  );

  const iconForType = (type) => {
    switch (type) {
      case "alert":
        return <Feather name="alert-triangle" size={20} color="#DC2626" />;
      case "reminder":
        return <Feather name="calendar" size={20} color="#F59E0B" />;
      case "system":
        return <Feather name="settings" size={20} color="#2563EB" />;
      default:
        return <Feather name="info" size={20} color="#10B981" />;
    }
  };

  const handlePress = (id) => {
    setNotifs((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const formatDate = (iso) => {
    const date = new Date(iso);
    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Layout title="Notifications" showBack scroll>
      {notifs.length === 0 ? (
        <Text style={styles.emptyText}>No notifications found.</Text>
      ) : (
        notifs.map((notif) => (
          <TouchableOpacity
            key={notif.id}
            style={[
              styles.card,
              !notif.isRead && { backgroundColor: "#EEF2FF" },
            ]}
            onPress={() => handlePress(notif.id)}
          >
            <View style={styles.iconContainer}>{iconForType(notif.type)}</View>

            <View style={styles.textContainer}>
              <Text style={styles.title}>{notif.title}</Text>
              <Text style={styles.message}>{notif.message}</Text>

              <View style={styles.row}>
                <Text style={styles.type}>{notif.type.toUpperCase()}</Text>
                <Text style={styles.date}>{formatDate(notif.createdAt)}</Text>
              </View>
            </View>

            {!notif.isRead && <View style={styles.dot} />}
          </TouchableOpacity>
        ))
      )}
    </Layout>
  );
}

const styles = StyleSheet.create({
  emptyText: {
    textAlign: "center",
    marginTop: 30,
    color: "#6B7280",
    fontStyle: "italic",
  },
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    backgroundColor: "#FFF",
  },
  iconContainer: {
    marginRight: 10,
    marginTop: 3,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
  },
  message: {
    fontSize: 13,
    color: "#374151",
    marginVertical: 4,
  },
  type: {
    fontSize: 11,
    color: "#6B7280",
  },
  date: {
    fontSize: 11,
    color: "#9CA3AF",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#2563EB",
    marginLeft: 8,
    marginTop: 4,
  },
});
