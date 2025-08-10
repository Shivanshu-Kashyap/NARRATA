// src/pages/WriteStory.jsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PhotoIcon } from '@heroicons/react/24/outline';
import apiService from '../services/api';

// These should match the categories defined in your backend constants
const STORY_CATEGORIES = [
  'Fiction', 'Non-Fiction', 'Romance', 'Thriller', 'Mystery', 
  'Science Fiction', 'Fantasy', 'Horror', 'Adventure', 'Drama', 
  'Comedy', 'Biography', 'Historical', 'Other'
];

function WriteStory() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [content, setContent] = useState('');
  const [coverImageFile, setCoverImageFile] = useState(null);
  const [coverImagePreview, setCoverImagePreview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleCoverImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverImageFile(file);
      setCoverImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !category || !content || !coverImageFile) {
        setError('Please fill out all fields and add a cover image.');
        return;
    }
    
    setIsSubmitting(true);
    setError('');

    // Your backend expects FormData for file uploads
    const formData = new FormData();
    formData.append('title', title);
    formData.append('category', category);
    formData.append('content', content);
    formData.append('coverImage', coverImageFile);
    
    try {
      const newStory = await apiService.createStory(formData);
      // On success, navigate to the new story's detail page using its slug
      navigate(`/story/${newStory.slug}`);
    } catch (err) {
      setError(err.message || 'Failed to publish story. Please try again.');
      console.error("Story creation error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Write Your Story</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Cover Image</label>
            <div className="relative w-full h-[300px] bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 overflow-hidden">
              {coverImagePreview ? (
                <img src={coverImagePreview} alt="Cover Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center justify-center h-full">
                  <PhotoIcon className="w-12 h-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">Click to add a cover image</p>
                </div>
              )}
              <input type="file" accept="image/*" onChange={handleCoverImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
            </div>
          </div>

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
            <input type="text" name="title" id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
            <select name="category" id="category" value={category} onChange={(e) => setCategory(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required>
              <option value="">Select a category</option>
                {STORY_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700">Content</label>
            <textarea
              id="content"
              name="content"
              rows="15"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              placeholder="Begin your story here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            ></textarea>
          </div>

          {error && <div className="text-red-600 text-center bg-red-50 p-3 rounded-md">{error}</div>}

          <div className="flex justify-end">
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Publishing...' : 'Publish Story'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default WriteStory;
