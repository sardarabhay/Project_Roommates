
import { X } from 'lucide-react';
import { allUsers } from '../../data/mockData';

const BalancesModal = ({ onClose, balances }) => {
  const { debts, credits } = balances;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold">Settle Up</h3>
        <button onClick={onClose}><X className="w-6 h-6 text-gray-500" /></button>
      </div>
      <div className="space-y-6">
        <div>
          <h4 className="font-semibold mb-2 text-red-600 dark:text-red-400">Who You Owe</h4>
          {Object.keys(debts).length > 0 ? (
            <ul className="divide-y dark:divide-gray-700">
              {Object.entries(debts).map(([userId, amount]) => {
                const user = allUsers.find(u => u.id === parseInt(userId));
                return (
                  <li key={userId} className="py-3 flex items-center justify-between">
                    <div className="flex items-center">
                      <img src={user.avatarUrl} className="w-8 h-8 rounded-full mr-3"/>
                      <span>You owe <span className="font-bold">{user.name}</span></span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="font-bold text-red-600 dark:text-red-400">₹{amount.toFixed(2)}</span>
                      <button className="text-xs bg-gray-200 dark:bg-gray-600 px-3 py-1 rounded-full font-semibold hover:bg-gray-300 dark:hover:bg-gray-500">Settle</button>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : <p className="text-sm text-gray-500">You don't owe anyone!</p>}
        </div>
        <div>
          <h4 className="font-semibold mb-2 text-green-600 dark:text-green-400">Who Owes You</h4>
          {Object.keys(credits).length > 0 ? (
            <ul className="divide-y dark:divide-gray-700">
              {Object.entries(credits).map(([userId, amount]) => {
                const user = allUsers.find(u => u.id === parseInt(userId));
                return (
                  <li key={userId} className="py-3 flex items-center justify-between">
                    <div className="flex items-center">
                      <img src={user.avatarUrl} className="w-8 h-8 rounded-full mr-3"/>
                      <span><span className="font-bold">{user.name}</span> owes you</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="font-bold text-green-600 dark:text-green-400">₹{amount.toFixed(2)}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : <p className="text-sm text-gray-500">Nobody owes you anything.</p>}
        </div>
        <div className="text-center p-3 bg-gray-100 dark:bg-gray-700 rounded-lg text-xs text-gray-600 dark:text-gray-400">
          Payments are handled outside the app via UPI, cash, etc. Use "Settle" to record a payment you've made.
        </div>
      </div>
    </div>
  );
};

export default BalancesModal;