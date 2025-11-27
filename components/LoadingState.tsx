import React from 'react';

export const LoadingState: React.FC = () => {
  return (
    <div className="w-full flex flex-col items-center justify-center py-20 animate-fade-in">
      <div className="relative w-20 h-20 mb-6">
        <div className="absolute top-0 left-0 w-full h-full border-4 border-gray-200 rounded-full"></div>
        <div className="absolute top-0 left-0 w-full h-full border-4 border-festive-red rounded-full border-t-transparent animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center text-2xl animate-pulse">
          🎁
        </div>
      </div>
      <h3 className="text-xl font-medium text-gray-800 mb-2">Finding the best prices...</h3>
      <p className="text-gray-500 text-center max-w-md">
        Scanning online stores for discounts, coupons, and festive offers.
      </p>
    </div>
  );
};
