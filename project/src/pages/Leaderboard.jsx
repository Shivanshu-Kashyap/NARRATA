// src/pages/Leaderboard.jsx

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiService from '../services/api';

function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        setError('');
        // The backend returns an object with a 'leaderboard' property
        const data = await apiService.getLeaderboard();
        setLeaderboard(data.leaderboard || []);
      } catch (err) {
        setError('Failed to load the leaderboard. Please try again later.');
        console.error("Fetch leaderboard error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []); // Runs once when the component mounts

  if (loading) {
    return <div className="text-center p-8">Loading Leaderboard...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-600">{error}</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Top Storytellers</h1>
      
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Writer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stories</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Followers</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {leaderboard.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-10 text-gray-500">
                  The leaderboard is empty. Start writing to get on the board!
                </td>
              </tr>
            ) : (
                leaderboard.map((entry) => (
                  <tr key={entry.rank} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-lg font-bold text-gray-900">#{entry.rank}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <Link to={`/profile/${entry.user.username}`} className="flex items-center group">
                          <div className="flex-shrink-0 h-10 w-10">
                            <img 
                              className="h-10 w-10 rounded-full object-cover" 
                              src={entry.user.avatar || `https://ui-avatars.com/api/?name=${entry.user.fullName}&background=random`} 
                              alt={entry.user.fullName} 
                            />
                          </div>
                          <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 group-hover:text-primary-600">{entry.user.fullName}</div>
                            <div className="text-sm text-gray-500">@{entry.user.username}</div>
                          </div>
                        </Link>
                    </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-semibold">{Math.round(entry.totalScore)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{entry.user.stats.totalStories}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{entry.user.stats.followerCount}</div>
                    </td>
                  </tr>
                ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Leaderboard;
