import React, { useState, useEffect, useRef } from 'react';
import { ItemType, AnyItem, ItemToEdit, Task, Note, Habit, SubTask, Action } from '../types';
import { DEFAULT_FILTERS } from '../constants';

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  dispatch: React.Dispatch<Action>;
  itemToEdit: ItemToEdit | null;
  allAvailableFilters: string[];
  initialTab?: ItemType;
}

const DeleteIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>;

export const AddItemModal: React.FC<AddItemModalProps> = ({ isOpen, onClose, dispatch, itemToEdit, allAvailableFilters, initialTab }) => {
  const [activeTab, setActiveTab] = useState<ItemType>(initialTab ?? ItemType.Task);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [customFilter, setCustomFilter] = useState('');
  const [subTasks, setSubTasks] = useState<SubTask[]>([]);
  const [newSubTaskText, setNewSubTaskText] = useState('');
  const [dueDate, setDueDate] = useState('');
  const titleInputRef = useRef<HTMLInputElement>(null);
  
  const isEditing = itemToEdit !== null;

  useEffect(() => {
    if (isOpen) {
      if (itemToEdit) {
        setActiveTab(itemToEdit.type);
        setTitle(itemToEdit.item.title);
        if (itemToEdit.type === ItemType.Task) {
          const task = itemToEdit.item as Task;
          setDescription(task.description);
          setSelectedFilters(task.filters);
          setSubTasks(task.subTasks || []);
          setDueDate(task.dueDate || '');
        } else if (itemToEdit.type === ItemType.Note) {
          const note = itemToEdit.item as Note;
          setContent(note.content);
          setSelectedFilters(note.filters);
        }
      } else {
        setTitle('');
        setDescription('');
        setContent('');
        setSelectedFilters([]);
        setCustomFilter('');
        setSubTasks([]);
        setNewSubTaskText('');
        setDueDate('');
        setActiveTab(initialTab ?? ItemType.Task);
      }
      setTimeout(() => titleInputRef.current?.focus(), 100);
    }
  }, [isOpen, itemToEdit, initialTab]);
  
  useEffect(() => {
      if(isOpen) {
        setTimeout(() => titleInputRef.current?.focus(), 100);
      }
  }, [activeTab, isOpen]);


  if (!isOpen) return null;

  const handleFilterToggle = (filter: string) => {
    setSelectedFilters(prev => 
      prev.includes(filter) ? prev.filter(f => f !== filter) : [...prev, filter]
    );
  };

  const handleAddCustomFilter = () => {
    const newFilter = customFilter.trim().toLowerCase();
    if (newFilter && !selectedFilters.includes(newFilter)) {
      setSelectedFilters(prev => [...prev, newFilter]);
      dispatch({ type: 'ADD_FILTER', payload: newFilter });
      setCustomFilter('');
    }
  };

  const handleAddSubTask = () => {
      if(newSubTaskText.trim() === '') return;
      const newSubTask: SubTask = {
          id: crypto.randomUUID(),
          text: newSubTaskText.trim(),
          completed: false,
      };
      setSubTasks(prev => [...prev, newSubTask]);
      setNewSubTaskText('');
  };

  const handleDeleteSubTask = (id: string) => {
      setSubTasks(prev => prev.filter(sub => sub.id !== id));
  }
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() === '') return;

    if (isEditing) {
      const updatedItem = { ...itemToEdit.item, title };
      if (activeTab === ItemType.Task) {
        (updatedItem as Task).description = description;
        (updatedItem as Task).filters = selectedFilters;
        (updatedItem as Task).subTasks = subTasks;
        (updatedItem as Task).dueDate = dueDate;
      } else if (activeTab === ItemType.Note) {
        (updatedItem as Note).content = content;
        (updatedItem as Note).filters = selectedFilters;
      }
      dispatch({ type: 'UPDATE_ITEM', payload: updatedItem });
    } else {
      switch(activeTab) {
          case ItemType.Task:
              dispatch({ type: 'ADD_TASK', payload: { title, description, filters: selectedFilters, subTasks, dueDate } });
              break;
          case ItemType.Note:
              dispatch({ type: 'ADD_NOTE', payload: { title, content, filters: selectedFilters } });
              break;
          case ItemType.Habit:
              dispatch({ type: 'ADD_HABIT', payload: title });
              break;
      }
    }
    
    onClose();
  };
  
  const renderSubTaskSection = () => (
    <div>
        <label htmlFor="subtask-input" className="block text-sm font-medium mb-1">Sub-tasks</label>
        <div className="flex gap-2">
            <input 
                id="subtask-input"
                type="text"
                value={newSubTaskText}
                onChange={(e) => setNewSubTaskText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSubTask(); } }}
                placeholder="Add a sub-task"
                className="flex-grow p-2 rounded bg-theme-light-bg dark:bg-theme-dark-bg border border-theme-light-text/20 dark:border-theme-dark-text/20 focus:ring-1 focus:ring-theme-light-accent dark:focus:ring-theme-dark-accent outline-none text-sm"
            />
            <button type="button" onClick={handleAddSubTask} className="px-4 py-1 bg-theme-light-accent/80 dark:bg-theme-dark-accent/80 text-white rounded hover:bg-theme-light-accent dark:hover:bg-theme-dark-accent transition-colors text-sm">Add</button>
        </div>
        <div className="mt-2 space-y-1 max-h-24 overflow-y-auto">
            {subTasks.map(sub => (
                <div key={sub.id} className="flex items-center justify-between bg-theme-light-bg/70 dark:bg-theme-dark-bg/70 text-sm p-1.5 rounded">
                    <span>{sub.text}</span>
                    <button type="button" onClick={() => handleDeleteSubTask(sub.id)} className="p-1 text-gray-400 hover:text-red-500 rounded-full"><DeleteIcon/></button>
                </div>
            ))}
        </div>
    </div>
  );

  const renderTaskForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="task-title" className="block text-sm font-medium mb-1">Title</label>
        <input 
          id="task-title"
          ref={titleInputRef}
          type="text" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Buy coffee beans"
          className="w-full p-2 rounded bg-theme-light-bg dark:bg-theme-dark-bg border border-theme-light-text/20 dark:border-theme-dark-text/20 focus:ring-1 focus:ring-theme-light-accent dark:focus:ring-theme-dark-accent outline-none"
        />
      </div>
       <div>
        <label htmlFor="due-date" className="block text-sm font-medium mb-1">Due Date (Optional)</label>
        <input 
          id="due-date"
          type="date" 
          value={dueDate} 
          onChange={(e) => setDueDate(e.target.value)}
          className="w-full p-2 rounded bg-theme-light-bg dark:bg-theme-dark-bg border border-theme-light-text/20 dark:border-theme-dark-text/20 focus:ring-1 focus:ring-theme-light-accent dark:focus:ring-theme-dark-accent outline-none"
        />
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-1">Description (Optional)</label>
        <textarea 
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="More details about the task..."
          rows={3}
          className="w-full p-2 rounded bg-theme-light-bg dark:bg-theme-dark-bg border border-theme-light-text/20 dark:border-theme-dark-text/20 focus:ring-1 focus:ring-theme-light-accent dark:focus:ring-theme-dark-accent outline-none hide-scrollbar"
        />
      </div>
      {renderSubTaskSection()}
      {renderFilters()}
      {renderFormButtons(isEditing ? 'Update Task' : 'Add Task')}
    </form>
  );

  const renderNoteForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="note-title" className="block text-sm font-medium mb-1">Title</label>
        <input 
          id="note-title"
          ref={titleInputRef}
          type="text" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., My brilliant idea"
          className="w-full p-2 rounded bg-theme-light-bg dark:bg-theme-dark-bg border border-theme-light-text/20 dark:border-theme-dark-text/20 focus:ring-1 focus:ring-theme-light-accent dark:focus:ring-theme-dark-accent outline-none"
        />
      </div>
      <div>
        <label htmlFor="content" className="block text-sm font-medium mb-1">Content</label>
        <textarea 
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Jot down your thoughts..."
          rows={5}
          className="w-full p-2 rounded bg-theme-light-bg dark:bg-theme-dark-bg border border-theme-light-text/20 dark:border-theme-dark-text/20 focus:ring-1 focus:ring-theme-light-accent dark:focus:ring-theme-dark-accent outline-none hide-scrollbar"
        />
      </div>
      {renderFilters()}
      {renderFormButtons(isEditing ? 'Update Note' : 'Add Note')}
    </form>
  );
  
  const renderHabitForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="habit-title" className="block text-sm font-medium mb-1">Habit</label>
        <input 
          id="habit-title"
          ref={titleInputRef}
          type="text" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Meditate for 10 minutes"
          className="w-full p-2 rounded bg-theme-light-bg dark:bg-theme-dark-bg border border-theme-light-text/20 dark:border-theme-dark-text/20 focus:ring-1 focus:ring-theme-light-accent dark:focus:ring-theme-dark-accent outline-none"
        />
      </div>
      {renderFormButtons(isEditing ? 'Update Habit' : 'Add Habit')}
    </form>
  );

  const renderFilters = () => {
      let filtersToShow = allAvailableFilters;
      if (activeTab === ItemType.Note) {
          filtersToShow = allAvailableFilters.filter(f => !DEFAULT_FILTERS.includes(f));
      }

      return (
    <div>
        <label className="block text-sm font-medium mb-2">Filters</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {filtersToShow.map(f => (
            <button type="button" key={f} onClick={() => handleFilterToggle(f)} className={`px-3 py-1 text-sm rounded-full transition-colors ${selectedFilters.includes(f) ? 'bg-theme-light-accent dark:bg-theme-dark-accent text-white' : 'bg-theme-light-bg dark:bg-theme-dark-bg'}`}>
              {f}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input 
            type="text"
            value={customFilter}
            onChange={(e) => setCustomFilter(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCustomFilter(); } }}
            placeholder="Add new filter"
            className="flex-grow p-2 rounded bg-theme-light-bg dark:bg-theme-dark-bg border border-theme-light-text/20 dark:border-theme-dark-text/20 focus:ring-1 focus:ring-theme-light-accent dark:focus:ring-theme-dark-accent outline-none text-sm"
          />
          <button type="button" onClick={handleAddCustomFilter} className="px-4 py-1 bg-theme-light-accent/80 dark:bg-theme-dark-accent/80 text-white rounded hover:bg-theme-light-accent dark:hover:bg-theme-dark-accent transition-colors text-sm">Add</button>
        </div>
        <div className="flex flex-wrap gap-1 mt-2">
          {selectedFilters.map(f => (
            <span key={f} className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-full cursor-pointer" onClick={() => handleFilterToggle(f)}>{f} &times;</span>
          ))}
        </div>
    </div>
  )};

  const renderFormButtons = (submitText: string) => (
      <div className="flex justify-end gap-3 pt-4">
        <button type="button" onClick={onClose} className="px-4 py-2 rounded text-theme-light-text dark:text-theme-dark-text hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">Cancel</button>
        <button 
          type="submit"
          disabled={title.trim() === ''}
          className="px-4 py-2 bg-theme-light-accent dark:bg-theme-dark-accent text-white rounded hover:bg-theme-light-accent-hover dark:hover:bg-theme-dark-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitText}
        </button>
      </div>
  );


  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in" onClick={onClose}>
      <div className="bg-theme-light-card dark:bg-theme-dark-card rounded-lg shadow-xl w-full max-w-md p-6 text-theme-light-text dark:text-theme-dark-text font-body" onClick={e => e.stopPropagation()}>
        <div className="flex border-b border-theme-light-text/20 dark:border-theme-dark-text/20 mb-4">
          <button disabled={isEditing} onClick={() => setActiveTab(ItemType.Task)} className={`flex-1 py-2 text-center font-medium ${activeTab === ItemType.Task ? 'border-b-2 border-theme-light-accent dark:border-theme-dark-accent' : 'opacity-60'} disabled:opacity-50 disabled:cursor-not-allowed`}>Task</button>
          <button disabled={isEditing} onClick={() => setActiveTab(ItemType.Note)} className={`flex-1 py-2 text-center font-medium ${activeTab === ItemType.Note ? 'border-b-2 border-theme-light-accent dark:border-theme-dark-accent' : 'opacity-60'} disabled:opacity-50 disabled:cursor-not-allowed`}>Note</button>
          <button disabled={isEditing} onClick={() => setActiveTab(ItemType.Habit)} className={`flex-1 py-2 text-center font-medium ${activeTab === ItemType.Habit ? 'border-b-2 border-theme-light-accent dark:border-theme-dark-accent' : 'opacity-60'} disabled:opacity-50 disabled:cursor-not-allowed`}>Habit</button>
        </div>
        {activeTab === ItemType.Task && renderTaskForm()}
        {activeTab === ItemType.Note && renderNoteForm()}
        {activeTab === ItemType.Habit && renderHabitForm()}
      </div>
    </div>
  );
};