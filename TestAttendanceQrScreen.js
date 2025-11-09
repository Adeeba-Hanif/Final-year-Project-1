// screens/TestAttendanceQrScreen.js
import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Alert } from "react-native";
import QRCode from "react-native-qrcode-svg";
import axios from "axios";

const API_BASE = process.env.EXPO_PUBLIC_SERVER_URI; // or hardcode for test

export default function TestAttendanceQrScreen() {
    const [qrToken, setQrToken] = useState(null);
    const [expiresIn, setExpiresIn] = useState(null);
    const timerRef = useRef(null);

    const fetchQr = async () => {
        try {
            const res = await axios.get(`${API_BASE}/attendance/qr`);
            setQrToken(res.data.qrToken);
            setExpiresIn(res.data.expiresIn);

            // refresh a bit earlier than expiry
            if (timerRef.current) clearTimeout(timerRef.current);
            const refreshInMs = Math.max((res.data.expiresIn - 5) * 1000, 4000);
            timerRef.current = setTimeout(fetchQr, refreshInMs);
        } catch (err) {
            console.log("get qr err", err?.response?.data || err.message);
            Alert.alert("Error", "Failed to get QR");
        }
    };

    useEffect(() => {
        fetchQr();
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    return (
        <View style={styles.wrap}>
            <Text style={styles.title}>Test Attendance QR</Text>
            {qrToken ? (
                <>
                    <QRCode value={qrToken} size={240} />
                    <Text style={styles.sub}>Scan this in the student app</Text>
                    {expiresIn ? (
                        <Text style={styles.timer}>
                            Auto refresh ~ every {expiresIn}s
                        </Text>
                    ) : null}
                </>
            ) : (
                <ActivityIndicator size="large" />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: {
        flex: 1,
        backgroundColor: "#F3F4F6",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
    },
    title: {
        fontSize: 18,
        fontWeight: "600",
        marginBottom: 12,
    },
    sub: {
        color: "#6B7280",
    },
    timer: {
        color: "#111827",
        fontSize: 12,
    },
});
