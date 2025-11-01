// src/components/AIAssistant.jsx

import { useState } from 'react';
import { 
  SparklesIcon, 
  LightBulbIcon, 
  ArrowPathIcon,
  CheckCircleIcon,
  XMarkIcon,
  ChevronUpIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import apiService from '../services/api';

const AIAssistant = ({ content, onInsertText, onReplaceText }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('improve');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [selectedText, setSelectedText] = useState('');

  const tabs = [
    { id: 'improve', label: 'Improve', icon: SparklesIcon },
    { id: 'continue', label: 'Continue', icon: ArrowPathIcon },
    { id: 'suggestions', label: 'Ideas', icon: LightBulbIcon },
  ];

  const handleImproveText = async () => {
    if (!selectedText && content.length < 10) {
      setError('Please select some text or write at least 10 characters');
      return;
    }

    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      const textToImprove = selectedText || content.slice(-500);
      const response = await apiService.improveText(textToImprove);
      setResult(response);
    } catch (err) {
      setError(err.message || 'Failed to improve text');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinueStory = async (tone = 'dramatic') => {
    if (content.length < 50) {
      setError('Write at least 50 characters before continuing');
      return;
    }

    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await apiService.continueStory(content, tone);
      setResult(response);
    } catch (err) {
      setError(err.message || 'Failed to continue story');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetSuggestions = async (type = 'plot') => {
    if (content.length < 50) {
      setError('Write at least 50 characters to get suggestions');
      return;
    }

    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await apiService.getSuggestions(content, type);
      setResult(response);
    } catch (err) {
      setError(err.message || 'Failed to get suggestions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInsert = () => {
    if (result) {
      const textToInsert = result.improved || result.continuation || result.corrected || '';
      if (textToInsert) {
        onInsertText(textToInsert);
        setResult(null);
      }
    }
  };

  const handleReplace = () => {
    if (result && result.improved) {
      onReplaceText(result.original, result.improved);
      setResult(null);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
      >
        <SparklesIcon className="w-6 h-6" />
        {!isOpen && <span className="font-medium">AI Assistant</span>}
        {isOpen ? (
          <ChevronDownIcon className="w-5 h-5" />
        ) : (
          <ChevronUpIcon className="w-5 h-5" />
        )}
      </button>

      {/* Assistant Panel */}
      {isOpen && (
        <div className="absolute bottom-20 right-0 w-96 bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SparklesIcon className="w-6 h-6" />
                <h3 className="font-bold text-lg">AI Writing Assistant</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/20 rounded-full p-1 transition"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 bg-gray-50">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setResult(null);
                    setError('');
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 transition ${
                    activeTab === tab.id
                      ? 'bg-white text-purple-600 border-b-2 border-purple-600 font-medium'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Content */}
          <div className="p-4 max-h-96 overflow-y-auto">
            {/* Improve Tab */}
            {activeTab === 'improve' && (
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  Select text to improve, or I'll work on your recent writing.
                </p>
                <textarea
                  value={selectedText}
                  onChange={(e) => setSelectedText(e.target.value)}
                  placeholder="Paste text here to improve..."
                  className="w-full p-2 border rounded-lg text-sm resize-none"
                  rows="3"
                />
                <button
                  onClick={handleImproveText}
                  disabled={isLoading}
                  className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <ArrowPathIcon className="w-5 h-5 animate-spin" />
                      <span>Improving...</span>
                    </>
                  ) : (
                    <>
                      <SparklesIcon className="w-5 h-5" />
                      <span>Improve Text</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Continue Tab */}
            {activeTab === 'continue' && (
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  Continue your story with AI assistance.
                </p>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Tone:</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['dramatic', 'comedic', 'mysterious', 'romantic', 'action', 'horror'].map((tone) => (
                      <button
                        key={tone}
                        onClick={() => handleContinueStory(tone)}
                        disabled={isLoading}
                        className="px-3 py-2 border rounded-lg hover:bg-purple-50 hover:border-purple-600 transition text-sm capitalize disabled:opacity-50"
                      >
                        {tone}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Suggestions Tab */}
            {activeTab === 'suggestions' && (
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  Get creative suggestions for your story.
                </p>
                <div className="space-y-2">
                  {['plot', 'character', 'dialogue', 'opening', 'ending'].map((type) => (
                    <button
                      key={type}
                      onClick={() => handleGetSuggestions(type)}
                      disabled={isLoading}
                      className="w-full px-4 py-2 border rounded-lg hover:bg-purple-50 hover:border-purple-600 transition text-sm text-left capitalize disabled:opacity-50"
                    >
                      <LightBulbIcon className="w-4 h-4 inline mr-2" />
                      {type} suggestions
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Result */}
            {result && (
              <div className="mt-4 space-y-3">
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-green-800 mb-2">
                        {result.improved ? 'Improved Version:' : 
                         result.continuation ? 'Story Continuation:' : 
                         result.suggestions ? 'Suggestions:' : 'Result:'}
                      </p>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {result.improved || result.continuation || result.suggestions || result.corrected}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {(result.improved || result.continuation) && (
                    <button
                      onClick={handleInsert}
                      className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition text-sm"
                    >
                      Insert Text
                    </button>
                  )}
                  {result.improved && result.original && (
                    <button
                      onClick={handleReplace}
                      className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition text-sm"
                    >
                      Replace Original
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAssistant;
