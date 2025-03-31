import React, { useState, useEffect, useRef } from 'react';
import './App.css';

import { useAuthState } from 'react-firebase-hooks/auth';
import SignIn from './components/SignIn';
import { auth, firestore } from '../../config/firebase';
import ThreadLobby from './components/ThreadLobby';
import GroupsSidebar from './components/GroupsSidebar';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import AvatarSelectionModal from './components/AvatarSelectionModal';
import { GiHamburgerMenu } from 'react-icons/gi';

const avatarNames = [
  'Jade',
  'Aiden',
  'Alexander',
  'Maria',
  'Brooklynn',
  'Liliana',
  'Luis',
  'Oliver',
  'Kimberly',
  'Brian',
  'Sadie',
  'Mason',
  'Caleb',
  'Mackenzie',
  'Valentina',
  'Jude',
  'Ryker',
  'Eliza',
  'Andrea',
  'Sawyer',
  'Destiny',
];

function App() {
  const [user, loading] = useAuthState(auth);
  const [dataLoading, setDataLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const [userAvatar, setUserAvatar] = useState(
    'https://api.dicebear.com/9.x/pixel-art/svg?seed=Destiny'
  );
  const [currentGroup, setCurrentGroup] = useState(() => {
    return localStorage.getItem('currentGroup') || 'random';
  });
  const menuRef = useRef(null);

  // Controls mobile sidebar
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Persist currentGroup changes to localStorage
  useEffect(() => {
    localStorage.setItem('currentGroup', currentGroup);
  }, [currentGroup]);

  useEffect(() => {
    // Only reset if loading is complete and there is no user.
    if (!loading && !user) {
      setCurrentGroup('random');
      localStorage.removeItem('currentGroup');
    }
  }, [user, loading]);

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const handleSignOut = () => {
    auth.signOut();
    setMenuOpen(false);
  };

  const handleAvatarSelect = async (avatarName) => {
    if (user) {
      try {
        const avatarUrl = `https://api.dicebear.com/9.x/pixel-art/svg?seed=${avatarName}`;
        const userRef = doc(firestore, 'users', user.uid);
        await setDoc(userRef, { avatarUrl }, { merge: true });
        setUserAvatar(avatarUrl);
        setAvatarModalOpen(false);
      } catch (error) {
        console.error('Error updating avatar:', error);
      }
    }
  };

  useEffect(() => {
    if (user) {
      const userRef = doc(firestore, 'users', user.uid);
      const unsubscribe = onSnapshot(userRef, (docSnapshot) => {
        if (docSnapshot.exists()) {
          const userData = docSnapshot.data();
          setUserName(userData.name);
          setUserAvatar(userData.avatarUrl);
        }
        setDataLoading(false);
      });
      return unsubscribe;
    } else {
      setDataLoading(false);
    }
  }, [user]);

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

  if (loading || dataLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#f5eef8] p-2 sm:p-4">
      {/* Outer card container with flex so sidebar & chat can be side by side */}
      <div className="bg-white w-full max-w-5xl rounded-xl shadow-2xl overflow-hidden mx-2 sm:mx-4 lg:mx-8 flex relative">
        {/* The left side: Our sidebar (pinned on desktop, slide-in on mobile) */}
        {user && (
          <GroupsSidebar
            currentGroup={currentGroup}
            setCurrentGroup={setCurrentGroup}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
          />
        )}

        {/* The right side: header + chat content */}
        <div className="flex flex-col flex-grow">
          <header className="bg-gray-900 flex items-center justify-between px-2 sm:px-4 lg:px-8 py-3">
            {/* Left side: hamburger + title */}
            <div className="flex items-center space-x-2">
              {/* Hamburger (visible only on mobile) */}
              {user && (
                <button
                  className="text-white md:hidden"
                  onClick={() => setSidebarOpen(true)}
                >
                  <GiHamburgerMenu size={24} />
                </button>
              )}

              <h1 className="text-lg text-white sm:text-xl md:text-3xl font-bold">
                Groovon
              </h1>
            </div>

            {/* Right side: user info & vertical menu */}
            {user && (
              <div className="flex items-center">
                <span className="mr-2 sm:mr-4 text-xs sm:text-sm md:text-base text-white font-medium flex items-center">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-gray-300 mx-1 mr-2 flex items-center justify-center bg-white overflow-hidden">
                    <img
                      src={userAvatar}
                      alt="User Avatar"
                      className="w-6 h-6 sm:w-7 sm:h-7"
                      style={{ objectFit: 'contain' }}
                    />
                  </div>
                  {userName}
                </span>
                <div className="relative" ref={menuRef}>
                  <button
                    className={`flex items-center justify-center text-white focus:outline-none cursor-pointer transition-all duration-300 ${
                      menuOpen
                        ? 'bg-[#af7ac5] rounded-full'
                        : 'hover:bg-gray-700 hover:rounded-full'
                    }`}
                    style={{ width: '40px', height: '40px', fontSize: '22px' }}
                    onClick={toggleMenu}
                  >
                    &#8942;
                  </button>
                  {menuOpen && (
                    <div className="absolute right-0 mt-2 w-48 sm:w-56 bg-white rounded-md shadow-lg z-10">
                      <button
                        className="block w-full text-left px-4 sm:px-5 py-3 text-sm sm:text-base text-gray-700 hover:bg-[#d7bde2] hover:text-gray-900 transition-colors duration-200 cursor-pointer"
                        onClick={() => setAvatarModalOpen(true)}
                      >
                        Change Avatar
                      </button>
                      <button
                        className="block w-full text-left px-4 sm:px-5 py-3 text-sm sm:text-base text-gray-700 hover:bg-[#d7bde2] hover:text-gray-900 transition-colors duration-200 cursor-pointer"
                        onClick={handleSignOut}
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </header>

          {/* Chat area */}
          <section className="flex flex-col flex-grow p-2 sm:p-4 h-[85vh] md:h-[90vh]">
            {user ? (
              dataLoading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="loader"></div>
                </div>
              ) : (
                <ThreadLobby currentGroup={currentGroup} />
              )
            ) : (
              <SignIn />
            )}
          </section>
        </div>
      </div>

      {/* Avatar selection modal */}
      {avatarModalOpen && (
        <AvatarSelectionModal
          avatarNames={avatarNames}
          onSelect={handleAvatarSelect}
          onClose={() => setAvatarModalOpen(false)}
        />
      )}
    </div>
  );
}

export default App;
