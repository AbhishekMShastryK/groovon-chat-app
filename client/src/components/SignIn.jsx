import React, { useState } from 'react';
import {
  GoogleAuthProvider,
  signInWithPopup,
  FacebookAuthProvider,
  GithubAuthProvider,
} from 'firebase/auth';
import { auth, firestore } from '../../../config/firebase'; // Ensure firestore is imported for Firestore
import { doc, setDoc, getDoc } from 'firebase/firestore'; // Firestore methods
import {
  uniqueNamesGenerator,
  adjectives,
  animals,
  NumberDictionary,
} from 'unique-names-generator'; // Import unique-names-generator

function SignIn() {
  const [errorMessage, setErrorMessage] = useState(''); // State to store error messages

  const generateRandomName = () => {
    const numberDictionary = NumberDictionary.generate({ min: 10, max: 99 }); // Generate a 2-digit number
    return uniqueNamesGenerator({
      dictionaries: [adjectives, animals, numberDictionary], // Use adjectives, animals, and numbers
      separator: '', // No separator between words
      style: 'capital', // Capitalize each word
    });
  };

  const handleSignIn = async (provider) => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if the user already has a document in Firestore
      const userDocRef = doc(firestore, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      const defaultAvatarUrl = `https://api.dicebear.com/9.x/pixel-art/svg?seed=Destiny`;

      if (!userDoc.exists()) {
        // Create a new document with a random name and default avatar
        const randomName = generateRandomName();
        await setDoc(userDocRef, {
          name: randomName,
          avatarUrl: defaultAvatarUrl,
          email: user.email,
        });
      } else {
        const userData = userDoc.data();
        const updates = {};

        // Check if the 'name' field exists
        if (!userData.name) {
          updates.name = generateRandomName();
        }

        // Check if the 'avatarUrl' field exists
        if (!userData.avatarUrl) {
          updates.avatarUrl = defaultAvatarUrl;
        }

        // Update the document only if there are missing fields
        if (Object.keys(updates).length > 0) {
          await setDoc(userDocRef, { ...userData, ...updates });
        }

        console.log('User already exists:', userData.name || updates.name);
      }

      setErrorMessage(''); // Clear any previous error
    } catch (error) {
      console.error('Error signing in:', error.message);

      // Set a specific error message for Google sign-in
      if (provider instanceof GoogleAuthProvider) {
        setErrorMessage('Error signing in with Google. Please try again.');
      } else if (provider instanceof FacebookAuthProvider) {
        setErrorMessage(
          'Error signing in with Facebook. Please try signing in with Google instead.'
        );
      } else if (provider instanceof GithubAuthProvider) {
        setErrorMessage(
          'Error signing in with GitHub. Please try signing in with Google instead.'
        );
      } else {
        setErrorMessage('Error signing in. Please try again.');
      }
    }
  };

  const signInWithGoogle = () => handleSignIn(new GoogleAuthProvider());
  const signInWithFacebook = () => handleSignIn(new FacebookAuthProvider());
  const signInWithGitHub = () => handleSignIn(new GithubAuthProvider());

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg w-11/12 sm:w-96">
        <h2 className="text-xl sm:text-2xl font-bold text-center mb-4 sm:mb-6">Sign In</h2>
        {errorMessage && (
          <p className="text-red-500 text-center mb-4">{errorMessage}</p>
        )}
        <div className="mt-4 sm:mt-6 text-center">
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
