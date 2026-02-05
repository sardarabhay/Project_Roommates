import { Plus } from 'lucide-react';

interface ModuleHeaderProps {
  title: string;
  actionText?: string;
  onActionClick?: () => void;
}

const ModuleHeader = ({ title, actionText, onActionClick }: ModuleHeaderProps): JSX.Element => (
  <div className="flex items-center justify-between mb-6">
    <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100">{title}</h2>
    {actionText && (
      <button onClick={onActionClick} className="flex items-center bg-teal-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-teal-700 transition-colors">
        <Plus className="w-5 h-5 mr-2" />
        {actionText}
      </button>
    )}
  </div>
);

export default ModuleHeader;