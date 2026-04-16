import React from "react";
import {
    View,
    ScrollView,
    StyleSheet,
    StatusBar,
    Platform,
    KeyboardAvoidingView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import ScreenHeader from "./ScreenHeader";
import { SafeAreaView } from "react-native-safe-area-context";

const BG = "#F9FAFB";
const TINT = "#111827";

export default function Layout({
    title = "",
    showBack,
    right = null,
    noHeader = false,
    scroll = false,
    contentStyle,
    headerBg = BG,
    headerTint = TINT,
    align = "top",
    children,
}) {
    const navigation = useNavigation();
    const canGoBack = navigation?.canGoBack?.() ?? false;
    const alignmentStyles =
        ({
            top: { justifyContent: "flex-start" },
            center: { justifyContent: "center" },
            bottom: { justifyContent: "flex-end" },
        }[align] || {});

    return (
        <View style={styles.safe}>
            <StatusBar
                barStyle="dark-content"
                translucent={Platform.OS === "android"}
                backgroundColor="transparent"
            />

            {!noHeader && (
                <ScreenHeader
                    title={title}
                    showBack={showBack ?? canGoBack}
                    onBack={() => navigation.goBack()}
                    right={right}
                    bg={headerBg}
                    tint={headerTint}
                />
            )}

            {/* KeyboardAvoidingView handles safe shifting */}
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 20 : 0}
            >
                <ScrollView
                    style={[styles.content, contentStyle]}
                    contentContainerStyle={[
                        styles.scrollContainer,
                        alignmentStyles,
                        { alignItems: "center" },
                    ]}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <SafeAreaView style={{ width: "100%" }}>{children}</SafeAreaView>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: BG,
    },
    content: {
        flex: 1,
        paddingHorizontal: 10,
    },
    scrollContainer: {
        flexGrow: 1,
        paddingBottom: 40,
    },
});
