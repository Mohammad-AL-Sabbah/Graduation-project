import { Tabs } from 'expo-router';
import React from 'react';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        // إخفاء الشريط السفلي تماماً
        tabBarStyle: { display: 'none' }, 
        // إخفاء العنوان في الأعلى
        headerShown: false,
        // تفعيل الألوان المتوافقة مع النظام (اختياري لأننا أخفينا الشريط)
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
      }}>
      
      {/* الشاشة الرئيسية */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
        }}
      />

      {/* شاشة الاستكشاف */}
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
        }}
      />
    </Tabs>
  );
}