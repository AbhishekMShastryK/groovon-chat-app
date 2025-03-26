import React, { useRef, useState, useEffect } from 'react';
import {
  collection,
  query,
  orderBy,
  limit,
  addDoc,
  serverTimestamp,
  doc,
  onSnapshot,
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
  const [messageInput, setMessageInput] = useState(() => localStorage.getItem('unsentMessage') || '');

  // Scroll to bottom when component mounts and when messages change
  useEffect(() => {
    scrollToBottomRef.current?.scrollIntoView({ behavior: 'auto' });
  }, [messages]);

  // Additional effect to ensure scroll to bottom on initial load
  useEffect(() => {
    // Small delay to ensure DOM is fully rendered
    const timer = setTimeout(() => {
      scrollToBottomRef.current?.scrollIntoView({ behavior: 'auto' });
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // Save unsent message to localStorage
  useEffect(() => {
    localStorage.setItem('unsentMessage', messageInput);
  }, [messageInput]);

  useEffect(() => {
    // Fix for iOS viewport height issues when keyboard appears
    const metaViewport = document.querySelector('meta[name=viewport]');
    if (metaViewport) {
      metaViewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0');
    }
    
    // Add event listeners to fix iOS keyboard issues
    document.addEventListener('focusin', () => {
      // When input is focused (keyboard appears)
      window.scrollTo(0, 0);
    });
    
    document.addEventListener('focusout', () => {
      // When input loses focus (keyboard disappears)
      window.scrollTo(0, 0);
    });
    
    return () => {
      document.removeEventListener('focusin', () => {});
      document.removeEventListener('focusout', () => {});
    };
  }, []);

  const handleSendMessage = async () => {
    if (!messageInput.trim()) return;
    
    const { uid } = auth.currentUser;
    const now = new Date();
    
    await addDoc(messagesCollectionRef, {
      text: messageInput,
      createdAt: serverTimestamp(),
      clientTimestamp: now,
      formattedDate: format(now, 'MMMM d, yyyy'),
      uid,
    });
    
    setMessageInput('');
    localStorage.removeItem('unsentMessage');
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
    } else if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault();
      setMessageInput((prev) => prev + '\n');
    }
  };

  const groupMessagesByDate = (messages) => {
    // Same function but we need to reverse the messages since we're getting them in desc order
    const grouped = {};
    
    // If messages is null or empty, return empty object
    if (!messages || messages.length === 0) return grouped;
    
    // Process messages in reverse order (oldest to newest) for display
    const orderedMessages = [...messages].reverse();
    
    orderedMessages.forEach((message) => {
      try {
        // Use pre-formatted date if available
        if (message.formattedDate) {
          grouped[message.formattedDate] = grouped[message.formattedDate] || [];
          grouped[message.formattedDate].push(message);
          return;
        }
        
        // Otherwise use timestamps
        const messageDate = message.createdAt?.toDate() || 
                           (message.clientTimestamp ? new Date(message.clientTimestamp) : new Date());
        
        const isValidDate = messageDate instanceof Date && !isNaN(messageDate);
        const date = isValidDate ? format(messageDate, 'MMMM d, yyyy') : 'Recent';
        
        grouped[date] = grouped[date] || [];
        grouped[date].push(message);
      } catch (error) {
        console.error("Error processing message date:", error);
        grouped['Recent'] = grouped['Recent'] || [];
        grouped['Recent'].push(message);
      }
    });
    
    return grouped;
  };

  const groupedMessages = messages ? groupMessagesByDate(messages) : {};

  return (
    <div className="flex flex-col items-center w-full max-w-full sm:max-w-4xl mx-auto">
      <main className="p-3 sm:p-4 h-[calc(90vh-8rem)] md:h-[calc(95vh-10rem)] w-full overflow-y-scroll flex flex-col scrollbar-thin scrollbar-thumb-purple-600 bg-gray-200 rounded-t-lg shadow-inner">
        {Object.keys(groupedMessages).map((date) => (
          <div key={date}>
            <div className="flex items-center my-3 sm:my-4">
              <hr className="flex-grow border-gray-300" />
              <span className="px-2 sm:px-4 text-gray-500 font-semibold text-xs sm:text-sm">
                {date}
              </span>
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
          className="flex-grow text-sm sm:text-base bg-gray-700 text-white outline-none border-none px-2 sm:px-4 py-2 rounded-lg mr-2 resize-none overflow-y-auto scrollbar-thin scrollbar-thumb-purple-600 scrollbar-track-gray-800"
          style={{ minHeight: '2.5rem', maxHeight: '5rem', overflowY: 'auto', WebkitAppearance: 'none', }}
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
  const { text, uid, createdAt, clientTimestamp } = message;
  const isSent = uid === auth.currentUser.uid;
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [senderName, setSenderName] = useState('');
  
  let time = '';
  try {
    const messageTime = createdAt?.toDate() || 
                       (clientTimestamp ? new Date(clientTimestamp) : new Date());
    
    time = messageTime instanceof Date && !isNaN(messageTime) ? format(messageTime, 'h:mm a') : '';
  } catch (error) {
    console.error("Error formatting message time:", error);
  }
  
  const defaultAvatar = 'https://api.dicebear.com/9.x/pixel-art/svg?seed=Destiny';

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
    <div className={`flex mb-3 sm:mb-4 ${isSent ? 'justify-end' : 'justify-start'}`}>
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

export default ThreadLobby;
