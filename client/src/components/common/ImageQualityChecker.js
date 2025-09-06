import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import { analyzeImage, getQualityText, getQualityColor, BLUR_CONFIG } from '../../utils/imageQualityChecker';

const ImageQualityChecker = ({ 
  imageUrl, 
  onQualityCheck, 
  showDetails = false,
  threshold = BLUR_CONFIG.threshold,
  className = ''
}) => {
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [showDetailsState, setShowDetailsState] = useState(showDetails);

  useEffect(() => {
    if (imageUrl) {
      analyzeImageQuality();
    }
  }, [imageUrl, threshold]);

  const analyzeImageQuality = async () => {
    if (!imageUrl) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const result = await analyzeImage(imageUrl, threshold);
      setAnalysis(result);
      
      // Call the callback with the result
      if (onQualityCheck) {
        onQualityCheck(result);
      }
    } catch (err) {
      setError(err.message);
      console.error('Image quality analysis failed:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getQualityIcon = () => {
    if (isAnalyzing) {
      return <Loader2 className="w-4 h-4 animate-spin" />;
    }
    
    if (error) {
      return <AlertTriangle className="w-4 h-4 text-red-500" />;
    }
    
    if (analysis) {
      return analysis.isBlurry ? 
        <AlertTriangle className="w-4 h-4 text-yellow-500" /> : 
        <CheckCircle className="w-4 h-4 text-green-500" />;
    }
    
    return null;
  };

  const getQualityBadge = () => {
    if (isAnalyzing) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
          <Loader2 className="w-3 h-3 animate-spin mr-1" />
          Analyzing...
        </span>
      );
    }
    
    if (error) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-600">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Error
        </span>
      );
    }
    
    if (analysis) {
      const colorClass = analysis.isBlurry ? 'bg-yellow-100 text-yellow-600' : 'bg-green-100 text-green-600';
      const icon = analysis.isBlurry ? <AlertTriangle className="w-3 h-3 mr-1" /> : <CheckCircle className="w-3 h-3 mr-1" />;
      
      return (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
          {icon}
          {analysis.isBlurry ? 'Blurry' : 'Sharp'}
        </span>
      );
    }
    
    return null;
  };

  if (!imageUrl) {
    return null;
  }

  return (
    <div className={`image-quality-checker ${className}`}>
      {/* Quality Badge */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          {getQualityIcon()}
          <span className="text-sm font-medium text-gray-700">Image Quality</span>
        </div>
        
        <div className="flex items-center space-x-2">
          {getQualityBadge()}
          {analysis && (
            <button
              type="button"
              onClick={() => setShowDetailsState(!showDetailsState)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              title={showDetailsState ? 'Hide details' : 'Show details'}
            >
              {showDetailsState ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* Quality Assessment */}
      {analysis && (
        <div className="text-sm">
          <p className={`font-medium ${getQualityColor(analysis.blurScore, threshold)}`}>
            {getQualityText(analysis.blurScore, threshold)}
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="text-sm text-red-600">
          <p>Failed to analyze image quality: {error}</p>
        </div>
      )}

      {/* Detailed Analysis */}
      {showDetailsState && analysis && (
        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Analysis Details</h4>
          <div className="space-y-1 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>Blur Score:</span>
              <span className="font-mono">{analysis.blurScore}</span>
            </div>
            <div className="flex justify-between">
              <span>Threshold:</span>
              <span className="font-mono">{analysis.threshold}</span>
            </div>
            <div className="flex justify-between">
              <span>Quality:</span>
              <span className="capitalize">{analysis.quality}</span>
            </div>
            <div className="flex justify-between">
              <span>Status:</span>
              <span className={analysis.isBlurry ? 'text-yellow-600' : 'text-green-600'}>
                {analysis.isBlurry ? 'Needs Improvement' : 'Good'}
              </span>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Sharpness</span>
              <span>{Math.round((analysis.blurScore / (threshold * 2)) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  analysis.isBlurry ? 'bg-yellow-400' : 'bg-green-400'
                }`}
                style={{ 
                  width: `${Math.min(100, Math.max(0, (analysis.blurScore / (threshold * 2)) * 100))}%` 
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageQualityChecker;