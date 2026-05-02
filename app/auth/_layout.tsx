import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    // هنا نحدد الخيارات لكل الصفحات داخل مجلد auth مرة واحدة
    <Stack
      screenOptions={{
        headerShown: false, // إخفاء الهيدر تماماً لجميع صفحات المجلد
        animation: 'fade',  // جعل الانتقال سلساً لمنع الانهيار في الأندرويد
      }}
    >
      {/* تأكد من أن الأسماء تطابق أسماء ملفاتك داخل المجلد */}
      <Stack.Screen name="indexAuth" /> 
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="guestscreen" />
    </Stack>
  );
}