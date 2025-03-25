import React, { useRef, useState } from 'react';
import {
  collection,
  query,
  orderBy,
  limit,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { auth, firestore } from '../../../config/firebase';
import planeArrow from '../assets/paper-plane.png';
import { format } from 'date-fns';

function ThreadLobby() {
  const scrollToBottomRef = useRef();
  const messagesCollectionRef = collection(firestore, 'messages');
  const latestMessagesQuery = query(
    messagesCollectionRef,
    orderBy('createdAt', 'desc'),
    limit(100)
  );
  const [messages] = useCollectionData(latestMessagesQuery, { idField: 'id' });

  const [messageInput, setMessageInput] = useState('');

  const handleSendMessage = async () => {
    if (!messageInput.trim()) return;
    const { uid } = auth.currentUser;

    await addDoc(messagesCollectionRef, {
      text: messageInput,
      createdAt: serverTimestamp(),
      uid,
    });

    setMessageInput('');
    scrollToBottomRef.current.scrollIntoView({ behavior: 'smooth' });
  };

  const handleInputChange = (e) => {
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
    setMessageInput(textarea.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const groupMessagesByDate = (messages) => {
    const grouped = {};
    messages.forEach((message) => {
      const date = message.createdAt
        ? format(message.createdAt.toDate(), 'MMMM d, yyyy')
        : 'Unknown Date';
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(message);
    });
    return grouped;
  };

  const groupedMessages = messages
    ? groupMessagesByDate([...messages].reverse())
    : {};

  return (
    <div className="flex flex-col items-center w-full max-w-full sm:max-w-4xl mx-auto">
      <main className="p-4 h-[calc(95vh-10rem)] w-full overflow-y-scroll flex flex-col scrollbar-thin scrollbar-thumb-purple-600 bg-gray-200 rounded-t-lg shadow-inner">
        {Object.keys(groupedMessages).map((date) => (
          <div key={date}>
            <div className="flex items-center my-4">
              <hr className="flex-grow border-gray-300" />
              <span className="px-4 text-gray-500 font-semibold">{date}</span>
              <hr className="flex-grow border-gray-300" />
            </div>
            {groupedMessages[date].map((message, index) => (
              <ThreadMessage key={message.id || index} message={message} />
            ))}
          </div>
        ))}
        <span ref={scrollToBottomRef}></span>
      </main>

      <form
        onSubmit={(e) => e.preventDefault()}
        className="flex items-center w-full h-auto rounded-b-lg shadow-lg px-2 sm:px-4 py-2 bg-gray-900"
      >
        <textarea
          value={messageInput}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Write a message..."
          className="flex-grow text-base sm:text-lg bg-gray-700 text-white outline-none border-none px-2 sm:px-4 py-2 rounded-lg mr-2 resize-none overflow-y-auto scrollbar-thin scrollbar-thumb-purple-600 scrollbar-track-gray-800"
          style={{
            minHeight: '2.5rem',
            maxHeight: '5rem',
            overflowY: 'auto',
          }}
        />
        <button
          className={`bg-[#af7ac5] hover:bg-[#9b59b6] text-white font-bold py-2 px-3 sm:px-4 rounded-lg transition duration-300 flex justify-center items-center ${
            !messageInput ? 'opacity-50 pointer-events-none' : 'cursor-pointer'
          }`}
          type="button"
          onClick={handleSendMessage}
          disabled={!messageInput}
        >
          <img
            src={planeArrow}
            alt="Send"
            className="w-5 h-5 sm:w-6 sm:h-6"
            style={{ filter: 'invert(1)' }}
          />
        </button>
      </form>
    </div>
  );
}

function ThreadMessage({ message }) {
  const { text, uid, createdAt } = message;
  const isSent = uid === auth.currentUser.uid;

  const avatarUrl = `https://api.dicebear.com/9.x/pixel-art/svg?seed=Destiny`;

  const time = createdAt ? format(createdAt.toDate(), 'h:mm a') : '';

  return (
    <div className={`flex mb-4 ${isSent ? 'justify-end' : 'justify-start'}`}>
      {!isSent && (
        <div className="w-10 h-10 rounded-full border border-gray-300 mx-1 flex items-center justify-center bg-white overflow-hidden">
          <img
            src={avatarUrl}
            alt="User Avatar"
            className="w-7 h-7"
            style={{ objectFit: 'contain' }}
          />
        </div>
      )}

      <div
        className={`max-w-[70%] px-4 py-2 rounded-3xl text-lg shadow-md flex flex-col ${
          isSent ? 'bg-[#9b59b6] text-white' : 'bg-white text-black'
        }`}
        style={{ wordBreak: 'break-word' }}
      >
        <span className="text-left">{text}</span>
        <span
          className={`text-[0.700rem] mt-1 ${
            isSent ? 'text-right text-gray-200' : 'text-right text-gray-500'
          }`}
        >
          {time}
        </span>
      </div>

      {isSent && (
        <div className="w-10 h-10 rounded-full border border-gray-300 mx-1 flex items-center justify-center bg-white overflow-hidden">
          <img
            src={avatarUrl}
            alt="User Avatar"
            className="w-7 h-7"
            style={{ objectFit: 'contain' }}
          />
        </div>
      )}
    </div>
  );
}

export default ThreadLobby;
