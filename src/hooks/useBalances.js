
import { useMemo } from 'react';
import { mockExpenseSplits, mockExpenses, mockUser } from '../data/mockData';

export const useBalances = () => {
  return useMemo(() => {
    let youOwe = 0;
    let youAreOwed = 0;
    const debts = {};
    const credits = {};

    mockExpenseSplits.forEach(split => {
      if (split.status === 'pending') {
        const expense = mockExpenses.find(e => e.id === split.expense_id);
        if (!expense) return;

        const paidByUserId = expense.paid_by_user_id;
        const owedByUserId = split.owed_by_user_id;

        if (owedByUserId === mockUser.id && paidByUserId !== mockUser.id) {
          youOwe += split.amount;
          debts[paidByUserId] = (debts[paidByUserId] || 0) + split.amount;
        }

        if (paidByUserId === mockUser.id && owedByUserId !== mockUser.id) {
          youAreOwed += split.amount;
          credits[owedByUserId] = (credits[owedByUserId] || 0) + split.amount;
        }
      }
    });

    return { youOwe, youAreOwed, debts, credits };
  }, []);
};