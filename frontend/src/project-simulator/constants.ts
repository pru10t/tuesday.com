import type { Task } from './types';
import { Priority, TaskStatus } from './types';

export const USERS = [
    { id: 'u1', name: 'Alex Johnson', avatar: 'https://picsum.photos/seed/alex/64/64', capacity: 8 },
    { id: 'u2', name: 'Sam Smith', avatar: 'https://picsum.photos/seed/sam/64/64', capacity: 8 },
    { id: 'u3', name: 'Taylor Doe', avatar: 'https://picsum.photos/seed/taylor/64/64', capacity: 8 },
];

const TODAY = new Date();
const formatDate = (daysAdd: number) => {
    const d = new Date(TODAY);
    d.setDate(d.getDate() + daysAdd);
    return d.toISOString().split('T')[0];
};

export const INITIAL_TASKS: Task[] = [
    {
        id: 't1',
        title: 'Market Research',
        status: TaskStatus.DONE,
        assignee: USERS[0],
        priority: Priority.HIGH,
        startDate: formatDate(-5),
        duration: 5,
        dependencies: [],
        color: '#3b82f6', // Blue
        effort: 20,
        cost: 1500
    },
    {
        id: 't2',
        title: 'Concept Design',
        status: TaskStatus.IN_PROGRESS,
        assignee: USERS[1],
        priority: Priority.HIGH,
        startDate: formatDate(0),
        duration: 4,
        dependencies: ['t1'],
        color: '#8b5cf6', // Purple
        effort: 32,
        cost: 2400
    },
    {
        id: 't3',
        title: 'Technical Feasibility',
        status: TaskStatus.IN_PROGRESS,
        assignee: USERS[2],
        priority: Priority.MEDIUM,
        startDate: formatDate(1),
        duration: 3,
        dependencies: ['t1'],
        color: '#10b981', // Emerald
        effort: 16,
        cost: 1200
    },
    {
        id: 't4',
        title: 'Prototype Development',
        status: TaskStatus.TODO,
        assignee: USERS[0],
        priority: Priority.HIGH,
        startDate: formatDate(5),
        duration: 7,
        dependencies: ['t2', 't3'],
        color: '#f59e0b', // Amber
        effort: 40,
        cost: 3000
    },
    {
        id: 't5',
        title: 'User Testing',
        status: TaskStatus.TODO,
        assignee: USERS[1],
        priority: Priority.MEDIUM,
        startDate: formatDate(12),
        duration: 5,
        dependencies: ['t4'],
        color: '#ef4444', // Red
        effort: 24,
        cost: 1800
    },
    {
        id: 't6',
        title: 'Final Launch Prep',
        status: TaskStatus.TODO,
        assignee: USERS[2],
        priority: Priority.LOW,
        startDate: formatDate(17),
        duration: 3,
        dependencies: ['t5'],
        color: '#6366f1', // Indigo
        effort: 12,
        cost: 900
    }
];
