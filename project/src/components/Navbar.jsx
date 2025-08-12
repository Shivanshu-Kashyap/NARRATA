// src/components/Navbar.jsx

import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bars3Icon, XMarkIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
// Make sure you have a logo file at this path or replace it.
 import Logo from '../assets/NARRATA__LOGO.png'; 

function Navbar() {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isProfileOpen, setProfileOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const profileMenuRef = useRef(null); // Create a ref for the dropdown menu

  // This effect handles closing the dropdown when a user clicks outside of it.
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };

    // Add the event listener when the component mounts
    document.addEventListener("mousedown", handleClickOutside);
    
    // Clean up the event listener when the component unmounts
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []); // The empty dependency array ensures this effect runs only once

  const handleLogout = async () => {
    await logout();
    setProfileOpen(false);
    navigate('/login');
  };

  const handleProfileClick = () => {
    setProfileOpen(false); // Close dropdown when navigating to the profile page
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center">
              {/* Using a text logo as a placeholder */}
              {/* <span className="text-2xl font-bold text-primary-600">Narrata</span> */}
              <img src={Logo} alt="Narrata Logo" className="h-10 w-auto" />
            </Link>
          </div>

          {/* Centered Navigation Links for Desktop */}
          <div className="hidden sm:flex sm:space-x-8">
            <Link to="/stories" className="text-gray-700 hover:text-primary-600 font-medium">Stories</Link>
            <Link to="/leaderboard" className="text-gray-700 hover:text-primary-600 font-medium">Leaderboard</Link>
            <Link to="/write" className="text-gray-700 hover:text-primary-600 font-medium">Write</Link>
          </div>

          {/* Right Side Actions */}
          <div className="hidden sm:flex sm:items-center space-x-4">
            {user ? (
              // Profile Dropdown for logged-in users
              <div className="relative" ref={profileMenuRef}>
                {/* **FIX:** Changed from onMouseEnter/Leave to onClick */}
                <button 
                  onClick={() => setProfileOpen(prev => !prev)} 
                  className="flex items-center space-x-2 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <span className="sr-only">Open user menu</span>
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold overflow-hidden">
                    {user.avatar ? (
                      <img src={user.avatar} alt="User Avatar" className="w-full h-full object-cover" />
                    ) : (
                      user.fullName?.charAt(0).toUpperCase()
                    )}
                  </div>
                  <ChevronDownIcon 
                    className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${
                      isProfileOpen ? 'rotate-180' : ''
                    }`} 
                  />
                </button>
                {isProfileOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900 truncate">{user.fullName}</p>
                      <p className="text-xs text-gray-500 truncate">@{user.username}</p>
                    </div>
                    <Link 
                      to="/profile" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={handleProfileClick}
                    >
                      Your Profile
                    </Link>
                    <button 
                      onClick={handleLogout} 
                      className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // Login/Signup buttons for logged-out users
              <>
                <Link to="/login" className="text-gray-700 hover:text-gray-900 font-medium">Login</Link>
                <Link to="/signup" className="btn-primary">Sign Up</Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center sm:hidden">
            <button onClick={() => setMobileMenuOpen(!isMobileMenuOpen)} className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100">
              {isMobileMenuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="sm:hidden bg-white border-t border-gray-200">
          <div className="pt-2 pb-3 space-y-1">
            <Link to="/stories" className="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50">Stories</Link>
            <Link to="/leaderboard" className="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50">Leaderboard</Link>
            <Link to="/write" className="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50">Write</Link>
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            {user ? (
              <div className="px-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold overflow-hidden">
                    {user.avatar ? <img src={user.avatar} alt="User Avatar" className="w-full h-full object-cover" /> : user.fullName?.charAt(0).toUpperCase()}
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-gray-800">{user.fullName}</div>
                    <div className="text-sm font-medium text-gray-500">@{user.username}</div>
                  </div>
                </div>
                <div className="mt-3 space-y-1">
                  <Link to="/profile" className="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50">Your Profile</Link>
                  <button onClick={handleLogout} className="w-full text-left block pl-3 pr-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50">Sign out</button>
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <Link to="/login" className="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50">Login</Link>
                <Link to="/signup" className="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50">Sign Up</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
