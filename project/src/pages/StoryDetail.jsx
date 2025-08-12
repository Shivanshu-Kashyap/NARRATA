// src/pages/StoryDetail.jsx

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/api';
import { HandThumbUpIcon, HandThumbDownIcon } from '@heroicons/react/24/solid';
import { HandThumbUpIcon as HandThumbUpOutline, HandThumbDownIcon as HandThumbDownOutline } from '@heroicons/react/24/outline';

function StoryDetail() {
  const { slug } = useParams();
  const { user } = useAuth();
  const [story, setStory] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [isFollowing, setIsFollowing] = useState(false);
  const [hasLiked, setHasLiked] = useState(false);
  const [hasDisliked, setHasDisliked] = useState(false);

  useEffect(() => {
    const fetchStoryAndComments = async () => {
      try {
        setLoading(true);
        setError('');
        
        const storyData = await apiService.getStoryBySlug(slug);
        setStory(storyData);

        setHasLiked(storyData.userEngagement?.hasLiked || false);
        setHasDisliked(storyData.userEngagement?.hasDisliked || false);
        
        // **FIX:** Correctly check if the current user's ID is in the author's followers array
        if (user && storyData.author?.followers) {
          setIsFollowing(storyData.author.followers.includes(user._id));
        }

        if (storyData?._id) {
          const commentsData = await apiService.getStoryComments(storyData._id);
          setComments(commentsData.comments || []);
        }

      } catch (err) {
        setError('Failed to load the story. It may not exist or has been removed.');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchStoryAndComments();
    }
  }, [slug, user]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setIsSubmitting(true);
    try {
      const createdComment = await apiService.createComment({
        content: newComment,
        storyId: story._id
      });
      setComments(prev => [createdComment, ...prev]);
      setNewComment("");
    } catch (err) {
      console.error("Add comment error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = async () => {
    if (!user) return;
    const originalLiked = hasLiked;
    const originalDisliked = hasDisliked;
    setHasLiked(!originalLiked);
    if (originalDisliked) setHasDisliked(false);
    try {
      await apiService.likeStory(story._id);
    } catch (err) {
      setHasLiked(originalLiked);
      setHasDisliked(originalDisliked);
    }
  };

  const handleDislike = async () => {
    if (!user) return;
    const originalLiked = hasLiked;
    const originalDisliked = hasDisliked;
    setHasDisliked(!originalDisliked);
    if (originalLiked) setHasLiked(false);
    try {
      await apiService.dislikeStory(story._id);
    } catch (err) {
      setHasLiked(originalLiked);
      setHasDisliked(originalDisliked);
    }
  };

  const handleFollowToggle = async () => {
    if (!user) return;
    const originalFollowing = isFollowing;
    setIsFollowing(!originalFollowing);
    try {
      if (originalFollowing) {
        await apiService.unfollowUser(story.author._id);
      } else {
        await apiService.followUser(story.author._id);
      }
    } catch (err) {
      setIsFollowing(originalFollowing);
    }
  };

  if (loading) { return <div className="text-center p-8">Loading story...</div>; }
  if (error) { return <div className="text-center p-8 text-red-600">{error}</div>; }
  if (!story) { return <div className="text-center p-8">Story not found.</div>; }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="relative h-[400px]">
          <img src={story.coverImage} alt={story.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <h1 className="text-4xl font-bold mb-2">{story.title}</h1>
            <div className="flex items-center space-x-4">
              <Link to={`/profile/${story.author.username}`} className="flex items-center group">
                <img 
                  src={story.author.avatar || `https://ui-avatars.com/api/?name=${story.author.fullName}&background=random`} 
                  alt={story.author.fullName} 
                  className="w-12 h-12 rounded-full object-cover border-2 border-white"
                />
                <p className="text-lg opacity-90 ml-3 group-hover:underline">{story.author.fullName}</p>
              </Link>
              {user && user._id !== story.author._id && (
                <button onClick={handleFollowToggle} className={`btn-secondary-sm ${isFollowing ? 'bg-gray-200 text-gray-800' : ''}`}>
                  {isFollowing ? 'Following' : 'Follow'}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="p-8 space-y-6">
          <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-line">{story.content}</p>
        </div>

        <div className="border-t border-gray-200 p-6 flex justify-center items-center space-x-6">
          <button onClick={handleLike} className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors disabled:opacity-50" disabled={!user}>
            {hasLiked ? <HandThumbUpIcon className="w-6 h-6 text-primary-600" /> : <HandThumbUpOutline className="w-6 h-6" />}
            <span>Like</span>
          </button>
          <button onClick={handleDislike} className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors disabled:opacity-50" disabled={!user}>
            {hasDisliked ? <HandThumbDownIcon className="w-6 h-6 text-red-600" /> : <HandThumbDownOutline className="w-6 h-6" />}
            <span>Dislike</span>
          </button>
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
                disabled={!user}
            />
            <button type="submit" className="btn-primary" disabled={isSubmitting || !user}>
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
