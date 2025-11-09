import { useState } from "react";
import { Alert, StyleSheet } from "react-native";
import Input from "../components/Input";
import LongTextButton from "../components/LongTextButton";
import Typography from "../components/Typography";
import Layout from "../components/Layout";
import { useAuthContext } from "../context"; // make sure this path is correct

export default function LoginScreen({ navigation }) {
  const { login, loading } = useAuthContext();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // basic client-side checks
  const validate = (email, password) => {
    if (!email || !email.includes("@")) {
      return "Please enter a valid email address";
    }
    if (!password || password.length < 6) {
      return "Please enter a valid password (min 6 chars)";
    }
    return null;
  };

  const handleLogin = async () => {
    const errorMsg = validate(email, password);
    if (errorMsg) {
      Alert.alert("Error", errorMsg);
      return;
    }

    const res = await login(email, password);

    if (res.success) {
      Alert.alert("Success", "Sign in successful");
      // if you want: navigation.replace("Home");
    } else {
      Alert.alert("Error", res.message || "Login failed");
    }
  };

  return (
    <Layout noHeader align={"center"}>
      <Typography variant="heading">
        RiphahStay
      </Typography>

      <Typography variant="body" style={{ marginVertical: 15 }}>
        Welcome to Riphah Girls Hostel a place to feel safe comfortable and at home
        Sign in to manage your stay meals and services all in one simple place
      </Typography>

      <Input
        label="Email"
        placeholder="Enter your email"
        type="email"
        value={email}
        onChangeText={setEmail}
      />

      <Input
        label="Password"
        placeholder="Enter your password"
        type="password"
        value={password}
        onChangeText={setPassword}
      />

      <LongTextButton
        text={loading ? "Logging in..." : "Login"}
        onPress={handleLogin}
        disabled={loading}
      />

      <Typography
        variant="link"
        onPress={() => navigation.navigate("ResetPassword")}
        style={styles.link}
      >
        Forgot Password?
      </Typography>

      <Typography
        variant="link"
        onPress={() => navigation.navigate("Signup")}
        style={styles.link}
      >
        {`Don't have an account? Sign Up`}
      </Typography>
      <Typography
        variant="link"
        onPress={() => navigation.navigate("TestAttendanceQrScreen")}
        style={styles.link}
      >
        {`Open QR Code Screen (TEST_STUB)`}
      </Typography>
    </Layout>
  );
}

const styles = StyleSheet.create({
  link: {
    marginTop: 15,
    textAlign: "center",
  },
});
