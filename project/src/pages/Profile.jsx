import { useState } from 'react';

function Profile() {
  const [user] = useState({
    name: "John Smith",
    bio: "Passionate storyteller with a love for drama and mystery",
    stories: 8,
    followers: 245,
    following: 123
  });

  const [stories] = useState([
    {
      id: 1,
      title: "The Midnight Train",
      genre: "Mystery",
      views: 1200,
      rating: 4.7,
      status: "published"
    },
    // Add more sample stories
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="flex flex-col sm:flex-row items-center">
          <div className="w-32 h-32 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 text-4xl font-bold mb-4 sm:mb-0">
            {user.name.charAt(0)}
          </div>
          <div className="sm:ml-8 text-center sm:text-left">
            <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
            <p className="text-gray-600 mt-2">{user.bio}</p>
            <div className="flex justify-center sm:justify-start space-x-8 mt-4">
              <div className="text-center">
                <div className="text-xl font-bold text-gray-900">{user.stories}</div>
                <div className="text-sm text-gray-500">Stories</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-gray-900">{user.followers}</div>
                <div className="text-sm text-gray-500">Followers</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-gray-900">{user.following}</div>
                <div className="text-sm text-gray-500">Following</div>
              </div>
            </div>
          </div>
          <div className="sm:ml-auto mt-4 sm:mt-0">
            <button className="btn-primary">
              Edit Profile
            </button>
          </div>
        </div>
      </div>

      {/* Stories Section */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">My Stories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {stories.map((story) => (
            <div key={story.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{story.title}</h3>
                  <span className="inline-block bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-full mt-1">
                    {story.genre}
                  </span>
                </div>
                <span className="text-sm text-gray-500 capitalize">{story.status}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <span className="text-yellow-400">★</span>
                    <span className="ml-1 text-sm text-gray-600">{story.rating}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {story.views} views
                  </div>
                </div>
                <button className="text-primary-600 hover:text-primary-700">
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Profile;