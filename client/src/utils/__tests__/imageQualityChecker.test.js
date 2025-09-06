/**
 * Tests for Image Quality Checker Utility
 * Note: These tests require a browser environment with Canvas API
 */

import { detectBlur, getQualityText, getQualityColor, BLUR_CONFIG } from '../imageQualityChecker';

// Mock image for testing
const createMockImage = (width = 100, height = 100) => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  
  // Create a simple gradient pattern
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#ff0000');
  gradient.addColorStop(1, '#0000ff');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  return canvas;
};

describe('Image Quality Checker', () => {
  describe('detectBlur', () => {
    test('should return analysis result with blur score', async () => {
      const mockImage = createMockImage();
      const result = await detectBlur(mockImage);
      
      expect(result).toHaveProperty('blurScore');
      expect(result).toHaveProperty('isBlurry');
      expect(result).toHaveProperty('threshold');
      expect(result).toHaveProperty('quality');
      expect(typeof result.blurScore).toBe('number');
      expect(typeof result.isBlurry).toBe('boolean');
    });

    test('should use custom threshold when provided', async () => {
      const mockImage = createMockImage();
      const customThreshold = 50;
      const result = await detectBlur(mockImage, customThreshold);
      
      expect(result.threshold).toBe(customThreshold);
    });
  });

  describe('getQualityText', () => {
    test('should return appropriate text for different blur scores', () => {
      const threshold = 100;
      
      expect(getQualityText(30, threshold)).toContain('Very blurry');
      expect(getQualityText(70, threshold)).toContain('Somewhat blurry');
      expect(getQualityText(120, threshold)).toContain('Good quality');
      expect(getQualityText(200, threshold)).toContain('Excellent quality');
    });
  });

  describe('getQualityColor', () => {
    test('should return appropriate color classes for different blur scores', () => {
      const threshold = 100;
      
      expect(getQualityColor(30, threshold)).toBe('text-red-600');
      expect(getQualityColor(70, threshold)).toBe('text-yellow-600');
      expect(getQualityColor(120, threshold)).toBe('text-green-600');
      expect(getQualityColor(200, threshold)).toBe('text-green-700');
    });
  });

  describe('BLUR_CONFIG', () => {
    test('should have required configuration properties', () => {
      expect(BLUR_CONFIG).toHaveProperty('threshold');
      expect(BLUR_CONFIG).toHaveProperty('minImageSize');
      expect(BLUR_CONFIG).toHaveProperty('maxImageSize');
      expect(BLUR_CONFIG).toHaveProperty('supportedFormats');
      expect(Array.isArray(BLUR_CONFIG.supportedFormats)).toBe(true);
    });
  });
});