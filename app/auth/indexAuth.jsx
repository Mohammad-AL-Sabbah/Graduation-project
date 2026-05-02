import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { LogIn, Moon, Sun, UserCircle, UserPlus } from "lucide-react-native";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAppTheme } from "../../ThemeContext";

const { width } = Dimensions.get("window");

export default function IndexAuth() {
  const router = useRouter();
  const { colors, isDarkMode, toggleTheme } = useAppTheme();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    // تشغيل الأنيميشن عند دخول الصفحة بسلاسة
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* ملاحظة: تم حذف Stack.Screen من هنا لضمان عدم انهيار التطبيق في الـ APK */}

      <LinearGradient
        colors={
          isDarkMode
            ? ["#020617", "#0f172a", "#1e1b4b"]
            : ["#f0fdf4", "#f8fafc", "#ffffff"]
        }
        style={styles.container}
      >
        {/* زر تبديل الثيم العلوي */}
        <TouchableOpacity
          style={[
            styles.themeSwitcher,
            {
              backgroundColor: isDarkMode ? "rgba(30, 41, 59, 0.9)" : "#ffffff",
              borderColor: colors.emerald,
            },
          ]}
          onPress={toggleTheme}
          activeOpacity={0.7}
        >
          {isDarkMode ? (
            <Sun size={22} color={colors.emerald} strokeWidth={2.5} />
          ) : (
            <Moon size={22} color={colors.emerald} strokeWidth={2.5} />
          )}
        </TouchableOpacity>

        {/* نقشة الكوفية في الخلفية */}
        <View style={styles.kufiyaContainer} pointerEvents="none">
          <Text
            style={[
              styles.kufiyaPattern,
              { color: colors.emerald, opacity: isDarkMode ? 0.04 : 0.07 },
            ]}
          >
            ╳ ╳ ╳ ╳ ╳ ╳ ╳ ╳ ╳ ╳ ╳ ╳ ╳ ╳ ╳
          </Text>
        </View>

        <Animated.View
          style={[
            styles.content,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View style={styles.textContainer}>
            <Text style={[styles.title, { color: colors.text }]}>
              ابدأ رحلتك معنا
            </Text>
            <View style={[styles.line, { backgroundColor: colors.emerald }]} />
            <Text style={[styles.subtitle, { color: colors.subText }]}>
              نظام PSRS الذكي{"\n"}لخدمة المواطن الفلسطيني
            </Text>
          </View>

          {/* مجموعة الأزرار */}
          <View style={styles.buttonGroup}>
            {/* زر تسجيل الدخول */}
            <TouchableOpacity
              style={styles.mainBtn}
              activeOpacity={0.85}
              onPress={() => router.push("/auth/login")}
            >
              <LinearGradient
                colors={["#10b981", "#059669"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.btnGradient}
              >
                <LogIn size={20} color="#fff" style={styles.btnIcon} />
                <Text style={styles.btnText}>تسجيل الدخول</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* زر إنشاء حساب */}
            <TouchableOpacity
              style={[
                styles.outlineBtn,
                {
                  borderColor: isDarkMode
                    ? "rgba(16, 185, 129, 0.4)"
                    : "rgba(16, 185, 129, 0.2)",
                  backgroundColor: isDarkMode
                    ? "rgba(255,255,255,0.03)"
                    : "rgba(16, 185, 129, 0.05)",
                },
              ]}
              onPress={() => router.push("/auth/register")}
            >
              <UserPlus
                size={20}
                color={isDarkMode ? "#fff" : "#059669"}
                style={styles.btnIcon}
              />
              <Text
                style={[
                  styles.outlineBtnText,
                  { color: isDarkMode ? "#fff" : "#0f172a" },
                ]}
              >
                فتح حساب جديد
              </Text>
            </TouchableOpacity>

            {/* رابط المتابعة كضيف */}
            <TouchableOpacity
              style={styles.guestLink}
              onPress={() => router.push("/auth/guestscreen")}
            >
              <UserCircle
                size={18}
                color={colors.subText}
                style={{ marginLeft: 8 }}
              />
              <Text style={[styles.guestText, { color: colors.subText }]}>
                المتابعة كضيف (عرض فقط)
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 30,
  },
  themeSwitcher: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 60,
    right: 25,
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1.5,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
    elevation: 5,
  },
  kufiyaContainer: {
    position: "absolute",
    top: 0,
    left: -100,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  kufiyaPattern: {
    fontSize: 45,
    letterSpacing: 20,
    transform: [{ rotate: "-20deg" }],
  },
  content: {
    width: "100%",
    alignItems: "center",
    zIndex: 10,
  },
  textContainer: {
    alignItems: "center",
    marginBottom: 60,
  },
  title: {
    fontSize: 36,
    fontWeight: "900",
    textAlign: "center",
    letterSpacing: -0.5,
  },
  line: {
    width: 50,
    height: 5,
    borderRadius: 10,
    marginVertical: 18,
  },
  subtitle: {
    fontSize: 17,
    textAlign: "center",
    fontWeight: "500",
    lineHeight: 26,
  },
  buttonGroup: {
    width: "100%",
    gap: 18,
  },
  mainBtn: {
    height: 65,
    borderRadius: 18,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#10b981",
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  btnGradient: {
    flex: 1,
    flexDirection: "row-reverse",
    justifyContent: "center",
    alignItems: "center",
  },
  btnText: {
    color: "#fff",
    fontSize: 19,
    fontWeight: "bold",
    marginRight: 12,
  },
  btnIcon: {
    marginLeft: 0,
  },
  outlineBtn: {
    height: 65,
    borderRadius: 18,
    borderWidth: 1.8,
    flexDirection: "row-reverse",
    justifyContent: "center",
    alignItems: "center",
  },
  outlineBtnText: {
    fontSize: 18,
    fontWeight: "700",
  },
  guestLink: {
    flexDirection: "row-reverse",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 15,
    padding: 10,
  },
  guestText: {
    fontSize: 15,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});
