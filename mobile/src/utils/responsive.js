import React from 'react';
import { Dimensions, Platform, PixelRatio } from 'react-native';

// Get initial dimensions
let { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Listen for dimension changes (orientation changes, window resizing)
Dimensions.addEventListener('change', ({ window }) => {
  SCREEN_WIDTH = window.width;
  SCREEN_HEIGHT = window.height;
});

// Base dimensions (iPhone 11 Pro - 375x812)
const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;

// Device type detection
export const getDeviceType = () => {
  const aspectRatio = SCREEN_HEIGHT / SCREEN_WIDTH;
  const pixelDensity = PixelRatio.get();
  
  if (Platform.OS === 'web') {
    if (SCREEN_WIDTH >= 1024) return 'desktop';
    if (SCREEN_WIDTH >= 768) return 'tablet';
    return 'phone';
  }
  
  // For mobile devices
  if (SCREEN_WIDTH >= 768 || SCREEN_HEIGHT >= 1024) {
    return 'tablet';
  }
  return 'phone';
};

// Check if device is tablet
export const isTablet = () => getDeviceType() === 'tablet';

// Check if device is desktop/laptop
export const isDesktop = () => getDeviceType() === 'desktop';

// Check if device is phone
export const isPhone = () => getDeviceType() === 'phone';

// Check orientation
export const isLandscape = () => SCREEN_WIDTH > SCREEN_HEIGHT;

// Responsive width scaling
export const scaleWidth = (size) => {
  const scale = SCREEN_WIDTH / BASE_WIDTH;
  return Math.round(size * scale);
};

// Responsive height scaling
export const scaleHeight = (size) => {
  const scale = SCREEN_HEIGHT / BASE_HEIGHT;
  return Math.round(size * scale);
};

// Responsive font scaling
export const scaleFont = (size) => {
  const scale = SCREEN_WIDTH / BASE_WIDTH;
  const newSize = size * scale;
  
  if (Platform.OS === 'android') {
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  }
  return Math.round(newSize);
};

// Responsive size (uses width scaling by default)
export const scaleSize = (size) => {
  return scaleWidth(size);
};

// Get responsive padding
export const getResponsivePadding = (basePadding = 16) => {
  if (isTablet()) {
    return basePadding * 1.5;
  }
  if (isDesktop()) {
    return basePadding * 2;
  }
  return basePadding;
};

// Get responsive margin
export const getResponsiveMargin = (baseMargin = 16) => {
  if (isTablet()) {
    return baseMargin * 1.5;
  }
  if (isDesktop()) {
    return baseMargin * 2;
  }
  return baseMargin;
};

// Get responsive font size
export const getResponsiveFontSize = (baseSize) => {
  const deviceType = getDeviceType();
  
  if (deviceType === 'tablet') {
    return scaleFont(baseSize * 1.2);
  }
  if (deviceType === 'desktop') {
    return scaleFont(baseSize * 1.4);
  }
  return scaleFont(baseSize);
};

// Get responsive icon size
export const getResponsiveIconSize = (baseSize = 24) => {
  if (isTablet()) {
    return baseSize * 1.3;
  }
  if (isDesktop()) {
    return baseSize * 1.5;
  }
  return baseSize;
};

// Get responsive button height
export const getResponsiveButtonHeight = (baseHeight = 50) => {
  if (isTablet()) {
    return baseHeight * 1.2;
  }
  if (isDesktop()) {
    return baseHeight * 1.3;
  }
  return baseHeight;
};

// Get number of columns for grid layouts
export const getColumnCount = () => {
  if (isDesktop()) {
    return 3;
  }
  if (isTablet()) {
    return 2;
  }
  return 1;
};

// Get max content width (for centering content on large screens)
export const getMaxContentWidth = () => {
  if (isDesktop()) {
    return 1200;
  }
  if (isTablet()) {
    return 800;
  }
  return SCREEN_WIDTH;
};

// Get responsive header height
export const getResponsiveHeaderHeight = () => {
  if (isTablet()) {
    return 80;
  }
  if (isDesktop()) {
    return 70;
  }
  return 60;
};

// Get responsive tab bar height
export const getResponsiveTabBarHeight = () => {
  if (isTablet()) {
    return 60;
  }
  if (isDesktop()) {
    return 50;
  }
  return 50;
};

// Screen dimensions
export const screenData = {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
  scale: SCREEN_WIDTH / BASE_WIDTH,
  fontScale: PixelRatio.getFontScale(),
};

// Hook to get current screen dimensions (updates on orientation change)
export const useScreenDimensions = () => {
  const [dimensions, setDimensions] = React.useState(Dimensions.get('window'));
  
  React.useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });
    
    return () => subscription?.remove();
  }, []);
  
  return dimensions;
};

export default {
  scaleWidth,
  scaleHeight,
  scaleFont,
  scaleSize,
  getDeviceType,
  isTablet,
  isDesktop,
  isPhone,
  isLandscape,
  getResponsivePadding,
  getResponsiveMargin,
  getResponsiveFontSize,
  getResponsiveIconSize,
  getResponsiveButtonHeight,
  getColumnCount,
  getMaxContentWidth,
  getResponsiveHeaderHeight,
  getResponsiveTabBarHeight,
  screenData,
  useScreenDimensions,
};
