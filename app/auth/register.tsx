import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import api from "../API/ApiAuthToken";  // ✅ استخدام api بدل axios

const { width } = Dimensions.get("window");

const RegisterScreen = () => {
  const router = useRouter();

  // States
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [city, setCity] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isCityModalVisible, setIsCityModalVisible] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const palestinianCities = [
    "القدس", "نابلس", "رام الله والبيرة", "الخليل", "جنين",
    "بيت لحم", "طولكرم", "قلقيلية", "سلفيت", "طوباس", "أريحا", "غزة",
  ];

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("تنبيه", "نحتاج صلاحية الوصول للصور");
      return;
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const handleRegister = async () => {
    if (!fullName || !username || !email || !password || !city) {
      Alert.alert("تنبيه", "يرجى إكمال جميع البيانات المطلوبة");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("خطأ", "كلمات المرور غير متطابقة");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("FullName", fullName);
      formData.append("UserName", username);
      formData.append("Email", email);
      formData.append("PhoneNumber", phone);
      formData.append("City", city);
      formData.append("Password", password);
      formData.append("Role", "Citizen");  // ✅ أضفنا الـ Role

      if (profileImage) {
        const filename = profileImage.split("/").pop() || "photo.jpg";
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : "image/jpeg";
        formData.append("ProfilePicture", {
          uri: profileImage,
          name: filename,
          type: type,
        } as any);
      }

      // ✅ استخدام api بدل axios مباشرة
      await api.post("/Auth/Account/register", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      Alert.alert("نجاح", "تم إنشاء الحساب بنجاح", [
        { text: "حسناً", onPress: () => router.push("/auth/login") },
      ]);
    } catch (error: any) {
      Alert.alert(
        "خطأ",
        error.response?.data?.message || "فشل الاتصال بالسيرفر",
      );
    } finally {
      setLoading(false);
    }
  };

  const renderField = (
    label: string,
    labelEn: string,
    value: string,
    setValue: (t: string) => void,
    placeholder: string,
    options: any = {},
  ) => (
    <View style={styles.fieldContainer}>
      <View style={styles.fieldLabelRow}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <Text style={styles.fieldLabelEn}>{labelEn}</Text>
      </View>
      <View
        style={[
          styles.fieldInput,
          focusedField === label && styles.fieldInputFocused,
        ]}
      >
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#b0bec5"
          value={value}
          onChangeText={setValue}
          onFocus={() => setFocusedField(label)}
          onBlur={() => setFocusedField(null)}
          secureTextEntry={options.secure && !options.showPassword}
          keyboardType={options.keyboardType || "default"}
          autoCapitalize={options.autoCapitalize || "sentences"}
        />
        {options.icon && (
          <TouchableOpacity
            onPress={options.onIconPress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.fieldIcon}>{options.icon}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0d3d1f" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>✕</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>إنشاء حساب جديد</Text>
          <Text style={styles.headerSubtitle}>Create a new account</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.formArea}
          contentContainerStyle={styles.formContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={true}
          alwaysBounceVertical={true}
        >
          <Animated.View style={{ opacity: fadeAnim }}>
            <View style={styles.imagePickerContainer}>
              <TouchableOpacity onPress={pickImage} style={styles.imageCircle}>
                {profileImage ? (
                  <Image
                    source={{ uri: profileImage }}
                    style={styles.selectedImage}
                  />
                ) : (
                  <View style={styles.cameraPlaceholder}>
                    <Text style={styles.cameraEmoji}>📸</Text>
                  </View>
                )}
              </TouchableOpacity>
              <Text style={styles.imageHint}>اضغط لإضافة صورة شخصية</Text>
            </View>

            {renderField("الاسم الكامل", "Full Name", fullName, setFullName, "محمد أحمد")}
            {renderField("اسم المستخدم", "Username", username, setUsername, "username@", { autoCapitalize: "none" })}
            {renderField("البريد الإلكتروني", "Email", email, setEmail, "example@email.com", { keyboardType: "email-address", autoCapitalize: "none" })}

            {/* Phone */}
            <View style={styles.fieldContainer}>
              <View style={styles.fieldLabelRow}>
                <Text style={styles.fieldLabel}>رقم الهاتف</Text>
                <Text style={styles.fieldLabelEn}>Phone Number</Text>
              </View>
              <View style={styles.phoneRow}>
                <View style={styles.countryCode}>
                  <Text style={styles.countryCodeText}>🇵🇸 +970</Text>
                </View>
                <View
                  style={[
                    styles.fieldInput,
                    styles.phoneInput,
                    focusedField === "phone" && styles.fieldInputFocused,
                  ]}
                >
                  <TextInput
                    style={styles.input}
                    placeholder="5X-XXX-XXXX"
                    placeholderTextColor="#b0bec5"
                    value={phone}
                    onChangeText={setPhone}
                    onFocus={() => setFocusedField("phone")}
                    onBlur={() => setFocusedField(null)}
                    keyboardType="phone-pad"
                  />
                </View>
              </View>
            </View>

            {/* City */}
            <View style={styles.fieldContainer}>
              <View style={styles.fieldLabelRow}>
                <Text style={styles.fieldLabel}>المحافظة</Text>
                <Text style={styles.fieldLabelEn}>City</Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsCityModalVisible(true)}
                style={[
                  styles.fieldInput,
                  focusedField === "city" && styles.fieldInputFocused,
                ]}
              >
                <Text
                  style={[
                    styles.input,
                    { color: city ? "#0d1f14" : "#b0bec5" },
                  ]}
                >
                  {city || "اختر المحافظة"}
                </Text>
                <Text style={styles.fieldIcon}>▼</Text>
              </TouchableOpacity>
            </View>

            {renderField("كلمة المرور", "Password", password, setPassword, "••••••••", {
              secure: true,
              showPassword: showPassword,
              icon: showPassword ? "👁️‍🗨️" : "👁️",
              onIconPress: () => setShowPassword(!showPassword),
            })}

            {renderField("تأكيد كلمة المرور", "Confirm Password", confirmPassword, setConfirmPassword, "••••••••", {
              secure: true,
              showPassword: showConfirmPassword,
              icon: showConfirmPassword ? "👁️‍🗨️" : "👁️",
              onIconPress: () => setShowConfirmPassword(!showConfirmPassword),
            })}

            {/* Terms */}
            <TouchableOpacity
              style={styles.termsRow}
              onPress={() => setAgreeTerms(!agreeTerms)}
            >
              <View
                style={[styles.checkbox, agreeTerms && styles.checkboxChecked]}
              >
                {agreeTerms && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.termsText}>
                أوافق على الشروط والأحكام /{" "}
                <Text style={styles.termsLink}>Terms & Conditions</Text>
              </Text>
            </TouchableOpacity>

            {/* Register Button */}
            <TouchableOpacity
              style={[
                styles.registerBtn,
                (!agreeTerms || loading) && styles.registerBtnDisabled,
              ]}
              onPress={handleRegister}
              disabled={!agreeTerms || loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.registerBtnText}>إنشاء الحساب / Register</Text>
              )}
            </TouchableOpacity>

            {/* Login Link */}
            <View style={styles.loginRow}>
              <Text style={styles.loginText}>لديك حساب؟ </Text>
              <TouchableOpacity onPress={() => router.push("/auth/login")}>
                <Text style={styles.loginLink}>سجّل الدخول / Login</Text>
              </TouchableOpacity>
            </View>
            <View style={{ height: 40 }} />
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* City Modal */}
      <Modal visible={isCityModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>اختر المحافظة</Text>
            <FlatList
              data={palestinianCities}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.cityItem}
                  onPress={() => {
                    setCity(item);
                    setIsCityModalVisible(false);
                  }}
                >
                  <Text style={styles.cityText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={styles.closeModal}
              onPress={() => setIsCityModalVisible(false)}
            >
              <Text style={styles.closeModalText}>إغلاق</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fbf9" },
  header: {
    backgroundColor: "#0d3d1f",
    paddingTop: 50,
    paddingBottom: 25,
    paddingHorizontal: 25,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    flexDirection: "row",
    alignItems: "center",
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  backBtnText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  headerContent: { marginLeft: 15 },
  headerTitle: { color: "#fff", fontSize: 20, fontWeight: "800" },
  headerSubtitle: { color: "rgba(255,255,255,0.6)", fontSize: 11 },
  formArea: { flex: 1 },
  formContent: {
    paddingHorizontal: 25,
    paddingTop: 20,
    paddingBottom: 20,
    flexGrow: 1,
  },
  imagePickerContainer: { alignItems: "center", marginBottom: 20 },
  imageCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    borderColor: "#2e7d52",
    padding: 2,
    backgroundColor: "#fff",
  },
  selectedImage: { width: "100%", height: "100%", borderRadius: 45 },
  cameraPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f0f4f2",
    borderRadius: 45,
  },
  cameraEmoji: { fontSize: 30 },
  imageHint: {
    marginTop: 8,
    fontSize: 11,
    color: "#607d6b",
    fontWeight: "600",
  },
  fieldContainer: { marginBottom: 15 },
  fieldLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  fieldLabel: { fontSize: 13, color: "#0d1f14", fontWeight: "700" },
  fieldLabelEn: { fontSize: 10, color: "#607d6b" },
  fieldInput: {
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: "#e0ece6",
    borderRadius: 14,
    paddingHorizontal: 15,
    height: 52,
    flexDirection: "row",
    alignItems: "center",
  },
  fieldInputFocused: { borderColor: "#2e7d52", borderWidth: 2 },
  input: {
    flex: 1,
    fontSize: 14,
    color: "#0d1f14",
    textAlign: "right",
    height: "100%",
  },
  fieldIcon: { fontSize: 16, color: "#b0bec5", marginLeft: 8 },
  phoneRow: { flexDirection: "row", gap: 8 },
  countryCode: {
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: "#e0ece6",
    borderRadius: 14,
    paddingHorizontal: 10,
    justifyContent: "center",
  },
  countryCodeText: { fontSize: 13, color: "#0d1f14", fontWeight: "600" },
  phoneInput: { flex: 1 },
  termsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 5,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#2e7d52",
    marginRight: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: { backgroundColor: "#2e7d52" },
  checkmark: { color: "#fff", fontSize: 12, fontWeight: "bold" },
  termsText: { flex: 1, fontSize: 11, color: "#607d6b" },
  termsLink: { color: "#2e7d52", fontWeight: "800" },
  registerBtn: {
    backgroundColor: "#1a5c32",
    height: 55,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },
  registerBtnText: { color: "#fff", fontSize: 15, fontWeight: "800" },
  registerBtnDisabled: { backgroundColor: "#c8d8d0" },
  loginRow: { flexDirection: "row", justifyContent: "center", marginTop: 15 },
  loginText: { fontSize: 13, color: "#607d6b" },
  loginLink: { fontSize: 13, color: "#1a5c32", fontWeight: "800" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 20,
    maxHeight: "75%",
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  cityItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  cityText: { fontSize: 15, textAlign: "right" },
  closeModal: { marginTop: 10, padding: 10, alignItems: "center" },
  closeModalText: { color: "red", fontWeight: "bold" },
});

export default RegisterScreen;