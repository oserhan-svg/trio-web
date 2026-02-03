import { useEffect, useRef, useState } from 'react';

/**
 * Custom hook for intersection observer
 * Used for lazy loading images and components
 * @param {Object} options - Intersection observer options
 * @returns {Array} [ref, isIntersecting] - Ref to attach and intersection state
 */
const useIntersectionObserver = (options = {}) => {
    const ref = useRef(null);
    const [isIntersecting, setIsIntersecting] = useState(false);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsIntersecting(entry.isIntersecting);
            },
            {
                threshold: 0.1,
                rootMargin: '50px',
                ...options,
            }
        );

        observer.observe(element);

        return () => {
            if (element) {
                observer.unobserve(element);
            }
        };
    }, [options]);

    return [ref, isIntersecting];
};

export default useIntersectionObserver;
