/**
 * Image Quality Checker Utility
 * Provides blur detection functionality using Laplacian variance algorithm
 */

/**
 * Calculate the Laplacian variance of an image to detect blur
 * Higher variance indicates sharper image, lower variance indicates blur
 * @param {HTMLImageElement} image - The image element to analyze
 * @param {number} threshold - Blur threshold (default: 100)
 * @returns {Promise<Object>} - Object containing blur score and isBlurry boolean
 */
export const detectBlur = async (image, threshold = 100) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size to image size
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    
    // Draw image to canvas
    ctx.drawImage(image, 0, 0);
    
    // Get image data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // Convert to grayscale and calculate Laplacian variance
    const grayData = [];
    for (let i = 0; i < data.length; i += 4) {
      // Convert RGB to grayscale using luminance formula
      const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      grayData.push(gray);
    }
    
    // Calculate Laplacian variance
    let variance = 0;
    let mean = 0;
    const laplacianValues = [];
    
    // Calculate mean
    for (let i = 0; i < grayData.length; i++) {
      mean += grayData[i];
    }
    mean /= grayData.length;
    
    // Calculate Laplacian values and variance
    for (let y = 1; y < canvas.height - 1; y++) {
      for (let x = 1; x < canvas.width - 1; x++) {
        const idx = y * canvas.width + x;
        
        // Laplacian kernel: [[0, -1, 0], [-1, 4, -1], [0, -1, 0]]
        const laplacian = 
          grayData[idx] * 4 - 
          grayData[idx - canvas.width] - 
          grayData[idx + canvas.width] - 
          grayData[idx - 1] - 
          grayData[idx + 1];
        
        laplacianValues.push(laplacian);
        variance += Math.pow(laplacian - mean, 2);
      }
    }
    
    variance /= laplacianValues.length;
    
    // Determine if image is blurry
    const isBlurry = variance < threshold;
    const blurScore = Math.round(variance);
    
    resolve({
      blurScore,
      isBlurry,
      threshold,
      quality: isBlurry ? 'blurry' : 'sharp'
    });
  });
};

/**
 * Analyze multiple images for blur detection
 * @param {Array} images - Array of image objects with url property
 * @param {number} threshold - Blur threshold
 * @returns {Promise<Array>} - Array of analysis results
 */
export const analyzeImages = async (images, threshold = 100) => {
  const results = [];
  
  for (const imageObj of images) {
    try {
      const result = await analyzeImage(imageObj.url, threshold);
      results.push({
        ...imageObj,
        blurAnalysis: result
      });
    } catch (error) {
      console.error('Error analyzing image:', error);
      results.push({
        ...imageObj,
        blurAnalysis: {
          blurScore: 0,
          isBlurry: true,
          threshold,
          quality: 'error',
          error: error.message
        }
      });
    }
  }
  
  return results;
};

/**
 * Analyze a single image URL for blur detection
 * @param {string} imageUrl - URL of the image to analyze
 * @param {number} threshold - Blur threshold
 * @returns {Promise<Object>} - Analysis result
 */
export const analyzeImage = async (imageUrl, threshold = 100) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = async () => {
      try {
        const result = await detectBlur(img, threshold);
        resolve(result);
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    
    img.src = imageUrl;
  });
};

/**
 * Get quality assessment text based on blur score
 * @param {number} blurScore - The blur score from analysis
 * @param {number} threshold - The threshold used
 * @returns {string} - Quality assessment text
 */
export const getQualityText = (blurScore, threshold = 100) => {
  if (blurScore < threshold * 0.5) {
    return 'Very blurry - Please upload a clearer image';
  } else if (blurScore < threshold) {
    return 'Somewhat blurry - Consider uploading a sharper image';
  } else if (blurScore < threshold * 1.5) {
    return 'Good quality';
  } else {
    return 'Excellent quality';
  }
};

/**
 * Get quality color class for UI display
 * @param {number} blurScore - The blur score from analysis
 * @param {number} threshold - The threshold used
 * @returns {string} - CSS class name
 */
export const getQualityColor = (blurScore, threshold = 100) => {
  if (blurScore < threshold * 0.5) {
    return 'text-red-600';
  } else if (blurScore < threshold) {
    return 'text-yellow-600';
  } else if (blurScore < threshold * 1.5) {
    return 'text-green-600';
  } else {
    return 'text-green-700';
  }
};

/**
 * Default blur detection configuration
 */
export const BLUR_CONFIG = {
  threshold: 100,
  minImageSize: 100, // Minimum image dimensions
  maxImageSize: 4000, // Maximum image dimensions
  supportedFormats: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
};