import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp, FadeInRight } from 'react-native-reanimated';
import { useAppTheme } from '../../ThemeContext'; 

const { width } = Dimensions.get('window');

const StatCard = ({ title, value, color, delay, colors, isDarkMode }) => (
  <Animated.View 
    entering={FadeInDown.delay(delay).springify()} 
    style={[
      styles.statCard, 
      { 
        backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.7)' : '#ffffff',
        borderColor: isDarkMode ? 'rgba(99, 102, 241, 0.2)' : 'rgba(16, 185, 129, 0.1)',
        elevation: isDarkMode ? 0 : 3,
        shadowOpacity: isDarkMode ? 0 : 0.1,
      }
    ]}
  >
    <Text style={[styles.statValue, { color }]}>{value}</Text>
    <Text style={[styles.statTitle, { color: isDarkMode ? '#94a3b8' : '#64748b' }]}>{title}</Text>
  </Animated.View>
);

export default function DashboardScreen() {
  const { colors, isDarkMode } = useAppTheme();
  const isGuest = true;

  return (
    <View style={[styles.mainContainer, { backgroundColor: colors.background }]}>
      <LinearGradient 
        colors={isDarkMode ? ['#020617', '#0f172a', '#1e1b4b'] : ['#f0fdf4', '#f8fafc', '#ffffff']} 
        style={styles.background}
      >
        
        <View style={styles.header}>
          <View>
            <Text style={[styles.welcomeText, { color: isDarkMode ? '#94a3b8' : '#059669' }]}>مركز الابلاغات الرقمي</Text>
            <Text style={[styles.systemName, { color: colors.text }]}>نظام P.S.R.S الفلسطيني</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(16, 185, 129, 0.1)' }]}>
            <View style={[styles.statusDot, { backgroundColor: isGuest ? '#f59e0b' : '#10b981' }]} />
            <Text style={[styles.statusText, { color: colors.text }]}>{isGuest ? 'دخول ضيف' : 'مواطن موثق'}</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {isGuest && (
            <Animated.View entering={FadeInUp.duration(800)} style={styles.guestWarning}>
              <LinearGradient colors={['#7f1d1d', '#450a0a']} style={styles.warningGradient}>
                <View style={styles.warningContent}>
                  <Text style={styles.warningTitle}>⚠️ تنبيه الصلاحيات</Text>
                  <Text style={styles.warningText}>
                    أنت مسجل حالياً كضيف. لا يمكنك إرسال البلاغات الرسمية أو طلب النجدة إلا بعد تسجيل الدخول
                  </Text>
                </View>
              </LinearGradient>
            </Animated.View>
          )}

          <View style={styles.statsGrid}>
            <StatCard title="بلاغات نشطة" value="5" color="#6366f1" delay={200} isDarkMode={isDarkMode} />
            <StatCard title="بلاغات تم معالجتها" value="12" color="#10b981" delay={400} isDarkMode={isDarkMode} />
            <StatCard title="بلاغاتك السابقة" value="3" color={isDarkMode ? "#e8f43f" : "#854d0e"} delay={600} isDarkMode={isDarkMode} />
            <StatCard title="بلاغات تم رفضها" value="3" color="#f43f5e" delay={600} isDarkMode={isDarkMode} />
            <StatCard title="بلاغات تم إلغائها" value="1" color="#0180e1" delay={600} isDarkMode={isDarkMode} />
            <StatCard title="بلاغات الطوارئ" value="3" color="#474af8" delay={600} isDarkMode={isDarkMode} />
          </View>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>إجراءات سريعة</Text>
          
          <View style={styles.actionRow}>
            <TouchableOpacity 
              style={[styles.mainActionBtn, isGuest && styles.disabledBtn]} 
              disabled={isGuest}
            >
              <LinearGradient colors={['#ef4444', '#7f1d1d']} style={styles.actionInner}>
                <Text style={styles.actionEmoji}>🚨</Text>
                <Text style={styles.actionBtnText}>طلب نجدة</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.mainActionBtn, isGuest && styles.disabledBtn]} 
              disabled={isGuest}
            >
              <LinearGradient colors={['#3b82f6', '#1e3a8a']} style={styles.actionInner}>
                <Text style={styles.actionEmoji}>🏛️</Text>
                <Text style={styles.actionBtnText}>بلاغ بلدية</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>سجل البلاغات المقدمة</Text>
          
          <Animated.View 
            entering={FadeInRight.delay(800)} 
            style={[
              styles.historyCard, 
              { 
                backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.9)' : '#ffffff',
                borderColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                elevation: isDarkMode ? 0 : 4,
              }
            ]}
          >
            <View style={styles.historyItem}>
              <View style={styles.historyStatus}>
                <Text style={styles.statusLabel}>قيد المعالجة</Text>
              </View>
              <View style={styles.historyInfo}>
                <Text style={[styles.historyTitle, { color: colors.text }]}>إنارة شارع معطلة</Text>
                <Text style={[styles.historyDate, { color: isDarkMode ? '#64748b' : '#94a3b8' }]}>منذ ساعتين - نابلس، الدوار</Text>
              </View>
              <Text style={styles.historyIcon}>⚡</Text>
            </View>
            
            <View style={[styles.separator, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]} />
            
            <View style={styles.historyItem}>
              <View style={[styles.historyStatus, { backgroundColor: '#10b981' }]}>
                <Text style={styles.statusLabel}>مكتمل</Text>
              </View>
              <View style={styles.historyInfo}>
                <Text style={[styles.historyTitle, { color: colors.text }]}>تراكم نفايات</Text>
                <Text style={[styles.historyDate, { color: isDarkMode ? '#64748b' : '#94a3b8' }]}>أمس - حي الرفيديا</Text>
              </View>
              <Text style={styles.historyIcon}>🗑️</Text>
            </View>
          </Animated.View>

        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1 },
  background: { flex: 1 },
  header: { flexDirection: 'row-reverse', justifyContent: 'space-between', paddingHorizontal: 25, paddingTop: 60},
  welcomeText: { fontSize: 14, fontWeight: '600' },
  systemName: { fontSize: 22, fontWeight: '900', letterSpacing: 1 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20 },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  statusText: { fontSize: 10, fontWeight: 'bold' },
  
  scrollContent: { paddingHorizontal: 25, paddingBottom: 40, paddingTop: 20 },
  
  guestWarning: { borderRadius: 16, overflow: 'hidden', marginBottom: 25, elevation: 15 },
  warningGradient: { padding: 15 },
  warningTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', textAlign: 'right', marginBottom: 5 },
  warningText: { color: '#fca5a5', fontSize: 12, textAlign: 'right', lineHeight: 18, fontWeight: '600' },

  statsGrid: { flexDirection: 'row-reverse', flexWrap: 'wrap', justifyContent: 'space-between', gap: 8, marginBottom: 30 },
  statCard: { width: (width - 70) / 3, paddingVertical: 15, borderRadius: 15, alignItems: 'center', borderWidth: 1 },
  statValue: { fontSize: 20, fontWeight: '900', marginBottom: 2 },
  statTitle: { fontSize: 9, fontWeight: 'bold', textAlign: 'center' },

  sectionTitle: { fontSize: 18, fontWeight: 'bold', textAlign: 'right', marginBottom: 15 },
  
  actionRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', gap: 12, marginBottom: 30 },
  mainActionBtn: { flex: 1, height: 110, borderRadius: 20, overflow: 'hidden' },
  actionInner: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  actionEmoji: { fontSize: 32, marginBottom: 8 },
  actionBtnText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  disabledBtn: { opacity: 0.4 },

  historyCard: { borderRadius: 20, padding: 15, borderWidth: 1 },
  historyItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  historyStatus: { backgroundColor: '#6366f1', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusLabel: { color: '#fff', fontSize: 9, fontWeight: 'bold' },
  historyInfo: { flex: 1, marginRight: 15, alignItems: 'flex-end' },
  historyTitle: { fontSize: 14, fontWeight: 'bold' },
  historyDate: { fontSize: 11, marginTop: 2 },
  historyIcon: { fontSize: 20 },
  separator: { height: 1, marginVertical: 10 }
});