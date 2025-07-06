"use client";

import { useEffect } from 'react';

export function AccessibilityEnhancements() {
  useEffect(() => {
    // Function to add accessibility attributes to Privy iframe
    const enhancePrivyAccessibility = () => {
      // Find Privy iframes and add accessibility attributes
      const privyIframes = document.querySelectorAll('iframe[src*="privy.bonk.computer"], iframe[src*="privy.io"]');
      privyIframes.forEach((iframe) => {
        if (!iframe.getAttribute('title')) {
          iframe.setAttribute('title', 'Privy Wallet Authentication');
          iframe.setAttribute('aria-label', 'Privy embedded wallet authentication interface');
        }
      });

      // Find bonk logo images and add alt text (including hidden ones)
      const bonkImages = document.querySelectorAll('img[src*="bonklogo"], img[src*="bonk"]');
      bonkImages.forEach((img) => {
        if (!img.getAttribute('alt') && !img.getAttribute('title')) {
          img.setAttribute('alt', 'Bonk Computer Logo');
          img.setAttribute('title', 'Bonk Computer Logo');
        }
      });

      // Find computer logo images
      const computerImages = document.querySelectorAll('img[src*="computerlogo"]');
      computerImages.forEach((img) => {
        if (!img.getAttribute('alt') && !img.getAttribute('title')) {
          img.setAttribute('alt', 'Computer Logo');
          img.setAttribute('title', 'Computer Logo');
        }
      });

      // Also check for images with computed style display:none
      const allImages = document.querySelectorAll('img');
      allImages.forEach((img) => {
        const computedStyle = window.getComputedStyle(img);
        const src = img.getAttribute('src') || '';
        
        if (computedStyle.display === 'none' && !img.getAttribute('alt')) {
          if (src.includes('bonk')) {
            img.setAttribute('alt', 'Bonk Computer Logo');
            img.setAttribute('title', 'Bonk Computer Logo');
          } else if (src.includes('computer')) {
            img.setAttribute('alt', 'Computer Logo');
            img.setAttribute('title', 'Computer Logo');
          }
        }
      });

      // Find any other iframes without titles
      const iframes = document.querySelectorAll('iframe:not([title])');
      iframes.forEach((iframe) => {
        const src = iframe.getAttribute('src') || '';
        if (src.includes('privy')) {
          iframe.setAttribute('title', 'Privy Authentication Interface');
          iframe.setAttribute('aria-label', 'Authentication interface for wallet connection');
        } else if (src.includes('birdeye')) {
          iframe.setAttribute('title', 'Birdeye Chart Interface');
          iframe.setAttribute('aria-label', 'Interactive token price chart');
        } else if (src.includes('jup.ag')) {
          iframe.setAttribute('title', 'Jupiter Swap Terminal');
          iframe.setAttribute('aria-label', 'Token swap interface powered by Jupiter');
        } else {
          iframe.setAttribute('title', 'Embedded Content');
          iframe.setAttribute('aria-label', 'Embedded interactive content');
        }
      });

      // Add aria-labels to buttons without them
      const buttons = document.querySelectorAll('button:not([aria-label])');
      buttons.forEach((button) => {
        const buttonText = button.textContent?.trim();
        if (buttonText && !button.getAttribute('aria-label')) {
          button.setAttribute('aria-label', buttonText);
        }
      });
    };

    // Function to handle fetchpriority compatibility
    const handleFetchPriorityCompatibility = () => {
      // Find all link elements with fetchpriority and add data-fetchpriority for Firefox compatibility
      const linksWithFetchPriority = document.querySelectorAll('link[fetchpriority]');
      linksWithFetchPriority.forEach((link) => {
        const fetchPriority = link.getAttribute('fetchpriority');
        if (fetchPriority && !link.getAttribute('data-fetchpriority')) {
          link.setAttribute('data-fetchpriority', fetchPriority);
        }
      });
    };

    // Function to remove deprecated unload event listeners
    const removeDeprecatedUnloadListeners = () => {
      // Override addEventListener to prevent unload event listeners
      const originalAddEventListener = window.addEventListener;
      window.addEventListener = function(type: string, listener: EventListenerOrEventListenerObject | null, options?: boolean | AddEventListenerOptions) {
        if (type === 'unload') {
          console.warn('Unload event listener blocked - deprecated feature');
          return;
        }
        if (listener) {
          return originalAddEventListener.call(this, type, listener, options);
        }
      };
    };

    // Run enhancements immediately
    enhancePrivyAccessibility();
    handleFetchPriorityCompatibility();
    removeDeprecatedUnloadListeners();

    // Set up mutation observer to handle dynamically added content
    const observer = new MutationObserver((mutations) => {
      let shouldEnhance = false;
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              if (element.tagName === 'IFRAME' || element.querySelector('iframe') ||
                  element.tagName === 'IMG' || element.querySelector('img') ||
                  element.tagName === 'LINK' || element.querySelector('link') ||
                  element.tagName === 'BUTTON' || element.querySelector('button')) {
                shouldEnhance = true;
              }
            }
          });
        }
      });
      
      if (shouldEnhance) {
        setTimeout(() => {
          enhancePrivyAccessibility();
          handleFetchPriorityCompatibility();
        }, 100);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Cleanup
    return () => {
      observer.disconnect();
    };
  }, []);

  return null; // This component doesn't render anything
} 