import { Stack, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { View } from "react-native";
import "react-native-reanimated";
import { ThemeProviderCustom, useAppTheme } from "../ThemeContext";
import eventEmitter from "../app/utils/eventEmitter";

export const unstable_settings = {
  anchor: "(tabs)",
};

function LayoutContent() {
  const { isDarkMode, colors } = useAppTheme();

  // ✅ الاستماع لحدث تسجيل الخروج عند حظر المستخدم
  useEffect(() => {
    const handleLogout = () => {
      router.replace("/auth/login");
    };

    eventEmitter.on("LOGOUT", handleLogout);

    return () => {
      eventEmitter.off("LOGOUT", handleLogout);
    };
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: "default",
          gestureEnabled: true,
          fullScreenGestureEnabled: true,
        }}
        initialRouteName="(tabs)"
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen
          name="modal"
          options={{ presentation: "modal", title: "Modal" }}
        />
      </Stack>

      <StatusBar style={isDarkMode ? "light" : "dark"} />
    </View>
  );
}

export default function RootLayout() {
  return (
    <ThemeProviderCustom>
      <LayoutContent />
    </ThemeProviderCustom>
  );
}
