import { useState, useEffect } from 'react';
import { householdsApi, usersApi, authApi, setUser } from '../../services/api';
import type { Household, User, RemovalRequest } from '../../types';

interface HouseholdSettingsProps {
  onClose: () => void;
  currentUser: User | null;
}

export default function HouseholdSettings({ onClose, currentUser }: HouseholdSettingsProps): JSX.Element {
  const [household, setHousehold] = useState<Household | null>(null);
  const [members, setMembers] = useState<User[]>([]);
  const [removalRequests, setRemovalRequests] = useState<RemovalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [copySuccess, setCopySuccess] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [error, setError] = useState('');

  const isAdmin = currentUser?.role === 'admin';

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        const [householdData, membersData, requestsData] = await Promise.all([
          householdsApi.getCurrent(),
          usersApi.getAll(),
          householdsApi.getRemovalRequests(),
        ]);
        setHousehold(householdData);
        setMembers(membersData);
        setRemovalRequests(requestsData);
      } catch (err) {
        setError('Failed to load household data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCopyCode = async (): Promise<void> => {
    if (household?.inviteCode) {
      try {
        await navigator.clipboard.writeText(household.inviteCode);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch {
        // Fallback for browsers that don't support clipboard API
        const textArea = document.createElement('textarea');
        textArea.value = household.inviteCode;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      }
    }
  };

  const handleRegenerateCode = async (): Promise<void> => {
    if (!confirm('Regenerating the invite code will invalidate the old code. Continue?')) return;
    
    setRegenerating(true);
    try {
      const newCode = await householdsApi.regenerateCode();
      setHousehold(prev => prev ? { ...prev, inviteCode: newCode } : prev);
    } catch (err) {
      setError('Failed to regenerate code');
    } finally {
      setRegenerating(false);
    }
  };

  const handleLeaveHousehold = async (): Promise<void> => {
    const message = isAdmin 
      ? 'As the admin, leaving will promote another member to admin. If you\'re the only member, the household will be deleted. Continue?'
      : 'Are you sure you want to leave this household?';
    
    if (!confirm(message)) return;
    
    setLeaving(true);
    try {
      await householdsApi.leave();
      // Refresh user data
      const user = await authApi.getCurrentUser();
      setUser(user);
      // Force reload to go through the household setup flow
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to leave household');
      setLeaving(false);
    }
  };

  const handleRequestRemoval = async (targetUserId: number): Promise<void> => {
    const targetUser = members.find(m => m.id === targetUserId);
    if (!confirm(`Request to remove ${targetUser?.name || 'this member'}? Other household members will need to vote to approve.`)) return;
    
    try {
      await householdsApi.requestRemoval(targetUserId);
      // Refresh the removal requests list
      const requestsData = await householdsApi.getRemovalRequests();
      setRemovalRequests(requestsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create removal request');
    }
  };

  const handleVote = async (requestId: number, vote: 'approve' | 'reject'): Promise<void> => {
    try {
      await householdsApi.voteOnRemoval(requestId, vote);
      // Refresh removal requests and members
      const [requestsData, membersData] = await Promise.all([
        householdsApi.getRemovalRequests(),
        usersApi.getAll(),
      ]);
      setRemovalRequests(requestsData);
      setMembers(membersData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit vote');
    }
  };

  const pendingRequests = removalRequests;
  const hasVoted = (request: RemovalRequest): boolean => {
    return request.myVote !== null;
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div>
        <p className="mt-2 text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  if (!household) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-600 dark:text-gray-400">No household found</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-h-[80vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Household Settings</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
          {error}
          <button onClick={() => setError('')} className="ml-2 underline">Dismiss</button>
        </div>
      )}

      {/* Household Info */}
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
          {household.name}
        </h3>
        
        <div className="mb-4">
          <label className="text-sm text-gray-500 dark:text-gray-400 block mb-1">Invite Code</label>
          <div className="flex items-center gap-2">
            <code className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg font-mono text-lg tracking-wider text-center">
              {household.inviteCode}
            </code>
            <button
              onClick={handleCopyCode}
              className={`px-3 py-2 rounded-lg transition-all ${
                copySuccess 
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' 
                  : 'bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 hover:bg-teal-200 dark:hover:bg-teal-900/50'
              }`}
              title="Copy code"
            >
              {copySuccess ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              )}
            </button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Share this code with roommates so they can join
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={handleRegenerateCode}
            disabled={regenerating}
            className="text-sm text-teal-600 dark:text-teal-400 hover:underline disabled:opacity-50"
          >
            {regenerating ? 'Regenerating...' : 'Regenerate Code'}
          </button>
        )}
      </div>

      {/* Members List */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
          Members ({members.length})
        </h3>
        <div className="space-y-2">
          {members.map(member => (
            <div
              key={member.id}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <img
                  src={member.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=0d9488&color=fff`}
                  alt={member.name}
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {member.name}
                    {member.id === currentUser?.id && (
                      <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">(You)</span>
                    )}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {member.role === 'admin' ? '👑 Admin' : 'Member'}
                  </p>
                </div>
              </div>
              
              {isAdmin && member.id !== currentUser?.id && (
                <button
                  onClick={() => handleRequestRemoval(member.id)}
                  className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  title="Request removal"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Pending Removal Requests */}
      {pendingRequests.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
            Pending Removal Requests
          </h3>
          <div className="space-y-3">
            {pendingRequests.map(request => (
              <div
                key={request.id}
                className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg"
              >
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                  <span className="font-medium">{request.requestedBy.name}</span> requested to remove{' '}
                  <span className="font-medium">{request.targetUser.name}</span>
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                  Votes: {request.votes.filter(v => v.vote === 'approve').length} approve, {request.votes.filter(v => v.vote === 'reject').length} reject
                </p>
                
                {!hasVoted(request) && request.targetUser.id !== currentUser?.id && request.requestedBy.id !== currentUser?.id && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleVote(request.id, 'approve')}
                      className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-md text-sm hover:bg-red-200 dark:hover:bg-red-900/50"
                    >
                      Approve Removal
                    </button>
                    <button
                      onClick={() => handleVote(request.id, 'reject')}
                      className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-md text-sm hover:bg-green-200 dark:hover:bg-green-900/50"
                    >
                      Reject
                    </button>
                  </div>
                )}
                
                {hasVoted(request) && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 italic">You have voted</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Leave Household */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={handleLeaveHousehold}
          disabled={leaving}
          className="w-full py-3 px-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50"
        >
          {leaving ? 'Leaving...' : 'Leave Household'}
        </button>
      </div>
    </div>
  );
}
