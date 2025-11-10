// screens/LeaveLog.js
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import Layout from "../components/Layout";
import Typography from "../components/Typography";
import { leaveApplications as dummyLeaves, students } from "../dummyData";
import { useAuthContext } from "../context";


export default function LeaveLog() {
  const { token } = useAuthContext(); // current user's email
  const user = students[token];

  const [leaves, setLeaves] = useState(
    Object.values(dummyLeaves).filter((l) => l.studentId === token)
  );

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [reason, setReason] = useState("");

  const handleSubmit = () => {
    if (!fromDate || !toDate || !reason) {
      Alert.alert("Incomplete", "Please fill all fields before submitting.");
      return;
    }

    const newLeave = {
      id: `leave_${Date.now()}`,
      studentId: token,
      reason,
      fromDate,
      toDate,
      status: "pending",
    };

    setLeaves((prev) => [newLeave, ...prev]);
    setFromDate("");
    setToDate("");
    setReason("");

    Alert.alert("Leave Submitted", "Your leave request has been recorded.");
  };

  const statusColor = (status) => {
    switch (status) {
      case "approved":
        return "#10B981"; // green
      case "pending":
        return "#F59E0B"; // amber
      case "rejected":
        return "#EF4444"; // red
      default:
        return "#6B7280";
    }
  };

  return (
    <Layout title="Leave Management" showBack scroll>
      {/* --- User Info Card --- */}
      <View style={styles.headerCard}>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.subText}>{user.email}</Text>
        <Text style={styles.subText}>SAP ID: {user.sapId}</Text>
      </View>

      {/* --- Leave History --- */}
      <Typography variant="heading" style={{ marginTop: 18, marginBottom: 6 }}>
        Leave History
      </Typography>

      {leaves.length === 0 && (
        <Text style={{ color: "#6B7280", fontStyle: "italic" }}>
          No leave records found.
        </Text>
      )}

      {leaves.map((leave) => (
        <View key={leave.id} style={styles.card}>
          <View style={styles.rowBetween}>
            <Text style={styles.date}>
              {leave.fromDate} → {leave.toDate}
            </Text>
            <Text
              style={[styles.status, { color: statusColor(leave.status) }]}
            >
              {leave.status.toUpperCase()}
            </Text>
          </View>
          <Text style={styles.reason}>{leave.reason}</Text>
        </View>
      ))}

      {/* --- Apply Leave Form --- */}
      <Typography variant="heading" style={{ marginTop: 18, marginBottom: 6 }}>
        Apply for Leave
      </Typography>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="From (YYYY-MM-DD)"
          value={fromDate}
          onChangeText={setFromDate}
        />
        <TextInput
          style={styles.input}
          placeholder="To (YYYY-MM-DD)"
          value={toDate}
          onChangeText={setToDate}
        />
        <TextInput
          style={[styles.input, { height: 80 }]}
          placeholder="Reason"
          multiline
          value={reason}
          onChangeText={setReason}
        />

        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Submit Leave</Text>
        </TouchableOpacity>
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  headerCard: {
    backgroundColor: "#EEF2FF",
    borderRadius: 12,
    padding: 14,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 12,
    marginBottom: 10,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  date: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  status: {
    fontSize: 13,
    fontWeight: "700",
  },
  reason: {
    fontSize: 13,
    color: "#374151",
    marginTop: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E3A8A",
  },
  subText: {
    color: "#4B5563",
    fontSize: 13,
    marginTop: 2,
  },
  form: {
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#2563EB",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
});
