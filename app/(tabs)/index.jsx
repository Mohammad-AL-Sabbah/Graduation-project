import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  AlertTriangle,
  ChevronLeft,
  LogIn,
  ShieldCheck,
  Target,
} from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  BackHandler,
  Dimensions,
  Easing,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

export default function LandingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // أنيميشن الإزاحة، الشفافية، والـ Scale
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // --- حل مشكلة زر الرجوع الخاص بالموبايل ---
  useEffect(() => {
    const backAction = () => {
      if (step > 0) {
        performTransition(step - 1, "prev");
        return true;
      }
      return false;
    };
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction,
    );
    return () => backHandler.remove();
  }, [step]);

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      if (token) {
        router.replace("../pages/HomeScreen");
      } else {
        setIsLoading(false);
      }
    } catch (e) {
      setIsLoading(false);
    }
  };

  const performTransition = (targetStep, direction = "next") => {
    // أنيميشن خروج سريع ومعقد (مبهر)
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: direction === "next" ? -width * 0.4 : width * 0.4,
        duration: 200,
        useNativeDriver: true,
        easing: Easing.out(Easing.quad),
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.92,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setStep(targetStep);
      slideAnim.setValue(direction === "next" ? width : -width);
      scaleAnim.setValue(1.08);

      // أنيميشن دخول مع مرونة (Elastic Feel)
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
          easing: Easing.out(Easing.back(1.2)),
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  if (isLoading) return null;

  // --- الواجهة الأولى: Splash ---
  const renderStartStep = () => (
    <LinearGradient colors={["#064e3b", "#032c21"]} style={styles.fullScreen}>
      <View style={styles.splashContent}>
        <View style={styles.whiteLogoBox}>
          <ShieldCheck size={40} color="#064e3b" strokeWidth={2.5} />
        </View>

        <View style={styles.textCenter}>
          <Text style={styles.brandTitle}>PSRS</Text>
          <Text style={styles.arabicSubTitle}>
            نظام الإبلاغ الذكي الفلسطيني
          </Text>
          <Text style={styles.englishSubTitle}>
            Palestinian Smart Reporting System
          </Text>
          <View style={styles.flagContainer}>
            <View style={[styles.flagStrip, { backgroundColor: "#000" }]} />
            <View style={[styles.flagStrip, { backgroundColor: "#FFF" }]} />
            <View style={[styles.flagStrip, { backgroundColor: "#009739" }]} />
            <View style={styles.flagTriangle} />
          </View>
          <Text style={styles.taglineText}>SMART • SAFE • CIVIC</Text>
        </View>

        <TouchableOpacity
          style={styles.mainActionBtn}
          onPress={() => performTransition(1, "next")}
        >
          <LinearGradient
            colors={["#10b981", "#059669"]}
            style={styles.btnGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.btnMainText}>ابدأ الآن / Get Started ›</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* زر الوصول السريع لتسجيل الدخول */}
        <TouchableOpacity
          style={styles.quickLoginBtn}
          onPress={() => router.push("/auth/login")}
        >
          <LogIn size={18} color="#10b981" />
          <Text style={styles.quickLoginText}>
            لديك حساب؟ تسجيل الدخول / Login
          </Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );

  // --- الواجهات التعليمية (مدمجة في وظيفة واحدة لتجنب undefined) ---
  const renderInfoStep = (type) => {
    const isMunicipal = type === "municipal";
    return (
      <View style={styles.whiteScreen}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => performTransition(step - 1, "prev")}
        >
          <ChevronLeft size={28} color="#1A5336" />
        </TouchableOpacity>

        {/* زر الوصول السريع لتسجيل الدخول في الصفحات التعليمية */}
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => router.push("/auth/login")}
        >
          <LogIn size={18} color="#1A5336" />
          <Text style={styles.loginButtonText}>تسجيل الدخول</Text>
        </TouchableOpacity>

        <View style={styles.topIllustration}>
          <View style={styles.circleBg}>
            <View
              style={[
                styles.iconSquare,
                !isMunicipal && { backgroundColor: "#8B0000" },
              ]}
            >
              {isMunicipal ? (
                <Target size={45} color="#FFF" />
              ) : (
                <AlertTriangle size={45} color="#FFF" />
              )}
            </View>
          </View>
        </View>

        <View style={styles.infoBody}>
          <Text style={styles.stepCounter}>
            {isMunicipal ? "STEP 01 / 02 الخطوة" : "STEP 02 / 02 الخطوة"}
          </Text>
          <Text style={styles.mainHeadingText}>
            {isMunicipal
              ? "أبلغ عن المشكلة\nبكل سهولة"
              : "بلاغات الطوارئ\nوالحالات العاجلة"}
          </Text>
          <Text style={styles.subHeadingText}>
            {isMunicipal
              ? "Report issues effortlessly"
              : "Emergency & Urgent Alerts"}
          </Text>
          <Text style={styles.descParagraph}>
            {isMunicipal
              ? "التقط صورة، حدد موقعك، وأرسل بلاغك مباشرة للبلدية في ثوانٍ معدودة."
              : "في حالات الخطر، أرسل نداء استغاثة فوري لتحديد موقعك بدقة وإخطار الجهات المختصة."}
          </Text>
          <View style={styles.onboardingFooter}>
            <TouchableOpacity
              style={styles.nextArrowBtn}
              onPress={() =>
                isMunicipal
                  ? performTransition(2, "next")
                  : router.push("/auth/register")
              }
            >
              <Text style={styles.nextLabel}>
                {isMunicipal ? "التالي ›" : "ابدأ الآن"}
              </Text>
            </TouchableOpacity>
            <View style={styles.dotIndicatorRow}>
              <View style={[styles.dot, isMunicipal && styles.activeDot]} />
              <View style={[styles.dot, !isMunicipal && styles.activeDot]} />
            </View>
          </View>
          <TouchableOpacity
            style={styles.skipLink}
            onPress={() => router.push("/auth/register")}
          >
            <Text style={styles.skipLabel}>تخطي / Skip</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle={step === 0 ? "light-content" : "dark-content"}
      />
      <Animated.View
        style={[
          styles.animatedWrapper,
          {
            transform: [{ translateX: slideAnim }, { scale: scaleAnim }],
            opacity: fadeAnim,
          },
        ]}
      >
        {step === 0 && renderStartStep()}
        {step === 1 && renderInfoStep("municipal")}
        {step === 2 && renderInfoStep("emergency")}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  animatedWrapper: { flex: 1 },
  fullScreen: { flex: 1 },
  whiteScreen: { flex: 1, backgroundColor: "#FFF" },
  splashContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 10,
    padding: 10,
  },
  whiteLogoBox: {
    width: 80,
    height: 80,
    backgroundColor: "#FFF",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    elevation: 10,
  },
  textCenter: { alignItems: "center" },
  brandTitle: {
    color: "#FFF",
    fontSize: 48,
    fontWeight: "900",
    letterSpacing: 10,
    marginTop: 30,
  },
  arabicSubTitle: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
    textAlign: "center",
  },
  englishSubTitle: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 12,
    marginTop: 5,
    textAlign: "center",
  },
  flagContainer: {
    width: 140,
    height: 80,
    marginVertical: 30,
    borderRadius: 5,
    overflow: "hidden",
    elevation: 5,
  },
  flagStrip: { flex: 1 },
  flagTriangle: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 0,
    height: 0,
    borderTopWidth: 40,
    borderBottomWidth: 40,
    borderLeftWidth: 50,
    borderTopColor: "transparent",
    borderBottomColor: "transparent",
    borderLeftColor: "#E4312B",
  },
  taglineText: {
    color: "#10b981",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 5,
    marginTop: 20,
  },
  mainActionBtn: {
    width: "100%",
    height: 65,
    borderRadius: 25,
    overflow: "hidden",
    marginBottom: 15,
  },
  btnGradient: { flex: 1, alignItems: "center", justifyContent: "center" },
  btnMainText: { color: "#FFF", fontSize: 18, fontWeight: "bold" },
  quickLoginBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  quickLoginText: {
    color: "#10b981",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
  loginButton: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 10,
    backgroundColor: "rgba(26, 83, 54, 0.1)",
    borderRadius: 25,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  loginButtonText: { color: "#1A5336", fontSize: 14, fontWeight: "600" },
  topIllustration: {
    height: "42%",
    backgroundColor: "#E9F5EE",
    justifyContent: "center",
    alignItems: "center",
  },
  circleBg: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(16, 185, 129, 0.05)",
    justifyContent: "center",
    alignItems: "center",
  },
  iconSquare: {
    width: 110,
    height: 110,
    backgroundColor: "#1A5336",
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 15,
    transform: [{ rotate: "15deg" }],
  },
  infoBody: { flex: 1, paddingHorizontal: 35, paddingTop: 30 },
  stepCounter: {
    fontSize: 12,
    color: "#AAA",
    textAlign: "right",
    fontWeight: "bold",
  },
  mainHeadingText: {
    fontSize: 32,
    fontWeight: "900",
    color: "#1A3D29",
    textAlign: "right",
    marginTop: 10,
  },
  subHeadingText: {
    fontSize: 16,
    color: "#10b981",
    textAlign: "right",
    fontWeight: "600",
  },
  descParagraph: {
    fontSize: 15,
    color: "#555",
    textAlign: "right",
    lineHeight: 24,
    marginTop: 15,
  },
  onboardingFooter: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 35,
  },
  nextArrowBtn: {
    paddingVertical: 14,
    paddingHorizontal: 35,
    backgroundColor: "#1A5336",
    borderRadius: 20,
  },
  nextLabel: { color: "#FFF", fontSize: 18, fontWeight: "bold" },
  dotIndicatorRow: { flexDirection: "row", gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#DDD" },
  activeDot: { width: 25, backgroundColor: "#1A5336" },
  skipLink: { marginTop: 25, alignItems: "center" },
  skipLabel: { color: "#CCC", fontSize: 14, fontWeight: "600" },
});
