import React from 'react';
import type { Task } from '../types';

interface EisenhowerMatrixViewProps {
  tasks: Task[];
  onToggleComplete: (taskId: string) => void;
  showCompleted: boolean;
}

const Quadrant: React.FC<{ title: string; action: string; tasks: Task[]; bgColorClass: string; textColorClass: string; onToggleComplete: (taskId: string) => void }> = ({ title, action, tasks, bgColorClass, textColorClass, onToggleComplete }) => (
  <div className={`rounded-lg p-3 md:p-4 ${bgColorClass} min-h-[150px]`}>
    <h3 className={`font-heading mb-1 text-center text-sm md:text-base ${textColorClass}`}>{title}</h3>
    <p className={`text-center mb-3 text-xs md:text-sm ${textColorClass} opacity-80`}>{action}</p>
    <div className="space-y-2">
      {tasks.map(task => (
        <div key={task.id} className="flex items-center text-xs md:text-sm bg-white/50 dark:bg-black/20 p-2 rounded">
          <input type="checkbox" checked={task.completed} onChange={() => onToggleComplete(task.id)} className="mr-2 h-4 w-4 rounded accent-theme-light-accent dark:accent-theme-dark-accent" />
          <span className={`${task.completed ? 'line-through opacity-70' : ''} ${textColorClass}`}>{task.title}</span>
        </div>
      ))}
    </div>
  </div>
);

export const EisenhowerMatrixView: React.FC<EisenhowerMatrixViewProps> = ({ tasks, onToggleComplete, showCompleted }) => {
  const filterLogic = (t: Task) => showCompleted || !t.completed;

  const urgentImportant = tasks.filter(t => t.filters.includes('urgent') && t.filters.includes('important') && filterLogic(t));
  const notUrgentImportant = tasks.filter(t => !t.filters.includes('urgent') && t.filters.includes('important') && filterLogic(t));
  const urgentNotImportant = tasks.filter(t => t.filters.includes('urgent') && !t.filters.includes('important') && filterLogic(t));
  const notUrgentNotImportant = tasks.filter(t => (!t.filters.includes('urgent') && !t.filters.includes('important')) && filterLogic(t));

  return (
    <div className="p-4 text-theme-light-text dark:text-theme-dark-text">
      <h2 className="text-2xl font-bold font-heading mb-4 text-center">Priority Matrix</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Quadrant title="Urgent & Important" action="Do" tasks={urgentImportant} bgColorClass="bg-red-200 dark:bg-red-900/50" textColorClass="text-red-800 dark:text-red-200" onToggleComplete={onToggleComplete} />
        <Quadrant title="Not Urgent & Important" action="Schedule" tasks={notUrgentImportant} bgColorClass="bg-blue-200 dark:bg-blue-900/50" textColorClass="text-blue-800 dark:text-blue-200" onToggleComplete={onToggleComplete} />
        <Quadrant title="Urgent & Not Important" action="Delegate" tasks={urgentNotImportant} bgColorClass="bg-yellow-200 dark:bg-yellow-900/50" textColorClass="text-yellow-800 dark:text-yellow-200" onToggleComplete={onToggleComplete} />
        <Quadrant title="Not Urgent & Not Important" action="Evaluate / Eliminate" tasks={notUrgentNotImportant} bgColorClass="bg-green-200 dark:bg-green-900/50" textColorClass="text-green-800 dark:text-green-200" onToggleComplete={onToggleComplete} />
      </div>
    </div>
  );
};