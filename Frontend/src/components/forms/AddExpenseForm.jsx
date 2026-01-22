
import React, { useState, useEffect } from 'react';
import { X, ShoppingCart, Home, Zap, Utensils, Film, Car, Package, MoreHorizontal } from 'lucide-react';
import FormInput from '../auth/FormInput';
import { usersApi, expensesApi, getUser } from '../../services/api';

const EXPENSE_CATEGORIES = [
  { id: 'groceries', label: 'Groceries', icon: ShoppingCart, color: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300' },
  { id: 'rent', label: 'Rent', icon: Home, color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300' },
  { id: 'utilities', label: 'Utilities', icon: Zap, color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-300' },
  { id: 'food', label: 'Food & Dining', icon: Utensils, color: 'bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300' },
  { id: 'entertainment', label: 'Entertainment', icon: Film, color: 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300' },
  { id: 'transport', label: 'Transport', icon: Car, color: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900 dark:text-cyan-300' },
  { id: 'household', label: 'Household', icon: Package, color: 'bg-pink-100 text-pink-600 dark:bg-pink-900 dark:text-pink-300' },
  { id: 'other', label: 'Other', icon: MoreHorizontal, color: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300' },
];

export const getCategoryInfo = (categoryId) => {
  return EXPENSE_CATEGORIES.find(c => c.id === categoryId) || EXPENSE_CATEGORIES[EXPENSE_CATEGORIES.length - 1];
};

const FormSelect = ({ label, children, error, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
    <select
      className={`w-full p-2 rounded-lg border bg-gray-50 dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 ${error ? 'border-red-500 ring-red-500' : 'focus:ring-teal-500'}`}
      {...props}
    >
      {children}
    </select>
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

const AddExpenseForm = ({ onClose, onSuccess }) => {
  const [users, setUsers] = useState([]);
  const currentUser = getUser();
  const [formData, setFormData] = useState({ 
    description: '', 
    amount: '', 
    paidByUserId: currentUser?.id || '',
    category: 'other'
  });
  const [errors, setErrors] = useState({});
  const [splitEqually, setSplitEqually] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const validate = () => {
    const newErrors = {};
    if (!formData.description.trim()) newErrors.description = 'Description is required.';
    if (!formData.amount) {
      newErrors.amount = 'Amount is required.';
    } else if (isNaN(formData.amount) || Number(formData.amount) <= 0) {
      newErrors.amount = 'Please enter a valid, positive amount.';
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    
    if (Object.keys(validationErrors).length === 0) {
      setIsSubmitting(true);
      try {
        await expensesApi.create({
          description: formData.description,
          totalAmount: parseFloat(formData.amount),
          paidByUserId: parseInt(formData.paidByUserId),
          category: formData.category,
        });
        if (onSuccess) onSuccess();
        onClose();
      } catch (error) {
        console.error('Failed to add expense:', error);
        setErrors({ submit: error.message });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold">Add New Expense</h3>
        <button onClick={onClose}><X className="w-6 h-6 text-gray-500" /></button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormInput label="Description" name="description" placeholder="e.g., Weekly groceries" value={formData.description} onChange={handleChange} error={errors.description} />
        <FormInput label="Amount (₹)" name="amount" type="number" placeholder="0.00" value={formData.amount} onChange={handleChange} error={errors.amount} />
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
          <div className="grid grid-cols-4 gap-2">
            {EXPENSE_CATEGORIES.map(cat => {
              const Icon = cat.icon;
              const isSelected = formData.category === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, category: cat.id })}
                  className={`flex flex-col items-center p-2 rounded-lg border-2 transition-all ${
                    isSelected 
                      ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/30' 
                      : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className={`p-2 rounded-full ${cat.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs mt-1 text-center">{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <FormSelect label="Paid By" name="paidByUserId" value={formData.paidByUserId} onChange={handleChange}>
          {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
        </FormSelect>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Split</label>
          <div className="flex items-center space-x-4">
            <button type="button" onClick={() => setSplitEqually(true)} className={`px-4 py-2 rounded-lg text-sm font-semibold w-full ${splitEqually ? 'bg-teal-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>Equally</button>
            <button type="button" onClick={() => setSplitEqually(false)} className={`px-4 py-2 rounded-lg text-sm font-semibold w-full ${!splitEqually ? 'bg-teal-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>Unequally</button>
          </div>
        </div>
        {errors.submit && <p className="text-red-500 text-sm">{errors.submit}</p>}
        <div className="flex justify-end space-x-3 pt-4">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg font-semibold bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500">Cancel</button>
          <button type="submit" disabled={isSubmitting} className="px-4 py-2 rounded-lg font-semibold bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-50">
            {isSubmitting ? 'Adding...' : 'Add Expense'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddExpenseForm;