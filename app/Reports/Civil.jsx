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
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

import { Picker } from "@react-native-picker/picker";

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
  warning: "#F59E0B",
  info: "#3B82F6",
};

const CivilReportScreen = () => {
  const [submitting, setSubmitting] = useState(false);
  const [useLiveLocation, setUseLiveLocation] = useState(true);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [city, setCity] = useState("");
  const [addressName, setAddressName] = useState("");
  const [image, setImage] = useState(null);

  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState(false);
  const [mapRegion, setMapRegion] = useState(null);
  const mapRef = useRef(null);
  const scrollViewRef = useRef(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      const response = await api.get("/Citizen/get-civil-categories");
      if (response && response.data && Array.isArray(response.data)) {
        setCategories(response.data);
        if (response.data.length > 0) {
          setSelectedCategoryId(response.data[0].id);
        }
      } else if (
        response &&
        response.data &&
        Array.isArray(response.data.data)
      ) {
        setCategories(response.data.data);
        if (response.data.data.length > 0) {
          setSelectedCategoryId(response.data.data[0].id);
        }
      } else {
        setCategories([]);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategories([]);
    } finally {
      setCategoriesLoading(false);
    }
  };

  useEffect(() => {
    if (useLiveLocation) {
      getCurrentLocation();
    }
  }, [useLiveLocation]);

  const getCurrentLocation = async () => {
    setLocationLoading(true);
    setLocationError(false);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert("تنبيه", "نحتاج صلاحية الوصول إلى الموقع");
        setLocationError(true);
        setLocationLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
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
        mapRef.current.animateToRegion(newRegion, 500);
      }

      try {
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
      Alert.alert("خطأ", "فشل الحصول على الموقع");
    } finally {
      setLocationLoading(false);
    }
  };

  const pickImage = async () => {
    try {
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
    if (!title.trim()) {
      Alert.alert("تنبيه", "الرجاء إدخال عنوان البلاغ");
      return;
    }
    if (!city.trim()) {
      Alert.alert("تنبيه", "الرجاء تحديد المدينة");
      return;
    }
    if (!selectedCategoryId) {
      Alert.alert("تنبيه", "الرجاء اختيار نوع المشكلة");
      return;
    }
    if (useLiveLocation && (!latitude || !longitude)) {
      Alert.alert(
        "تنبيه",
        "الرجاء انتظار تحميل الموقع أو تعطيل الموقع المباشر",
      );
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("Title", title.trim());
      formData.append("Description", description.trim() || "");

      if (useLiveLocation && latitude && longitude) {
        formData.append("Latitude", latitude.toString());
        formData.append("Longitude", longitude.toString());
      } else {
        formData.append("Latitude", "0");
        formData.append("Longitude", "0");
      }

      formData.append("City", city.trim());
      formData.append("CategoryId", selectedCategoryId.toString());
      formData.append("AddressName", addressName.trim() || "");

      if (image) {
        const filename = image.split("/").pop() || "photo.jpg";
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : "image/jpeg";
        formData.append("Image", {
          uri: image,
          name: filename,
          type: type,
        });
      }

      const response = await api.post(
        "/Citizen/Create-Civil-report",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      if (response.data?.success) {
        Alert.alert("نجاح", "تم إرسال البلاغ بنجاح", [
          { text: "حسناً", onPress: () => router.back() },
        ]);
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
          backgroundColor={PSRS_COLORS.primary}
        />

        <LinearGradient
          colors={[PSRS_COLORS.primary, PSRS_COLORS.primaryLight]}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <Feather name="arrow-right" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>إنشاء بلاغ بلدي</Text>
            <View style={{ width: 40 }} />
          </View>
        </LinearGradient>

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
        >
          <ScrollView
            ref={scrollViewRef}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            automaticallyAdjustKeyboardInsets={true}
          >
            {/* قسم الصورة */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Feather name="image" size={20} color={PSRS_COLORS.primary} />
                <Text style={styles.cardTitle}>صورة البلاغ</Text>
              </View>

              <View style={styles.imageButtonsRow}>
                <TouchableOpacity
                  style={styles.imageButton}
                  onPress={pickImage}
                >
                  <Feather
                    name="folder"
                    size={18}
                    color={PSRS_COLORS.primary}
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
                    color={PSRS_COLORS.primary}
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

            {/* قسم تفاصيل البلاغ */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Feather
                  name="file-text"
                  size={20}
                  color={PSRS_COLORS.primary}
                />
                <Text style={styles.cardTitle}>تفاصيل البلاغ</Text>
              </View>

              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>عنوان البلاغ</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    value={title}
                    onChangeText={setTitle}
                    placeholder="أدخل عنوان البلاغ"
                    placeholderTextColor={PSRS_COLORS.textMuted}
                    textAlign="right"
                  />
                </View>
              </View>

              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>نوع المشكلة *</Text>
                <View style={styles.pickerWrapper}>
                  {categoriesLoading ? (
                    <ActivityIndicator
                      size="small"
                      color={PSRS_COLORS.primary}
                    />
                  ) : categories.length > 0 ? (
                    <Picker
                      selectedValue={selectedCategoryId}
                      onValueChange={setSelectedCategoryId}
                      style={styles.picker}
                      dropdownIconColor={PSRS_COLORS.primary}
                    >
                      {categories.map((cat) => (
                        <Picker.Item
                          key={cat.id}
                          label={
                            cat.name
                              ? cat.name.charAt(0).toUpperCase() +
                                cat.name.slice(1)
                              : "غير محدد"
                          }
                          value={cat.id}
                        />
                      ))}
                    </Picker>
                  ) : (
                    <Text style={styles.noCategoriesText}>لا توجد تصنيفات</Text>
                  )}
                </View>
              </View>

              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>وصف المشكلة</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={description}
                    onChangeText={setDescription}
                    placeholder="وصف تفصيلي للمشكلة..."
                    placeholderTextColor={PSRS_COLORS.textMuted}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    textAlign="right"
                  />
                </View>
              </View>
            </View>

            {/* قسم الموقع */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Feather name="map-pin" size={20} color={PSRS_COLORS.primary} />
                <Text style={styles.cardTitle}>الموقع</Text>
              </View>

              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>
                  تحديد الموقع تلقائياً (GPS)
                </Text>
                <Switch
                  value={useLiveLocation}
                  onValueChange={setUseLiveLocation}
                  trackColor={{ false: "#E5E7EB", true: PSRS_COLORS.primary }}
                  thumbColor={useLiveLocation ? "#fff" : "#fff"}
                />
              </View>

              {useLiveLocation && (
                <Text style={styles.locationHint}>
                  📍 سيتم تحديد موقعك تلقائياً
                </Text>
              )}

              {useLiveLocation ? (
                locationLoading ? (
                  <View style={styles.locationLoading}>
                    <ActivityIndicator color={PSRS_COLORS.primary} />
                    <Text style={styles.locationLoadingText}>
                      جاري تحديد الموقع...
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
                    <Text style={styles.retryText}>إعادة المحاولة</Text>
                  </TouchableOpacity>
                ) : (
                  <>
                    <View style={styles.fieldContainer}>
                      <Text style={styles.fieldLabel}>المدينة</Text>
                      <View style={styles.inputWrapper}>
                        <TextInput
                          style={styles.input}
                          value={city}
                          onChangeText={setCity}
                          placeholder="المدينة"
                          placeholderTextColor={PSRS_COLORS.textMuted}
                          textAlign="right"
                        />
                      </View>
                    </View>

                    <View style={styles.fieldContainer}>
                      <Text style={styles.fieldLabel}>العنوان التفصيلي</Text>
                      <View style={styles.inputWrapper}>
                        <TextInput
                          style={styles.input}
                          value={addressName}
                          onChangeText={setAddressName}
                          placeholder="الشارع، المنطقة..."
                          placeholderTextColor={PSRS_COLORS.textMuted}
                          textAlign="right"
                        />
                      </View>
                    </View>

                    {latitude && longitude && (
                      <>
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
                            region={mapRegion || undefined}
                          >
                            <Marker
                              coordinate={{ latitude, longitude }}
                              title="موقعك"
                              description={city || "موقع البلاغ"}
                            />
                          </MapView>
                        </View>
                      </>
                    )}
                  </>
                )
              ) : (
                <>
                  <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>المدينة</Text>
                    <View style={styles.inputWrapper}>
                      <TextInput
                        style={styles.input}
                        value={city}
                        onChangeText={setCity}
                        placeholder="المدينة"
                        placeholderTextColor={PSRS_COLORS.textMuted}
                        textAlign="right"
                      />
                    </View>
                  </View>

                  <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>العنوان التفصيلي</Text>
                    <View style={styles.inputWrapper}>
                      <TextInput
                        style={styles.input}
                        value={addressName}
                        onChangeText={setAddressName}
                        placeholder="الشارع، المنطقة..."
                        placeholderTextColor={PSRS_COLORS.textMuted}
                        textAlign="right"
                      />
                    </View>
                  </View>
                </>
              )}
            </View>

            {/* زر الإرسال */}
            <TouchableOpacity
              style={[
                styles.submitBtn,
                (!title || !city || !selectedCategoryId) &&
                  styles.submitBtnDisabled,
              ]}
              onPress={handleSubmit}
              disabled={submitting || !title || !city || !selectedCategoryId}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Feather name="send" size={18} color="#fff" />
                  <Text style={styles.submitBtnText}>إرسال البلاغ</Text>
                </>
              )}
            </TouchableOpacity>

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
    paddingBottom: 40,
    flexGrow: 1,
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
    color: PSRS_COLORS.primary,
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
  fieldContainer: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: PSRS_COLORS.textMain,
    marginBottom: 6,
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
  pickerWrapper: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    overflow: "hidden",
  },
  picker: {
    height: 50,
    width: "100%",
  },
  noCategoriesText: {
    padding: 12,
    textAlign: "center",
    color: PSRS_COLORS.textMuted,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  switchLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: PSRS_COLORS.textSub,
  },
  locationHint: {
    fontSize: 11,
    color: PSRS_COLORS.textMuted,
    marginBottom: 12,
    fontStyle: "italic",
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
  coordinatesContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
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
  mapContainer: {
    marginTop: 12,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  map: {
    width: "100%",
    height: MAP_HEIGHT,
  },
  submitBtn: {
    backgroundColor: PSRS_COLORS.primary,
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 8,
  },
  submitBtnDisabled: {
    backgroundColor: "#C8D8D0",
  },
  submitBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});

export default CivilReportScreen;
