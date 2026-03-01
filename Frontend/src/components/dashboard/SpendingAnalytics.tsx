import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import Card from '../common/Card';
import type { Expense } from '../../types';

interface SpendingAnalyticsProps {
  expenses: Expense[];
}

// Colors for charts
const COLORS = ['#0D9488', '#F59E0B', '#6366F1', '#EC4899', '#10B981', '#F97316', '#8B5CF6', '#EF4444'];

const SpendingAnalytics = ({ expenses }: SpendingAnalyticsProps): JSX.Element => {
  // Process data for charts
  const analyticsData = useMemo(() => {
    if (!expenses || expenses.length === 0) {
      return {
        categoryData: [],
        monthlyData: [],
        topSpenders: [],
        totalSpent: 0,
        avgExpense: 0,
      };
    }

    // Category breakdown (using description as category hint)
    const categoryMap = new Map<string, number>();
    expenses.forEach(exp => {
      // Extract category from description (simple heuristic)
      const desc = exp.description.toLowerCase();
      let category = 'Other';
      
      if (desc.includes('grocery') || desc.includes('food') || desc.includes('vegetables') || desc.includes('milk')) {
        category = 'Groceries';
      } else if (desc.includes('rent') || desc.includes('housing')) {
        category = 'Rent';
      } else if (desc.includes('electric') || desc.includes('water') || desc.includes('gas') || desc.includes('internet') || desc.includes('wifi') || desc.includes('bill')) {
        category = 'Utilities';
      } else if (desc.includes('dinner') || desc.includes('lunch') || desc.includes('breakfast') || desc.includes('restaurant') || desc.includes('zomato') || desc.includes('swiggy')) {
        category = 'Dining Out';
      } else if (desc.includes('movie') || desc.includes('netflix') || desc.includes('spotify') || desc.includes('entertainment')) {
        category = 'Entertainment';
      } else if (desc.includes('uber') || desc.includes('ola') || desc.includes('metro') || desc.includes('petrol') || desc.includes('transport')) {
        category = 'Transport';
      } else if (desc.includes('cleaning') || desc.includes('supplies') || desc.includes('household')) {
        category = 'Household';
      }
      
      categoryMap.set(category, (categoryMap.get(category) || 0) + exp.totalAmount);
    });

    const categoryData = Array.from(categoryMap.entries())
      .map(([name, value]) => ({ name, value: Math.round(value) }))
      .sort((a, b) => b.value - a.value);

    // Monthly spending trend (last 6 months)
    const monthlyMap = new Map<string, number>();
    const now = new Date();
    
    // Initialize last 6 months with 0
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = date.toLocaleDateString('en-US', { month: 'short' });
      monthlyMap.set(key, 0);
    }
    
    expenses.forEach(exp => {
      const expDate = new Date(exp.date);
      const monthDiff = (now.getFullYear() - expDate.getFullYear()) * 12 + now.getMonth() - expDate.getMonth();
      if (monthDiff >= 0 && monthDiff < 6) {
        const key = expDate.toLocaleDateString('en-US', { month: 'short' });
        if (monthlyMap.has(key)) {
          monthlyMap.set(key, monthlyMap.get(key)! + exp.totalAmount);
        }
      }
    });

    const monthlyData = Array.from(monthlyMap.entries()).map(([month, amount]) => ({
      month,
      amount: Math.round(amount),
    }));

    // Top spenders
    const spenderMap = new Map<string, { name: string; amount: number; avatar: string }>();
    expenses.forEach(exp => {
      if (exp.paidByUser) {
        const current = spenderMap.get(exp.paidByUser.id.toString()) || {
          name: exp.paidByUser.name,
          amount: 0,
          avatar: exp.paidByUser.avatarUrl || '',
        };
        current.amount += exp.totalAmount;
        spenderMap.set(exp.paidByUser.id.toString(), current);
      }
    });

    const topSpenders = Array.from(spenderMap.values())
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    const totalSpent = expenses.reduce((sum, exp) => sum + exp.totalAmount, 0);
    const avgExpense = expenses.length > 0 ? totalSpent / expenses.length : 0;

    return { categoryData, monthlyData, topSpenders, totalSpent, avgExpense };
  }, [expenses]);

  const { categoryData, monthlyData, topSpenders, totalSpent, avgExpense } = analyticsData;

  if (expenses.length === 0) {
    return (
      <Card>
        <h3 className="font-bold text-lg mb-4">📊 Spending Analytics</h3>
        <p className="text-gray-500 text-center py-8">
          No expense data yet. Add some expenses to see analytics!
        </p>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl p-4 text-white"
        >
          <p className="text-teal-100 text-sm">Total Spent</p>
          <p className="text-2xl font-bold">₹{totalSpent.toLocaleString('en-IN')}</p>
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white"
        >
          <p className="text-purple-100 text-sm">Total Expenses</p>
          <p className="text-2xl font-bold">{expenses.length}</p>
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 text-white"
        >
          <p className="text-orange-100 text-sm">Average</p>
          <p className="text-2xl font-bold">₹{Math.round(avgExpense).toLocaleString('en-IN')}</p>
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl p-4 text-white"
        >
          <p className="text-pink-100 text-sm">Categories</p>
          <p className="text-2xl font-bold">{categoryData.length}</p>
        </motion.div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend */}
        <Card>
          <h3 className="font-bold text-lg mb-4">📈 Monthly Spending Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0D9488" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0D9488" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} tickFormatter={(val) => `₹${val}`} />
                <Tooltip
                  formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Spent']}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#0D9488"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorAmount)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Category Breakdown Pie */}
        <Card>
          <h3 className="font-bold text-lg mb-4">🍕 Spending by Category</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {categoryData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Spent']}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Category Bar Chart */}
        <Card>
          <h3 className="font-bold text-lg mb-4">📊 Category Comparison</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData.slice(0, 6)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" stroke="#6b7280" fontSize={12} tickFormatter={(val) => `₹${val}`} />
                <YAxis dataKey="name" type="category" stroke="#6b7280" fontSize={12} width={80} />
                <Tooltip
                  formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Spent']}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {categoryData.slice(0, 6).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Top Spenders */}
        <Card>
          <h3 className="font-bold text-lg mb-4">🏆 Top Contributors</h3>
          <div className="space-y-4">
            {topSpenders.map((spender, index) => (
              <motion.div
                key={spender.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-4"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 font-bold text-sm">
                  {index + 1}
                </div>
                <img
                  src={spender.avatar}
                  alt={spender.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1">
                  <p className="font-medium">{spender.name}</p>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(spender.amount / topSpenders[0].amount) * 100}%` }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="h-2 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-teal-600 dark:text-teal-400">
                    ₹{spender.amount.toLocaleString('en-IN')}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      </div>
    </motion.div>
  );
};

export default SpendingAnalytics;
