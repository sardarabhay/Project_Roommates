
import { ArrowRight } from 'lucide-react';
import Card from '../common/Card';
import ModuleHeader from '../common/ModuleHeader';
import { mockUser, mockRoommates } from '../../data/mockData';

const DashboardModule = ({ setActiveModule, balances }) => (
  <div className="space-y-8 animate-fade-in">
    <ModuleHeader title={`Good Afternoon, ${mockUser.name}!`} />
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveModule('finance')}>
        <h3 className="font-bold text-lg mb-4 flex items-center">💰 Financial Summary</h3>
        <div className="text-3xl font-bold text-red-500">You owe ₹{balances.youOwe.toFixed(2)}</div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">You are owed ₹{balances.youAreOwed.toFixed(2)}</p>
        <button className="text-teal-600 dark:text-teal-400 font-semibold mt-4 flex items-center group">
          View Details <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
        </button>
      </Card>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveModule('chores')}>
        <h3 className="font-bold text-lg mb-4 flex items-center">🧼 Your Next Chore</h3>
        <p className="text-xl font-semibold">Clean Kitchen</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Due this Saturday</p>
        <div className="mt-4 flex -space-x-2 overflow-hidden">
          {mockRoommates.map(r => <img key={r.id} className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-gray-800" src={r.avatarUrl} alt={r.name} />)}
        </div>
      </Card>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveModule('events')}>
        <h3 className="font-bold text-lg mb-4 flex items-center">🎉 Upcoming Event</h3>
        <p className="text-xl font-semibold">Board Game Night</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Tomorrow at 7:00 PM</p>
        <button className="text-teal-600 dark:text-teal-400 font-semibold mt-4 flex items-center group">
          RSVP Now <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
        </button>
      </Card>
    </div>
    <Card>
      <h3 className="font-bold text-lg mb-4">Recent Activity</h3>
      <ul className="space-y-4">
        <li className="flex items-center justify-between">
          <div className="flex items-center">
            <img src={mockRoommates[0].avatarUrl} className="w-8 h-8 rounded-full mr-3" />
            <p><span className="font-semibold">{mockRoommates[0].name}</span> added "Groceries" to expenses.</p>
          </div>
          <span className="text-sm text-gray-500">2h ago</span>
        </li>
        <li className="flex items-center justify-between">
          <div className="flex items-center">
            <img src={mockRoommates[1].avatarUrl} className="w-8 h-8 rounded-full mr-3" />
            <p><span className="font-semibold">{mockRoommates[1].name}</span> marked "Bathroom Deep Clean" as done.</p>
          </div>
          <span className="text-sm text-gray-500">Yesterday</span>
        </li>
      </ul>
    </Card>
  </div>
);

export default DashboardModule;