import React from 'react';
import type { Task } from '../types';
import { Priority } from '../types';
import { Calendar, AlertCircle, GripVertical, Clock, AlertTriangle } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  isSimulated?: boolean;
  isDelayedSource?: boolean;
  isOverbooked?: boolean;
  onDragStart: (id: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, isSimulated = false, isDelayedSource = false, isOverbooked = false, onDragStart }) => {
  const priorityColors = {
    [Priority.HIGH]: 'bg-red-50 text-red-600 border-red-100',
    [Priority.MEDIUM]: 'bg-amber-50 text-amber-600 border-amber-100',
    [Priority.LOW]: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  };

  const borderClass = isDelayedSource
    ? 'ring-2 ring-blue-500 ring-offset-1 border-transparent'
    : isOverbooked
      ? 'ring-2 ring-red-500 ring-offset-1 border-transparent'
      : 'border-slate-100 hover:border-blue-300';

  return (
    <div
      draggable={!isSimulated}
      onDragStart={() => onDragStart(task.id)}
      className={`bg-white p-3.5 rounded-lg border shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-all duration-200 mb-3 group relative cursor-grab active:cursor-grabbing ${borderClass} ${isSimulated ? 'opacity-95' : ''}`}
    >
      <div className="flex justify-between items-start gap-2">
        <div className="flex items-start gap-2 overflow-hidden">
          {/* Color indicator dot */}
          <div
            className="w-2 h-2 rounded-full mt-1.5 shrink-0"
            style={{ backgroundColor: task.color }}
          />
          <h4 className="font-medium text-slate-700 text-sm leading-snug truncate">{task.title}</h4>
        </div>
        <div className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">
          <GripVertical size={14} />
        </div>
      </div>

      <div className="flex items-center justify-between mt-3 pl-4">
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${priorityColors[task.priority]}`}>
          {task.priority}
        </span>

        {isDelayedSource && (
          <span className="text-blue-600 font-semibold flex items-center text-[10px] bg-blue-50 px-1.5 py-0.5 rounded">
            <AlertCircle size={10} className="mr-1" /> +Delay
          </span>
        )}
        {isOverbooked && (
          <span className="text-red-600 font-semibold flex items-center text-[10px] bg-red-50 px-1.5 py-0.5 rounded animate-pulse">
            <AlertTriangle size={10} className="mr-1" /> Overload
          </span>
        )}
      </div>

      {/* Cost and Effort */}
      <div className="flex items-center gap-3 mt-2 pl-4 text-[10px] text-slate-400">
        <div className="flex items-center" title="Estimated Effort">
          <Clock size={10} className="mr-1" />
          <span>{task.effort}h</span>
        </div>
      </div>

      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-50 pl-4">
        <div className="flex items-center text-slate-400 text-xs font-medium">
          <Calendar size={12} className="mr-1.5 text-slate-300" />
          <span>{new Date(task.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
        </div>
        <img
          src={task.assignee.avatar}
          alt={task.assignee.name}
          className="w-5 h-5 rounded-full ring-2 ring-white object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all"
        />
      </div>
    </div>
  );
};
