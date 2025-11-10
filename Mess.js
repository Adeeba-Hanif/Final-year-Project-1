import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, Switch } from "react-native";
import Layout from "../components/Layout";
import LongTextButton from "../components/LongTextButton";
import { messMenu, messSubscriptions } from "../dummyData";
import { useAuthContext } from "../context";

const mealPrices = {
  breakfast: 100,
  lunch: 180,
  dinner: 200,
};

export default function MessScreen() {
  const { token } = useAuthContext(); // user email
  const [userMeals, setUserMeals] = useState({});

  useEffect(() => {
    // fetch existing preferences or initialize empty ones
    const existing = messSubscriptions[token];
    if (existing) {
      setUserMeals(existing);
    } else {
      const init = {};
      Object.keys(messMenu).forEach((day) => {
        init[day] = { breakfast: false, lunch: false, dinner: false };
      });
      setUserMeals(init);
    }
  }, [token]);

  // guard until data ready
  if (!Object.keys(userMeals).length) return null;

  const toggleMeal = (day, mealType) => {
    setUserMeals((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [mealType]: !prev[day][mealType],
      },
    }));
  };

  const calcTotal = () =>
    Object.entries(userMeals).reduce((sum, [day, meals]) => {
      Object.entries(meals).forEach(([mealType, selected]) => {
        if (selected) sum += mealPrices[mealType];
      });
      return sum;
    }, 0);

  const total = calcTotal();

  const handleSave = () => {
    console.log(`✅ Saved meal preferences for ${token}:`, userMeals);
    // later → push to backend or AsyncStorage
  };

  return (
    <Layout title="Mess Menu" showBack={true} scroll>
      {Object.entries(messMenu).map(([day, meals]) => (
        <View key={day} style={styles.daySection}>
          <Text style={styles.dayTitle}>
            {day.charAt(0).toUpperCase() + day.slice(1)}
          </Text>

          {Object.entries(meals).map(([mealType, items]) => {
            const selected = userMeals?.[day]?.[mealType] ?? false;
            return (
              <View key={mealType} style={styles.mealRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.mealName}>
                    {mealType.charAt(0).toUpperCase() + mealType.slice(1)} —{" "}
                    <Text style={{ color: "#16A34A" }}>
                      Rs. {mealPrices[mealType]}
                    </Text>
                  </Text>
                  <Text style={styles.menuItems}>{items.join(", ")}</Text>
                </View>
                <Switch
                  value={selected}
                  onValueChange={() => toggleMeal(day, mealType)}
                  thumbColor={selected ? "#16A34A" : "#E5E7EB"}
                  trackColor={{ true: "#BBF7D0", false: "#E5E7EB" }}
                />
              </View>
            );
          })}
        </View>
      ))}

      {/* ---- Total Summary ---- */}
      <View style={styles.summaryBox}>
        <Text style={styles.summaryText}>Weekly Total:</Text>
        <Text style={styles.summaryValue}>Rs. {total}</Text>
      </View>

      <LongTextButton text="Save Selections" onPress={handleSave} />
    </Layout>
  );
}

/* ---- Styles ---- */
const styles = StyleSheet.create({
  daySection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 14,
    marginBottom: 14,
  },
  dayTitle: {
    fontWeight: "700",
    fontSize: 16,
    marginBottom: 8,
    color: "#111827",
    textTransform: "capitalize",
  },
  mealRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: "#E5E7EB",
  },
  mealName: {
    fontSize: 15,
    color: "#111827",
  },
  menuItems: {
    color: "#6B7280",
    fontSize: 13,
    marginTop: 2,
  },
  summaryBox: {
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  summaryText: { fontSize: 15, color: "#111827" },
  summaryValue: { fontSize: 16, fontWeight: "700", color: "#16A34A" },
});
