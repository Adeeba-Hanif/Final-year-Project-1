import { useState } from "react";
import { StyleSheet, Alert } from "react-native";
import axios from "axios";
import Input from "../components/Input";
import LongTextButton from "../components/LongTextButton";
import Typography from "../components/Typography";
import Layout from "../components/Layout";

export default function SignupScreen({ navigation }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!fullName || !email || !phone || !password || !confirmPassword) {
      Alert.alert("Missing Fields", "Please fill in all fields.");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Password Mismatch", "Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`${process.env.EXPO_PUBLIC_SERVER_URI}/auth/signup`, {
        fullName,
        email,
        phone,
        password,
      });

      if (response.status === 201) {
        Alert.alert("Signup Successful", "Your account has been created!", [
          { text: "OK", onPress: () => navigation.navigate("Login") },
        ]);
      }
    } catch (err) {
      console.log(err)
      console.error("Signup error:", err.response?.data || err.message);
      const message =
        err.response?.data?.message || "Something went wrong. Please try again.";
      Alert.alert("Signup Failed", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout
      showBack title="Create Account"
      contentStyle={{ paddingTop: 10 }}
      hasKeyboard={false}
    >
      <Typography variant="heading">RiphaStay</Typography>

      <Typography variant="body" style={{ marginVertical: 10 }}>
        Create your account to join the Riphah Girls Hostel community.
      </Typography>

      <Input
        label="Full Name"
        placeholder="Enter your full name"
        value={fullName}
        onChangeText={setFullName}
      />
      <Input
        label="Email"
        placeholder="Enter your Riphah email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <Input
        label="Phone"
        placeholder="Enter your phone number"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />
      <Input
        label="Password"
        placeholder="Enter your password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Input
        label="Confirm Password"
        placeholder="Re-enter your password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      <LongTextButton text={loading ? "Creating Account..." : "Sign Up"} onPress={handleSignup} disabled={loading} />

      <Typography
        variant="link"
        onPress={() => navigation.navigate("Login")}
        style={styles.link}
      >
        Already have an account? Log in
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
