import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
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
import api from "../API/ApiAuthToken";

const { width } = Dimensions.get("window");

type ToastType = "error" | "success";

const ResetPasswordScreen = () => {
  const { email } = useLocalSearchParams<{ email: string }>();

  const [code, setCode] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);
  const [codeFocused, setCodeFocused] = useState<boolean>(false);
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

  const handleResetPassword = async (): Promise<void> => {
    if (!code) {
      showToast("يرجى إدخال رمز التحقق");
      return;
    }

    if (!newPassword) {
      showToast("يرجى إدخال كلمة المرور الجديدة");
      return;
    }

    if (newPassword.length < 6) {
      showToast("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast("كلمة المرور غير متطابقة");
      return;
    }

    setLoading(true);
    try {
      // ✅ نرسل فقط code, newPassword, email (بدون confirmPassword)
      const response = await api.patch("Auth/Account/ResetPassword", {
        code: code.trim(),
        newPassword: newPassword,
        email: email,
      });

      if (response.data.success) {
        showToast("تم تغيير كلمة المرور بنجاح", "success");

        setTimeout(() => {
          router.replace("/auth/login");
        }, 2000);
      } else {
        showToast(response.data.message || "فشل تغيير كلمة المرور");
      }
    } catch (error: any) {
      console.error("Reset password error:", error);

      if (error?.response?.status === 400) {
        showToast("الرمز غير صحيح أو منتهي الصلاحية");
      } else if (error?.response?.status === 404) {
        showToast("الـ endpoint غير موجود، تحقق من المسار");
      } else {
        showToast(
          error?.response?.data?.message || "حدث خطأ أثناء تغيير كلمة المرور",
        );
      }
    } finally {
      setLoading(false);
    }
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

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Feather name="arrow-right" size={24} color="white" />
          </TouchableOpacity>

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
            <Text style={styles.logoText}>إعادة تعيين كلمة المرور</Text>
            <Text style={styles.logoSubtextEn}>Reset Password</Text>
          </View>
        </View>

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView contentContainerStyle={styles.formContent}>
            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>أدخل رمز التحقق</Text>
              <Text style={styles.infoDescription}>
                تم إرسال رمز التحقق إلى بريدك الإلكتروني
              </Text>
              {email && <Text style={styles.emailText}>{email}</Text>}
            </View>

            <View style={styles.fieldContainer}>
              <View style={styles.fieldLabelRow}>
                <Text style={styles.fieldLabelEn}>Verification Code</Text>
                <Text style={styles.fieldLabel}>رمز التحقق</Text>
              </View>
              <View
                style={[
                  styles.fieldInput,
                  codeFocused && styles.fieldInputFocused,
                ]}
              >
                <TextInput
                  style={styles.input}
                  placeholder="000000"
                  placeholderTextColor="#b0bec5"
                  value={code}
                  onChangeText={setCode}
                  onFocus={() => setCodeFocused(true)}
                  onBlur={() => setCodeFocused(false)}
                  keyboardType="number-pad"
                  maxLength={6}
                />
                <Text style={styles.fieldIcon}>🔐</Text>
              </View>
            </View>

            <View style={styles.fieldContainer}>
              <View style={styles.fieldLabelRow}>
                <Text style={styles.fieldLabelEn}>New Password</Text>
                <Text style={styles.fieldLabel}>كلمة المرور الجديدة</Text>
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
                  value={newPassword}
                  onChangeText={setNewPassword}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Feather
                    name={showPassword ? "eye-off" : "eye"}
                    size={20}
                    color="#2e7d52"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.fieldContainer}>
              <View style={styles.fieldLabelRow}>
                <Text style={styles.fieldLabelEn}>Confirm Password</Text>
                <Text style={styles.fieldLabel}>تأكيد كلمة المرور</Text>
              </View>
              <View style={[styles.fieldInput, styles.fieldInputFocused]}>
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="#b0bec5"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Feather
                    name={showConfirmPassword ? "eye-off" : "eye"}
                    size={20}
                    color="#2e7d52"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.resetBtn, loading && styles.btnDisabled]}
              onPress={handleResetPassword}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.resetBtnText}>
                  تغيير كلمة المرور / Reset Password
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backToLogin}
              onPress={() => router.push("/auth/login")}
            >
              <Text style={styles.backToLoginText}>العودة لتسجيل الدخول</Text>
            </TouchableOpacity>
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
  backButton: {
    position: "absolute",
    right: 20,
    top: Platform.OS === "ios" ? 55 : 45,
    zIndex: 10,
    padding: 8,
  },
  logoContainer: { alignItems: "center" },
  logoCircle: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    marginTop: 10,
  },
  logoText: { color: "#fff", fontSize: 18, fontWeight: "800" },
  logoSubtextEn: { color: "rgba(255,255,255,0.5)", fontSize: 12 },
  formContent: { paddingHorizontal: 25, paddingTop: 40, paddingBottom: 40 },
  infoBox: { marginBottom: 30, alignItems: "center" },
  infoTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0d1f14",
    marginBottom: 10,
    textAlign: "center",
  },
  infoDescription: {
    fontSize: 14,
    color: "#607d6b",
    textAlign: "center",
    lineHeight: 22,
  },
  emailText: {
    fontSize: 14,
    color: "#1a5c32",
    fontWeight: "bold",
    marginTop: 8,
    textAlign: "center",
  },
  fieldContainer: { marginBottom: 25 },
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
  resetBtn: {
    backgroundColor: "#1a5c32",
    height: 58,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    marginTop: 10,
  },
  btnDisabled: { backgroundColor: "#c8d8d0" },
  resetBtnText: { color: "#fff", fontSize: 15, fontWeight: "800" },
  backToLogin: { marginTop: 25, alignSelf: "center" },
  backToLoginText: {
    color: "#1a5c32",
    fontSize: 14,
    fontWeight: "700",
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
    elevation: 5,
  },
  toastError: { backgroundColor: "#dc2626" },
  toastSuccess: { backgroundColor: "#10b981" },
  toastText: { color: "#fff", fontSize: 14, fontWeight: "600" },
});

export default ResetPasswordScreen;
