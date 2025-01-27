import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';

function StoryDetail() {
  const { id } = useParams();
  const [userRating, setUserRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [hasRated, setHasRated] = useState(false);

  // This would normally come from an API
  const story = {
    id: 1,
    title: "The Last Sunset",
    author: "Jane Doe",
    genre: "Drama",
    content: [
      {
        type: 'text',
        content: `In the dying light of day, she realized everything was about to change. The sun painted the sky in brilliant hues of orange and pink, casting long shadows across the empty street. Sarah stood at her window, watching as the last rays of sunlight disappeared behind the horizon.

        She had always loved this time of day, when the world seemed to pause between light and darkness. But today was different. The letter in her hand weighed heavily, its contents threatening to upend everything she had built over the last decade.`
      },
      {
        type: 'image',
        content: 'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?q=80&w=1920&auto=format&fit=crop'
      },
      {
        type: 'text',
        content: `The paper trembled slightly as she read it again, hoping somehow the words had changed. They hadn't. The development company was moving forward with their plans, and in three months, her beloved bookstore would be demolished to make way for a new high-rise.`
      }
    ],
    coverImage: "https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?q=80&w=1920&auto=format&fit=crop",
    rating: 4.5,
    votes: 128,
    publishedDate: "2024-03-15"
  };

  const handleRate = (rating) => {
    setUserRating(rating);
    setHasRated(true);
    // Here you would normally send the rating to your backend
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Cover Image */}
        <div className="relative h-[400px]">
          <img
            src={story.coverImage}
            alt={story.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <div className="inline-block bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-full mb-4">
              {story.genre}
            </div>
            <h1 className="text-4xl font-bold mb-2">{story.title}</h1>
            <p className="text-lg opacity-90">by {story.author}</p>
          </div>
        </div>

        {/* Story Content */}
        <div className="p-6 space-y-6">
          {story.content.map((segment, index) => (
            <div key={index}>
              {segment.type === 'text' ? (
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {segment.content}
                </p>
              ) : (
                <div className="relative h-96 my-8">
                  <img
                    src={segment.content}
                    alt="Story illustration"
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Rating Section */}
        <div className="border-t border-gray-200 p-6">
          <div className="flex flex-col items-center space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {hasRated ? 'Thank you for rating!' : 'Rate this story'}
            </h3>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  className="p-1 focus:outline-none disabled:cursor-not-allowed"
                  onClick={() => handleRate(rating)}
                  onMouseEnter={() => setHoveredRating(rating)}
                  onMouseLeave={() => setHoveredRating(0)}
                  disabled={hasRated}
                >
                  {rating <= (hoveredRating || userRating) ? (
                    <StarIcon className="w-8 h-8 text-yellow-400" />
                  ) : (
                    <StarOutlineIcon className="w-8 h-8 text-yellow-400" />
                  )}
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-500">
              Average rating: {story.rating} ({story.votes} votes)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StoryDetail;