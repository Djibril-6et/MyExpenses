import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import DraggableFlatList, {
  ScaleDecorator,
} from 'react-native-draggable-flatlist';
import ShoppingCartIcon from '@/components/ShoppingCartIcon';

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

export default function ShoppingListScreen() {
  const [items, setItems] = useState<any[]>([]);
  const [newItem, setNewItem] = useState('');

  useEffect(() => {
    if (Platform.OS !== 'web') {
      loadItems();
    }
  }, []);

  const loadItems = async () => {
    try {
      const stored = await SecureStore.getItemAsync('shoppingList');
      if (stored) setItems(JSON.parse(stored));
    } catch (e) {
      console.error('Error loading shopping list', e);
    }
  };

  const saveItems = async (newItems: any[]) => {
    try {
      await SecureStore.setItemAsync('shoppingList', JSON.stringify(newItems));
    } catch (e) {
      console.error('Error saving shopping list', e);
    }
  };

  const addItem = () => {
    if (!newItem.trim()) return;
    const item = {
      id: Date.now(),
      name: newItem.trim(),
      checked: false,
    };
    const updated = [item, ...items];
    setItems(updated);
    saveItems(updated);
    setNewItem('');
    Keyboard.dismiss();
  };

  const toggleItem = (id: number) => {
    const updated = items.map(item =>
      item.id === id ? { ...item, checked: !item.checked } : item
    );
    setItems(updated);
    saveItems(updated);
  };

  const deleteItem = (id: number) => {
    const updated = items.filter(item => item.id !== id);
    setItems(updated);
    saveItems(updated);
  };

  const clearAll = () => {
    setItems([]);
    saveItems([]);
  };

  const onDragEnd = ({ data }: { data: any[] }) => {
    setItems(data);
    saveItems(data);
  };

  const renderItem = ({ item, drag, isActive }: any) => (
    <ScaleDecorator>
      <View style={[styles.item, item.checked && styles.itemChecked, isActive && styles.itemActive]}>
        <TouchableOpacity onLongPress={drag} delayLongPress={200} style={styles.dragHandle}>
          <Text style={styles.dragHandleText}>☰</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => toggleItem(item.id)} style={styles.checkbox}>
          <View style={[styles.checkboxInner, item.checked && styles.checkboxChecked]}>
            {item.checked && <Text style={styles.checkmark}>✓</Text>}
          </View>
        </TouchableOpacity>
        <Text style={[styles.itemText, item.checked && styles.itemTextChecked]}>
          {item.name}
        </Text>
        <TouchableOpacity onPress={() => deleteItem(item.id)} style={styles.deleteBtn}>
          <Text style={styles.deleteText}>✕</Text>
        </TouchableOpacity>
      </View>
    </ScaleDecorator>
  );

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
        <ShoppingCartIcon size={350} style={styles.cartIcon} />
        
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Ajouter un article..."
            value={newItem}
            onChangeText={setNewItem}
            onSubmitEditing={addItem}
          />
          <TouchableOpacity onPress={addItem} style={styles.addBtn}>
            <Text style={styles.addBtnText}>+</Text>
          </TouchableOpacity>
        </View>

        {items.length > 0 && (
          <TouchableOpacity onPress={clearAll} style={styles.clearAllBtn}>
            <Text style={styles.clearAllText}>🗑️ Tout supprimer</Text>
          </TouchableOpacity>
        )}

        <DraggableFlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          onDragEnd={onDragEnd}
          style={styles.list}
          activationDistance={10}
          ListEmptyComponent={
            <View style={styles.empty}>
              <ShoppingCartIcon size={150} style={styles.emptyIcon} />
              <Text style={styles.emptyText}>Votre liste est vide</Text>
              <Text style={styles.emptySubtext}>Ajoutez des articles pour commencer</Text>
            </View>
          }
        />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  safeArea: {
    flex: 1,
  },
  cartIcon: {
    position: 'absolute',
    right: -50,
    top: 100,
    opacity: 0.08,
    transform: [{ rotate: '-15deg' }],
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: colors.card,
    margin: 12,
    marginTop: 25,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  input: {
    flex: 1,
    borderWidth: 0,
    backgroundColor: colors.inputBg,
    borderRadius: 8,
    padding: 10,
    marginRight: 8,
  },
  addBtn: {
    backgroundColor: colors.accent,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  addBtnText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  list: {
    padding: 8,
  },
  clearAllBtn: {
    backgroundColor: colors.accent,
    marginHorizontal: 12,
    marginBottom: 8,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  clearAllText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  item: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    padding: 14,
    borderRadius: 10,
    marginBottom: 8,
    alignItems: 'center',
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  itemChecked: {
    backgroundColor: colors.successLight,
  },
  itemActive: {
    shadowColor: colors.accent,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  dragHandle: {
    padding: 8,
    marginRight: 4,
  },
  dragHandleText: {
    fontSize: 24,
    color: colors.textSecondary,
  },
  checkbox: {
    marginRight: 10,
  },
  checkboxInner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  checkmark: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  itemText: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
  },
  itemTextChecked: {
    textDecorationLine: 'line-through',
    color: colors.textSecondary,
  },
  deleteBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.danger,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.danger,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  deleteText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  empty: {
    padding: 50,
    alignItems: 'center',
  },
  emptyIcon: {
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 18,
    color: colors.accent,
    fontWeight: 'bold',
  },
  emptySubtext: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 8,
  },
});