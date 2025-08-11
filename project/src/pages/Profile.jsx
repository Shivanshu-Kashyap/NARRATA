// src/pages/Profile.jsx

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/api';

// Reusable input for tidy JSX
const ProfileInput = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = 'text',
}) => (
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
  const navigate = useNavigate();

  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editError, setEditError] = useState('');

  // Avatar upload state
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState('');
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    fullName: '',
    bio: '',
    location: '',
    website: '',
    socialLinks: { twitter: '', github: '', linkedin: '' },
  });

  // Avoid setting state after unmount
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  // Load stories + seed form data when user changes
  useEffect(() => {
    const init = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      // Seed form with user data
      setFormData({
        fullName: user.fullName || '',
        bio: user.bio || '',
        location: user.location || '',
        website: user.website || '',
        socialLinks: {
          twitter: user.socialLinks?.twitter || '',
          github: user.socialLinks?.github || '',
          linkedin: user.socialLinks?.linkedin || '',
        },
      });

      // Fetch stories
      try {
        setError(null);
        const response = await apiService.request(`/users/${user.username}/stories`);
        if (!mountedRef.current) return;
        setStories(response?.stories || []);
      } catch (err) {
        if (!mountedRef.current) return;
        setStories([]);
        setError('Failed to load your stories.');
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    };

    init();
  }, [user]);

  // Toggle edit mode
  const handleEditToggle = () => {
    setIsEditing(prev => !prev);
    setEditError('');
    setAvatarError('');
    // Reset ephemeral avatar state on toggle off
    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview);
      setAvatarPreview(null);
      setAvatarFile(null);
    }
  };

  // Handlers for profile fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSocialChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [name]: value },
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setEditError('');

    try {
      const updatedUser = await apiService.updateProfile(formData);
      setUser(updatedUser);
      // Keep localStorage user in sync if your app uses it elsewhere
      try {
        const lsUser = JSON.parse(localStorage.getItem('user') || '{}');
        localStorage.setItem('user', JSON.stringify({ ...lsUser, ...updatedUser }));
      } catch (_) {}
      setIsEditing(false);
    } catch (err) {
      setEditError(err?.message || 'Failed to update profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  const handleDeleteStory = async (storyId) => {
    if (window.confirm('Are you sure you want to delete this story? This cannot be undone.')) {
      try {
        await apiService.deleteStory(storyId);
        setStories(prev => prev.filter(s => s._id !== storyId));
      } catch (err) {
        setError('Failed to delete the story. Please try again.');
      }
    }
  };

  // ------ AVATAR: select/validate/upload ------
  const validateAvatar = (file) => {
    if (!file) return 'No file selected.';
    const maxMB = 5; // adjust as needed
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
    if (!allowed.includes(file.type)) return 'Only JPG, PNG, WEBP, or GIF images are allowed.';
    if (file.size > maxMB * 1024 * 1024) return `File is too large. Max ${maxMB}MB.`;
    return '';
  };

  const onPickAvatarClick = () => fileInputRef.current?.click();

  const handleAvatarChange = (e) => {
    setAvatarError('');
    const file = e.target.files?.[0];
    if (!file) return;
    const err = validateAvatar(file);
    if (err) {
      setAvatarError(err);
      setAvatarFile(null);
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
        setAvatarPreview(null);
      }
      return;
    }
    // Preview
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    const url = URL.createObjectURL(file);
    setAvatarFile(file);
    setAvatarPreview(url);
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) {
      setAvatarError('Please select an image first.');
      return;
    }
    setAvatarUploading(true);
    setAvatarError('');

    const fd = new FormData();
    fd.append('avatar', avatarFile);

    try {
      const updatedUser = await apiService.updateUserAvatar(fd);
      setUser(updatedUser);
      try {
        const lsUser = JSON.parse(localStorage.getItem('user') || '{}');
        localStorage.setItem('user', JSON.stringify({ ...lsUser, ...updatedUser }));
      } catch (_) {}

      // Clear local preview and input
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
      setAvatarPreview(null);
      setAvatarFile(null);
    } catch (err) {
      setAvatarError(err?.message || 'Failed to upload avatar.');
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleAvatarCancel = () => {
    setAvatarError('');
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarPreview(null);
    setAvatarFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (loading) {
    return <div className="text-center p-8">Loading profile...</div>;
  }
  if (!user) {
    return <div className="text-center p-8">Please log in to view your profile.</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* PROFILE CARD */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        {isEditing ? (
          // ----- EDIT MODE (form only here) -----
          <form onSubmit={handleSave}>
            <div className="flex flex-col sm:flex-row items-start">
              {/* Avatar block with upload controls */}
              <div className="flex flex-col items-center sm:items-start">
                <div className="w-32 h-32 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 text-4xl font-bold mb-3 overflow-hidden relative group">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="New avatar preview" className="w-full h-full object-cover" />
                  ) : user.avatar ? (
                    <img src={user.avatar} alt={user.fullName} className="w-full h-full object-cover" />
                  ) : (
                    (user.fullName?.charAt(0) || user.username?.charAt(0) || '?').toUpperCase()
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                  disabled={avatarUploading}
                />

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={onPickAvatarClick}
                    disabled={avatarUploading}
                  >
                    {avatarPreview ? 'Pick another' : 'Choose avatar'}
                  </button>

                  {avatarPreview && (
                    <>
                      <button
                        type="button"
                        className="btn-primary"
                        onClick={handleAvatarUpload}
                        disabled={avatarUploading}
                      >
                        {avatarUploading ? 'Uploading...' : 'Upload'}
                      </button>
                      <button
                        type="button"
                        className="btn-tertiary"
                        onClick={handleAvatarCancel}
                        disabled={avatarUploading}
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>

                {avatarError && (
                  <div className="mt-2 text-sm text-red-600 text-center sm:text-left">{avatarError}</div>
                )}
              </div>

              <div className="sm:ml-8 w-full text-left mt-4 sm:mt-0">
                <div className="space-y-4">
                  <ProfileInput
                    label="Full Name"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Your full name"
                  />
                  <div>
                    <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                      Bio
                    </label>
                    <textarea
                      id="bio"
                      name="bio"
                      rows={3}
                      className="shadow-sm mt-1 block w-full sm:text-sm border border-gray-300 rounded-md"
                      placeholder="A short bio about yourself"
                      value={formData.bio}
                      onChange={handleChange}
                    />
                  </div>
                  <ProfileInput
                    label="Location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="City, Country"
                  />
                  <ProfileInput
                    label="Website"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="https://your-website.com"
                  />
                  <h3 className="text-lg font-medium text-gray-900 pt-2">Social Links</h3>
                  <ProfileInput
                    label="Twitter URL"
                    name="twitter"
                    value={formData.socialLinks.twitter}
                    onChange={handleSocialChange}
                    placeholder="https://twitter.com/username"
                  />
                  <ProfileInput
                    label="GitHub URL"
                    name="github"
                    value={formData.socialLinks.github}
                    onChange={handleSocialChange}
                    placeholder="https://github.com/username"
                  />
                  <ProfileInput
                    label="LinkedIn URL"
                    name="linkedin"
                    value={formData.socialLinks.linkedin}
                    onChange={handleSocialChange}
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>
              </div>

              <div className="sm:ml-auto mt-6 sm:mt-0 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 self-start">
                <button type="submit" className="btn-primary" disabled={isSubmitting || avatarUploading}>
                  {isSubmitting ? 'Saving...' : 'Save'}
                </button>
                <button type="button" onClick={handleEditToggle} className="btn-secondary" disabled={isSubmitting || avatarUploading}>
                  Cancel
                </button>
              </div>
            </div>

            {editError && <div className="mt-4 text-center text-red-600">{editError}</div>}
          </form>
        ) : (
          // ----- VIEW MODE (no form here) -----
          <div className="flex flex-col sm:flex-row items-start">
            <div className="w-32 h-32 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 text-4xl font-bold mb-4 sm:mb-0 overflow-hidden relative group flex-shrink-0">
              {user.avatar ? (
                <img src={user.avatar} alt={user.fullName} className="w-full h-full object-cover" />
              ) : (
                (user.fullName?.charAt(0) || user.username?.charAt(0) || '?').toUpperCase()
              )}
            </div>

            <div className="sm:ml-8 w-full text-center sm:text-left">
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

            <div className="sm:ml-auto mt-4 sm:mt-0 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 self-start">
              <button type="button" onClick={handleEditToggle} className="btn-primary">
                Edit Profile
              </button>
              <button type="button" onClick={handleLogout} className="btn-secondary">
                Logout
              </button>
            </div>
          </div>
        )}
      </div>

      {/* STORIES LIST */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">My Stories</h2>
          <button className="btn-primary" type="button" onClick={() => navigate('/write')}>
            Create New Story
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-center">{error}</div>
        )}

        {stories.length === 0 && !error ? (
          <div className="text-center py-8">
            <p className="text-gray-500">You haven't written any stories yet.</p>
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
                      <span className="ml-1 text-sm text-gray-600">
                        {typeof story.rating === 'number' ? story.rating.toFixed(1) : '0.0'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">{story.stats?.views || 0} views</div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => navigate(`/edit-story/${story.slug}`)}
                      className="text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteStory(story._id)}
                      className="text-red-600 hover:text-red-700 font-medium"
                    >
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
