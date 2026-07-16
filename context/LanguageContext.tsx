import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

export type Language = "fr" | "en";

type Translations = {
  expenses: string;
  shopping: string;
  remaining: string;
  addRemaining: string;
  description: string;
  descriptionRecurring: string;
  expensesTotal: string;
  unpaid: string;
  recurring: string;
  recurringExpenses: string;
  dueDay: string;
  chargedOn: string;
  dayLabel: string;
  charged: string;
  inDays: string;
  inOneDay: string;
  today: string;
  monthlyExpenses: string;
  noRecurringExpenses: string;
  noMonthlyExpenses: string;
  reset: string;
  resetMonth: string;
  errorName: string;
  errorAmount: string;
  errorAmountValid: string;
  errorAmountEmpty: string;
  editExpense: string;
  cancel: string;
  save: string;
  settings: string;
  theme: string;
  language: string;
  french: string;
  english: string;
  chooseTheme: string;
  chooseLanguage: string;
  deleteAll: string;
  confirmDelete: string;
  confirmDeleteMessage: string;
  delete: string;
};

const translations: Record<Language, Translations> = {
  fr: {
    expenses: "Dépenses",
    shopping: "Liste de courses",
    remaining: "Restant",
    addRemaining: "Ajouter au restant...",
    description: "Description...",
    descriptionRecurring: "Description récurrente...",
    expensesTotal: "Dépenses:",
    unpaid: "Non payé:",
    recurring: "Récurrent",
    recurringExpenses: "Récurrentes",
    dueDay: "Jour de prélèvement",
    chargedOn: "Prélevé le",
    dayLabel: "Jour de prélèvement",
    charged: "Prélevé",
    inDays: "jours",
    inOneDay: "dans 1 jour",
    today: "aujourd'hui",
    monthlyExpenses: "Dépenses du mois",
    noRecurringExpenses: "Aucune dépense récurrente",
    noMonthlyExpenses: "Aucune dépense ce mois-ci",
    reset: "Réinitialiser",
    resetMonth: "Reset total du mois",
    errorName: "Veuillez nommer la dépense",
    errorAmount: "Veuillez renseigner le montant de la dépense",
    errorAmountValid: "Veuillez entrer un montant valide",
    errorAmountEmpty: "Veuillez renseigner le montant",
    editExpense: "Modifier la dépense",
    cancel: "Annuler",
    save: "Enregistrer",
    settings: "Paramètres",
    theme: "Thème",
    language: "Langue",
    french: "Français",
    english: "Anglais",
    chooseTheme: "Choisir le thème",
    chooseLanguage: "Choisir la langue",
    deleteAll: "Tout supprimer",
    confirmDelete: "Confirmer la suppression",
    confirmDeleteMessage: "Voulez-vous vraiment supprimer cette dépense ?",
    delete: "Supprimer",
  },
  en: {
    expenses: "Expenses",
    shopping: "Shopping List",
    remaining: "Remaining",
    addRemaining: "Add to remaining...",
    description: "Description...",
    descriptionRecurring: "Recurring description...",
    expensesTotal: "Expenses:",
    unpaid: "Unpaid:",
    recurring: "Recurring",
    recurringExpenses: "Recurring",
    dueDay: "Due day",
    chargedOn: "Charged on the",
    dayLabel: "Due day",
    charged: "Charged",
    inDays: "days",
    inOneDay: "in 1 day",
    today: "today",
    monthlyExpenses: "Monthly expenses",
    noRecurringExpenses: "No recurring expenses",
    noMonthlyExpenses: "No expenses this month",
    reset: "Reset",
    resetMonth: "Reset month",
    errorName: "Please name the expense",
    errorAmount: "Please enter the expense amount",
    errorAmountValid: "Please enter a valid amount",
    errorAmountEmpty: "Please enter an amount",
    editExpense: "Edit expense",
    cancel: "Cancel",
    save: "Save",
    settings: "Settings",
    theme: "Theme",
    language: "Language",
    french: "French",
    english: "English",
    chooseTheme: "Choose theme",
    chooseLanguage: "Choose language",
    deleteAll: "Delete all",
    confirmDelete: "Confirm deletion",
    confirmDeleteMessage: "Are you sure you want to delete this expense?",
    delete: "Delete",
  },
};

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("fr");

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const stored = await AsyncStorage.getItem("language");
      if (stored === "fr" || stored === "en") {
        setLanguageState(stored);
      }
    } catch (e) {
      console.error("Error loading language", e);
    }
  };

  const setLanguage = async (lang: Language) => {
    setLanguageState(lang);
    try {
      await AsyncStorage.setItem("language", lang);
    } catch (e) {
      console.error("Error saving language", e);
    }
  };

  const t = translations[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
