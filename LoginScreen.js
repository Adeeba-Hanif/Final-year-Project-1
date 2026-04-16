import { useState } from "react";
import {
    ActivityIndicator, KeyboardAvoidingView, Platform,
    ScrollView, StyleSheet, Text, TouchableOpacity, View, StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Input from "../components/Input";
import { useAuthContext } from "../context";

const BRAND = "#4F46E5";

export default function LoginScreen({ navigation }) {
    const { login } = useAuthContext();

    const [email,        setEmail]       = useState("");
    const [password,     setPassword]    = useState("");
    const [fieldErrors,  setFieldErrors] = useState({});
    const [globalError,  setGlobalError] = useState("");
    const [submitting,   setSubmitting]  = useState(false);

    const validate = () => {
        const errors = {};
        const e = email.trim().toLowerCase();
        if (!e)                       errors.email = "Email is required";
        else if (!e.includes("@"))    errors.email = "Enter a valid email address";
        if (!password)                errors.password = "Password is required";
        return errors;
    };

    const handleLogin = async () => {
        setGlobalError("");
        const errors = validate();
        if (Object.keys(errors).length > 0) { setFieldErrors(errors); return; }
        setFieldErrors({});
        setSubmitting(true);
        try {
            const res = await login(email.trim().toLowerCase(), password);
            if (!res.success) setGlobalError(res.message || "Invalid credentials. Please try again.");
        } catch {
            setGlobalError("Something went wrong. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <View style={styles.root}>
            <StatusBar barStyle="light-content" backgroundColor={BRAND} />

            {/* Top brand panel */}
            <View style={styles.topPanel}>
                <SafeAreaView edges={["top"]} style={styles.topPanelInner}>
                    <View style={styles.logoWrap}>
                        <Text style={styles.logoEmoji}>🏠</Text>
                    </View>
                    <Text style={styles.appName}>RiphahStay</Text>
                    <Text style={styles.tagline}>Riphah Girls Hostel  smart & secure living</Text>
                </SafeAreaView>
            </View>

            {/* Form card */}
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
                <ScrollView
                    contentContainerStyle={styles.formScroll}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Sign in to your account</Text>

                        {globalError ? (
                            <View style={styles.errorBanner}>
                                <Text style={styles.errorBannerText}>{globalError}</Text>
                            </View>
                        ) : null}

                        <View style={styles.inputGroup}>
                            <Input
                                label="University Email"
                                placeholder="12345@students.riphah.edu.pk"
                                type="email"
                                value={email}
                                onChangeText={(v) => {
                                    setEmail(v);
                                    setFieldErrors((e) => ({ ...e, email: null }));
                                    setGlobalError("");
                                }}
                                autoCapitalize="none"
                                keyboardType="email-address"
                            />
                            {fieldErrors.email ? <Text style={styles.fieldErr}>{fieldErrors.email}</Text> : null}
                        </View>

                        <View style={styles.inputGroup}>
                            <Input
                                label="Password"
                                placeholder="Enter your password"
                                type="password"
                                value={password}
                                onChangeText={(v) => {
                                    setPassword(v);
                                    setFieldErrors((e) => ({ ...e, password: null }));
                                    setGlobalError("");
                                }}
                            />
                            {fieldErrors.password ? <Text style={styles.fieldErr}>{fieldErrors.password}</Text> : null}
                        </View>

                        <TouchableOpacity
                            onPress={() => navigation.navigate("ResetPassword")}
                            style={styles.forgotWrap}
                        >
                            <Text style={styles.forgotText}>Forgot Password?</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.primaryBtn, submitting && styles.primaryBtnDisabled]}
                            onPress={handleLogin}
                            disabled={submitting}
                            activeOpacity={0.85}
                        >
                            {submitting
                                ? <ActivityIndicator color="#fff" />
                                : <Text style={styles.primaryBtnText}>Sign In</Text>
                            }
                        </TouchableOpacity>

                        <View style={styles.dividerRow}>
                            <View style={styles.divider} />
                            <Text style={styles.dividerText}>New here?</Text>
                            <View style={styles.divider} />
                        </View>

                        <TouchableOpacity
                            style={styles.secondaryBtn}
                            onPress={() => navigation.navigate("Signup")}
                            activeOpacity={0.85}
                        >
                            <Text style={styles.secondaryBtnText}>Create Account</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.guestBtn}
                            onPress={() => navigation.navigate("GuestNearbyHostels")}
                            activeOpacity={0.75}
                        >
                            <Text style={styles.guestBtnText}>Browse Nearby Hostels as Guest</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: "#F5F7FA" },

    // Top brand panel
    topPanel: {
        backgroundColor: BRAND,
        paddingBottom: 32,
    },
    topPanelInner: {
        alignItems: "center",
        paddingHorizontal: 24,
        paddingTop: 20,
    },
    logoWrap: {
        width: 70,
        height: 70,
        borderRadius: 20,
        backgroundColor: "rgba(255,255,255,0.2)",
        borderWidth: 2,
        borderColor: "rgba(255,255,255,0.4)",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 12,
    },
    logoEmoji: { fontSize: 30 },
    appName: {
        color: "#fff",
        fontSize: 26,
        fontWeight: "800",
        letterSpacing: -0.5,
    },
    tagline: {
        color: "rgba(255,255,255,0.7)",
        fontSize: 13,
        marginTop: 4,
        textAlign: "center",
    },

    // Form card
    formScroll: { padding: 20 },
    card: {
        backgroundColor: "#fff",
        borderRadius: 20,
        padding: 22,
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 12,
        elevation: 4,
    },
    cardTitle: {
        fontSize: 17,
        fontWeight: "700",
        color: "#111827",
        marginBottom: 18,
    },

    errorBanner: {
        backgroundColor: "#FEE2E2",
        borderWidth: 1,
        borderColor: "#FECACA",
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 14,
        marginBottom: 14,
    },
    errorBannerText: { color: "#B91C1C", fontSize: 13, fontWeight: "500", textAlign: "center" },

    inputGroup:  { marginBottom: 4 },
    fieldErr:    { color: "#DC2626", fontSize: 12, marginTop: 4, marginBottom: 6, paddingLeft: 2 },

    forgotWrap:  { alignSelf: "flex-end", marginTop: 4, marginBottom: 18 },
    forgotText:  { fontSize: 13, color: BRAND, fontWeight: "600" },

    primaryBtn: {
        backgroundColor: BRAND,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: "center",
        marginBottom: 20,
    },
    primaryBtnDisabled: { opacity: 0.6 },
    primaryBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },

    dividerRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginBottom: 16,
    },
    divider:     { flex: 1, height: 1, backgroundColor: "#E5E7EB" },
    dividerText: { fontSize: 12, color: "#9CA3AF", fontWeight: "500" },

    secondaryBtn: {
        borderWidth: 1.5,
        borderColor: BRAND,
        paddingVertical: 13,
        borderRadius: 12,
        alignItems: "center",
        marginBottom: 12,
    },
    secondaryBtnText: { color: BRAND, fontSize: 15, fontWeight: "700" },

    guestBtn: {
        paddingVertical: 10,
        alignItems: "center",
    },
    guestBtnText: { fontSize: 13, color: "#9CA3AF", fontWeight: "500" },
});
