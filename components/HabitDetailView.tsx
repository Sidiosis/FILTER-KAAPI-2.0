import React, { useMemo, useState } from 'react';
import type { Habit, Action, HabitCompletionStatus } from '../types';

interface HabitDetailViewProps {
  habit: Habit;
  onBack: () => void;
  dispatch: React.Dispatch<Action>;
  onEdit: (habit: Habit) => void;
}

const toYYYYMMDD = (date: Date): string => {
    const d = new Date(date);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().split('T')[0];
}

const StatCard: React.FC<{ title: string; value: number | string }> = ({ title, value }) => (
    <div className="bg-theme-light-card dark:bg-theme-dark-card p-3 rounded-lg text-center shadow-sm">
        <p className="text-3xl font-bold text-theme-light-text dark:text-theme-dark-text">{value}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{title}</p>
    </div>
);

const HabitCalendar: React.FC<{ completions: Record<string, HabitCompletionStatus>; createdAt: number; onDayClick?: (date: Date) => void }> = ({ completions, createdAt, onDayClick }) => {
    const [displayDate, setDisplayDate] = useState(new Date());

    const changeMonth = (offset: number) => {
        setDisplayDate(current => {
            const newDate = new Date(current.getFullYear(), current.getMonth() + offset, 1);
            return newDate;
        });
    };

    const monthData = useMemo(() => {
        const year = displayDate.getFullYear();
        const month = displayDate.getMonth();
        const firstDayOfWeek = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const daysInPrevMonth = new Date(year, month, 0).getDate();

        const grid: ({ day: number; isCompleted: boolean; isSkipped: boolean; isToday: boolean; isFuture: boolean; isBeforeCreation: boolean; isCurrentMonth: boolean })[] = [];
        
        for (let i = 0; i < firstDayOfWeek; i++) {
            grid.push({ 
                day: daysInPrevMonth - firstDayOfWeek + 1 + i, 
                isCompleted: false, isSkipped: false, isToday: false, isFuture: false, isBeforeCreation: true, isCurrentMonth: false 
            });
        }
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const creationDate = new Date(createdAt);
        creationDate.setHours(0, 0, 0, 0);

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            date.setHours(0, 0, 0, 0);
            const status = completions[toYYYYMMDD(date)];
            grid.push({
                day,
                isCompleted: status === 'completed',
                isSkipped: status === 'skipped',
                isToday: date.getTime() === today.getTime(),
                isFuture: date > today,
                isBeforeCreation: date < creationDate,
                isCurrentMonth: true
            });
        }
        
        const totalCells = Math.ceil(grid.length / 7) * 7;
        let nextMonthDay = 1;
        while (grid.length < totalCells) {
            grid.push({ 
                day: nextMonthDay++, 
                isCompleted: false, isSkipped: false, isToday: false, isFuture: true, isBeforeCreation: true, isCurrentMonth: false 
            });
        }

        return grid;
    }, [displayDate, completions, createdAt]);

    const weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    return (
        <div className="bg-theme-light-card dark:bg-theme-dark-card p-4 rounded-lg mt-4 shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <button onClick={() => changeMonth(-1)} className="p-1 text-gray-500 dark:text-gray-400 hover:text-theme-light-text dark:hover:text-theme-dark-text">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                </button>
                <h4 className="font-bold text-theme-light-text dark:text-theme-dark-text text-sm">
                    {displayDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </h4>
                <button onClick={() => changeMonth(1)} className="p-1 text-gray-500 dark:text-gray-400 hover:text-theme-light-text dark:hover:text-theme-dark-text">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                </button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 dark:text-gray-400 mb-2">
                {weekdays.map((day, i) => <div key={i}>{day}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-y-2 gap-x-1">
                {monthData.map((data, index) => {
                    const date = new Date(displayDate.getFullYear(), displayDate.getMonth(), data.day);
                    
                    let cellClasses = 'w-full aspect-square flex items-center justify-center rounded-md text-xs transition-colors';
                    const isClickable = data.isCurrentMonth && !data.isBeforeCreation && !data.isFuture && !!onDayClick;

                    if (isClickable) {
                        cellClasses += ' cursor-pointer hover:bg-theme-light-bg dark:hover:bg-theme-dark-bg';
                    }

                    if (!data.isCurrentMonth) {
                         cellClasses += ' text-gray-300 dark:text-gray-700';
                    } else if (data.isBeforeCreation || data.isFuture) {
                        cellClasses += ' text-gray-400 dark:text-gray-600';
                    } else if (data.isCompleted) {
                        cellClasses += ' bg-green-500 text-white font-semibold';
                    } else if (data.isSkipped) {
                        cellClasses += ' bg-yellow-500 text-white font-semibold';
                    } else {
                        cellClasses += ' text-theme-light-text dark:text-theme-dark-text';
                    }
                    
                    if(data.isToday && data.isCurrentMonth) {
                        if (data.isCompleted || data.isSkipped) {
                            cellClasses += ' ring-2 ring-offset-2 ring-offset-theme-light-card dark:ring-offset-theme-dark-card ring-theme-light-accent dark:ring-theme-dark-accent';
                        } else {
                            cellClasses += ' bg-theme-light-accent/20 dark:bg-theme-dark-accent/20';
                        }
                    }

                    return <div key={index} onClick={isClickable ? () => onDayClick(date) : undefined} className={cellClasses}>{data.day}</div>;
                })}
            </div>
        </div>
    );
};


export const HabitDetailView: React.FC<HabitDetailViewProps> = ({ habit, onBack, dispatch, onEdit }) => {
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
    
    const stats = useMemo(() => {
        const completions = habit.completions;
        const sortedDates = Object.keys(completions).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
        
        const completedDates = sortedDates.filter(date => completions[date] === 'completed');
        
        let longestStreak = 0;
        if (completedDates.length > 0) {
            let currentOverallStreak = 1;
            longestStreak = 1;
            for (let i = 1; i < completedDates.length; i++) {
                const currentDate = new Date(completedDates[i]);
                const prevDate = new Date(completedDates[i-1]);
                const diffDays = Math.round((currentDate.getTime() - prevDate.getTime()) / (1000 * 3600 * 24));
                if (diffDays === 1) {
                    currentOverallStreak++;
                } else {
                    longestStreak = Math.max(longestStreak, currentOverallStreak);
                    currentOverallStreak = 1;
                }
            }
            longestStreak = Math.max(longestStreak, currentOverallStreak);
        } else if (completedDates.length === 1) {
            longestStreak = 1;
        }


        let currentStreak = 0;
        let checkDate = new Date();
        // If today is not completed, start checking from yesterday
        if(completions[toYYYYMMDD(checkDate)] !== 'completed') {
            checkDate.setDate(checkDate.getDate() - 1);
        }
        while(completions[toYYYYMMDD(checkDate)] === 'completed') {
            currentStreak++;
            checkDate.setDate(checkDate.getDate() - 1);
        }

        const daysCompleted = completedDates.length;
        const daysSkipped = sortedDates.filter(date => completions[date] === 'skipped').length;
        
        const creationDate = new Date(habit.createdAt);
        creationDate.setHours(0, 0, 0, 0);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let daysFailed = 0;
        const timeDiff = Math.max(0, today.getTime() - creationDate.getTime());
        const totalDaysSinceCreation = Math.floor(timeDiff / (1000 * 3600 * 24)) + 1;

        if (creationDate <= today) {
            let completionsInRange = 0;
            let skipsInRange = 0;
            for (const dateStr in completions) {
                const d = new Date(dateStr);
                d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
                if (d >= creationDate && d <= today) {
                     if (completions[dateStr] === 'completed') completionsInRange++;
                     else if (completions[dateStr] === 'skipped') skipsInRange++;
                }
            }
            daysFailed = totalDaysSinceCreation - completionsInRange - skipsInRange;
        }

        const habitScore = totalDaysSinceCreation > 0 ? Math.round((daysCompleted / totalDaysSinceCreation) * 100) : 0;
        
        return {
            daysCompleted,
            currentStreak,
            longestStreak,
            daysFailed: Math.max(0, daysFailed),
            daysSkipped,
            habitScore
        }
    }, [habit.completions, habit.createdAt]);

    const handleDeleteRequest = () => {
        setIsConfirmingDelete(true);
    };

    const confirmDelete = () => {
        dispatch({ type: 'DELETE_HABIT', payload: habit.id });
        onBack();
    };

    const cancelDelete = () => {
        setIsConfirmingDelete(false);
    };

  return (
    <div className="p-4 text-theme-light-text dark:text-theme-dark-text font-body animate-fade-in min-h-full">
        <div className="flex justify-between items-center mb-6">
            <button onClick={onBack} className="text-theme-light-accent dark:text-theme-dark-accent hover:underline text-sm font-medium">Back</button>
            <h1 className="font-bold text-lg font-heading">Overview</h1>
            <div className="flex items-center gap-4">
                <button onClick={() => onEdit(habit)} className="text-theme-light-accent dark:text-theme-dark-accent hover:underline text-sm font-medium">Edit</button>
                <button onClick={handleDeleteRequest} className="text-red-500 hover:underline text-sm font-medium">Delete</button>
            </div>
        </div>

        <div className="bg-theme-light-card dark:bg-theme-dark-card p-3 rounded-lg mb-4 shadow-sm">
            <h2 className="text-lg font-semibold">{habit.title}</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <StatCard title="Current Streak" value={stats.currentStreak} />
            <StatCard title="Longest Streak" value={stats.longestStreak} />
            <StatCard title="Days Completed" value={stats.daysCompleted} />
            <StatCard title="Days Failed" value={stats.daysFailed} />
            <StatCard title="Days Skipped" value={stats.daysSkipped} />
            <StatCard title="Habit Score" value={`${stats.habitScore}%`} />
        </div>
        
        <HabitCalendar completions={habit.completions} createdAt={habit.createdAt} />

        {isConfirmingDelete && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in" onClick={cancelDelete}>
                <div 
                    className="bg-theme-light-card dark:bg-theme-dark-card rounded-lg shadow-xl w-full max-w-sm p-6 text-theme-light-text dark:text-theme-dark-text font-body"
                    onClick={e => e.stopPropagation()}
                >
                    <h3 className="text-lg font-bold font-heading mb-4">Confirm Deletion</h3>
                    <p className="mb-6 text-sm">Are you sure you want to delete the habit "{habit.title}"? This action cannot be undone.</p>
                    <div className="flex justify-end gap-4">
                        <button 
                            onClick={cancelDelete} 
                            className="px-4 py-2 rounded text-theme-light-text dark:text-theme-dark-text hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors font-semibold"
                        >
                            No
                        </button>
                        <button 
                            onClick={confirmDelete} 
                            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors font-semibold"
                        >
                            Yes, Delete
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};