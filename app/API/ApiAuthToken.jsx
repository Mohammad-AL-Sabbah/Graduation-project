import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Alert } from "react-native";
import eventEmitter from "../utils/eventEmitter";

const BASE_URL = "https://psrs-palestine.runasp.net/api";

// 1. نسخة للطلبات العادية
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// 2. نسخة خام (بدون Interceptors) لعمليات الـ Refresh فقط
const basicAxios = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});

let isRefreshing = false;
let failedQueue = [];
let storedRefreshToken = null;

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

export const setRefreshToken = async (token) => {
  if (token) {
    storedRefreshToken = token;
    await AsyncStorage.setItem("refreshToken", token);
  }
};

export const getRefreshToken = async () => {
  if (storedRefreshToken) return storedRefreshToken;
  return await AsyncStorage.getItem("refreshToken");
};

export const clearTokens = async () => {
  storedRefreshToken = null;
  await AsyncStorage.multiRemove(["accessToken", "refreshToken", "user"]);
};

// Request Interceptor
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response Interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // معالجة الحظر
    if (error.response?.status === 403 && error.response?.data?.isBlocked) {
      await clearTokens();
      eventEmitter.emit("LOGOUT");
      Alert.alert("تنبيه", "تم حظر حسابك، يرجى مراجعة الإدارة");
      return Promise.reject(error);
    }

    // إذا فشل التجديد نفسه أو انتهت صلاحية الـ Refresh Token
    if (originalRequest.url.includes("refresh-token-mobile")) {
      await clearTokens();
      eventEmitter.emit("LOGOUT");
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await getRefreshToken();
        if (!refreshToken) throw new Error("No refresh token available");

        // ✅ استخدام النسخة الخام لتجنب التعليق
        const response = await basicAxios.post(
          "/Auth/Account/refresh-token-mobile",
          {
            refreshToken: refreshToken,
          },
        );

        if (response.data.success) {
          const { accessToken, refreshToken: newRefreshToken } = response.data;

          await AsyncStorage.setItem("accessToken", accessToken);
          await setRefreshToken(newRefreshToken);

          processQueue(null, accessToken);
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        await clearTokens();
        eventEmitter.emit("LOGOUT");
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default api;
