import DateTimePicker from "@react-native-community/datetimepicker";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import api from "../API/ApiAuthToken";

const MedicalHistoryScreen = () => {
  const [loading, setLoading] = useState(false);
  const [hasMedicalRecord, setHasMedicalRecord] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // حقول النموذج
  const [bloodType, setBloodType] = useState("");
  const [chronicDiseases, setChronicDiseases] = useState("");
  const [currentMedications, setCurrentMedications] = useState("");
  const [allergies, setAllergies] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState(new Date());
  const [emergencyContacts, setEmergencyContacts] = useState([
    { name: "", phoneNumber: "" },
  ]);

  // جلب السجل الطبي
  const fetchMedicalHistory = async () => {
    setLoading(true);
    try {
      const response = await api.get("/Citizen/get-medical-history");

      if (response.status === 200) {
        const data = response.data;
        setHasMedicalRecord(true);
        setShowForm(true);
        setBloodType(data.bloodType || "");
        setChronicDiseases(data.chronicDiseases || "");
        setCurrentMedications(data.currentMedications || "");
        setAllergies(data.allergies || "");
        // تحويل التاريخ من API إلى كائن Date
        if (data.dateOfBirth) {
          setDateOfBirth(new Date(data.dateOfBirth));
        }
        if (data.emergencyContacts && data.emergencyContacts.length > 0) {
          setEmergencyContacts(data.emergencyContacts);
        }
      }
    } catch (error) {
      if (error.response?.status === 404) {
        setHasMedicalRecord(false);
        setShowForm(false);
      } else {
        Alert.alert("خطأ", "فشل في جلب البيانات");
      }
    } finally {
      setLoading(false);
    }
  };

  // إنشاء سجل طبي جديد
  const createMedicalHistory = async () => {
    if (!bloodType || !dateOfBirth) {
      Alert.alert("تنبيه", "فصيلة الدم وتاريخ الميلاد مطلوبان");
      return;
    }

    setLoading(true);
    try {
      // تحويل التاريخ إلى الصيغة المطلوبة ISO مع الوقت
      const formattedDate = dateOfBirth.toISOString(); // ستصبح: 2026-05-01T20:04:41.466Z

      const requestBody = {
        bloodType: bloodType.trim(),
        chronicDiseases: chronicDiseases.trim() || null,
        currentMedications: currentMedications.trim() || null,
        allergies: allergies.trim() || null,
        dateOfBirth: formattedDate,
        emergencyContacts: emergencyContacts.filter(
          (c) => c.name.trim() && c.phoneNumber.trim(),
        ),
      };

      console.log("Sending:", JSON.stringify(requestBody, null, 2));

      const response = await api.post(
        "/Citizen/create-medical-history",
        requestBody,
      );

      if (response.status === 200) {
        Alert.alert("نجاح", "تم إنشاء السجل الطبي بنجاح");
        await fetchMedicalHistory();
      }
    } catch (error) {
      console.error("Error:", error.response?.data);
      Alert.alert(
        "خطأ",
        error.response?.data?.message || "فشل في إنشاء السجل الطبي",
      );
    } finally {
      setLoading(false);
    }
  };

  // تحديث السجل الطبي
  const updateMedicalHistory = async () => {
    if (!bloodType || !dateOfBirth) {
      Alert.alert("تنبيه", "فصيلة الدم وتاريخ الميلاد مطلوبان");
      return;
    }

    setLoading(true);
    try {
      const formattedDate = dateOfBirth.toISOString();

      const requestBody = {
        bloodType: bloodType.trim(),
        chronicDiseases: chronicDiseases.trim() || null,
        currentMedications: currentMedications.trim() || null,
        allergies: allergies.trim() || null,
        dateOfBirth: formattedDate,
      };

      const response = await api.patch(
        "/Citizen/update-medical-details",
        requestBody,
      );

      if (response.status === 200) {
        Alert.alert("نجاح", "تم تحديث السجل الطبي بنجاح");
        await fetchMedicalHistory();
      }
    } catch (error) {
      Alert.alert(
        "خطأ",
        error.response?.data?.message || "فشل في تحديث السجل الطبي",
      );
    } finally {
      setLoading(false);
    }
  };

  // تحديث جهات الاتصال
  const updateEmergencyContacts = async () => {
    const validContacts = emergencyContacts.filter(
      (c) => c.name.trim() && c.phoneNumber.trim(),
    );

    if (validContacts.length === 0) {
      Alert.alert("تنبيه", "يرجى إدخال جهة اتصال طارئة واحدة على الأقل");
      return;
    }

    setLoading(true);
    try {
      const response = await api.patch(
        "/Citizen/update-emergency-contacts",
        validContacts,
      );

      if (response.status === 200) {
        Alert.alert("نجاح", "تم تحديث جهات الاتصال بنجاح");
        await fetchMedicalHistory();
      }
    } catch (error) {
      Alert.alert(
        "خطأ",
        error.response?.data?.message || "فشل في تحديث جهات الاتصال",
      );
    } finally {
      setLoading(false);
    }
  };

  // حذف السجل الطبي
  const deleteMedicalHistory = async () => {
    Alert.alert(
      "تأكيد الحذف",
      "هل أنت متأكد من حذف السجل الطبي بالكامل؟ هذا الإجراء لا يمكن التراجع عنه.",
      [
        { text: "إلغاء", style: "cancel" },
        {
          text: "حذف",
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            try {
              const response = await api.delete(
                "/Citizen/delete-medical-history",
              );

              if (response.status === 200) {
                Alert.alert("نجاح", "تم حذف السجل الطبي بنجاح");
                // إعادة تعيين الحقول
                setHasMedicalRecord(false);
                setShowForm(false);
                setBloodType("");
                setChronicDiseases("");
                setCurrentMedications("");
                setAllergies("");
                setDateOfBirth(new Date());
                setEmergencyContacts([{ name: "", phoneNumber: "" }]);
              }
            } catch (error) {
              Alert.alert(
                "خطأ",
                error.response?.data?.message || "فشل في حذف السجل الطبي",
              );
            } finally {
              setLoading(false);
            }
          },
        },
      ],
    );
  };

  const addEmergencyContact = () => {
    if (emergencyContacts.length < 5) {
      setEmergencyContacts([
        ...emergencyContacts,
        { name: "", phoneNumber: "" },
      ]);
    }
  };

  const updateContact = (index, field, value) => {
    const updated = [...emergencyContacts];
    updated[index][field] = value;
    setEmergencyContacts(updated);
  };

  const removeEmergencyContact = (index) => {
    if (emergencyContacts.length > 1) {
      const updated = [...emergencyContacts];
      updated.splice(index, 1);
      setEmergencyContacts(updated);
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDateOfBirth(selectedDate);
    }
  };

  useEffect(() => {
    fetchMedicalHistory();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0A5B8C" />
        <Text style={styles.loadingText}>جاري التحميل...</Text>
      </View>
    );
  }

  // شاشة إضافة سجل جديد
  if (!hasMedicalRecord && !showForm) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#0A5B8C" />

        <View style={styles.banner}>
          <Text style={styles.bannerLogo}>🏥</Text>
          <View style={styles.bannerTextContainer}>
            <Text style={styles.bannerTitle}>نظام الخدمات الطبية</Text>
            <Text style={styles.bannerSubtitle}>PSRS - السجل الصحي الموحد</Text>
          </View>
        </View>

        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>📋</Text>
          <Text style={styles.emptyTitle}>لم يضف سجل طبي بعد</Text>
          <Text style={styles.emptySubtitle}>يمكنك إضافة سجلك الطبي الآن</Text>

          <TouchableOpacity
            style={styles.addRecordButton}
            onPress={() => setShowForm(true)}
          >
            <Text style={styles.addRecordButtonText}>+ إضافة سجل طبي</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // عرض النموذج
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0A5B8C" />

      <View style={styles.banner}>
        <Text style={styles.bannerLogo}>🏥</Text>
        <View style={styles.bannerTextContainer}>
          <Text style={styles.bannerTitle}>نظام الخدمات الطبية</Text>
          <Text style={styles.bannerSubtitle}>PSRS - السجل الصحي الموحد</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.pageTitle}>
          {hasMedicalRecord ? "سجلي الطبي" : "إضافة سجل طبي جديد"}
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>المعلومات الطبية</Text>

          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>فصيلة الدم *</Text>
              <TextInput
                style={styles.input}
                value={bloodType}
                onChangeText={setBloodType}
                placeholder="مثال: A+"
                placeholderTextColor="#999"
              />
            </View>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>تاريخ الميلاد *</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.dateButtonText}>
                  {formatDate(dateOfBirth)}
                </Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={dateOfBirth}
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={onDateChange}
                  maximumDate={new Date()}
                />
              )}
            </View>
          </View>

          <Text style={styles.label}>الأمراض المزمنة</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={chronicDiseases}
            onChangeText={setChronicDiseases}
            placeholder="مثال: ضغط الدم، السكري"
            placeholderTextColor="#999"
            multiline
            numberOfLines={3}
          />

          <Text style={styles.label}>الأدوية الحالية</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={currentMedications}
            onChangeText={setCurrentMedications}
            placeholder="الأدوية التي تتناولها حالياً"
            placeholderTextColor="#999"
            multiline
            numberOfLines={3}
          />

          <Text style={styles.label}>الحساسية</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={allergies}
            onChangeText={setAllergies}
            placeholder="مثال: حساسية من البنسلين"
            placeholderTextColor="#999"
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>جهات الاتصال الطارئة</Text>

          {emergencyContacts.map((contact, index) => (
            <View key={index} style={styles.contactBox}>
              <View style={styles.contactHeader}>
                <Text style={styles.contactNumber}>جهة اتصال {index + 1}</Text>
                {emergencyContacts.length > 1 && (
                  <TouchableOpacity
                    onPress={() => removeEmergencyContact(index)}
                  >
                    <Text style={styles.removeIcon}>✖</Text>
                  </TouchableOpacity>
                )}
              </View>
              <View style={styles.row}>
                <View style={styles.halfWidth}>
                  <Text style={styles.label}>الاسم الكامل</Text>
                  <TextInput
                    style={styles.input}
                    value={contact.name}
                    onChangeText={(value) =>
                      updateContact(index, "name", value)
                    }
                    placeholder="الاسم"
                    placeholderTextColor="#999"
                  />
                </View>
                <View style={styles.halfWidth}>
                  <Text style={styles.label}>رقم الهاتف</Text>
                  <TextInput
                    style={styles.input}
                    value={contact.phoneNumber}
                    onChangeText={(value) =>
                      updateContact(index, "phoneNumber", value)
                    }
                    placeholder="رقم الهاتف"
                    placeholderTextColor="#999"
                    keyboardType="phone-pad"
                  />
                </View>
              </View>
            </View>
          ))}

          <TouchableOpacity
            style={styles.addButton}
            onPress={addEmergencyContact}
          >
            <Text style={styles.addButtonText}>+ إضافة جهة اتصال</Text>
          </TouchableOpacity>
        </View>

        {/* أزرار الإجراءات */}
        <View style={styles.buttonsContainer}>
          {!hasMedicalRecord ? (
            <TouchableOpacity
              style={[styles.actionButton, styles.createButton]}
              onPress={createMedicalHistory}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.actionButtonText}>💾 حفظ السجل الطبي</Text>
              )}
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity
                style={[styles.actionButton, styles.updateButton]}
                onPress={updateMedicalHistory}
                disabled={loading}
              >
                <Text style={styles.actionButtonText}>
                  ✏️ تحديث التفاصيل الطبية
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.contactsButton]}
                onPress={updateEmergencyContacts}
                disabled={loading}
              >
                <Text style={styles.actionButtonText}>
                  📞 تحديث جهات الاتصال
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={deleteMedicalHistory}
                disabled={loading}
              >
                <Text style={styles.actionButtonText}>🗑️ حذف السجل الطبي</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F7FA",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: "#0A5B8C",
  },
  banner: {
    backgroundColor: "#0A5B8C",
    paddingHorizontal: 20,
    paddingVertical: 35,
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  bannerLogo: {
    fontSize: 30,
    backgroundColor: "#FFFFFF",
    padding: 10,
    borderRadius: 40,
    overflow: "hidden",
  },
  bannerTextContainer: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  bannerSubtitle: {
    fontSize: 12,
    color: "#D0E8F5",
    marginTop: 3,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyEmoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1A2B4C",
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 30,
  },
  addRecordButton: {
    backgroundColor: "#0A5B8C",
    paddingHorizontal: 30,
    paddingVertical: 14,
    borderRadius: 12,
  },
  addRecordButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1A2B4C",
    marginBottom: 20,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1A2B4C",
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingBottom: 8,
  },
  row: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  halfWidth: {
    flex: 1,
  },
  label: {
    fontSize: 13,
    fontWeight: "500",
    color: "#4B5563",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: "#F9FAFB",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  dateButton: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#F9FAFB",
    justifyContent: "center",
  },
  dateButtonText: {
    fontSize: 14,
    color: "#1A2B4C",
  },
  contactBox: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  contactHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  contactNumber: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0A5B8C",
  },
  removeIcon: {
    fontSize: 18,
    color: "#DC2626",
    padding: 4,
  },
  addButton: {
    backgroundColor: "#EBF5FF",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#BFDBFE",
    borderStyle: "dashed",
  },
  addButtonText: {
    color: "#0A5B8C",
    fontWeight: "600",
    fontSize: 14,
  },
  buttonsContainer: {
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  createButton: {
    backgroundColor: "#10B981",
  },
  updateButton: {
    backgroundColor: "#3B82F6",
  },
  contactsButton: {
    backgroundColor: "#F59E0B",
  },
  deleteButton: {
    backgroundColor: "#EF4444",
  },
});

export default MedicalHistoryScreen;
