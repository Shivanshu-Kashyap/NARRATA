// src/pages/Profile.jsx

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/api';

// A reusable input component for the edit form to keep the JSX clean.
const ProfileInput = ({ label, name, value, onChange, placeholder, type = "text" }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">
            {label}
        </label>
        <div className="mt-1">
            <input
                type={type}
                name={name}
                id={name}
                className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder={placeholder}
                value={value}
                onChange={onChange}
            />
        </div>
    </div>
);

function Profile() {
  const { user, logout, setUser } = useAuth();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- STATE FOR EDITING ---
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editError, setEditError] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    bio: '',
    location: '',
    website: '',
    socialLinks: { twitter: '', github: '', linkedin: '' }
  });

  useEffect(() => {
    if (user) {
      fetchUserStories();
      // When user data is loaded, initialize the form data.
      setFormData({
        fullName: user.fullName || '',
        bio: user.bio || '',
        location: user.location || '',
        website: user.website || '',
        socialLinks: {
            twitter: user.socialLinks?.twitter || '',
            github: user.socialLinks?.github || '',
            linkedin: user.socialLinks?.linkedin || ''
        }
      });
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchUserStories = async () => {
    try {
      // Don't set loading to true here to avoid flashing on profile updates
      setError(null);
      const response = await apiService.request(`/users/${user.username}/stories`);
      setStories(response?.stories || []);
    } catch (error) {
      setError('Failed to load your stories.');
      console.error('Error fetching stories:', error);
      setStories([]);
    } finally {
      setLoading(false);
    }
  };

  // --- HANDLERS FOR EDITING ---

  const handleEditToggle = () => {
    setIsEditing(prev => !prev); // Correctly toggle the state
    setEditError('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSocialChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, socialLinks: { ...prev.socialLinks, [name]: value } }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setEditError('');
    try {
        const updatedUser = await apiService.updateProfile(formData);
        setUser(updatedUser); // Update global state
        setIsEditing(false); // Exit edit mode
    } catch (error) {
        setEditError(error.message || 'Failed to update profile.');
        console.error("Update profile error:", error);
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  // --- RENDER LOGIC ---
  if (loading) {
    return <div className="text-center p-8">Loading profile...</div>;
  }

  if (!user) {
    return <div className="text-center p-8">Please log in to view your profile.</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <form onSubmit={handleSave}>
          <div className="flex flex-col sm:flex-row items-start">
            <div className="w-32 h-32 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 text-4xl font-bold mb-4 sm:mb-0 overflow-hidden relative group flex-shrink-0">
              {user.avatar ? (
                <img src={user.avatar} alt={user.fullName} className="w-full h-full object-cover" />
              ) : (
                user.fullName?.charAt(0).toUpperCase() || user.username?.charAt(0).toUpperCase()
              )}
            </div>
            <div className={`sm:ml-8 w-full ${isEditing ? 'text-left' : 'text-center sm:text-left'}`}>
              {isEditing ? (
                  <div className="space-y-4">
                      <ProfileInput label="Full Name" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Your full name"/>
                      <div>
                          <label htmlFor="bio" className="block text-sm font-medium text-gray-700">Bio</label>
                          <textarea
                              id="bio"
                              name="bio"
                              rows={3}
                              className="shadow-sm focus:ring-primary-500 focus:border-primary-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md"
                              placeholder="A short bio about yourself"
                              value={formData.bio}
                              onChange={handleChange}
                          ></textarea>
                      </div>
                      <ProfileInput label="Location" name="location" value={formData.location} onChange={handleChange} placeholder="City, Country"/>
                      <ProfileInput label="Website" name="website" value={formData.website} onChange={handleChange} placeholder="https://your-website.com"/>
                      <h3 className="text-lg font-medium text-gray-900 pt-2">Social Links</h3>
                      <ProfileInput label="Twitter URL" name="twitter" value={formData.socialLinks.twitter} onChange={handleSocialChange} placeholder="https://twitter.com/username"/>
                      <ProfileInput label="GitHub URL" name="github" value={formData.socialLinks.github} onChange={handleSocialChange} placeholder="https://github.com/username"/>
                      <ProfileInput label="LinkedIn URL" name="linkedin" value={formData.socialLinks.linkedin} onChange={handleSocialChange} placeholder="https://linkedin.com/in/username"/>
                  </div>
              ) : (
                  <div>
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
              )}
            </div>
            <div className="sm:ml-auto mt-4 sm:mt-0 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 self-start">
                {isEditing ? (
                    <>
                        <button type="submit" className="btn-primary" disabled={isSubmitting}>
                            {isSubmitting ? 'Saving...' : 'Save'}
                        </button>
                        <button type="button" onClick={handleEditToggle} className="btn-secondary">
                            Cancel
                        </button>
                    </>
                ) : (
                    <>
                        <button type="button" onClick={handleEditToggle} className="btn-primary">
                            Edit Profile
                        </button>
                        <button type="button" onClick={handleLogout} className="btn-secondary">
                            Logout
                        </button>
                    </>
                )}
            </div>
          </div>
          {editError && <div className="mt-4 text-center text-red-600">{editError}</div>}
        </form>
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

        {stories.length === 0 && !error ? (
            <div className="text-center py-8">
            <p className="text-gray-500">You haven't written any stories yet.</p>
            <button className="btn-primary mt-4">
                Write Your First Story
            </button>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {stories.map((story) => (
                <div key={story._id} className="border rounded-lg p-4 flex flex-col justify-between">
                <div>
                    <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">{story.title}</h3>
                        <span className="inline-block bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-full mt-1">
                        {story.category}
                        </span>
                    </div>
                    <span className="text-sm text-gray-500 capitalize">{story.status}</span>
                    </div>
                </div>
                <div className="flex justify-between items-center mt-4">
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
                    <button className="text-primary-600 hover:text-primary-700 font-medium">
                        Edit
                    </button>
                    <button className="text-red-600 hover:text-red-700 font-medium">
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
