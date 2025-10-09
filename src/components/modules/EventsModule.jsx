
import { MoreVertical } from 'lucide-react';
import Card from '../common/Card';
import ModuleHeader from '../common/ModuleHeader';
import { mockEvents } from '../../data/mockData';

const EventsModule = ({ onCreateEvent }) => (
  <div className="animate-fade-in">
    <ModuleHeader title="Events & Social" actionText="Create Event" onActionClick={onCreateEvent} />
    <div className="space-y-6">
      {mockEvents.map(event => (
        <Card key={event.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
          <div className="mb-4 sm:mb-0">
            <p className="text-xl font-bold">{event.title}</p>
            <p className="text-gray-500 dark:text-gray-400">{new Date(event.date).toLocaleString('en-IN', { weekday: 'long', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">at {event.location}</p>
          </div>
          <div className="flex items-center space-x-2">
            <button className="bg-teal-600 text-white px-4 py-2 text-sm rounded-lg font-semibold">Going</button>
            <button className="bg-gray-200 dark:bg-gray-700 px-4 py-2 text-sm rounded-lg font-semibold">Maybe</button>
            <button className="px-2 py-2 text-sm rounded-lg"><MoreVertical className="w-5 h-5"/></button>
          </div>
        </Card>
      ))}
    </div>
  </div>
);

export default EventsModule;