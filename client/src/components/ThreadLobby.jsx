import React, { useRef, useState, useEffect } from 'react';
import {
  collection,
  query,
  orderBy,
  limit,
  addDoc,
  serverTimestamp,
  where,
} from 'firebase/firestore';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { auth, firestore } from '../../../config/firebase';
import { format } from 'date-fns';
import ThreadMessage from './ThreadMessage';
import EmojiPicker from 'emoji-picker-react';
import { BiSmile } from 'react-icons/bi';
import { BiSolidPaperPlane } from 'react-icons/bi';
import { Filter } from 'bad-words';
import PropTypes from 'prop-types';

function ThreadLobby({ currentGroup }) {
  const scrollToBottomRef = useRef();
  const messagesCollectionRef = collection(firestore, 'messages');

  // Filter messages by currentGroup
  const latestMessagesQuery = query(
    messagesCollectionRef,
    where('group', '==', currentGroup),
    orderBy('createdAt', 'desc'),
    limit(500)
  );

  const [messages] = useCollectionData(latestMessagesQuery, {
    idField: 'id',
  });

  const [messageInput, setMessageInput] = useState(
    () => localStorage.getItem('unsentMessage') || ''
  );
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textareaRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const filter = useRef(new Filter());
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    filter.current.addWords('mf');
    filter.current.removeWords(
      'hell',
      'hells',
      'crap',
      'shoot',
      'piss',
      'damn',
      'sadist',
      'idiot',
      'freak',
      'darn',
      'turd',
      'balls',
      'screwed',
      'moron',
      'loser',
      'bloody'
    );
  }, []);

  useEffect(() => {
    scrollToBottomRef.current?.scrollIntoView({ behavior: 'auto' });
  }, [messages]);

  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToBottomRef.current?.scrollIntoView({ behavior: 'auto' });
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem('unsentMessage', messageInput);
  }, [messageInput]);

  useEffect(() => {
    const metaViewport = document.querySelector('meta[name=viewport]');
    if (metaViewport) {
      metaViewport.setAttribute(
        'content',
        'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0'
      );
    }
    document.addEventListener('focusin', () => {
      window.scrollTo(0, 0);
    });
    document.addEventListener('focusout', () => {
      window.scrollTo(0, 0);
    });
    return () => {
      document.removeEventListener('focusin', () => {});
      document.removeEventListener('focusout', () => {});
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target) &&
        event.target.getAttribute('aria-label') !== 'Open emoji picker'
      ) {
        setShowEmojiPicker(false);
      }
    }
    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [showEmojiPicker]);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || isSubmitting) return;
    try {
      setIsSubmitting(true);
      const { uid } = auth.currentUser;
      const now = new Date();
      const filteredText = filter.current.clean(messageInput);
      await addDoc(messagesCollectionRef, {
        text: filteredText,
        createdAt: serverTimestamp(),
        clientTimestamp: now,
        formattedDate: format(now, 'MMMM d, yyyy'),
        uid,
        group: currentGroup, // associate message with the active group
      });
      setMessageInput('');
      localStorage.removeItem('unsentMessage');
    } finally {
      setIsSubmitting(false);
    }
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
    const grouped = {};
    if (!messages || messages.length === 0) return grouped;
    const orderedMessages = [...messages].reverse();
    orderedMessages.forEach((message) => {
      try {
        if (message.formattedDate) {
          grouped[message.formattedDate] = grouped[message.formattedDate] || [];
          grouped[message.formattedDate].push(message);
          return;
        }
        const messageDate =
          message.createdAt?.toDate() ||
          (message.clientTimestamp
            ? new Date(message.clientTimestamp)
            : new Date());
        const isValidDate = messageDate instanceof Date && !isNaN(messageDate);
        const date = isValidDate
          ? format(messageDate, 'MMMM d, yyyy')
          : 'Recent';
        grouped[date] = grouped[date] || [];
        grouped[date].push(message);
      } catch (error) {
        console.error('Error processing message date:', error);
        grouped['Recent'] = grouped['Recent'] || [];
        grouped['Recent'].push(message);
      }
    });
    return grouped;
  };

  const groupedMessages = messages ? groupMessagesByDate(messages) : {};

  const handleEmojiSelect = (emojiData) => {
    const cursorPosition = textareaRef.current.selectionStart;
    const newText =
      messageInput.substring(0, cursorPosition) +
      emojiData.emoji +
      messageInput.substring(cursorPosition);
    setMessageInput(newText);
    setShowEmojiPicker(false);
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const newPosition = cursorPosition + emojiData.emoji.length;
        textareaRef.current.setSelectionRange(newPosition, newPosition);
      }
    }, 0);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-full sm:max-w-4xl mx-auto relative">
      <main className="p-3 sm:p-4 h-[calc(90vh-8rem)] md:h-[calc(95vh-10rem)] w-full overflow-y-scroll flex flex-col scrollbar-thin scrollbar-thumb-purple-600 bg-gray-200 rounded-t-lg shadow-inner">
        {Object.keys(groupedMessages).length === 0 ? (
          <div className="flex-grow flex items-center justify-center font-bold italic text-lg text-gray-500">
            No messages yet
          </div>
        ) : (
          Object.keys(groupedMessages).map((date) => (
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
          ))
        )}
        <span ref={scrollToBottomRef}></span>
      </main>

      <form
        onSubmit={(e) => e.preventDefault()}
        className="flex items-center w-full h-auto rounded-b-lg shadow-lg px-2 sm:px-4 py-2 bg-gray-900 relative"
      >
        {showEmojiPicker && (
          <div
            ref={emojiPickerRef}
            className="absolute bottom-full left-0 mb-2 z-10"
          >
            <EmojiPicker
              onEmojiClick={handleEmojiSelect}
              searchDisabled={false}
              autoFocusSearch={false}
              width={300}
              height={400}
              previewConfig={{ showPreview: false }}
              skinTonesDisabled={window.innerWidth < 768}
              lazyLoadEmojis={true}
              emojiStyle="native"
            />
          </div>
        )}

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()} // Prevents focus shift
          onClick={() => {
            if (textareaRef.current) {
              textareaRef.current.blur(); // Ensure the textarea isn't focused
            }
            setShowEmojiPicker((prev) => !prev);
          }}
          className="mr-2 text-white p-1 rounded-full hover:bg-gray-700 transition-colors duration-300 flex items-center justify-center cursor-pointer"
          aria-label="Open emoji picker"
        >
          <BiSmile size={24} />
        </button>

        <textarea
          ref={textareaRef}
          value={messageInput}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Write a message..."
          className="flex-grow text-sm sm:text-base bg-gray-700 text-white outline-none border-none px-2 sm:px-4 py-2 rounded-lg mr-3 resize-none overflow-y-auto scrollbar-thin scrollbar-thumb-purple-600 scrollbar-track-gray-800"
          style={{
            minHeight: '2.5rem',
            maxHeight: '5rem',
            overflowY: 'auto',
            WebkitAppearance: 'none',
          }}
        />

        <button
          className={`bg-[#af7ac5] hover:bg-[#9b59b6] text-white font-bold py-2 px-3 sm:px-4 rounded-lg transition duration-300 flex justify-center items-center ${
            !messageInput || isSubmitting
              ? 'opacity-50 pointer-events-none'
              : 'cursor-pointer'
          }`}
          type="button"
          onClick={handleSendMessage}
          disabled={!messageInput || isSubmitting}
        >
          <BiSolidPaperPlane size={24} />
        </button>
      </form>
    </div>
  );
}

ThreadLobby.propTypes = {
  currentGroup: PropTypes.string.isRequired,
};

export default ThreadLobby;
