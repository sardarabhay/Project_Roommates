
import { useState, useEffect } from 'react';
import { expensesApi } from '../services/api';

export const useBalances = (currentUser) => {
  const [balances, setBalances] = useState({
    youOwe: 0,
    youAreOwed: 0,
    debts: {},
    credits: {},
  });

  useEffect(() => {
    const fetchBalances = async () => {
      if (!currentUser) return;
      
      try {
        const data = await expensesApi.getBalances();
        setBalances(data);
      } catch (error) {
        console.error('Failed to fetch balances:', error);
      }
    };

    fetchBalances();
  }, [currentUser]);

  const refreshBalances = async () => {
    try {
      const data = await expensesApi.getBalances();
      setBalances(data);
    } catch (error) {
      console.error('Failed to refresh balances:', error);
    }
  };

  return { ...balances, refreshBalances };
};