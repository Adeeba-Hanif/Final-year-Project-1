// screens/BillingInvoice.js
import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import Layout from "../components/Layout";
import Typography from "../components/Typography";
import LongTextButton from "../components/LongTextButton";
import { useAuthContext } from "../context/auth";
import { students, rooms } from "../dummyData";

export default function BillingInvoice() {
  const { token } = useAuthContext(); // token = email
  const user = students[token];

  const student = useMemo(() => {
    if (!user) return { name: "—", sap: "—", room: "—" };
    const roomNum = user.currentRoomId
      ? rooms[user.currentRoomId]?.roomNumber || "—"
      : "—";
    return {
      name: user.name || "—",
      sap: user.sapId || "—",
      room: roomNum,
    };
  }, [user]);

  // --- Demo invoice data ---
  const invoice = useMemo(() => {
    const paidBreakdown = {
      roomRent: 250000,
      mess: 7500,
      laundryIroning: 1200,
    };

    const included = ["Wi-Fi", "Transport", "Maintenance"];
    const total =
      (paidBreakdown.roomRent || 0) +
      (paidBreakdown.mess || 0) +
      (paidBreakdown.laundryIroning || 0);

    return {
      month: "October 2025",
      student,
      included,
      paidBreakdown,
      total,
      status: "Unpaid",
    };
  }, [student]);

  const { month, included, paidBreakdown, total, status } = invoice;

  return (
    <Layout title="Billing & Invoice" showBack scroll>
      <View style={{ gap: 14 }}>
        {/* Header */}
        <Typography
          variant="sub heading"
          style={{ textAlign: "center", color: "#6B7280" }}
        >
          View and download your monthly charges
        </Typography>

        {/* Invoice Card */}
        <View style={styles.hero}>
          <View style={styles.icon}>
            <Text style={{ fontSize: 30 }}>💳</Text>
          </View>
          <Typography variant="sub heading" style={{ textAlign: "center" }}>
            RiphahStay Invoice
          </Typography>
          <Text style={{ color: "#6B7280", textAlign: "center" }}>{month}</Text>

          <View style={styles.info}>
            <Row k="User Name:" v={student.name} />
            <Row k="SAP ID:" v={student.sap} />
            <Row k="Room No:" v={student.room} />
          </View>
        </View>

        {/* Room Rent */}
        <Section title="Room Charges">
          <KeyValue
            pill
            k="Monthly Room Rent"
            v={`Rs. ${(paidBreakdown.roomRent || 0).toLocaleString()}`}
          />
        </Section>

        {/* Included Services */}
        <Section title="Included Services (Free)">
          {included.map((s) => (
            <KeyValue key={s} k={s} v="Included" included />
          ))}
        </Section>

        {/* Paid Services */}
        <Section title="Additional Paid Services">
          <KeyValue
            k="Laundry / Ironing (completed)"
            v={`Rs. ${(paidBreakdown.laundryIroning || 0).toLocaleString()}`}
          />
          <KeyValue
            k="Mess (meals booked)"
            v={`Rs. ${(paidBreakdown.mess || 0).toLocaleString()}`}
          />
        </Section>

        {/* Total */}
        <View style={styles.total}>
          <Text style={{ fontWeight: "700", fontSize: 16 }}>Total Payable</Text>
          <Text style={{ fontWeight: "800", fontSize: 18 }}>
            Rs. {total.toLocaleString()}
          </Text>
        </View>

        {/* Status */}
        <View style={styles.statusRow}>
          <Text style={{ color: "#6B7280" }}>Payment Status:</Text>
          <Text
            style={{
              fontWeight: "700",
              color: status === "Paid" ? "#16A34A" : "#DC2626",
            }}
          >
            {status}
          </Text>
        </View>

        <LongTextButton
          text="Download PDF"
          onPress={() => { }}
          style={{ marginTop: 8 }}
        />
      </View>
    </Layout>
  );
}

function Row({ k, v }) {
  return (
    <View style={styles.row}>
      <Text style={{ color: "#6B7280" }}>{k}</Text>
      <Text style={{ fontWeight: "600", color: "#111827" }}>{v}</Text>
    </View>
  );
}

function Section({ title, children }) {
  return (
    <View style={styles.section}>
      <Text style={{ fontWeight: "600", marginBottom: 6 }}>{title}</Text>
      {children}
    </View>
  );
}

function KeyValue({ k, v, included, pill }) {
  return (
    <View
      style={[
        styles.kv,
        pill && { backgroundColor: "#E0EAFF" },
        included && { backgroundColor: "#ECFDF5" },
      ]}
    >
      <Text style={{ color: "#111827" }}>{k}</Text>
      <Text
        style={{
          color: included ? "#16A34A" : "#111827",
          fontWeight: "600",
        }}
      >
        {v}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: "#FFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 12,
    alignItems: "center",
    gap: 8,
  },
  icon: {
    width: 64,
    height: 64,
    borderRadius: 14,
    backgroundColor: "#E0EAFF",
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    width: "100%",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    padding: 10,
    marginTop: 6,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  section: {
    backgroundColor: "#FFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 12,
    gap: 8,
  },
  kv: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#F3F4F6",
    padding: 12,
    borderRadius: 10,
  },
  total: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
    backgroundColor: "#FFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 6,
    alignItems: "center",
  },
});
