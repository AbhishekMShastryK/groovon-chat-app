import React, { useState, useEffect, useRef } from 'react';
import './App.css';

import { useAuthState } from 'react-firebase-hooks/auth';
import SignIn from './components/SignIn';
import { auth } from '../../config/firebase';
import ThreadLobby from './components/ThreadLobby';

function App() {
  const [user, loading] = useAuthState(auth);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const handleSignOut = () => {
    auth.signOut();
    setMenuOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white w-[95vw] max-w-4xl rounded-xl shadow-2xl overflow-hidden">
        <header className="bg-gray-900 h-[8vh] min-h-[50px] text-white flex items-center justify-between px-6">
          <h1 className="text-2xl md:text-3xl font-bold">Groovon</h1>
          {user && ( // Only show the menu for authenticated users
            <div className="relative" ref={menuRef}>
              <button
                className={`flex items-center justify-center focus:outline-none cursor-pointer transition-all duration-300 ${
                  menuOpen
                    ? 'bg-[#af7ac5] rounded-full'
                    : 'hover:bg-gray-700 hover:rounded-full'
                }`}
                style={{
                  width: '40px', // Set a fixed width
                  height: '40px', // Set a fixed height to make it a perfect circle
                  fontSize: '20px', // Set font size directly
                }}
                onClick={toggleMenu}
              >
                &#8942;
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                  <button
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-[#d7bde2] hover:text-gray-900 transition-colors duration-200"
                    onClick={() => alert('Avatar selection coming soon!')}
                  >
                    Select Avatar
                  </button>
                  <button
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-[#d7bde2] hover:text-gray-900 transition-colors duration-200"
                    onClick={handleSignOut}
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          )}
        </header>

        <section className="flex flex-col justify-center flex-grow p-4 h-[90vh]">
          {user ? <ThreadLobby /> : <SignIn />}
        </section>
      </div>
    </div>
  );
}

export default App;
