import type { Task } from '../types';

export const calculateCriticalPath = (tasks: Task[]): Set<string> => {
    if (tasks.length === 0) return new Set();

    // 1. Build Graph and Calculate Earliest Start/Finish
    const earliestStart: Record<string, number> = {};
    const earliestFinish: Record<string, number> = {};
    const duration: Record<string, number> = {};

    // Initialize
    tasks.forEach(t => {
        earliestStart[t.id] = 0;
        earliestFinish[t.id] = 0;
        duration[t.id] = t.duration;
    });

    // Topological sort (simplified: iterate until no changes)
    let changed = true;
    while (changed) {
        changed = false;
        tasks.forEach(task => {
            let maxDepFinish = 0;
            task.dependencies.forEach(depId => {
                if (earliestFinish[depId] > maxDepFinish) {
                    maxDepFinish = earliestFinish[depId];
                }
            });

            if (maxDepFinish > earliestStart[task.id]) {
                earliestStart[task.id] = maxDepFinish;
                earliestFinish[task.id] = maxDepFinish + duration[task.id];
                changed = true;
            } else if (earliestFinish[task.id] !== earliestStart[task.id] + duration[task.id]) {
                // Ensure finish is always start + duration even if start didn't change but was initialized
                earliestFinish[task.id] = earliestStart[task.id] + duration[task.id];
                changed = true; // technically not needed for convergence if start didn't change, but good for consistency
            }
        });
    }

    // 2. Calculate Project Duration
    const projectDuration = Math.max(...Object.values(earliestFinish));

    // 3. Calculate Latest Start/Finish
    const latestStart: Record<string, number> = {};
    const latestFinish: Record<string, number> = {};

    tasks.forEach(t => {
        latestFinish[t.id] = projectDuration;
        latestStart[t.id] = projectDuration - duration[t.id];
    });

    // Backward pass
    changed = true;
    while (changed) {
        changed = false;
        // Iterate in reverse roughly (or just loop until convergence)
        tasks.forEach(task => {
            // Find tasks that depend on this task
            const dependents = tasks.filter(t => t.dependencies.includes(task.id));

            let minDependentStart = projectDuration;
            if (dependents.length > 0) {
                minDependentStart = Math.min(...dependents.map(d => latestStart[d.id]));
            }

            if (minDependentStart < latestFinish[task.id]) {
                latestFinish[task.id] = minDependentStart;
                latestStart[task.id] = minDependentStart - duration[task.id];
                changed = true;
            }
        });
    }

    // 4. Identify Critical Path (Slack = 0)
    const criticalPath = new Set<string>();
    tasks.forEach(t => {
        const slack = latestStart[t.id] - earliestStart[t.id];
        // Use a small epsilon for float comparison if needed, but integers here
        if (Math.abs(slack) < 0.01) {
            criticalPath.add(t.id);
        }
    });

    return criticalPath;
};
