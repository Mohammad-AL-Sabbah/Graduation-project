import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Platform,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import api from "../API/ApiAuthToken";

const PSRS_COLORS = {
  primary: "#1a5c32", // أخضر PSRS الأساسي
  primaryDark: "#0f3d20",
  accent: "#10b981",
  background: "#F4F7F5", // خلفية مائلة للأخضر البارد جداً
  surface: "#FFFFFF",
  textMain: "#111827",
  textSub: "#4B5563",
  border: "#E5E7EB",
};

const AllAnnouncementsScreen = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnnouncements = async () => {
    try {
      const response = await api.get("/Citizen/Display-All-Adds");
      let data = Array.isArray(response.data) ? response.data : [];
      setAnnouncements(data.filter((ad) => ad.type === "General"));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAnnouncements();
    setRefreshing(false);
  }, []);

  const renderAnnouncementCard = ({ item }) => {
    const hasImage = item.files && item.files.length > 0 && item.files[0];

    return (
      <TouchableOpacity activeOpacity={0.8} style={styles.psrsCard}>
        {/* الصورة - تم تصغيرها لتوفير مساحة مع الحفاظ على الزوايا المنظمة */}
        <View style={styles.cardImageWrapper}>
          {hasImage ? (
            <Image source={{ uri: item.files[0] }} style={styles.imageStyle} />
          ) : (
            <LinearGradient
              colors={[PSRS_COLORS.primary, PSRS_COLORS.primaryDark]}
              style={styles.imagePlaceholder}
            >
              <MaterialCommunityIcons
                name="bullhorn-variant"
                size={24}
                color="#fff"
              />
            </LinearGradient>
          )}
        </View>

        <View style={styles.cardInfo}>
          <View style={styles.tagRow}>
            <Text style={styles.timeText}>
              {new Date(item.createdAt).toLocaleDateString("ar-EG")}
            </Text>
            <View style={styles.psrsBadge}>
              <Text style={styles.psrsBadgeText}>إعلان رسمي</Text>
            </View>
          </View>

          <Text style={styles.titleText} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.descText} numberOfLines={2}>
            {item.description}
          </Text>
        </View>

        {/* شريط جانبي صغير بلون الهوية يعطي لمسة جمالية */}
        <View style={styles.sideIndicator} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      {/* Header PSRS الأساسي - فخم ومنظم */}
      <LinearGradient
        colors={[PSRS_COLORS.primary, PSRS_COLORS.primaryDark]}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <Feather name="chevron-right" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>كل الإعلانات</Text>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={PSRS_COLORS.primary} size="large" />
        </View>
      ) : (
        <FlatList
          data={announcements}
          renderItem={renderAnnouncementCard}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={PSRS_COLORS.primary}
            />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PSRS_COLORS.background },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },

  // Header Style
  header: {
    paddingTop: Platform.OS === "ios" ? 50 : 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    elevation: 8,
  },
  headerTop: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 0.5,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },

  listContainer: { padding: 16, paddingTop: 20 },

  // PSRS Compact Card Style
  psrsCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    flexDirection: "row-reverse",
    marginBottom: 12,
    height: 100, // ارتفاع ثابت ومحدد لضمان التنظيم
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  sideIndicator: {
    width: 6,
    backgroundColor: PSRS_COLORS.primary,
    height: "100%",
  },
  cardImageWrapper: {
    width: 100,
    height: "100%",
    backgroundColor: "#f0f0f0",
  },
  imageStyle: { width: "100%", height: "100%", resizeMode: "cover" },
  imagePlaceholder: { flex: 1, justifyContent: "center", alignItems: "center" },

  cardInfo: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    justifyContent: "center",
  },
  tagRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  psrsBadge: {
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: PSRS_COLORS.accent,
  },
  psrsBadgeText: {
    fontSize: 9,
    fontWeight: "bold",
    color: PSRS_COLORS.primary,
  },
  timeText: { fontSize: 10, color: PSRS_COLORS.textSub },

  titleText: {
    fontSize: 15,
    fontWeight: "bold",
    color: PSRS_COLORS.textMain,
    textAlign: "right",
    marginBottom: 2,
  },
  descText: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "right",
    lineHeight: 18,
  },
});

export default AllAnnouncementsScreen;
