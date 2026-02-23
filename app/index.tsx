import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Keyboard,
  Modal,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';
import { Ionicons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';
import WalletIcon from '@/components/WalletIcon';

const colors = {
  bg: '#F5F7FA',
  card: '#FFFFFF',
  primary: '#CBDDE9',
  primaryDark: '#A8C5D5',
  primaryLight: '#E8F0F6',
  accent: '#2872A1',
  accentLight: '#E3F0F7',
  success: '#4A9D6E',
  successLight: '#E8F5EF',
  warning: '#D4A750',
  warningLight: '#FEF7E8',
  danger: '#C75656',
  dangerLight: '#FDECE8',
  text: '#1A2733',
  textSecondary: '#5A6E82',
  textLight: '#9CA8B5',
  border: '#DCE4EB',
  inputBg: '#F8F9FC',
};

export default function ExpensesScreen() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [recurringExpenses, setRecurringExpenses] = useState<any[]>([]);
  const [remaining, setRemaining] = useState(0);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [showAddRecurring, setShowAddRecurring] = useState(false);
  const [showRemainingInput, setShowRemainingInput] = useState(false);
  const [remainingInput, setRemainingInput] = useState('');
  const [editingExpense, setEditingExpense] = useState<any>(null);
  const [editDescription, setEditDescription] = useState('');
  const [editAmount, setEditAmount] = useState('');

  const getCurrentMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  };

  useEffect(() => {
    if (Platform.OS !== 'web') {
      loadExpenses();
      loadRecurringExpenses();
      loadRemaining();
    }
  }, []);

  const loadExpenses = async () => {
    try {
      const stored = await SecureStore.getItemAsync('expenses');
      if (stored) setExpenses(JSON.parse(stored));
    } catch (e) { console.error('Error loading expenses', e); }
  };

  const loadRecurringExpenses = async () => {
    try {
      const stored = await SecureStore.getItemAsync('recurringExpenses');
      if (stored) setRecurringExpenses(JSON.parse(stored));
    } catch (e) { console.error('Error loading recurring expenses', e); }
  };

  const loadRemaining = async () => {
    try {
      const stored = await SecureStore.getItemAsync('remaining');
      if (stored) {
        const parsed = parseFloat(stored);
        setRemaining(isNaN(parsed) ? 0 : parsed);
      }
    } catch (e) { console.error('Error loading remaining', e); }
  };

  const saveExpenses = async (newExpenses: any[]) => {
    try { await SecureStore.setItemAsync('expenses', JSON.stringify(newExpenses)); }
    catch (e) { console.error('Error saving expenses', e); }
  };

  const addExpense = () => {
    if (!description.trim()) {
      Alert.alert('Erreur', 'Veuillez nommer la dépense');
      return;
    }
    if (!amount.trim()) {
      Alert.alert('Erreur', 'Veuillez renseigner le montant de la dépense');
      return;
    }
    const expenseAmount = parseFloat(amount);
    if (isNaN(expenseAmount) || expenseAmount <= 0) {
      Alert.alert('Erreur', 'Veuillez entrer un montant valide');
      return;
    }
    const newExpense = {
      id: Date.now(),
      description: description.trim(),
      amount: expenseAmount,
      date: new Date().toLocaleDateString('fr-FR'),
    };
    const updated = [newExpense, ...expenses];
    setExpenses(updated);
    saveExpenses(updated);
    setRemaining(prev => {
      const newRemaining = prev - expenseAmount;
      saveRemaining(newRemaining);
      return newRemaining;
    });
    setDescription('');
    setAmount('');
    Keyboard.dismiss();
  };

  const deleteExpense = (id: number) => {
    const expenseToDelete = expenses.find(e => e.id === id);
    const updated = expenses.filter(e => e.id !== id);
    setExpenses(updated);
    saveExpenses(updated);
    if (expenseToDelete) {
      setRemaining(prev => {
        const newRemaining = prev + expenseToDelete.amount;
        saveRemaining(newRemaining);
        return newRemaining;
      });
    }
  };

  const handleExpensePress = (item: any) => {
    const isRecurring = item.paidMonths !== undefined;
    Alert.alert(
      'Modifier la dépense',
      '',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Supprimer', style: 'destructive', onPress: () => isRecurring ? deleteRecurringExpense(item.id) : deleteExpense(item.id) },
        { text: 'Modifier', onPress: () => openEditModal(item) },
      ],
      { cancelable: true }
    );
  };

  const openEditModal = (item: any) => {
    setEditingExpense(item);
    setEditDescription(item.description);
    setEditAmount(item.amount.toString());
  };

  const closeEditModal = () => {
    setEditingExpense(null);
    setEditDescription('');
    setEditAmount('');
  };

  const saveEdit = () => {
    if (!editDescription.trim()) {
      Alert.alert('Erreur', 'Veuillez nommer la dépense');
      return;
    }
    if (!editAmount.trim()) {
      Alert.alert('Erreur', 'Veuillez renseigner le montant de la dépense');
      return;
    }
    const newAmount = parseFloat(editAmount);
    if (isNaN(newAmount) || newAmount <= 0) {
      Alert.alert('Erreur', 'Veuillez entrer un montant valide');
      return;
    }

    if (editingExpense.paidMonths) {
      const updated = recurringExpenses.map((re: any) => {
        if (re.id === editingExpense.id) {
          const oldAmount = re.amount;
          const amountDiff = newAmount - oldAmount;
          const isPaid = re.paidMonths.includes(getCurrentMonth());

          if (isPaid && amountDiff !== 0) {
            setRemaining(prev => {
              const newRemaining = prev - amountDiff;
              saveRemaining(newRemaining);
              return newRemaining;
            });
          }

          return {
            ...re,
            description: editDescription.trim(),
            amount: newAmount,
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
            setRemaining(prev => {
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
    try { await SecureStore.setItemAsync('recurringExpenses', JSON.stringify(newRecurring)); }
    catch (e) { console.error('Error saving recurring expenses', e); }
  };

  const addRecurringExpense = () => {
    if (!description.trim()) {
      Alert.alert('Erreur', 'Veuillez nommer la dépense');
      return;
    }
    if (!amount.trim()) {
      Alert.alert('Erreur', 'Veuillez renseigner le montant de la dépense');
      return;
    }
    const recurringAmount = parseFloat(amount);
    if (isNaN(recurringAmount) || recurringAmount <= 0) {
      Alert.alert('Erreur', 'Veuillez entrer un montant valide');
      return;
    }
    const newRecurring = {
      id: Date.now(),
      description: description.trim(),
      amount: recurringAmount,
      paidMonths: [],
    };
    const updated = [...recurringExpenses, newRecurring];
    setRecurringExpenses(updated);
    saveRecurringExpenses(updated);
    setDescription('');
    setAmount('');
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
          setRemaining(prev => {
            const newRemaining = prev + re.amount;
            saveRemaining(newRemaining);
            return newRemaining;
          });
        } else {
          setRemaining(prev => {
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
      setRemaining(prev => {
        const newRemaining = prev + expenseToDelete.amount;
        saveRemaining(newRemaining);
        return newRemaining;
      });
    }
  };

  const resetRecurringExpenses = () => {
    const updated = recurringExpenses.map((re: any) => ({ ...re, paidMonths: [] }));
    setRecurringExpenses(updated);
    saveRecurringExpenses(updated);
  };

  const saveRemaining = async (newRemaining: number) => {
    try { await SecureStore.setItemAsync('remaining', newRemaining.toString()); }
    catch (e) { console.error('Error saving remaining', e); }
  };

  const fullReset = () => {
    setExpenses([]);
    saveExpenses([]);
    const updatedRecurring = recurringExpenses.map((re: any) => ({ ...re, paidMonths: [] }));
    setRecurringExpenses(updatedRecurring);
    saveRecurringExpenses(updatedRecurring);
  };

  const updateRemaining = () => {
    if (!remainingInput.trim()) {
      Alert.alert('Erreur', 'Veuillez renseigner le montant');
      return;
    }
    const addedAmount = parseFloat(remainingInput);
    if (isNaN(addedAmount)) {
      Alert.alert('Erreur', 'Veuillez entrer un montant valide');
      return;
    }
    const newRemaining = remaining + addedAmount;
    setRemaining(newRemaining);
    saveRemaining(newRemaining);
    setRemainingInput('');
    setShowRemainingInput(false);
  };

  const isRecurringPaid = (paidMonths: string[]) => paidMonths.includes(getCurrentMonth());

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  const recurringTotal = recurringExpenses.reduce((sum, e) => sum + e.amount, 0);
  const unpaidRecurringTotal = recurringExpenses
    .filter((re: any) => !isRecurringPaid(re.paidMonths))
    .reduce((sum, e) => sum + e.amount, 0);

  const renderRecurringItem = ({ item }: { item: any }) => {
    const isPaid = isRecurringPaid(item.paidMonths);
    return (
      <Swipeable
        friction={1}
        rightThreshold={60}
        overshootRight={false}
        renderRightActions={() => (
          <View style={styles.swipeDelete}>
            <Ionicons name="trash" size={24} color="#fff" />
          </View>
        )}
        onSwipeableWillOpen={() => deleteRecurringExpense(item.id)}
      >
        <View style={[styles.item, isPaid ? styles.recurringPaid : styles.recurringItem]}>
          <TouchableOpacity onPress={() => toggleRecurringPaid(item.id)} style={styles.checkbox}>
            <View style={[styles.checkboxInner, isPaid && styles.checkboxChecked]}>
              {isPaid && <Ionicons name="checkmark" size={14} color="#fff" />}
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleExpensePress(item)} style={styles.itemContentClickable}>
            <View style={styles.itemContent}>
              <Text style={styles.description}>{item.description}</Text>
              <View style={styles.recurringBadge}>
                <Ionicons name="refresh-outline" size={10} color={colors.accent} />
                <Text style={styles.recurringLabel}>Récurrent</Text>
              </View>
            </View>
          </TouchableOpacity>
          <View style={styles.itemRight}>
            <Text style={[styles.amount, isPaid && styles.amountPaid]}>{item.amount.toFixed(2)}€</Text>
          </View>
        </View>
      </Swipeable>
    );
  };

  const renderItem = ({ item }: { item: any }) => (
    <Swipeable
      friction={1}
      rightThreshold={60}
      overshootRight={false}
      renderRightActions={() => (
        <View style={styles.swipeDelete}>
          <Ionicons name="trash" size={24} color="#fff" />
        </View>
      )}
      onSwipeableWillOpen={() => deleteExpense(item.id)}
    >
      <TouchableOpacity onPress={() => handleExpensePress(item)} style={styles.item}>
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
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => setShowRemainingInput(true)} style={styles.budgetRow}>
            <Text style={styles.budgetAmount}>{remaining.toFixed(2)}€</Text>
            <Ionicons name="add" size={14} color="rgba(255,255,255,0.7)" style={{ marginLeft: 6 }} />
          </TouchableOpacity>
        </View>
        <View style={styles.headerStats}>
          <View style={styles.statItem}>
            <Ionicons name="cart-outline" size={13} color="rgba(255,255,255,0.7)" />
            <Text style={styles.statText}>Dépenses: {total.toFixed(2)}€</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="refresh-outline" size={13} color="rgba(255,255,255,0.7)" />
            <Text style={styles.statText}>Non payé: {unpaidRecurringTotal.toFixed(2)}€</Text>
          </View>
        </View>
      </View>

      {showRemainingInput && (
        <View style={styles.budgetInputContainer}>
          <TextInput
            style={styles.budgetInput}
            placeholder="Ajouter au restant..."
            placeholderTextColor={colors.textSecondary}
            value={remainingInput}
            onChangeText={setRemainingInput}
            keyboardType="numeric"
            autoFocus
          />
          <TouchableOpacity onPress={updateRemaining} style={styles.iconBtnSuccess}>
            <Ionicons name="checkmark" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { setShowRemainingInput(false); setRemainingInput(''); }} style={styles.iconBtnDanger}>
            <Ionicons name="close" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder={showAddRecurring ? "Description récurrente..." : "Description..."}
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
            <TouchableOpacity onPress={addRecurringExpense} style={[styles.iconBtn, { backgroundColor: colors.accent }]}>
              <Ionicons name="checkmark" size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setShowAddRecurring(false); setDescription(''); setAmount(''); }} style={styles.iconBtnDanger}>
              <Ionicons name="close" size={20} color="#fff" />
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity onPress={addExpense} style={styles.iconBtn}>
              <Ionicons name="add" size={22} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowAddRecurring(true)} style={[styles.iconBtn, { backgroundColor: colors.accent, marginLeft: 6 }]}>
              <Ionicons name="refresh" size={16} color="#fff" />
            </TouchableOpacity>
          </>
        )}
      </View>

      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionLeft}>
              <Ionicons name="refresh-circle-outline" size={16} color={colors.accent} />
              <Text style={styles.sectionTitle}>Récurrentes</Text>
              <View style={styles.countBadge}>
                <Text style={styles.countText}>{recurringExpenses.length}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={resetRecurringExpenses} style={styles.resetBtn}>
              <Text style={styles.resetText}>Réinitialiser</Text>
            </TouchableOpacity>
          </View>
          {recurringExpenses.length > 0 ? (
            recurringExpenses.map((item, index) => (
              <View key={item.id.toString()}>
                {renderRecurringItem({ item })}
                {index < recurringExpenses.length - 1 && <View style={styles.divider} />}
              </View>
            ))
          ) : (
            <View style={styles.emptySection}>
              <Text style={styles.emptyText}>Aucune dépense récurrente</Text>
            </View>
          )}
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionLeft}>
              <Text style={styles.sectionTitle}>Dépenses du mois</Text>
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
              <Text style={styles.emptyText}>Aucune dépense ce mois-ci</Text>
            </View>
          )}
        </View>

        <TouchableOpacity onPress={fullReset} style={styles.fullResetBtn}>
          <Ionicons name="refresh-outline" size={16} color={colors.danger} />
          <Text style={styles.fullResetText}>Reset total du mois</Text>
        </TouchableOpacity>

        <View style={{ height: 200 }} />
      </ScrollView>

      <View style={styles.walletContainer}>
        <WalletIcon size={300} style={styles.walletIcon} />
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
              <Text style={styles.modalTitle}>Modifier la dépense</Text>
              <TouchableOpacity onPress={closeEditModal}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <Text style={styles.modalLabel}>Description</Text>
              <TextInput
                style={styles.modalInput}
                value={editDescription}
                onChangeText={setEditDescription}
                placeholder="Description..."
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
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                onPress={closeEditModal} 
                style={styles.modalBtnSecondary}
              >
                <Text style={styles.modalBtnTextSecondary}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={saveEdit} 
                style={styles.modalBtnPrimary}
              >
                <Text style={styles.modalBtnTextPrimary}>Enregistrer</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  budgetRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  budgetAmount: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
  },
  headerStats: {
    flexDirection: 'row',
    marginTop: 14,
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '500',
  },
  budgetInputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: colors.accentLight,
    margin: 12,
    borderRadius: 16,
    alignItems: 'center',
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
    flexDirection: 'row',
    padding: 10,
    backgroundColor: colors.card,
    margin: 12,
    borderRadius: 16,
    alignItems: 'center',
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
    width: 70,
    textAlign: 'center',
  },
  iconBtn: {
    backgroundColor: colors.accent,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
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
    justifyContent: 'center',
    alignItems: 'center',
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
    justifyContent: 'center',
    alignItems: 'center',
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
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
    fontWeight: '600',
    color: colors.accent,
  },
  resetBtn: {
    backgroundColor: colors.accentLight,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  resetText: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: '600',
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
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  item: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  recurringItem: {
    backgroundColor: colors.accentLight,
  },
  recurringPaid: {
    backgroundColor: colors.successLight,
  },
  itemContent: {
    flex: 1,
  },
  itemContentClickable: {
    flex: 1,
  },
  description: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  date: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  recurringBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 3,
  },
  recurringLabel: {
    fontSize: 11,
    color: colors.accent,
    fontWeight: '600',
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  amount: {
    fontSize: 15,
    fontWeight: '600',
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  fullResetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: 20,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  modalBody: {
    padding: 20,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
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
    flexDirection: 'row',
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
    alignItems: 'center',
  },
  modalBtnTextSecondary: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  modalBtnPrimary: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    backgroundColor: colors.accent,
    alignItems: 'center',
  },
  modalBtnTextPrimary: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  walletContainer: {
    position: 'absolute',
    left: -30,
    bottom: 50,
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
  },
  walletIcon: {
    opacity: 0.12,
    transform: [{ rotate: '15deg' }],
  },
  swipeDelete: {
    backgroundColor: colors.danger,
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
  },
});