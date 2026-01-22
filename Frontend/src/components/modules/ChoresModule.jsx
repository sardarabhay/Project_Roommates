
import React, { useState, useEffect } from 'react';
import { Circle, ArrowRightCircle, CheckCircle } from 'lucide-react';
import ModuleHeader from '../common/ModuleHeader';
import ChoreCard from './ChoreCard';
import { choresApi } from '../../services/api';

const ChoresModule = ({ onAddTask, user }) => {
  const [chores, setChores] = useState({ todo: [], in_progress: [], done: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChores();
  }, []);

  const fetchChores = async () => {
    try {
      const data = await choresApi.getAll();
      setChores(data);
    } catch (error) {
      console.error('Failed to fetch chores:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (taskId, newStatus) => {
    try {
      await choresApi.updateStatus(taskId, newStatus);
      fetchChores(); // Refresh the list
    } catch (error) {
      console.error('Failed to update chore status:', error);
    }
  };
  
  const handleClaimTask = async (taskId) => {
    try {
      await choresApi.claim(taskId);
      fetchChores(); // Refresh the list
    } catch (error) {
      console.error('Failed to claim chore:', error);
    }
  };

  if (loading) {
    return (
      <div className="animate-fade-in">
        <ModuleHeader title="Chores & Tasks" actionText="Add Task" onActionClick={onAddTask} />
        <p className="text-gray-500">Loading chores...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <ModuleHeader title="Chores & Tasks" actionText="Add Task" onActionClick={onAddTask} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {Object.entries(chores).map(([status, tasks]) => (
          <div key={status}>
            <h3 className="font-semibold mb-4 capitalize pl-2 flex items-center">
              {status === 'todo' && <Circle className="w-4 h-4 mr-2 text-red-500"/>}
              {status === 'in_progress' && <ArrowRightCircle className="w-4 h-4 mr-2 text-yellow-500"/>}
              {status === 'done' && <CheckCircle className="w-4 h-4 mr-2 text-green-500"/>}
              {status.replace('_', ' ')} ({tasks.length})
            </h3>
            <div className="space-y-4 bg-gray-100 dark:bg-gray-900/50 p-4 rounded-lg h-full min-h-[200px]">
              {tasks.map(task => (
                <ChoreCard 
                  key={task.id} 
                  task={{
                    ...task, 
                    status,
                    assignedTo: task.assignedToUser?.name || 'Unassigned'
                  }} 
                  onUpdateStatus={handleUpdateStatus} 
                  onClaimTask={handleClaimTask}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChoresModule;