import React, { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { format } from 'date-fns';
import { auth, firestore } from '../../../config/firebase';
import PropTypes from 'prop-types';

function ThreadMessage({ message }) {
  const { text, uid, createdAt, clientTimestamp } = message;
  const isSent = uid === auth.currentUser.uid;
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [senderName, setSenderName] = useState('');

  let time = '';
  try {
    const messageTime =
      createdAt?.toDate() ||
      (clientTimestamp ? new Date(clientTimestamp) : new Date());

    time =
      messageTime instanceof Date && !isNaN(messageTime)
        ? format(messageTime, 'h:mm a')
        : '';
  } catch (error) {
    console.error('Error formatting message time:', error);
  }

  const defaultAvatar =
    'https://api.dicebear.com/9.x/pixel-art/svg?seed=Destiny';

  useEffect(() => {
    const userRef = doc(firestore, 'users', uid);
    const unsubscribe = onSnapshot(userRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const userData = docSnapshot.data();
        setSenderName(userData.name || 'Unknown');
        setAvatarUrl(userData.avatarUrl || null);
      }
    });

    return () => unsubscribe();
  }, [uid]);

  return (
    <div
      className={`flex mb-3 sm:mb-4 ${isSent ? 'justify-end' : 'justify-start'}`}
    >
      {!isSent && (
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-gray-300 mx-1 flex items-center justify-center bg-white overflow-hidden">
          <img
            src={avatarUrl || defaultAvatar}
            alt="User Avatar"
            className="w-6 h-6 sm:w-7 sm:h-7"
            style={{ objectFit: 'contain' }}
          />
        </div>
      )}

      <div
        className={`max-w-[90%] sm:max-w-[70%] px-3 sm:px-4 py-2 rounded-3xl text-sm sm:text-lg shadow-md flex flex-col ${
          isSent ? 'bg-[#9b59b6] text-white' : 'bg-white text-black'
        }`}
        style={{ wordBreak: 'break-word' }}
      >
        {!isSent && (
          <span className="text-xs sm:text-sm font-semibold text-[#76448a] mb-1">
            {senderName}
          </span>
        )}
        <span className="text-left" style={{ whiteSpace: 'pre-wrap' }}>
          {text}
        </span>
        <span
          className={`mt-1 text-[0.65rem] sm:text-xs ${
            isSent ? 'text-right text-gray-200' : 'text-right text-gray-500'
          }`}
        >
          {time}
        </span>
      </div>

      {isSent && (
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-gray-300 mx-1 flex items-center justify-center bg-white overflow-hidden">
          <img
            src={avatarUrl || defaultAvatar}
            alt="User Avatar"
            className="w-6 h-6 sm:w-7 sm:h-7"
            style={{ objectFit: 'contain' }}
          />
        </div>
      )}
    </div>
  );
}

ThreadMessage.propTypes = {
  message: PropTypes.shape({
    text: PropTypes.string,
    uid: PropTypes.string,
    createdAt: PropTypes.object,
    clientTimestamp: PropTypes.any,
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    formattedDate: PropTypes.string,
  }).isRequired,
};

export default ThreadMessage;
