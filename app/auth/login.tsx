import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import Svg, { Circle, Line, Path } from "react-native-svg";
import api, { setRefreshToken } from "../API/ApiAuthToken";

const { width } = Dimensions.get("window");

type ToastType = "error" | "success";

const LoginScreen = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [emailFocused, setEmailFocused] = useState<boolean>(false);
  const [passwordFocused, setPasswordFocused] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const [toastVisible, setToastVisible] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>("");
  const [toastType, setToastType] = useState<ToastType>("error");
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const showToast = (message: string, type: ToastType = "error"): void => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(2500),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => setToastVisible(false));
  };

  const handleLogin = async (): Promise<void> => {
    if (!email || !password) {
      showToast("يرجى إدخال البريد الإلكتروني وكلمة المرور");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/Auth/Account/login", {
        email: email.trim(),
        password: password,
      });

      if (response.data.success) {
        const { accessToken, refreshToken, username, role } = response.data;

        await AsyncStorage.setItem("accessToken", accessToken);
        await setRefreshToken(refreshToken);
        await AsyncStorage.setItem("user", JSON.stringify({ username, role }));

        showToast(`مرحباً ${username}`, "success");

        setTimeout(() => router.replace("../pages/HomeScreen"), 1000);
      } else {
        showToast(response.data.message || "فشل تسجيل الدخول");
      }
    } catch (error: unknown) {
      console.error("Login error:", error);

      let errorMessage = "حدث خطأ في الاتصال بالسيرفر";

      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as {
          response?: {
            status?: number;
            data?: { isBlocked?: boolean; message?: string };
          };
        };
        if (axiosError.response?.status === 403) {
          errorMessage = axiosError.response?.data?.isBlocked
            ? "حسابك محظور من قبل الإدارة"
            : "ليس لديك صلاحية الوصول";
        } else if (
          axiosError.response?.status === 400 ||
          axiosError.response?.status === 401
        ) {
          errorMessage = "البريد الإلكتروني أو كلمة المرور غير صحيحة";
        } else if (axiosError.response?.data?.message) {
          errorMessage = axiosError.response.data.message;
        }
      } else if (error && typeof error === "object" && "message" in error) {
        const err = error as { message: string };
        if (err.message === "Network Error")
          errorMessage = "لا يوجد اتصال بالإنترنت";
      }

      showToast(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = (): void => {
    router.push("/");
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#0d3d1f" />

        {toastVisible && (
          <Animated.View
            style={[
              styles.toastContainer,
              toastType === "error" ? styles.toastError : styles.toastSuccess,
              { opacity: fadeAnim },
            ]}
          >
            <Text style={styles.toastText}>{toastMessage}</Text>
          </Animated.View>
        )}

        <View style={styles.header}>
          <Svg width={width} height={200} style={styles.headerPattern}>
            {[40, 80, 120, 160].map((y) => (
              <Line
                key={`h-${y}`}
                x1="0"
                y1={y}
                x2={width}
                y2={y}
                stroke="rgba(255,255,255,0.03)"
                strokeWidth="1"
              />
            ))}
          </Svg>

          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Svg width={32} height={32} viewBox="0 0 28 28">
                <Path
                  d="M14 2C14 2 7 6 7 13C7 17.5 10.5 21 14 22C17.5 21 21 17.5 21 13C21 6 14 2 14 2Z"
                  fill="white"
                />
                <Circle cx="14" cy="13" r="3" fill="#0d3d1f" />
              </Svg>
            </View>
            <Text style={styles.logoText}>PSRS</Text>
            <Text style={styles.logoSubtext}>نظام الإبلاغ الذكي الفلسطيني</Text>
            <Text style={styles.logoSubtextEn}>
              Palestinian Smart Reporting System
            </Text>
          </View>
        </View>

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            style={styles.formArea}
            contentContainerStyle={styles.formContent}
            keyboardShouldPersistTaps="always"
          >
            <View style={styles.formContainer}>
              <Text style={styles.formTitle}>مرحباً بعودتك</Text>
              <Text style={styles.formSubtitle}>Sign in to continue</Text>

              {/* حقل البريد الإلكتروني */}
              <View style={styles.fieldContainer}>
                <View style={styles.fieldLabelRow}>
                  <Text style={styles.fieldLabelEn}>Email</Text>
                  <Text style={styles.fieldLabel}>البريد الإلكتروني</Text>
                </View>
                <View
                  style={[
                    styles.fieldInput,
                    emailFocused && styles.fieldInputFocused,
                  ]}
                >
                  <TextInput
                    style={styles.input}
                    placeholder="example@email.com"
                    placeholderTextColor="#b0bec5"
                    value={email}
                    onChangeText={setEmail}
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                  <Text style={styles.fieldIcon}>✉️</Text>
                </View>
              </View>

              {/* حقل كلمة المرور */}
              <View style={styles.fieldContainer}>
                <View style={styles.fieldLabelRow}>
                  <Text style={styles.fieldLabelEn}>Password</Text>
                  <Text style={styles.fieldLabel}>كلمة المرور</Text>
                </View>
                <View
                  style={[
                    styles.fieldInput,
                    passwordFocused && styles.fieldInputFocused,
                  ]}
                >
                  <TextInput
                    style={styles.input}
                    placeholder="••••••••"
                    placeholderTextColor="#b0bec5"
                    value={password}
                    onChangeText={setPassword}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                  >
                    <Feather
                      name={showPassword ? "eye-off" : "eye"}
                      size={20}
                      color="#2e7d52"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                style={styles.forgotContainer}
                onPress={() => router.push("/auth/ForgotPasswordScreen")}
              >
                <Text style={styles.forgotText}>
                  نسيت كلمة المرور؟ / Forgot password?
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
                onPress={handleLogin}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.loginBtnText}>تسجيل الدخول / Login</Text>
                )}
              </TouchableOpacity>

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.dividerLine} />
              </View>

              <TouchableOpacity style={styles.guestBtn} onPress={handleGuest}>
                <Text style={styles.guestBtnText}>
                  👤 دخول كضيف / Continue as Guest
                </Text>
              </TouchableOpacity>

              <View style={styles.registerRow}>
                <Text style={styles.registerText}>ليس لديك حساب؟ </Text>
                <TouchableOpacity onPress={() => router.push("/auth/register")}>
                  <Text style={styles.registerLink}>سجّل الآن / Register</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f9f7" },
  header: {
    backgroundColor: "#0d3d1f",
    paddingTop: Platform.OS === "ios" ? 50 : 40,
    paddingBottom: 40,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerPattern: { position: "absolute", top: 0, left: 0 },
  logoContainer: { alignItems: "center" },
  logoCircle: {
    width: 70,
    height: 70,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  logoText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: 2,
  },
  logoSubtext: { color: "rgba(255,255,255,0.7)", fontSize: 10 },
  logoSubtextEn: { color: "rgba(255,255,255,0.5)", fontSize: 8 },
  formArea: { flex: 1 },
  formContent: { paddingHorizontal: 25, paddingTop: 30, paddingBottom: 50 },
  formContainer: { width: "100%" },
  formTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0d1f14",
    textAlign: "center",
  },
  formSubtitle: {
    fontSize: 12,
    color: "#607d6b",
    marginBottom: 30,
    textAlign: "center",
  },
  fieldContainer: { marginBottom: 20 },
  fieldLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  fieldLabel: { fontSize: 12, color: "#0d1f14", fontWeight: "700" },
  fieldLabelEn: { fontSize: 10, color: "#607d6b" },
  fieldInput: {
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: "#e0ece6",
    borderRadius: 14,
    paddingHorizontal: 15,
    height: 58,
    flexDirection: "row",
    alignItems: "center",
  },
  fieldInputFocused: { borderColor: "#2e7d52", borderWidth: 2 },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#0d1f14",
    height: "100%",
    textAlign: "right",
  },
  fieldIcon: { fontSize: 18, color: "#2e7d52", marginLeft: 10 },
  forgotContainer: { alignSelf: "center", marginBottom: 25, marginTop: 5 },
  forgotText: {
    fontSize: 11,
    color: "#2e7d52",
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  loginBtn: {
    backgroundColor: "#1a5c32",
    height: 58,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },
  loginBtnDisabled: { backgroundColor: "#c8d8d0" },
  loginBtnText: { color: "#fff", fontSize: 15, fontWeight: "800" },
  divider: { flexDirection: "row", alignItems: "center", marginVertical: 25 },
  dividerLine: { flex: 1, height: 1, backgroundColor: "#e0ece6" },
  dividerText: { fontSize: 11, color: "#b0bec5", paddingHorizontal: 15 },
  guestBtn: {
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: "#c8d8d0",
    height: 58,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  guestBtnText: { color: "#1a5c32", fontSize: 14, fontWeight: "700" },
  registerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  registerText: { fontSize: 13, color: "#607d6b" },
  registerLink: {
    fontSize: 13,
    color: "#1a5c32",
    fontWeight: "800",
    textDecorationLine: "underline",
  },
  toastContainer: {
    position: "absolute",
    top: Platform.OS === "ios" ? 100 : 80,
    left: 20,
    right: 20,
    zIndex: 1000,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  toastError: { backgroundColor: "#dc2626" },
  toastSuccess: { backgroundColor: "#10b981" },
  toastText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
});

export default LoginScreen;
