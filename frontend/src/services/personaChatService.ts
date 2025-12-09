import { GoogleGenAI } from "@google/genai";
import type { Customer } from "../types";

export interface ChatMessage {
    id: string;
    role: 'user' | 'persona';
    content: string;
    timestamp: Date;
}

const getClient = () => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
        console.error("API Key not found");
        return null;
    }
    return new GoogleGenAI({ apiKey });
};

const buildPersonaSystemPrompt = (customer: Customer): string => {
    const incomeDescriptions: Record<string, string> = {
        'Low': 'budget-conscious',
        'Medium': 'practical with money',
        'High': 'happy to spend on quality'
    };

    const segmentPersonalities: Record<string, string> = {
        'Tech Enthusiast': 'into tech and gadgets',
        'Fashionista': 'into fashion and style',
        'Home Decor': 'into home decor and design',
        'Bargain Hunter': 'always looking for deals'
    };

    const engagementNote = customer.historical_opens && customer.historical_opens > 5
        ? 'fairly engaged with emails'
        : 'pretty selective about emails';

    return `You are ${customer.name}, a ${customer.age}-year-old who is ${segmentPersonalities[customer.interest_segment] || 'a regular shopper'}. You're ${incomeDescriptions[customer.income_bracket] || 'a typical shopper'} and ${engagementNote}. You've made ${customer.past_purchase_count} purchases before.

CRITICAL RULES FOR YOUR RESPONSES:
- Keep responses SHORT - 1-3 sentences max, like a text message
- Sound like a real person chatting, not a formal document
- NO bullet points, NO numbered lists, NO markdown formatting
- NO asterisks, NO bold text, NO headers
- Be casual and natural, use contractions (I'm, don't, it's)
- Give your honest opinion as this person would
- It's okay to be brief - don't over-explain

You ARE this person. Chat naturally.`;
};

export const chatWithPersona = async (
    customer: Customer,
    messages: ChatMessage[],
    newMessage: string
): Promise<string> => {
    const client = getClient();
    if (!client) return "API Key missing. Unable to chat.";

    const systemPrompt = buildPersonaSystemPrompt(customer);

    // Build conversation history
    const conversationHistory = messages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
    }));

    // Add system context as first message if no history
    const fullContents = [
        { role: 'user' as const, parts: [{ text: `${systemPrompt}\n\nRespond as ${customer.name.split(' ')[0]}:` }] },
        { role: 'model' as const, parts: [{ text: `Hey! What's up?` }] },
        ...conversationHistory,
        { role: 'user' as const, parts: [{ text: newMessage }] }
    ];

    try {
        const response = await client.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: fullContents,
        });
        return response.text || "I'm not sure how to respond to that.";
    } catch (error) {
        console.error("Gemini API Error:", error);
        return "Sorry, I couldn't process that. Could you try again?";
    }
};

export const generateCampaignFeedback = async (
    customer: Customer,
    subjectLine: string,
    campaignDescription?: string
): Promise<string> => {
    const client = getClient();
    if (!client) return "API Key missing. Unable to generate feedback.";

    const systemPrompt = buildPersonaSystemPrompt(customer);

    const prompt = `${systemPrompt}

Quick reaction to this email subject line: "${subjectLine}"
${campaignDescription ? `(${campaignDescription})` : ''}

Would you open it? Give a quick, honest 1-2 sentence reaction.`;

    try {
        const response = await client.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text || "Unable to generate feedback.";
    } catch (error) {
        console.error("Gemini API Error:", error);
        return "Could not connect to AI service.";
    }
};
