import React from 'react';
import { Leaf } from 'lucide-react';

const LoadingScreen = () => {
  return (
    <div className="min-h-screen bg-gradient-eco flex flex-col items-center justify-center">
      <div className="text-center">
        {/* Logo Animation */}
        <div className="mb-8">
          <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-large animate-bounce-gentle">
            <Leaf className="w-10 h-10 text-primary-600" />
          </div>
        </div>

        {/* Loading Text */}
        <h1 className="text-3xl font-bold text-white font-display mb-2">
          EcoFinds
        </h1>
        <p className="text-white/80 text-lg mb-8">
          Sustainable Marketplace
        </p>

        {/* Loading Spinner */}
        <div className="flex justify-center">
          <div className="w-8 h-8 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
        </div>

        {/* Loading Message */}
        <p className="text-white/60 text-sm mt-4">
          Loading your eco-friendly experience...
        </p>
      </div>

      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/5 rounded-full"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/5 rounded-full"></div>
      </div>
    </div>
  );
};

export default LoadingScreen;
