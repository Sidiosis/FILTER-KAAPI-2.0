import React from 'react';
import type { Habit, Action } from '../types';
import { HabitItem } from './HabitItem';

interface HabitsViewProps {
    habits: Habit[];
    dispatch: React.Dispatch<Action>;
    onSelectHabit: (habitId: string) => void;
    onAddHabit: () => void;
    onDragStart: (e: React.DragEvent<HTMLDivElement>, id: string) => void;
    onDrop: (e: React.DragEvent<HTMLDivElement>, id: string) => void;
    onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
}

const getPastDates = (days: number): Date[] => {
    const dates: Date[] = [];
    for (let i = 0; i < days; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        dates.push(date);
    }
    return dates;
};

export const HabitsView: React.FC<HabitsViewProps> = ({ habits, dispatch, onSelectHabit, onAddHabit, onDragStart, onDrop, onDragOver }) => {
    const dates = getPastDates(5);

    const formatDateHeader = (date: Date) => {
        return date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
    };
    
    const formatDayOfMonth = (date: Date) => {
        return date.getDate();
    };

    return (
        <div className="p-4 text-theme-light-text dark:text-theme-dark-text">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold font-heading">Habits</h2>
                <button onClick={onAddHabit} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700" aria-label="Add new habit">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                </button>
            </div>

            <div className="bg-theme-light-card dark:bg-theme-dark-card rounded-lg shadow-sm">
                <div className="grid grid-cols-[minmax(100px,_2fr)_repeat(5,_1fr)] gap-2 text-center text-xs font-bold sticky top-0 bg-theme-light-card dark:bg-theme-dark-card py-2 z-10 px-3 border-b border-theme-light-text/10 dark:border-theme-dark-text/20 rounded-t-lg">
                    <div className="text-left">HABIT</div>
                    {dates.map(date => (
                        <div key={date.toISOString()}>
                            <div>{formatDateHeader(date)}</div>
                            <div className="font-normal">{formatDayOfMonth(date)}</div>
                        </div>
                    ))}
                </div>
                <div>
                    {habits.length > 0 ? habits.map(habit => (
                        <HabitItem 
                            key={habit.id} 
                            habit={habit} 
                            dates={dates} 
                            dispatch={dispatch}
                            onSelectHabit={onSelectHabit} 
                            onDragStart={onDragStart}
                            onDrop={onDrop}
                            onDragOver={onDragOver}
                        />
                    )) : <p className="text-center text-gray-500 p-8">No habits yet. Add one to get started!</p>}
                </div>
            </div>
        </div>
    );
};