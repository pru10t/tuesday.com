import { GoogleGenAI } from "@google/genai";
import type { Task } from "../types";

const getClient = () => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
        console.error("API Key not found");
        return null;
    }
    return new GoogleGenAI({ apiKey });
};

export const analyzeSimulationImpact = async (
    originalTasks: Task[],
    simulatedTasks: Task[],
    delayedTask: Task | undefined,
    delayDays: number
): Promise<string> => {
    const client = getClient();
    if (!client) return "API Key missing. Unable to generate analysis.";

    const prompt = `
    You are a project management AI assistant.
    
    A user has simulated a schedule change.
    
    Context:
    Task "${delayedTask?.title}" was delayed by ${delayDays} days.
    
    Original Schedule End Date: ${calculateProjectEndDate(originalTasks)}
    Simulated Schedule End Date: ${calculateProjectEndDate(simulatedTasks)}
    
    Please provide a concise (max 3 sentences) impact analysis. 
    Focus on critical path changes, risk of deadline slippage, and resource bottlenecks.
    Tone: Professional, helpful, slightly cautious.
  `;

    try {
        const response = await client.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text || "Analysis could not be generated.";
    } catch (error) {
        console.error("Gemini API Error:", error);
        return "Could not connect to AI service for analysis.";
    }
};

const calculateProjectEndDate = (tasks: Task[]): string => {
    let maxDate = 0;
    tasks.forEach(t => {
        const start = new Date(t.startDate).getTime();
        const end = start + (t.duration * 24 * 60 * 60 * 1000);
        if (end > maxDate) maxDate = end;
    });
    return new Date(maxDate).toISOString().split('T')[0];
};
