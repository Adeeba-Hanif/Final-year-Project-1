/**
 * Mess Screen  three tabs
 *   1. "Meal Plan"  – toggle weekly meal preferences + Save + Log Today
 *   2. "History"    – list of unbilled mess records for current month
 *   3. "Challan"    – generate a mess challan + download PDF
 */
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import * as Print   from "expo-print";
import * as Sharing from "expo-sharing";
import axios from "axios";
import Layout from "../components/Layout";
import { useAuthContext } from "../context";
import { useProfileStore } from "../store/profile";

const BASE_URL = process.env.EXPO_PUBLIC_SERVER_URI;

const DAYS  = ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"];
const MEALS = ["breakfast","lunch","dinner"];
const MEAL_PRICES = { breakfast: 100, lunch: 180, dinner: 200 };

// ─── helpers ────────────────────────────────────────────────────────────────
const dayLabel  = (d) => d.charAt(0).toUpperCase() + d.slice(1);
const mealLabel = (m) => m.charAt(0).toUpperCase() + m.slice(1);
const fmt = (d) => new Date(d).toLocaleDateString("en-PK", { day:"numeric", month:"short" });
const authH = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

// ─── Tabs ────────────────────────────────────────────────────────────────────
const TABS = ["Meal Plan", "History", "Challan"];

export default function MessScreen() {
    const { token } = useAuthContext();
    const profile   = useProfileStore((s) => s.profile);

    const [tab, setTab] = useState("Meal Plan");

    // ── Meal Plan state ──────────────────────────────────────────────────────
    const [choices, setChoices] = useState({});
    const [savingPlan, setSavingPlan] = useState(false);
    const [loggingToday, setLoggingToday] = useState(false);

    // ── History state ────────────────────────────────────────────────────────
    const [records, setRecords]     = useState([]);
    const [pendingTotal, setPTotal] = useState(0);
    const [loadingRec, setLoadRec]  = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [month, setMonth]         = useState(() => {
        const n = new Date();
        return n.toLocaleString("default", { month: "long" }) + " " + n.getFullYear();
    });

    // ── Challan state ────────────────────────────────────────────────────────
    const [generating, setGenerating] = useState(false);
    const [lastChallan, setLastChallan] = useState(null);
    const [pdfLoading, setPdfLoading]  = useState(false);

    // ── Init ─────────────────────────────────────────────────────────────────
    useEffect(() => {
        if (profile?.messChoices) {
            setChoices(profile.messChoices);
        } else {
            const init = {};
            DAYS.forEach((d) => { init[d] = { breakfast: false, lunch: false, dinner: false }; });
            setChoices(init);
        }
    }, [profile]);

    const fetchRecords = useCallback(async () => {
        if (!token) return;
        setLoadRec(true);
        try {
            const res = await axios.get(
                `${BASE_URL}/mess/my-records?month=${encodeURIComponent(month)}`,
                authH(token)
            );
            setRecords(res.data.unbilled || []);
            setPTotal(res.data.pendingTotal || 0);
        } catch (err) {
            console.error("fetchRecords error", err?.response?.data || err.message);
        } finally {
            setLoadRec(false);
            setRefreshing(false);
        }
    }, [token, month]);

    useEffect(() => {
        if (tab === "History" || tab === "Challan") fetchRecords();
    }, [tab, fetchRecords]);

    // ── Toggle meal choice ───────────────────────────────────────────────────
    const toggle = (day, meal) => {
        setChoices((prev) => ({
            ...prev,
            [day]: { ...prev[day], [meal]: !prev[day]?.[meal] },
        }));
    };

    // Weekly cost estimate
    const weeklyCost = Object.entries(choices).reduce((sum, [, meals]) => {
        MEALS.forEach((m) => { if (meals?.[m]) sum += MEAL_PRICES[m]; });
        return sum;
    }, 0);

    // ── Save meal plan ───────────────────────────────────────────────────────
    const savePlan = async () => {
        setSavingPlan(true);
        try {
            await axios.put(`${BASE_URL}/user/student/me`, { messChoices: choices }, authH(token));
            Alert.alert("Saved", "Your meal preferences have been updated.");
        } catch (err) {
            Alert.alert("Error", err?.response?.data?.message || "Could not save plan");
        } finally {
            setSavingPlan(false);
        }
    };

    // ── Log today's meals ────────────────────────────────────────────────────
    const logToday = async () => {
        setLoggingToday(true);
        try {
            const res = await axios.post(`${BASE_URL}/mess/log-my-choices`, {}, authH(token));
            const { logged, skipped } = res.data;
            Alert.alert(
                "Today Logged",
                logged.length
                    ? `Logged: ${logged.join(", ")}${skipped.length ? `\nSkipped: ${skipped.join(", ")}` : ""}`
                    : `Nothing to log (${skipped.join(", ")})`
            );
            if (logged.length) fetchRecords();
        } catch (err) {
            Alert.alert("Error", err?.response?.data?.message || "Could not log today");
        } finally {
            setLoggingToday(false);
        }
    };

    // ── Generate mess challan ────────────────────────────────────────────────
    const generateChallan = async () => {
        if (!records.length) {
            Alert.alert("Nothing to Bill", "No unbilled meal records found for this month.");
            return;
        }
        Alert.alert(
            "Generate Mess Challan",
            `This will bill ${records.length} meal record(s) totalling Rs. ${pendingTotal.toLocaleString()} for ${month}. Continue?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Generate",
                    onPress: async () => {
                        setGenerating(true);
                        try {
                            const res = await axios.post(
                                `${BASE_URL}/mess/generate-challan`,
                                { month },
                                authH(token)
                            );
                            setLastChallan(res.data.challan);
                            Alert.alert("Challan Generated", `Challan ID: ${res.data.challan.challanId}`);
                            fetchRecords();
                        } catch (err) {
                            const msg = err?.response?.data?.message || "Could not generate challan";
                            Alert.alert("Error", msg);
                        } finally {
                            setGenerating(false);
                        }
                    },
                },
            ]
        );
    };

    // ── Download mess challan PDF ─────────────────────────────────────────────
    const downloadPdf = async (challan) => {
        setPdfLoading(true);
        try {
            const html = buildMessChallanHtml(challan, profile, records);
            const { uri } = await Print.printToFileAsync({ html, base64: false });
            const canShare = await Sharing.isAvailableAsync();
            if (canShare) {
                await Sharing.shareAsync(uri, {
                    mimeType: "application/pdf",
                    dialogTitle: `Mess Challan ${challan.challanId}`,
                });
            } else {
                Alert.alert("PDF Saved", uri);
            }
        } catch (err) {
            Alert.alert("Error", "Failed to generate PDF");
        } finally {
            setPdfLoading(false);
        }
    };

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <Layout title="Mess & Food" showBack>
            {/* Tab bar */}
            <View style={styles.tabBar}>
                {TABS.map((t) => (
                    <TouchableOpacity
                        key={t}
                        style={[styles.tab, tab === t && styles.tabActive]}
                        onPress={() => setTab(t)}
                        activeOpacity={0.7}
                    >
                        <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
                            {t}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* ── TAB 1: MEAL PLAN ──────────────────────────────────────── */}
            {tab === "Meal Plan" && (
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingBottom: 24 }}>
                    <Text style={styles.hint}>
                        Toggle meals you eat each day. Tap "Log Today" to record today's consumption.
                    </Text>

                    {DAYS.map((day) => (
                        <View key={day} style={styles.dayCard}>
                            <Text style={styles.dayTitle}>{dayLabel(day)}</Text>
                            {MEALS.map((meal) => {
                                const on = choices[day]?.[meal] ?? false;
                                return (
                                    <View key={meal} style={styles.mealRow}>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.mealName}>
                                                {mealLabel(meal)}
                                                <Text style={styles.mealPrice}> · Rs. {MEAL_PRICES[meal]}</Text>
                                            </Text>
                                        </View>
                                        <Switch
                                            value={on}
                                            onValueChange={() => toggle(day, meal)}
                                            thumbColor={on ? "#4F46E5" : "#E5E7EB"}
                                            trackColor={{ true: "#C7D2FE", false: "#E5E7EB" }}
                                        />
                                    </View>
                                );
                            })}
                        </View>
                    ))}

                    {/* Weekly estimate */}
                    <View style={styles.estimateRow}>
                        <Text style={styles.estimateLabel}>Weekly Estimate</Text>
                        <Text style={styles.estimateValue}>Rs. {weeklyCost.toLocaleString()}</Text>
                    </View>

                    {/* Action buttons */}
                    <TouchableOpacity
                        style={[styles.primaryBtn, savingPlan && { opacity: 0.6 }]}
                        onPress={savePlan}
                        disabled={savingPlan}
                    >
                        {savingPlan
                            ? <ActivityIndicator color="#fff" />
                            : <Text style={styles.primaryBtnText}>Save Meal Plan</Text>}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.secondaryBtn, loggingToday && { opacity: 0.6 }]}
                        onPress={logToday}
                        disabled={loggingToday}
                    >
                        {loggingToday
                            ? <ActivityIndicator color="#4F46E5" />
                            : <Text style={styles.secondaryBtnText}>Log Today's Meals</Text>}
                    </TouchableOpacity>
                </ScrollView>
            )}

            {/* ── TAB 2: HISTORY ──────────────────────────────────────── */}
            {tab === "History" && (
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchRecords(); }} />}
                    contentContainerStyle={{ gap: 10, paddingBottom: 24 }}
                >
                    <Text style={styles.hint}>Unbilled meal records for {month}</Text>

                    {loadingRec ? (
                        <View style={styles.center}>
                            <ActivityIndicator color="#4F46E5" />
                        </View>
                    ) : records.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyIcon}>🍽</Text>
                            <Text style={styles.emptyTitle}>No unbilled records</Text>
                            <Text style={styles.emptyText}>Log meals from the Meal Plan tab.</Text>
                        </View>
                    ) : (
                        records.map((r) => (
                            <View key={r._id} style={styles.recordRow}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.recordName}>{r.itemName}</Text>
                                    <Text style={styles.recordDate}>{fmt(r.date)}</Text>
                                </View>
                                <Text style={styles.recordAmt}>Rs. {(r.price * r.quantity).toLocaleString()}</Text>
                            </View>
                        ))
                    )}

                    {records.length > 0 && (
                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>Total Pending</Text>
                            <Text style={styles.totalValue}>Rs. {pendingTotal.toLocaleString()}</Text>
                        </View>
                    )}
                </ScrollView>
            )}

            {/* ── TAB 3: CHALLAN ──────────────────────────────────────── */}
            {tab === "Challan" && (
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 16, paddingBottom: 24 }}>
                    <Text style={styles.hint}>
                        Generate a mess challan for {month}. All unbilled records will be billed.
                    </Text>

                    {/* Summary card */}
                    <View style={styles.summaryCard}>
                        <Text style={styles.summaryTitle}>Current Month Summary</Text>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Month</Text>
                            <Text style={styles.summaryValue2}>{month}</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Unbilled Records</Text>
                            <Text style={styles.summaryValue2}>{loadingRec ? "…" : records.length}</Text>
                        </View>
                        <View style={[styles.summaryRow, { borderTopWidth: 1, borderTopColor: "#F3F4F6", paddingTop: 8, marginTop: 4 }]}>
                            <Text style={[styles.summaryLabel, { fontWeight: "700" }]}>Pending Amount</Text>
                            <Text style={[styles.summaryValue2, { color: "#4F46E5", fontWeight: "800", fontSize: 16 }]}>
                                Rs. {pendingTotal.toLocaleString()}
                            </Text>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.primaryBtn, (generating || !records.length) && { opacity: 0.5 }]}
                        onPress={generateChallan}
                        disabled={generating || !records.length}
                    >
                        {generating
                            ? <ActivityIndicator color="#fff" />
                            : <Text style={styles.primaryBtnText}>Generate Mess Challan</Text>}
                    </TouchableOpacity>

                    {lastChallan && (
                        <View style={styles.challanCard}>
                            <View style={styles.challanHeader}>
                                <View>
                                    <Text style={styles.challanTitle}>Mess Challan</Text>
                                    <Text style={styles.challanId}>{lastChallan.challanId}</Text>
                                </View>
                                <View style={[styles.badge, { backgroundColor: "#FEF9C3" }]}>
                                    <Text style={[styles.badgeText, { color: "#854D0E" }]}>Unpaid</Text>
                                </View>
                            </View>
                            <View style={styles.challanRow}>
                                <Text style={styles.challanLabel}>Month</Text>
                                <Text style={styles.challanValue}>{lastChallan.month}</Text>
                            </View>
                            <View style={styles.challanRow}>
                                <Text style={styles.challanLabel}>Total</Text>
                                <Text style={[styles.challanValue, { color: "#4F46E5", fontWeight: "700" }]}>
                                    Rs. {lastChallan.totalAmount?.toLocaleString()}
                                </Text>
                            </View>

                            <TouchableOpacity
                                style={[styles.downloadBtn, pdfLoading && { opacity: 0.6 }]}
                                onPress={() => downloadPdf(lastChallan)}
                                disabled={pdfLoading}
                            >
                                {pdfLoading
                                    ? <ActivityIndicator color="#fff" size="small" />
                                    : <Text style={styles.downloadBtnText}>↓  Download PDF</Text>}
                            </TouchableOpacity>
                        </View>
                    )}
                </ScrollView>
            )}
        </Layout>
    );
}

// ── HTML template for mess challan PDF ───────────────────────────────────────
function buildMessChallanHtml(challan, profile, records) {
    const rows = (challan.items || [])
        .map(
            (i) => `<tr>
          <td style="padding:8px 6px;border-bottom:1px solid #F3F4F6;">${i.description}</td>
          <td style="padding:8px 6px;border-bottom:1px solid #F3F4F6;text-align:right;">Rs. ${i.amount.toLocaleString()}</td>
        </tr>`
        ).join("");

    return `<!DOCTYPE html><html><head><meta charset="UTF-8"/>
<style>
body{font-family:Arial,sans-serif;margin:0;padding:28px;color:#111827;}
.header{text-align:center;margin-bottom:20px;}
.bank{font-size:22px;font-weight:700;color:#1B4A8A;}
.sub{font-size:13px;color:#6B7280;margin:4px 0 0;}
hr{border:none;border-top:2px solid #E5E7EB;margin:18px 0;}
.label{font-size:11px;color:#9CA3AF;}
.value{font-size:13px;font-weight:600;}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:8px 24px;margin-bottom:14px;}
table{width:100%;border-collapse:collapse;}
th{background:#F9FAFB;padding:8px 6px;text-align:left;font-size:11px;color:#6B7280;font-weight:600;}
th:last-child{text-align:right;}
td{font-size:12px;}
.total-row td{font-weight:700;font-size:14px;padding:10px 6px;border-top:2px solid #E5E7EB;}
.total-row td:last-child{text-align:right;color:#4F46E5;}
.footer{margin-top:28px;text-align:center;font-size:10px;color:#9CA3AF;}
.badge{display:inline-block;background:#FEF9C3;color:#854D0E;padding:3px 10px;border-radius:999px;font-size:11px;font-weight:700;}
</style></head><body>
<div class="header">
  <p class="bank">Bank of Meezan</p>
  <p class="sub">Mess / Food Challan</p>
  <p class="sub">RiphahStay Hostel Management System</p>
</div>
<hr/>
<div class="grid">
  <div><p class="label">Challan ID</p><p class="value">${challan.challanId}</p></div>
  <div><p class="label">Month</p><p class="value">${challan.month}</p></div>
  <div><p class="label">Issue Date</p><p class="value">${new Date(challan.createdAt).toLocaleDateString("en-PK")}</p></div>
  <div><p class="label">Due Date</p><p class="value">${new Date(challan.dueDate).toLocaleDateString("en-PK")}</p></div>
  <div><p class="label">Status</p><span class="badge">UNPAID</span></div>
</div>
<hr/>
<div class="grid">
  <div><p class="label">Student Name</p><p class="value">${profile?.fullName || ""}</p></div>
  <div><p class="label">Email</p><p class="value">${profile?.email || ""}</p></div>
</div>
<hr/>
<table>
  <thead><tr><th>Meal</th><th>Amount (PKR)</th></tr></thead>
  <tbody>
    ${rows}
    <tr class="total-row"><td>Total Payable</td><td>Rs. ${challan.totalAmount?.toLocaleString()}</td></tr>
  </tbody>
</table>
<div class="footer">
  <p>This is a computer-generated challan. Please keep it for your records.</p>
  <p>Bank of Meezan · RiphahStay Hostel · Riphah International University</p>
</div>
</body></html>`;
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    tabBar: {
        flexDirection: "row",
        backgroundColor: "#F3F4F6",
        borderRadius: 10,
        padding: 3,
        marginBottom: 14,
    },
    tab: {
        flex: 1,
        paddingVertical: 8,
        borderRadius: 8,
        alignItems: "center",
    },
    tabActive: { backgroundColor: "#FFF", shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
    tabText: { fontSize: 13, color: "#9CA3AF", fontWeight: "600" },
    tabTextActive: { color: "#111827" },
    hint: { fontSize: 12, color: "#9CA3AF", textAlign: "center" },
    dayCard: {
        backgroundColor: "#FFF",
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        padding: 14,
    },
    dayTitle: { fontWeight: "700", fontSize: 15, color: "#111827", marginBottom: 8 },
    mealRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 7,
        borderBottomWidth: 0.5,
        borderBottomColor: "#F3F4F6",
    },
    mealName: { fontSize: 14, color: "#374151" },
    mealPrice: { color: "#4F46E5", fontWeight: "600" },
    estimateRow: {
        backgroundColor: "#F5F3FF",
        borderRadius: 12,
        padding: 14,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    estimateLabel: { fontSize: 14, color: "#374151", fontWeight: "600" },
    estimateValue: { fontSize: 18, fontWeight: "800", color: "#4F46E5" },
    primaryBtn: {
        backgroundColor: "#4F46E5",
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: "center",
    },
    primaryBtnText: { color: "#FFF", fontWeight: "700", fontSize: 15 },
    secondaryBtn: {
        borderWidth: 1.5,
        borderColor: "#C7D2FE",
        borderRadius: 12,
        paddingVertical: 13,
        alignItems: "center",
        backgroundColor: "#EEF2FF",
    },
    secondaryBtnText: { color: "#4F46E5", fontWeight: "700", fontSize: 14 },
    center: { paddingVertical: 40, alignItems: "center" },
    emptyState: { alignItems: "center", paddingVertical: 40, gap: 8 },
    emptyIcon: { fontSize: 40 },
    emptyTitle: { fontSize: 15, fontWeight: "700", color: "#111827" },
    emptyText: { fontSize: 13, color: "#9CA3AF", textAlign: "center" },
    recordRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#FFF",
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        paddingHorizontal: 14,
        paddingVertical: 10,
    },
    recordName: { fontSize: 13, color: "#374151", fontWeight: "600" },
    recordDate: { fontSize: 11, color: "#9CA3AF", marginTop: 2 },
    recordAmt: { fontSize: 14, fontWeight: "700", color: "#111827" },
    totalRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#F5F3FF",
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
    },
    totalLabel: { fontSize: 14, fontWeight: "700", color: "#374151" },
    totalValue: { fontSize: 16, fontWeight: "800", color: "#4F46E5" },
    summaryCard: {
        backgroundColor: "#FFF",
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        padding: 16,
        gap: 8,
    },
    summaryTitle: { fontSize: 13, fontWeight: "700", color: "#374151", marginBottom: 4 },
    summaryRow: { flexDirection: "row", justifyContent: "space-between" },
    summaryLabel: { fontSize: 13, color: "#9CA3AF" },
    summaryValue2: { fontSize: 13, fontWeight: "600", color: "#111827" },
    challanCard: {
        backgroundColor: "#FFF",
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        padding: 16,
        gap: 10,
    },
    challanHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
    challanTitle: { fontSize: 15, fontWeight: "700", color: "#111827" },
    challanId: { fontSize: 11, color: "#9CA3AF", marginTop: 2 },
    badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
    badgeText: { fontSize: 11, fontWeight: "700" },
    challanRow: { flexDirection: "row", justifyContent: "space-between" },
    challanLabel: { fontSize: 12, color: "#9CA3AF" },
    challanValue: { fontSize: 13, color: "#374151" },
    downloadBtn: {
        backgroundColor: "#4F46E5",
        borderRadius: 10,
        paddingVertical: 12,
        alignItems: "center",
        marginTop: 4,
    },
    downloadBtnText: { color: "#FFF", fontWeight: "700", fontSize: 14 },
});
