import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import { cancelAllNotifications } from "@/services/notifications";

const NOTIF_ENABLED_KEY = "notificationsEnabled";

type NotificationContextType = {
  enabled: boolean;
  enable: () => Promise<void>;
  disable: () => Promise<void>;
};

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    loadEnabled();
  }, []);

  const loadEnabled = async () => {
    try {
      const stored = await AsyncStorage.getItem(NOTIF_ENABLED_KEY);
      setEnabled(stored === "true");
    } catch (e) {
      console.error("Error loading notification setting", e);
    }
  };

  const enable = async () => {
    setEnabled(true);
    await AsyncStorage.setItem(NOTIF_ENABLED_KEY, "true");
  };

  const disable = async () => {
    setEnabled(false);
    await AsyncStorage.setItem(NOTIF_ENABLED_KEY, "false");
    await cancelAllNotifications();
  };

  return (
    <NotificationContext.Provider value={{ enabled, enable, disable }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return context;
}
