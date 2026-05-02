import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { Link } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";

import { useBackHandler } from "../utils/backHandler";

import {
  Animated,
  Dimensions,
  Image,
  Platform,
  RefreshControl,
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
const BANNER_WIDTH = width - 32;

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
  emergencyDark: "#991B1B",
  warning: "#F59E0B",
  info: "#3B82F6",
};

const getAnnouncementStyle = (type) => {
  switch ((type || "").toLowerCase()) {
    case "emergency":
      return {
        bgColor: PSRS_COLORS.emergency,
        gradient: ["#DC2626", "#7F1D1D"],
        tagText: "طارئ",
        icon: "alert-octagon",
      };
    case "warning":
      return {
        bgColor: PSRS_COLORS.warning,
        gradient: ["#F59E0B", "#92400E"],
        tagText: "تحذير",
        icon: "alert",
      };
    case "general":
    default:
      return {
        bgColor: PSRS_COLORS.primary,
        gradient: [PSRS_COLORS.primary, PSRS_COLORS.primaryDark],
        tagText: "إعلان بلدية",
        icon: "information",
      };
  }
};

const getRelativeTime = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  if (seconds < 60) return "الآن";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `منذ ${minutes} د`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `منذ ${hours} س`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `منذ ${days} ي`;
  const months = Math.floor(days / 30);
  if (months < 12) return `منذ ${months} شهر`;
  return `منذ ${Math.floor(months / 12)} سنة`;
};

const HomeScreen = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeChip, setActiveChip] = useState("الكل");
  const [announcements, setAnnouncements] = useState([]);
  const [adsLoading, setAdsLoading] = useState(true);
  const [adsError, setAdsError] = useState(false);
  const [activeBanner, setActiveBanner] = useState(0);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const bannerScrollRef = useRef(null);
  const autoScrollInterval = useRef(null);
  useBackHandler();

  useEffect(() => {
    initializeData();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    return () => {
      if (autoScrollInterval.current) clearInterval(autoScrollInterval.current);
    };
  }, []);

  useEffect(() => {
    if (autoScrollInterval.current) clearInterval(autoScrollInterval.current);
    if (announcements.length > 1) {
      autoScrollInterval.current = setInterval(() => {
        setActiveBanner((prev) => {
          const next = (prev + 1) % announcements.length;
          bannerScrollRef.current?.scrollTo({
            x: next * BANNER_WIDTH,
            animated: true,
          });
          return next;
        });
      }, 5000);
    }
    return () => {
      if (autoScrollInterval.current) clearInterval(autoScrollInterval.current);
    };
  }, [announcements.length]);

  const initializeData = async () => {
    setLoading(true);
    await Promise.all([
      loadUserData(),
      fetchUserProfile(),
      fetchAnnouncements(),
    ]);
    setLoading(false);
  };

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem("user");
      if (userData) setUser(JSON.parse(userData));
    } catch (error) {
      console.error("Error loading user:", error);
    }
  };

  const fetchUserProfile = async () => {
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
        };
        setUser(userData);
        await AsyncStorage.setItem("user", JSON.stringify(userData));
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  // ✅ تعديل: عرض إعلانات البلدية فقط (General) + حد أقصى 3 إعلانات
  const fetchAnnouncements = async () => {
    try {
      setAdsError(false);
      setAdsLoading(true);
      const response = await api.get("/Citizen/Display-All-Adds");
      let data = Array.isArray(response.data) ? response.data : [];

      // فلترة: عرض إعلانات البلدية فقط (General)
      const municipalAnnouncements = data.filter((ad) => ad.type === "General");

      // حد أقصى 3 إعلانات في السلايدر
      setAnnouncements(municipalAnnouncements.slice(0, 3));
    } catch (error) {
      console.error("Error fetching announcements:", error);
      setAdsError(true);
    } finally {
      setAdsLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      loadUserData(),
      fetchUserProfile(),
      fetchAnnouncements(),
    ]);
    setRefreshing(false);
  }, []);

  const handleBannerScroll = (event) => {
    const slideIndex = Math.round(
      event.nativeEvent.contentOffset.x / BANNER_WIDTH,
    );
    setActiveBanner(slideIndex);
  };

  if (loading) return <HomeSkeleton />;

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={PSRS_COLORS.primary}
      />

      <View style={styles.topHeader}>
        <LinearGradient
          colors={[PSRS_COLORS.primary, PSRS_COLORS.primaryLight]}
          style={styles.headerGradient}
        >
          <View style={styles.headerTopRow}>
            <TouchableOpacity style={styles.locationContainer}>
              <Ionicons
                name="location-sharp"
                size={16}
                color={PSRS_COLORS.surface}
              />
              <Text style={styles.locationText}>
                {user?.city || "نابلس، فلسطين"}
              </Text>
              <Feather
                name="chevron-down"
                size={14}
                color={PSRS_COLORS.surface}
              />
            </TouchableOpacity>

            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Link href="/notifications" asChild>
                <TouchableOpacity
                  style={[styles.notifIconContainer, { marginLeft: 10 }]}
                >
                  <Feather name="bell" size={18} color={PSRS_COLORS.surface} />
                  <View style={styles.notifBadge} />
                </TouchableOpacity>
              </Link>

              <Link href="../pages/Profile" asChild>
                <TouchableOpacity style={styles.profileImageContainer}>
                  {user?.profileImage ? (
                    <Image
                      source={{ uri: user.profileImage }}
                      style={styles.profileImage}
                    />
                  ) : (
                    <View style={styles.profileFallback}>
                      <Text style={styles.profileFallbackText}>
                        {user?.username?.charAt(0)?.toUpperCase() || "م"}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              </Link>
            </View>
          </View>

          <View style={styles.searchRow}>
            <View style={styles.searchBar}>
              <Feather name="search" size={18} color={PSRS_COLORS.textSub} />
              <TextInput
                placeholder="بحث عن خدمات أو بلاغات..."
                style={styles.searchInput}
                placeholderTextColor={PSRS_COLORS.textSub}
              />
            </View>
            <TouchableOpacity style={styles.filterButton}>
              <Feather name="sliders" size={18} color={PSRS_COLORS.primary} />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={{ opacity: fadeAnim }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[PSRS_COLORS.primary]}
            tintColor={PSRS_COLORS.primary}
          />
        }
      >
        {/* Announcements Banner - عروض البلدية فقط (General) */}
        <View style={styles.bannerContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>إعلانات بلدية</Text>
            <Link href="../pages/AllAnnouncementsScreen" asChild>
              <TouchableOpacity>
                <Text style={styles.seeAll}>عرض الكل</Text>
              </TouchableOpacity>
            </Link>
          </View>

          {adsLoading ? (
            <BannerSkeleton />
          ) : adsError ? (
            <BannerError onRetry={fetchAnnouncements} />
          ) : announcements.length === 0 ? (
            <BannerEmpty />
          ) : (
            <>
              <ScrollView
                ref={bannerScrollRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={handleBannerScroll}
                style={styles.bannerScrollView}
                onTouchStart={() => {
                  if (autoScrollInterval.current)
                    clearInterval(autoScrollInterval.current);
                }}
              >
                {announcements.map((ad) => (
                  <AnnouncementCard key={ad.id} ad={ad} />
                ))}
              </ScrollView>

              {announcements.length > 1 && (
                <View style={styles.pagination}>
                  {announcements.map((_, idx) => (
                    <View
                      key={idx}
                      style={[
                        styles.dot,
                        activeBanner === idx && styles.dotActive,
                      ]}
                    />
                  ))}
                </View>
              )}
            </>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <Link href="../Reports/Civil" asChild>
            <TouchableOpacity
              style={styles.civilActionBtn}
              activeOpacity={0.85}
            >
              <View style={styles.actionIconCircleLight}>
                <MaterialCommunityIcons
                  name="office-building"
                  size={26}
                  color={PSRS_COLORS.primary}
                />
              </View>
              <View style={styles.actionTextWrapper}>
                <Text style={styles.actionTitle}>بلاغ بلدية</Text>
                <Text style={styles.actionSubtitle}>
                  للمشاكل العامة في المدينة
                </Text>
              </View>
              <Feather
                name="chevron-left"
                size={20}
                color={PSRS_COLORS.primary}
              />
            </TouchableOpacity>
          </Link>

          <Link href="../Reports/EmergencyReportScreen" asChild>
            <TouchableOpacity
              style={styles.emergencyActionBtn}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={["#DC2626", "#7F1D1D"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.emergencyGradient}
              >
                <View style={styles.actionIconCircleDark}>
                  <MaterialCommunityIcons
                    name="alert-decagram"
                    size={26}
                    color={PSRS_COLORS.surface}
                  />
                </View>
                <View style={styles.actionTextWrapper}>
                  <Text style={styles.emergencyTitle}>بلاغ طوارئ</Text>
                  <Text style={styles.emergencySubtitle}>
                    استجابة فورية - شرطة، إسعاف، إطفاء
                  </Text>
                </View>
                <Feather
                  name="chevron-left"
                  size={20}
                  color={PSRS_COLORS.surface}
                />
              </LinearGradient>
            </TouchableOpacity>
          </Link>
        </View>

        {/* الأقسام الرئيسية */}
        <View style={styles.categorySection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionSubtitle}>اختر الخدمة التي تريدها</Text>
            <Text style={styles.sectionTitle}>الأقسام الرئيسية</Text>
          </View>

          <View style={styles.categoryGrid}>
            {/* بلدية */}
            <Link href="/Reports/civil" asChild>
              <TouchableOpacity style={styles.categoryCard} activeOpacity={0.8}>
                <LinearGradient
                  colors={["#DCFCE7", "#BBF7D0"]}
                  style={styles.categoryGradient}
                >
                  <View style={styles.categoryIconWrapper}>
                    <MaterialCommunityIcons
                      name="office-building"
                      size={32}
                      color={PSRS_COLORS.primary}
                    />
                  </View>
                  <Text style={styles.categoryName}>البلدية</Text>
                  <Text style={styles.categoryDesc}>شكاوى واقتراحات</Text>
                </LinearGradient>
              </TouchableOpacity>
            </Link>
            {/* الملف الطبي */}
            <Link href="../pages/MedicalHistoryScreen" asChild>
              <TouchableOpacity style={styles.categoryCard} activeOpacity={0.8}>
                <LinearGradient
                  colors={["#F1F5F9", "#E2E8F0"]}
                  style={styles.categoryGradient}
                >
                  <View style={styles.categoryIconWrapper}>
                    <MaterialCommunityIcons
                      name="account-details"
                      size={32}
                      color="#475569"
                    />
                  </View>
                  <Text style={styles.categoryName}>الملف الطبي</Text>
                  <Text style={styles.categoryDesc}>بياناتي الصحية</Text>
                </LinearGradient>
              </TouchableOpacity>
            </Link>

            {/* الصحة */}
            <Link href="/medical-profile" asChild>
              <TouchableOpacity style={styles.categoryCard} activeOpacity={0.8}>
                <LinearGradient
                  colors={["#DBEAFE", "#BFDBFE"]}
                  style={styles.categoryGradient}
                >
                  <View style={styles.categoryIconWrapper}>
                    <MaterialCommunityIcons
                      name="medical-bag"
                      size={32}
                      color="#2563EB"
                    />
                  </View>
                  <Text style={styles.categoryName}>الصحة</Text>
                  <Text style={styles.categoryDesc}>خدمات صحية</Text>
                </LinearGradient>
              </TouchableOpacity>
            </Link>

            {/* طوارئ */}
            <Link href="/Reports/emergency" asChild>
              <TouchableOpacity style={styles.categoryCard} activeOpacity={0.8}>
                <LinearGradient
                  colors={["#FEE2E2", "#FECACA"]}
                  style={styles.categoryGradient}
                >
                  <View style={styles.categoryIconWrapper}>
                    <MaterialCommunityIcons
                      name="fire-truck"
                      size={32}
                      color={PSRS_COLORS.emergency}
                    />
                  </View>
                  <Text style={styles.categoryName}>طوارئ</Text>
                  <Text style={styles.categoryDesc}>نداء استغاثة فوري</Text>
                </LinearGradient>
              </TouchableOpacity>
            </Link>
          </View>
        </View>

        {/* Latest Activities */}
        <View style={styles.activitySection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>آخر بلاغاتي</Text>
            <Link href="/my-reports" asChild>
              <TouchableOpacity>
                <Text style={styles.seeAll}>الكل</Text>
              </TouchableOpacity>
            </Link>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.chipsScroll}
            contentContainerStyle={{ flexDirection: "row-reverse" }}
          >
            {["الكل", "قيد المعالجة", "مكتمل", "مرفوض"].map((chip) => (
              <TouchableOpacity
                key={chip}
                style={[styles.chip, activeChip === chip && styles.chipActive]}
                onPress={() => setActiveChip(chip)}
              >
                <Text
                  style={[
                    styles.chipText,
                    activeChip === chip && styles.chipTextActive,
                  ]}
                >
                  {chip}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Link href="/Reports/civil" asChild>
            <TouchableOpacity style={styles.emptyBtn}>
              <Text style={styles.emptyBtnText}>إرسال بلاغ جديد</Text>
              <Feather
                name="plus-circle"
                size={16}
                color={PSRS_COLORS.surface}
              />
            </TouchableOpacity>
          </Link>
        </View>

        <View style={{ height: 20 }} />
      </Animated.ScrollView>

      <BottomNav />
    </View>
  );
};

const AnnouncementCard = ({ ad }) => {
  const style = getAnnouncementStyle(ad.type);
  const hasImage = ad.files && ad.files.length > 0 && ad.files[0];
  return (
    <TouchableOpacity activeOpacity={0.92} style={styles.bannerCard}>
      {hasImage ? (
        <>
          <Image source={{ uri: ad.files[0] }} style={styles.bannerImage} />
          <LinearGradient
            colors={["rgba(0,0,0,0.1)", "rgba(0,0,0,0.85)"]}
            style={styles.bannerOverlay}
          />
        </>
      ) : (
        <LinearGradient colors={style.gradient} style={styles.bannerImage} />
      )}
      <View style={styles.bannerContent}>
        <View style={styles.bannerTopRow}>
          <View
            style={[styles.bannerTagBadge, { backgroundColor: style.bgColor }]}
          >
            <MaterialCommunityIcons name={style.icon} size={11} color="#fff" />
            <Text style={styles.bannerTag}>{style.tagText}</Text>
          </View>
          <Text style={styles.bannerTime}>{getRelativeTime(ad.createdAt)}</Text>
        </View>
        <View style={styles.bannerBottomContent}>
          <Text numberOfLines={1} style={styles.bannerTitle}>
            {ad.title}
          </Text>
          <Text numberOfLines={2} style={styles.bannerSubTitle}>
            {ad.description}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const HomeSkeleton = () => (
  <View style={[styles.container, { paddingTop: 60 }]}>
    <View style={{ paddingHorizontal: 16 }}>
      <View style={skeletonStyles.headerLine} />
      <View style={skeletonStyles.searchLine} />
      <View style={{ height: 30 }} />
      <View style={skeletonStyles.actionRow}>
        <View style={skeletonStyles.actionBox} />
      </View>
      <View style={{ height: 12 }} />
      <View style={skeletonStyles.actionRow}>
        <View style={skeletonStyles.actionBox} />
      </View>
      <View style={{ height: 24 }} />
      <View style={skeletonStyles.bannerLine} />
    </View>
  </View>
);

const BannerSkeleton = () => (
  <View style={[styles.bannerCard, { backgroundColor: "#E5E7EB" }]} />
);

const BannerEmpty = () => (
  <View style={[styles.bannerCard, styles.bannerEmpty]}>
    <MaterialCommunityIcons
      name="bullhorn-outline"
      size={36}
      color={PSRS_COLORS.textMuted}
    />
    <Text style={styles.bannerEmptyTitle}>لا توجد إعلانات حالياً</Text>
    <Text style={styles.bannerEmptySubtitle}>ستظهر إعلانات البلدية هنا</Text>
  </View>
);

const BannerError = ({ onRetry }) => (
  <View style={[styles.bannerCard, styles.bannerErrorBox]}>
    <MaterialCommunityIcons
      name="wifi-off"
      size={32}
      color={PSRS_COLORS.emergency}
    />
    <Text style={styles.bannerEmptyTitle}>تعذر تحميل الإعلانات</Text>
    <TouchableOpacity style={styles.retryBtn} onPress={onRetry}>
      <Feather name="refresh-cw" size={14} color={PSRS_COLORS.surface} />
      <Text style={styles.retryBtnText}>إعادة المحاولة</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PSRS_COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  topHeader: {
    backgroundColor: PSRS_COLORS.primary,
    overflow: "hidden",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingTop: Platform.OS === "ios" ? 50 : 35,
  },
  headerGradient: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  headerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  locationText: {
    color: PSRS_COLORS.surface,
    fontSize: 13,
    fontWeight: "600",
    marginHorizontal: 5,
  },
  profileImageContainer: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.5)",
    overflow: "hidden",
    marginLeft: 10,
  },
  profileImage: { width: "100%", height: "100%" },
  profileFallback: {
    width: "100%",
    height: "100%",
    backgroundColor: PSRS_COLORS.accent,
    justifyContent: "center",
    alignItems: "center",
  },
  profileFallbackText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  notifIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  notifBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: PSRS_COLORS.accent,
    borderWidth: 1.5,
    borderColor: PSRS_COLORS.primary,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 16,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: PSRS_COLORS.surface,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    textAlign: "right",
    fontSize: 13,
    color: PSRS_COLORS.textMain,
    paddingRight: 8,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: PSRS_COLORS.surface,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginVertical: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: PSRS_COLORS.textMain,
    textAlign: "right",
  },
  sectionSubtitle: {
    fontSize: 12,
    color: PSRS_COLORS.textSub,
    textAlign: "right",
    marginTop: 2,
  },
  seeAll: { color: PSRS_COLORS.primary, fontSize: 13, fontWeight: "600" },
  quickActionsContainer: { marginTop: 16, gap: 10 },
  civilActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: PSRS_COLORS.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: PSRS_COLORS.border,
    elevation: 2,
  },
  emergencyActionBtn: {
    borderRadius: 16,
    overflow: "hidden",
    elevation: 4,
  },
  emergencyGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
  },
  actionIconCircleLight: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#DCFCE7",
    justifyContent: "center",
    alignItems: "center",
  },
  actionIconCircleDark: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  actionTextWrapper: { flex: 1, marginHorizontal: 12, alignItems: "flex-end" },
  actionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: PSRS_COLORS.textMain,
  },
  actionSubtitle: {
    fontSize: 11,
    color: PSRS_COLORS.textSub,
    marginTop: 2,
  },
  emergencyTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: PSRS_COLORS.surface,
  },
  emergencySubtitle: {
    fontSize: 11,
    color: "rgba(255,255,255,0.85)",
    marginTop: 2,
  },
  bannerContainer: { marginTop: 12 },
  bannerScrollView: { width: BANNER_WIDTH },
  bannerCard: {
    width: BANNER_WIDTH,
    height: 160,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "#E5E7EB",
    elevation: 3,
  },
  bannerImage: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
  bannerOverlay: { ...StyleSheet.absoluteFillObject },
  bannerContent: { flex: 1, padding: 14, justifyContent: "space-between" },
  bannerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  bannerBottomContent: { alignItems: "flex-end" },
  bannerTagBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  bannerTag: { fontSize: 10, color: "#fff", fontWeight: "700" },
  bannerTime: {
    fontSize: 11,
    color: "rgba(255,255,255,0.85)",
    fontWeight: "600",
  },
  bannerTitle: {
    color: PSRS_COLORS.surface,
    fontSize: 17,
    fontWeight: "800",
    textAlign: "right",
  },
  bannerSubTitle: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 12,
    marginTop: 4,
    textAlign: "right",
  },
  bannerEmpty: {
    backgroundColor: PSRS_COLORS.surface,
    borderWidth: 1,
    borderColor: PSRS_COLORS.border,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  bannerErrorBox: {
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    gap: 8,
  },
  bannerEmptyTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: PSRS_COLORS.textMain,
    marginTop: 10,
  },
  bannerEmptySubtitle: {
    fontSize: 12,
    color: PSRS_COLORS.textSub,
    marginTop: 4,
    textAlign: "center",
  },
  retryBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: PSRS_COLORS.emergency,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
    marginTop: 4,
  },
  retryBtnText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 12,
    gap: 5,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#D1D5DB" },
  dotActive: { width: 18, backgroundColor: PSRS_COLORS.primary },
  categorySection: { marginTop: 24, marginBottom: 8 },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  categoryCard: {
    width: (width - 44) / 2,
    borderRadius: 20,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  categoryGradient: {
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 12,
  },
  categoryIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.8)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: "800",
    color: PSRS_COLORS.textMain,
    textAlign: "center",
    marginBottom: 4,
  },
  categoryDesc: {
    fontSize: 11,
    color: PSRS_COLORS.textSub,
    textAlign: "center",
  },
  activitySection: { marginTop: 10 },
  chipsScroll: { flexDirection: "row", marginBottom: 14 },
  chip: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: PSRS_COLORS.surface,
    marginLeft: 10,
    borderWidth: 1,
    borderColor: PSRS_COLORS.border,
  },
  chipActive: {
    backgroundColor: PSRS_COLORS.primary,
    borderColor: PSRS_COLORS.primary,
  },
  chipText: {
    fontSize: 12,
    color: PSRS_COLORS.textMain,
    fontWeight: "600",
  },
  chipTextActive: { color: PSRS_COLORS.surface },
  emptyBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: PSRS_COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 14,
    gap: 6,
    alignSelf: "center",
  },
  emptyBtnText: { color: "#fff", fontSize: 13, fontWeight: "700" },
});

const skeletonStyles = StyleSheet.create({
  headerLine: {
    height: 30,
    width: "60%",
    backgroundColor: "#E5E7EB",
    borderRadius: 8,
    marginBottom: 16,
  },
  searchLine: { height: 44, backgroundColor: "#E5E7EB", borderRadius: 12 },
  bannerLine: { height: 160, backgroundColor: "#E5E7EB", borderRadius: 18 },
  actionRow: { flexDirection: "row", gap: 10 },
  actionBox: {
    flex: 1,
    height: 70,
    backgroundColor: "#E5E7EB",
    borderRadius: 16,
  },
});

export default HomeScreen;
