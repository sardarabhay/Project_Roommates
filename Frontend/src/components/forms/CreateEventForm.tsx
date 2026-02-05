import { useState, ChangeEvent, FormEvent } from 'react';
import { X } from 'lucide-react';
import FormInput from '../auth/FormInput';
import { eventsApi } from '../../services/api';

interface CreateEventFormProps {
  onClose: () => void;
}

interface EventFormData {
  title: string;
  location: string;
  dateTime: string;
}

interface FormErrors {
  title?: string;
  location?: string;
  dateTime?: string;
  submit?: string;
}

const CreateEventForm = ({ onClose }: CreateEventFormProps): JSX.Element => {
  const [formData, setFormData] = useState<EventFormData>({ title: '', location: '', dateTime: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validate = (): FormErrors => {
    const newErrors: FormErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Event title is required.';
    if (!formData.location.trim()) newErrors.location = 'Location is required.';
    if (!formData.dateTime) {
      newErrors.dateTime = 'Date and time are required.';
    } else if (new Date(formData.dateTime) < new Date()) {
      newErrors.dateTime = 'Event must be in the future.';
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
        await eventsApi.create({
          title: formData.title,
          location: formData.location,
          date: formData.dateTime,
        });
        onClose();
      } catch (error) {
        const err = error as Error;
        console.error('Failed to create event:', error);
        setErrors({ submit: err.message });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold">Create New Event</h3>
        <button onClick={onClose}><X className="w-6 h-6 text-gray-500" /></button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormInput label="Event Title" name="title" placeholder="e.g., Movie Marathon" value={formData.title} onChange={handleChange} error={errors.title} />
        <FormInput label="Location" name="location" placeholder="e.g., Living Room" value={formData.location} onChange={handleChange} error={errors.location}/>
        <FormInput label="Date and Time" name="dateTime" type="datetime-local" value={formData.dateTime} onChange={handleChange} error={errors.dateTime} />
        {errors.submit && <p className="text-red-500 text-sm">{errors.submit}</p>}
        <div className="flex justify-end space-x-3 pt-4">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg font-semibold bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500">Cancel</button>
          <button type="submit" disabled={isSubmitting} className="px-4 py-2 rounded-lg font-semibold bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-50">
            {isSubmitting ? 'Creating...' : 'Create Event'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateEventForm;