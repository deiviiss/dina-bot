export interface ExpenseData {
  description: string;
  amount: number | null;
  type: "EXPENSE" | "INCOME";
  //! Change category to Prisma enum
  category: "food" | "transport" | "home" | "leisure" | "health" | "other" | "unknown";
  status: "COMPLETE" | "INCOMPLETE";
  missingFields?: string[]; // Fields that are missing
}