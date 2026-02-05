import { CheckCircle } from 'lucide-react';
import Card from '../common/Card';

interface SuccessMessageProps {
  onContinue: () => void;
}

const SuccessMessage = ({ onContinue }: SuccessMessageProps): JSX.Element => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 font-sans p-4">
    <div className="w-full max-w-md">
      <Card className="!p-8 text-center">
        <div className="flex justify-center mb-4">
          <CheckCircle className="w-16 h-16 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
          Account Created Successfully!
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Your account has been created. Please sign in to continue to your dashboard.
        </p>
        <button
          onClick={onContinue}
          className="w-full py-3 px-4 bg-teal-600 text-white font-bold rounded-lg hover:bg-teal-700 transition-colors"
        >
          Continue to Login
        </button>
      </Card>
    </div>
  </div>
);

export default SuccessMessage;