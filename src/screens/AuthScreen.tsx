import React from "react";
import { View, Text, TextInput, Pressable, ActivityIndicator } from "react-native";
import { signInWithGoogle } from "../auth/cognitoGoogle";
import { signInEmailPassword, signUpEmailPassword, confirmSignUp, resendConfirmationCode, isValidEmail, isStrongPassword } from "../auth/emailPassword";

type Tab = "login" | "signup" | "confirm";

export function AuthScreen({ onAuthed }: { onAuthed: () => Promise<void> }) {
  const [tab, setTab] = React.useState<Tab>("login");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [code, setCode] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [info, setInfo] = React.useState<string | null>(null);

  function resetMessages() {
    setError(null);
    setInfo(null);
  }

  async function handleGoogle() {
    resetMessages();
    setBusy(true);
    try {
      await signInWithGoogle();
      await onAuthed();
    } catch (e: any) {
      setError(e?.message ?? "Google sign-in failed.");
    } finally {
      setBusy(false);
    }
  }

  async function handleEmailLogin() {
    resetMessages();
    const e = email.trim().toLowerCase();

    if (!isValidEmail(e)) return setError("Enter a valid email.");
    if (!password) return setError("Enter your password.");

    setBusy(true);
    try {
      await signInEmailPassword(e, password);
      await onAuthed();
    } catch (err: any) {
      // common Cognito message
      const msg = err?.message ?? "Email login failed.";
      if (msg.toLowerCase().includes("not confirmed")) {
        setInfo("Your email isn’t confirmed yet. Enter the code we emailed you.");
        setTab("confirm");
      } else {
        setError(msg);
      }
    } finally {
      setBusy(false);
    }
  }

  async function handleSignup() {
    resetMessages();
    const e = email.trim().toLowerCase();

    if (!isValidEmail(e)) return setError("Enter a valid email.");
    if (!isStrongPassword(password)) {
      return setError("Password must be 8+ chars with upper/lower/number/special.");
    }

    setBusy(true);
    try {
      await signUpEmailPassword(e, password);
      setInfo("Account created. Check your email for the confirmation code.");
      setTab("confirm");
    } catch (err: any) {
      setError(err?.message ?? "Sign up failed.");
    } finally {
      setBusy(false);
    }
  }

  async function handleConfirm() {
    resetMessages();
    const e = email.trim().toLowerCase();
    const c = code.trim();

    if (!isValidEmail(e)) return setError("Enter a valid email.");
    if (!c) return setError("Enter the confirmation code.");

    setBusy(true);
    try {
      await confirmSignUp(e, c);
      setInfo("Confirmed ✅ Now log in.");
      setTab("login");
      setCode("");
    } catch (err: any) {
      setError(err?.message ?? "Confirmation failed.");
    } finally {
      setBusy(false);
    }
  }

  async function handleResend() {
    resetMessages();
    const e = email.trim().toLowerCase();
    if (!isValidEmail(e)) return setError("Enter a valid email first.");

    setBusy(true);
    try {
      await resendConfirmationCode(e);
      setInfo("Code resent. Check your email.");
    } catch (err: any) {
      setError(err?.message ?? "Resend failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 24 }}>
      <Text style={{ fontSize: 24, marginBottom: 6 }}>Pour Over</Text>
      <Text style={{ opacity: 0.7, marginBottom: 16 }}>Sign in to control your machine and schedules.</Text>

      {/* Google */}
      <Pressable
        onPress={handleGoogle}
        disabled={busy}
        style={{
          padding: 14,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: "#ddd",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <Text style={{ fontSize: 16 }}>Continue with Google</Text>
      </Pressable>

      {/* Tabs */}
      <View style={{ flexDirection: "row", gap: 10, marginBottom: 12 }}>
        <TabButton
          label="Login"
          active={tab === "login"}
          onPress={() => {
            resetMessages();
            setTab("login");
          }}
        />
        <TabButton
          label="Create"
          active={tab === "signup"}
          onPress={() => {
            resetMessages();
            setTab("signup");
          }}
        />
        <TabButton
          label="Confirm"
          active={tab === "confirm"}
          onPress={() => {
            resetMessages();
            setTab("confirm");
          }}
        />
      </View>

      {/* Messages */}
      {!!error && <Text style={{ color: "#b00020", marginBottom: 10 }}>{error}</Text>}
      {!!info && <Text style={{ color: "#0a7a2f", marginBottom: 10 }}>{info}</Text>}

      {/* Form */}
      <Text style={{ marginBottom: 6, opacity: 0.7 }}>Email</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="you@email.com"
        style={{
          borderWidth: 1,
          borderColor: "#ddd",
          padding: 12,
          borderRadius: 12,
          marginBottom: 12,
        }}
      />

      {tab !== "confirm" ? (
        <>
          <Text style={{ marginBottom: 6, opacity: 0.7 }}>Password</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="••••••••"
            style={{
              borderWidth: 1,
              borderColor: "#ddd",
              padding: 12,
              borderRadius: 12,
              marginBottom: 12,
            }}
          />
        </>
      ) : (
        <>
          <Text style={{ marginBottom: 6, opacity: 0.7 }}>Confirmation code</Text>
          <TextInput
            value={code}
            onChangeText={setCode}
            keyboardType="number-pad"
            placeholder="123456"
            style={{
              borderWidth: 1,
              borderColor: "#ddd",
              padding: 12,
              borderRadius: 12,
              marginBottom: 12,
            }}
          />
        </>
      )}

      {/* Primary action */}
      <Pressable
        disabled={busy}
        onPress={() => {
          if (tab === "login") return handleEmailLogin();
          if (tab === "signup") return handleSignup();
          return handleConfirm();
        }}
        style={{
          padding: 14,
          borderRadius: 12,
          backgroundColor: busy ? "#999" : "#111",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        {busy ? <ActivityIndicator /> : <Text style={{ color: "white", fontSize: 16 }}>{tab === "login" ? "Login" : tab === "signup" ? "Create account" : "Confirm email"}</Text>}
      </Pressable>

      {/* Secondary actions */}
      {tab === "confirm" && (
        <Pressable onPress={handleResend} disabled={busy} style={{ padding: 10, alignItems: "center" }}>
          <Text style={{ opacity: 0.8 }}>Resend code</Text>
        </Pressable>
      )}
    </View>
  );
}

function TabButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: active ? "#111" : "#ddd",
        backgroundColor: active ? "#111" : "transparent",
      }}
    >
      <Text style={{ color: active ? "white" : "#111" }}>{label}</Text>
    </Pressable>
  );
}
