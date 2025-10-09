
import Card from '../common/Card';
import ModuleHeader from '../common/ModuleHeader';
import { mockExpenses, allUsers } from '../../data/mockData';

const FinanceModule = ({ onAddExpense, onSettleUp, balances }) => (
  <div className="animate-fade-in">
    <ModuleHeader title="Finance Hub" actionText="Add Expense" onActionClick={onAddExpense} />
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      <Card className="text-center">
        <h4 className="text-gray-500 dark:text-gray-400">Total Household Spending (Sept)</h4>
        <p className="text-3xl font-bold mt-2">₹15000</p>
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
      <ul className="divide-y dark:divide-gray-700">
        {mockExpenses.map(exp => (
          <li key={exp.id} className="py-4 flex items-center justify-between">
            <div>
              <p className="font-semibold">{exp.description}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Paid by {allUsers.find(u=>u.id === exp.paid_by_user_id)?.name} on {exp.date}</p>
            </div>
            <p className="font-bold text-lg">₹{exp.total_amount.toFixed(2)}</p>
          </li>
        ))}
      </ul>
    </Card>
  </div>
);

export default FinanceModule;