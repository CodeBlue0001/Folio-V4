import { useState, useEffect, useRef, useCallback } from 'react';

export const useScrollSpy = (sectionIds: string[]) => {
  const [activeSection, setActiveSection] = useState(sectionIds[0]);
  const sectionIdsString = sectionIds.join(',');
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      // Cancel any pending rAF to throttle to one update per frame
      if (rafRef.current) cancelAnimationFrame(rafRef.current);

      rafRef.current = requestAnimationFrame(() => {
        const scrollPosition = window.scrollY + window.innerHeight / 3;

        for (const sectionId of sectionIds) {
          const element = document.getElementById(sectionId);
          if (element) {
            const { offsetTop, offsetHeight } = element;
            if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
              setActiveSection(sectionId);
              break;
            }
          }
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [sectionIdsString]);

  const scrollToSection = useCallback((sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  return { activeSection, scrollToSection };
};
