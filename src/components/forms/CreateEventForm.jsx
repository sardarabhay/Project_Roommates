
import React, { useState } from 'react';
import { X } from 'lucide-react';
import FormInput from '../auth/FormInput';

const CreateEventForm = ({ onClose }) => {
  const [formData, setFormData] = useState({ title: '', location: '', dateTime: '' });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Event title is required.';
    if (!formData.location.trim()) newErrors.location = 'Location is required.';
    if (!formData.dateTime) {
      newErrors.dateTime = 'Date and time are required.';
    } else if (new Date(formData.dateTime) < new Date()) {
      newErrors.dateTime = 'Event must be in the future.';
    }
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length === 0) {
      console.log("Event Created:", formData);
      onClose();
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
        <div className="flex justify-end space-x-3 pt-4">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg font-semibold bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500">Cancel</button>
          <button type="submit" className="px-4 py-2 rounded-lg font-semibold bg-teal-600 text-white hover:bg-teal-700">Create Event</button>
        </div>
      </form>
    </div>
  );
};

export default CreateEventForm;