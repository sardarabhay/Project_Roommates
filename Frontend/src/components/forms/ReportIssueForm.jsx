
import React, { useState } from 'react';
import { X, Upload } from 'lucide-react';
import FormInput from '../auth/FormInput';
import { issuesApi } from '../../services/api';

const FormTextArea = ({ label, placeholder, error, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
    <textarea
      placeholder={placeholder}
      rows="3"
      className={`w-full p-2 rounded-lg border bg-gray-50 dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 ${error ? 'border-red-500 ring-red-500' : 'focus:ring-teal-500'}`}
      {...props}
    />
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

const ReportIssueForm = ({ onClose }) => {
  const [formData, setFormData] = useState({ title: '', description: '' });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Issue title is required.';
    return newErrors;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    
    if (Object.keys(validationErrors).length === 0) {
      setIsSubmitting(true);
      try {
        await issuesApi.create({
          title: formData.title,
          description: formData.description,
        });
        onClose();
      } catch (error) {
        console.error('Failed to report issue:', error);
        setErrors({ submit: error.message });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold">Report an Issue</h3>
        <button onClick={onClose}><X className="w-6 h-6 text-gray-500" /></button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormInput label="Issue Title" name="title" placeholder="e.g., Leaky faucet in bathroom" value={formData.title} onChange={handleChange} error={errors.title} />
        <FormTextArea label="Description" name="description" placeholder="Provide more details about the issue..." value={formData.description} onChange={handleChange} />
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Attach Photo (Optional)</label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="flex text-sm text-gray-600 dark:text-gray-400">
                <label htmlFor="file-upload" className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-teal-600 hover:text-teal-500 focus-within:outline-none">
                  <span>Upload a file</span>
                  <input id="file-upload" name="file-upload" type="file" className="sr-only" />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG, GIF up to 10MB</p>
            </div>
          </div>
        </div>
        {errors.submit && <p className="text-red-500 text-sm">{errors.submit}</p>}
        <div className="flex justify-end space-x-3 pt-4">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg font-semibold bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500">Cancel</button>
          <button type="submit" disabled={isSubmitting} className="px-4 py-2 rounded-lg font-semibold bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-50">
            {isSubmitting ? 'Submitting...' : 'Submit Report'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReportIssueForm;