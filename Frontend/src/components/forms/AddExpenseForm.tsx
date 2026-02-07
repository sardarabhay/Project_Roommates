import { useState, useEffect, ChangeEvent, FormEvent, SelectHTMLAttributes, ReactNode } from 'react';
import { X, ShoppingCart, Home, Zap, Utensils, Film, Car, Package, MoreHorizontal, LucideIcon } from 'lucide-react';
import FormInput from '../auth/FormInput';
import { usersApi, expensesApi, getUser } from '../../services/api';
import type { User } from '../../types';

interface ExpenseCategory {
  id: string;
  label: string;
  icon: LucideIcon;
  color: string;
}

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  { id: 'groceries', label: 'Groceries', icon: ShoppingCart, color: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300' },
  { id: 'rent', label: 'Rent', icon: Home, color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300' },
  { id: 'utilities', label: 'Utilities', icon: Zap, color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-300' },
  { id: 'food', label: 'Food & Dining', icon: Utensils, color: 'bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300' },
  { id: 'entertainment', label: 'Entertainment', icon: Film, color: 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300' },
  { id: 'transport', label: 'Transport', icon: Car, color: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900 dark:text-cyan-300' },
  { id: 'household', label: 'Household', icon: Package, color: 'bg-pink-100 text-pink-600 dark:bg-pink-900 dark:text-pink-300' },
  { id: 'other', label: 'Other', icon: MoreHorizontal, color: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300' },
];

export const getCategoryInfo = (categoryId: string): ExpenseCategory => {
  return EXPENSE_CATEGORIES.find(c => c.id === categoryId) || EXPENSE_CATEGORIES[EXPENSE_CATEGORIES.length - 1];
};

interface FormSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  children: ReactNode;
  error?: string;
}

const FormSelect = ({ label, children, error, ...props }: FormSelectProps): JSX.Element => (
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

interface AddExpenseFormProps {
  onClose: () => void;
  onSuccess?: () => void;
}

interface ExpenseFormData {
  description: string;
  amount: string;
  paidByUserId: string;
  category: string;
}

interface FormErrors {
  description?: string;
  amount?: string;
  splits?: string;
  submit?: string;
}

interface UserSplit {
  userId: number;
  amount: string;
  included: boolean;
}

const AddExpenseForm = ({ onClose, onSuccess }: AddExpenseFormProps): JSX.Element => {
  const [users, setUsers] = useState<User[]>([]);
  const currentUser = getUser();
  const [formData, setFormData] = useState<ExpenseFormData>({ 
    description: '', 
    amount: '', 
    paidByUserId: currentUser?.id?.toString() || '',
    category: 'other'
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [splitEqually, setSplitEqually] = useState<boolean>(true);
  const [userSplits, setUserSplits] = useState<UserSplit[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    const fetchUsers = async (): Promise<void> => {
      try {
        const data = await usersApi.getAll();
        setUsers(data);
        // Initialize splits for all users (everyone included, including payer)
        setUserSplits(data.map(u => ({
          userId: u.id,
          amount: '',
          included: true
        })));
      } catch (error) {
        console.error('Failed to fetch users:', error);
      }
    };
    fetchUsers();
  }, [currentUser?.id]);

  // When payer changes, keep everyone included (payer's share = what they cover themselves)
  useEffect(() => {
    // Just trigger a recalculation if needed
  }, [formData.paidByUserId]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSplitAmountChange = (userId: number, amount: string): void => {
    setUserSplits(prev => prev.map(s => 
      s.userId === userId ? { ...s, amount } : s
    ));
  };

  const handleSplitToggle = (userId: number): void => {
    setUserSplits(prev => prev.map(s => 
      s.userId === userId ? { ...s, included: !s.included, amount: s.included ? '' : s.amount } : s
    ));
  };

  const getSplitRemaining = (): number => {
    const total = parseFloat(formData.amount) || 0;
    const allocated = userSplits
      .filter(s => s.included)
      .reduce((sum, s) => sum + (parseFloat(s.amount) || 0), 0);
    return total - allocated;
  };

  const splitEvenlyAmongSelected = (): void => {
    const total = parseFloat(formData.amount) || 0;
    const includedUsers = userSplits.filter(s => s.included);
    if (includedUsers.length === 0) return;
    
    const perPerson = (total / includedUsers.length).toFixed(2);
    setUserSplits(prev => prev.map(s => ({
      ...s,
      amount: s.included ? perPerson : ''
    })));
  };
  
  const validate = (): FormErrors => {
    const newErrors: FormErrors = {};
    if (!formData.description.trim()) newErrors.description = 'Description is required.';
    if (!formData.amount) {
      newErrors.amount = 'Amount is required.';
    } else if (isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      newErrors.amount = 'Please enter a valid, positive amount.';
    }
    
    // Validate unequal splits
    if (!splitEqually) {
      const total = parseFloat(formData.amount) || 0;
      const allocated = userSplits
        .filter(s => s.included)
        .reduce((sum, s) => sum + (parseFloat(s.amount) || 0), 0);
      
      if (Math.abs(total - allocated) > 0.01) {
        newErrors.splits = `Split amounts must equal total (₹${total.toFixed(2)}). Currently: ₹${allocated.toFixed(2)}`;
      }
      
      const hasInvalidAmount = userSplits.some(s => s.included && (parseFloat(s.amount) || 0) <= 0);
      if (hasInvalidAmount) {
        newErrors.splits = 'All included users must have a positive amount.';
      }
    }
    
    return newErrors;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    
    if (Object.keys(validationErrors).length === 0) {
      setIsSubmitting(true);
      try {
        const payerId = parseInt(formData.paidByUserId);
        
        // Prepare splits for unequal option - exclude the payer (they don't owe themselves)
        const splits = !splitEqually 
          ? userSplits
              .filter(s => s.included && parseFloat(s.amount) > 0 && s.userId !== payerId)
              .map(s => ({
                owedByUserId: s.userId,
                amount: parseFloat(s.amount)
              }))
          : undefined;

        await expensesApi.create({
          description: formData.description,
          totalAmount: parseFloat(formData.amount),
          paidByUserId: payerId,
          category: formData.category,
          splits,
        });
        if (onSuccess) onSuccess();
        onClose();
      } catch (error) {
        const err = error as Error;
        console.error('Failed to add expense:', error);
        setErrors({ submit: err.message });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="p-6 max-h-[80vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-6 sticky top-0 bg-white dark:bg-gray-800 pb-2 -mt-2 pt-2 z-10">
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

        {/* Unequal Split UI */}
        {!splitEqually && (
          <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Enter each person's share
              </span>
              <button
                type="button"
                onClick={splitEvenlyAmongSelected}
                className="text-xs text-teal-600 hover:text-teal-700 font-medium"
              >
                Split evenly
              </button>
            </div>
            
            {users.map(user => {
              const split = userSplits.find(s => s.userId === user.id);
              const isPayer = user.id === parseInt(formData.paidByUserId);
              
              return (
                <div key={user.id} className="flex items-center gap-3 p-2 rounded-lg">
                  <input
                    type="checkbox"
                    checked={split?.included || false}
                    onChange={() => handleSplitToggle(user.id)}
                    className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                  />
                  <img 
                    src={user.avatarUrl || ''} 
                    alt={user.name} 
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="flex-1 text-sm font-medium">
                    {user.name} {isPayer && <span className="text-teal-600">(Payer - their share)</span>}
                  </span>
                  {split?.included && (
                    <div className="flex items-center gap-1">
                      <span className="text-gray-500">₹</span>
                      <input
                        type="number"
                        value={split.amount}
                        onChange={(e) => handleSplitAmountChange(user.id, e.target.value)}
                        placeholder="0.00"
                        className="w-20 p-1 text-sm rounded border bg-white dark:bg-gray-600 dark:border-gray-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                      />
                    </div>
                  )}
                </div>
              );
            })}
            
            {formData.amount && (
              <div className={`text-sm font-medium pt-2 border-t dark:border-gray-600 ${
                Math.abs(getSplitRemaining()) < 0.01 
                  ? 'text-green-600' 
                  : 'text-red-500'
              }`}>
                {Math.abs(getSplitRemaining()) < 0.01 
                  ? '✓ Splits add up correctly'
                  : `Remaining to allocate: ₹${getSplitRemaining().toFixed(2)}`
                }
              </div>
            )}
            
            <p className="text-xs text-gray-500 dark:text-gray-400">
              💡 The payer's share is what they cover for themselves. Others' shares become what they owe.
            </p>
            
            {errors.splits && <p className="text-red-500 text-sm">{errors.splits}</p>}
          </div>
        )}

        {errors.submit && <p className="text-red-500 text-sm">{errors.submit}</p>}
        <div className="flex justify-end space-x-3 pt-4 sticky bottom-0 bg-white dark:bg-gray-800 pb-2 -mb-2">
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