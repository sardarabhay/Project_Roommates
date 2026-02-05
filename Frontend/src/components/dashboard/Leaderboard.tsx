import { Trophy, Medal, Award } from 'lucide-react';
import Card from '../common/Card';
import type { LeaderboardEntry } from '../../types';

interface LeaderboardProps {
  leaderboard: LeaderboardEntry[];
}

const Leaderboard = ({ leaderboard }: LeaderboardProps): JSX.Element => {
  if (!leaderboard || leaderboard.length === 0) {
    return (
      <Card>
        <h3 className="font-bold mb-4 flex items-center">
          <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
          Chore Leaderboard
        </h3>
        <p className="text-gray-500 text-sm">No data available</p>
      </Card>
    );
  }

  const getRankIcon = (index: number): JSX.Element => {
    if (index === 0) return <Trophy className="w-5 h-5 text-yellow-500" />;
    if (index === 1) return <Medal className="w-5 h-5 text-gray-400" />;
    if (index === 2) return <Award className="w-5 h-5 text-amber-600" />;
    return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-gray-400">#{index + 1}</span>;
  };

  const getRankBg = (index: number): string => {
    if (index === 0) return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
    if (index === 1) return 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700';
    if (index === 2) return 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800';
    return 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700';
  };

  return (
    <Card>
      <h3 className="font-bold mb-4 flex items-center">
        <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
        Chore Leaderboard
      </h3>
      <div className="space-y-2">
        {leaderboard.map((user, index) => (
          <div
            key={user.id}
            className={`flex items-center justify-between p-3 rounded-lg border ${getRankBg(index)}`}
          >
            <div className="flex items-center space-x-3">
              {getRankIcon(index)}
              <img
                src={user.avatarUrl || '/default-avatar.png'}
                alt={user.name}
                className="w-8 h-8 rounded-full"
              />
              <div>
                <p className="font-semibold text-sm">{user.name}</p>
                <p className="text-xs text-gray-500">
                  {user.completedCount} {user.completedCount === 1 ? 'task' : 'tasks'} completed
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-lg text-teal-600 dark:text-teal-400">{user.totalPoints}</p>
              <p className="text-xs text-gray-500">points</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default Leaderboard;
