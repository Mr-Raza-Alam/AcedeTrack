import { useState, useEffect } from 'react';

export const useScrollEffect = (threshold = 50) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > threshold);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  return isScrolled;
};

export const useIntersectionObserver = (options = {}) => {
  const [visibleElements, setVisibleElements] = useState(new Set());

  const observeElement = (element, index) => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleElements(prev => new Set([...prev, index]));
          }
        });
      },
      { threshold: 0.3, ...options }
    );

    if (element) observer.observe(element);
    return () => observer.disconnect();
  };

  return { visibleElements, observeElement };
};

