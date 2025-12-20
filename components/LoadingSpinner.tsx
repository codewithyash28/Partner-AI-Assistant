
import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
      <p className="text-gray-600 animate-pulse font-medium">Architecting your solution with Gemini...</p>
    </div>
  );
};

export default LoadingSpinner;
