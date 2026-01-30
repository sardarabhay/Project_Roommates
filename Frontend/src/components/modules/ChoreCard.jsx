
import { ArrowRightCircle, CheckCircle, User, Edit2, Trash2, Calendar, AlertCircle, Repeat } from 'lucide-react';
import Card from '../common/Card';
import { allUsers } from '../../data/mockData';

const ChoreCard = ({ task, onUpdateStatus, onClaimTask, onEdit, onDelete, currentUser }) => {
  const isMyTask = task.assignedToUserId === currentUser?.id;
  const isUnassigned = task.assignedTo === 'Unassigned';
  const isCreator = task.createdByUserId === currentUser?.id;
  const canEdit = isCreator || isMyTask;

  // Check if task is locked (done for more than 24 hours)
  const isLocked = () => {
    if (task.status === 'done' && task.completedAt) {
      const hoursSinceCompletion = (Date.now() - new Date(task.completedAt).getTime()) / (1000 * 60 * 60);
      return hoursSinceCompletion > 24;
    }
    return false;
  };

  const getDueDateStatus = () => {
    if (!task.dueDate) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(task.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { status: 'overdue', color: 'text-red-600 dark:text-red-400', bgColor: 'bg-red-100 dark:bg-red-900/30' };
    if (diffDays === 0) return { status: 'today', color: 'text-orange-600 dark:text-orange-400', bgColor: 'bg-orange-100 dark:bg-orange-900/30' };
    if (diffDays <= 3) return { status: 'soon', color: 'text-yellow-600 dark:text-yellow-400', bgColor: 'bg-yellow-100 dark:bg-yellow-900/30' };
    return { status: 'normal', color: 'text-gray-600 dark:text-gray-400', bgColor: 'bg-gray-100 dark:bg-gray-700' };
  };

  const dueDateInfo = getDueDateStatus();

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
    <Card className={`!p-4 ${dueDateInfo ? `border-l-4 ${dueDateInfo.status === 'overdue' ? 'border-red-500' : dueDateInfo.status === 'today' ? 'border-orange-500' : dueDateInfo.status === 'soon' ? 'border-yellow-500' : ''}` : ''}`}>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="font-semibold">{task.title}</p>
            {task.isRecurring && (
              <span className="inline-flex items-center text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-full">
                <Repeat className="w-3 h-3 mr-1" />
                {task.recurringPattern}
              </span>
            )}
          </div>
          {task.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{task.description}</p>
          )}
        </div>
        {canEdit && !isLocked() && (
          <div className="flex gap-1 ml-2">
            <button
              onClick={() => onEdit(task)}
              className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
              title="Edit task"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(task.id)}
              className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400"
              title="Delete task"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {task.dueDate && dueDateInfo && (
        <div className={`flex items-center gap-1 mt-2 text-xs ${dueDateInfo.color}`}>
          {dueDateInfo.status === 'overdue' ? (
            <>
              <AlertCircle className="w-3 h-3" />
              <span className="font-semibold">Overdue - {new Date(task.dueDate).toLocaleDateString()}</span>
            </>
          ) : (
            <>
              <Calendar className="w-3 h-3" />
              <span>{dueDateInfo.status === 'today' ? 'Due Today' : `Due ${new Date(task.dueDate).toLocaleDateString()}`}</span>
            </>
          )}
        </div>
      )}

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
