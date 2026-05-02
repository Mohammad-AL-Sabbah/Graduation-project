import { BackHandler } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { useEffect } from 'react';

export const useBackHandler = () => {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const backAction = () => {
      // لو كنت في الصفحة الرئيسية، أخرج من التطبيق
      if (pathname === '/HomeScreen' || pathname === '/') {
        BackHandler.exitApp();
        return true;
      }
      // غير كده، ارجع للشاشة السابقة
      router.back();
      return true;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove();
  }, [pathname]);
};