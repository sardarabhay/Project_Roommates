
import Card from '../common/Card';
import ModuleHeader from '../common/ModuleHeader';
import { mockLandlord, mockIssues } from '../../data/mockData';

const LandlordModule = ({ onReportIssue }) => (
  <div className="animate-fade-in">
    <ModuleHeader title="Landlord & Property" actionText="Report Issue" onActionClick={onReportIssue} />
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-1">
        <h3 className="font-bold text-lg mb-4">Landlord Info</h3>
        <p className="font-semibold text-xl">{mockLandlord.name}</p>
        <p className="text-gray-600 dark:text-gray-300 mt-2">{mockLandlord.phone}</p>
        <p className="text-gray-600 dark:text-gray-300">{mockLandlord.email}</p>
      </Card>
      <Card className="lg:col-span-2">
        <h3 className="font-bold text-lg mb-4">Reported Issues</h3>
        <ul className="divide-y dark:divide-gray-700">
          {mockIssues.map(issue => (
            <li key={issue.id} className="py-3 flex items-center justify-between">
              <div>
                <p className="font-semibold">{issue.title}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Reported by {issue.reportedBy}</p>
              </div>
              <span className={`px-3 py-1 text-xs font-bold rounded-full ${issue.status === 'Resolved' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300'}`}>
                {issue.status}
              </span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
    <Card className="mt-6">
      <h3 className="font-bold text-lg mb-4">Important Documents</h3>
      <div className="p-3 border dark:border-gray-700 rounded-lg flex items-center justify-between">
        <div>
          <p className="font-semibold">Rental Agreement 2025.pdf</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Uploaded by Abhay</p>
        </div>
        <button className="text-sm text-teal-600 font-semibold">Download</button>
      </div>
    </Card>
  </div>
);

export default LandlordModule;