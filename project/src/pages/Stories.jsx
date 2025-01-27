import { useState } from 'react';
import { Link } from 'react-router-dom';

function Stories() {
  const [stories] = useState([
    {
      id: 1,
      title: "The Last Sunset",
      author: "Jane Doe",
      genre: "Drama",
      excerpt: "In the dying light of day, she realized everything was about to change...",
      rating: 4.5,
      votes: 128,
      coverImage: "https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?q=80&w=1920&auto=format&fit=crop"
    },
    // Add more sample stories
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Featured Stories</h1>
        <div className="flex space-x-4">
          <select className="rounded-md border-gray-300">
            <option>All Genres</option>
            <option>Drama</option>
            <option>Thriller</option>
            <option>Comedy</option>
          </select>
          <select className="rounded-md border-gray-300">
            <option>Most Popular</option>
            <option>Latest</option>
            <option>Top Rated</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stories.map((story) => (
          <div key={story.id} className="card hover:shadow-lg transition-shadow overflow-hidden">
            <div className="relative h-48 mb-4 -mx-6 -mt-6">
              <img
                src={story.coverImage}
                alt={story.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <span className="absolute bottom-4 left-4 inline-block bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-full">
                {story.genre}
              </span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">{story.title}</h2>
            <p className="text-sm text-gray-500 mb-2">by {story.author}</p>
            <p className="text-gray-600 mb-4 line-clamp-3">{story.excerpt}</p>
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <span className="text-yellow-400">★</span>
                <span className="ml-1 text-sm text-gray-600">{story.rating}</span>
                <span className="ml-1 text-sm text-gray-400">({story.votes})</span>
              </div>
              <Link to={`/story/${story.id}`} className="btn-primary">
                Read More
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Stories;