import React from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../../../config/firebase';

function SignOut() {
  return (
    auth.currentUser && (
      <button
        className="bg-[#af7ac5] hover:bg-[#9b59b6] text-white font-bold py-2 px-3 sm:px-4 rounded-lg shadow-md transition duration-300 cursor-pointer text-xs sm:text-sm"
        onClick={() => {
          signOut(auth);
        }}
      >
        Sign Out
      </button>
    )
  );
}

export default SignOut;
