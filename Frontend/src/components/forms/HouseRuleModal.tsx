import { useState, useEffect, FormEvent } from 'react';
import { X } from 'lucide-react';
import type { HouseRule } from '../../types';

interface HouseRuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (content: string) => Promise<void>;
  rule?: HouseRule | null;
}

const HouseRuleModal = ({ isOpen, onClose, onSave, rule }: HouseRuleModalProps): JSX.Element | null => {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (rule) {
      setContent(rule.content);
    } else {
      setContent('');
    }
  }, [rule]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    try {
      await onSave(content);
      setContent('');
      onClose();
    } catch (error) {
      console.error('Failed to save rule:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
          <h2 className="text-xl font-bold">{rule ? 'Edit House Rule' : 'Add House Rule'}</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Rule Description
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500"
              rows={4}
              placeholder="Enter the house rule..."
              required
            />
          </div>

          <div className="flex justify-end gap-3">
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
              {loading ? 'Saving...' : rule ? 'Update Rule' : 'Add Rule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HouseRuleModal;
