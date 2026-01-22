
import { ArrowRightCircle, CheckCircle, User } from 'lucide-react';
import Card from '../common/Card';
import { mockUser, allUsers } from '../../data/mockData';

const ChoreCard = ({ task, onUpdateStatus, onClaimTask }) => {
  const isMyTask = task.assignedTo === mockUser.name;
  const isUnassigned = task.assignedTo === 'Unassigned';

  const ActionButton = () => {
    if (isUnassigned) {
      return (
        <button
          onClick={() => onClaimTask(task.id)}
          className="text-xs font-bold text-teal-600 bg-teal-100 dark:bg-teal-900/50 dark:text-teal-400 px-3 py-1 rounded-full hover:bg-teal-200 dark:hover:bg-teal-800"
        >
          Take Task
        </button>
      );
    }
    if (isMyTask) {
      if (task.status === 'todo') {
        return (
          <button
            onClick={() => onUpdateStatus(task.id, 'in_progress')}
            className="flex items-center text-xs font-bold text-yellow-600 bg-yellow-100 dark:bg-yellow-900/50 dark:text-yellow-400 px-3 py-1 rounded-full hover:bg-yellow-200 dark:hover:bg-yellow-800"
          >
            <ArrowRightCircle className="w-3 h-3 mr-1" /> Start
          </button>
        );
      }
      if (task.status === 'in_progress') {
        return (
          <button
            onClick={() => onUpdateStatus(task.id, 'done')}
            className="flex items-center text-xs font-bold text-green-600 bg-green-100 dark:bg-green-900/50 dark:text-green-400 px-3 py-1 rounded-full hover:bg-green-200 dark:hover:bg-green-800"
          >
            <CheckCircle className="w-3 h-3 mr-1" /> Finish
          </button>
        );
      }
    }
    return null;
  };

  const assignee = allUsers.find(u => u.name === task.assignedTo);

  return (
    <Card className="!p-4">
      <p className="font-semibold">{task.title}</p>
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center">
          {assignee ? (
            <>
              <img src={assignee.avatarUrl} className="w-6 h-6 rounded-full mr-2" />
              <span className="text-sm">{assignee.name}</span>
            </>
          ) : (
            <div className="flex items-center text-sm text-gray-500">
              <User className="w-6 h-6 rounded-full mr-2 p-1 bg-gray-200 dark:bg-gray-700"/>
              <span>Unassigned</span>
            </div>
          )}
        </div>
        <div className="text-xs font-bold text-gray-500">{task.points} pts</div>
      </div>
      <div className="mt-4 flex justify-end">
        {ActionButton()}
      </div>
    </Card>
  );
};

export default ChoreCard;