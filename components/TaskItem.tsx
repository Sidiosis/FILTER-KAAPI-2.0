import React, { useState } from 'react';
import type { Task, SubTask, Action } from '../types';

interface TaskItemProps {
  task: Task;
  dispatch: React.Dispatch<Action>;
  onEdit: () => void;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, id: string) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>, id: string) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
}

const getPriorityInfo = (filters: string[]) => {
  const isImportant = filters.includes('important');
  const isUrgent = filters.includes('urgent');

  if (isUrgent && isImportant) {
    return { text: 'Do', colorClass: 'bg-red-500' };
  }
  if (!isUrgent && isImportant) {
    return { text: 'Schedule', colorClass: 'bg-blue-500' };
  }
  if (isUrgent && !isImportant) {
    return { text: 'Delegate', colorClass: 'bg-yellow-500 text-black' };
  }
  if (!isUrgent && !isImportant) {
    return { text: 'Eliminate', colorClass: 'bg-green-500' };
  }
  return { text: null, colorClass: null };
};

const getPriorityTextColor = (filters: string[]) => {
  const isImportant = filters.includes('important');
  const isUrgent = filters.includes('urgent');

  if (isUrgent && isImportant) return 'text-red-500';
  if (!isUrgent && isImportant) return 'text-blue-500';
  if (isUrgent && !isImportant) return 'text-yellow-500';
  if (!isUrgent && !isImportant) return 'text-green-500';
  
  return 'text-gray-400 dark:text-gray-500';
};


const CheckboxIcon = ({ checked }: { checked: boolean }) => (
  <div className={`w-6 h-6 border-2 rounded ${checked ? 'bg-theme-light-accent dark:bg-theme-dark-accent border-theme-light-accent dark:border-theme-dark-accent' : 'border-theme-light-text/70 dark:border-theme-dark-text/70'} flex items-center justify-center transition-colors`}>
    {checked && <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
  </div>
);

const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>;
const DeleteIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>;

const DueDateDisplay: React.FC<{ dateString: string; completed: boolean }> = ({ dateString, completed }) => {
    const date = new Date(dateString);
    // Adjust for timezone offset for display
    date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(date);
    dueDate.setHours(0, 0, 0, 0);

    const isPast = dueDate < today;
    const isToday = dueDate.getTime() === today.getTime();
    
    let colorClass = 'text-gray-500 dark:text-gray-400';
    if (!completed) {
        if (isPast) colorClass = 'text-red-500 font-medium';
        if (isToday) colorClass = 'text-blue-500 font-medium';
    }

    return (
        <div className={`flex items-center gap-1 text-xs ${colorClass}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            <span>{date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </div>
    );
};


export const TaskItem: React.FC<TaskItemProps> = ({ task, dispatch, onEdit, onDragStart, onDrop, onDragOver }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [editingSubTaskId, setEditingSubTaskId] = useState<string | null>(null);
  const [editedSubTaskText, setEditedSubTaskText] = useState('');
  
  const priority = getPriorityInfo(task.filters);
  const priorityTextColor = getPriorityTextColor(task.filters);
  
  const handleToggleComplete = (e: React.MouseEvent) => {
      e.stopPropagation();
      dispatch({ type: 'TOGGLE_TASK_COMPLETE', payload: task.id });
  };
  
  const handleToggleSubTask = (subTaskId: string) => {
      dispatch({ type: 'TOGGLE_SUBTASK', payload: { taskId: task.id, subTaskId } });
  };

  const handleDelete = () => {
      dispatch({ type: 'DELETE_TASK', payload: task.id });
  };

  const handleStartEditSubTask = (sub: SubTask) => {
    if (sub.completed) return; // Don't edit completed subtasks
    setEditingSubTaskId(sub.id);
    setEditedSubTaskText(sub.text);
  };

  const handleCancelEditSubTask = () => {
    setEditingSubTaskId(null);
    setEditedSubTaskText('');
  };

  const handleSaveSubTask = () => {
    if (!editingSubTaskId) return;

    const newText = editedSubTaskText.trim();
    if (newText === '') {
        handleCancelEditSubTask();
        return;
    }

    const updatedSubTasks = task.subTasks.map(sub =>
      sub.id === editingSubTaskId ? { ...sub, text: newText } : sub
    );
    const updatedTask: Task = { ...task, subTasks: updatedSubTasks };

    dispatch({ type: 'UPDATE_ITEM', payload: updatedTask });
    handleCancelEditSubTask();
  };

  return (
    <div 
      draggable 
      onDragStart={(e) => onDragStart(e, task.id)}
      onDrop={(e) => onDrop(e, task.id)}
      onDragOver={onDragOver}
      className={`relative bg-theme-light-card dark:bg-theme-dark-card p-4 rounded-lg shadow-sm transition-all duration-300 cursor-grab active:cursor-grabbing ${task.completed ? 'opacity-60' : ''}`}
    >
      <div className="flex items-center">
        <button onClick={handleToggleComplete} className="mr-4 flex-shrink-0">
          <CheckboxIcon checked={task.completed} />
        </button>
        <div onClick={() => setIsExpanded(!isExpanded)} className={`flex-grow font-body cursor-pointer`}>
            <h3 className={`${task.completed ? 'line-through text-gray-500' : 'text-theme-light-text dark:text-theme-dark-text'} font-medium`}>
              {task.title}
            </h3>
        </div>

        <div className="flex items-center ml-auto pl-2 text-gray-400 dark:text-gray-500">
             <button onClick={onEdit} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-blue-500"><EditIcon/></button>
            <button onClick={handleDelete} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-red-500"><DeleteIcon/></button>
            <svg onClick={() => setIsExpanded(!isExpanded)} xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform duration-300 cursor-pointer ${isExpanded ? 'rotate-180' : ''} ${priorityTextColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
        </div>
      </div>
      
      {isExpanded && (
        <div className="mt-4 pl-10 space-y-3 animate-fade-in pr-20">
          <p className="text-sm text-theme-light-text/80 dark:text-theme-dark-text/80">{task.description || 'No description.'}</p>
          
          {task.dueDate && <DueDateDisplay dateString={task.dueDate} completed={task.completed} />}

          {task.subTasks.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Sub-tasks:</h4>
              {task.subTasks.map(sub => (
                <div key={sub.id} className="flex items-center gap-3">
                  <button onClick={() => handleToggleSubTask(sub.id)} className="flex-shrink-0">
                     <CheckboxIcon checked={sub.completed} />
                  </button>
                  {editingSubTaskId === sub.id ? (
                     <input
                      type="text"
                      value={editedSubTaskText}
                      onChange={(e) => setEditedSubTaskText(e.target.value)}
                      onBlur={handleSaveSubTask}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            handleSaveSubTask();
                        }
                        if (e.key === 'Escape') handleCancelEditSubTask();
                      }}
                      autoFocus
                      className="text-sm w-full bg-theme-light-bg dark:bg-theme-dark-bg p-1 rounded border border-theme-light-accent dark:border-theme-dark-accent outline-none"
                    />
                  ) : (
                    <span 
                      onClick={() => handleStartEditSubTask(sub)}
                      className={`text-sm flex-grow ${sub.completed ? 'line-through text-gray-500 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      {sub.text}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {task.filters.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {task.filters.map(filter => (
                <span key={filter} className="text-xs font-medium bg-theme-light-bg dark:bg-theme-dark-bg px-2 py-1 rounded-full">
                  #{filter}
                </span>
              ))}
            </div>
          )}
          
          {priority.text && (
            <div className={`absolute bottom-4 right-4 text-xs font-bold px-2 py-1 rounded-full text-white ${priority.colorClass}`}>
                {priority.text}
            </div>
           )}
        </div>
      )}
    </div>
  );
};
