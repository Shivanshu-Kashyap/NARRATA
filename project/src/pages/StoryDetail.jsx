// src/pages/StoryDetail.jsx

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import apiService from '../services/api';

function StoryDetail() {
  const { slug } = useParams(); // Use slug from URL
  const [story, setStory] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchStoryAndComments = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Fetch the story details first
        const storyData = await apiService.getStoryBySlug(slug);
        setStory(storyData);

        // Once we have the story, fetch its comments using its ID
        if (storyData?._id) {
          const commentsData = await apiService.getStoryComments(storyData._id);
          setComments(commentsData.comments || []);
        }

      } catch (err) {
        setError('Failed to load the story. It may not exist or has been removed.');
        console.error("Fetch story detail error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchStoryAndComments();
    }
  }, [slug]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const createdComment = await apiService.createComment({
        content: newComment,
        storyId: story._id
      });
      // Add the new comment to the top of the list for immediate feedback
      setComments(prev => [createdComment, ...prev]);
      setNewComment("");
    } catch (err) {
      console.error("Add comment error:", err);
      // Optionally, show an error to the user
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center p-8">Loading story...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-600">{error}</div>;
  }

  if (!story) {
    return <div className="text-center p-8">Story not found.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="relative h-[400px]">
          <img src={story.coverImage} alt={story.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <h1 className="text-4xl font-bold mb-2">{story.title}</h1>
            <p className="text-lg opacity-90">by {story.author.fullName}</p>
          </div>
        </div>

        <div className="p-8 space-y-6">
          {/* The backend model stores content as a single string.
              We use whitespace-pre-line to respect newlines from the textarea. */}
          <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-line">{story.content}</p>
        </div>

        {/* Comment Section */}
        <div className="border-t border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Comments ({comments.length})</h3>
          <form onSubmit={handleAddComment} className="mb-6 flex items-start space-x-4">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              rows="3"
              className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Posting...' : 'Post'}
            </button>
          </form>
          <div className="space-y-4">
            {comments.length > 0 ? (
              comments.map((comment) => (
                <div key={comment._id} className="flex items-start space-x-4">
                  <img 
                    src={comment.author.avatar || `https://ui-avatars.com/api/?name=${comment.author.fullName}&background=random`} 
                    alt={comment.author.fullName}
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">{comment.author.fullName}</p>
                    <p className="text-gray-700">{comment.content}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No comments yet. Be the first to share your thoughts!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StoryDetail;
