import { useState, useEffect } from 'react';

interface ViewportInfo {
  isInIframe: boolean;
  iframeWidth: number;
  iframeHeight: number;
  effectiveBreakpoint: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export const useIframeViewport = (): ViewportInfo => {
  const [viewportInfo, setViewportInfo] = useState<ViewportInfo>({
    isInIframe: false,
    iframeWidth: 0,
    iframeHeight: 0,
    effectiveBreakpoint: 'lg'
  });

  useEffect(() => {
    // Detect if we're in an iframe
    const isInIframe = window.self !== window.top;
    
    // Get iframe dimensions
    const getIframeDimensions = () => {
      if (isInIframe) {
        // When in iframe, use the iframe's actual dimensions
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        // Determine effective breakpoint based on iframe width
        let effectiveBreakpoint: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'lg';
        if (width < 480) effectiveBreakpoint = 'xs';
        else if (width < 640) effectiveBreakpoint = 'sm';
        else if (width < 768) effectiveBreakpoint = 'md';
        else if (width < 1024) effectiveBreakpoint = 'lg';
        else effectiveBreakpoint = 'xl';
        
        return { width, height, effectiveBreakpoint };
      } else {
        // When not in iframe, use standard viewport
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        let effectiveBreakpoint: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'lg';
        if (width < 480) effectiveBreakpoint = 'xs';
        else if (width < 640) effectiveBreakpoint = 'sm';
        else if (width < 768) effectiveBreakpoint = 'md';
        else if (width < 1024) effectiveBreakpoint = 'lg';
        else effectiveBreakpoint = 'xl';
        
        return { width, height, effectiveBreakpoint };
      }
    };

    const updateViewport = () => {
      const { width, height, effectiveBreakpoint } = getIframeDimensions();
      
      // Debug logging
      console.log('Iframe Viewport Update:', {
        isInIframe,
        width,
        height,
        effectiveBreakpoint,
        windowInnerWidth: window.innerWidth,
        windowInnerHeight: window.innerHeight
      });
      
      setViewportInfo({
        isInIframe,
        iframeWidth: width,
        iframeHeight: height,
        effectiveBreakpoint
      });
    };

    // Initial update with a small delay to ensure proper initialization
    const initialTimeout = setTimeout(() => {
      updateViewport();
    }, 100);

    // Listen for resize events
    const handleResize = () => {
      updateViewport();
    };

    window.addEventListener('resize', handleResize);
    
    // For iframes, also listen for parent window resize (if possible)
    if (isInIframe) {
      // Try to listen for parent resize events
      try {
        window.parent.addEventListener('resize', handleResize);
      } catch (e) {
        // Cross-origin restrictions might prevent this
        console.log('Cannot access parent window resize events due to cross-origin restrictions');
      }
    }

    return () => {
      clearTimeout(initialTimeout);
      window.removeEventListener('resize', handleResize);
      if (isInIframe) {
        try {
          window.parent.removeEventListener('resize', handleResize);
        } catch (e) {
          // Ignore cross-origin errors
        }
      }
    };
  }, []);

  return viewportInfo;
};
