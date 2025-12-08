import React from 'react';
import type { Task, SimulationState, Scenario } from '../types';
import { Sliders, Activity, Play, RefreshCw, Wand2, Info, Clock, AlertTriangle, ArrowRight, GitMerge, Plus, Trash2, Layers } from 'lucide-react';

interface SimulationPanelProps {
  tasks: Task[];
  simulationState: SimulationState;
  setSimulationState: React.Dispatch<React.SetStateAction<SimulationState>>;
  onRunSimulation: () => void;
  onReset: () => void;
  onViewTimeline: () => void;
  addScenario: () => void;
  removeScenario: (id: string) => void;
  setActiveScenario: (id: string) => void;
  updateActiveScenario: (updates: Partial<Scenario>) => void;
}

export const SimulationPanel = ({
  tasks,
  simulationState,
  setSimulationState,
  onRunSimulation,
  onReset,
  onViewTimeline,
  addScenario,
  removeScenario,
  setActiveScenario,
  updateActiveScenario
}: SimulationPanelProps) => {

  const activeScenario = simulationState.scenarios.find(s => s.id === simulationState.activeScenarioId) || simulationState.scenarios[0];

  const [selectedTaskId, setSelectedTaskId] = React.useState<string>('');
  const [delayDays, setDelayDays] = React.useState<number>(3);

  const handleAddDelay = () => {
    if (!selectedTaskId) return;
    const newDelays = [...activeScenario.delays, { taskId: selectedTaskId, days: delayDays }];
    updateActiveScenario({ delays: newDelays });
    setSelectedTaskId('');
    setDelayDays(3);
  };

  const removeDelay = (index: number) => {
    const newDelays = [...activeScenario.delays];
    newDelays.splice(index, 1);
    updateActiveScenario({ delays: newDelays });
  };

  const handleScenarioNameChange = (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
    setSimulationState(prev => ({
      ...prev,
      scenarios: prev.scenarios.map(s => s.id === id ? { ...s, name: e.target.value } : s)
    }));
  };

  // Calculate original metrics for comparison
  const originalStartDates = tasks.map(t => new Date(t.startDate).getTime());
  const originalEndDates = tasks.map(t => new Date(t.startDate).getTime() + (t.duration * 24 * 60 * 60 * 1000));
  const originalDuration = Math.ceil((Math.max(...originalEndDates) - Math.min(...originalStartDates)) / (1000 * 60 * 60 * 24));

  const selectedTask = tasks.find(t => t.id === selectedTaskId);
  const dependentTasks = selectedTask ? tasks.filter(t => t.dependencies.includes(selectedTask.id)) : [];

  return (
    <div className="bg-white border-l border-neutral-100 h-full flex flex-col z-20 relative font-['Plus_Jakarta_Sans']">
      <div className="p-6 border-b border-neutral-100 bg-white">
        <div className="flex items-center space-x-2 text-neutral-900 mb-2">
          <Activity size={18} />
          <span className="font-semibold tracking-wide text-xs uppercase">Impact Simulator</span>
        </div>
        <h2 className="text-xl font-bold text-neutral-900 font-['Outfit']">Delay Analysis</h2>
        <p className="text-neutral-400 text-sm mt-1 leading-relaxed">Simulate task delays to forecast timeline slippage and risks.</p>
      </div>

      <div className="p-6 space-y-8 flex-1 overflow-y-auto">

        {/* Scenario Manager */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-neutral-700 uppercase flex items-center">
              <Layers size={12} className="mr-1.5 text-neutral-400" /> Scenarios
            </label>
            <button
              onClick={addScenario}
              className="text-[10px] bg-neutral-100 text-neutral-700 px-2 py-1 rounded-md font-semibold hover:bg-neutral-200 transition-colors flex items-center"
            >
              <Plus size={10} className="mr-1" /> New
            </button>
          </div>
          <div className="space-y-2">
            {simulationState.scenarios.map(scenario => (
              <div
                key={scenario.id}
                className={`p-2 rounded-lg border transition-all cursor-pointer flex items-center justify-between group
                            ${scenario.id === simulationState.activeScenarioId
                    ? 'bg-neutral-900 border-neutral-900'
                    : 'bg-white border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
                  }
                        `}
                onClick={() => setActiveScenario(scenario.id)}
              >
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${scenario.id === simulationState.activeScenarioId ? 'bg-green-400' : 'bg-neutral-300'}`}></div>
                  {scenario.id === simulationState.activeScenarioId ? (
                    <input
                      type="text"
                      value={scenario.name}
                      onChange={(e) => handleScenarioNameChange(e, scenario.id)}
                      className="bg-transparent text-sm font-medium text-white focus:outline-none w-full"
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <span className="text-sm font-medium text-neutral-600 truncate">{scenario.name}</span>
                  )}
                </div>
                {simulationState.scenarios.length > 1 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); removeScenario(scenario.id); }}
                    className={`p-1 rounded opacity-0 group-hover:opacity-100 transition-all ${scenario.id === simulationState.activeScenarioId ? 'text-neutral-400 hover:text-white' : 'text-neutral-400 hover:text-red-500'}`}
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="h-px bg-neutral-100"></div>

        {/* Task Selector */}
        <div>
          <label className="block text-xs font-semibold text-neutral-700 uppercase mb-2 flex items-center justify-between">
            Target Task
            <Info size={12} className="text-neutral-400" />
          </label>
          <div className="relative group">
            <select
              className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-700 focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900 outline-none appearance-none transition-all cursor-pointer font-medium hover:border-neutral-300"
              value={selectedTaskId}
              onChange={(e) => setSelectedTaskId(e.target.value)}
            >
              <option value="" disabled>Select a task to delay...</option>
              {tasks.map(t => (
                <option key={t.id} value={t.id}>{t.title}</option>
              ))}
            </select>
            <div className="absolute right-3 top-3.5 pointer-events-none text-neutral-400 group-hover:text-neutral-600 transition-colors">
              <Sliders size={14} />
            </div>
          </div>
        </div>

        {/* Delay Slider */}
        <div className="bg-neutral-50 p-5 rounded-xl border border-neutral-100">
          <div className="flex justify-between items-center mb-5">
            <label className="text-xs font-semibold text-neutral-700 uppercase">
              Delay Duration
            </label>
            <span className="text-neutral-900 font-bold text-lg">
              {delayDays} <span className="text-sm font-normal text-neutral-500">days</span>
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="14"
            value={delayDays}
            onChange={(e) => setDelayDays(parseInt(e.target.value))}
            className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-neutral-900 hover:accent-neutral-700 transition-all"
          />
          <div className="flex justify-between text-[10px] text-neutral-400 mt-3 font-medium uppercase tracking-wide">
            <span>1 Day</span>
            <span>2 Weeks</span>
          </div>
        </div>

        {/* Add Delay Button */}
        <button
          onClick={handleAddDelay}
          disabled={!selectedTaskId}
          className={`w-full py-2 rounded-lg font-semibold text-xs uppercase tracking-wide transition-all
                ${!selectedTaskId ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'}`}
        >
          Add Delay
        </button>

        {/* Active Delays List */}
        {activeScenario.delays.length > 0 && (
          <div className="space-y-2">
            <label className="text-xs font-semibold text-neutral-700 uppercase">Active Delays</label>
            <div className="space-y-2">
              {activeScenario.delays.map((delay, idx) => {
                const task = tasks.find(t => t.id === delay.taskId);
                return (
                  <div key={idx} className="flex items-center justify-between bg-white border border-neutral-200 p-2 rounded-lg">
                    <div className="text-sm">
                      <span className="font-medium text-neutral-700">{task?.title}</span>
                      <span className="text-neutral-400 mx-1">•</span>
                      <span className="text-red-500 font-bold">+{delay.days}d</span>
                    </div>
                    <button onClick={() => removeDelay(idx)} className="text-neutral-400 hover:text-red-500 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={onReset}
            className="flex items-center justify-center space-x-2 py-3 px-4 rounded-lg text-neutral-600 bg-white border border-neutral-200 hover:bg-neutral-50 hover:border-neutral-300 font-semibold text-sm transition-all"
          >
            <RefreshCw size={16} />
            <span>Reset</span>
          </button>
          <button
            onClick={onRunSimulation}
            disabled={activeScenario.delays.length === 0 || activeScenario.isAnalyzing}
            className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-lg text-white font-semibold text-sm transition-all
              ${(activeScenario.delays.length === 0 || activeScenario.isAnalyzing) ? 'bg-neutral-300 cursor-not-allowed' : 'bg-neutral-900 hover:bg-neutral-800'}`}
          >
            {activeScenario.isAnalyzing ? <Wand2 className="animate-spin" size={16} /> : <Play size={16} className="fill-current" />}
            <span>{simulationState.active ? 'Update' : 'Apply'}</span>
          </button>
        </div>

        {/* View Timeline Button */}
        {simulationState.active && (
          <button
            onClick={onViewTimeline}
            className="w-full mt-3 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg text-neutral-700 bg-neutral-100 border border-neutral-200 hover:bg-neutral-200 font-semibold text-sm transition-all"
          >
            <Clock size={16} />
            <span>View Comparison Timeline</span>
          </button>
        )}

        {/* Simulation Results */}
        {simulationState.active && (
          <div className="space-y-6 animate-fade-in-up">

            {/* Cost & Time Estimation */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-neutral-700 uppercase">Project Impact</h3>

              {/* Time */}
              <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-100 flex justify-between items-center">
                <div className="flex items-center text-neutral-500 text-xs">
                  <Clock size={14} className="mr-2" /> Duration
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-neutral-800">{activeScenario.totalDuration} days</div>
                  {activeScenario.totalDuration !== originalDuration && (
                    <div className="text-[10px] text-red-500 font-medium">
                      +{(activeScenario.totalDuration || 0) - originalDuration} days
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Resource Constraints */}
            {activeScenario.overbookedUsers && activeScenario.overbookedUsers.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-red-600 uppercase flex items-center">
                  <AlertTriangle size={12} className="mr-1" /> Resource Alerts
                </h3>
                <div className="bg-red-50 border border-red-100 rounded-lg p-3">
                  <p className="text-xs text-red-800 mb-2">Overbooked Team Members:</p>
                  <div className="flex -space-x-2 mb-3">
                    {activeScenario.overbookedUsers.map(uid => {
                      const user = tasks.find(t => t.assignee.id === uid)?.assignee;
                      return user ? (
                        <img key={uid} src={user.avatar} title={user.name} className="w-6 h-6 rounded-full border-2 border-white" />
                      ) : null;
                    })}
                  </div>

                  {activeScenario.reassignmentSuggestions && activeScenario.reassignmentSuggestions.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-red-100">
                      <p className="text-[10px] text-red-600 font-semibold uppercase mb-1">Suggestion</p>
                      <div className="text-xs text-red-800">
                        Reassign <span className="font-semibold">Task {activeScenario.reassignmentSuggestions[0].taskId}</span> to <span className="font-semibold">{activeScenario.reassignmentSuggestions[0].suggestedUser.name}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Dependency Tree */}
            {selectedTask && (
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-neutral-700 uppercase flex items-center">
                  <GitMerge size={12} className="mr-1" /> Dependency Chain
                </h3>
                <div className="bg-neutral-50 border border-neutral-100 rounded-lg p-4 overflow-hidden">
                  <div className="flex items-center space-x-2">
                    <div className="bg-white border border-neutral-900 text-neutral-900 px-2 py-1 rounded text-xs font-medium truncate max-w-[100px]">
                      {selectedTask.title}
                    </div>
                    {dependentTasks.length > 0 ? (
                      <>
                        <ArrowRight size={12} className="text-neutral-400" />
                        <div className="flex flex-col space-y-2">
                          {dependentTasks.map(dt => (
                            <div key={dt.id} className="bg-white border border-neutral-200 text-neutral-600 px-2 py-1 rounded text-xs truncate max-w-[100px]">
                              {dt.title}
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <span className="text-[10px] text-neutral-400 italic ml-2">No direct dependents</span>
                    )}
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

        {/* Impact Analysis Result */}
        {(simulationState.active || activeScenario.impactSummary) && (
          <div className="mt-6 animate-fade-in-up">
            <div className="bg-neutral-900 p-5 rounded-xl">
              <div className="flex items-center space-x-2 mb-3">
                <div className="bg-white/10 p-1.5 rounded-md">
                  <Wand2 size={14} className="text-white" />
                </div>
                <h3 className="text-white font-bold text-sm">AI Impact Analysis</h3>
              </div>
              {activeScenario.isAnalyzing ? (
                <div className="space-y-3 pt-1">
                  <div className="h-2 bg-white/10 rounded w-3/4 animate-pulse"></div>
                  <div className="h-2 bg-white/10 rounded w-full animate-pulse"></div>
                  <div className="h-2 bg-white/10 rounded w-5/6 animate-pulse"></div>
                </div>
              ) : (
                <p className="text-neutral-400 text-xs leading-relaxed font-medium">
                  {activeScenario.impactSummary || "Select a task and click apply to see AI insights."}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
