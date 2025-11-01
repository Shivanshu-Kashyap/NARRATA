// src/components/AICoverGenerator.jsx

import { useState } from 'react';
import { 
  SparklesIcon, 
  ArrowPathIcon,
  PhotoIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import apiService from '../services/api';

const AICoverGenerator = ({ storyTitle, storyExcerpt, category, onCoverGenerated }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState('realistic');
  const [generatedCover, setGeneratedCover] = useState(null);
  const [error, setError] = useState('');

  const styles = [
    { id: 'realistic', label: 'Realistic', description: 'Photorealistic and detailed' },
    { id: 'artistic', label: 'Artistic', description: 'Painterly and vibrant' },
    { id: 'minimal', label: 'Minimal', description: 'Clean and modern' },
    { id: 'dramatic', label: 'Dramatic', description: 'Moody and atmospheric' },
    { id: 'fantasy', label: 'Fantasy', description: 'Magical and ethereal' },
  ];

  const handleGenerateCover = async () => {
    if (!storyTitle || storyTitle.trim().length === 0) {
      setError('Please provide a story title first');
      return;
    }

    setIsGenerating(true);
    setError('');
    setGeneratedCover(null);

    try {
      const response = await apiService.generateCover(
        storyTitle,
        storyExcerpt || '',
        category || 'Fiction',
        selectedStyle
      );
      
      setGeneratedCover(response);
      
      // Notify parent component
      if (onCoverGenerated) {
        onCoverGenerated(response.coverImageUrl);
      }
    } catch (err) {
      setError(err.message || 'Failed to generate cover image. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUseCover = () => {
    if (generatedCover && onCoverGenerated) {
      onCoverGenerated(generatedCover.coverImageUrl);
      setIsOpen(false);
    }
  };

  return (
    <div>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all duration-300"
      >
        <SparklesIcon className="w-5 h-5" />
        <span>Generate AI Cover</span>
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <PhotoIcon className="w-8 h-8" />
                  <div>
                    <h2 className="text-2xl font-bold">AI Cover Generator</h2>
                    <p className="text-purple-100 text-sm mt-1">
                      Create stunning cover images with AI
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="hover:bg-white/20 rounded-full p-2 transition"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Story Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-700 mb-2">Story Details</h3>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Title:</span> {storyTitle || 'Untitled'}
                </p>
                {category && (
                  <p className="text-sm text-gray-600 mt-1">
                    <span className="font-medium">Category:</span> {category}
                  </p>
                )}
              </div>

              {/* Style Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Choose Art Style
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {styles.map((style) => (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => setSelectedStyle(style.id)}
                      className={`p-4 border-2 rounded-lg text-left transition-all ${
                        selectedStyle === style.id
                          ? 'border-purple-600 bg-purple-50 shadow-md'
                          : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="font-semibold text-gray-800">{style.label}</div>
                      <div className="text-xs text-gray-600 mt-1">{style.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerateCover}
                disabled={isGenerating || !storyTitle}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-3 text-lg font-semibold"
              >
                {isGenerating ? (
                  <>
                    <ArrowPathIcon className="w-6 h-6 animate-spin" />
                    <span>Generating... This may take 20-30 seconds</span>
                  </>
                ) : (
                  <>
                    <SparklesIcon className="w-6 h-6" />
                    <span>Generate Cover Image</span>
                  </>
                )}
              </button>

              {/* Info Message */}
              {isGenerating && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Please wait...</strong> The AI model may need to load first. 
                    This typically takes 20-30 seconds for the first generation.
                  </p>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Generated Cover Preview */}
              {generatedCover && (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm text-green-800 font-medium mb-2">
                      ✨ Cover generated successfully!
                    </p>
                    <img
                      src={generatedCover.coverImageUrl}
                      alt="Generated Cover"
                      className="w-full rounded-lg shadow-lg"
                    />
                    <p className="text-xs text-gray-600 mt-2">
                      Style: {generatedCover.style} | Model: Stable Diffusion 2.1
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleUseCover}
                      className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition font-medium"
                    >
                      Use This Cover
                    </button>
                    <button
                      onClick={handleGenerateCover}
                      className="flex-1 bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700 transition font-medium"
                    >
                      Generate Another
                    </button>
                  </div>
                </div>
              )}

              {/* Info about AI Generation */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="font-semibold text-purple-900 mb-2 text-sm">
                  About AI Cover Generation
                </h4>
                <ul className="text-xs text-purple-800 space-y-1">
                  <li>• Uses Stable Diffusion 2.1 for high-quality images</li>
                  <li>• Generates unique covers based on your story details</li>
                  <li>• First generation may take 20-30 seconds</li>
                  <li>• Try different styles for best results</li>
                  <li>• Completely free to use!</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AICoverGenerator;
