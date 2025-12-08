// Task Status constants
export const TaskStatus = {
    TODO: 'To Do',
    IN_PROGRESS: 'In Progress',
    DONE: 'Done',
} as const;

export type TaskStatus = typeof TaskStatus[keyof typeof TaskStatus];

// Priority constants
export const Priority = {
    HIGH: 'High',
    MEDIUM: 'Medium',
    LOW: 'Low',
} as const;

export type Priority = typeof Priority[keyof typeof Priority];

export interface User {
    id: string;
    name: string;
    avatar: string;
    capacity: number; // max hours per day
}

export interface Task {
    id: string;
    title: string;
    status: TaskStatus;
    assignee: User;
    priority: Priority;
    startDate: string; // ISO Date string
    duration: number; // in days
    dependencies: string[]; // array of Task IDs
    color: string;
    effort: number; // in hours
    cost: number; // in USD
}

export interface Delay {
    taskId: string;
    days: number;
}

export interface Scenario {
    id: string;
    name: string;
    tasks: Task[];
    delays: Delay[];
    impactSummary: string | null;
    totalDuration: number;
    overbookedUsers: string[];
    reassignmentSuggestions: { taskId: string, suggestedUser: User }[];
    isAnalyzing: boolean;
}

export interface SimulationState {
    active: boolean;
    scenarios: Scenario[];
    activeScenarioId: string | null;
}
