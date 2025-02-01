import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { EnvelopeIcon, PhoneIcon, MapPinIcon } from '@heroicons/react/24/outline';

function Home() {
  const featuredWriters = [
    {
      id: 1,
      name: "Sarah Johnson",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=400&auto=format&fit=crop",
      bio: "Award-winning author of 'The Last Sunset' and 'Midnight Dreams'",
      achievements: ["Monthly Winner", "Editor's Choice"],
      story: {
        title: "The Last Sunset",
        excerpt: "In the dying light of day, she realized everything was about to change...",
        rating: 4.8,
        votes: 1243
      }
    },
    {
      id: 2,
      name: "Michael Chen",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop",
      bio: "Bestselling thriller writer with a passion for suspense",
      achievements: ["Top Rated", "Rising Star"],
      story: {
        title: "The Silent Witness",
        excerpt: "The evidence was there, hidden in plain sight all along...",
        rating: 4.9,
        votes: 892
      }
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop",
      bio: "Romance novelist and two-time Story of the Month winner",
      achievements: ["Story of the Month", "Community Favorite"],
      story: {
        title: "Love in Paris",
        excerpt: "The city of lights held more magic than she ever imagined...",
        rating: 4.7,
        votes: 756
      }
    }
  ];

  return (
    <div>
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-primary-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <motion.h1 
              className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="block">Transform Your Stories</span>
              <span className="block text-primary-600">Into Screen Magic</span>
            </motion.h1>
            <motion.p 
              className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Share your stories, get discovered by the industry, and turn your narratives into visual entertainment.
            </motion.p>
            <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
              <div className="rounded-md shadow">
                <Link
                  to="/write"
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 md:py-4 md:text-lg md:px-10"
                >
                  Start Writing
                </Link>
              </div>
              <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
                <Link
                  to="/stories"
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
                >
                  Browse Stories
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Features Section */}
<div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">Why Choose Narrata?</h2>
          </div>
          <div className="mt-10">
            <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
              <div className="card">
                <div className="text-primary-600 text-2xl mb-4">📝</div>
                <h3 className="text-lg font-medium text-gray-900">Share Your Stories</h3>
                <p className="mt-2 text-gray-500">Write and share your stories with a global audience of readers and industry professionals.</p>
              </div>
              <div className="card">
                <div className="text-primary-600 text-2xl mb-4">🏆</div>
                <h3 className="text-lg font-medium text-gray-900">Get Recognized</h3>
                <p className="mt-2 text-gray-500">Climb the leaderboard and get featured on our platform as top storytellers.</p>
              </div>
              <div className="card">
                <div className="text-primary-600 text-2xl mb-4">🎬</div>
                <h3 className="text-lg font-medium text-gray-900">Industry Connection</h3>
                <p className="mt-2 text-gray-500">Connect with production houses and turn your stories into visual entertainment.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Featured Writers Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900">Featured Writers</h2>
            <p className="mt-4 text-lg text-gray-500">Meet our most accomplished storytellers</p>
          </div>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {featuredWriters.map((writer) => (
              <div key={writer.id} className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform hover:scale-105">
                <div className="p-6 text-center">
                  <div className="mx-auto w-32 h-32 mb-4">
                    <img
                      src={writer.image}
                      alt={writer.name}
                      className="w-full h-full rounded-full object-cover ring-4 ring-primary-100 shadow-lg"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center mb-4">
                    {writer.achievements.map((achievement, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 shadow-sm"
                      >
                        {achievement}
                      </span>
                    ))}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{writer.name}</h3>
                  <p className="mt-2 text-gray-600">{writer.bio}</p>
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-gray-900">{writer.story.title}</h4>
                    <p className="mt-1 text-sm text-gray-600 line-clamp-2">{writer.story.excerpt}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="text-yellow-400">★</span>
                        <span className="ml-1 text-sm text-gray-600">{writer.story.rating}</span>
                        <span className="ml-1 text-sm text-gray-400">({writer.story.votes} votes)</span>
                      </div>
                      <Link
                        to={`/story/${writer.id}`}
                        className="text-sm text-primary-600 hover:text-primary-700"
                      >
                        Read More →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900">Contact Us</h2>
            <p className="mt-4 text-lg text-gray-500">Have questions? We'd love to hear from you.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <form className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <button
                    type="submit"
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Send Message
                  </button>
                </div>
              </form>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Get in Touch</h3>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <EnvelopeIcon className="h-6 w-6 text-primary-600" />
                      <span className="ml-3 text-gray-600">contact@storytoscreen.com</span>
                    </div>
                    <div className="flex items-center">
                      <PhoneIcon className="h-6 w-6 text-primary-600" />
                      <span className="ml-3 text-gray-600">+1 (555) 123-4567</span>
                    </div>
                    <div className="flex items-center">
                      <MapPinIcon className="h-6 w-6 text-primary-600" />
                      <span className="ml-3 text-gray-600">123 Story Street, Creative City, ST 12345</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Office Hours</h3>
                  <div className="text-gray-600">
                    <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                    <p>Saturday: 10:00 AM - 4:00 PM</p>
                    <p>Sunday: Closed</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;



