import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import Card from '../common/Card';
import ModuleHeader from '../common/ModuleHeader';
import { communicationApi } from '../../services/api';
import type { HouseRule, BulletinPost } from '../../types';

const CommunicationModule = (): JSX.Element => {
  const [rules, setRules] = useState<HouseRule[]>([]);
  const [posts, setPosts] = useState<BulletinPost[]>([]);
  const [newPost, setNewPost] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

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

  const handlePostMessage = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
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
          <h3 className="font-bold text-lg mb-4">House Rules</h3>
          {rules.length === 0 ? (
            <p className="text-gray-500">No house rules set up yet.</p>
          ) : (
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
              {rules.map(rule => (
                <li key={rule.id}>{rule.content}</li>
              ))}
            </ul>
          )}
          <button className="text-sm text-teal-600 font-semibold mt-4">Edit Rules</button>
        </Card>
        <Card>
          <h3 className="font-bold text-lg mb-4">Bulletin Board</h3>
          <div className="space-y-4">
            {posts.length === 0 ? (
              <p className="text-gray-500">No messages yet. Post the first one!</p>
            ) : (
              posts.map(post => (
                <div key={post.id} className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                  <p className="text-sm">{post.content} - {post.postedByUser?.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Posted {formatTimeAgo(post.createdAt)}
                  </p>
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
    </div>
  );
};

export default CommunicationModule;