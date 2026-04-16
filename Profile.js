import React, { useState } from "react";
import { StyleSheet, Text, View, Alert, TouchableOpacity } from "react-native";
import axios from "axios";
import Input from "../components/Input";
import LongTextButton from "../components/LongTextButton";
import Typography from "../components/Typography";
import Layout from "../components/Layout";
import { useProfileStore } from "../store/profile";
import { useAuthContext } from "../context";

const API_BASE = process.env.EXPO_PUBLIC_SERVER_URI;

export default function Profile() {
  const { token } = useAuthContext();
  const profile = useProfileStore((s) => s.profile);
  const setProfile = useProfileStore((s) => s.setProfile);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  // editable fields
  const [fullName, setFullName] = useState(profile?.fullName || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [paymentFrequency, setPaymentFrequency] = useState(
    profile?.paymentFrequency || "monthly"
  );

  // password
  const [oldPwd, setOldPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");

  if (!profile) {
    return (
      <View style={{ padding: 20 }}>
        <Typography variant="heading">User not found</Typography>
      </View>
    );
  }

  const room = profile.room;
  const wifi = profile.wifiService;

  const handleUpdateProfile = async () => {
    try {
      const res = await axios.put(
        `${API_BASE}/user/student/me`,
        {
          fullName,
          phone,
          paymentFrequency, // send it to backend
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setProfile(res.data);
      Alert.alert("Updated", "Profile updated successfully");
    } catch (err) {
      console.log("update profile err", err?.response?.data || err.message);
      Alert.alert(
        "Error",
        err?.response?.data?.message || "Failed to update profile"
      );
    }
  };

  const handleChangePassword = async () => {
    try {
      await axios.post(
        `${API_BASE}/auth/change-password`,
        {
          oldPassword: oldPwd,
          newPassword: newPwd,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      Alert.alert("Success", "Password changed");
      setOldPwd("");
      setNewPwd("");
      setShowPasswordForm(false);
    } catch (err) {
      Alert.alert(
        "Error",
        err?.response?.data?.message || "Failed to change password"
      );
    }
  };

  return (
    <Layout title="Profile" showBack scroll>
      <Input
        label="Full Name"
        type="fullname"
        value={fullName}
        onChangeText={setFullName}
        placeholder="Your name"
      />

      <Input
        label="Email"
        value={profile.email}
        editable={false}
        type="email"
        placeholder="Email"
      />

      <Input
        label="Phone"
        value={phone}
        onChangeText={setPhone}
        placeholder="+92..."
        type="number"
      />

      {/* PAYMENT FREQUENCY */}
      <Text style={styles.sectionHeading}>Payment frequency</Text>
      <View style={styles.paymentRow}>
        <TouchableOpacity
          style={[
            styles.paymentOption,
            paymentFrequency === "weekly" && styles.paymentOptionActive,
          ]}
          onPress={() => setPaymentFrequency("weekly")}
        >
          <Text
            style={[
              styles.paymentOptionText,
              paymentFrequency === "weekly" && styles.paymentOptionTextActive,
            ]}
          >
            Weekly
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.paymentOption,
            paymentFrequency === "monthly" && styles.paymentOptionActive,
          ]}
          onPress={() => setPaymentFrequency("monthly")}
        >
          <Text
            style={[
              styles.paymentOptionText,
              paymentFrequency === "monthly" && styles.paymentOptionTextActive,
            ]}
          >
            Monthly
          </Text>
        </TouchableOpacity>
      </View>

      <LongTextButton
        text="Update Profile"
        onPress={handleUpdateProfile}
        style={{ marginTop: 10 }}
      />

      {/* PASSWORD TOGGLE */}
      <Text
        onPress={() => setShowPasswordForm((p) => !p)}
        style={styles.passwordToggle}
      >
        {showPasswordForm ? "Hide password section" : "Change password"}
      </Text>

      {showPasswordForm ? (
        <View style={styles.formCard}>
          <Input
            label="Old Password"
            type="password"
            value={oldPwd}
            onChangeText={setOldPwd}
          />
          <Input
            label="New Password"
            type="password"
            value={newPwd}
            onChangeText={setNewPwd}
          />
          <LongTextButton
            text="Update Password"
            onPress={handleChangePassword}
            style={{ marginTop: 8 }}
          />
        </View>
      ) : null}

      {/* ROOM + WIFI */}
      <Typography variant="sub heading" style={styles.sectionHeading}>
        Room & Wi-Fi
      </Typography>
      <View style={styles.infoCard}>
        <Text style={styles.infoLabel}>Room</Text>
        {room ? (
          <>
            <Text style={styles.infoText}>Level: {room.level}</Text>
            <Text style={styles.infoText}>Room No: {room.roomNumber}</Text>
            <Text style={styles.infoText}>
              Capacity: {room.capacity} | Occupants: {room.occupants?.length || 0}
            </Text>
            <Text style={styles.infoText}>Status: {room.status}</Text>
          </>
        ) : (
          <Text style={styles.infoText}>No room assigned</Text>
        )}

        <Text style={[styles.infoLabel, { marginTop: 10 }]}>Wi-Fi</Text>
        {wifi ? (
          <>
            <Text style={styles.infoText}>Name: {wifi.name}</Text>
            <Text style={styles.infoText}>Type: {wifi.type}</Text>
            {!!wifi.description && (
              <Text style={styles.infoText}>{wifi.description}</Text>
            )}
          </>
        ) : (
          <Text style={styles.infoText}>No Wi-Fi service linked</Text>
        )}
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  passwordToggle: {
    marginTop: 10,
    color: "#3155F6",
    fontWeight: "500",
  },
  sectionHeading: {
    marginTop: 16,
    marginBottom: 8,
    fontWeight: "600",
  },
  paymentRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 4,
  },
  paymentOption: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  paymentOptionActive: {
    borderColor: "#3155F6",
    backgroundColor: "#EBF1FF",
  },
  paymentOptionText: {
    color: "#374151",
    fontWeight: "500",
  },
  paymentOptionTextActive: {
    color: "#1F37C9",
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 12,
  },
  infoLabel: {
    fontWeight: "600",
    marginBottom: 4,
    color: "#111827",
  },
  infoText: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 3,
  },
  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 12,
    marginTop: 8,
  },
});
