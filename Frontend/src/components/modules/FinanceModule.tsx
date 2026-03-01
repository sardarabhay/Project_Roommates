import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import Card from '../common/Card';
import ModuleHeader from '../common/ModuleHeader';
import SpendingAnalytics from '../dashboard/SpendingAnalytics';
import { expensesApi } from '../../services/api';
import { getCategoryInfo } from '../forms/AddExpenseForm';
import type { Expense, UseBalancesReturn } from '../../types';

interface FinanceModuleProps {
  onAddExpense: () => void;
  onSettleUp: () => void;
  balances: UseBalancesReturn;
  refreshKey: number;
  onEditExpense?: (expense: Expense) => void;
}

type TabType = 'expenses' | 'analytics';

const FinanceModule = ({ onAddExpense, onSettleUp, balances, refreshKey, onEditExpense }: FinanceModuleProps): JSX.Element => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<TabType>('expenses');

  const fetchExpenses = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      const data = await expensesApi.getAll();
      setExpenses(data);
    } catch (error) {
      console.error('Failed to fetch expenses:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses, refreshKey]);

  // Calculate total spending this month
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const totalMonthlySpending = expenses
    .filter(exp => {
      const expDate = new Date(exp.date);
      return expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear;
    })
    .reduce((sum, exp) => sum + exp.totalAmount, 0);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <ModuleHeader title="Finance Hub" actionText="Add Expense" onActionClick={onAddExpense} />
      
      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('expenses')}
          className={`px-4 py-2 rounded-md font-medium transition-all ${
            activeTab === 'expenses'
              ? 'bg-white dark:bg-gray-700 shadow-sm text-teal-600 dark:text-teal-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
          }`}
        >
           Expenses
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 rounded-md font-medium transition-all ${
            activeTab === 'analytics'
              ? 'bg-white dark:bg-gray-700 shadow-sm text-teal-600 dark:text-teal-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
          }`}
        >
           Analytics
        </button>
      </div>

      {activeTab === 'expenses' ? (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <motion.div whileHover={{ scale: 1.02 }}>
              <Card className="text-center h-full">
                <h4 className="text-gray-500 dark:text-gray-400">Total Household Spending (This Month)</h4>
                <p className="text-3xl font-bold mt-2">₹{totalMonthlySpending.toFixed(2)}</p>
              </Card>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }}>
              <Card onClick={onSettleUp} className="text-center bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800 cursor-pointer h-full">
                <h4 className="text-red-600 dark:text-red-400 font-semibold">You Owe</h4>
                <p className="text-3xl font-bold mt-2 text-red-700 dark:text-red-300">₹{balances.youOwe.toFixed(2)}</p>
              </Card>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }}>
              <Card onClick={onSettleUp} className="text-center bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800 cursor-pointer h-full">
                <h4 className="text-green-600 dark:text-green-400 font-semibold">You Are Owed</h4>
                <p className="text-3xl font-bold mt-2 text-green-700 dark:text-green-300">₹{balances.youAreOwed.toFixed(2)}</p>
              </Card>
            </motion.div>
          </div>
          <Card>
            <h3 className="font-bold text-lg mb-4">Recent Expenses</h3>
            {loading ? (
              <p className="text-gray-500">Loading expenses...</p>
            ) : expenses.length === 0 ? (
              <p className="text-gray-500">No expenses yet. Add your first expense!</p>
            ) : (
              <ul className="divide-y dark:divide-gray-700">
                {expenses.slice(0, 10).map(exp => {
                  const category = getCategoryInfo(exp.category);
                  const CategoryIcon = category.icon;
                  return (
                    <motion.li 
                      key={exp.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
                      className="py-4 flex items-center justify-between -mx-4 px-4 cursor-pointer rounded-lg transition-colors"
                      onClick={() => onEditExpense && onEditExpense(exp)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${category.color}`}>
                          <CategoryIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-semibold">{exp.description}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Paid by {exp.paidByUser?.name} on {new Date(exp.date).toLocaleDateString()}
                            {exp.createdByUser && exp.createdByUser.id !== exp.paidByUser?.id && (
                              <span className="ml-2 text-xs text-gray-400">(added by {exp.createdByUser.name})</span>
                            )}
                          </p>
                        </div>
                      </div>
                      <p className="font-bold text-lg">₹{exp.totalAmount.toFixed(2)}</p>
                    </motion.li>
                  );
                })}
              </ul>
            )}
          </Card>
        </>
      ) : (
        <SpendingAnalytics expenses={expenses} />
      )}
    </motion.div>
  );
};

export default FinanceModule;