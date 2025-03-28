import React, { useState } from 'react';
import {
  GoogleAuthProvider,
  signInWithPopup,
  FacebookAuthProvider,
  GithubAuthProvider,
} from 'firebase/auth';
import { auth, firestore } from '../../../config/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import {
  uniqueNamesGenerator,
  adjectives,
  animals,
  NumberDictionary,
} from 'unique-names-generator';

function SignIn() {
  const [errorMessage, setErrorMessage] = useState('');

  const generateRandomName = () => {
    const numberDictionary = NumberDictionary.generate({ min: 10, max: 99 });
    return uniqueNamesGenerator({
      dictionaries: [adjectives, animals, numberDictionary],
      separator: '',
      style: 'capital',
    });
  };

  const handleSignIn = async (provider) => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const userDocRef = doc(firestore, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      const defaultAvatarUrl = `https://api.dicebear.com/9.x/pixel-art/svg?seed=Destiny`;

      if (!userDoc.exists()) {
        const randomName = generateRandomName();
        await setDoc(userDocRef, {
          name: randomName,
          avatarUrl: defaultAvatarUrl,
          email: user.email,
          groups: ['general'], // add default group membership
        });
      } else {
        const userData = userDoc.data();
        const updates = {};

        if (!userData.name) {
          updates.name = generateRandomName();
        }
        if (!userData.avatarUrl) {
          updates.avatarUrl = defaultAvatarUrl;
        }
        if (!userData.groups) {
          updates.groups = ['general'];
        }
        if (Object.keys(updates).length > 0) {
          await setDoc(userDocRef, { ...userData, ...updates });
        }
        console.log('User already exists:', userData.name || updates.name);
      }
      setErrorMessage('');
    } catch (error) {
      console.error('Error signing in:', error.message);
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
    <div className="flex items-center justify-center w-full h-full p-2">
      <div className="bg-gray-100 p-4 sm:p-6 rounded-lg shadow-lg w-11/12 sm:w-96">
        <h2 className="text-lg sm:text-xl font-bold text-center mb-4 sm:mb-6">
          Sign In
        </h2>
        {errorMessage && (
          <p className="text-red-500 text-center mb-4">{errorMessage}</p>
        )}
        <div className="mt-4 sm:mt-6 text-center">
          <button
            className="w-full bg-[#b03a2e] hover:bg-[#cb4335] text-white font-bold py-2 px-4 rounded-lg shadow-lg transition duration-300 transform hover:scale-105 cursor-pointer text-sm sm:text-base"
            onClick={signInWithGoogle}
          >
            Sign in with Google
          </button>
          <p className="my-3 sm:my-4 text-gray-500 font-medium text-sm sm:text-lg">
            or
          </p>
          <button
            className="w-full bg-[#2874a6] hover:bg-[#2e86c1] text-white font-bold py-2 px-4 rounded-lg shadow-lg transition duration-300 transform hover:scale-105 cursor-pointer text-sm sm:text-base"
            onClick={signInWithFacebook}
          >
            Sign in with Facebook
          </button>
          <p className="my-3 sm:my-4 text-gray-500 font-medium text-sm sm:text-lg">
            or
          </p>
          <button
            className="w-full bg-[#212f3d] hover:bg-[#273746] text-white font-bold py-2 px-4 rounded-lg shadow-lg transition duration-300 transform hover:scale-105 cursor-pointer text-sm sm:text-base"
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
