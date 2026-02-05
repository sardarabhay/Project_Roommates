import { useState, ChangeEvent, FormEvent } from 'react';
import { X, Trash2, ShoppingCart, Home, Zap, Utensils, Film, Car, Package, MoreHorizontal, LucideIcon } from 'lucide-react';
import FormInput from '../auth/FormInput';
import { expensesApi } from '../../services/api';
import type { Expense } from '../../types';

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

interface EditExpenseModalProps {
  expense: Expense;
  onClose: () => void;
  onSuccess?: () => void;
}

interface ExpenseFormData {
  description: string;
  amount: string;
  category: string;
}

interface FormErrors {
  description?: string;
  amount?: string;
  submit?: string;
}

const EditExpenseModal = ({ expense, onClose, onSuccess }: EditExpenseModalProps): JSX.Element => {
  const [formData, setFormData] = useState<ExpenseFormData>({
    description: expense.description,
    amount: expense.totalAmount.toString(),
    category: expense.category || 'other',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validate = (): FormErrors => {
    const newErrors: FormErrors = {};
    if (!formData.description.trim()) newErrors.description = 'Description is required.';
    if (!formData.amount) {
      newErrors.amount = 'Amount is required.';
    } else if (isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      newErrors.amount = 'Please enter a valid, positive amount.';
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
        await expensesApi.update(expense.id, {
          description: formData.description,
          totalAmount: parseFloat(formData.amount),
          category: formData.category,
        });
        if (onSuccess) onSuccess();
        onClose();
      } catch (error) {
        const err = error as Error;
        console.error('Failed to update expense:', error);
        setErrors({ submit: err.message });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleDelete = async (): Promise<void> => {
    setIsDeleting(true);
    try {
      await expensesApi.delete(expense.id);
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      const err = error as Error;
      console.error('Failed to delete expense:', error);
      setErrors({ submit: err.message });
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold">Edit Expense</h3>
        <button onClick={onClose}><X className="w-6 h-6 text-gray-500" /></button>
      </div>

      {showDeleteConfirm ? (
        <div className="text-center py-6">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-8 h-8 text-red-600" />
          </div>
          <h4 className="text-lg font-semibold mb-2">Delete Expense?</h4>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Are you sure you want to delete "{expense.description}"? This will also remove all associated splits and cannot be undone.
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="px-4 py-2 rounded-lg font-semibold bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-4 py-2 rounded-lg font-semibold bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormInput
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            error={errors.description}
          />
          <FormInput
            label="Amount (₹)"
            name="amount"
            type="number"
            value={formData.amount}
            onChange={handleChange}
            error={errors.amount}
          />

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

          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-sm">
            <p className="text-gray-500 dark:text-gray-400">
              <strong>Paid by:</strong> {expense.paidByUser?.name}
            </p>
            <p className="text-gray-500 dark:text-gray-400">
              <strong>Date:</strong> {new Date(expense.date).toLocaleDateString()}
            </p>
            {expense.splits && expense.splits.length > 0 && (
              <p className="text-gray-500 dark:text-gray-400">
                <strong>Split among:</strong> {expense.splits.map(s => s.owedByUser?.name).join(', ')}
              </p>
            )}
          </div>

          {errors.submit && <p className="text-red-500 text-sm">{errors.submit}</p>}

          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 rounded-lg font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg font-semibold bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 rounded-lg font-semibold bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default EditExpenseModal;
