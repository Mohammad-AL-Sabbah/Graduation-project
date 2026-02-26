import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { View } from 'react-native'; // أضفنا View للضرورة

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    // نغلف التطبيق بـ View بخلفية غامقة لمنع أي تسرب للون الأبيض
    <View style={{ flex: 1, backgroundColor: '#020617' }}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
<Stack
  screenOptions={{
    headerShown: false,
    contentStyle: { backgroundColor: '#020617' },
    
    // --- أنميشن "القلب" السينمائي ---
    animation: 'flip',             // يعطي انطباعاً ثلاثي الأبعاد (3D) في الدخول والخروج
    animationDuration: 500,        // نحتاج وقت أطول قليلاً هنا لتظهر تفاصيل الحركة
    
    gestureEnabled: true,
    fullScreenGestureEnabled: true,
  }}
>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="auth" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        
        {/* جعل شريط الساعة والبطارية باللون الفاتح دائماً ليناسب الخلفية السوداء */}
        <StatusBar style="light" />
      </ThemeProvider>
    </View>
  );
}