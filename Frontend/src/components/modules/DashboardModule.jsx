
import { ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import Card from '../common/Card';
import ModuleHeader from '../common/ModuleHeader';
import { dashboardApi, usersApi } from '../../services/api';

const DashboardModule = ({ setActiveModule, balances, user }) => {
  const [dashboard, setDashboard] = useState(null);
  const [roommates, setRoommates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashboardData, usersData] = await Promise.all([
          dashboardApi.get(),
          usersApi.getAll()
        ]);
        setDashboard(dashboardData);
        // Filter out current user from roommates
        setRoommates(usersData.filter(u => u.id !== user?.id));
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const userName = user?.name || 'there';

  if (loading) {
    return (
      <div className="space-y-8 animate-fade-in">
        <ModuleHeader title={`Good Day, ${userName}!`} />
        <p className="text-gray-500">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <ModuleHeader title={`Good Day, ${userName}!`} />
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
          {dashboard?.nextChore ? (
            <>
              <p className="text-xl font-semibold">{dashboard.nextChore.title}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {dashboard.nextChore.dueDate 
                  ? `Due ${new Date(dashboard.nextChore.dueDate).toLocaleDateString()}`
                  : 'No due date'}
              </p>
            </>
          ) : (
            <p className="text-gray-500">No chores assigned</p>
          )}
          <div className="mt-4 flex -space-x-2 overflow-hidden">
            {roommates.slice(0, 3).map(r => (
              <img key={r.id} className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-gray-800" src={r.avatarUrl} alt={r.name} />
            ))}
          </div>
        </Card>
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveModule('events')}>
          <h3 className="font-bold text-lg mb-4 flex items-center">🎉 Upcoming Event</h3>
          {dashboard?.upcomingEvent ? (
            <>
              <p className="text-xl font-semibold">{dashboard.upcomingEvent.title}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {new Date(dashboard.upcomingEvent.date).toLocaleDateString('en-IN', {
                  weekday: 'long',
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit'
                })}
              </p>
            </>
          ) : (
            <p className="text-gray-500">No upcoming events</p>
          )}
          <button className="text-teal-600 dark:text-teal-400 font-semibold mt-4 flex items-center group">
            RSVP Now <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </button>
        </Card>
      </div>
      <Card>
        <h3 className="font-bold text-lg mb-4">Recent Activity</h3>
        <ul className="space-y-4">
          {dashboard?.recentActivity?.expenses?.slice(0, 3).map(exp => (
            <li key={exp.id} className="flex items-center justify-between">
              <div className="flex items-center">
                <img src={exp.paidByUser?.avatarUrl} className="w-8 h-8 rounded-full mr-3" alt={exp.paidByUser?.name} />
                <p><span className="font-semibold">{exp.paidByUser?.name}</span> added "{exp.description}" to expenses.</p>
              </div>
              <span className="text-sm text-gray-500">₹{exp.totalAmount}</span>
            </li>
          ))}
          {dashboard?.recentActivity?.chores?.slice(0, 2).map(chore => (
            <li key={chore.id} className="flex items-center justify-between">
              <div className="flex items-center">
                <img src={chore.assignedToUser?.avatarUrl} className="w-8 h-8 rounded-full mr-3" alt={chore.assignedToUser?.name} />
                <p><span className="font-semibold">{chore.assignedToUser?.name}</span> marked "{chore.title}" as done.</p>
              </div>
              <span className="text-sm text-gray-500">+{chore.points} pts</span>
            </li>
          ))}
          {(!dashboard?.recentActivity?.expenses?.length && !dashboard?.recentActivity?.chores?.length) && (
            <li className="text-gray-500">No recent activity</li>
          )}
        </ul>
      </Card>
    </div>
  );
};

export default DashboardModule;