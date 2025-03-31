import React, { useState, useEffect } from 'react';
import { BsFillInfoCircleFill } from 'react-icons/bs';
import PropTypes from 'prop-types';

const GroupsSidebar = ({
  currentGroup,
  setCurrentGroup,
  sidebarOpen = false,
  setSidebarOpen = () => {},
}) => {
  const [activeTooltip, setActiveTooltip] = useState(null);

  const groups = [
    {
      id: 'random',
      name: 'Random Talks',
      description: 'A place for casual and off-topic conversations.',
    },
    {
      id: 'tech',
      name: 'Tech & Gadgets',
      description:
        'From AI to the telegraph—where past meets future in every chat.',
    },
    {
      id: 'manga',
      name: 'Manga & Anime Zone',
      description:
        'Connect with fellow fans and explore the world of manga and anime.',
    },
    {
      id: 'movies',
      name: 'Movie Buffs',
      description:
        'Discuss the latest releases, timeless classics, and everything in between.',
    },
    {
      id: 'food',
      name: 'Foodies Unite',
      description:
        'Talk about recipes, cravings, restaurants, and all things delicious.',
    },
    {
      id: 'travel',
      name: 'World Explorers',
      description:
        'Share travel experiences, dream destinations, and travel tips.',
    },
    {
      id: 'memes',
      name: 'Meme Central',
      description: 'Laugh, share, and scroll through endless humor and memes.',
    },
    {
      id: 'music',
      name: 'Music Lounge',
      description:
        'Discover, share, and vibe to music from all around the world.',
    },
    {
      id: 'books',
      name: 'Book Corner',
      description:
        'For readers to share book recommendations, reviews, and discussions.',
    },
    {
      id: 'life',
      name: 'Life & Chill',
      description:
        'Talk about daily life, relationships, and everything that’s on your mind.',
    },
    {
      id: 'gaming',
      name: 'Games & Gamers',
      description:
        'Chat about games, strategies, and your favorite in-game moments.',
    },
    // In future, can add more groups here.
  ];

  // Toggle tooltip visibility on info icon click.
  const toggleTooltip = (groupId, e) => {
    e.stopPropagation(); // Prevent click from bubbling up.
    setActiveTooltip((prev) => (prev === groupId ? null : groupId));
  };

  // Document click handler: hides the tooltip when user clicks anywhere.
  useEffect(() => {
    if (activeTooltip !== null) {
      const handleDocumentClick = () => {
        setActiveTooltip(null);
      };

      document.addEventListener('click', handleDocumentClick);
      return () => {
        document.removeEventListener('click', handleDocumentClick);
      };
    }
  }, [activeTooltip]);

  return (
    <>
      {/* Dark background overlay (mobile only) */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden ${sidebarOpen ? 'block' : 'hidden'}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <div
        className={`
          flex-shrink-0
          w-48
          bg-gray-100 border-r border-gray-300 p-4
          z-50
          transform transition-transform duration-300
          fixed inset-y-0 left-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:static md:block
        `}
      >
        <div className="px-3 py-2 border-b border-gray-300">
          <h2 className="text-lg font-bold">Groups</h2>
        </div>
        <ul>
          {groups.map((group) => (
            <li
              key={group.id}
              className="relative group border-b border-gray-300 last:border-0"
            >
              <button
                onClick={() => {
                  setCurrentGroup(group.id);
                  setSidebarOpen(false);
                  setActiveTooltip(null);
                }}
                className={`
                  w-full text-left px-3 py-2 rounded-md transition-colors duration-200 ${
                    currentGroup === group.id
                      ? 'bg-[#af7ac5] text-white'
                      : 'hover:bg-gray-200 cursor-pointer'
                  }
                `}
              >
                <div className="flex justify-between items-center">
                  <span className="text-base">{group.name}</span>
                  {/* Mobile info icon: always visible */}
                  <BsFillInfoCircleFill
                    className="md:hidden ml-2 text-gray-600 cursor-pointer flex-none"
                    size={16}
                    onClick={(e) => toggleTooltip(group.id, e)}
                  />
                  {/* Desktop info icon: appears on hover */}
                  <BsFillInfoCircleFill
                    className="hidden md:inline-block md:group-hover:inline-block ml-2 text-gray-600 cursor-pointer flex-none"
                    size={16}
                    onMouseEnter={() => setActiveTooltip(group.id)}
                    onMouseLeave={() => setActiveTooltip(null)}
                  />
                </div>
              </button>
              {activeTooltip === group.id && (
                <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 w-48 p-3 bg-black text-white text-sm rounded z-50">
                  {group.description}
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

GroupsSidebar.propTypes = {
  currentGroup: PropTypes.string.isRequired,
  setCurrentGroup: PropTypes.func.isRequired,
  sidebarOpen: PropTypes.bool,
  setSidebarOpen: PropTypes.func,
};

export default GroupsSidebar;
