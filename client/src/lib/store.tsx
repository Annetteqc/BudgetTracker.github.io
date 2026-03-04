import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { format } from "date-fns";

// Types
export type TransactionType = "expense" | "income" | "savings";

export interface User {
  id: string;
  username: string;
  password: string; // Plain text for mock
  years: Record<string, Record<string, MonthData>>; // Record<YearStr, Record<MonthId, MonthData>>
  savingsGoal: number;
  savingsTabName?: string;
  antoineName?: string;
  antoineOwesName?: string;
  monthlySavingsObjective?: number;
}

export interface Category {
  id: string;
  name: string;
  budget: number;
  spent: number;
  color: string;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: TransactionType;
  categoryId?: string;
  isSplitWithAntoine?: boolean;
}

export interface MonthData {
  id: string; // e.g., "january-2026"
  name: string;
  totalIncome: number;
  totalExpenses: number;
  antoineOwes: number;
  savings: number;
  transactions: Transaction[];
  categories: Category[];
}

interface BudgetContextType {
  currentUser: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  register: (username: string, password: string) => boolean;
  updateSavingsGoal: (goal: number) => void;
  updateCustomNames: (names: { savingsTabName?: string; antoineName?: string; antoineOwesName?: string; monthlySavingsObjective?: number }) => void;
  months: Record<string, MonthData>;
  currentYear: string;
  setCurrentYear: (year: string) => void;
  addYear: (year: string) => void;
  years: string[];
  currentMonthId: string;
  setCurrentMonthId: (id: string) => void;
  language: "en" | "fr";
  setLanguage: (lang: "en" | "fr") => void;
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
  t: (key: string) => string;
  addTransaction: (monthId: string, transaction: Omit<Transaction, "id">) => void;
  deleteTransaction: (monthId: string, transactionId: string) => void;
  updateCategory: (monthId: string, category: Category) => void;
  deleteCategory: (monthId: string, categoryId: string) => void;
  addCategory: (monthId: string, name: string, budget: number, acrossAllMonths?: boolean) => void;
  transferAntoineOwes: (monthId: string) => void;
  getYearlyStats: () => {
    totalIncome: number;
    totalExpenses: number;
    netBalance: number;
    monthlyData: { name: string; income: number; expenses: number }[];
    savingsTotal: number;
  };
}

// Initial Data
const INITIAL_CATEGORIES: Category[] = [
  { id: "1", name: "Rent & Utilities", budget: 1200, spent: 0, color: "hsl(var(--chart-1))" },
  { id: "2", name: "Groceries", budget: 400, spent: 0, color: "hsl(var(--chart-2))" },
  { id: "3", name: "Transport", budget: 150, spent: 0, color: "hsl(var(--chart-3))" },
  { id: "4", name: "Entertainment", budget: 200, spent: 0, color: "hsl(var(--chart-4))" },
  { id: "5", name: "Dining Out", budget: 250, spent: 0, color: "hsl(var(--chart-5))" },
];

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const FUN_COLORS = [
  "#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A", "#98D8C8", 
  "#F7DC6F", "#BB8FCE", "#82E0AA", "#85C1E9", "#F1948A"
];

export const createInitialMonths = (year: string) => {
  return MONTH_NAMES.reduce((acc, name) => {
    const id = `${name.toLowerCase()}-${year}`;
    const categories = INITIAL_CATEGORIES.map((cat, idx) => ({
      ...cat,
      color: FUN_COLORS[idx % FUN_COLORS.length]
    }));

    acc[id] = {
      id,
      name: `${name} ${year}`,
      totalIncome: 0,
      totalExpenses: 0,
      antoineOwes: 0,
      savings: 0,
      transactions: [],
      categories: JSON.parse(JSON.stringify(categories)),
    };
    return acc;
  }, {} as Record<string, MonthData>);
};

const INITIAL_MONTHS: Record<string, MonthData> = createInitialMonths("2026");

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export function BudgetProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem("smartbudget-2026-users");
    return saved ? JSON.parse(saved) : [];
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("smartbudget-2026-current-user");
    return saved ? JSON.parse(saved) : null;
  });

  const [currentYear, setCurrentYear] = useState(() => {
    const saved = localStorage.getItem("smartbudget-current-year");
    return saved || "2026";
  });

  useEffect(() => {
    localStorage.setItem("smartbudget-current-year", currentYear);
  }, [currentYear]);
  const [currentMonthId, setCurrentMonthId] = useState("january-2026");
  const [language, setLanguage] = useState<"en" | "fr">(() => {
    const saved = localStorage.getItem("smartbudget-language");
    return (saved as "en" | "fr") || "en";
  });

  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const saved = localStorage.getItem("smartbudget-theme");
    return (saved as "light" | "dark") || "light";
  });

  useEffect(() => {
    localStorage.setItem("smartbudget-language", language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem("smartbudget-theme", theme);
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  const translations: Record<"en" | "fr", Record<string, string>> = {
    en: {
      overview: "Overview",
      monthlyBudget: "Monthly Budget",
      totalIncome: "Total Income",
      totalExpenses: "Total Expenses",
      savings: "Savings",
      monthlyBalance: "Monthly Balance",
      createNewYear: "Create New Year",
      signOut: "Sign Out",
      returnToDashboard: "Return to Dashboard",
      monthNotAvailable: "Month data not available",
      monthNotExist: "This month might not exist in the current year.",
      history: "History",
      all: "All",
      addTransaction: "Add Transaction",
      recordTransactions: "Record expenses, income, or savings",
      amount: "Amount",
      description: "Description",
      date: "Date",
      category: "Category",
      selectCategory: "Select Category",
      useResult: "Use Result",
      calculator: "Calculator",
      income: "Income",
      expense: "Expense",
      spendingByCategory: "Spending by Category",
      moneyBreakdance: "Money Breakdance",
      yearlyNetBalance: "Yearly Net Balance",
      progress: "Progress",
      moreToReachGoal: "more to reach your goal.",
      categoryBudgets: "Category Budgets",
      newCategory: "New Category",
      categoryName: "Category Name",
      monthlyBudgetLabel: "Monthly Budget",
      addToAllMonths: "Add to all months in",
      createCategory: "Create Category",
      cancel: "Cancel",
      utilized: "Utilized",
      remainder: "Remainder",
      over: "Over",
      january: "January", february: "February", march: "March", april: "April", may: "May", june: "June",
      july: "July", august: "August", september: "September", october: "October", november: "November", december: "December"
    },
    fr: {
      overview: "Vue d'ensemble",
      monthlyBudget: "Budget Mensuel",
      totalIncome: "Revenus Totaux",
      totalExpenses: "Dépenses Totales",
      savings: "Épargne",
      monthlyBalance: "Solde Mensuel",
      createNewYear: "Créer une Nouvelle Année",
      signOut: "Se déconnecter",
      returnToDashboard: "Retour au tableau de bord",
      monthNotAvailable: "Données du mois non disponibles",
      monthNotExist: "Ce mois n'existe peut-être pas pour l'année en cours.",
      history: "Historique",
      all: "Tout",
      addTransaction: "Ajouter une Transaction",
      recordTransactions: "Enregistrer dépenses, revenus ou épargne",
      amount: "Montant",
      description: "Description",
      date: "Date",
      category: "Catégorie",
      selectCategory: "Sélectionner une catégorie",
      useResult: "Utiliser le résultat",
      calculator: "Calculatrice",
      income: "Revenu",
      expense: "Dépense",
      spendingByCategory: "Dépenses par Catégorie",
      moneyBreakdance: "Money Breakdance",
      yearlyNetBalance: "Solde Net Annuel",
      progress: "Progression",
      moreToReachGoal: "de plus pour atteindre votre objectif.",
      categoryBudgets: "Budgets par Catégorie",
      newCategory: "Nouvelle Catégorie",
      categoryName: "Nom de la Catégorie",
      monthlyBudgetLabel: "Budget Mensuel",
      addToAllMonths: "Ajouter à tous les mois en",
      createCategory: "Créer la Catégorie",
      cancel: "Annuler",
      utilized: "Utilisé",
      remainder: "Reste",
      over: "Dépassement",
      january: "Janvier", february: "Février", march: "Mars", april: "Avril", may: "Mai", june: "Juin",
      july: "Juillet", august: "Août", september: "Septembre", october: "Octobre", november: "Novembre", december: "Décembre"
    }
  };

  const t = (key: string) => translations[language][key] || key;

  useEffect(() => {
    localStorage.setItem("smartbudget-2026-users", JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem("smartbudget-2026-current-user", JSON.stringify(currentUser));
  }, [currentUser]);

  const months = currentUser?.years?.[currentYear] || INITIAL_MONTHS;
  const years = currentUser?.years ? Object.keys(currentUser.years).sort() : ["2026"];

  const updateMonths = (newMonths: Record<string, MonthData>) => {
    if (!currentUser) return;
    const updatedYears = { ...currentUser.years, [currentYear]: newMonths };
    const updatedUser = { ...currentUser, years: updatedYears };
    setCurrentUser(updatedUser);
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
  };

  const addYear = (year: string) => {
    if (!currentUser) return;
    const currentYears = currentUser.years || { "2026": INITIAL_MONTHS };
    if (currentYears[year]) return;
    const updatedYears = { ...currentYears, [year]: createInitialMonths(year) };
    const updatedUser = { ...currentUser, years: updatedYears };
    setCurrentUser(updatedUser);
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    setCurrentYear(year);
    setCurrentMonthId(`january-${year}`);
  };

  const login = (username: string, password: string) => {
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      setCurrentUser(user);
      return true;
    }
    // Auto-register fallback for mobile/easy testing if no users exist
    if (users.length === 0) {
      return register(username, password);
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const register = (username: string, password: string) => {
    if (users.find(u => u.username === username)) return false;
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      username,
      password,
      years: { "2026": JSON.parse(JSON.stringify(INITIAL_MONTHS)) },
      savingsGoal: 13000,
    };
    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    return true;
  };

  const updateSavingsGoal = (goal: number) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, savingsGoal: goal };
    setCurrentUser(updatedUser);
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
  };

  const updateCustomNames = (names: { savingsTabName?: string; antoineName?: string; antoineOwesName?: string; monthlySavingsObjective?: number }) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, ...names };
    setCurrentUser(updatedUser);
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
  };

  const addTransaction = (monthId: string, transaction: Omit<Transaction, "id">) => {
    const month = months[monthId];
    if (!month) return;

    const newTransaction: Transaction = {
      ...transaction,
      id: Math.random().toString(36).substr(2, 9),
      date: transaction.date || new Date().toISOString(),
    };

    const newCategories = [...month.categories];
    let newTotalIncome = month.totalIncome;
    let newTotalExpenses = month.totalExpenses;
    let newAntoineOwes = month.antoineOwes;
    let newSavings = month.savings;

    if (transaction.type === "income") {
      newTotalIncome += transaction.amount;
      if (transaction.description === "Antoine sent me") {
        newAntoineOwes = Math.max(0, newAntoineOwes - transaction.amount);
      }
    } else if (transaction.type === "savings") {
      newSavings += transaction.amount;
    } else if (transaction.type === "expense") {
      if (transaction.isSplitWithAntoine) {
        const myShare = transaction.amount / 2;
        const antoineShare = transaction.amount / 2;
        newTotalExpenses += myShare;
        newAntoineOwes += antoineShare;
        if (transaction.categoryId) {
          const catIndex = newCategories.findIndex(c => c.id === transaction.categoryId);
          if (catIndex >= 0) newCategories[catIndex].spent += myShare;
        }
      } else {
        newTotalExpenses += transaction.amount;
        if (transaction.categoryId) {
          const catIndex = newCategories.findIndex(c => c.id === transaction.categoryId);
          if (catIndex >= 0) newCategories[catIndex].spent += transaction.amount;
        }
      }
    }

    const newMonths = {
      ...months,
      [monthId]: {
        ...month,
        totalIncome: newTotalIncome,
        totalExpenses: newTotalExpenses,
        antoineOwes: newAntoineOwes,
        savings: newSavings,
        transactions: [newTransaction, ...month.transactions],
        categories: newCategories,
      },
    };
    updateMonths(newMonths);
  };

  const deleteTransaction = (monthId: string, transactionId: string) => {
    const month = months[monthId];
    if (!month) return;

    const transactionToDelete = month.transactions.find(t => t.id === transactionId);
    if (!transactionToDelete) return;

    let newTotalIncome = month.totalIncome;
    let newTotalExpenses = month.totalExpenses;
    let newAntoineOwes = month.antoineOwes;
    let newSavings = month.savings;
    const newCategories = [...month.categories];

    if (transactionToDelete.type === "income") {
      newTotalIncome -= transactionToDelete.amount;
      if (transactionToDelete.description === "Antoine sent me") {
        newAntoineOwes += transactionToDelete.amount;
      }
    } else if (transactionToDelete.type === "savings") {
      newSavings -= transactionToDelete.amount;
    } else if (transactionToDelete.type === "expense") {
      if (transactionToDelete.isSplitWithAntoine) {
        const myShare = transactionToDelete.amount / 2;
        const antoineShare = transactionToDelete.amount / 2;
        newTotalExpenses -= myShare;
        newAntoineOwes -= antoineShare;
        if (transactionToDelete.categoryId) {
          const catIndex = newCategories.findIndex(c => c.id === transactionToDelete.categoryId);
          if (catIndex >= 0) newCategories[catIndex].spent -= myShare;
        }
      } else {
        newTotalExpenses -= transactionToDelete.amount;
        if (transactionToDelete.categoryId) {
          const catIndex = newCategories.findIndex(c => c.id === transactionToDelete.categoryId);
          if (catIndex >= 0) newCategories[catIndex].spent -= transactionToDelete.amount;
        }
      }
    }

    const newTransactions = month.transactions.filter(t => t.id !== transactionId);
    const newMonths = {
      ...months,
      [monthId]: {
        ...month,
        totalIncome: newTotalIncome,
        totalExpenses: newTotalExpenses,
        antoineOwes: newAntoineOwes,
        savings: newSavings,
        transactions: newTransactions,
        categories: newCategories,
      },
    };
    updateMonths(newMonths);
  };

  const updateCategory = (monthId: string, category: Category) => {
    const month = months[monthId];
    if (!month) return;
    const newCategories = month.categories.map(c => c.id === category.id ? category : c);
    const newMonths = { ...months, [monthId]: { ...month, categories: newCategories } };
    updateMonths(newMonths);
  };

  const deleteCategory = (monthId: string, categoryId: string) => {
    const month = months[monthId];
    if (!month) return;
    const newCategories = month.categories.filter(c => c.id !== categoryId);
    const newMonths = { ...months, [monthId]: { ...month, categories: newCategories } };
    updateMonths(newMonths);
  };

  const addCategory = (monthId: string, name: string, budget: number, acrossAllMonths?: boolean) => {
    if (acrossAllMonths && currentUser) {
      const newMonths = { ...months };
      const categoryId = Math.random().toString(36).substr(2, 9);
      const color = FUN_COLORS[Math.floor(Math.random() * FUN_COLORS.length)];

      Object.keys(newMonths).forEach(id => {
        const month = newMonths[id];
        newMonths[id] = {
          ...month,
          categories: [...month.categories, {
            id: categoryId,
            name,
            budget,
            spent: 0,
            color
          }]
        };
      });
      updateMonths(newMonths);
    } else {
      const month = months[monthId];
      if (!month) return;
      const newCategory: Category = {
        id: Math.random().toString(36).substr(2, 9),
        name,
        budget,
        spent: 0,
        color: FUN_COLORS[Math.floor(Math.random() * FUN_COLORS.length)]
      };
      const newMonths = { ...months, [monthId]: { ...month, categories: [...month.categories, newCategory] } };
      updateMonths(newMonths);
    }
  };

  const transferAntoineOwes = (monthId: string) => {
    const month = months[monthId];
    if (!month || month.antoineOwes <= 0) return;
    const amountToTransfer = month.antoineOwes;
    const newMonths = {
      ...months,
      [monthId]: {
        ...month,
        totalIncome: month.totalIncome + amountToTransfer,
        antoineOwes: 0,
        transactions: [{
          id: Math.random().toString(36).substr(2, 9),
          date: new Date().toISOString(),
          description: "Transfer from Antoine Owes Me",
          amount: amountToTransfer,
          type: "income" as TransactionType,
          isSplitWithAntoine: false
        }, ...month.transactions]
      }
    };
    updateMonths(newMonths);
  };

  const getYearlyStats = () => {
    const allMonths = Object.values(months);
    const totalIncome = allMonths.reduce((acc, m) => acc + m.totalIncome, 0);
    const totalExpenses = allMonths.reduce((acc, m) => acc + m.totalExpenses, 0);
    const savingsTotal = allMonths.reduce((acc, m) => acc + m.savings, 0);
    const netBalance = totalIncome - totalExpenses - savingsTotal;
    const monthlyData = allMonths.map(m => ({
      name: m.name.split(' ')[0],
      income: m.totalIncome,
      expenses: m.totalExpenses
    }));
    return { totalIncome, totalExpenses, netBalance, monthlyData, savingsTotal };
  };

  return (
    <BudgetContext.Provider value={{
      currentUser,
      login,
      logout,
      register,
      updateSavingsGoal,
      updateCustomNames,
      months,
      currentYear,
      setCurrentYear,
      addYear,
      years,
      currentMonthId,
      setCurrentMonthId,
      language,
      setLanguage,
      theme,
      setTheme,
      t,
      addTransaction,
      deleteTransaction,
      updateCategory,
      deleteCategory,
      addCategory,
      transferAntoineOwes,
      getYearlyStats
    }}>
      {children}
    </BudgetContext.Provider>
  );
}

export function useBudget() {
  const context = useContext(BudgetContext);
  if (context === undefined) {
    throw new Error("useBudget must be used within a BudgetProvider");
  }
  return context;
}
