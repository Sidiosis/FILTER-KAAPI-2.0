export interface SubTask {
  id: string;
  text: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  filters: string[];
  subTasks: SubTask[];
  createdAt: number;
  dueDate?: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  filters: string[];
  createdAt: number;
}

export type HabitCompletionStatus = 'completed' | 'skipped';

export interface Habit {
  id: string;
  title: string;
  createdAt: number;
  completions: Record<string, HabitCompletionStatus>; // e.g. { '2024-07-29': 'completed' }
}

export enum View {
  Tasks,
  Notes,
  Habits,
  Matrix
}

export enum ItemType {
  Task,
  Note,
  Habit
}

export type AnyItem = Task | Note | Habit;

export interface ItemToEdit {
  item: AnyItem;
  type: ItemType;
}


// --- Reducer Types ---

export interface AppState {
  tasks: Task[];
  notes: Note[];
  habits: Habit[];
  userFilters: string[];
}

export type Action =
  | { type: 'ADD_TASK'; payload: { title: string; description: string; filters: string[]; subTasks: SubTask[]; dueDate?: string; } }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'TOGGLE_TASK_COMPLETE'; payload: string }
  | { type: 'TOGGLE_SUBTASK'; payload: { taskId: string; subTaskId: string } }
  | { type: 'UPDATE_ITEM'; payload: AnyItem }
  | { type: 'REORDER_ITEMS'; payload: { itemType: 'tasks' | 'notes' | 'habits', draggedId: string; targetId: string } }
  | { type: 'ADD_NOTE'; payload: { title: string; content: string; filters: string[] } }
  | { type: 'DELETE_NOTE'; payload: string }
  | { type: 'ADD_HABIT'; payload: string }
  | { type: 'DELETE_HABIT'; payload: string }
  | { type: 'TOGGLE_HABIT_COMPLETION'; payload: { habitId: string; dateString: string } }
  | { type: 'ADD_FILTER'; payload: string }
  | { type: 'DELETE_FILTER'; payload: string }
  | { type: 'EDIT_FILTER'; payload: { oldFilter: string; newFilter: string } };