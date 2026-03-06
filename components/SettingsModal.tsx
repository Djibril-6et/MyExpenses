import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "@/context/ThemeContext";
import { useLanguage } from "@/context/LanguageContext";
import { themeNames, themes } from "@/constants/themes";

export function SettingsModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const { theme: colors, themeName, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  const styles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "center",
      alignItems: "center",
    },
    modalContent: {
      backgroundColor: colors.card,
      borderRadius: 20,
      width: "90%",
      maxWidth: 400,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.25,
      shadowRadius: 20,
      elevation: 10,
    },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: colors.text,
    },
    modalBody: {
      padding: 20,
    },
    sectionLabel: {
      fontSize: 12,
      fontWeight: "700",
      color: colors.textSecondary,
      marginBottom: 12,
      marginTop: 16,
      textTransform: "uppercase",
      letterSpacing: 1,
    },
    themeOption: {
      flexDirection: "row",
      alignItems: "center",
      padding: 16,
      borderRadius: 12,
      marginBottom: 10,
      borderWidth: 2,
    },
    themeOptionSelected: {
      borderColor: colors.accent,
      backgroundColor: colors.accentLight,
    },
    themeOptionUnselected: {
      borderColor: colors.border,
      backgroundColor: colors.inputBg,
    },
    themeColorPreview: {
      width: 40,
      height: 40,
      borderRadius: 20,
      marginRight: 14,
    },
    themeOptionText: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
    },
    themeOptionCheck: {
      marginLeft: "auto",
    },
  });

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity style={styles.modalContent} activeOpacity={1}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{t.settings}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.modalBody}>
            <Text style={styles.sectionLabel}>{t.theme}</Text>
            {themeNames.map((themeItem) => (
              <TouchableOpacity
                key={themeItem.key}
                style={[
                  styles.themeOption,
                  themeName === themeItem.key
                    ? styles.themeOptionSelected
                    : styles.themeOptionUnselected,
                ]}
                onPress={() => setTheme(themeItem.key)}
              >
                <View
                  style={[
                    styles.themeColorPreview,
                    { backgroundColor: themes[themeItem.key].accent },
                  ]}
                />
                <Text style={styles.themeOptionText}>{themeItem.label}</Text>
                {themeName === themeItem.key && (
                  <View style={styles.themeOptionCheck}>
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color={colors.accent}
                    />
                  </View>
                )}
              </TouchableOpacity>
            ))}

            <Text style={[styles.sectionLabel, { marginTop: 20 }]}>
              {t.language}
            </Text>
            <TouchableOpacity
              style={[
                styles.themeOption,
                language === "fr"
                  ? styles.themeOptionSelected
                  : styles.themeOptionUnselected,
              ]}
              onPress={() => setLanguage("fr")}
            >
              <Text style={styles.themeOptionText}>🇫🇷 {t.french}</Text>
              {language === "fr" && (
                <View style={styles.themeOptionCheck}>
                  <Ionicons
                    name="checkmark-circle"
                    size={24}
                    color={colors.accent}
                  />
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.themeOption,
                language === "en"
                  ? styles.themeOptionSelected
                  : styles.themeOptionUnselected,
              ]}
              onPress={() => setLanguage("en")}
            >
              <Text style={styles.themeOptionText}>🇬🇧 {t.english}</Text>
              {language === "en" && (
                <View style={styles.themeOptionCheck}>
                  <Ionicons
                    name="checkmark-circle"
                    size={24}
                    color={colors.accent}
                  />
                </View>
              )}
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}
