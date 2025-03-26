import React, { useState, useEffect, useRef } from 'react';
import './App.css';

import { useAuthState } from 'react-firebase-hooks/auth';
import SignIn from './components/SignIn';
import { auth, firestore } from '../../config/firebase';
import ThreadLobby from './components/ThreadLobby';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import AvatarSelectionModal from './components/AvatarSelectionModal';

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
  const [dataLoading, setDataLoading] = useState(true); // New state to track Firestore loading
  const [menuOpen, setMenuOpen] = useState(false);
  const [avatarModalOpen, setAvatarModalOpen] = useState(false); // State for modal visibility
  const [userName, setUserName] = useState('User'); // State to store the user's name
  const [userAvatar, setUserAvatar] = useState(
    'https://api.dicebear.com/9.x/pixel-art/svg?seed=Destiny'
  ); // State to store the user's avatar URL
  const menuRef = useRef(null);

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
        setUserAvatar(avatarUrl); // Update the avatar in the UI
        setAvatarModalOpen(false); // Close the modal
      } catch (error) {
        console.error('Error updating avatar:', error);
      }
    }
  };

  // Fetch user's name from Firestore
  useEffect(() => {
    const fetchUserName = async () => {
      if (user) {
        try {
          const userRef = doc(firestore, 'users', user.uid);
          const userDoc = await getDoc(userRef);
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserName(userData.name);
            setUserAvatar(userData.avatarUrl);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        } finally {
          setDataLoading(false); // Firestore fetch is complete
        }
      } else {
        setDataLoading(false); // If user is not logged in, skip waiting
      }
    };

    fetchUserName();
  }, [user]);

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

  if (loading || dataLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#f5eef8]">
      <div className="bg-white w-[95vw] max-w-4xl rounded-xl shadow-2xl overflow-hidden">
        <header className="bg-gray-900 h-[8vh] min-h-[50px] text-white flex items-center justify-between px-6">
          <h1 className="text-2xl md:text-3xl font-bold">Groovon</h1>
          {user && ( // Only show the menu for authenticated users
            <div className="flex items-center">
              <span className="mr-4 text-sm md:text-base font-medium flex items-center">
                <div className="w-10 h-10 rounded-full border border-gray-300 mx-1 mr-2 flex items-center justify-center bg-white overflow-hidden">
                  <img
                    src={userAvatar}
                    alt="User Avatar"
                    className="w-7 h-7"
                    style={{ objectFit: 'contain' }}
                  />
                </div>
                {userName}
              </span>
              <div className="relative" ref={menuRef}>
                <button
                  className={`flex items-center justify-center focus:outline-none cursor-pointer transition-all duration-300 ${
                    menuOpen
                      ? 'bg-[#af7ac5] rounded-full'
                      : 'hover:bg-gray-700 hover:rounded-full'
                  }`}
                  style={{
                    width: '40px',
                    height: '40px',
                    fontSize: '22px',
                  }}
                  onClick={toggleMenu}
                >
                  &#8942;
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                    <button
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-[#d7bde2] hover:text-gray-900 transition-colors duration-200 cursor-pointer"
                      onClick={() => setAvatarModalOpen(true)}
                    >
                      Change Avatar
                    </button>
                    <button
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-[#d7bde2] hover:text-gray-900 transition-colors duration-200 cursor-pointer"
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

        <section className="flex flex-col justify-center flex-grow p-4 h-[90vh]">
          {user ? (
            dataLoading ? (
              <div className="flex justify-center items-center h-full">
                <div className="loader"></div>
              </div>
            ) : (
              <ThreadLobby />
            )
          ) : (
            <SignIn />
          )}
        </section>
      </div>

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
