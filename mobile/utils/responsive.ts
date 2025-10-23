import { Dimensions, PixelRatio } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Device size categories
export const isSmallDevice = screenWidth < 375; // iPhone SE, small Android
export const isMediumDevice = screenWidth >= 375 && screenWidth < 414; // iPhone 12, 13
export const isLargeDevice = screenWidth >= 414; // iPhone 12 Pro Max, large Android
export const isTablet = screenWidth >= 768; // iPad, Android tablets

// Responsive dimensions
export const getResponsiveDimensions = () => {
    const baseWidth = 375; // iPhone X base width
    const scale = screenWidth / baseWidth;

    return {
        screenWidth,
        screenHeight,
        scale,
        isSmallDevice,
        isMediumDevice,
        isLargeDevice,
        isTablet,
    };
};

// Responsive font sizes
export const getResponsiveFontSize = (baseSize: number): number => {
    const { scale } = getResponsiveDimensions();
    const newSize = baseSize * scale;
    return Math.max(12, Math.round(PixelRatio.roundToNearestPixel(newSize)));
};

// Responsive padding/margins
export const getResponsivePadding = (basePadding: number): number => {
    const { scale } = getResponsiveDimensions();
    return Math.round(basePadding * scale);
};

// Responsive grid columns based on screen size
export const getGridColumns = (): number => {
    if (isTablet) return 3;
    if (isLargeDevice) return 2;
    if (isMediumDevice) return 2;
    return 1; // Small devices get single column
};

// Responsive card width
export const getCardWidth = (): string => {
    if (isTablet) return '30%';
    if (isLargeDevice) return '45%';
    if (isMediumDevice) return '45%';
    return '100%'; // Small devices get full width
};

// Responsive modal dimensions
export const getModalDimensions = () => {
    if (isTablet) {
        return {
            width: screenWidth * 0.8,
            maxHeight: screenHeight * 0.8,
        };
    }
    return {
        width: screenWidth,
        maxHeight: screenHeight,
    };
};

// Responsive image dimensions
export const getImageDimensions = (baseHeight: number = 200) => {
    const { scale } = getResponsiveDimensions();
    return Math.round(baseHeight * scale);
};

// Responsive button dimensions
export const getButtonDimensions = () => {
    const { scale } = getResponsiveDimensions();
    return {
        paddingHorizontal: Math.round(16 * scale),
        paddingVertical: Math.round(12 * scale),
        fontSize: Math.round(16 * scale),
    };
};
