import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  BackHandler,
  Dimensions,
  Image,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import BottomNav from "../../components/AuthComponents/BottomNav ";
import api from "../API/ApiAuthToken";

const { width } = Dimensions.get("window");

const PSRS_COLORS = {
  primary: "#1a5c32",
  primaryDark: "#0f3d20",
  primaryLight: "#216d3c",
  accent: "#10b981",
  surface: "#FFFFFF",
  background: "#F9FAFB",
  textMain: "#111827",
  textSub: "#6B7280",
  textMuted: "#9CA3AF",
  border: "#E5E7EB",
  emergency: "#DC2626",
  warning: "#F59E0B",
  info: "#3B82F6",
};

const BASE_URL = "https://psrs-palestine.runasp.net";

const ProfileScreen = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: "",
    phoneNumber: "",
    city: "",
  });
  const [newImage, setNewImage] = useState(null);

  // ✅ معالج زر الرجوع في Android
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        router.replace("/HomeScreen");
        return true;
      },
    );
    return () => backHandler.remove();
  }, []);

  useEffect(() => {
    loadUserData();
    fetchProfileFromAPI();
  }, []);

  // ✅ جلب بيانات البروفايل من الـ API مباشرة
  const fetchProfileFromAPI = async () => {
    try {
      const response = await api.get("/Citizen/display-profile");
      if (response.data) {
        const profileData = response.data;

        const userData = {
          username: profileData.fullName,
          email: profileData.email,
          phone: profileData.phoneNumber,
          city: profileData.city,
          profileImage: profileData.profilePictureUrl,
          totalReports: profileData.totalReports || 0,
          completedReports: profileData.completedReports || 0,
          pendingReports: profileData.pendingReports || 0,
        };

        setUser(userData);
        // ✅ تحديث editForm بالبيانات الجديدة
        setEditForm({
          fullName: profileData.fullName || "",
          phoneNumber: profileData.phoneNumber || "",
          city: profileData.city || "",
        });

        await AsyncStorage.setItem("user", JSON.stringify(userData));
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching profile:", error);
      setLoading(false);
    }
  };

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem("user");
      if (userData) {
        const parsed = JSON.parse(userData);
        setUser(parsed);
        setEditForm({
          fullName: parsed.username || "",
          phoneNumber: parsed.phone || "",
          city: parsed.city || "",
        });
      }
    } catch (error) {
      console.error("Error loading user:", error);
    }
  };

  const handleImagePick = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        Alert.alert("تنبيه", "نحتاج إلى إذن الوصول للصور");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setNewImage(result.assets[0].uri);
        const newUser = { ...user, profileImage: result.assets[0].uri };
        setUser(newUser);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("خطأ", "فشل اختيار الصورة");
    }
  };

  const handleUpdateProfile = async () => {
    setUpdating(true);
    try {
      const formData = new FormData();
      formData.append("FullName", editForm.fullName);
      formData.append("PhoneNumber", editForm.phoneNumber);
      formData.append("City", editForm.city);
      formData.append("Email", user?.email || ""); // ✅ أضف Email

      // ✅ تحويل الصورة إلى File
      if (newImage) {
        const filename = newImage.split("/").pop() || "photo.jpg";
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : "image/jpeg";

        formData.append("NewProfilePicture", {
          uri: newImage,
          name: filename,
          type: type,
        });
      }

      const response = await api.put("/Citizen/update-profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data?.success) {
        // ✅ تحديث البيانات المحلية
        const updatedUser = {
          ...user,
          username: editForm.fullName,
          phone: editForm.phoneNumber,
          city: editForm.city,
        };
        if (newImage) {
          updatedUser.profileImage = newImage;
        }
        setUser(updatedUser);
        await AsyncStorage.setItem("user", JSON.stringify(updatedUser));

        Alert.alert("نجاح", "تم تحديث الملف الشخصي بنجاح");
        setIsEditing(false);
        setNewImage(null);
      } else {
        Alert.alert("خطأ", response.data?.message || "فشل تحديث الملف الشخصي");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert(
        "خطأ",
        error.response?.data?.message || "فشل تحديث الملف الشخصي",
      );
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      "تسجيل الخروج",
      "هل أنت متأكد من تسجيل الخروج؟",
      [
        { text: "إلغاء", style: "cancel" },
        {
          text: "تسجيل الخروج",
          style: "destructive",
          onPress: async () => {
            try {
              await api.post("/Auth/Account/logout");

              await AsyncStorage.multiRemove([
                "accessToken",
                "refreshToken",
                "user",
                "userToken",
                "profileImage",
              ]);
              router.replace("/auth/login");
            } catch (error) {
              console.error("Logout error:", error);
              await AsyncStorage.multiRemove([
                "accessToken",
                "refreshToken",
                "user",
                "userToken",
                "profileImage",
              ]);
              router.replace("/auth/login");
            }
          },
        },
      ],
      { cancelable: true },
    );
  };

  if (loading) return <ProfileSkeleton />;

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={PSRS_COLORS.primary}
      />

      <LinearGradient
        colors={[PSRS_COLORS.primary, PSRS_COLORS.primaryLight]}
        style={styles.headerGradient}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.replace("/HomeScreen")}
          >
            <Feather name="arrow-right" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>الملف الشخصي</Text>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => router.push("/settings")}
          >
            <Feather name="settings" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <TouchableOpacity
            style={styles.imageContainer}
            onPress={handleImagePick}
            activeOpacity={0.8}
          >
            {user?.profileImage ? (
              <Image
                source={{
                  uri: user.profileImage.startsWith("http")
                    ? user.profileImage
                    : `${BASE_URL}${user.profileImage}`,
                }}
                style={styles.profileImage}
              />
            ) : (
              <View style={styles.placeholderImage}>
                <MaterialCommunityIcons
                  name="account"
                  size={60}
                  color={PSRS_COLORS.primary}
                />
              </View>
            )}
            <View style={styles.editImageBadge}>
              <Feather name="camera" size={14} color="#fff" />
            </View>
          </TouchableOpacity>

          {/* عرض أو تعديل البيانات */}
          {isEditing ? (
            <>
              <TextInput
                style={styles.editInput}
                value={editForm.fullName}
                onChangeText={(text) =>
                  setEditForm({ ...editForm, fullName: text })
                }
                placeholder="الاسم الكامل"
                placeholderTextColor={PSRS_COLORS.textMuted}
              />
              <TextInput
                style={styles.editInput}
                value={editForm.phoneNumber}
                onChangeText={(text) =>
                  setEditForm({ ...editForm, phoneNumber: text })
                }
                placeholder="رقم الهاتف"
                placeholderTextColor={PSRS_COLORS.textMuted}
                keyboardType="phone-pad"
              />
              <TextInput
                style={styles.editInput}
                value={editForm.city}
                onChangeText={(text) =>
                  setEditForm({ ...editForm, city: text })
                }
                placeholder="المدينة"
                placeholderTextColor={PSRS_COLORS.textMuted}
              />
            </>
          ) : (
            <>
              <Text style={styles.userName}>
                {user?.username || "اسم المستخدم"}
              </Text>
              <Text style={styles.userRole}>مواطن</Text>

              <View style={styles.contactRow}>
                <View style={styles.contactItem}>
                  <Feather name="mail" size={14} color={PSRS_COLORS.textSub} />
                  <Text style={styles.contactText}>
                    {user?.email || "email@example.com"}
                  </Text>
                </View>
              </View>

              <View style={styles.contactRow}>
                <View style={styles.contactItem}>
                  <Feather name="phone" size={14} color={PSRS_COLORS.textSub} />
                  <Text style={styles.contactText}>
                    {user?.phone || "+970 59 123 4567"}
                  </Text>
                </View>
              </View>
            </>
          )}

          {/* أزرار التحكم */}
          {isEditing ? (
            <View style={styles.editButtonsRow}>
              <TouchableOpacity
                style={[styles.editButton, styles.cancelButton]}
                onPress={() => {
                  setIsEditing(false);
                  setNewImage(null);
                  setEditForm({
                    fullName: user?.username || "",
                    phoneNumber: user?.phone || "",
                    city: user?.city || "",
                  });
                }}
              >
                <Text style={styles.cancelButtonText}>إلغاء</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.editButton, styles.saveButton]}
                onPress={handleUpdateProfile}
                disabled={updating}
              >
                <Text style={styles.saveButtonText}>
                  {updating ? "جاري الحفظ..." : "حفظ"}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setIsEditing(true)}
            >
              <Feather name="edit-2" size={16} color="#fff" />
              <Text style={styles.editButtonText}>تعديل الملف الشخصي</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Location Card */}
        {!isEditing && (
          <View style={styles.infoCard}>
            <View style={styles.cardHeader}>
              <Ionicons
                name="location-sharp"
                size={18}
                color={PSRS_COLORS.primary}
              />
              <Text style={styles.cardTitle}>الموقع</Text>
            </View>
            <View style={styles.locationContent}>
              <Text style={styles.cityName}>{user?.city || "نابلس"}</Text>
              <Text style={styles.countryName}>فلسطين</Text>
            </View>
          </View>
        )}

        {/* Statistics Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={styles.statIconCircle}>
              <MaterialCommunityIcons
                name="file-document-outline"
                size={24}
                color={PSRS_COLORS.primary}
              />
            </View>
            <Text style={styles.statNumber}>{user?.totalReports || "0"}</Text>
            <Text style={styles.statLabel}>إجمالي البلاغات</Text>
          </View>

          <View style={styles.statCard}>
            <View
              style={[styles.statIconCircle, { backgroundColor: "#DBEAFE" }]}
            >
              <MaterialCommunityIcons
                name="check-circle-outline"
                size={24}
                color="#2563EB"
              />
            </View>
            <Text style={styles.statNumber}>
              {user?.completedReports || "0"}
            </Text>
            <Text style={styles.statLabel}>بلاغات منجزة</Text>
          </View>

          <View style={styles.statCard}>
            <View
              style={[styles.statIconCircle, { backgroundColor: "#FEF3C7" }]}
            >
              <MaterialCommunityIcons
                name="clock-outline"
                size={24}
                color="#D97706"
              />
            </View>
            <Text style={styles.statNumber}>{user?.pendingReports || "0"}</Text>
            <Text style={styles.statLabel}>قيد المعالجة</Text>
          </View>
        </View>

        {/* Quick Links */}
        <View style={styles.linksSection}>
          <Text style={styles.sectionTitle}>روابط سريعة</Text>

          <TouchableOpacity
            style={styles.linkCard}
            onPress={() => router.push("/medical-profile")}
          >
            <View style={styles.linkLeft}>
              <View
                style={[styles.linkIconCircle, { backgroundColor: "#DBEAFE" }]}
              >
                <MaterialCommunityIcons
                  name="medical-bag"
                  size={22}
                  color="#2563EB"
                />
              </View>
              <View>
                <Text style={styles.linkTitle}>الملف الطبي</Text>
                <Text style={styles.linkSubtitle}>معلوماتك الصحية والطبية</Text>
              </View>
            </View>
            <Feather
              name="chevron-left"
              size={20}
              color={PSRS_COLORS.textMuted}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkCard}
            onPress={() => router.push("/my-reports")}
          >
            <View style={styles.linkLeft}>
              <View
                style={[styles.linkIconCircle, { backgroundColor: "#DCFCE7" }]}
              >
                <MaterialCommunityIcons
                  name="file-document-edit-outline"
                  size={22}
                  color={PSRS_COLORS.primary}
                />
              </View>
              <View>
                <Text style={styles.linkTitle}>بلاغاتي</Text>
                <Text style={styles.linkSubtitle}>
                  عرض جميع البلاغات المرسلة
                </Text>
              </View>
            </View>
            <Feather
              name="chevron-left"
              size={20}
              color={PSRS_COLORS.textMuted}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkCard}
            onPress={() => router.push("/notifications")}
          >
            <View style={styles.linkLeft}>
              <View
                style={[styles.linkIconCircle, { backgroundColor: "#FEF3C7" }]}
              >
                <Feather name="bell" size={20} color="#D97706" />
              </View>
              <View>
                <Text style={styles.linkTitle}>الإشعارات</Text>
                <Text style={styles.linkSubtitle}>تنبيهات وإشعارات مهمة</Text>
              </View>
            </View>
            <View style={styles.notifBadge}>
              <Text style={styles.notifBadgeText}>3</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkCard}
            onPress={() => router.push("/settings")}
          >
            <View style={styles.linkLeft}>
              <View
                style={[styles.linkIconCircle, { backgroundColor: "#F3F4F6" }]}
              >
                <Feather name="settings" size={20} color="#6B7280" />
              </View>
              <View>
                <Text style={styles.linkTitle}>الإعدادات</Text>
                <Text style={styles.linkSubtitle}>تخصيص التطبيق والخصوصية</Text>
              </View>
            </View>
            <Feather
              name="chevron-left"
              size={20}
              color={PSRS_COLORS.textMuted}
            />
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.appInfoCard}>
          <MaterialCommunityIcons
            name="shield-check-outline"
            size={24}
            color={PSRS_COLORS.primary}
          />
          <View style={styles.appInfoText}>
            <Text style={styles.appInfoTitle}>نظام خدمات المواطنين</Text>
            <Text style={styles.appInfoSubtitle}>الإصدار 1.0.0 • 2024</Text>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Feather name="log-out" size={18} color={PSRS_COLORS.emergency} />
          <Text style={styles.logoutText}>تسجيل الخروج</Text>
        </TouchableOpacity>

        <View style={{ height: 20 }} />
      </ScrollView>

      <BottomNav />
    </View>
  );
};

const ProfileSkeleton = () => (
  <View style={styles.container}>
    <View style={styles.skeletonHeader} />
    <View style={styles.skeletonContent}>
      <View style={styles.skeletonCircle} />
      <View style={styles.skeletonLine} />
      <View style={styles.skeletonLineMedium} />
      <View style={{ height: 20 }} />
      <View style={styles.skeletonCard} />
      <View style={styles.skeletonCard} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PSRS_COLORS.background,
  },
  headerGradient: {
    paddingTop: Platform.OS === "ios" ? 50 : 35,
    paddingBottom: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginTop: 10,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  settingsButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 20,
  },
  profileCard: {
    backgroundColor: PSRS_COLORS.surface,
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    marginBottom: 16,
  },
  imageContainer: {
    position: "relative",
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: PSRS_COLORS.primary,
  },
  placeholderImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#DCFCE7",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: PSRS_COLORS.primary,
  },
  editImageBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: PSRS_COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: PSRS_COLORS.surface,
  },
  userName: {
    fontSize: 22,
    fontWeight: "800",
    color: PSRS_COLORS.textMain,
    marginBottom: 4,
  },
  userRole: {
    fontSize: 13,
    color: PSRS_COLORS.textSub,
    fontWeight: "600",
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 16,
  },
  contactRow: {
    width: "100%",
    marginBottom: 8,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  contactText: {
    fontSize: 13,
    color: PSRS_COLORS.textSub,
    fontWeight: "500",
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: PSRS_COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: 16,
    gap: 8,
    elevation: 2,
  },
  editButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  editButtonsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
    width: "100%",
  },
  editInput: {
    width: "100%",
    backgroundColor: PSRS_COLORS.surface,
    borderWidth: 1,
    borderColor: PSRS_COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: PSRS_COLORS.textMain,
    marginTop: 8,
    textAlign: "right",
  },
  cancelButton: {
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FEE2E2",
    flex: 1,
    justifyContent: "center",
  },
  cancelButtonText: {
    color: PSRS_COLORS.emergency,
    fontSize: 14,
    fontWeight: "700",
  },
  saveButton: {
    backgroundColor: PSRS_COLORS.primary,
    flex: 1,
    justifyContent: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  infoCard: {
    backgroundColor: PSRS_COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 1,
    borderWidth: 1,
    borderColor: PSRS_COLORS.border,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: PSRS_COLORS.textMain,
  },
  locationContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cityName: {
    fontSize: 16,
    fontWeight: "700",
    color: PSRS_COLORS.textMain,
  },
  countryName: {
    fontSize: 13,
    color: PSRS_COLORS.textSub,
    fontWeight: "600",
  },
  statsContainer: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: PSRS_COLORS.surface,
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
    elevation: 1,
    borderWidth: 1,
    borderColor: PSRS_COLORS.border,
  },
  statIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#DCFCE7",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "800",
    color: PSRS_COLORS.textMain,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: PSRS_COLORS.textSub,
    fontWeight: "600",
    textAlign: "center",
  },
  linksSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: PSRS_COLORS.textMain,
    marginBottom: 12,
    textAlign: "right",
  },
  linkCard: {
    backgroundColor: PSRS_COLORS.surface,
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    elevation: 1,
    borderWidth: 1,
    borderColor: PSRS_COLORS.border,
  },
  linkLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  linkIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  linkTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: PSRS_COLORS.textMain,
    marginBottom: 2,
  },
  linkSubtitle: {
    fontSize: 11,
    color: PSRS_COLORS.textSub,
    fontWeight: "500",
  },
  notifBadge: {
    backgroundColor: PSRS_COLORS.emergency,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    minWidth: 24,
    alignItems: "center",
  },
  notifBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },
  appInfoCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 14,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: PSRS_COLORS.border,
  },
  appInfoText: {
    flex: 1,
  },
  appInfoTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: PSRS_COLORS.textMain,
    marginBottom: 2,
  },
  appInfoSubtitle: {
    fontSize: 11,
    color: PSRS_COLORS.textSub,
    fontWeight: "500",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEF2F2",
    borderRadius: 14,
    padding: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: "#FEE2E2",
  },
  logoutText: {
    fontSize: 14,
    fontWeight: "700",
    color: PSRS_COLORS.emergency,
  },
  skeletonHeader: {
    height: 140,
    backgroundColor: PSRS_COLORS.primary,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  skeletonContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    alignItems: "center",
  },
  skeletonCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#E5E7EB",
    marginBottom: 16,
  },
  skeletonLine: {
    width: 150,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#E5E7EB",
    marginBottom: 8,
  },
  skeletonLineMedium: {
    width: 100,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#E5E7EB",
  },
  skeletonCard: {
    width: "100%",
    height: 80,
    borderRadius: 16,
    backgroundColor: "#E5E7EB",
    marginBottom: 12,
  },
});

export default ProfileScreen;
