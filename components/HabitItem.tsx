import React from 'react';
import type { Habit, Action } from '../types';

interface HabitItemProps {
    habit: Habit;
    dates: Date[];
    dispatch: React.Dispatch<Action>;
    onSelectHabit: (habitId: string) => void;
    onDragStart: (e: React.DragEvent<HTMLDivElement>, id: string) => void;
    onDrop: (e: React.DragEvent<HTMLDivElement>, id: string) => void;
    onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
}

const toYYYYMMDD = (date: Date) => date.toISOString().split('T')[0];
const isToday = (date: Date) => toYYYYMMDD(new Date()) === toYYYYMMDD(date);

const CheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-teal-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>;
const SkipIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>;


export const HabitItem: React.FC<HabitItemProps> = ({ habit, dates, dispatch, onSelectHabit, onDragStart, onDrop, onDragOver }) => {

    const handleToggleHabit = (e: React.MouseEvent, dateString: string) => {
        e.stopPropagation();
        dispatch({ type: 'TOGGLE_HABIT_COMPLETION', payload: { habitId: habit.id, dateString } });
    };

    return (
        <div 
            draggable
            onDragStart={(e) => onDragStart(e, habit.id)}
            onDrop={(e) => onDrop(e, habit.id)}
            onDragOver={onDragOver}
            onClick={() => onSelectHabit(habit.id)}
            className="px-3 py-3 border-b border-theme-light-text/10 dark:border-theme-dark-text/20 last:border-b-0 cursor-pointer hover:bg-theme-light-bg dark:hover:bg-theme-dark-bg/50 transition-colors duration-150"
        >
            <div className="grid grid-cols-[minmax(100px,_2fr)_repeat(5,_1fr)] gap-2 items-center">
                <div 
                    className="text-left font-medium truncate"
                    title={habit.title}
                >
                    {habit.title}
                </div>

                {dates.map(date => {
                    const dateString = toYYYYMMDD(date);
                    const status = habit.completions[dateString];
                    const today = isToday(date);
                    
                    let content;
                    if (status === 'completed') {
                        content = <CheckIcon />;
                    } else if (status === 'skipped') {
                        content = <SkipIcon />;
                    } else {
                        content = <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600"></div>;
                    }

                    return (
                        <div key={dateString} className="flex justify-center items-center">
                            <button 
                                onClick={(e) => handleToggleHabit(e, dateString)}
                                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer hover:bg-theme-light-accent/10 dark:hover:bg-theme-dark-accent/10 ${today ? 'border-2 border-theme-light-accent dark:border-theme-dark-accent' : 'border-2 border-transparent'}`}
                                aria-label={`Mark ${habit.title} for ${dateString}`}
                            >
                                {content}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};