import MoneyBagIcon from "@/components/MoneyBagIcon";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import { useNotification } from "@/context/NotificationContext";
import { syncNotifications } from "@/services/notifications";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Keyboard,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ExpensesScreen() {
  const { theme: colors } = useTheme();
  const { t } = useLanguage();
  const { enabled: notifEnabled } = useNotification();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [recurringExpenses, setRecurringExpenses] = useState<any[]>([]);
  const [remaining, setRemaining] = useState(0);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [showAddRecurring, setShowAddRecurring] = useState(false);
  const [recurringDay, setRecurringDay] = useState(String(new Date().getDate()));
  const [showRemainingInput, setShowRemainingInput] = useState(false);
  const [remainingInput, setRemainingInput] = useState("");
  const [editingExpense, setEditingExpense] = useState<any>(null);
  const [editDescription, setEditDescription] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editDay, setEditDay] = useState("");
  const [showDayGridAdd, setShowDayGridAdd] = useState(false);
  const [showDayGridEdit, setShowDayGridEdit] = useState(false);
  const swipeableRefs = useRef<{ [key: number]: any }>({});

  const getCurrentMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  };

  useEffect(() => {
    loadExpenses();
    loadRecurringExpenses();
    loadRemaining();
  }, []);

  useEffect(() => {
    if (notifEnabled) {
      syncNotifications(recurringExpenses, t.notifTitle, t.notifBody);
    }
  }, [notifEnabled, recurringExpenses, t.notifTitle, t.notifBody]);

  const loadExpenses = async () => {
    try {
      const stored = await AsyncStorage.getItem("expenses");
      if (stored) setExpenses(JSON.parse(stored));
    } catch (e) {
      console.error("Error loading expenses", e);
    }
  };

  const loadRecurringExpenses = async () => {
    try {
      const stored = await AsyncStorage.getItem("recurringExpenses");
      if (stored) setRecurringExpenses(JSON.parse(stored));
    } catch (e) {
      console.error("Error loading recurring expenses", e);
    }
  };

  const loadRemaining = async () => {
    try {
      const stored = await AsyncStorage.getItem("remaining");
      if (stored) {
        const parsed = parseFloat(stored);
        setRemaining(isNaN(parsed) ? 0 : parsed);
      }
    } catch (e) {
      console.error("Error loading remaining", e);
    }
  };

  const saveExpenses = async (newExpenses: any[]) => {
    try {
      await AsyncStorage.setItem("expenses", JSON.stringify(newExpenses));
    } catch (e) {
      console.error("Error saving expenses", e);
    }
  };

  const addExpense = () => {
    if (!description.trim()) {
      Alert.alert("Erreur", t.errorName);
      return;
    }
    if (!amount.trim()) {
      Alert.alert("Erreur", t.errorAmount);
      return;
    }
    const expenseAmount = parseFloat(amount.replace(",", "."));
    if (isNaN(expenseAmount) || expenseAmount <= 0) {
      Alert.alert("Erreur", t.errorAmountValid);
      return;
    }
    const newExpense = {
      id: Date.now(),
      description: description.trim(),
      amount: expenseAmount,
      date: new Date().toLocaleDateString("fr-FR"),
    };
    const updated = [newExpense, ...expenses];
    setExpenses(updated);
    saveExpenses(updated);
    setRemaining((prev) => {
      const newRemaining = prev - expenseAmount;
      saveRemaining(newRemaining);
      return newRemaining;
    });
    setDescription("");
    setAmount("");
    Keyboard.dismiss();
  };

  const deleteExpense = (id: number) => {
    const expenseToDelete = expenses.find((e) => e.id === id);
    const updated = expenses.filter((e) => e.id !== id);
    setExpenses(updated);
    saveExpenses(updated);
    if (expenseToDelete) {
      setRemaining((prev) => {
        const newRemaining = prev + expenseToDelete.amount;
        saveRemaining(newRemaining);
        return newRemaining;
      });
    }
  };

  const handleExpensePress = (item: any) => {
    const isRecurring = item.paidMonths !== undefined;
    Alert.alert(
      t.editExpense,
      "",
      [
        { text: t.cancel, style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: () =>
            isRecurring
              ? deleteRecurringExpense(item.id)
              : deleteExpense(item.id),
        },
        { text: "Modifier", onPress: () => openEditModal(item) },
      ],
      { cancelable: true },
    );
  };

  const openEditModal = (item: any) => {
    setEditingExpense(item);
    setEditDescription(item.description);
    setEditAmount(item.amount.toString());
    setEditDay(item.day ? String(item.day) : "");
  };

  const closeEditModal = () => {
    setEditingExpense(null);
    setEditDescription("");
    setEditAmount("");
    setEditDay("");
    setShowDayGridEdit(false);
  };

  const saveEdit = () => {
    if (!editDescription.trim()) {
      Alert.alert("Erreur", t.errorName);
      return;
    }
    if (!editAmount.trim()) {
      Alert.alert("Erreur", t.errorAmount);
      return;
    }
    const newAmount = parseFloat(editAmount.replace(",", "."));
    if (isNaN(newAmount) || newAmount <= 0) {
      Alert.alert("Erreur", t.errorAmountValid);
      return;
    }

    if (editingExpense.paidMonths) {
      const newDay = parseInt(editDay);
      if (isNaN(newDay) || newDay < 1 || newDay > 31) {
        Alert.alert("Erreur", t.errorAmountValid);
        return;
      }
      const updated = recurringExpenses.map((re: any) => {
        if (re.id === editingExpense.id) {
          const oldAmount = re.amount;
          const amountDiff = newAmount - oldAmount;
          const isPaid = re.paidMonths.includes(getCurrentMonth());

          if (isPaid && amountDiff !== 0) {
            setRemaining((prev) => {
              const newRemaining = prev - amountDiff;
              saveRemaining(newRemaining);
              return newRemaining;
            });
          }

          return {
            ...re,
            description: editDescription.trim(),
            amount: newAmount,
            day: newDay,
          };
        }
        return re;
      });
      setRecurringExpenses(updated);
      saveRecurringExpenses(updated);
    } else {
      const updated = expenses.map((e: any) => {
        if (e.id === editingExpense.id) {
          const oldAmount = e.amount;
          const amountDiff = newAmount - oldAmount;

          if (amountDiff !== 0) {
            setRemaining((prev) => {
              const newRemaining = prev - amountDiff;
              saveRemaining(newRemaining);
              return newRemaining;
            });
          }

          return {
            ...e,
            description: editDescription.trim(),
            amount: newAmount,
          };
        }
        return e;
      });
      setExpenses(updated);
      saveExpenses(updated);
    }
    closeEditModal();
  };

  const saveRecurringExpenses = async (newRecurring: any[]) => {
    try {
      await AsyncStorage.setItem(
        "recurringExpenses",
        JSON.stringify(newRecurring),
      );
    } catch (e) {
      console.error("Error saving recurring expenses", e);
    }
  };

  const addRecurringExpense = () => {
    if (!description.trim()) {
      Alert.alert("Erreur", t.errorName);
      return;
    }
    if (!amount.trim()) {
      Alert.alert("Erreur", t.errorAmount);
      return;
    }
    const recurringAmount = parseFloat(amount.replace(",", "."));
    if (isNaN(recurringAmount) || recurringAmount <= 0) {
      Alert.alert("Erreur", t.errorAmountValid);
      return;
    }
    const day = parseInt(recurringDay);
    if (isNaN(day) || day < 1 || day > 31) {
      Alert.alert("Erreur", t.errorAmountValid);
      return;
    }
    const newRecurring = {
      id: Date.now(),
      description: description.trim(),
      amount: recurringAmount,
      day: day,
      paidMonths: [],
    };
    const updated = [...recurringExpenses, newRecurring];
    setRecurringExpenses(updated);
    saveRecurringExpenses(updated);
    setDescription("");
    setAmount("");
    setRecurringDay(String(new Date().getDate()));
    setShowAddRecurring(false);
    Keyboard.dismiss();
  };

  const toggleRecurringPaid = (id: number) => {
    const currentMonth = getCurrentMonth();
    const updated = recurringExpenses.map((re: any) => {
      if (re.id === id) {
        const isPaid = re.paidMonths.includes(currentMonth);
        const paidMonths = isPaid
          ? re.paidMonths.filter((m: string) => m !== currentMonth)
          : [...re.paidMonths, currentMonth];

        if (isPaid) {
          setRemaining((prev) => {
            const newRemaining = prev + re.amount;
            saveRemaining(newRemaining);
            return newRemaining;
          });
        } else {
          setRemaining((prev) => {
            const newRemaining = prev - re.amount;
            saveRemaining(newRemaining);
            return newRemaining;
          });
        }

        return { ...re, paidMonths };
      }
      return re;
    });
    setRecurringExpenses(updated);
    saveRecurringExpenses(updated);
  };

  const deleteRecurringExpense = (id: number) => {
    const expenseToDelete = recurringExpenses.find((re: any) => re.id === id);
    const currentMonth = getCurrentMonth();
    const updated = recurringExpenses.filter((re: any) => re.id !== id);
    setRecurringExpenses(updated);
    saveRecurringExpenses(updated);

    if (expenseToDelete && expenseToDelete.paidMonths.includes(currentMonth)) {
      setRemaining((prev) => {
        const newRemaining = prev + expenseToDelete.amount;
        saveRemaining(newRemaining);
        return newRemaining;
      });
    }
  };

  const resetRecurringExpenses = () => {
    const updated = recurringExpenses.map((re: any) => ({
      ...re,
      paidMonths: [],
    }));
    setRecurringExpenses(updated);
    saveRecurringExpenses(updated);
  };

  const saveRemaining = async (newRemaining: number) => {
    try {
      await AsyncStorage.setItem("remaining", newRemaining.toString());
    } catch (e) {
      console.error("Error saving remaining", e);
    }
  };

  const fullReset = () => {
    setExpenses([]);
    saveExpenses([]);
    const updatedRecurring = recurringExpenses.map((re: any) => ({
      ...re,
      paidMonths: [],
    }));
    setRecurringExpenses(updatedRecurring);
    saveRecurringExpenses(updatedRecurring);
  };

  const updateRemaining = () => {
    if (!remainingInput.trim()) {
      Alert.alert("Erreur", t.errorAmountEmpty);
      return;
    }
    const addedAmount = parseFloat(remainingInput.replace(",", "."));
    if (isNaN(addedAmount)) {
      Alert.alert("Erreur", t.errorAmountValid);
      return;
    }
    const newRemaining = remaining + addedAmount;
    setRemaining(newRemaining);
    saveRemaining(newRemaining);
    setRemainingInput("");
    setShowRemainingInput(false);
  };

  const isRecurringPaid = (paidMonths: string[]) =>
    paidMonths.includes(getCurrentMonth());

  const getDaysUntil = (day: number) => {
    const now = new Date();
    let target = new Date(now.getFullYear(), now.getMonth(), day);
    if (target.getTime() < now.setHours(0, 0, 0, 0)) {
      target = new Date(now.getFullYear(), now.getMonth() + 1, day);
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Math.round(
      (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );
  };

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  const unpaidRecurringTotal = recurringExpenses
    .filter((re: any) => !isRecurringPaid(re.paidMonths))
    .reduce((sum, e) => sum + e.amount, 0);

  const getStyles = () =>
    StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: colors.bg,
      },
      header: {
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 20,
        backgroundColor: colors.accent,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
      },
      headerTop: {
        flexDirection: "row",
        alignItems: "flex-start",
      },
      budgetRow: {
        flexDirection: "row",
        alignItems: "center",
      },
      budgetAmount: {
        fontSize: 28,
        fontWeight: "700",
        color: "#fff",
      },
      headerStats: {
        flexDirection: "row",
        marginTop: 14,
        gap: 16,
      },
      statItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
      },
      statText: {
        fontSize: 12,
        color: "rgba(255,255,255,0.75)",
        fontWeight: "500",
      },
      budgetInputContainer: {
        flexDirection: "row",
        padding: 10,
        backgroundColor: colors.accentLight,
        margin: 12,
        borderRadius: 16,
        alignItems: "center",
        gap: 8,
      },
      budgetInput: {
        flex: 1,
        backgroundColor: colors.card,
        borderRadius: 12,
        padding: 12,
        fontSize: 15,
        color: colors.text,
      },
      inputContainer: {
        flexDirection: "row",
        padding: 10,
        backgroundColor: colors.card,
        margin: 12,
        borderRadius: 16,
        alignItems: "center",
        gap: 6,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.border,
      },
      input: {
        flex: 1,
        backgroundColor: colors.inputBg,
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 14,
        color: colors.text,
      },
      amountInput: {
        flex: 0,
        width: 100,
        textAlign: "center",
      },
      iconBtn: {
        backgroundColor: colors.accent,
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: colors.accent,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 3,
      },
      iconBtnSuccess: {
        backgroundColor: colors.success,
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: colors.success,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 3,
      },
      iconBtnDanger: {
        backgroundColor: colors.danger,
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: colors.danger,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 3,
      },
      sectionCard: {
        marginHorizontal: 12,
        marginBottom: 16,
        backgroundColor: colors.card,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.border,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        overflow: "hidden",
      },
      sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      },
      sectionLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
      },
      sectionTitle: {
        fontSize: 13,
        fontWeight: "600",
        color: colors.text,
      },
      countBadge: {
        backgroundColor: colors.accentLight,
        borderRadius: 10,
        paddingHorizontal: 7,
        paddingVertical: 2,
      },
      countText: {
        fontSize: 11,
        fontWeight: "600",
        color: colors.accent,
      },
      resetBtn: {
        backgroundColor: colors.accentLight,
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 12,
      },
      resetText: {
        color: colors.text,
        fontSize: 11,
        fontWeight: "600",
      },
      list: {
        paddingHorizontal: 12,
        paddingTop: 8,
      },
      divider: {
        height: 1,
        backgroundColor: colors.border,
        marginHorizontal: 16,
      },
      emptySection: {
        paddingVertical: 30,
        alignItems: "center",
      },
      emptyText: {
        fontSize: 14,
        color: colors.textSecondary,
        fontStyle: "italic",
      },
      item: {
        flexDirection: "row",
        paddingHorizontal: 16,
        paddingVertical: 14,
        alignItems: "center",
      },
      recurringItem: {
        backgroundColor: colors.accentLight,
      },
      recurringPaid: {
        backgroundColor: colors.accentMedium,
      },
      itemContent: {
        flex: 1,
      },
      itemContentClickable: {
        flex: 1,
      },
      description: {
        fontSize: 14,
        fontWeight: "500",
        color: colors.text,
      },
      date: {
        fontSize: 11,
        color: colors.textSecondary,
        marginTop: 2,
      },
      recurringBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 3,
        marginTop: 3,
      },
      recurringLabel: {
        fontSize: 11,
        color: colors.accent,
        fontWeight: "600",
      },
      itemRight: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
      },
      amount: {
        fontSize: 15,
        fontWeight: "600",
        color: colors.text,
      },
      amountPaid: {
        color: colors.success,
      },
      checkbox: {
        marginRight: 10,
      },
      checkboxInner: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 2,
        borderColor: colors.accent,
        justifyContent: "center",
        alignItems: "center",
      },
      checkboxChecked: {
        backgroundColor: colors.success,
        borderColor: colors.success,
      },
      fullResetBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        marginHorizontal: 12,
        marginBottom: 12,
        padding: 14,
        borderRadius: 14,
        backgroundColor: colors.dangerLight,
        borderWidth: 1,
        borderColor: colors.danger,
      },
      fullResetText: {
        color: colors.danger,
        fontSize: 14,
        fontWeight: "600",
      },
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
      modalLabel: {
        fontSize: 14,
        fontWeight: "600",
        color: colors.text,
        marginBottom: 8,
      },
      modalInput: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 10,
        padding: 12,
        fontSize: 16,
        color: colors.text,
        marginBottom: 16,
      },
      modalFooter: {
        flexDirection: "row",
        padding: 20,
        gap: 12,
        borderTopWidth: 1,
        borderTopColor: colors.border,
      },
      modalBtnSecondary: {
        flex: 1,
        padding: 14,
        borderRadius: 12,
        backgroundColor: colors.inputBg,
        alignItems: "center",
      },
      modalBtnTextSecondary: {
        fontSize: 16,
        fontWeight: "600",
        color: colors.textSecondary,
      },
      modalBtnPrimary: {
        flex: 1,
        padding: 14,
        borderRadius: 12,
        backgroundColor: colors.accent,
        alignItems: "center",
      },
      modalBtnTextPrimary: {
        fontSize: 16,
        fontWeight: "600",
        color: "#fff",
      },
      walletContainer: {
        position: "absolute",
        left: -30,
        bottom: 50,
        alignItems: "flex-start",
        justifyContent: "flex-end",
        zIndex: -1,
      },
      walletIcon: {
        opacity: 0.12,
        transform: [{ rotate: "15deg" }],
      },
      swipeDelete: {
        backgroundColor: colors.danger,
        justifyContent: "center",
        alignItems: "center",
        width: 80,
        height: "100%",
      },
      dayPickerBtn: {
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
        paddingVertical: 10,
      },
      dayPickerBtnText: {
        fontSize: 14,
        fontWeight: "600",
        color: colors.accent,
      },
      dayGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 20,
      },
      dayGridInline: {
        flexDirection: "row",
        flexWrap: "wrap",
        paddingHorizontal: 12,
        paddingVertical: 12,
        gap: 6,
        backgroundColor: colors.card,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      },
      dayCell: {
        width: "13%",
        aspectRatio: 1,
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 8,
        backgroundColor: colors.inputBg,
      },
      dayCellSelected: {
        backgroundColor: colors.accent,
      },
      dayCellText: {
        fontSize: 15,
        fontWeight: "600",
        color: colors.text,
      },
      dayCellTextSelected: {
        color: "#fff",
      },
      dayCellToday: {
        borderWidth: 1.5,
        borderColor: colors.accent,
      },
    });

  const styles = getStyles();

  const renderRecurringItem = ({ item }: { item: any }) => {
    const isPaid = isRecurringPaid(item.paidMonths);
    return (
      <Swipeable
        ref={(ref) => {
          if (ref) swipeableRefs.current[`recurring-${item.id}`] = ref;
        }}
        friction={3}
        rightThreshold={60}
        overshootRight={false}
        renderRightActions={() => (
          <View style={styles.swipeDelete}>
            <Ionicons name="trash" size={24} color="#fff" />
          </View>
        )}
        onSwipeableWillOpen={() => {
          swipeableRefs.current[`recurring-${item.id}`]?.close();
          setTimeout(() => {
            Alert.alert(
              t.confirmDelete,
              t.confirmDeleteMessage,
              [
                { text: t.cancel, style: "cancel" },
                { 
                  text: t.delete, 
                  style: "destructive", 
                  onPress: () => deleteRecurringExpense(item.id) 
                },
              ],
              { cancelable: true }
            );
          }, 150);
        }}
      >
        <View
          style={[
            styles.item,
            isPaid ? styles.recurringPaid : styles.recurringItem,
          ]}
        >
          <TouchableOpacity
            onPress={() => toggleRecurringPaid(item.id)}
            style={styles.checkbox}
          >
            <View
              style={[styles.checkboxInner, isPaid && styles.checkboxChecked]}
            >
              {isPaid && <Ionicons name="checkmark" size={14} color="#fff" />}
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleExpensePress(item)}
            style={styles.itemContentClickable}
          >
            <View style={styles.itemContent}>
              <Text style={styles.description}>{item.description}</Text>
              <View style={styles.recurringBadge}>
                <Ionicons
                  name="refresh-outline"
                  size={10}
                  color={colors.accent}
                />
                <Text style={styles.recurringLabel}>{t.recurring}</Text>
                {item.day && (
                  <>
                    <Ionicons
                      name="calendar-outline"
                      size={10}
                      color={colors.textSecondary}
                      style={{ marginLeft: 6 }}
                    />
                    <Text style={[styles.date, { marginTop: 0 }]}>
                      {isPaid
                        ? t.charged
                        : (() => {
                            const days = getDaysUntil(item.day);
                            if (days <= 0) return `${t.chargedOn} ${item.day} (${t.today})`;
                            if (days === 1) return `${t.chargedOn} ${item.day} (${t.inOneDay})`;
                            return `${t.chargedOn} ${item.day} (dans ${days} ${t.inDays})`;
                          })()}
                    </Text>
                  </>
                )}
              </View>
            </View>
          </TouchableOpacity>
          <View style={styles.itemRight}>
            <Text style={[styles.amount, isPaid && styles.amountPaid]}>
              {item.amount.toFixed(2)}€
            </Text>
          </View>
        </View>
      </Swipeable>
    );
  };

  const renderItem = ({ item }: { item: any }) => (
    <Swipeable
      ref={(ref) => {
        if (ref) swipeableRefs.current[`expense-${item.id}`] = ref;
      }}
      friction={1}
      rightThreshold={60}
      overshootRight={false}
      renderRightActions={() => (
        <View style={styles.swipeDelete}>
          <Ionicons name="trash" size={24} color="#fff" />
        </View>
      )}
      onSwipeableWillOpen={() => {
        swipeableRefs.current[`expense-${item.id}`]?.close();
        setTimeout(() => {
          Alert.alert(
            t.confirmDelete,
            t.confirmDeleteMessage,
            [
              { text: t.cancel, style: "cancel" },
              { 
                text: t.delete, 
                style: "destructive", 
                onPress: () => deleteExpense(item.id) 
              },
            ],
            { cancelable: true }
          );
        }, 150);
      }}
    >
      <TouchableOpacity
        onPress={() => handleExpensePress(item)}
        style={styles.item}
      >
        <View style={styles.itemContent}>
          <Text style={styles.description}>{item.description}</Text>
          <Text style={styles.date}>{item.date}</Text>
        </View>
        <View style={styles.itemRight}>
          <Text style={styles.amount}>-{item.amount.toFixed(2)}€</Text>
        </View>
      </TouchableOpacity>
    </Swipeable>
  );

  return (
    <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            onPress={() => setShowRemainingInput(true)}
            style={styles.budgetRow}
          >
            <Text style={styles.budgetAmount}>
              {(remaining < 0.01 && remaining > -0.01 ? 0 : remaining).toFixed(
                2,
              )}
              €
            </Text>
            <Ionicons
              name="add"
              size={14}
              color="rgba(255,255,255,0.7)"
              style={{ marginLeft: 6 }}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.headerStats}>
          <View style={styles.statItem}>
            <Ionicons
              name="cart-outline"
              size={13}
              color="rgba(255,255,255,0.7)"
            />
            <Text style={styles.statText}>
              {t.expensesTotal} {total.toFixed(2)}€
            </Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons
              name="refresh-outline"
              size={13}
              color="rgba(255,255,255,0.7)"
            />
            <Text style={styles.statText}>
              {t.unpaid} {unpaidRecurringTotal.toFixed(2)}€
            </Text>
          </View>
        </View>
      </View>

      {showRemainingInput && (
        <View style={styles.budgetInputContainer}>
          <TextInput
            style={styles.budgetInput}
            placeholder={t.addRemaining}
            placeholderTextColor={colors.textSecondary}
            value={remainingInput}
            onChangeText={setRemainingInput}
            keyboardType="numeric"
            autoFocus
          />
          <TouchableOpacity
            onPress={updateRemaining}
            style={styles.iconBtnSuccess}
          >
            <Ionicons name="checkmark" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setShowRemainingInput(false);
              setRemainingInput("");
            }}
            style={styles.iconBtnDanger}
          >
            <Ionicons name="close" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder={
            showAddRecurring ? t.descriptionRecurring : t.description
          }
          placeholderTextColor={colors.textSecondary}
          value={description}
          onChangeText={setDescription}
        />
        <TextInput
          style={[styles.input, styles.amountInput]}
          placeholder="€"
          placeholderTextColor={colors.textSecondary}
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
        />
        {showAddRecurring ? (
          <>
            <TouchableOpacity
              onPress={() => setShowDayGridAdd((v) => !v)}
              style={[styles.dayPickerBtn, { width: 60 }]}
            >
              <Ionicons name="calendar-outline" size={16} color={colors.accent} />
              <Text style={styles.dayPickerBtnText}>{recurringDay}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={addRecurringExpense}
              style={[styles.iconBtn, { backgroundColor: colors.accent }]}
            >
              <Ionicons name="checkmark" size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setShowAddRecurring(false);
                setDescription("");
                setAmount("");
              }}
              style={styles.iconBtnDanger}
            >
              <Ionicons name="close" size={20} color="#fff" />
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity onPress={addExpense} style={styles.iconBtn}>
              <Ionicons name="add" size={22} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowAddRecurring(true)}
              style={[
                styles.iconBtn,
                { backgroundColor: colors.accent, marginLeft: 6 },
              ]}
            >
              <Ionicons name="refresh" size={16} color="#fff" />
            </TouchableOpacity>
          </>
        )}
      </View>

      {showDayGridAdd && (
        <View style={styles.dayGridInline}>
          {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => {
            const isSelected = parseInt(recurringDay) === d;
            const isToday = new Date().getDate() === d;
            return (
              <TouchableOpacity
                key={d}
                onPress={() => {
                  setRecurringDay(String(d));
                  setShowDayGridAdd(false);
                }}
                style={[
                  styles.dayCell,
                  isSelected && styles.dayCellSelected,
                  isToday && !isSelected && styles.dayCellToday,
                ]}
              >
                <Text
                  style={[
                    styles.dayCellText,
                    isSelected && styles.dayCellTextSelected,
                  ]}
                >
                  {d}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionLeft}>
              <Ionicons
                name="refresh-circle-outline"
                size={16}
                color={colors.accent}
              />
              <Text style={styles.sectionTitle}>{t.recurringExpenses}</Text>
              <View style={styles.countBadge}>
                <Text style={styles.countText}>{recurringExpenses.length}</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={resetRecurringExpenses}
              style={styles.resetBtn}
            >
              <Text style={styles.resetText}>{t.reset}</Text>
            </TouchableOpacity>
          </View>
          {recurringExpenses.length > 0 ? (
            recurringExpenses.map((item, index) => (
              <View key={item.id.toString()}>
                {renderRecurringItem({ item })}
                {index < recurringExpenses.length - 1 && (
                  <View style={styles.divider} />
                )}
              </View>
            ))
          ) : (
            <View style={styles.emptySection}>
              <Text style={styles.emptyText}>{t.noRecurringExpenses}</Text>
            </View>
          )}
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionLeft}>
              <Text style={styles.sectionTitle}>{t.monthlyExpenses}</Text>
              <View style={styles.countBadge}>
                <Text style={styles.countText}>{expenses.length}</Text>
              </View>
            </View>
          </View>
          {expenses.length > 0 ? (
            expenses.map((item, index) => (
              <View key={item.id.toString()}>
                {renderItem({ item })}
                {index < expenses.length - 1 && <View style={styles.divider} />}
              </View>
            ))
          ) : (
            <View style={styles.emptySection}>
              <Text style={styles.emptyText}>{t.noMonthlyExpenses}</Text>
            </View>
          )}
        </View>

        <TouchableOpacity onPress={fullReset} style={styles.fullResetBtn}>
          <Ionicons name="refresh-outline" size={16} color={colors.danger} />
          <Text style={styles.fullResetText}>{t.resetMonth}</Text>
        </TouchableOpacity>

        <View style={{ height: 200 }} />
      </ScrollView>

      <View style={styles.walletContainer}>
        <MoneyBagIcon size={300} style={styles.walletIcon} />
      </View>

      <Modal
        visible={editingExpense !== null}
        transparent={true}
        animationType="slide"
        onRequestClose={closeEditModal}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={closeEditModal}
        >
          <TouchableOpacity style={styles.modalContent} activeOpacity={1}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t.editExpense}</Text>
              <TouchableOpacity onPress={closeEditModal}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.modalLabel}>{t.description}</Text>
              <TextInput
                style={styles.modalInput}
                value={editDescription}
                onChangeText={setEditDescription}
                placeholder={t.description}
                placeholderTextColor={colors.textSecondary}
              />

              <Text style={styles.modalLabel}>Montant</Text>
              <TextInput
                style={styles.modalInput}
                value={editAmount}
                onChangeText={setEditAmount}
                placeholder="0.00"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
              />

              {editingExpense?.paidMonths && (
                <>
                  <Text style={styles.modalLabel}>{t.dayLabel}</Text>
                  <TouchableOpacity
                    onPress={() => setShowDayGridEdit((v) => !v)}
                    style={styles.modalInput}
                  >
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                      <Ionicons name="calendar-outline" size={18} color={colors.textSecondary} />
                      <Text style={{ fontSize: 16, color: colors.text }}>
                        {editDay || "—"}
                      </Text>
                    </View>
                  </TouchableOpacity>
                  {showDayGridEdit && (
                    <View style={styles.dayGridInline}>
                      {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => {
                        const isSelected = parseInt(editDay) === d;
                        const isToday = new Date().getDate() === d;
                        return (
                          <TouchableOpacity
                            key={d}
                            onPress={() => {
                              setEditDay(String(d));
                              setShowDayGridEdit(false);
                            }}
                            style={[
                              styles.dayCell,
                              isSelected && styles.dayCellSelected,
                              isToday && !isSelected && styles.dayCellToday,
                            ]}
                          >
                            <Text
                              style={[
                                styles.dayCellText,
                                isSelected && styles.dayCellTextSelected,
                              ]}
                            >
                              {d}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}
                </>
              )}
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                onPress={closeEditModal}
                style={styles.modalBtnSecondary}
              >
                <Text style={styles.modalBtnTextSecondary}>{t.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={saveEdit}
                style={styles.modalBtnPrimary}
              >
                <Text style={styles.modalBtnTextPrimary}>{t.save}</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}
