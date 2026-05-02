import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, Stack } from 'expo-router';
import { Sun, Moon, Shield, Zap, Brain, MapPin, Bell, ArrowRight, ShieldCheck } from "lucide-react-native";
import Animated, { 
  FadeInDown, 
  FadeInUp,
  ZoomIn,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
} from 'react-native-reanimated';

import { useAppTheme } from "../../ThemeContext"; 

const { width } = Dimensions.get('window');

const FeatureCard = ({ icon: Icon, title, desc, delay, colors, isDarkMode }) => (
  <Animated.View 
    entering={FadeInDown.delay(delay).duration(800).springify()} 
    style={[styles.featureCard, { borderColor: isDarkMode ? 'rgba(16, 185, 129, 0.2)' : 'rgba(0,0,0,0.05)' }]}
  >
    <LinearGradient 
      colors={isDarkMode ? ['#1e293b', '#0f172a'] : ['#ffffff', '#f1f5f9']} 
      style={styles.cardGradient}
    >
      <View style={[styles.iconWrapper, { backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.1)' : '#f0fdf4' }]}>
        <Icon size={26} color="#10b981" />
      </View>
      <View style={styles.featureTextContainer}>
        <Text style={[styles.featureTitle, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.featureDesc, { color: colors.subText }]}>{desc}</Text>
      </View>
    </LinearGradient>
  </Animated.View>
);

export default function AboutScreen() {
  const router = useRouter();
  const { colors, isDarkMode, toggleTheme } = useAppTheme();

  const logoScale = useSharedValue(1);
  const radarScale = useSharedValue(1);
  const radarOpacity = useSharedValue(0.5);

  useEffect(() => {
    logoScale.value = withRepeat(withTiming(1.05, { duration: 2000 }), -1, true);
    radarScale.value = withRepeat(withTiming(2, { duration: 2500 }), -1, false);
    radarOpacity.value = withRepeat(withSequence(withTiming(0.4, { duration: 0 }), withTiming(0, { duration: 2500 })), -1, false);
  }, []);

  const animatedLogoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
  }));

  const animatedRadarStyle = useAnimatedStyle(() => ({
    transform: [{ scale: radarScale.value }],
    opacity: radarOpacity.value,
  }));

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <LinearGradient 
        colors={isDarkMode ? ['#020617', '#0f172a', '#1e1b4b'] : ['#f0fdf4', '#f8fafc', '#ffffff']} 
        style={styles.background}
      >
        
        {/* Toggle Theme */}
        <TouchableOpacity 
          style={[styles.themeSwitcher, { backgroundColor: isDarkMode ? "rgba(30, 41, 59, 0.9)" : "#ffffff", borderColor: colors.emerald }]} 
          onPress={toggleTheme}
        >
          {isDarkMode ? <Sun size={20} color={colors.emerald} /> : <Moon size={20} color={colors.emerald} />}
        </TouchableOpacity>

        {/* Back Button */}
        <TouchableOpacity style={styles.backArrow} onPress={() => router.back()}>
          <ArrowRight size={28} color={colors.text} />
        </TouchableOpacity>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Logo & Radar Section */}
          <View style={styles.logoSection}>
            <Animated.View style={[styles.radarCircle, animatedRadarStyle, { borderColor: colors.emerald }]} />
            <Animated.View style={[styles.logoContainer, animatedLogoStyle]}>
              <LinearGradient colors={['#10b981', '#059669']} style={styles.logoCircle}>
                 <ShieldCheck size={50} color="#fff" />
              </LinearGradient>
            </Animated.View>
          </View>

          <Animated.View entering={FadeInUp.delay(200)} style={styles.titleContainer}>
            <Text style={[styles.title, { color: colors.text }]}>P.S.R.S</Text>
            <Text style={[styles.subtitle, { color: colors.emerald }]}>المنصة الذكية للاستجابة الوطنية</Text>
          </Animated.View>

          {/* Description Box */}
          <Animated.View entering={FadeInUp.delay(400)} style={[styles.descriptionContainer, { 
            backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.7)' : 'rgba(255, 255, 255, 0.9)',
            borderColor: colors.border
          }]}>
            <Text style={[styles.description, { color: colors.text }]}>
              نظام P.S.R.S هو الذراع الرقمي المتطور لخدمة المواطن الفلسطيني. صُمم ليكون حلقة الوصل الأسرع والأكثر أماناً بينك وبين الجهات المختصة.
              {"\n\n"}
              باستخدام تقنيات الذكاء الاصطناعي، يقوم النظام بتحليل بلاغك وتصنيفه وتحديد موقعك بدقة متناهية لضمان وصول المساعدة في وقت قياسي.
            </Text>
          </Animated.View>

          {/* Features Grid */}
          <View style={styles.featuresSection}>
            <Text style={[styles.featuresSectionTitle, { color: colors.text }]}>القدرات الاستراتيجية</Text>
            
            <FeatureCard icon={Zap} title="استجابة فائقة" desc="توجيه البلاغ فوراً لأقرب وحدة استجابة مختصة." delay={500} colors={colors} isDarkMode={isDarkMode} />
            <FeatureCard icon={Brain} title="ذكاء اصطناعي" desc="تحليل الصور وتصنيف البلاغات تلقائياً بدقة عالية." delay={600} colors={colors} isDarkMode={isDarkMode} />
            <FeatureCard icon={MapPin} title="تحديد جغرافي" desc="تحديد دقيق لمكان الحادث عبر الخرائط التفاعلية." delay={700} colors={colors} isDarkMode={isDarkMode} />
            <FeatureCard icon={Bell} title="إنذار مبكر" desc="تنبيهات فورية في حالات الطوارئ والكوارث الكبرى." delay={800} colors={colors} isDarkMode={isDarkMode} />
          </View>

          {/* Footer Button */}
          <Animated.View entering={FadeInUp.delay(1000)} style={styles.footer}>
            <TouchableOpacity onPress={() => router.back()} activeOpacity={0.8} style={styles.confirmBtn}>
              <LinearGradient colors={['#10b981', '#059669']} style={styles.btnGradient}>
                <Text style={styles.btnText}>فهمت الرسالة</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  scrollContent: { flexGrow: 1, padding: 25, paddingTop: 80, alignItems: 'center' },
  
  themeSwitcher: { position: "absolute", top: 50, right: 25, width: 48, height: 48, borderRadius: 15, borderWidth: 1.5, justifyContent: "center", alignItems: "center", zIndex: 1000 },
  backArrow: { position: "absolute", top: 55, left: 25, zIndex: 1000 },

  logoSection: { width: 180, height: 180, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  radarCircle: { position: 'absolute', width: 80, height: 80, borderRadius: 40, borderWidth: 2, backgroundColor: 'rgba(16, 185, 129, 0.05)' },
  logoContainer: { zIndex: 2 },
  logoCircle: { width: 100, height: 100, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 15, shadowColor: "#10b981", shadowRadius: 20, shadowOpacity: 0.4 },
  
  titleContainer: { alignItems: 'center', marginBottom: 30 },
  title: { fontSize: 44, fontWeight: '900', letterSpacing: 2 },
  subtitle: { fontSize: 15, fontWeight: '700', marginTop: 5 },
  
  descriptionContainer: { width: '100%', borderRadius: 24, padding: 25, borderWidth: 1, marginBottom: 35, elevation: 4, shadowOpacity: 0.05 },
  description: { fontSize: 16, lineHeight: 28, textAlign: 'right', fontWeight: '600' },
  
  featuresSection: { width: '100%', marginBottom: 30 },
  featuresSectionTitle: { fontSize: 20, fontWeight: '800', textAlign: 'right', marginBottom: 20, paddingRight: 5 },
  
  featureCard: { marginBottom: 15, borderRadius: 20, overflow: 'hidden', borderWidth: 1 },
  cardGradient: { flexDirection: 'row-reverse', padding: 20, alignItems: 'center' },
  iconWrapper: { width: 50, height: 50, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginLeft: 15 },
  featureTextContainer: { flex: 1 },
  featureTitle: { fontSize: 17, fontWeight: '800', textAlign: 'right', marginBottom: 4 },
  featureDesc: { fontSize: 13, textAlign: 'right', fontWeight: '600', opacity: 0.7 },
  
  footer: { width: '100%', marginBottom: 40 },
  confirmBtn: { height: 60, borderRadius: 20, overflow: 'hidden', elevation: 10, shadowColor: '#10b981' },
  btnGradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 18, fontWeight: '900' }
});