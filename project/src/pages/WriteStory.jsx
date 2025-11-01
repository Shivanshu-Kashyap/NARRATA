// src/pages/WriteStory.jsx

import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PhotoIcon } from '@heroicons/react/24/outline';
import apiService from '../services/api';
import AIAssistant from '../components/AIAssistant';
import AICoverGenerator from '../components/AICoverGenerator';

const STORY_CATEGORIES = [
  'Fiction', 'Non-Fiction', 'Romance', 'Thriller', 'Mystery', 
  'Science Fiction', 'Fantasy', 'Horror', 'Adventure', 'Drama', 
  'Comedy', 'Biography', 'Historical', 'Other'
];

function WriteStory() {
  const { slug } = useParams();
  const isEditMode = Boolean(slug);
  const navigate = useNavigate();
  const contentRef = useRef(null);

  const [storyId, setStoryId] = useState(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [content, setContent] = useState('');
  const [coverImageFile, setCoverImageFile] = useState(null);
  const [coverImagePreview, setCoverImagePreview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');  useEffect(() => {
    if (isEditMode) {
      const fetchStoryData = async () => {
        try {
          const story = await apiService.getStoryBySlug(slug);
          setStoryId(story._id);
          setTitle(story.title);
          setCategory(story.category);
          setContent(story.content);
          setCoverImagePreview(story.coverImage);
        } catch (err) {
          setError("Failed to load story data for editing.");
        }
      };
      fetchStoryData();
    }
  }, [slug, isEditMode]);

  const handleCoverImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverImageFile(file);
      setCoverImagePreview(URL.createObjectURL(file));
    }
  };

  // AI Assistant handlers
  const handleInsertText = (text) => {
    // Insert text at cursor position or append
    const textarea = contentRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent = content.substring(0, start) + '\n\n' + text + '\n\n' + content.substring(end);
      setContent(newContent);
      
      // Set cursor position after inserted text
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + text.length + 4;
        textarea.focus();
      }, 0);
    } else {
      setContent(content + '\n\n' + text);
    }
  };

  const handleReplaceText = (oldText, newText) => {
    setContent(content.replace(oldText, newText));
  };

  // AI Cover Generator handler
  const handleAICoverGenerated = async (coverUrl) => {
    setCoverImagePreview(coverUrl);
    
    // Fetch the image and convert to file for upload
    try {
      const response = await fetch(coverUrl);
      const blob = await response.blob();
      const file = new File([blob], 'ai-cover.png', { type: 'image/png' });
      setCoverImageFile(file);
    } catch (err) {
      console.error('Error converting AI cover to file:', err);
    }
  };  const handleSubmit = async (e, publish = true) => {
    e && e.preventDefault();

    if (!title || !category || !content) {
      setError('Please fill out all required fields.');
      return;
    }

    const willPublish = publish;

    // If publishing, require a cover for new stories
    if (!isEditMode && willPublish && !coverImageFile) {
      setError('A cover image is required to publish a new story. You can save a draft without a cover image.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    const formData = new FormData();
    formData.append('title', title);
    formData.append('category', category);
    formData.append('content', content);
    // send status explicitly
    formData.append('status', willPublish ? 'published' : 'draft');
    if (coverImageFile) {
      formData.append('coverImage', coverImageFile);
    }

    try {
      let resultStory;
      if (isEditMode) {
        resultStory = await apiService.updateStory(storyId, formData);
      } else {
        resultStory = await apiService.createStory(formData);
      }

      // Navigate: published stories go to their public page, drafts return to editor
      if (willPublish) {
        navigate(`/story/${resultStory.slug}`);
      } else {
        // go to the write page for this draft (to continue editing)
        navigate(`/write/${resultStory.slug}`);
      }
    } catch (err) {
      setError(err.message || 'Failed to save story. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          {isEditMode ? 'Edit Your Story' : 'Write Your Story'}
        </h1>
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
            <div className="mt-3 flex justify-center">
              <AICoverGenerator
                storyTitle={title}
                storyExcerpt={content.substring(0, 200)}
                category={category}
                onCoverGenerated={handleAICoverGenerated}
              />
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
              ref={contentRef}
              id="content"
              name="content"
              rows="15"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
              placeholder="Begin your story here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            ></textarea>
          </div>
          {error && <div className="text-red-600 text-center bg-red-50 p-3 rounded-md">{error}</div>}
          <div className="flex justify-end space-x-3">
            <button type="button" onClick={(e) => handleSubmit(e, false)} className="btn-secondary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : (isEditMode ? 'Save as Draft' : 'Save Draft')}
            </button>
            <button type="button" onClick={(e) => handleSubmit(e, true)} className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : (isEditMode ? 'Save & Publish' : 'Publish Story')}
            </button>
          </div>
        </form>
      </div>

      {/* AI Writing Assistant */}
      <AIAssistant
        content={content}
        onInsertText={handleInsertText}
        onReplaceText={handleReplaceText}
      />
    </div>
  );
}

export default WriteStory;