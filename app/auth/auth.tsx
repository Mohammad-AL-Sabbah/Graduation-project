import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Stack } from 'expo-router';
export default function AuthScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
  }, []);

  return (
    <LinearGradient colors={['#020617', '#0f172a', '#1e1b4b']} style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <Text style={styles.title}>مرحباً بك 👋<Text style={{color: '#6366f1'}}></Text></Text>
        <Text style={styles.subtitle}>اختر وسيلة الدخول للمتابعة</Text>

        <View style={styles.buttonGroup}>
          <TouchableOpacity style={styles.loginBtn} onPress={()=> router.push('/auth/login')}>
            <LinearGradient colors={['#4f46e5', '#3730a3']} style={styles.btnGradient}>
              <Text style={styles.btnText}>تسجيل الدخول</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.registerBtn} onPress={()=> router.push('/auth/register')}>
            <Text style={styles.registerText}>إنشاء حساب جديد</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>رجوع</Text>
        </TouchableOpacity>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 30 },
  content: { alignItems: 'center' },
  title: { color: '#fff', fontSize: 32, fontWeight: 'bold', marginBottom: 10 },
  subtitle: { color: '#94a3b8', fontSize: 16, marginBottom: 50 },
  buttonGroup: { width: '100%', gap: 20 },
  loginBtn: { height: 60, borderRadius: 15, overflow: 'hidden' },
  btnGradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  registerBtn: { height: 60, borderRadius: 15, borderWidth: 1, borderColor: '#4f46e5', justifyContent: 'center', alignItems: 'center' },
  registerText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  backBtn: { marginTop: 30 },
  backText: { color: '#f2f5fa',backgroundColor: '#ff0004', fontSize: 15 ,fontWeight:'bold', borderWidth:1, borderColor:'#ff0000', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 10 }
});