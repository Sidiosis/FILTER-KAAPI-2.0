import React, { useState, useMemo } from 'react';
import type { Task, Action } from '../types';

const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>;
const DeleteIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>;

const StatCard: React.FC<{ title: string; value: number | string }> = ({ title, value }) => (
    <div className="bg-theme-light-card dark:bg-theme-dark-card p-4 rounded-lg text-center shadow-sm">
        <p className="text-3xl font-bold font-heading">{value}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{title}</p>
    </div>
);

const toYYYYMMDD = (date: Date): string => {
    const d = new Date(date);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().split('T')[0];
}

interface TaskDashboardProps {
    tasks: Task[];
    dispatch: React.Dispatch<Action>;
    onEditTask: (task: Task) => void;
}

export const TaskDashboard: React.FC<TaskDashboardProps> = ({ tasks, dispatch, onEditTask }) => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [displayDate, setDisplayDate] = useState(new Date());

    const stats = useMemo(() => {
        const total = tasks.length;
        const completed = tasks.filter(t => t.completed).length;
        const pending = total - completed;
        return { total, completed, pending };
    }, [tasks]);

    const tasksByDate = useMemo(() => {
        const map = new Map<string, Task[]>();
        tasks.forEach(task => {
            if (task.dueDate) {
                const dateKey = task.dueDate;
                const existing = map.get(dateKey) || [];
                map.set(dateKey, [...existing, task]);
            }
        });
        return map;
    }, [tasks]);

    const changeMonth = (offset: number) => {
        setDisplayDate(current => {
            const newDate = new Date(current.getFullYear(), current.getMonth() + offset, 1);
            return newDate;
        });
    };

    const calendarGrid = useMemo(() => {
        const year = displayDate.getFullYear();
        const month = displayDate.getMonth();
        const firstDayOfWeek = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        const grid = [];
        for (let i = 0; i < firstDayOfWeek; i++) {
            grid.push({ key: `prev-${i}`, isCurrentMonth: false });
        }
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            date.setHours(0, 0, 0, 0);
            grid.push({
                key: `current-${day}`,
                day,
                date,
                isCurrentMonth: true,
                isToday: date.getTime() === today.getTime(),
                isSelected: date.getTime() === selectedDate.getTime(),
                hasTasks: tasksByDate.has(toYYYYMMDD(date)),
            });
        }

        return grid;
    }, [displayDate, selectedDate, tasksByDate]);

    const selectedDateString = toYYYYMMDD(selectedDate);
    const tasksForSelectedDate = tasks.filter(t => t.dueDate === selectedDateString);

    return (
        <div className="p-4 space-y-6 animate-fade-in">
            <h2 className="text-2xl font-bold font-heading text-center">Tasks Dashboard</h2>
            <div className="grid grid-cols-3 gap-4">
                <StatCard title="Total Tasks" value={stats.total} />
                <StatCard title="Completed" value={stats.completed} />
                <StatCard title="Pending" value={stats.pending} />
            </div>

            <div className="bg-theme-light-card dark:bg-theme-dark-card p-4 rounded-lg shadow-sm">
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
                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => <div key={day}>{day}</div>)}
                </div>
                 <div className="grid grid-cols-7 gap-y-1 gap-x-1">
                    {calendarGrid.map(cell => {
                        if (!cell.isCurrentMonth) return <div key={cell.key}></div>;

                        let cellClasses = 'relative w-full aspect-square flex items-center justify-center rounded-md text-xs transition-colors cursor-pointer';
                        
                        if (cell.isSelected) {
                            cellClasses += ' bg-theme-light-accent dark:bg-theme-dark-accent text-white font-bold';
                        } else if (cell.isToday) {
                            cellClasses += ' bg-theme-light-accent/20 dark:bg-theme-dark-accent/20';
                        } else {
                            cellClasses += ' hover:bg-theme-light-bg dark:hover:bg-theme-dark-bg';
                        }

                        return (
                            <div key={cell.key} onClick={() => setSelectedDate(cell.date)} className={cellClasses}>
                                {cell.day}
                                {cell.hasTasks && <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-current opacity-70"></div>}
                            </div>
                        );
                    })}
                 </div>
            </div>

            <div>
                <h3 className="text-lg font-bold font-heading mb-2">
                    Tasks for <span className="text-theme-light-accent dark:text-theme-dark-accent">{selectedDate.toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}</span>
                </h3>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                    {tasksForSelectedDate.length > 0 ? (
                        tasksForSelectedDate.map(task => (
                           <div key={task.id} className="bg-theme-light-card dark:bg-theme-dark-card p-3 rounded-lg flex items-center gap-3 shadow-sm">
                                <button onClick={() => dispatch({ type: 'TOGGLE_TASK_COMPLETE', payload: task.id })}>
                                    <div className={`w-5 h-5 border-2 rounded ${task.completed ? 'bg-theme-light-accent dark:bg-theme-dark-accent border-theme-light-accent dark:border-theme-dark-accent' : 'border-theme-light-text/70 dark:border-theme-dark-text/70'} flex items-center justify-center transition-colors`}>
                                        {task.completed && <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                    </div>
                                </button>
                                <span className={`flex-grow ${task.completed ? 'line-through opacity-70' : ''}`}>{task.title}</span>
                                <div className="ml-auto flex items-center">
                                    <button onClick={() => onEditTask(task)} className="p-1 text-gray-400 hover:text-blue-500 rounded-full"><EditIcon /></button>
                                    <button onClick={() => dispatch({ type: 'DELETE_TASK', payload: task.id })} className="p-1 text-gray-400 hover:text-red-500 rounded-full"><DeleteIcon /></button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center text-gray-500 p-8 bg-theme-light-card dark:bg-theme-dark-card rounded-lg">
                            <p>No tasks scheduled for this day.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};