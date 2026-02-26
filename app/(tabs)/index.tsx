import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width, height } = Dimensions.get("window");

export default function LandingPage() {
  const router = useRouter();
  // أنيميشن الدوائر التقنية (Cyber Orbits)
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeText = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // دوران مستمر للدوائر الخلفية
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 10000,
        useNativeDriver: true,
      }),
    ).start();

    // نبض الزر والشعار
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // ظهور النص تدريجياً
    Animated.timing(fadeText, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: true,
    }).start();
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient
        colors={["#020617", "#0f172a", "#1e1b4b"]}
        style={styles.background}
      >
        {/* الدوائر التقنية المتحركة في الخلفية */}
        <Animated.View
          style={[styles.orbit, { transform: [{ rotate: spin }] }]}
        >
          <View style={styles.orbitDot} />
        </Animated.View>

        <View style={styles.mainContent}>
          {/* شعار النظام (Shield & Eye) */}
          <Animated.View
            style={[
              styles.logoContainer,
              { transform: [{ scale: pulseAnim }] },
            ]}
          >
            <LinearGradient
              colors={["#6366f1", "#4338ca"]}
              style={styles.logoGradient}
            >
              <Text style={styles.logoIcon}>🛡️</Text>
            </LinearGradient>
            {/* حلقة النيون حول الشعار */}
            <View style={styles.neonRing} />
          </Animated.View>

          {/* نصوص الرؤية */}
          <Animated.View style={{ opacity: fadeText, alignItems: "center" }}>
            <Text style={styles.brandName}>P.S.R.S</Text>
            <Text style={styles.motto}>نظام البلاغات الفلسطيني الذكي</Text>

            <View style={styles.separator} />

            <Text style={styles.description}>
              جسر رقمي يربطك بالجهات المختصة{"\n"}
              بلاغك محمي بالذكاء الاصطناعي وسرعة الإستجابة.
            </Text>
          </Animated.View>

          {/* أزرار الدخول القوية */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.primaryButton} activeOpacity={0.8}>
              <LinearGradient
                colors={["#4f46e5", "#3730a3"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.btnGradient}
              >
                <TouchableOpacity
                  style={styles.primaryButton}
                  activeOpacity={0.8}
                  onPress={() => router.push("/auth/auth")} // 3. أضف هذا الأمر للانتقال
                >
                  <LinearGradient
                    colors={["#4f46e5", "#3730a3"]}
                    style={styles.btnGradient}
                  >
                    <Text style={styles.btnText}>Next - التالي</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton}>
              <Text style={styles.secondaryBtnText}>معلومات أكثر </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* تذييل الصفحة (Footer) */}
        <Text style={styles.footerVersion}>v 1.0.0 | © 2026 by M AlSabbah</Text>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: { flex: 1, justifyContent: "center", alignItems: "center" },
  mainContent: { alignItems: "center", paddingHorizontal: 30, zIndex: 10 },

  orbit: {
    position: "absolute",
    width: width * 1.4,
    height: width * 1.4,
    borderRadius: width,
    borderWidth: 1,
    borderColor: "rgba(99, 102, 241, 0.2)",
    zIndex: 1,
  },
  orbitDot: {
    position: "absolute",
    top: -5,
    left: "50%",
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#6366f1",
    shadowColor: "#6366f1",
    shadowRadius: 10,
    elevation: 10,
  },

  logoContainer: {
    width: 120,
    height: 120,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
  },
  logoGradient: {
    width: "100%",
    height: "100%",
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    elevation: 20,
    shadowColor: "#6366f1",
    shadowOpacity: 0.8,
    shadowRadius: 20,
  },
  neonRing: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
    borderColor: "rgba(99, 102, 241, 0.3)",
  },
  logoIcon: { fontSize: 50 },

  brandName: {
    color: "#fff",
    fontSize: 40,
    fontWeight: "900",
    letterSpacing: 5,
  },
  motto: {
    color: "#818cf8",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 5,
    letterSpacing: 1,
  },
  separator: {
    width: 50,
    height: 4,
    backgroundColor: "#e11d48",
    marginVertical: 20,
    borderRadius: 2,
  },
  description: {
    color: "#94a3b8",
    textAlign: "center",
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 40,
  },

  buttonContainer: { width: "100%", gap: 15 },
  primaryButton: {
    height: 60,
    borderRadius: 15,
    overflow: "hidden",
    elevation: 10,
  },
  btnGradient: { flex: 1, justifyContent: "center", alignItems: "center" },
  btnText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    paddingHorizontal: 30,
    paddingVertical: 5,
  },

  secondaryButton: {
    height: 60,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.3)",
  },
  secondaryBtnText: { color: "#94a3b8", fontSize: 16 },
  footerVersion: {
    position: "absolute",
    bottom: 30,
    color: "rgb(255, 255, 255)",
    fontSize: 15,
  },
});
