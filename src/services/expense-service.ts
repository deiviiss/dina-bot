interface Expense {
  userId: string;
  type: 'GASTO' | 'INGRESO';
  amount: number;
  category: string;
  description: string;
  date: Date;
}

interface ExpenseSummary {
  totalIncome: number;
  totalExpense: number;
  topCategories: Array<{
    name: string;
    amount: number;
  }>;
}

interface Timeframe {
  start: Date;
  end: Date;
}

// Datos ficticios iniciales
const expenses: Expense[] = [
  {
    userId: 'user123',
    type: 'INGRESO',
    amount: 5000,
    category: 'salario',
    description: 'Salario mensual',
    date: new Date('2024-03-01')
  },
  {
    userId: 'user123',
    type: 'GASTO',
    amount: 1500,
    category: 'comida',
    description: 'Supermercado mensual',
    date: new Date('2024-03-05')
  },
  {
    userId: 'user123',
    type: 'GASTO',
    amount: 800,
    category: 'transporte',
    description: 'Gasolina',
    date: new Date('2024-03-10')
  },
  {
    userId: 'user123',
    type: 'GASTO',
    amount: 2000,
    category: 'hogar',
    description: 'Renta',
    date: new Date('2024-03-01')
  },
  {
    userId: 'user123',
    type: 'GASTO',
    amount: 500,
    category: 'ocio',
    description: 'Cine y restaurante',
    date: new Date('2024-03-15')
  },
  {
    userId: 'user123',
    type: 'INGRESO',
    amount: 1000,
    category: 'extra',
    description: 'Trabajo freelance',
    date: new Date('2024-03-20')
  },
  {
    userId: 'user123',
    type: 'GASTO',
    amount: 300,
    category: 'salud',
    description: 'Medicamentos',
    date: new Date('2024-03-25')
  }
];

export async function saveExpense(expense: Expense): Promise<void> {
  expenses.push(expense);
}

export async function getExpenses(
  userId: string,
  startDate: Date,
  endDate: Date,
  category?: string
): Promise<Expense[]> {
  return expenses.filter(expense => {
    const matchesUser = expense.userId === userId;
    const matchesDate = expense.date >= startDate && expense.date <= endDate;
    const matchesCategory = !category || expense.category === category;
    return matchesUser && matchesDate && matchesCategory;
  });
}

export async function getExpenseSummary(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<ExpenseSummary> {
  const userExpenses = await getExpenses(userId, startDate, endDate);

  const totalIncome = userExpenses
    .filter(e => e.type === 'INGRESO')
    .reduce((sum, e) => sum + e.amount, 0);

  const totalExpense = userExpenses
    .filter(e => e.type === 'GASTO')
    .reduce((sum, e) => sum + e.amount, 0);

  // Calcular top categorías
  const categoryTotals = userExpenses
    .filter(e => e.type === 'GASTO')
    .reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {} as Record<string, number>);

  const topCategories = Object.entries(categoryTotals)
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 3);

  return {
    totalIncome,
    totalExpense,
    topCategories
  };
} 