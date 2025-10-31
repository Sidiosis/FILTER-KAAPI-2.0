import React, { useState, useEffect } from 'react';

interface TimerProps {
  isVisible: boolean;
  onClose: () => void;
  minutes: number;
  seconds: number;
  isActive: boolean;
  toggleTimer: () => void;
  resetTimer: () => void;
  setTime: (mins: number) => void;
}

const DeleteIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
);


export const Timer: React.FC<TimerProps> = ({ isVisible, onClose, minutes, seconds, isActive, toggleTimer, resetTimer, setTime }) => {
  const DEFAULT_PRESETS = [5, 10, 15, 20, 25, 30];
  const [presets, setPresets] = useState<number[]>(() => {
    const saved = localStorage.getItem('timerPresets');
    if (saved) {
        try {
            return JSON.parse(saved);
        } catch (e) {
            console.error("Failed to parse timer presets from localStorage", e);
            return DEFAULT_PRESETS;
        }
    }
    return DEFAULT_PRESETS;
  });
  const [customMinutes, setCustomMinutes] = useState('');

  useEffect(() => {
    localStorage.setItem('timerPresets', JSON.stringify(presets));
  }, [presets]);


  const handleAddPreset = (e: React.FormEvent) => {
      e.preventDefault();
      const mins = parseInt(customMinutes, 10);
      if (!isNaN(mins) && mins > 0 && !presets.includes(mins)) {
          setPresets(prev => [...prev, mins].sort((a,b) => a-b));
          setCustomMinutes('');
      }
  };

  const handleDeletePreset = (presetToDelete: number) => {
      setPresets(prev => prev.filter(p => p !== presetToDelete));
  }

  const handleToggleTimerAndClose = () => {
    if (!isActive) { // Only close if we are starting the timer
        onClose();
    }
    toggleTimer();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/30 z-30" onClick={onClose}>
        <div 
            onClick={e => e.stopPropagation()}
            className={`fixed top-0 right-0 h-full bg-theme-light-card dark:bg-theme-dark-card shadow-2xl z-40 transform transition-transform duration-300 ease-in-out ${isVisible ? 'translate-x-0' : 'translate-x-full'} w-full max-w-xs`}
        >
            <div className="p-6 flex flex-col h-full text-theme-light-text dark:text-theme-dark-text">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold font-heading">Countdown Timer</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="flex-grow flex flex-col items-center justify-center">
                    <div className="text-6xl font-mono font-bold p-4 rounded-lg bg-theme-light-bg dark:bg-theme-dark-bg mb-6">
                        <span>{String(minutes).padStart(2, '0')}</span>:<span>{String(seconds).padStart(2, '0')}</span>
                    </div>
                    
                    <div className="flex flex-wrap justify-center gap-2 mb-4 w-full">
                        {presets.map(p => (
                            <div key={p} className="relative group">
                                <button onClick={() => setTime(p)} className="px-3 py-1 text-sm rounded-full bg-theme-light-bg dark:bg-theme-dark-bg hover:bg-opacity-80">
                                    {p} min
                                </button>
                                {!DEFAULT_PRESETS.includes(p) && (
                                <button onClick={() => handleDeletePreset(p)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <DeleteIcon />
                                </button>
                                )}
                            </div>
                        ))}
                    </div>
                    
                    <form onSubmit={handleAddPreset} className="flex gap-2 mb-8 w-full">
                        <input
                            type="number"
                            value={customMinutes}
                            onChange={(e) => setCustomMinutes(e.target.value)}
                            placeholder="Mins"
                            className="w-full p-2 rounded bg-theme-light-bg dark:bg-theme-dark-bg border border-theme-light-text/20 dark:border-theme-dark-text/20 focus:ring-1 focus:ring-theme-light-accent dark:focus:ring-theme-dark-accent outline-none text-sm"
                        />
                        <button type="submit" className="px-4 py-1 bg-theme-light-accent/80 dark:bg-theme-dark-accent/80 text-white rounded hover:bg-theme-light-accent dark:hover:bg-theme-dark-accent transition-colors text-sm">Add</button>
                    </form>


                    <div className="flex gap-4">
                        <button onClick={handleToggleTimerAndClose} className="px-8 py-3 bg-theme-light-accent dark:bg-theme-dark-accent text-white rounded-lg text-lg hover:bg-theme-light-accent-hover dark:hover:bg-theme-dark-accent-hover transition-colors">
                            {isActive ? 'Pause' : 'Start'}
                        </button>
                        <button onClick={resetTimer} className="px-6 py-3 bg-gray-300 dark:bg-gray-600 rounded-lg hover:bg-opacity-80">
                            Reset
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};