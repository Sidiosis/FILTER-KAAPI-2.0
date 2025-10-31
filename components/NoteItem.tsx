import React, { useState } from 'react';
import type { Note, Action } from '../types';

interface NoteItemProps {
  note: Note;
  dispatch: React.Dispatch<Action>;
  onEdit: () => void;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, id: string) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>, id: string) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
}

const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>;
const DeleteIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>;

export const NoteItem: React.FC<NoteItemProps> = ({ note, dispatch, onEdit, onDragStart, onDrop, onDragOver }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleDelete = () => {
    dispatch({ type: 'DELETE_NOTE', payload: note.id });
  };

  return (
    <div 
      draggable 
      onDragStart={(e) => onDragStart(e, note.id)}
      onDrop={(e) => onDrop(e, note.id)}
      onDragOver={onDragOver}
      className="bg-theme-light-card dark:bg-theme-dark-card p-4 rounded-lg shadow-sm transition-all duration-300 cursor-grab active:cursor-grabbing"
    >
      <div className="flex items-center">
        <h3 onClick={() => setIsExpanded(!isExpanded)} className="flex-grow font-medium font-body cursor-pointer text-theme-light-text dark:text-theme-dark-text">
          {note.title}
        </h3>
        <div className="flex items-center ml-auto pl-2 text-gray-400 dark:text-gray-500">
            <button onClick={onEdit} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-blue-500"><EditIcon/></button>
            <button onClick={handleDelete} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-red-500"><DeleteIcon/></button>
            <svg onClick={() => setIsExpanded(!isExpanded)} xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform duration-300 cursor-pointer ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
        </div>
      </div>
      
      {isExpanded && (
        <div className="mt-4 pl-2 space-y-3 animate-fade-in">
          <p className="text-sm text-theme-light-text/80 dark:text-theme-dark-text/80 whitespace-pre-wrap">{note.content || 'No content.'}</p>
          
          {note.filters.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {note.filters.map(filter => (
                <span key={filter} className="text-xs font-medium bg-theme-light-bg dark:bg-theme-dark-bg px-2 py-1 rounded-full">
                  #{filter}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};