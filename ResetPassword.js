import { useState } from "react";
import { StyleSheet } from "react-native";
import Input from "../components/Input";
import LongTextButton from "../components/LongTextButton";
import Typography from "../components/Typography";
import Layout from "../components/Layout";

export default function ResetPasswordScreen({ navigation }) {
  const [email, setEmail] = useState("");

  const handleReset = () => {
    if (!email) {
      alert("Please enter your email!");
      return;
    }
    alert("Password reset link sent to your email!");
    navigation.navigate("Login");
  };

  return (
    <Layout
      showBack={true}
      title="Reset Password"
    >
      <Typography variant="subheading" style={styles.info}>
        {`Enter your registered email and we'll send you a reset link.`}
      </Typography>

      <Input
        label="Email"
        placeholder="Enter your email"
        type="email"
        value={email}
        onChangeText={setEmail}
      />

      <LongTextButton text="Send Reset Link" onPress={handleReset} />
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    padding: 20,
  },
  info: {
    marginVertical: 5,
    color: "#555",

  },
});
