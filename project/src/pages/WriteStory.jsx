import { useState, useRef } from 'react';
import { PlusIcon, PhotoIcon } from '@heroicons/react/24/outline';

function WriteStory() {
  const [formData, setFormData] = useState({
    title: '',
    genre: '',
    coverImage: '',
    content: '',
  });

  const [storySegments, setStorySegments] = useState([{ type: 'text', content: '' }]);
  const fileInputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle story submission
    console.log({ ...formData, segments: storySegments });
  };

  const handleChange = (e, index) => {
    const { name, value } = e.target;
    if (name === 'segment') {
      const newSegments = [...storySegments];
      newSegments[index].content = value;
      setStorySegments(newSegments);
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleCoverImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData(prev => ({
          ...prev,
          coverImage: event.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = (e, index) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const newSegments = [...storySegments];
        newSegments[index] = { type: 'image', content: event.target.result };
        setStorySegments(newSegments);
      };
      reader.readAsDataURL(file);
    }
  };

  const addNewSegment = (type, index) => {
    const newSegments = [...storySegments];
    newSegments.splice(index + 1, 0, { type, content: type === 'text' ? '' : '' });
    setStorySegments(newSegments);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Write Your Story</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cover Image
            </label>
            <div className="relative w-full h-[300px] bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 overflow-hidden">
              {formData.coverImage ? (
                <div className="relative group w-full h-full">
                  <img
                    src={formData.coverImage}
                    alt="Story cover"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, coverImage: '' }))}
                      className="bg-white text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-100"
                    >
                      Change Cover
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full">
                  <PhotoIcon className="w-12 h-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">Click to add a cover image</p>
                  <p className="mt-1 text-xs text-gray-400">Recommended size: 1920x1080px</p>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleCoverImageUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
          </div>

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              type="text"
              name="title"
              id="title"
              value={formData.title}
              onChange={(e) => handleChange(e)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              required
            />
          </div>

          <div>
            <label htmlFor="genre" className="block text-sm font-medium text-gray-700">
              Genre
            </label>
            <select
              name="genre"
              id="genre"
              value={formData.genre}
              onChange={(e) => handleChange(e)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              required
            >
              <option value="">Select a genre</option>
              <option value="drama">Drama</option>
              <option value="thriller">Thriller</option>
              <option value="comedy">Comedy</option>
              <option value="romance">Romance</option>
              <option value="scifi">Science Fiction</option>
            </select>
          </div>

          <div className="space-y-4">
            {storySegments.map((segment, index) => (
              <div key={index} className="relative">
                {segment.type === 'text' ? (
                  <textarea
                    name="segment"
                    rows="4"
                    value={segment.content}
                    onChange={(e) => handleChange(e, index)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    placeholder="Continue your story here..."
                  />
                ) : (
                  <div className="relative w-full h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 overflow-hidden">
                    {segment.content ? (
                      <img
                        src={segment.content}
                        alt="Story illustration"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full">
                        <PhotoIcon className="w-12 h-12 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-500">Click to add an image</p>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, index)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                )}
                
                <div className="absolute -left-12 top-1/2 -translate-y-1/2 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => addNewSegment('text', index)}
                    className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600"
                    title="Add text"
                  >
                    <PlusIcon className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => addNewSegment('image', index)}
                    className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600"
                    title="Add image"
                  >
                    <PhotoIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Save Draft
            </button>
            <button
              type="submit"
              className="btn-primary"
            >
              Publish Story
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default WriteStory;