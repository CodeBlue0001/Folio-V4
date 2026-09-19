import { useState, useEffect } from 'react';
import { usePortfolioContent } from './hooks/usePortfolioContent';

const DEFAULT_PHRASES = [
  "Hi, I am Dipayan Sardar",
  "Welcome to my Portfolio!",
  // "Welcome to my Creative Space!",
];

interface TypewriterHeadingProps {
  isDark?: boolean;
  phrases?: string[];
}

export const TypewriterHeading = ({ isDark = true, phrases }: TypewriterHeadingProps) => {
  const { getThemeColors } = usePortfolioContent();
  const themeColors = getThemeColors(isDark);
  const headingColor = themeColors.headingColor;

  const PHRASES = (phrases && phrases.length > 0) ? phrases : DEFAULT_PHRASES;

  const [phraseIndex, setPhraseIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(true);
  const [isReady, setIsReady] = useState(() => {
    return typeof window !== 'undefined' && Boolean((window as unknown as { __PORTFOLIO_LOADED__?: boolean }).__PORTFOLIO_LOADED__);
  });

  // Cursor blink effect
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setCursorVisible((prev) => !prev);
    }, 500);
    return () => clearInterval(blinkInterval);
  }, []);

  // Synchronize start with the 3D page loader
  useEffect(() => {
    if (isReady) return;

    const handleReady = () => {
      setTimeout(() => setIsReady(true), 250);
    };

    window.addEventListener('app-ready', handleReady);
    const fallbackTimer = setTimeout(() => {
      setIsReady(true);
    }, 4200);

    return () => {
      window.removeEventListener('app-ready', handleReady);
      clearTimeout(fallbackTimer);
    };
  }, [isReady]);

  // Main typing engine
  useEffect(() => {
    if (!isReady) return;

    const currentPhrase = PHRASES[phraseIndex];
    let timer: ReturnType<typeof setTimeout>;

    if (!isDeleting) {
      if (charIndex < currentPhrase.length) {
        timer = setTimeout(() => {
          setCharIndex((prev) => prev + 1);
        }, 75);
      } else {
        // Phrase fully typed — pause to read
        timer = setTimeout(() => {
          setIsDeleting(true);
        }, 2200);
      }
    } else {
      if (charIndex > 0) {
        timer = setTimeout(() => {
          setCharIndex((prev) => prev - 1);
        }, 35);
      } else {
        // Phrase deleted — pause briefly and switch phrase
        setIsDeleting(false);
        setPhraseIndex((prev) => (prev + 1) % PHRASES.length);
        timer = setTimeout(() => { }, 400);
      }
    }

    return () => clearTimeout(timer);
  }, [charIndex, isDeleting, phraseIndex, isReady]);

  const currentPhrase = PHRASES[phraseIndex];
  const currentText = currentPhrase.slice(0, charIndex);

  return (
    <span className="inline-flex items-center flex-wrap justify-center text-center">
      {/* Screen-reader accessible full text */}
      <span className="sr-only" aria-live="polite">
        {currentPhrase}
      </span>

      {/* Visual typed output */}
      <span aria-hidden="true" className="inline-flex items-center flex-wrap justify-center">
        <span
          className="transition-colors duration-300 font-bold"
          style={{ color: headingColor }}
        >
          {currentText}
        </span>

        {/* Glowing cursor */}
        <span
          className={`inline-block w-[3px] sm:w-[4px] md:w-[5px] h-[0.85em] ml-1 sm:ml-2 align-middle rounded-xs ${
            cursorVisible ? 'opacity-100' : 'opacity-0'
          } transition-opacity duration-150`}
          style={{
            backgroundColor: headingColor,
            boxShadow: `0 0 12px ${headingColor}A0`,
          }}
        />
      </span>
    </span>
  );
};
