import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/api';

function Profile() {
  const { user, logout } = useAuth();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      fetchUserStories();
    }
  }, [user]);

  const fetchUserStories = async () => {
    try {
      setLoading(true);
      const response = await apiService.request(`/users/${user.username}/stories`);
      setStories(response.data.stories);
    } catch (error) {
      setError('Failed to load stories');
      console.error('Error fetching stories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      // Redirect will be handled by auth context
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <div className="flex items-center">
              <div className="w-32 h-32 bg-gray-200 rounded-full"></div>
              <div className="ml-8">
                <div className="h-6 bg-gray-200 rounded w-48 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-64"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
        <p>Please log in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="flex flex-col sm:flex-row items-center">
          <div className="w-32 h-32 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 text-4xl font-bold mb-4 sm:mb-0 overflow-hidden">
            {user.avatar ? (
              <img src={user.avatar} alt={user.fullName} className="w-full h-full object-cover" />
            ) : (
              user.fullName?.charAt(0) || user.username?.charAt(0)
            )}
          </div>
          <div className="sm:ml-8 text-center sm:text-left">
            <h1 className="text-2xl font-bold text-gray-900">{user.fullName}</h1>
            <p className="text-gray-600 text-sm">@{user.username}</p>
            <p className="text-gray-600 mt-2">{user.bio || 'No bio available'}</p>
            <div className="flex justify-center sm:justify-start space-x-8 mt-4">
              <div className="text-center">
                <div className="text-xl font-bold text-gray-900">{user.stats?.totalStories || 0}</div>
                <div className="text-sm text-gray-500">Stories</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-gray-900">{user.stats?.followerCount || 0}</div>
                <div className="text-sm text-gray-500">Followers</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-gray-900">{user.stats?.followingCount || 0}</div>
                <div className="text-sm text-gray-500">Following</div>
              </div>
            </div>
          </div>
          <div className="sm:ml-auto mt-4 sm:mt-0 flex space-x-2">
            <button className="btn-primary">
              Edit Profile
            </button>
            <button 
              onClick={handleLogout}
              className="btn-secondary"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Stories Section */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">My Stories</h2>
          <button className="btn-primary">
            Create New Story
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {stories.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">You haven't written any stories yet.</p>
            <button className="btn-primary mt-4">
              Write Your First Story
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {stories.map((story) => (
              <div key={story._id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{story.title}</h3>
                    <span className="inline-block bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-full mt-1">
                      {story.category}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500 capitalize">{story.status}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <span className="text-yellow-400">★</span>
                      <span className="ml-1 text-sm text-gray-600">{story.rating || 0}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {story.stats?.views || 0} views
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button className="text-primary-600 hover:text-primary-700">
                      Edit
                    </button>
                    <button className="text-red-600 hover:text-red-700">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
