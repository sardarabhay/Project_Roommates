
import React, { useState } from 'react';
import { Circle, ArrowRightCircle, CheckCircle } from 'lucide-react';
import ModuleHeader from '../common/ModuleHeader';
import ChoreCard from './ChoreCard';
import { initialChores, mockUser } from '../../data/mockData';

const ChoresModule = ({ onAddTask }) => {
  const [chores, setChores] = useState(initialChores);

  const findTask = (taskId) => {
    for (const status in chores) {
      const task = chores[status].find(t => t.id === taskId);
      if (task) return { task, status };
    }
    return { task: null, status: null };
  };

  const handleUpdateStatus = (taskId, newStatus) => {
    const { task, status: oldStatus } = findTask(taskId);
    if (!task) return;

    setChores(prevChores => {
      const newChores = { ...prevChores };
      
      newChores[oldStatus] = newChores[oldStatus].filter(t => t.id !== taskId);
    
      newChores[newStatus] = [...newChores[newStatus], { ...task, status: newStatus }];
      return newChores;
    });
  };
  
  const handleClaimTask = (taskId) => {
    const { task, status: oldStatus } = findTask(taskId);
    if (!task || task.assignedTo !== 'Unassigned') return;
    
    setChores(prevChores => {
      const newChores = { ...prevChores };
      newChores[oldStatus] = newChores[oldStatus].filter(t => t.id !== taskId);
      newChores['in_progress'] = [...newChores['in_progress'], { ...task, assignedTo: mockUser.name, status: 'in_progress' }];
      return newChores;
    });
  };

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
                <ChoreCard key={task.id} task={{...task, status}} onUpdateStatus={handleUpdateStatus} onClaimTask={handleClaimTask}/>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChoresModule;