import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Landlord } from '../../types';

interface EditLandlordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { name: string; phone?: string; email?: string }) => Promise<void>;
  landlord?: Landlord | null;
}

const EditLandlordModal = ({ isOpen, onClose, onSave, landlord }: EditLandlordModalProps): JSX.Element | null => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
  });
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (landlord) {
      setFormData({
        name: landlord.name || '',
        phone: landlord.phone || '',
        email: landlord.email || '',
      });
    } else {
      setFormData({ name: '', phone: '', email: '' });
    }
  }, [landlord]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setLoading(true);
    try {
      await onSave({
        name: formData.name,
        phone: formData.phone || undefined,
        email: formData.email || undefined,
      });
      onClose();
    } catch (error) {
      console.error('Failed to save landlord:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
          <h2 className="text-xl font-bold">{landlord ? 'Edit Landlord Info' : 'Add Landlord Info'}</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Landlord Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Enter landlord name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Enter phone number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Enter email address"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : landlord ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditLandlordModal;
