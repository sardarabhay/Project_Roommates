
import { X, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import { usersApi, expensesApi } from '../../services/api';

const BalancesModal = ({ onClose, balances, onSettle }) => {
  const { debts, credits } = balances;
  const [users, setUsers] = useState([]);
  const [settling, setSettling] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await usersApi.getAll();
        setUsers(data);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      }
    };
    fetchUsers();
  }, []);

  const getUserById = (userId) => {
    return users.find(u => u.id === parseInt(userId)) || { name: 'Unknown', avatarUrl: '' };
  };

  const handleSettle = async (userId) => {
    setSettling(userId);
    try {
      await expensesApi.settleWithUser(userId);
      if (onSettle) onSettle();
      // Show a brief success state before the data refreshes
    } catch (error) {
      console.error('Failed to settle:', error);
      alert('Failed to settle. Please try again.');
    } finally {
      setSettling(null);
    }
  };

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
                const user = getUserById(userId);
                const isSettling = settling === userId;
                return (
                  <li key={userId} className="py-3 flex items-center justify-between">
                    <div className="flex items-center">
                      <img src={user.avatarUrl} className="w-8 h-8 rounded-full mr-3" alt={user.name}/>
                      <span>You owe <span className="font-bold">{user.name}</span></span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="font-bold text-red-600 dark:text-red-400">₹{amount.toFixed(2)}</span>
                      <button 
                        onClick={() => handleSettle(userId)}
                        disabled={isSettling}
                        className="text-xs bg-teal-600 text-white px-3 py-1 rounded-full font-semibold hover:bg-teal-700 disabled:opacity-50 flex items-center gap-1"
                      >
                        {isSettling ? 'Settling...' : <><Check className="w-3 h-3" /> Settle</>}
                      </button>
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
                const user = getUserById(userId);
                return (
                  <li key={userId} className="py-3 flex items-center justify-between">
                    <div className="flex items-center">
                      <img src={user.avatarUrl} className="w-8 h-8 rounded-full mr-3" alt={user.name}/>
                      <span><span className="font-bold">{user.name}</span> owes you</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="font-bold text-green-600 dark:text-green-400">₹{amount.toFixed(2)}</span>
                      <span className="text-xs text-gray-400">Waiting for payment</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : <p className="text-sm text-gray-500">Nobody owes you anything.</p>}
        </div>
        <div className="text-center p-3 bg-gray-100 dark:bg-gray-700 rounded-lg text-xs text-gray-600 dark:text-gray-400">
          Payments are handled outside the app via UPI, cash, etc. Click "Settle" after you've paid someone.
        </div>
      </div>
    </div>
  );
};

export default BalancesModal;