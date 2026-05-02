import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import api from "../API/ApiAuthToken";

const { width } = Dimensions.get("window");
const MAP_HEIGHT = 200;

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

const EMERGENCY_TYPES = [
  { id: 2, label: "إسعاف", value: "Ambulance" },
  { id: 3, label: "إطفاء", value: "Fire" },
  { id: 1, label: "شرطة", value: "Police" },
];

const EmergencyReportScreen = () => {
  const [submitting, setSubmitting] = useState(false);

  const [emergencyType, setEmergencyType] = useState(null);
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [city, setCity] = useState("");
  const [addressName, setAddressName] = useState("");

  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState(false);
  const [mapRegion, setMapRegion] = useState(null);
  const mapRef = useRef(null);
  const scrollViewRef = useRef(null);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    setLocationLoading(true);
    setLocationError(false);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "تنبيه",
          "نحتاج صلاحية الوصول إلى الموقع لإرسال بلاغ الطوارئ",
        );
        setLocationError(true);
        setLocationLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced, // ✅ High → Balanced
        timeout: 10000, // ✅ timeout مضاف
      });

      const { latitude: lat, longitude: lng } = location.coords;

      setLatitude(lat);
      setLongitude(lng);

      const newRegion = {
        latitude: lat,
        longitude: lng,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      setMapRegion(newRegion);

      if (mapRef.current) {
        // ✅ منعت crash لو mapRef مش جاهز
        mapRef.current.animateToRegion(newRegion, 500);
      }

      try {
        // ✅ حميت reverseGeocodeAsync
        const address = await Location.reverseGeocodeAsync({
          latitude: lat,
          longitude: lng,
        });

        if (address && address.length > 0) {
          const addr = address[0];
          const addressText = [addr.street, addr.district, addr.city]
            .filter(Boolean)
            .join(" ");
          setAddressName(addressText || "");
          if (addr.city) setCity(addr.city);
        }
      } catch (err) {
        console.log("Reverse geocode failed:", err);
      }
    } catch (error) {
      console.error("Location error:", error);
      setLocationError(true);
      Alert.alert("خطأ", "فشل الحصول على الموقع"); // ✅ fallback
    } finally {
      setLocationLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      // ✅ try-catch
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("تنبيه", "نحتاج صلاحية الوصول للصور");
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Image pick error:", error);
      Alert.alert("خطأ", "فشل في اختيار الصورة");
    }
  };

  const takePhoto = async () => {
    try {
      // ✅ try-catch
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("تنبيه", "نحتاج صلاحية الوصول للكاميرا");
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Camera error:", error);
      Alert.alert("خطأ", "فشل في التقاط الصورة");
    }
  };

  const handleSubmit = async () => {
    if (!latitude || !longitude) {
      Alert.alert("تنبيه", "الرجاء انتظار تحديد الموقع أو إعادة المحاولة");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();

      formData.append("Title", "بلاغ طوارئ عاجل");
      if (description.trim()) {
        formData.append("Description", description.trim());
      }

      formData.append("Latitude", latitude.toString());
      formData.append("Longitude", longitude.toString());
      formData.append("AddressName", addressName.trim() || "");
      formData.append("City", city.trim() || "");

      if (emergencyType) {
        formData.append("EmergencyType", emergencyType.toString());
      }

      formData.append("CategoryId", "2");

      if (image) {
        const filename = image.split("/").pop() || "photo.jpg";
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : "image/jpeg";
        formData.append("Image", {
          uri: image,
          name: filename,
          type: type,
        }); // ✅ as any
      }

      const response = await api.post(
        "/Citizen/send-emergency-report",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      if (response.data?.success || response.data?.id) {
        Alert.alert(
          "تم إرسال بلاغ الطوارئ",
          "تم إرسال بلاغ الطوارئ بنجاح. سيتم إخطار الجهات المختصة فوراً.",
          [{ text: "حسناً", onPress: () => router.back() }],
        );
      } else {
        Alert.alert("خطأ", response.data?.message || "فشل إرسال البلاغ");
      }
    } catch (error) {
      console.error("Submit error:", error);
      Alert.alert("خطأ", error.response?.data?.message || "فشل إرسال البلاغ");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={PSRS_COLORS.emergency}
        />

        <LinearGradient
          colors={[PSRS_COLORS.emergency, PSRS_COLORS.emergencyDark]}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <Feather name="arrow-right" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>بلاغ طوارئ</Text>
            <View style={{ width: 40 }} />
          </View>
        </LinearGradient>

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 88 : 0}
        >
          <ScrollView
            ref={scrollViewRef}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            automaticallyAdjustKeyboardInsets={true}
          >
            {/* 🚨 زر الإرسال في الأعلى (أول شيئ) */}
            <TouchableOpacity
              style={[
                styles.submitBtn,
                (!latitude || !longitude) && styles.submitBtnDisabled,
              ]}
              onPress={handleSubmit}
              disabled={submitting || !latitude || !longitude}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Feather name="send" size={18} color="#fff" />
                  <Text style={styles.submitBtnText}>إرسال بلاغ الطوارئ</Text>
                </>
              )}
            </TouchableOpacity>

            {/* ⚠️ تنبيه الطوارئ */}
            <View
              style={[
                styles.alertCard,
                { backgroundColor: "#FEF2F2", borderColor: "#FECACA" },
              ]}
            >
              <Feather
                name="alert-triangle"
                size={24}
                color={PSRS_COLORS.emergency}
              />
              <Text style={styles.alertTitle}>بلاغ طوارئ عاجل</Text>
              <Text style={styles.alertText}>
                في حالات الخطر، يرجى إرسال موقعك فوراً. جميع الحقول اختيارية ما
                عدا الموقع.
              </Text>
            </View>

            {/* ⚡ نوع الطوارئ (اختياري) */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Feather name="zap" size={20} color={PSRS_COLORS.emergency} />
                <Text style={styles.cardTitle}>نوع الطوارئ (اختياري)</Text>
              </View>
              <View style={styles.emergencyTypesRow}>
                {EMERGENCY_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type.id}
                    style={[
                      styles.emergencyTypeBtn,
                      emergencyType === type.id &&
                        styles.emergencyTypeBtnActive,
                    ]}
                    onPress={() => setEmergencyType(type.id)}
                  >
                    <Text
                      style={[
                        styles.emergencyTypeText,
                        emergencyType === type.id &&
                          styles.emergencyTypeTextActive,
                      ]}
                    >
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* 📍 الموقع (إلزامي) */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Feather
                  name="map-pin"
                  size={20}
                  color={PSRS_COLORS.emergency}
                />
                <Text style={styles.cardTitle}>الموقع الحالي *</Text>
              </View>

              {locationLoading ? (
                <View style={styles.locationLoading}>
                  <ActivityIndicator color={PSRS_COLORS.emergency} />
                  <Text style={styles.locationLoadingText}>
                    جاري تحديد موقعك...
                  </Text>
                </View>
              ) : locationError ? (
                <TouchableOpacity
                  style={styles.retryBtn}
                  onPress={getCurrentLocation}
                >
                  <Feather
                    name="refresh-cw"
                    size={16}
                    color={PSRS_COLORS.emergency}
                  />
                  <Text style={styles.retryText}>
                    إعادة محاولة تحديد الموقع
                  </Text>
                </TouchableOpacity>
              ) : (
                <>
                  {addressName ? (
                    <View style={styles.addressTag}>
                      <Feather
                        name="map-pin"
                        size={14}
                        color={PSRS_COLORS.emergency}
                      />
                      <Text style={styles.addressText}>{addressName}</Text>
                    </View>
                  ) : null}

                  {latitude &&
                    longitude && ( // ✅ منعت MapView يشتغل قبل القيم
                      <>
                        <View style={styles.mapContainer}>
                          <MapView
                            ref={mapRef}
                            style={styles.map}
                            initialRegion={{
                              latitude,
                              longitude,
                              latitudeDelta: 0.01,
                              longitudeDelta: 0.01,
                            }}
                            region={mapRegion || undefined} // ✅ بدلاً من null
                          >
                            <Marker
                              coordinate={{ latitude, longitude }}
                              title="موقع الطوارئ"
                              description={city || ""}
                            >
                              <View style={styles.emergencyMarker}>
                                <View style={styles.emergencyMarkerInner} />
                              </View>
                            </Marker>
                          </MapView>
                        </View>

                        <View style={styles.coordinatesContainer}>
                          <View style={styles.coordinateItem}>
                            <Text style={styles.coordinateLabel}>خط العرض</Text>
                            <Text style={styles.coordinateValue}>
                              {latitude?.toFixed(6) || "---"}
                            </Text>
                          </View>
                          <View style={styles.coordinateItem}>
                            <Text style={styles.coordinateLabel}>خط الطول</Text>
                            <Text style={styles.coordinateValue}>
                              {longitude?.toFixed(6) || "---"}
                            </Text>
                          </View>
                        </View>
                      </>
                    )}
                </>
              )}
            </View>

            {/* 📷 صورة الحادث (اختيارية) */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Feather
                  name="camera"
                  size={20}
                  color={PSRS_COLORS.emergency}
                />
                <Text style={styles.cardTitle}>صورة الحادث (اختياري)</Text>
              </View>

              <View style={styles.imageButtonsRow}>
                <TouchableOpacity
                  style={styles.imageButton}
                  onPress={pickImage}
                >
                  <Feather
                    name="folder"
                    size={18}
                    color={PSRS_COLORS.emergency}
                  />
                  <Text style={styles.imageButtonText}>المعرض</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.imageButton}
                  onPress={takePhoto}
                >
                  <Feather
                    name="camera"
                    size={18}
                    color={PSRS_COLORS.emergency}
                  />
                  <Text style={styles.imageButtonText}>الكاميرا</Text>
                </TouchableOpacity>
              </View>

              {image && (
                <View style={styles.imagePreviewContainer}>
                  <Image source={{ uri: image }} style={styles.imagePreview} />
                  <TouchableOpacity
                    style={styles.changeImageBtn}
                    onPress={() => setImage(null)}
                  >
                    <Text style={styles.changeImageText}>تغيير الصورة</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* 📝 وصف إضافي (اختياري) */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Feather
                  name="file-text"
                  size={20}
                  color={PSRS_COLORS.emergency}
                />
                <Text style={styles.cardTitle}>وصف إضافي (اختياري)</Text>
              </View>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="يمكنك إضافة تفاصيل إضافية عن الحالة (عدد المصابين، نوع الحريق، ...)"
                  placeholderTextColor={PSRS_COLORS.textMuted}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  textAlign="right"
                />
              </View>
            </View>

            <View style={{ height: 40 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PSRS_COLORS.background,
  },
  header: {
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 20,
  },
  alertCard: {
    backgroundColor: "#FEF2F2",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#FECACA",
    alignItems: "center",
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: PSRS_COLORS.emergency,
    marginTop: 8,
  },
  alertText: {
    fontSize: 12,
    color: "#991B1B",
    textAlign: "center",
    marginTop: 4,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: PSRS_COLORS.textMain,
    flex: 1,
  },
  emergencyTypesRow: {
    flexDirection: "row",
    gap: 12,
  },
  emergencyTypeBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
  },
  emergencyTypeBtnActive: {
    backgroundColor: PSRS_COLORS.emergency,
    borderColor: PSRS_COLORS.emergency,
  },
  emergencyTypeText: {
    fontSize: 14,
    fontWeight: "600",
    color: PSRS_COLORS.textSub,
  },
  emergencyTypeTextActive: {
    color: "#fff",
  },
  imageButtonsRow: {
    flexDirection: "row",
    gap: 12,
  },
  imageButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingVertical: 12,
  },
  imageButtonText: {
    fontSize: 13,
    color: PSRS_COLORS.emergency,
    fontWeight: "600",
  },
  imagePreviewContainer: {
    marginTop: 12,
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
  },
  imagePreview: {
    width: "100%",
    height: 200,
    backgroundColor: "#f0f0f0",
  },
  changeImageBtn: {
    position: "absolute",
    bottom: 12,
    left: 12,
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  changeImageText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  inputWrapper: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    overflow: "hidden",
  },
  input: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: PSRS_COLORS.textMain,
    textAlignVertical: "top",
  },
  textArea: {
    minHeight: 100,
  },
  locationLoading: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    gap: 8,
  },
  locationLoadingText: {
    fontSize: 13,
    color: PSRS_COLORS.textSub,
  },
  retryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#FEF2F2",
    borderRadius: 12,
    padding: 16,
  },
  retryText: {
    fontSize: 13,
    color: PSRS_COLORS.emergency,
    fontWeight: "600",
  },
  addressTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FEF2F2",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  addressText: {
    fontSize: 13,
    color: PSRS_COLORS.emergency,
    fontWeight: "500",
    flex: 1,
  },
  mapContainer: {
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 12,
  },
  map: {
    width: "100%",
    height: MAP_HEIGHT,
  },
  emergencyMarker: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(220, 38, 38, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  emergencyMarkerInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: PSRS_COLORS.emergency,
    borderWidth: 2,
    borderColor: "#fff",
  },
  coordinatesContainer: {
    flexDirection: "row",
    gap: 12,
  },
  coordinateItem: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
  },
  coordinateLabel: {
    fontSize: 11,
    color: PSRS_COLORS.textSub,
    marginBottom: 4,
  },
  coordinateValue: {
    fontSize: 14,
    fontWeight: "700",
    color: PSRS_COLORS.textMain,
  },
  submitBtn: {
    backgroundColor: PSRS_COLORS.emergency,
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 16,
  },
  submitBtnDisabled: {
    backgroundColor: "#FECACA",
  },
  submitBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});

export default EmergencyReportScreen;
