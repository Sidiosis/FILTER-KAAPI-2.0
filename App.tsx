import React, { useState, useEffect, useMemo, useRef, useReducer } from 'react';
import { Header } from './components/Header';
import { TaskItem } from './components/TaskItem';
import { NoteItem } from './components/NoteItem';
import { EisenhowerMatrixView } from './components/EisenhowerMatrixView';
import { HabitsView } from './components/HabitsView';
import { HabitDetailView } from './components/HabitDetailView';
import { AddItemModal } from './components/AddItemModal';
import { FilterManagerModal } from './components/FilterManagerModal';
import { Timer } from './components/Timer';
import { TaskDashboard } from './components/TaskDashboard';
import type { Task, Note, Habit, AnyItem, ItemToEdit, SubTask, AppState, Action } from './types';
import { View, ItemType } from './types';
import { DEFAULT_FILTERS } from './constants';


const appReducer = (state: AppState, action: Action): AppState => {
    switch (action.type) {
        // --- TASK ACTIONS ---
        case 'ADD_TASK': {
            const { title, description, filters, subTasks, dueDate } = action.payload;
            const newUserFilters = filters.filter(f => !DEFAULT_FILTERS.includes(f) && !state.userFilters.includes(f));
            const newTask: Task = { id: crypto.randomUUID(), title, description, completed: false, filters, subTasks, createdAt: Date.now(), dueDate };
            return {
                ...state,
                tasks: [newTask, ...state.tasks],
                userFilters: [...state.userFilters, ...newUserFilters].sort()
            };
        }
        case 'DELETE_TASK':
            return { ...state, tasks: state.tasks.filter(t => t.id !== action.payload) };
        case 'TOGGLE_TASK_COMPLETE':
            return { ...state, tasks: state.tasks.map(task => task.id === action.payload ? { ...task, completed: !task.completed } : task) };
        case 'TOGGLE_SUBTASK': {
            const { taskId, subTaskId } = action.payload;
            return {
                ...state,
                tasks: state.tasks.map(task => {
                    if (task.id === taskId) return { ...task, subTasks: task.subTasks.map(sub => sub.id === subTaskId ? { ...sub, completed: !sub.completed } : sub )};
                    return task;
                })
            };
        }
       
        // --- NOTE ACTIONS ---
        case 'ADD_NOTE': {
            const { title, content, filters } = action.payload;
            const newUserFilters = filters.filter(f => !DEFAULT_FILTERS.includes(f) && !state.userFilters.includes(f));
            const newNote: Note = { id: crypto.randomUUID(), title, content, filters, createdAt: Date.now() };
            return {
                ...state,
                notes: [newNote, ...state.notes],
                userFilters: [...state.userFilters, ...newUserFilters].sort()
            };
        }
        case 'DELETE_NOTE':
            return { ...state, notes: state.notes.filter(n => n.id !== action.payload) };

        // --- HABIT ACTIONS ---
        case 'ADD_HABIT': {
            const newHabit: Habit = { id: crypto.randomUUID(), title: action.payload, createdAt: Date.now(), completions: {} };
            return { ...state, habits: [newHabit, ...state.habits] };
        }
        case 'DELETE_HABIT':
            return { ...state, habits: state.habits.filter(h => h.id !== action.payload) };
        case 'TOGGLE_HABIT_COMPLETION': {
            const { habitId, dateString } = action.payload;
            return {
                ...state,
                habits: state.habits.map(habit => {
                    if (habit.id === habitId) {
                        const newCompletions = { ...habit.completions };
                        const currentStatus = newCompletions[dateString];
                        
                        if (currentStatus === 'completed') {
                            newCompletions[dateString] = 'skipped';
                        } else if (currentStatus === 'skipped') {
                            delete newCompletions[dateString];
                        } else { // undefined or any other value
                            newCompletions[dateString] = 'completed';
                        }
                        return { ...habit, completions: newCompletions };
                    }
                    return habit;
                })
            };
        }

        // --- GENERAL UPDATE ---
        case 'UPDATE_ITEM': {
            const item = action.payload;
            let newUserFilters: string[] = [];
            let newTasks = state.tasks;
            let newNotes = state.notes;
            let newHabits = state.habits;

            if ('subTasks' in item) { // It's a Task
                newUserFilters = (item as Task).filters.filter(f => !DEFAULT_FILTERS.includes(f) && !state.userFilters.includes(f));
                newTasks = state.tasks.map(t => t.id === item.id ? item : t);
            } else if ('content' in item) { // It's a Note
                newUserFilters = (item as Note).filters.filter(f => !DEFAULT_FILTERS.includes(f) && !state.userFilters.includes(f));
                newNotes = state.notes.map(n => n.id === item.id ? item : n);
            } else { // It's a Habit
                newHabits = state.habits.map(h => h.id === item.id ? item : h);
            }
            return { ...state, tasks: newTasks, notes: newNotes, habits: newHabits, userFilters: [...state.userFilters, ...newUserFilters].sort() };
        }
        
        // --- FILTER ACTIONS ---
        case 'ADD_FILTER': {
            const newFilter = action.payload.trim().toLowerCase();
            if (newFilter && ![...DEFAULT_FILTERS, ...state.userFilters].includes(newFilter)) {
                return { ...state, userFilters: [...state.userFilters, newFilter].sort() };
            }
            return state;
        }
        case 'DELETE_FILTER': {
            const filterToDelete = action.payload;
            return {
                ...state,
                userFilters: state.userFilters.filter(f => f !== filterToDelete),
                tasks: state.tasks.map(t => ({ ...t, filters: t.filters.filter(f => f !== filterToDelete) })),
                notes: state.notes.map(n => ({ ...n, filters: n.filters.filter(f => f !== filterToDelete) })),
            };
        }
        case 'EDIT_FILTER': {
            const { oldFilter, newFilter } = action.payload;
             if ([...DEFAULT_FILTERS, ...state.userFilters].includes(newFilter)) {
                alert(`Filter "${newFilter}" already exists.`);
                return state;
            }
            return {
                ...state,
                userFilters: state.userFilters.map(f => f === oldFilter ? newFilter : f).sort(),
                tasks: state.tasks.map(t => ({...t, filters: t.filters.map(f => f === oldFilter ? newFilter : f) })),
                notes: state.notes.map(n => ({...n, filters: n.filters.map(f => f === oldFilter ? newFilter : f) })),
            };
        }
        
        // --- REORDER ACTION ---
        case 'REORDER_ITEMS': {
            const { itemType, draggedId, targetId } = action.payload;
            if (!draggedId || draggedId === targetId) return state;

            const list = state[itemType];
            const draggedIndex = list.findIndex(item => item.id === draggedId);
            const targetIndex = list.findIndex(item => item.id === targetId);
            if (draggedIndex === -1 || targetIndex === -1) return state;
            
            const newList = [...list];
            const [draggedItem] = newList.splice(draggedIndex, 1);
            newList.splice(targetIndex, 0, draggedItem);

            return { ...state, [itemType]: newList };
        }

        default:
            return state;
    }
};


const App: React.FC = () => {
    const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('theme') !== 'light';
        }
        return true;
    });

    const initializer = (): AppState => {
        if (typeof window === 'undefined') {
            return { tasks: [], notes: [], habits: [], userFilters: [] };
        }
        try {
            return {
                tasks: JSON.parse(localStorage.getItem('tasks') || '[]'),
                notes: JSON.parse(localStorage.getItem('notes') || '[]'),
                habits: JSON.parse(localStorage.getItem('habits') || '[]'),
                userFilters: JSON.parse(localStorage.getItem('userFilters') || '[]'),
            };
        } catch (error) {
            console.error('Failed to parse state from localStorage', error);
            return { tasks: [], notes: [], habits: [], userFilters: [] };
        }
    };
    
    const [state, dispatch] = useReducer(appReducer, undefined, initializer);
    const { tasks, notes, habits, userFilters } = state;

    const [activeView, setActiveView] = useState<View>(View.Tasks);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalInitialTab, setModalInitialTab] = useState<ItemType>(ItemType.Task);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [isTimerVisible, setIsTimerVisible] = useState(false);
    const [isTaskDashboardVisible, setIsTaskDashboardVisible] = useState(false);
    const [showCompleted, setShowCompleted] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilters, setActiveFilters] = useState<string[]>([]);
    const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);
    const [itemToEdit, setItemToEdit] = useState<ItemToEdit | null>(null);
    const [draggedItemId, setDraggedItemId] = useState<string | null>(null);

    // --- Timer State ---
    const [timerPresetMinutes, setTimerPresetMinutes] = useState<number>(() => {
        try {
            const saved = localStorage.getItem('timerPresetMinutes');
            return saved ? JSON.parse(saved) : 25;
        } catch {
            return 25;
        }
    });
    const [timerMinutes, setTimerMinutes] = useState(timerPresetMinutes);
    const [timerSeconds, setTimerSeconds] = useState(0);
    const [isTimerActive, setIsTimerActive] = useState(false); // Is countdown running
    const [isTimerSessionActive, setIsTimerSessionActive] = useState(false); // Is a timer set and not reset/finished
    const timerRef = useRef<number | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const alarmIntervalRef = useRef<number | null>(null);
    
    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDarkMode]);
    
    // --- Data Persistence ---
    useEffect(() => { localStorage.setItem('tasks', JSON.stringify(tasks)); }, [tasks]);
    useEffect(() => { localStorage.setItem('notes', JSON.stringify(notes)); }, [notes]);
    useEffect(() => { localStorage.setItem('habits', JSON.stringify(habits)); }, [habits]);
    useEffect(() => { localStorage.setItem('userFilters', JSON.stringify(userFilters)); }, [userFilters]);
    useEffect(() => { localStorage.setItem('timerPresetMinutes', JSON.stringify(timerPresetMinutes)); }, [timerPresetMinutes]);


    // --- Timer Logic & Alarm ---
    const stopAlarm = () => {
        if (alarmIntervalRef.current) {
            clearInterval(alarmIntervalRef.current);
            alarmIntervalRef.current = null;
        }
        if (audioContextRef.current) {
            if (audioContextRef.current.state === 'running') {
                audioContextRef.current.close().catch(e => console.error("Error closing AudioContext:", e));
            }
            audioContextRef.current = null;
        }
    };
    
    const playAlarm = () => {
        stopAlarm(); // Ensure no other alarm is running
        try {
            const context = new (window.AudioContext || (window as any).webkitAudioContext)();
            audioContextRef.current = context;

            const playBeep = () => {
                if (!context || context.state !== 'running') return;
                const oscillator = context.createOscillator();
                const gainNode = context.createGain();
                oscillator.connect(gainNode);
                gainNode.connect(context.destination);
                
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(880, context.currentTime);
                gainNode.gain.setValueAtTime(0.3, context.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.00001, context.currentTime + 0.5);
                
                oscillator.start(context.currentTime);
                oscillator.stop(context.currentTime + 0.5);
            };
            
            playBeep();
            alarmIntervalRef.current = window.setInterval(playBeep, 1000);

            setTimeout(stopAlarm, 30000); // Stop after 30s
        } catch (e) {
            console.error("Could not play alarm sound:", e);
        }
    };


    useEffect(() => {
        if (isTimerActive) {
            timerRef.current = window.setInterval(() => {
                setTimerSeconds(s => {
                    if (s > 0) return s - 1;
                    setTimerMinutes(m => {
                        if (m > 0) return m - 1;
                        // Timer finished
                        setIsTimerActive(false);
                        setIsTimerSessionActive(false);
                        playAlarm();
                        setIsTimerVisible(true);
                        return 0;
                    });
                    return 59;
                });
            }, 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [isTimerActive]);

    const toggleTimer = () => {
        if (!isTimerActive && (timerMinutes > 0 || timerSeconds > 0)) {
            stopAlarm();
            setIsTimerSessionActive(true);
        }
        setIsTimerActive(prev => !prev);
    };

    const resetTimer = () => {
        stopAlarm();
        setIsTimerActive(false);
        setIsTimerSessionActive(false);
        setTimerMinutes(timerPresetMinutes);
        setTimerSeconds(0);
    };

    const setTime = (mins: number) => {
        stopAlarm();
        setIsTimerActive(false);
        setIsTimerSessionActive(true);
        setTimerMinutes(mins);
        setTimerPresetMinutes(mins);
        setTimerSeconds(0);
    };
    
    const handleResetAndOpenTimer = () => {
        resetTimer();
        setIsTimerVisible(true);
    };

    const handleCloseTimerPanel = () => {
        stopAlarm();
        setIsTimerVisible(false);
    };

    const toggleDarkMode = () => setIsDarkMode(prev => !prev);
    
    const openModal = (tab: ItemType = ItemType.Task) => {
        setItemToEdit(null);
        setModalInitialTab(tab);
        setIsModalOpen(true);
    }

    const handleTasksViewClick = () => {
      if (activeView === View.Tasks) {
        setIsTaskDashboardVisible(prev => !prev);
      } else {
        setActiveView(View.Tasks);
        setIsTaskDashboardVisible(false);
      }
    };

    // --- Edit Handlers ---
    const handleEditItem = (item: AnyItem, type: ItemType) => {
      setItemToEdit({ item, type });
      setIsModalOpen(true);
    };

    const handleDeleteFilter = (filterToDelete: string) => {
        dispatch({ type: 'DELETE_FILTER', payload: filterToDelete });
        // Also remove from active filters if it's there
        setActiveFilters(prev => prev.filter(f => f !== filterToDelete));
    };
    
    // --- Filter Management ---
    const allAvailableFilters = useMemo(() => Array.from(new Set([...DEFAULT_FILTERS, ...userFilters])), [userFilters]);

    const toggleFilter = (filter: string) => { 
        setActiveFilters(prev => prev.includes(filter) ? prev.filter(f => f !== filter) : [...prev, filter]);
    };
    
    // --- Drag and Drop Handlers ---
    const handleDragStart = (e: React.DragEvent, id: string) => {
        setDraggedItemId(id);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent) => e.preventDefault();
    
    const handleDrop = (targetId: string, itemType: 'tasks' | 'notes' | 'habits') => {
        if(draggedItemId) {
            dispatch({ type: 'REORDER_ITEMS', payload: { itemType, draggedId: draggedItemId, targetId }});
        }
        setDraggedItemId(null);
    };

    const filteredTasks = useMemo(() => tasks
        .filter(task => (showCompleted || !task.completed) && (activeFilters.length === 0 || activeFilters.every(f => task.filters.includes(f))) && (task.title.toLowerCase().includes(searchTerm.toLowerCase()) || task.description.toLowerCase().includes(searchTerm.toLowerCase())))
    , [tasks, searchTerm, activeFilters, showCompleted]);
    
    const filteredNotes = useMemo(() => notes.filter(note => (activeFilters.length === 0 || activeFilters.every(f => note.filters.includes(f))) && (note.title.toLowerCase().includes(searchTerm.toLowerCase()) || note.content.toLowerCase().includes(searchTerm.toLowerCase()))), [notes, searchTerm, activeFilters]);

    const renderContent = () => {
        switch(activeView) {
            case View.Tasks:
                if (isTaskDashboardVisible) {
                    return <TaskDashboard 
                                tasks={tasks} 
                                dispatch={dispatch} 
                                onEditTask={(task) => handleEditItem(task, ItemType.Task)}
                            />;
                }
                return (
                    <div className="space-y-3 p-4">
                        {filteredTasks.length > 0 ? filteredTasks.map(task => 
                            <TaskItem 
                                key={task.id} 
                                task={task} 
                                dispatch={dispatch}
                                onEdit={() => handleEditItem(task, ItemType.Task)}
                                onDragStart={(e, id) => handleDragStart(e, id)}
                                onDrop={(e, id) => {e.preventDefault(); handleDrop(id, 'tasks')}}
                                onDragOver={handleDragOver}
                            />
                        ) : <p className="text-center text-gray-500 mt-8">No tasks found. Time for a coffee!</p>}
                    </div>
                );
            case View.Matrix: return <EisenhowerMatrixView tasks={tasks} onToggleComplete={(id) => dispatch({ type: 'TOGGLE_TASK_COMPLETE', payload: id })} showCompleted={showCompleted} />;
            case View.Notes: return (
                <div className="space-y-3 p-4">
                    {filteredNotes.length > 0 ? filteredNotes.map(note => 
                        <NoteItem 
                            key={note.id} 
                            note={note} 
                            dispatch={dispatch}
                            onEdit={() => handleEditItem(note, ItemType.Note)}
                            onDragStart={(e, id) => handleDragStart(e, id)}
                            onDrop={(e, id) => {e.preventDefault(); handleDrop(id, 'notes')}}
                            onDragOver={handleDragOver}
                        />
                    ) : <p className="text-center text-gray-500 mt-8">No notes yet. Add your first one!</p>}
                </div>
            );
            case View.Habits:
                const selectedHabit = habits.find(h => h.id === selectedHabitId);
                if (selectedHabit) return <HabitDetailView 
                                                habit={selectedHabit} 
                                                onBack={() => setSelectedHabitId(null)} 
                                                dispatch={dispatch}
                                                onEdit={(habit) => handleEditItem(habit, ItemType.Habit)}
                                            />;
                return <HabitsView 
                            habits={habits} 
                            dispatch={dispatch}
                            onSelectHabit={setSelectedHabitId} 
                            onAddHabit={() => openModal(ItemType.Habit)}
                            onDragStart={(e, id) => handleDragStart(e, id)}
                            onDrop={(e, id) => {e.preventDefault(); handleDrop(id, 'habits')}}
                            onDragOver={handleDragOver}
                        />;
            default: return null;
        }
    };

    return (
        <div className="flex flex-col h-screen font-body bg-theme-light-bg dark:bg-theme-dark-bg text-theme-light-text dark:text-theme-dark-text overflow-x-hidden">
            <Header isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} timer={!isTimerVisible && isTimerSessionActive ? { minutes: timerMinutes, seconds: timerSeconds } : null} />
            <main className="flex-grow overflow-y-auto pb-4 hide-scrollbar">{renderContent()}</main>

            <footer className="relative flex-shrink-0 bg-theme-light-card dark:bg-theme-dark-card shadow-inner flex flex-col">
                {isTimerSessionActive && (
                    <div className="w-full flex justify-center items-center gap-4 p-2 bg-theme-light-bg dark:bg-theme-dark-bg border-b border-theme-light-text/10 dark:border-theme-dark-text/10">
                        <button 
                            onClick={toggleTimer} 
                            className="font-mono font-bold text-lg text-theme-light-accent dark:text-theme-dark-accent p-1 rounded-md hover:bg-theme-light-text/10 dark:hover:bg-theme-dark-text/10"
                            aria-label={isTimerActive ? "Pause timer" : "Start timer"}
                        >
                            {String(timerMinutes).padStart(2, '0')}:{String(timerSeconds).padStart(2, '0')}
                        </button>
                        <button 
                            onClick={handleResetAndOpenTimer} 
                            className="p-2 rounded-full text-theme-light-text/70 dark:text-theme-dark-text/70 hover:bg-theme-light-text/10 dark:hover:bg-theme-dark-text/10"
                            aria-label="Reset timer and open settings"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </button>
                    </div>
                )}
                <div className="p-2 space-y-2">
                    <div className="flex items-center gap-1 px-2">
                         <div className="relative flex-1 min-w-0">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            </span>
                            <input 
                                type="text" 
                                placeholder="Search..." 
                                value={searchTerm} 
                                onChange={(e) => setSearchTerm(e.target.value)} 
                                className="w-full h-9 p-2 pl-8 rounded bg-theme-light-bg dark:bg-theme-dark-bg border border-transparent focus:ring-1 focus:ring-theme-light-accent dark:focus:ring-theme-dark-accent outline-none text-sm"
                            />
                        </div>
                        {(activeView === View.Tasks || activeView === View.Matrix) && 
                            <button onClick={() => setShowCompleted(!showCompleted)} className={`px-2 h-9 text-xs rounded whitespace-nowrap flex-shrink-0 ${showCompleted ? 'bg-theme-light-accent/20 dark:bg-theme-dark-accent/20' : 'bg-theme-light-bg dark:bg-theme-dark-bg'}`}>{showCompleted ? 'Hide Completed' : 'Show Completed'}</button>
                        }
                        <button onClick={() => setIsFilterModalOpen(true)} className="px-2 h-9 text-xs rounded bg-theme-light-bg dark:bg-theme-dark-bg flex items-center justify-center flex-shrink-0">Filters</button>
                        <button onClick={() => openModal()} className="px-3 h-9 text-xs rounded bg-theme-light-accent dark:bg-theme-dark-accent text-white hover:bg-theme-light-accent-hover dark:hover:bg-theme-dark-accent-hover flex items-center justify-center flex-shrink-0">Add</button>
                    </div>
                    <div className="flex flex-wrap justify-center items-center gap-2 border-t border-b border-theme-light-text/10 dark:border-theme-dark-text/10 py-2">
                        <button onClick={handleTasksViewClick} className={`px-3 py-1 rounded-full text-sm ${activeView === View.Tasks ? 'bg-theme-light-accent dark:bg-theme-dark-accent text-white' : ''}`}>Tasks</button>
                        <button onClick={() => setActiveView(View.Matrix)} className={`px-3 py-1 rounded-full text-sm ${activeView === View.Matrix ? 'bg-theme-light-accent dark:bg-theme-dark-accent text-white' : ''}`}>Matrix</button>
                        <button onClick={() => setActiveView(View.Notes)} className={`px-3 py-1 rounded-full text-sm ${activeView === View.Notes ? 'bg-theme-light-accent dark:bg-theme-dark-accent text-white' : ''}`}>Notes</button>
                        <button onClick={() => { setActiveView(View.Habits); setSelectedHabitId(null); }} className={`px-3 py-1 rounded-full text-sm ${activeView === View.Habits ? 'bg-theme-light-accent dark:bg-theme-dark-accent text-white' : ''}`}>Habits</button>
                        <button onClick={() => setIsTimerVisible(true)} className="px-3 py-1 rounded-full text-sm">Timer</button>
                    </div>
                    <div className="overflow-x-auto px-2 pb-1 hide-scrollbar">
                        <div className="flex justify-between items-center gap-2">
                            <div className="flex gap-1 flex-shrink-0">
                                {DEFAULT_FILTERS.map(filter => (
                                    <button key={filter} onClick={() => toggleFilter(filter)} className={`flex-shrink-0 px-2 py-1 text-xs rounded-full ${activeFilters.includes(filter) ? 'bg-theme-light-accent-hover dark:bg-theme-dark-accent-hover text-white' : 'bg-theme-light-bg dark:bg-theme-dark-bg'}`}>#{filter}</button>
                                ))}
                            </div>
                            <div className="flex gap-1">
                                {userFilters.map(filter => (
                                    <button key={filter} onClick={() => toggleFilter(filter)} className={`flex-shrink-0 px-2 py-1 text-xs rounded-full ${activeFilters.includes(filter) ? 'bg-theme-light-accent-hover dark:bg-theme-dark-accent-hover text-white' : 'bg-theme-light-bg dark:bg-theme-dark-bg'}`}>#{filter}</button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
            
            <AddItemModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setItemToEdit(null); }} dispatch={dispatch} itemToEdit={itemToEdit} initialTab={modalInitialTab} allAvailableFilters={allAvailableFilters} />
            <FilterManagerModal isOpen={isFilterModalOpen} onClose={() => setIsFilterModalOpen(false)} userFilters={userFilters} dispatch={dispatch} onDeleteFilter={handleDeleteFilter} />
            <Timer isVisible={isTimerVisible} onClose={handleCloseTimerPanel} minutes={timerMinutes} seconds={timerSeconds} isActive={isTimerActive} toggleTimer={toggleTimer} resetTimer={resetTimer} setTime={setTime} />
        </div>
    );
};

export default App;