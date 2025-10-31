import React, { useState, useEffect, useRef } from 'react';
import type { Action } from '../types';
import { DEFAULT_FILTERS } from '../constants';

interface FilterManagerModalProps {
    isOpen: boolean;
    onClose: () => void;
    userFilters: string[];
    dispatch: React.Dispatch<Action>;
    onDeleteFilter: (filter: string) => void;
}

const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>;
const XIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>;

const FilterPill: React.FC<{
    filter: string;
    isEditing: boolean;
    editedText: string;
    onSetEditedText: (text: string) => void;
    onStartEdit: () => void;
    onSaveEdit: () => void;
    onCancelEdit: () => void;
    onDelete: () => void;
}> = ({ filter, isEditing, editedText, onSetEditedText, onStartEdit, onSaveEdit, onCancelEdit, onDelete }) => {
    
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') onSaveEdit();
        if (e.key === 'Escape') onCancelEdit();
    };

    if (isEditing) {
        return (
            <div className="flex items-center gap-2 bg-theme-light-bg dark:bg-theme-dark-bg p-2 rounded animate-fade-in">
                <input
                    type="text"
                    value={editedText}
                    onChange={(e) => onSetEditedText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-grow p-1 -m-1 rounded bg-white dark:bg-gray-900 border border-theme-light-accent dark:border-theme-dark-accent outline-none text-sm"
                    autoFocus
                />
                <button onClick={onSaveEdit} className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600">Save</button>
                <button onClick={onCancelEdit} className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600">Cancel</button>
            </div>
        );
    }
    
    return (
        <div className="flex justify-between items-center bg-theme-light-bg dark:bg-theme-dark-bg p-2 rounded group">
            <span onClick={onStartEdit} className="cursor-pointer font-medium text-sm">#{filter}</span>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={onStartEdit} className="p-1 text-gray-400 hover:text-blue-500 rounded-full"><EditIcon /></button>
                <button onClick={onDelete} className="p-1 text-gray-400 hover:text-red-500 rounded-full"><XIcon /></button>
            </div>
        </div>
    );
};


export const FilterManagerModal: React.FC<FilterManagerModalProps> = ({ isOpen, onClose, userFilters, dispatch, onDeleteFilter }) => {
    const [newFilter, setNewFilter] = useState('');
    const [editingFilter, setEditingFilter] = useState<string | null>(null);
    const [editedText, setEditedText] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
            setEditingFilter(null); // Reset editing state on open
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        dispatch({ type: 'ADD_FILTER', payload: newFilter });
        setNewFilter('');
    };
    
    const handleSaveEdit = (oldFilter: string) => {
        const newFilterText = editedText.trim().toLowerCase();
        if (newFilterText && newFilterText !== oldFilter) {
            dispatch({ type: 'EDIT_FILTER', payload: { oldFilter, newFilter: newFilterText } });
        }
        setEditingFilter(null);
        setEditedText('');
    };

    return (
         <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in" onClick={onClose}>
            <div className="bg-theme-light-card dark:bg-theme-dark-card rounded-lg shadow-xl w-full max-w-md p-6 text-theme-light-text dark:text-theme-dark-text font-body" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold font-heading mb-4">Manage Filters</h2>
                
                <form onSubmit={handleAdd} className="flex gap-2 mb-4">
                    <input 
                        ref={inputRef}
                        type="text"
                        value={newFilter}
                        onChange={(e) => setNewFilter(e.target.value)}
                        placeholder="Create a new filter..."
                        className="flex-grow p-2 rounded bg-theme-light-bg dark:bg-theme-dark-bg border border-theme-light-text/20 dark:border-theme-dark-text/20 focus:ring-1 focus:ring-theme-light-accent dark:focus:ring-theme-dark-accent outline-none text-sm"
                    />
                    <button type="submit" className="px-4 py-1 bg-theme-light-accent dark:bg-theme-dark-accent text-white rounded hover:bg-theme-light-accent-hover dark:hover:bg-theme-dark-accent-hover transition-colors text-sm font-semibold">Add</button>
                </form>

                <div className="space-y-3">
                    <div>
                        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">My Filters</h3>
                        <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                            {userFilters.length > 0 ? userFilters.map(filter => (
                                <FilterPill
                                    key={filter}
                                    filter={filter}
                                    isEditing={editingFilter === filter}
                                    editedText={editedText}
                                    onSetEditedText={setEditedText}
                                    onStartEdit={() => { setEditingFilter(filter); setEditedText(filter); }}
                                    onSaveEdit={() => handleSaveEdit(filter)}
                                    onCancelEdit={() => setEditingFilter(null)}
                                    onDelete={() => onDeleteFilter(filter)}
                                />
                            )) : (
                                <p className="text-center text-gray-500 py-4 text-sm">No custom filters created yet.</p>
                            )}
                        </div>
                    </div>
                     <div>
                        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">Default Filters</h3>
                        <div className="flex flex-wrap gap-2">
                            {DEFAULT_FILTERS.map(filter => (
                                <span key={filter} className="text-sm font-medium bg-theme-light-bg dark:bg-theme-dark-bg px-3 py-1.5 rounded-full cursor-default">
                                  #{filter}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>


                <div className="flex justify-end mt-6">
                    <button onClick={onClose} className="px-4 py-2 rounded text-theme-light-text dark:text-theme-dark-text hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">Done</button>
                </div>
            </div>
        </div>
    );
};