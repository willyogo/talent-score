import { useState, useEffect } from 'react';

interface SimpleResponsiveClasses {
  // Grid classes
  gridCols: string;
  gridGap: string;
  
  // Typography classes
  titleSize: string;
  subtitleSize: string;
  bodySize: string;
  scoreSize: string;
  
  // Spacing classes
  containerPadding: string;
  sectionSpacing: string;
  cardPadding: string;
  
  // Component specific
  searchInputPadding: string;
  searchIconSize: string;
  avatarSize: string;
  socialButtonSize: string;
  
  // Layout adjustments
  maxHeight: string;
  isCompact: boolean;
}

export const useSimpleResponsive = (): SimpleResponsiveClasses => {
  const [windowWidth, setWindowWidth] = useState(0);
  
  useEffect(() => {
    const updateWidth = () => {
      setWindowWidth(window.innerWidth);
    };
    
    // Initial update
    updateWidth();
    
    // Listen for resize events
    window.addEventListener('resize', updateWidth);
    
    return () => {
      window.removeEventListener('resize', updateWidth);
    };
  }, []);
  
  // Use CSS media query breakpoints
  if (windowWidth <= 480) {
    return {
      gridCols: 'grid-cols-2',
      gridGap: 'gap-1.5',
      titleSize: 'text-lg',
      subtitleSize: 'text-xs',
      bodySize: 'text-xs',
      scoreSize: 'text-base',
      containerPadding: 'p-2',
      sectionSpacing: 'space-y-2',
      cardPadding: 'px-2 py-2',
      searchInputPadding: 'pl-6 pr-2 py-2',
      searchIconSize: 'w-3.5 h-3.5',
      avatarSize: 'w-6 h-6',
      socialButtonSize: 'w-7 h-7',
      maxHeight: 'max-h-32',
      isCompact: true
    };
  } else if (windowWidth <= 640) {
    return {
      gridCols: 'grid-cols-2',
      gridGap: 'gap-2',
      titleSize: 'text-xl',
      subtitleSize: 'text-xs',
      bodySize: 'text-sm',
      scoreSize: 'text-lg',
      containerPadding: 'p-3',
      sectionSpacing: 'space-y-3',
      cardPadding: 'px-3 py-2.5',
      searchInputPadding: 'pl-8 pr-3 py-2.5',
      searchIconSize: 'w-4 h-4',
      avatarSize: 'w-8 h-8',
      socialButtonSize: 'w-8 h-8',
      maxHeight: 'max-h-48',
      isCompact: true
    };
  } else if (windowWidth <= 768) {
    return {
      gridCols: 'grid-cols-3',
      gridGap: 'gap-2.5',
      titleSize: 'text-2xl',
      subtitleSize: 'text-sm',
      bodySize: 'text-sm',
      scoreSize: 'text-xl',
      containerPadding: 'p-4',
      sectionSpacing: 'space-y-4',
      cardPadding: 'px-3 py-3',
      searchInputPadding: 'pl-9 pr-4 py-3',
      searchIconSize: 'w-4 h-4',
      avatarSize: 'w-9 h-9',
      socialButtonSize: 'w-9 h-9',
      maxHeight: 'max-h-64',
      isCompact: false
    };
  } else {
    return {
      gridCols: 'grid-cols-4',
      gridGap: 'gap-3',
      titleSize: 'text-3xl',
      subtitleSize: 'text-sm',
      bodySize: 'text-sm',
      scoreSize: 'text-2xl',
      containerPadding: 'p-4',
      sectionSpacing: 'space-y-4',
      cardPadding: 'px-4 py-3',
      searchInputPadding: 'pl-10 pr-4 py-3',
      searchIconSize: 'w-5 h-5',
      avatarSize: 'w-10 h-10',
      socialButtonSize: 'w-10 h-10',
      maxHeight: 'max-h-96',
      isCompact: false
    };
  }
};
