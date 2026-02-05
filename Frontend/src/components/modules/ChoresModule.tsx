import { useState, useEffect } from 'react';
import { Circle, ArrowRightCircle, CheckCircle, Filter } from 'lucide-react';
import ModuleHeader from '../common/ModuleHeader';
import ChoreCard from './ChoreCard';
import Modal from '../common/Modal';
import EditChoreModal from '../forms/EditChoreModal';
import { choresApi } from '../../services/api';
import type { User, Chore, ChoreTask, ChoresGrouped } from '../../types';

interface ChoresModuleProps {
  onAddTask: () => void;
  user: User | null;
}

interface ChoreFilters {
  assignee: string;
  showRecurring: string;
}

const ChoresModule = ({ onAddTask, user }: ChoresModuleProps): JSX.Element => {
  const [chores, setChores] = useState<ChoresGrouped>({ todo: [], in_progress: [], done: [] });
  const [loading, setLoading] = useState<boolean>(true);
  const [editingChore, setEditingChore] = useState<ChoreTask | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [filters, setFilters] = useState<ChoreFilters>({
    assignee: 'all',
    showRecurring: 'all',
  });

  useEffect(() => {
    fetchChores();
  }, []);

  const fetchChores = async (): Promise<void> => {
    try {
      const data = await choresApi.getAll();
      setChores(data);
    } catch (error) {
      console.error('Failed to fetch chores:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (taskId: number, newStatus: string): Promise<void> => {
    try {
      await choresApi.updateStatus(taskId, newStatus);
      fetchChores();
    } catch (error) {
      console.error('Failed to update chore status:', error);
    }
  };

  const handleClaimTask = async (taskId: number): Promise<void> => {
    try {
      await choresApi.claim(taskId);
      fetchChores();
    } catch (error) {
      console.error('Failed to claim chore:', error);
    }
  };

  const handleEdit = (task: ChoreTask): void => {
    setEditingChore(task);
  };

  const handleDelete = async (): Promise<void> => {
    if (!deleteConfirmId) return;

    try {
      await choresApi.delete(deleteConfirmId);
      setDeleteConfirmId(null);
      fetchChores();
    } catch (error) {
      console.error('Failed to delete chore:', error);
    }
  };

  const filterChores = (tasks: Chore[]): Chore[] => {
    return tasks.filter((task) => {
      // Filter by assignee
      if (filters.assignee === 'my-tasks' && task.assignedToUser?.id !== user?.id) {
        return false;
      }
      if (filters.assignee === 'unassigned' && task.assignedToUser !== null) {
        return false;
      }

      // Filter by recurring
      if (filters.showRecurring === 'recurring-only' && !task.isRecurring) {
        return false;
      }
      if (filters.showRecurring === 'non-recurring' && task.isRecurring) {
        return false;
      }

      return true;
    });
  };

  const ConfirmDeleteModal = (): JSX.Element => (
    <Modal isOpen={deleteConfirmId !== null} onClose={() => setDeleteConfirmId(null)}>
      <div className="p-6">
        <h3 className="text-xl font-bold mb-4">Delete Task</h3>
        <p className="text-gray-700 dark:text-gray-300 mb-6">
          Are you sure you want to delete this task? This action cannot be undone.
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={() => setDeleteConfirmId(null)}
            className="px-4 py-2 rounded-lg font-semibold bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 rounded-lg font-semibold bg-red-600 text-white hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </Modal>
  );

  if (loading) {
    return (
      <div className="animate-fade-in">
        <ModuleHeader title="Chores \u0026 Tasks" actionText="Add Task" onActionClick={onAddTask} />
        <p className="text-gray-500">Loading chores...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <ModuleHeader title="Chores & Tasks" actionText="Add Task" onActionClick={onAddTask} />

      {/* Filters */}
      <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          <span className="font-semibold text-sm">Filters</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Assignee
            </label>
            <select
              value={filters.assignee}
              onChange={(e) => setFilters({ ...filters, assignee: e.target.value })}
              className="w-full p-2 text-sm rounded-lg border bg-white dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">All Tasks</option>
              <option value="my-tasks">My Tasks</option>
              <option value="unassigned">Unassigned</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Type
            </label>
            <select
              value={filters.showRecurring}
              onChange={(e) => setFilters({ ...filters, showRecurring: e.target.value })}
              className="w-full p-2 text-sm rounded-lg border bg-white dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">All Types</option>
              <option value="recurring-only">Recurring Only</option>
              <option value="non-recurring">Non-Recurring Only</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {Object.entries(chores).map(([status, tasks]) => {
          const filteredTasks = filterChores(tasks);
          return (
            <div key={status}>
              <h3 className="font-semibold mb-4 capitalize pl-2 flex items-center">
                {status === 'todo' && <Circle className="w-4 h-4 mr-2 text-red-500"/>}
                {status === 'in_progress' && <ArrowRightCircle className="w-4 h-4 mr-2 text-yellow-500"/>}
                {status === 'done' && <CheckCircle className="w-4 h-4 mr-2 text-green-500"/>}
                {status.replace('_', ' ')} ({filteredTasks.length})
              </h3>
              <div className="space-y-4 bg-gray-100 dark:bg-gray-900/50 p-4 rounded-lg h-full min-h-[200px]">
                {filteredTasks.map(task => (
                  <ChoreCard
                    key={task.id}
                    task={{
                      ...task,
                      status,
                      assignedTo: task.assignedToUser?.name || 'Unassigned'
                    }}
                    currentUser={user}
                    onUpdateStatus={handleUpdateStatus}
                    onClaimTask={handleClaimTask}
                    onEdit={handleEdit}
                    onDelete={setDeleteConfirmId}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {editingChore && (
        <Modal isOpen={true} onClose={() => setEditingChore(null)}>
          <EditChoreModal
            chore={editingChore}
            onClose={() => setEditingChore(null)}
            onUpdate={fetchChores}
          />
        </Modal>
      )}

      <ConfirmDeleteModal />
    </div>
  );
};

export default ChoresModule;
