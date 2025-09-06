# Blurry Image Detection Feature

This document describes the blurry image detection feature added to the EcoFinds marketplace application.

## Overview

The blur detection feature automatically analyzes uploaded product images to identify blurry or low-quality images and prompts users to upload clearer images for better product presentation.

## Features

- **Automatic Blur Detection**: Uses Laplacian variance algorithm to detect blur in images
- **Real-time Analysis**: Images are analyzed immediately after upload
- **User-friendly Prompts**: Modal dialog guides users to retake or remove blurry images
- **Quality Indicators**: Visual indicators show image quality status
- **Configurable Thresholds**: Adjustable blur detection sensitivity

## Implementation Details

### Core Components

1. **ImageQualityChecker Utility** (`/client/src/utils/imageQualityChecker.js`)
   - Implements Laplacian variance algorithm for blur detection
   - Provides analysis functions for single and multiple images
   - Includes quality assessment and color coding utilities

2. **ImageQualityChecker Component** (`/client/src/components/common/ImageQualityChecker.js`)
   - React component for displaying image quality analysis
   - Shows quality badges, progress bars, and detailed analysis
   - Configurable display options

3. **BlurryImageModal Component** (`/client/src/components/common/BlurryImageModal.js`)
   - Modal dialog for handling blurry image scenarios
   - Provides options to retake, remove, or keep blurry images
   - Includes helpful tips for better image quality

### Integration Points

- **CreateProductPage**: Integrated blur detection for new product listings
- **EditProductPage**: Integrated blur detection for product updates
- Both pages now include real-time image quality analysis

## Algorithm Details

### Laplacian Variance Method

The blur detection uses the Laplacian variance algorithm:

1. **Image Conversion**: RGB images are converted to grayscale using luminance formula
2. **Laplacian Kernel**: Applied kernel `[[0, -1, 0], [-1, 4, -1], [0, -1, 0]]`
3. **Variance Calculation**: Computes variance of Laplacian values
4. **Threshold Comparison**: Compares variance against configurable threshold

### Quality Assessment

- **Blur Score < 50% of threshold**: Very blurry
- **Blur Score < threshold**: Somewhat blurry  
- **Blur Score < 150% of threshold**: Good quality
- **Blur Score ≥ 150% of threshold**: Excellent quality

## Configuration

### Default Settings

```javascript
const BLUR_CONFIG = {
  threshold: 100,           // Blur detection threshold
  minImageSize: 100,        // Minimum image dimensions
  maxImageSize: 4000,       // Maximum image dimensions
  supportedFormats: [        // Supported image formats
    'image/jpeg', 
    'image/jpg', 
    'image/png', 
    'image/webp'
  ]
};
```

### Customization

The blur detection threshold can be adjusted per component:

```jsx
<ImageQualityChecker
  imageUrl={imageUrl}
  threshold={150}  // Custom threshold
  showDetails={true}
/>
```

## User Experience

### Upload Flow

1. User uploads images
2. Images are automatically analyzed for blur
3. If blurry images are detected, modal appears with options:
   - **Retake Photos**: Clear all images and restart upload
   - **Remove Blurry Images**: Remove only blurry images
   - **Keep Anyway**: Proceed with current images

### Visual Indicators

- **Quality Badges**: Color-coded badges (Sharp/Blurry)
- **Progress Bars**: Visual representation of image sharpness
- **Analysis Details**: Expandable section with technical details
- **Loading States**: Spinner during analysis

## Browser Compatibility

- **Canvas API**: Required for image processing
- **FileReader API**: Required for image upload handling
- **Modern Browsers**: Chrome, Firefox, Safari, Edge (latest versions)

## Performance Considerations

- **Asynchronous Processing**: Image analysis doesn't block UI
- **Efficient Algorithm**: Laplacian variance is computationally lightweight
- **Memory Management**: Proper cleanup of canvas elements
- **Batch Processing**: Multiple images analyzed efficiently

## Testing

Test file included: `/client/src/utils/__tests__/imageQualityChecker.test.js`

Run tests with:
```bash
npm test imageQualityChecker
```

## Future Enhancements

Potential improvements for the blur detection feature:

1. **Advanced Algorithms**: Implement additional blur detection methods
2. **Machine Learning**: Use ML models for more accurate detection
3. **Image Enhancement**: Suggest automatic image improvements
4. **Batch Analysis**: Analyze all images simultaneously
5. **Quality Metrics**: Additional quality indicators (brightness, contrast, etc.)

## Troubleshooting

### Common Issues

1. **Analysis Fails**: Check browser Canvas API support
2. **Slow Performance**: Reduce image size or adjust threshold
3. **False Positives**: Lower threshold for more sensitive detection
4. **False Negatives**: Raise threshold for stricter detection

### Debug Mode

Enable detailed logging by setting:
```javascript
console.log('Blur analysis:', result);
```

## Dependencies

No additional dependencies required. Uses native browser APIs:
- Canvas 2D Context API
- FileReader API
- Image API

## Security Considerations

- **Client-side Processing**: All analysis happens in browser
- **No Server Upload**: Images not sent to server for analysis
- **Privacy**: Image data stays local during analysis
- **CORS**: Handles cross-origin image loading safely