import React from 'react';

const AvatarSelectionModal = ({ avatarNames, onSelect, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-4 w-[90vw] max-w-md">
        <h2 className="text-lg font-bold mb-4">Select an Avatar</h2>
        <div className="grid grid-cols-3 gap-2">
          {avatarNames.map((name) => {
            const avatarUrl = `https://api.dicebear.com/9.x/pixel-art/svg?seed=${name}`;
            return (
              <button
                key={name}
                className="flex items-center justify-center p-1 rounded-md hover:bg-[#d7bde2] transition-colors duration-200 cursor-pointer"
                onClick={() => onSelect(name)}
              >
                <div className="w-12 h-12 rounded-full border border-gray-300 mx-1 flex items-center justify-center bg-white overflow-hidden">
          <img
            src={avatarUrl}
            alt="User Avatar"
            className="w-9 h-9"
            style={{ objectFit: 'contain' }}
          />
        </div>
              </button>
            );
          })}
        </div>
        <button
          className="mt-4 w-full bg-gray-700 text-white py-2 rounded-md hover:bg-gray-800 transition-colors duration-200 cursor-pointer"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default AvatarSelectionModal;