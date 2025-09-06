import React from 'react';
import { AlertTriangle, Upload, X, RefreshCw } from 'lucide-react';

const BlurryImageModal = ({ 
  isOpen, 
  onClose, 
  onRetake, 
  blurryImages = [], 
  onRemoveBlurry,
  onKeepAnyway 
}) => {
  if (!isOpen) return null;

  const handleRetake = () => {
    onRetake();
    onClose();
  };

  const handleRemoveBlurry = () => {
    if (onRemoveBlurry) {
      onRemoveBlurry();
    }
    onClose();
  };

  const handleKeepAnyway = () => {
    if (onKeepAnyway) {
      onKeepAnyway();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Blurry Images Detected
              </h3>
              <p className="text-sm text-gray-600">
                We found {blurryImages.length} image{blurryImages.length > 1 ? 's' : ''} that may be blurry
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6">
            <p className="text-gray-700 mb-4">
              Clear, high-quality images help buyers make better decisions and can increase your chances of making a sale. 
              We recommend uploading sharper images for the best results.
            </p>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <div className="flex">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-yellow-800 mb-1">
                    Tips for Better Images
                  </h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Ensure good lighting when taking photos</li>
                    <li>• Hold your camera steady or use a tripod</li>
                    <li>• Focus on the main subject of the photo</li>
                    <li>• Avoid taking photos in low light conditions</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Blurry Images List */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">
              Images that may need improvement:
            </h4>
            <div className="space-y-3">
              {blurryImages.map((image, index) => (
                <div key={image.id || index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={image.url}
                      alt={`Blurry image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      Image {index + 1}
                    </p>
                    <p className="text-xs text-gray-500">
                      Blur Score: {image.blurAnalysis?.blurScore || 'N/A'}
                    </p>
                    <p className="text-xs text-yellow-600">
                      {image.blurAnalysis?.quality === 'blurry' ? 'Needs improvement' : 'Quality issue detected'}
                    </p>
                  </div>
                  <button
                    onClick={() => onRemoveBlurry && onRemoveBlurry(image.id)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                    title="Remove this image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex space-x-3">
            <button
              onClick={handleRetake}
              className="btn-primary flex items-center space-x-2"
            >
              <Upload className="w-4 h-4" />
              <span>Retake Photos</span>
            </button>
            
            <button
              onClick={handleRemoveBlurry}
              className="btn-secondary flex items-center space-x-2"
            >
              <X className="w-4 h-4" />
              <span>Remove Blurry Images</span>
            </button>
          </div>
          
          <button
            onClick={handleKeepAnyway}
            className="text-gray-600 hover:text-gray-800 transition-colors flex items-center space-x-2"
          >
            <span>Keep Anyway</span>
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BlurryImageModal;