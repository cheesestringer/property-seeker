import { useEffect, useRef, useState, type RefObject } from 'react';

export const useIntersectionObserver = (threshold = 0.1): [boolean, RefObject<HTMLDivElement>] => {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [threshold]);

  return [isVisible, elementRef];
};
