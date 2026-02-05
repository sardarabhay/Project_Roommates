import { useState, useEffect, ChangeEvent, FormEvent, SelectHTMLAttributes, ReactNode } from 'react';
import { X } from 'lucide-react';
import FormInput from '../auth/FormInput';
import { usersApi, choresApi } from '../../services/api';
import type { User } from '../../types';

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

interface AddTaskFormProps {
  onClose: () => void;
  onSuccess?: () => void;
}

interface TaskFormData {
  title: string;
  description: string;
  assignedToUserId: string;
  points: string;
  dueDate: string;
  isRecurring: boolean;
  recurringPattern: string;
}

interface FormErrors {
  title?: string;
  dueDate?: string;
  submit?: string;
}

const AddTaskForm = ({ onClose, onSuccess }: AddTaskFormProps): JSX.Element => {
  const [users, setUsers] = useState<User[]>([]);
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    assignedToUserId: '',
    points: '',
    dueDate: '',
    isRecurring: false,
    recurringPattern: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    const fetchUsers = async (): Promise<void> => {
      try {
        const data = await usersApi.getAll();
        setUsers(data);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      }
    };
    fetchUsers();
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>): void => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validate = (): FormErrors => {
    const newErrors: FormErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Task title is required.';
    if (formData.dueDate && new Date(formData.dueDate).getTime() < new Date().setHours(0,0,0,0)) {
      newErrors.dueDate = 'Due date cannot be in the past.';
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
        await choresApi.create({
          title: formData.title,
          description: formData.description || undefined,
          assignedToUserId: formData.assignedToUserId ? parseInt(formData.assignedToUserId) : undefined,
          points: formData.points ? parseInt(formData.points) : 0,
          dueDate: formData.dueDate || undefined,
          isRecurring: formData.isRecurring,
          recurringPattern: formData.isRecurring ? formData.recurringPattern : undefined,
        });
        if (onSuccess) onSuccess();
        onClose();
      } catch (error) {
        const err = error as Error;
        console.error('Failed to add task:', error);
        setErrors({ submit: err.message });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold">Add New Task</h3>
        <button onClick={onClose}><X className="w-6 h-6 text-gray-500" /></button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormInput label="Task Title" name="title" placeholder="e.g., Clean the living room" value={formData.title} onChange={handleChange} error={errors.title} />
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
          <textarea
            name="description"
            placeholder="Add details about the task..."
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full p-2 rounded-lg border bg-gray-50 dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <FormSelect label="Assign To" name="assignedToUserId" value={formData.assignedToUserId} onChange={handleChange}>
          <option value="">Unassigned</option>
          {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
        </FormSelect>
        <FormInput label="Points" name="points" type="number" placeholder="e.g., 10" value={formData.points} onChange={handleChange} />
        <FormInput label="Due Date" name="dueDate" type="date" value={formData.dueDate} onChange={handleChange} error={errors.dueDate} />

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isRecurring"
            name="isRecurring"
            checked={formData.isRecurring}
            onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
            className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
          />
          <label htmlFor="isRecurring" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Recurring Task
          </label>
        </div>

        {formData.isRecurring && (
          <FormSelect label="Recurrence Pattern" name="recurringPattern" value={formData.recurringPattern} onChange={handleChange}>
            <option value="">Select pattern</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </FormSelect>
        )}

        {errors.submit && <p className="text-red-500 text-sm">{errors.submit}</p>}
        <div className="flex justify-end space-x-3 pt-4">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg font-semibold bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500">Cancel</button>
          <button type="submit" disabled={isSubmitting} className="px-4 py-2 rounded-lg font-semibold bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-50">
            {isSubmitting ? 'Adding...' : 'Add Task'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddTaskForm;
