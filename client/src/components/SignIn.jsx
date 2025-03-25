import React, { useState } from 'react';
import { GoogleAuthProvider, signInWithPopup, FacebookAuthProvider, GithubAuthProvider } from 'firebase/auth';
import { auth } from '../../../config/firebase';

function SignIn() {
  const [errorMessage, setErrorMessage] = useState('');

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log('Signed in with Google:', user.email);
      setErrorMessage(''); // Clear any previous error
    } catch (error) {
      console.error('Error signing in with Google:', error.message);
      setErrorMessage('Error signing in with Google. Please try again.');
    }
  };

  const signInWithFacebook = async () => {
    const provider = new FacebookAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log('Signed in with Facebook:', user.email);
      setErrorMessage(''); // Clear any previous error
    } catch (error) {
      console.error('Error signing in with Facebook:', error.message);
      setErrorMessage('Error signing in with Facebook. Please sign in with Google instead.');
    }
  };

  const signInWithGitHub = async () => {
    const provider = new GithubAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log('Signed in with GitHub:', user.email);
      setErrorMessage(''); // Clear any previous error
    } catch (error) {
      console.error('Error signing in with GitHub:', error.message);
      setErrorMessage('Error signing in with GitHub. Please sign in with Google instead.');
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold text-center mb-6">Sign In</h2>
        {errorMessage && (
          <p className="text-red-500 text-center mb-4">{errorMessage}</p>
        )}
        <div className="mt-6 text-center">
          <button
            className="w-full bg-[#b03a2e] hover:bg-[#cb4335] text-white font-bold py-2 px-4 rounded-lg shadow-lg transition duration-300 transform hover:scale-105 cursor-pointer"
            onClick={signInWithGoogle}
          >
            Sign in with Google
          </button>
          <p className="my-4 text-gray-500 font-medium text-lg">or</p>
          <button
            className="w-full bg-[#2874a6] hover:bg-[#2e86c1] text-white font-bold py-2 px-4 rounded-lg shadow-lg transition duration-300 transform hover:scale-105 cursor-pointer"
            onClick={signInWithFacebook}
          >
            Sign in with Facebook
          </button>
          <p className="my-4 text-gray-500 font-medium text-lg">or</p>
          <button
            className="w-full bg-[#212f3d] hover:bg-[#273746] text-white font-bold py-2 px-4 rounded-lg shadow-lg transition duration-300 transform hover:scale-105 cursor-pointer"
            onClick={signInWithGitHub}
          >
            Sign in with GitHub
          </button>
        </div>
      </div>
    </div>
  );
}

export default SignIn;
