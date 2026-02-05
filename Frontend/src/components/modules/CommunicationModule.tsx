import { useState, useEffect } from 'react';
import { Edit2, Trash2, Plus, User as UserIcon, Search } from 'lucide-react';
import Card from '../common/Card';
import ModuleHeader from '../common/ModuleHeader';
import HouseRuleModal from '../forms/HouseRuleModal';
import { communicationApi } from '../../services/api';
import type { HouseRule, BulletinPost, User } from '../../types';

interface CommunicationModuleProps {
  user: User | null;
}

const CommunicationModule = ({ user: currentUser }: CommunicationModuleProps): JSX.Element => {
  const [rules, setRules] = useState<HouseRule[]>([]);
  const [posts, setPosts] = useState<BulletinPost[]>([]);
  const [newPost, setNewPost] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [isRuleModalOpen, setIsRuleModalOpen] = useState<boolean>(false);
  const [editingRule, setEditingRule] = useState<HouseRule | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [timeFilter, setTimeFilter] = useState<string>('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async (): Promise<void> => {
    try {
      const [rulesData, postsData] = await Promise.all([
        communicationApi.getRules(),
        communicationApi.getBulletin()
      ]);
      setRules(rulesData);
      setPosts(postsData);
    } catch (error) {
      console.error('Failed to fetch communication data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePostMessage = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!newPost.trim()) return;

    try {
      await communicationApi.createPost(newPost);
      setNewPost('');
      fetchData(); // Refresh posts
    } catch (error) {
      console.error('Failed to post message:', error);
    }
  };

  const handleDeletePost = async (postId: number): Promise<void> => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      await communicationApi.deletePost(postId);
      fetchData(); // Refresh posts
    } catch (error) {
      console.error('Failed to delete post:', error);
    }
  };

  const handleOpenRuleModal = (rule?: HouseRule): void => {
    setEditingRule(rule || null);
    setIsRuleModalOpen(true);
  };

  const handleCloseRuleModal = (): void => {
    setIsRuleModalOpen(false);
    setEditingRule(null);
  };

  const handleSaveRule = async (content: string): Promise<void> => {
    if (editingRule) {
      // Update existing rule
      await communicationApi.updateRule(editingRule.id, { content });
    } else {
      // Create new rule
      await communicationApi.createRule(content);
    }
    fetchData(); // Refresh rules
  };

  const handleDeleteRule = async (ruleId: number): Promise<void> => {
    if (!confirm('Are you sure you want to delete this rule?')) return;

    try {
      await communicationApi.deleteRule(ruleId);
      fetchData(); // Refresh rules
    } catch (error) {
      console.error('Failed to delete rule:', error);
    }
  };

  const formatTimeAgo = (date: string): string => {
    const now = new Date();
    const posted = new Date(date);
    const diffMs = now.getTime() - posted.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  const filterPosts = (): BulletinPost[] => {
    let filtered = [...posts];

    // Apply time filter
    if (timeFilter !== 'all') {
      const now = new Date();
      const cutoffDate = new Date();

      if (timeFilter === 'weekly') {
        cutoffDate.setDate(now.getDate() - 7);
      } else if (timeFilter === 'monthly') {
        cutoffDate.setMonth(now.getMonth() - 1);
      }

      filtered = filtered.filter(post => new Date(post.createdAt) >= cutoffDate);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(post =>
        post.content.toLowerCase().includes(query) ||
        post.postedByUser?.name.toLowerCase().includes(query)
      );
    }

    return filtered;
  };

  const filteredPosts = filterPosts();

  if (loading) {
    return (
      <div className="animate-fade-in">
        <ModuleHeader title="Communication Hub" />
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <ModuleHeader title="Communication Hub" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg">House Rules</h3>
            <button
              onClick={() => handleOpenRuleModal()}
              className="flex items-center gap-1 text-sm text-teal-600 dark:text-teal-400 font-semibold hover:text-teal-700 dark:hover:text-teal-300"
            >
              <Plus className="w-4 h-4" />
              Add Rule
            </button>
          </div>
          {rules.length === 0 ? (
            <p className="text-gray-500">No house rules set up yet.</p>
          ) : (
            <ul className="space-y-3">
              {rules.map(rule => (
                <li key={rule.id} className="flex justify-between items-start gap-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <span className="flex-1 text-gray-700 dark:text-gray-300">{rule.content}</span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleOpenRuleModal(rule)}
                      className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-400"
                      title="Edit rule"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteRule(rule.id)}
                      className="p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400"
                      title="Delete rule"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card>
          <h3 className="font-bold text-lg mb-4">Bulletin Board</h3>

          {/* Search and Filter Controls */}
          <div className="mb-4 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search posts by content or author..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border bg-white dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Filter:</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setTimeFilter('all')}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    timeFilter === 'all'
                      ? 'bg-teal-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setTimeFilter('weekly')}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    timeFilter === 'weekly'
                      ? 'bg-teal-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  This Week
                </button>
                <button
                  onClick={() => setTimeFilter('monthly')}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    timeFilter === 'monthly'
                      ? 'bg-teal-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  This Month
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {filteredPosts.length === 0 ? (
              <p className="text-gray-500">
                {posts.length === 0 ? 'No messages yet. Post the first one!' : 'No posts match your filters.'}
              </p>
            ) : (
              filteredPosts.map(post => (
                <div key={post.id} className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                  <div className="flex items-start gap-3">
                    {post.postedByUser?.avatarUrl ? (
                      <img
                        src={post.postedByUser.avatarUrl}
                        alt={post.postedByUser.name}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                        <UserIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-semibold">{post.postedByUser?.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Posted {formatTimeAgo(post.createdAt)}
                          </p>
                        </div>
                        {post.postedByUserId === currentUser?.id && (
                          <button
                            onClick={() => handleDeletePost(post.id)}
                            className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400"
                            title="Delete post"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <p className="text-sm mt-2">{post.content}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          <form onSubmit={handlePostMessage} className="mt-4">
            <input
              type="text"
              placeholder="Post a new message..."
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              className="w-full p-2 rounded-lg border bg-white dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </form>
        </Card>
      </div>
      <HouseRuleModal
        isOpen={isRuleModalOpen}
        onClose={handleCloseRuleModal}
        onSave={handleSaveRule}
        rule={editingRule}
      />
    </div>
  );
};

export default CommunicationModule;