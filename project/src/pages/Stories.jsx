// src/pages/Stories.jsx

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiService from '../services/api';

function Stories() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStories = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await apiService.getAllStories();
        setStories(data.stories || []);
      } catch (err) {
        setError('Failed to load stories. Please try again later.');
        console.error("Fetch stories error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStories();
  }, []); // Empty dependency array means this runs once on mount

  if (loading) {
    return <div className="text-center p-8">Loading stories...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-600">{error}</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Featured Stories</h1>
        {/* Filtering UI can be implemented here later */}
      </div>

      {stories.length === 0 ? (
        <div className="text-center py-16">
          <h2 className="text-xl font-semibold text-gray-700">No stories found.</h2>
          <p className="text-gray-500 mt-2">Why not be the first to write one?</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {stories.map((story) => (
            <div key={story._id} className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden flex flex-col">
              <Link to={`/story/${story.slug}`} className="block">
                <div className="relative h-48">
                  <img src={story.coverImage || 'https://placehold.co/600x400/EEE/31343C?text=No+Image'} alt={story.title} className="w-full h-full object-cover" />
                </div>
              </Link>
              <div className="p-6 flex-grow flex flex-col">
                <span className="inline-block bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-full mb-2 self-start">
                    {story.category}
                </span>
                <h2 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">{story.title}</h2>
                <p className="text-sm text-gray-500 mb-4">by {story.author.fullName}</p>
                <p className="text-gray-600 mb-4 line-clamp-3 flex-grow">{story.excerpt}</p>
                <div className="flex justify-between items-center mt-auto pt-4 border-t">
                  <div className="flex items-center">
                    <span className="text-yellow-400">★</span>
                    <span className="ml-1 text-sm text-gray-600">{story.rating.toFixed(1)}</span>
                  </div>
                  <Link to={`/story/${story.slug}`} className="btn-primary-sm">
                    Read More
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Stories;
