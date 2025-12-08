import React, { useMemo, useState } from 'react';
import type { Task } from '../types';
import { calculateCriticalPath } from '../utils/criticalPath';
import { X, Info, Calendar, User as UserIcon } from 'lucide-react';

interface FullWidthGanttProps {
    originalTasks: Task[];
    simulatedTasks: Task[];
    scenarioName?: string;
    onClose: () => void;
}

export const FullWidthGantt: React.FC<FullWidthGanttProps> = ({ originalTasks, simulatedTasks, scenarioName = "Simulated Schedule", onClose }) => {
    const [hoveredTask, setHoveredTask] = useState<string | null>(null);

    // Calculate critical paths
    const originalCriticalPath = useMemo(() => calculateCriticalPath(originalTasks), [originalTasks]);
    const simulatedCriticalPath = useMemo(() => calculateCriticalPath(simulatedTasks), [simulatedTasks]);

    // Determine date range
    const { minDate, maxDate, totalDays } = useMemo(() => {
        const allTasks = [...originalTasks, ...simulatedTasks];
        const timestamps = allTasks.flatMap(t => {
            const start = new Date(t.startDate).getTime();
            const end = start + t.duration * 24 * 60 * 60 * 1000;
            return [start, end];
        });

        const min = Math.min(...timestamps);
        const max = Math.max(...timestamps);
        const buffer = 5 * 24 * 60 * 60 * 1000; // 5 days buffer

        return {
            minDate: min - buffer,
            maxDate: max + buffer,
            totalDays: (max - min + 2 * buffer) / (24 * 60 * 60 * 1000)
        };
    }, [originalTasks, simulatedTasks]);

    const getPosition = (dateStr: string) => {
        const current = new Date(dateStr).getTime();
        return ((current - minDate) / (maxDate - minDate)) * 100;
    };

    const getWidth = (days: number) => {
        return (days / totalDays) * 100;
    };

    // Identify delayed tasks
    const delayedTaskIds = useMemo(() => {
        const delayed = new Set<string>();
        const originalMap = new Map(originalTasks.map(t => [t.id, t]));

        simulatedTasks.forEach(simTask => {
            const original = originalMap.get(simTask.id);
            if (original) {
                const simStart = new Date(simTask.startDate).getTime();
                const origStart = new Date(original.startDate).getTime();
                if (simStart > origStart) {
                    delayed.add(simTask.id);
                }
            }
        });
        return delayed;
    }, [originalTasks, simulatedTasks]);

    const renderHeader = () => {
        const days = [];
        for (let i = 0; i < totalDays; i++) {
            const date = new Date(minDate + i * 24 * 60 * 60 * 1000);
            days.push(
                <div key={i} className="flex-1 border-r border-slate-200 text-[10px] text-slate-400 flex flex-col items-center justify-center h-full min-w-[40px]">
                    <span className="font-bold">{date.getDate()}</span>
                    <span className="text-[8px] uppercase">{date.toLocaleDateString('en-US', { weekday: 'narrow' })}</span>
                </div>
            );
        }
        return <div className="flex h-8 border-b border-slate-200 bg-slate-50">{days}</div>;
    };

    const renderGantt = (tasks: Task[], criticalPath: Set<string>, isSimulated: boolean) => (
        <div className="relative h-full min-w-[600px] border-r border-slate-200 last:border-r-0 bg-slate-50/30 flex flex-col">
            {/* Header */}
            <div className={`sticky top-0 z-20 px-4 py-3 border-b border-slate-200 backdrop-blur-sm shrink-0 ${isSimulated ? 'bg-blue-50/80' : 'bg-white/80'}`}>
                <h3 className={`font-bold text-sm flex items-center ${isSimulated ? 'text-blue-700' : 'text-slate-700'}`}>
                    <div className={`w-2 h-2 rounded-full mr-2 ${isSimulated ? 'bg-blue-500' : 'bg-slate-400'}`}></div>
                    {isSimulated ? scenarioName : 'Original Schedule'}
                </h3>
            </div>

            {/* Date Header */}
            <div className="sticky top-[45px] z-10 bg-white shadow-sm">
                {renderHeader()}
            </div>

            <div className="relative flex-1">
                {/* Grid Background */}
                <div className="absolute inset-0 pointer-events-none flex">
                    {[...Array(Math.ceil(totalDays))].map((_, i) => (
                        <div key={i} className="flex-1 border-r border-slate-100 h-full min-w-[40px]"></div>
                    ))}
                </div>

                {/* Tasks */}
                <div className="p-4 space-y-6 mt-2 relative z-0">
                    {tasks.map(task => {
                        const isCritical = criticalPath.has(task.id);
                        const isDelayed = isSimulated && delayedTaskIds.has(task.id);
                        const isHovered = hoveredTask === task.id;

                        let barColor = isSimulated ? 'bg-blue-500' : 'bg-slate-400';
                        if (isCritical) barColor = 'bg-orange-400 ring-1 ring-orange-500';
                        if (isDelayed) barColor = 'bg-red-400 ring-1 ring-red-500';

                        return (
                            <div
                                key={task.id}
                                className="relative h-10 group"
                                onMouseEnter={() => setHoveredTask(task.id)}
                                onMouseLeave={() => setHoveredTask(null)}
                            >
                                {/* Task Bar */}
                                <div
                                    className={`absolute h-6 rounded-md shadow-sm transition-all duration-300 cursor-pointer flex items-center px-2
                                    ${barColor}
                                    ${isHovered ? 'scale-[1.02] shadow-md z-10' : 'opacity-90'}
                                `}
                                    style={{
                                        left: `${getPosition(task.startDate)}%`,
                                        width: `${getWidth(task.duration)}%`
                                    }}
                                >
                                    <span className="text-[10px] font-bold text-white truncate w-full drop-shadow-sm">
                                        {task.title}
                                    </span>
                                </div>

                                {/* Tooltip on Hover */}
                                {isHovered && (
                                    <div className="absolute top-8 left-0 z-30 bg-slate-800 text-white text-xs rounded-lg p-3 shadow-xl w-48 pointer-events-none animate-in fade-in zoom-in-95 duration-150">
                                        <div className="font-bold mb-1 text-slate-100">{task.title}</div>
                                        <div className="space-y-1 text-slate-300">
                                            <div className="flex items-center">
                                                <Calendar size={10} className="mr-1.5" />
                                                {new Date(task.startDate).toLocaleDateString()} ({task.duration}d)
                                            </div>
                                            <div className="flex items-center">
                                                <UserIcon size={10} className="mr-1.5" />
                                                {task.assignee.name}
                                            </div>
                                            {isDelayed && (
                                                <div className="text-red-300 font-bold flex items-center mt-1">
                                                    <Info size={10} className="mr-1.5" /> Delayed
                                                </div>
                                            )}
                                            {isCritical && (
                                                <div className="text-orange-300 font-bold flex items-center mt-1">
                                                    <Info size={10} className="mr-1.5" /> Critical Path
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
    return (
        <div className="fixed inset-0 z-50 bg-white flex flex-col animate-in slide-in-from-bottom-10 duration-300">
            {/* Modal Header */}
            <div className="h-16 border-b border-slate-200 flex items-center justify-between px-6 bg-white shadow-sm shrink-0">
                <div className="flex items-center space-x-4">
                    <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                        <Calendar size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-800">Timeline Comparison</h2>
                        <p className="text-xs text-slate-500 font-medium">Side-by-side impact analysis</p>
                    </div>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2 text-xs font-medium bg-slate-100 px-3 py-1.5 rounded-full text-slate-600">
                        <span className="w-2 h-2 rounded-full bg-orange-400"></span>
                        <span>Critical Path</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>
            </div>

            {/* Main Content - Split View */}
            <div className="flex-1 overflow-hidden flex">
                <div className="flex-1 overflow-auto flex divide-x divide-slate-200">
                    {/* Left: Original */}
                    <div className="flex-1 min-w-[50%]">
                        {renderGantt(originalTasks, originalCriticalPath, false)}
                    </div>

                    {/* Right: Simulated */}
                    <div className="flex-1 min-w-[50%]">
                        {renderGantt(simulatedTasks, simulatedCriticalPath, true)}
                    </div>
                </div>
            </div>
        </div>
    );
};
