
import { useState, useEffect } from 'react';
import Card from '../common/Card';
import ModuleHeader from '../common/ModuleHeader';
import { expensesApi } from '../../services/api';

const FinanceModule = ({ onAddExpense, onSettleUp, balances }) => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const data = await expensesApi.getAll();
        setExpenses(data);
      } catch (error) {
        console.error('Failed to fetch expenses:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchExpenses();
  }, []);

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
    <div className="animate-fade-in">
      <ModuleHeader title="Finance Hub" actionText="Add Expense" onActionClick={onAddExpense} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="text-center">
          <h4 className="text-gray-500 dark:text-gray-400">Total Household Spending (This Month)</h4>
          <p className="text-3xl font-bold mt-2">₹{totalMonthlySpending.toFixed(2)}</p>
        </Card>
        <Card as="button" onClick={onSettleUp} className="text-center bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800 hover:shadow-md transition-shadow">
          <h4 className="text-red-600 dark:text-red-400 font-semibold">You Owe</h4>
          <p className="text-3xl font-bold mt-2 text-red-700 dark:text-red-300">₹{balances.youOwe.toFixed(2)}</p>
        </Card>
        <Card as="button" onClick={onSettleUp} className="text-center bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800 hover:shadow-md transition-shadow">
          <h4 className="text-green-600 dark:text-green-400 font-semibold">You Are Owed</h4>
          <p className="text-3xl font-bold mt-2 text-green-700 dark:text-green-300">₹{balances.youAreOwed.toFixed(2)}</p>
        </Card>
      </div>
      <Card>
        <h3 className="font-bold text-lg mb-4">Recent Expenses</h3>
        {loading ? (
          <p className="text-gray-500">Loading expenses...</p>
        ) : expenses.length === 0 ? (
          <p className="text-gray-500">No expenses yet. Add your first expense!</p>
        ) : (
          <ul className="divide-y dark:divide-gray-700">
            {expenses.slice(0, 10).map(exp => (
              <li key={exp.id} className="py-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold">{exp.description}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Paid by {exp.paidByUser?.name} on {new Date(exp.date).toLocaleDateString()}
                  </p>
                </div>
                <p className="font-bold text-lg">₹{exp.totalAmount.toFixed(2)}</p>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
};

export default FinanceModule;