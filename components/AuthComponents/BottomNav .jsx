import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, usePathname } from "expo-router";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const PSRS_COLORS = {
  primary: "#1a5c32",
  surface: "#FFFFFF",
  border: "#E5E7EB",
};

const navItems = [
  ,
  {
    name: "بلاغاتي",
    icon: "file-document-edit-outline",
    route: "../../pages/MyReports",
  },
  {
    name: "طبي",
    icon: "hospital-box-outline",
    route: "../../pages/MedicalProfile",
  },
  { name: "إشعارات", icon: "bell-outline", route: "../../pages/Notifications" },
  {
    name: "بروفايل",
    icon: "account-circle-outline",
    route: "../../pages/Profile",
  },
  { name: "الرئيسية", icon: "home-variant", route: "../../pages/HomeScreen" },
];

const BottomNav = () => {
  const pathname = usePathname();

  return (
    <View style={styles.bottomNav}>
      {navItems.map((item) => (
        <TouchableOpacity
          key={item.route}
          style={styles.navItem}
          onPress={() => router.push(item.route)}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name={item.icon}
            size={22}
            color={pathname === item.route ? PSRS_COLORS.primary : "#94a3b8"}
          />
          <Text
            style={[
              styles.navLabel,
              {
                color:
                  pathname === item.route ? PSRS_COLORS.primary : "#94a3b8",
              },
            ]}
          >
            {item.name}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  bottomNav: {
    width: "100%",
    height: Platform.OS === "ios" ? 85 : 70, // ✅ ارتفاع مختلف حسب النظام
    flexDirection: "row",
    backgroundColor: PSRS_COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: PSRS_COLORS.border,
    paddingBottom: Platform.OS === "ios" ? 20 : 10, // ✅ مساحة Safe Area في iOS
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  navItem: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 10,
  },
  navLabel: {
    fontSize: 10,
    marginTop: 4,
    fontWeight: "600",
  },
});

export default BottomNav;
