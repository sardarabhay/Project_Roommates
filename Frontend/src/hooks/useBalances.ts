import { useState, useEffect, useCallback } from 'react';
import { expensesApi } from '../services/api';
import type { User, Balances, UseBalancesReturn } from '../types';

export const useBalances = (currentUser: User | null): UseBalancesReturn => {
  const [balances, setBalances] = useState<Balances>({
    youOwe: 0,
    youAreOwed: 0,
    debts: {},
    credits: {},
  });
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchBalances = async () => {
      if (!currentUser) return;

      setLoading(true);
      try {
        const data = await expensesApi.getBalances();
        setBalances(data);
      } catch (error) {
        console.error('Failed to fetch balances:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBalances();
  }, [currentUser]);

  const refreshBalances = useCallback(() => {
    const doRefresh = async () => {
      try {
        const data = await expensesApi.getBalances();
        setBalances(data);
      } catch (error) {
        console.error('Failed to refresh balances:', error);
      }
    };
    doRefresh();
  }, []);

  return { ...balances, loading, refreshBalances };
};
