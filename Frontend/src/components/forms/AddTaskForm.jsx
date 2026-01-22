
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import FormInput from '../auth/FormInput';
import { usersApi, choresApi } from '../../services/api';

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

const AddTaskForm = ({ onClose }) => {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({ title: '', assignedToUserId: '', points: '', dueDate: '' });
  const [errors, setErrors] = useState({});
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
    if (!formData.title.trim()) newErrors.title = 'Task title is required.';
    if (formData.dueDate && new Date(formData.dueDate) < new Date().setHours(0,0,0,0)) {
      newErrors.dueDate = 'Due date cannot be in the past.';
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
        await choresApi.create({
          title: formData.title,
          assignedToUserId: formData.assignedToUserId ? parseInt(formData.assignedToUserId) : null,
          points: formData.points ? parseInt(formData.points) : 0,
          dueDate: formData.dueDate || null,
        });
        onClose();
      } catch (error) {
        console.error('Failed to add task:', error);
        setErrors({ submit: error.message });
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
        <FormSelect label="Assign To" name="assignedToUserId" value={formData.assignedToUserId} onChange={handleChange}>
          <option value="">Unassigned</option>
          {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
        </FormSelect>
        <FormInput label="Points" name="points" type="number" placeholder="e.g., 10" value={formData.points} onChange={handleChange} />
        <FormInput label="Due Date" name="dueDate" type="date" value={formData.dueDate} onChange={handleChange} error={errors.dueDate} />
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