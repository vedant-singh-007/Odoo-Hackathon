import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Home, ArrowLeft, Search } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <>
      <Helmet>
        <title>Page Not Found - EcoFinds</title>
        <meta name="description" content="The page you're looking for doesn't exist on EcoFinds." />
      </Helmet>

      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full text-center">
          {/* 404 Illustration */}
          <div className="mb-8">
            <div className="text-8xl font-bold text-primary-600 mb-4">404</div>
            <div className="w-32 h-32 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-16 h-16 text-primary-600" />
            </div>
          </div>

          {/* Error Message */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Oops! Page Not Found
            </h1>
            <p className="text-lg text-gray-600 mb-2">
              The page you're looking for seems to have wandered off into the digital void.
            </p>
            <p className="text-gray-500">
              Don't worry, even the most eco-friendly websites have their mysteries!
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/"
                className="btn-primary btn-lg flex items-center justify-center space-x-2"
              >
                <Home className="w-5 h-5" />
                <span>Go Home</span>
              </Link>
              
              <button
                onClick={() => window.history.back()}
                className="btn-secondary btn-lg flex items-center justify-center space-x-2"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Go Back</span>
              </button>
            </div>

            <div className="pt-4">
              <Link
                to="/products"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Or browse our products →
              </Link>
            </div>
          </div>

          {/* Fun Facts */}
          <div className="mt-12 p-6 bg-white rounded-xl shadow-soft">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              🌱 Fun Eco-Fact
            </h3>
            <p className="text-gray-600 text-sm">
              Did you know that every second-hand item purchased helps reduce waste and 
              saves approximately 2.5kg of CO₂ emissions? Your sustainable shopping 
              choices make a real difference!
            </p>
          </div>

          {/* Help Section */}
          <div className="mt-8">
            <p className="text-sm text-gray-500 mb-4">
              Still can't find what you're looking for?
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center text-sm">
              <Link
                to="/products"
                className="text-primary-600 hover:text-primary-700"
              >
                Browse Products
              </Link>
              <span className="hidden sm:inline text-gray-300">•</span>
              <Link
                to="/create-product"
                className="text-primary-600 hover:text-primary-700"
              >
                Start Selling
              </Link>
              <span className="hidden sm:inline text-gray-300">•</span>
              <a
                href="mailto:support@ecofinds.com"
                className="text-primary-600 hover:text-primary-700"
              >
                Contact Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotFoundPage;
