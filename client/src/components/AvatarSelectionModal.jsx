import React from 'react';

const AvatarSelectionModal = ({ avatarNames, onSelect, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-2">
      <div className="bg-white rounded-lg shadow-lg p-4 w-full max-w-md sm:max-w-lg">
        <h2 className="text-lg sm:text-xl font-bold mb-4 text-center">
          Select an Avatar
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {avatarNames.map((name) => {
            const avatarUrl = `https://api.dicebear.com/9.x/pixel-art/svg?seed=${name}`;
            return (
              <button
                key={name}
                className="flex items-center justify-center p-1 rounded-md hover:bg-[#d7bde2] transition-colors duration-200 cursor-pointer"
                onClick={() => onSelect(name)}
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-gray-300 mx-1 flex items-center justify-center bg-white overflow-hidden">
                  <img
                    src={avatarUrl}
                    alt="User Avatar"
                    className="w-8 h-8 sm:w-9 sm:h-9"
                    style={{ objectFit: 'contain' }}
                  />
                </div>
              </button>
            );
          })}
        </div>
        <button
          className="mt-4 w-full bg-gray-700 text-white py-2 rounded-md hover:bg-gray-800 transition-colors duration-200 cursor-pointer text-sm sm:text-base"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default AvatarSelectionModal;
