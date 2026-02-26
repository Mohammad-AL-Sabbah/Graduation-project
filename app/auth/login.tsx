import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, Stack } from 'expo-router';
// استيراد الأدوات المتقدمة للأنميشن المستمر
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

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const scale = useSharedValue(1);
  const opacityGlow = useSharedValue(0.4);

  useEffect(() => {
    scale.value = withRepeat(
      withTiming(1.1, { duration: 1000 }),
      -1, 
      true 
    );
    
    opacityGlow.value = withRepeat(
      withTiming(0.8, { duration: 2000 }),
      -1,
      true
    );
  }, []);

  // 2. ستايل النبض للشعار
  const animatedLogoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    shadowOpacity: opacityGlow.value,
  }));

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient colors={['#020617', '#0f172a', '#1e1b4b']} style={styles.background}>
        
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          
          {/* الشعار النابض */}
          <Animated.View 
            entering={ZoomIn.duration(1000).springify().damping(20)} 
            style={[styles.logoContainer, animatedLogoStyle]}
          >
            <View style={styles.logoCircle}>
               <Text style={styles.logoEmoji}>🛡️</Text>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(100).duration(900)}>
            <Text style={styles.title}>P.S.R.S</Text>
            <Text style={styles.subtitle}>تسجيل الدخول الى حسابك</Text>
          </Animated.View>

          <View style={styles.form}>
            
            {/* الحقول - دخول انسيابي ناعم جداً (بدون اهتزاز) */}
            <Animated.View 
              entering={FadeInDown.delay(100).duration(100).springify().damping(30).stiffness(50)}
              style={styles.inputContainer}
            >
              <Text style={styles.label}>البريد الالكتروني (Email Address) </Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="User@example.com"
                  placeholderTextColor="#475569"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            </Animated.View>

            <Animated.View 
              entering={FadeInDown.delay(100).duration(100).springify().damping(30).stiffness(50)}
              style={styles.inputContainer}
            >
              
              <Text style={styles.label}>كلمة المرور  (Password)</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="#475569"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />
              </View>
              <TouchableOpacity style={styles.forgetPassBtn}>
                <Text style={styles.forgetPassText}>نسيت كلمة المرور؟</Text>
              </TouchableOpacity>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(100).duration(800)}>
              <TouchableOpacity style={styles.loginBtn} activeOpacity={0.8}>
                <LinearGradient colors={['#4f46e5', '#312e81']} style={styles.btnGradient}>
                  <Text style={styles.btnText}>تسجيل الدخول</Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>

          </View>

          <Animated.View entering={FadeInDown.delay(500)} style={styles.footer}>
            <TouchableOpacity onPress={() => router.push('/auth/register')}>
              <Text style={styles.registerText}>ليس لديك حساب؟ <Text style={styles.registerLink}>انشاء حساب جديد</Text></Text>
            </TouchableOpacity>
          </Animated.View>

        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 30, alignItems: 'center' },
  logoContainer: { marginBottom: 30 },
  logoCircle: {
    width: 95, height: 95, borderRadius: 47.5, 
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#6366f1',
    // إعداد الظل للنبض
    shadowColor: "#6366f1", shadowOffset: { width: 0, height: 0 },
    shadowRadius: 15, elevation: 12,
  },
  logoEmoji: { fontSize: 48 },
  title: { color: '#fff', fontSize: 42, fontWeight: '900', textAlign: 'center', letterSpacing: 4 },
  subtitle: { color: '#818cf8', fontSize: 13, textAlign: 'center', marginBottom: 45, fontWeight: '700', opacity: 0.8 },
  form: { width: '100%' },
  inputContainer: { marginBottom: 20 },
  label: { color: '#94a3b8', fontSize: 12, marginBottom: 8, textAlign: 'right', fontWeight: '700' },
  inputWrapper: {
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    borderRadius: 12,
    borderWidth: 1, borderColor: 'rgba(99, 102, 241, 0.2)',
  },
  input: { height: 58, paddingHorizontal: 20, color: '#fff', textAlign: 'right', fontSize: 16 },
  forgetPassBtn: { alignSelf: 'flex-end', marginTop: 10 },
  forgetPassText: { color: '#fb7185', fontSize: 12, fontWeight: '600' },
  loginBtn: { height: 62, borderRadius: 16, overflow: 'hidden', marginTop: 15 },
  btnGradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 18, fontWeight: 'bold', letterSpacing: 1 },
  footer: { marginTop: 40 },
  registerText: { color: '#94a3b8', fontSize: 14 },
  registerLink: { color: '#6366f1', fontWeight: 'bold' }
});