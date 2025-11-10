import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Input from "../components/Input";
import LongTextButton from "../components/LongTextButton";
import Typography from "../components/Typography";
import Layout from "../components/Layout";

export default function ComplaintBox() {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [tag, setTag] = useState("Internet");

  const [complaints, setComplaints] = useState([
    {
      id: "cmp_1",
      tag: "Internet",
      title: "WiFi keeps disconnecting",
      description: "Internet drops multiple times during study hours.",
      status: "in process",
      date: "2025-10-29",
      response: "Technician scheduled to check router tomorrow.",
    },
    {
      id: "cmp_2",
      tag: "Mess",
      title: "Undercooked food",
      description: "Lunch curry was undercooked and cold yesterday.",
      status: "resolved",
      date: "2025-10-25",
      response: "Chef was informed; issue resolved and menu adjusted.",
    },
    {
      id: "cmp_3",
      tag: "Laundry",
      title: "Clothes not returned",
      description: "Laundry from Monday still missing.",
      status: "pending",
      date: "2025-10-31",
    },
  ]);

  const handleSubmit = () => {
    if (!title.trim() || !desc.trim()) return;
    const newComplaint = {
      id: `cmp_${Date.now()}`,
      tag: tag.trim(),
      title: title.trim(),
      description: desc.trim(),
      status: "pending",
      date: new Date().toISOString().split("T")[0],
    };
    setComplaints((prev) => [newComplaint, ...prev]);
    setTitle("");
    setDesc("");
  };

  return (
    <Layout
      showBack={true}
      title="Complaints"
      scroll
    >
      <Typography
        variant="sub heading"
        style={{ textAlign: "center", color: "#6B7280" }}
      >
        Report any issues or concerns
      </Typography>

      {/* ---- Complaint Form ---- */}
      <View style={styles.card}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <View style={styles.icon}>
            <Text style={{ fontSize: 22 }}>💬</Text>
          </View>
          <View>
            <Typography variant="sub heading">Submit New Complaint</Typography>
            <Text style={{ color: "#6B7280" }}>
              {`We'll address your concern promptly`}
            </Text>
          </View>
        </View>

        <Input
          label="Category"
          value={tag}
          onChangeText={setTag}
          placeholder="Select category"
        />
        <Input
          label="Title"
          value={title}
          onChangeText={setTitle}
          placeholder="Short title"
        />
        <Input
          label="Write Your Complaint"
          value={desc}
          onChangeText={setDesc}
          placeholder="Please describe your issue..."
          multiline
          numberOfLines={4}
          style={{ height: 120 }}
        />

        <LongTextButton
          text="Submit Complaint"
          style={{ backgroundColor: "#DC2626" }}
          onPress={handleSubmit}
        />
      </View>

      {/* ---- Previous Complaints ---- */}
      <View style={styles.card}>
        <Typography variant="sub heading">Your Previous Complaints</Typography>
        {complaints.map((c) => (
          <View key={c.id} style={styles.prev}>
            <View style={{ flexDirection: "row", gap: 6, marginBottom: 4 }}>
              <Chip text={c.tag} />
              <Chip
                text={
                  c.status === "resolved"
                    ? "Resolved"
                    : c.status === "in process"
                      ? "In Progress"
                      : "Pending"
                }
                type={c.status}
              />
            </View>

            <Text style={{ fontWeight: "600", marginBottom: 2 }}>
              {c.title}
            </Text>
            <Text style={{ color: "#6B7280", marginBottom: 4 }}>{c.date}</Text>
            <Text style={{ color: "#374151" }}>{c.description}</Text>

            {c.response && (
              <View style={styles.responseBox}>
                <Text style={{ fontWeight: "600", color: "#16A34A" }}>
                  Response:
                </Text>
                <Text style={{ color: "#065F46" }}>{c.response}</Text>
              </View>
            )}
          </View>
        ))}
      </View>
    </Layout>
  );
}

/* ---- Chip Component ---- */
function Chip({ text, type }) {
  const bg =
    type === "resolved"
      ? "#D1FAE5"
      : type === "in process"
        ? "#FEF3C7"
        : "#E5E7EB";
  const color =
    type === "resolved"
      ? "#065F46"
      : type === "in process"
        ? "#92400E"
        : "#374151";
  return (
    <View
      style={{
        backgroundColor: bg,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 999,
      }}
    >
      <Text style={{ color }}>{text}</Text>
    </View>
  );
}

/* ---- Styles ---- */
const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 12,
    gap: 8,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center",
  },
  prev: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 10,
    marginTop: 6,
  },
  responseBox: {
    marginTop: 6,
    backgroundColor: "#ECFDF5",
    borderRadius: 8,
    padding: 8,
  },
});
