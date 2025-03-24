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
import defaultAvatar from '../assets/default-avatar.png';
import planeArrow from '../assets/paper-plane.png';
import { format } from 'date-fns';

function ThreadLobby() {
  const scrollToBottomRef = useRef();
  const messagesCollectionRef = collection(firestore, 'messages');
  const latestMessagesQuery = query(
    messagesCollectionRef,
    orderBy('createdAt', 'desc'),
    limit(50)
  );
  const [messages] = useCollectionData(latestMessagesQuery, { idField: 'id' });

  const [messageInput, setMessageInput] = useState('');

  const handleSendMessage = async () => {
    if (!messageInput.trim()) return;
    const { uid, photoURL } = auth.currentUser;

    await addDoc(messagesCollectionRef, {
      text: messageInput,
      createdAt: serverTimestamp(),
      uid,
      photoURL,
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
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto">
      <main className="p-4 h-[77vh] w-full overflow-y-scroll flex flex-col scrollbar-thin scrollbar-thumb-purple-600 bg-gray-200 rounded-t-lg shadow-inner">
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
        className="flex items-center w-full h-auto rounded-b-lg shadow-lg px-4 py-2 bg-gray-900"
      >
        <textarea
          value={messageInput}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Write a message..."
          className="flex-grow text-lg bg-gray-700 text-white outline-none border-none px-4 py-2 rounded-lg mr-2 resize-none overflow-y-auto scrollbar-thin scrollbar-thumb-purple-600 scrollbar-track-gray-800"
          style={{
            minHeight: '2.5rem',
            maxHeight: '5rem',
            overflowY: 'auto',
          }}
        />
        <button
          className={`bg-[#af7ac5] hover:bg-[#9b59b6] text-white font-bold py-2 px-4 rounded-lg transition duration-300 flex justify-center items-center ${
            !messageInput ? 'opacity-50 pointer-events-none' : 'cursor-pointer'
          }`}
          type="button"
          onClick={handleSendMessage}
          disabled={!messageInput}
        >
          <img
            src={planeArrow}
            alt="Send"
            className="w-6 h-6"
            style={{ filter: 'invert(1)' }}
          />
        </button>
      </form>
    </div>
  );
}

function ThreadMessage({ message }) {
  const { text, uid, photoURL, createdAt } = message;
  const isSent = uid === auth.currentUser.uid;

  const time = createdAt ? format(createdAt.toDate(), 'h:mm a') : '';

  return (
    <div
      className={`flex mb-4 ${isSent ? 'justify-end' : 'justify-start'}`}
    >
      {!isSent && (
        <>
          <img
            src={photoURL || defaultAvatar}
            alt="User Avatar"
            className="w-10 h-10 rounded-full border border-gray-300 mx-1"
          />
        </>
      )}

      <div
        className={`max-w-[70%] px-4 py-2 rounded-3xl text-lg shadow-md flex flex-col ${
          isSent ? 'bg-[#9b59b6] text-white' : 'bg-white text-black'
        }`}
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
        <>
          <img
            src={photoURL || defaultAvatar}
            alt="User Avatar"
            className="w-10 h-10 rounded-full border border-gray-300 mx-1"
          />
        </>
      )}
    </div>
  );
}

export default ThreadLobby;
