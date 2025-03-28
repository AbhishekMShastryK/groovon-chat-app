import React from 'react';

const GroupsSidebar = ({
  currentGroup,
  setCurrentGroup,
  sidebarOpen = false,
  setSidebarOpen = () => {},
}) => {
  const groups = [
    { id: 'general', name: 'General' },
    // In future, you can add more groups here.
  ];

  return (
    <>
      {/* 
        1) Dark background overlay (mobile only):
           - Visible only if sidebarOpen === true
           - Hidden on md+ (desktop) 
      */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden ${
          sidebarOpen ? 'block' : 'hidden'
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      {/*
        2) The sidebar itself:
           - "fixed" on small screens so it can slide in/out
           - "md:static" on desktop so it's pinned in place
           - We toggle translateX based on sidebarOpen
           - On md+ screens, it's always visible (translate-x-0)
      */}
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
        <h2 className="text-lg font-bold mb-4">Groups</h2>
        <ul>
          {groups.map((group) => (
            <li key={group.id}>
              <button
                onClick={() => {
                  setCurrentGroup(group.id);
                  setSidebarOpen(false); // close drawer on mobile
                }}
                className={`w-full text-left px-3 py-2 rounded-md transition-colors duration-200 ${
                  currentGroup === group.id
                    ? 'bg-[#af7ac5] text-white'
                    : 'hover:bg-gray-200'
                }`}
              >
                {group.name}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default GroupsSidebar;
