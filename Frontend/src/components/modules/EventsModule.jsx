import { MoreVertical, Users, Calendar, MapPin } from 'lucide-react';
import Card from '../common/Card';
import ModuleHeader from '../common/ModuleHeader';
import { eventsApi } from '../../services/api';
import { useState, useEffect } from 'react';

const EventsModule = ({ onCreateEvent, user }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const data = await eventsApi.getAll();
      setEvents(data);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRSVP = async (eventId, response) => {
    try {
      const updatedEvent = await eventsApi.rsvp(eventId, response);
      setEvents(prevEvents => 
        prevEvents.map(event => 
          event.id === eventId ? updatedEvent : event
        )
      );
    } catch (error) {
      console.error('Failed to RSVP:', error);
    }
  };

  const getRSVPStatus = (event) => {
    if (!user) return 'not-going';
    if (event.rsvps.going.some(u => u.id === user.id)) return 'going';
    if (event.rsvps.maybe.some(u => u.id === user.id)) return 'maybe';
    return 'not-going';
  };

  const getRSVPCounts = (event) => {
    return {
      going: event.rsvps.going.length,
      maybe: event.rsvps.maybe.length,
      total: event.rsvps.going.length + event.rsvps.maybe.length
    };
  };

  if (loading) {
    return (
      <div className="animate-fade-in">
        <ModuleHeader title="Events & Social" actionText="Create Event" onActionClick={onCreateEvent} />
        <p className="text-gray-500">Loading events...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <ModuleHeader title="Events & Social" actionText="Create Event" onActionClick={onCreateEvent} />
      {events.length === 0 ? (
        <Card className="p-6 text-center">
          <p className="text-gray-500">No events yet. Create your first event!</p>
        </Card>
      ) : (
        <div className="space-y-6">
          {events.map(event => {
            const rsvpStatus = getRSVPStatus(event);
            const rsvpCounts = getRSVPCounts(event);
          
            return (
              <Card key={event.id} className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <p className="text-xl font-bold">{event.title}</p>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        by {event.createdByUser?.name}
                      </span>
                    </div>
                  
                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        {new Date(event.date).toLocaleString('en-IN', { 
                          weekday: 'long', 
                          month: 'short', 
                          day: 'numeric', 
                          hour: 'numeric', 
                          minute: '2-digit' 
                        })}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2" />
                        {event.location}
                      </div>
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-2" />
                        {rsvpCounts.going} going • {rsvpCounts.maybe} maybe • {rsvpCounts.total} total
                      </div>
                    </div>

                    {/* RSVP Status Display */}
                    {rsvpCounts.going > 0 && (
                      <div className="mt-4">
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Who's Going:
                        </p>
                        <div className="flex -space-x-2">
                          {event.rsvps.going.map(u => (
                            <img 
                              key={u.id} 
                              src={u.avatarUrl} 
                              alt={u.name}
                              className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800"
                              title={u.name}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col space-y-2 min-w-[200px]">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleRSVP(event.id, 'going')}
                        className={`flex-1 px-4 py-2 text-sm rounded-lg font-semibold transition-colors ${
                          rsvpStatus === 'going' 
                            ? 'bg-teal-600 text-white' 
                            : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                        }`}
                      >
                        Going
                      </button>
                      <button 
                        onClick={() => handleRSVP(event.id, 'maybe')}
                        className={`flex-1 px-4 py-2 text-sm rounded-lg font-semibold transition-colors ${
                          rsvpStatus === 'maybe' 
                            ? 'bg-yellow-500 text-white' 
                            : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                        }`}
                      >
                        Maybe
                      </button>
                    </div>
                    <button 
                      onClick={() => handleRSVP(event.id, 'not-going')}
                      className={`w-full px-4 py-2 text-sm rounded-lg font-semibold transition-colors ${
                        rsvpStatus === 'not-going' 
                          ? 'bg-red-600 text-white' 
                          : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                      }`}
                    >
                      Can't Go
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default EventsModule;