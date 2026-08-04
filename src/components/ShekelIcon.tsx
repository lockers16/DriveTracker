import React from 'react';

/**
 * Standard New Israeli Shekel (₪) logo vector component,
 * aligned and centered for action buttons and icons.
 */
export const ShekelIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M 20,50 C 20,33.43 33.43,20 50,20 L 80,20 L 80,40 L 50,40 C 44.48,40 40,44.48 40,50 L 40,80 L 20,80 Z M 80,50 C 80,66.57 66.57,80 50,80 L 20,80 L 20,60 L 50,60 C 55.52,60 60,55.52 60,50 L 60,20 L 80,20 Z"
        fillRule="evenodd"
      />
    </svg>
  );
};
