
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import FormInput from '../auth/FormInput';
import { usersApi, expensesApi, getUser } from '../../services/api';

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

const AddExpenseForm = ({ onClose }) => {
  const [users, setUsers] = useState([]);
  const currentUser = getUser();
  const [formData, setFormData] = useState({ 
    description: '', 
    amount: '', 
    paidByUserId: currentUser?.id || '' 
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
          // If splitting equally, backend will handle it
          // Otherwise, we could add custom split logic here
        });
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
        <FormInput label="Description" name="description" placeholder="e.g., Groceries, Rent" value={formData.description} onChange={handleChange} error={errors.description} />
        <FormInput label="Amount (₹)" name="amount" type="number" placeholder="0.00" value={formData.amount} onChange={handleChange} error={errors.amount} />
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