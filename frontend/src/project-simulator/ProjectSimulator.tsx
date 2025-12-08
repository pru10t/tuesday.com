import React, { useState, useCallback } from 'react';
import { INITIAL_TASKS } from './constants';
import type { Task, SimulationState, Scenario } from './types';
import { TaskStatus } from './types';
import { TaskCard } from './components/TaskCard';
import { SimulationPanel } from './components/SimulationPanel';
import { FullWidthGantt } from './components/FullWidthGantt';
import { analyzeSimulationImpact } from './services/geminiService';
import { Layout, Search, Bell, Plus, MoreHorizontal, Calendar } from 'lucide-react';

const ProjectSimulator: React.FC = () => {
    const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
    const [simulationState, setSimulationState] = useState<SimulationState>({
        active: false,
        scenarios: [
            {
                id: '1',
                name: 'Scenario 1',
                tasks: JSON.parse(JSON.stringify(INITIAL_TASKS)),
                delays: [],
                impactSummary: null,
                totalDuration: 0,
                overbookedUsers: [],
                reassignmentSuggestions: [],
                isAnalyzing: false
            }
        ],
        activeScenarioId: '1'
    });
    const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
    const [showTimeline, setShowTimeline] = useState(false);

    const activeScenario = simulationState.scenarios.find(s => s.id === simulationState.activeScenarioId) || simulationState.scenarios[0];

    // Scenario Management
    const addScenario = () => {
        const newId = (simulationState.scenarios.length + 1).toString();
        const newScenario: Scenario = {
            id: newId,
            name: `Scenario ${newId}`,
            tasks: JSON.parse(JSON.stringify(tasks)),
            delays: [],
            impactSummary: null,
            totalDuration: 0,
            overbookedUsers: [],
            reassignmentSuggestions: [],
            isAnalyzing: false
        };
        setSimulationState(prev => ({
            ...prev,
            scenarios: [...prev.scenarios, newScenario],
            activeScenarioId: newId
        }));
    };

    const removeScenario = (id: string) => {
        if (simulationState.scenarios.length <= 1) return;
        setSimulationState(prev => {
            const newScenarios = prev.scenarios.filter(s => s.id !== id);
            return {
                ...prev,
                scenarios: newScenarios,
                activeScenarioId: prev.activeScenarioId === id ? newScenarios[0].id : prev.activeScenarioId
            };
        });
    };

    const setActiveScenario = (id: string) => {
        setSimulationState(prev => ({ ...prev, activeScenarioId: id }));
    };

    const updateActiveScenario = (updates: Partial<Scenario>) => {
        setSimulationState(prev => ({
            ...prev,
            scenarios: prev.scenarios.map(s => s.id === prev.activeScenarioId ? { ...s, ...updates } : s)
        }));
    };

    // Calculate dependencies when simulation runs
    const runSimulation = useCallback(async () => {
        if (activeScenario.delays.length === 0) return;

        setSimulationState(prev => ({ ...prev, active: true }));
        updateActiveScenario({ isAnalyzing: true, impactSummary: null });

        // Deep copy tasks from original source for fresh simulation base
        let newTasks = JSON.parse(JSON.stringify(tasks)) as Task[];

        // Apply all delays
        activeScenario.delays.forEach(delay => {
            const task = newTasks.find(t => t.id === delay.taskId);
            if (task) {
                const startDate = new Date(task.startDate);
                startDate.setDate(startDate.getDate() + delay.days);
                task.startDate = startDate.toISOString().split('T')[0];
            }
        });

        // Cascade changes to dependent tasks (Simplistic dependency resolution)
        let changed = true;
        while (changed) {
            changed = false;
            newTasks.forEach(task => {
                if (task.dependencies.length > 0) {
                    // Find max end date of dependencies
                    let maxDepEnd = 0;
                    task.dependencies.forEach(depId => {
                        const dep = newTasks.find(d => d.id === depId);
                        if (dep) {
                            const depStart = new Date(dep.startDate).getTime();
                            const depEnd = depStart + (dep.duration * 24 * 60 * 60 * 1000);
                            if (depEnd > maxDepEnd) maxDepEnd = depEnd;
                        }
                    });

                    const currentStart = new Date(task.startDate).getTime();
                    // If task starts before dependency ends, push it
                    if (currentStart < maxDepEnd) {
                        task.startDate = new Date(maxDepEnd).toISOString().split('T')[0];
                        changed = true;
                    }
                }
            });
        }

        // Calculate Metrics
        const startDates = newTasks.map(t => new Date(t.startDate).getTime());
        const endDates = newTasks.map(t => new Date(t.startDate).getTime() + (t.duration * 24 * 60 * 60 * 1000));
        const minStart = Math.min(...startDates);
        const maxEnd = Math.max(...endDates);
        const totalDuration = Math.ceil((maxEnd - minStart) / (1000 * 60 * 60 * 24));

        // Identify Overbooked Users
        const userWorkload: Record<string, Record<string, number>> = {}; // userId -> date -> hours
        const overbookedUsersSet = new Set<string>();

        newTasks.forEach(task => {
            const start = new Date(task.startDate);
            for (let i = 0; i < task.duration; i++) {
                const current = new Date(start);
                current.setDate(start.getDate() + i);
                const dateStr = current.toISOString().split('T')[0];

                if (!userWorkload[task.assignee.id]) userWorkload[task.assignee.id] = {};
                if (!userWorkload[task.assignee.id][dateStr]) userWorkload[task.assignee.id][dateStr] = 0;

                // Distribute effort evenly across duration
                const dailyEffort = (task.effort || 0) / task.duration;
                userWorkload[task.assignee.id][dateStr] += dailyEffort;

                if (userWorkload[task.assignee.id][dateStr] > (task.assignee.capacity || 8)) {
                    overbookedUsersSet.add(task.assignee.id);
                }
            }
        });

        // Generate Reassignment Suggestions (Mock logic)
        const reassignmentSuggestions: { taskId: string; suggestedUser: typeof tasks[0]['assignee'] }[] = [];
        if (overbookedUsersSet.size > 0) {
            // Simple mock: suggest the next available user
            const availableUsers = [
                { id: 'u1', name: 'Alex Johnson', avatar: 'https://picsum.photos/seed/alex/64/64', capacity: 8 },
                { id: 'u2', name: 'Sam Smith', avatar: 'https://picsum.photos/seed/sam/64/64', capacity: 8 },
                { id: 'u3', name: 'Taylor Doe', avatar: 'https://picsum.photos/seed/taylor/64/64', capacity: 8 }
            ];

            overbookedUsersSet.forEach(userId => {
                const suggestedUser = availableUsers.find(u => u.id !== userId); // Just pick someone else
                if (suggestedUser) {
                    // Find a task assigned to this user to suggest moving
                    const userTask = newTasks.find(t => t.assignee.id === userId);
                    if (userTask) {
                        reassignmentSuggestions.push({
                            taskId: userTask.id,
                            suggestedUser: suggestedUser
                        });
                    }
                }
            });
        }


        // Call AI for analysis
        const impactAnalysis = await analyzeSimulationImpact(
            tasks,
            newTasks,
            tasks.find(t => t.id === activeScenario.delays[0]?.taskId),
            activeScenario.delays[0]?.days || 0
        );

        updateActiveScenario({
            tasks: newTasks,
            impactSummary: impactAnalysis,
            isAnalyzing: false,
            totalDuration,
            overbookedUsers: Array.from(overbookedUsersSet),
            reassignmentSuggestions
        });

    }, [tasks, activeScenario]);

    const resetSimulation = () => {
        setSimulationState(prev => ({
            ...prev,
            active: false,
            scenarios: prev.scenarios.map(s => ({
                ...s,
                tasks: JSON.parse(JSON.stringify(tasks)),
                delays: [],
                impactSummary: null,
                totalDuration: 0,
                overbookedUsers: [],
                reassignmentSuggestions: [],
                isAnalyzing: false
            }))
        }));
    };

    const getTasksByStatus = (status: TaskStatus, isSim: boolean) => {
        const source = isSim ? activeScenario.tasks : tasks;
        return source.filter(t => t.status === status);
    };

    // Drag and Drop Handlers
    const handleDragStart = (id: string) => {
        setDraggedTaskId(id);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = (status: TaskStatus) => {
        if (!draggedTaskId) return;

        const updateList = (list: Task[]) => {
            return list.map(t => {
                if (t.id === draggedTaskId) {
                    return { ...t, status };
                }
                return t;
            });
        };

        if (simulationState.active) {
            updateActiveScenario({
                tasks: updateList(activeScenario.tasks)
            });
        } else {
            setTasks(prev => updateList(prev));
        }
        setDraggedTaskId(null);
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 overflow-hidden text-slate-800 font-sans selection:bg-blue-100">
            {/* Header Area */}
            <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-30 shadow-sm">
                <div className="flex items-center space-x-4">
                    <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-200/50">
                        <Layout size={20} />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-slate-800 leading-none">Product Launch Q4</h1>
                        <div className="flex items-center space-x-2 mt-1">
                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Project Board</span>
                            {simulationState.active && (
                                <span className="bg-amber-100 text-amber-700 text-[10px] px-2 py-0.5 rounded-full font-bold border border-amber-200 animate-pulse">
                                    SCENARIO MODE ACTIVE
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center space-x-4">
                    {/* Timeline Button */}
                    <button
                        onClick={() => setShowTimeline(true)}
                        className="flex items-center space-x-2 bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded-lg font-medium text-sm transition-colors"
                    >
                        <Calendar size={16} />
                        <span>Timeline</span>
                    </button>

                    {/* Mock search bar */}
                    <div className="relative hidden md:block">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input type="text" placeholder="Search tasks..." className="pl-9 pr-4 py-1.5 rounded-full bg-slate-100 border border-transparent focus:bg-white focus:border-blue-300 focus:outline-none text-sm transition-all w-64 text-slate-600" />
                    </div>
                    <div className="relative p-2 rounded-full hover:bg-slate-100 cursor-pointer text-slate-500 transition-colors">
                        <Bell size={20} />
                        <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                    </div>
                    <img src="https://picsum.photos/seed/user/32/32" alt="Profile" className="w-8 h-8 rounded-full border border-slate-200 cursor-pointer hover:ring-2 hover:ring-blue-100 transition-all" />
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex flex-1 overflow-hidden">

                {/* Left Side: Kanban */}
                <div className="flex-1 flex flex-col min-w-0 bg-slate-50/50">
                    {/* Kanban Header */}
                    <div className="h-14 border-b border-slate-200 flex items-center px-6 bg-white">
                        <div className="flex space-x-1 text-sm font-medium text-slate-500">
                            <button className="text-blue-600 bg-blue-50 px-3 py-1.5 rounded-md transition-colors">Kanban</button>
                        </div>
                        <div className="ml-auto flex items-center space-x-3">
                            <div className="flex -space-x-2">
                                {/* Tiny avatars for people looking at the board */}
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[10px] text-slate-500 font-bold">
                                        {String.fromCharCode(64 + i)}
                                    </div>
                                ))}
                            </div>
                            <div className="h-4 w-px bg-slate-300 mx-2"></div>
                            <button className="text-xs font-medium text-slate-500 hover:text-blue-600 flex items-center bg-white border border-slate-200 px-3 py-1.5 rounded-full hover:shadow-sm transition-all">
                                <MoreHorizontal size={14} className="mr-1" /> Filter
                            </button>
                        </div>
                    </div>

                    {/* Kanban Columns */}
                    <div className="flex-1 overflow-x-auto overflow-y-hidden p-6">
                        <div className="flex space-x-6 h-full min-w-[800px]">
                            {[TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.DONE].map(status => (
                                <div
                                    key={status}
                                    className="flex-1 flex flex-col h-full min-w-[280px] rounded-xl"
                                    onDragOver={handleDragOver}
                                    onDrop={() => handleDrop(status)}
                                >
                                    <div className="flex items-center justify-between mb-3 px-1">
                                        <div className="flex items-center space-x-2">
                                            <h3 className="font-semibold text-slate-700">{status}</h3>
                                            <span className="bg-slate-200 text-slate-600 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                                                {getTasksByStatus(status, simulationState.active).length}
                                            </span>
                                        </div>
                                        <div className="text-slate-400 hover:text-slate-600 cursor-pointer">
                                            <MoreHorizontal size={16} />
                                        </div>
                                    </div>

                                    <div className="flex-1 overflow-y-auto pr-2 pb-2 transition-colors rounded-xl border border-transparent">
                                        {(simulationState.active ? activeScenario.tasks : tasks)
                                            .filter(t => t.status === status)
                                            .map(task => (
                                                <TaskCard
                                                    key={task.id}
                                                    task={task}
                                                    isSimulated={simulationState.active}
                                                    isDelayedSource={simulationState.active && activeScenario.delays.some(d => d.taskId === task.id)}
                                                    isOverbooked={activeScenario.overbookedUsers?.includes(task.assignee.id)}
                                                    onDragStart={handleDragStart}
                                                />
                                            ))
                                        }
                                        <button className="w-full py-2.5 border border-dashed border-slate-300 rounded-lg flex items-center justify-center text-slate-500 text-sm hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50 transition-all mt-1 group">
                                            <Plus size={16} className="mr-1 group-hover:scale-110 transition-transform" /> Add Item
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Side: Simulation Panel */}
                <div className="w-80 shrink-0 h-full">
                    <SimulationPanel
                        tasks={tasks}
                        simulationState={simulationState}
                        setSimulationState={setSimulationState}
                        onRunSimulation={runSimulation}
                        onReset={resetSimulation}
                        onViewTimeline={() => setShowTimeline(true)}
                        addScenario={addScenario}
                        removeScenario={removeScenario}
                        setActiveScenario={setActiveScenario}
                        updateActiveScenario={updateActiveScenario}
                    />
                </div>

            </main>

            {/* Full Width Gantt Modal */}
            {showTimeline && (
                <FullWidthGantt
                    originalTasks={tasks}
                    simulatedTasks={activeScenario.tasks}
                    scenarioName={activeScenario.name}
                    onClose={() => setShowTimeline(false)}
                />
            )}
        </div>
    );
};

export default ProjectSimulator;
