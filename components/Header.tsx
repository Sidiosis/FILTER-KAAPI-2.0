import React from 'react';

interface HeaderProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  timer: { minutes: number; seconds: number } | null;
}

const SunIcon = () => (
    <svg xmlns="http://www.w.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
);

const MoonIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
);


export const Header: React.FC<HeaderProps> = ({ isDarkMode, toggleDarkMode, timer }) => {
  return (
    <header className="p-4 flex justify-between items-center text-theme-light-text dark:text-theme-dark-text shadow-md bg-theme-light-card dark:bg-theme-dark-card flex-shrink-0">
      <h1 className="text-2xl md:text-3xl font-heading font-bold">
        FILTER KAAPI<span className="text-red-600">.</span>
      </h1>
      <div className="flex items-center gap-2">
        {timer && (
            <div className="text-sm font-mono font-bold p-2 rounded-lg bg-theme-light-bg dark:bg-theme-dark-bg">
                <span>{String(timer.minutes).padStart(2, '0')}</span>:<span>{String(timer.seconds).padStart(2, '0')}</span>
            </div>
        )}
        <button 
          onClick={toggleDarkMode} 
          className="p-2 rounded-full hover:bg-theme-light-bg dark:hover:bg-theme-dark-bg transition-colors duration-200"
          aria-label="Toggle dark mode"
        >
          {isDarkMode ? <SunIcon /> : <MoonIcon />}
        </button>
      </div>
    </header>
  );
};
