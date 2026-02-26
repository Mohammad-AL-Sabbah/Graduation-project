import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, Stack } from 'expo-router';

export default function RegisterScreen() {
  const router = useRouter();
  
  // تعريف الحالات (States) لجميع الحقول
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={{ flex: 1 }}>
        <Stack.Screen options={{ headerShown: false }} />
        
        <LinearGradient colors={['#020617', '#0f172a', '#1e1b4b']} style={styles.background}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
            style={{ flex: 1 }}
          >
            <ScrollView 
              contentContainerStyle={styles.scrollContent} 
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              
              <View style={styles.headerSection}>
                <Text style={styles.title}>إنشاء حساب</Text>
                <Text style={styles.subtitle}>انضم إلى التطبيق الفلسطيني للبلاغات الذكية</Text>
              </View>

              <View style={styles.form}>
                {/* حقل الاسم الكامل */}
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>الاسم الكامل</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="الاسم الرباعي"
                    placeholderTextColor="#475569"
                    value={fullName}
                    onChangeText={setFullName}
                  />
                </View>

                {/* حقل البريد الإلكتروني */}
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>البريد الإلكتروني</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="example@mail.com"
                    placeholderTextColor="#475569"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                  />
                </View>

                {/* حقل رقم الهاتف */}
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>رقم الهاتف</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="05XXXXXXXX"
                    placeholderTextColor="#475569"
                    keyboardType="phone-pad"
                    value={phone}
                    onChangeText={setPhone}
                  />
                </View>

                {/* حقل كلمة المرور */}
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>كلمة المرور</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="********"
                    placeholderTextColor="#475569"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                  />
                </View>

                <TouchableOpacity style={styles.registerBtn}>
                  <LinearGradient colors={['#4f46e5', '#3730a3']} style={styles.btnGradient}>
                    <Text style={styles.btnText}>إنشاء الحساب</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>

              <TouchableOpacity onPress={() => router.push('/auth/login')} style={styles.footerLink}>
                <Text style={styles.footerText}>
                  لديك حساب بالفعل؟ <Text style={styles.linkBold}>تسجيل الدخول</Text>
                </Text>
              </TouchableOpacity>

              {/* زر الرجوع الأحمر المميز الخاص بك */}
              <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                <Text style={styles.backBtnText}>رجوع</Text>
              </TouchableOpacity>

            </ScrollView>
          </KeyboardAvoidingView>
        </LinearGradient>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 30, paddingBottom: 50 },
  headerSection: { marginBottom: 30, alignItems: 'flex-end' },
  title: { color: '#fff', fontSize: 30, fontWeight: 'bold' },
  subtitle: { color: '#94a3b8', fontSize: 14, marginTop: 8, textAlign: 'right' },
  form: { width: '100%' },
  inputContainer: { marginBottom: 18, zIndex: 10 },
  label: { color: '#818cf8', fontSize: 13, fontWeight: '600', marginBottom: 8, textAlign: 'right' },
  input: {
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
    borderRadius: 12,
    height: 55,
    paddingHorizontal: 15,
    color: '#fff',
    textAlign: 'right',
  },
  registerBtn: { height: 60, borderRadius: 15, overflow: 'hidden', marginTop: 10, elevation: 5 },
  btnGradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  footerLink: { marginTop: 25, alignItems: 'center' },
  footerText: { color: '#94a3b8', fontSize: 14 },
  linkBold: { color: '#fff', fontWeight: 'bold' },
  
  // تنسيق زر الرجوع الأحمر كما في صورتك
  backBtn: { 
    marginTop: 30, 
    backgroundColor: '#ff0000', 
    paddingVertical: 10, 
    paddingHorizontal: 40, 
    borderRadius: 10, 
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: '#ff4d4d'
  },
  backBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});