import React from 'react';
import './App.css';

import { useAuthState } from 'react-firebase-hooks/auth';
import SignIn from './components/SignIn';
import SignOut from './components/SignOut';
import { auth } from '../../config/firebase';
import ThreadLobby from './components/ThreadLobby';

function App() {
  const [user, loading] = useAuthState(auth);

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
          <SignOut />
        </header>

        <section className="flex flex-col justify-center flex-grow p-4 h-[90vh]">
          {user ? <ThreadLobby /> : <SignIn />}
        </section>
      </div>
    </div>
  );
}

export default App;
