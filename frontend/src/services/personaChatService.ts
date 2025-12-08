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
        'Low': 'budget-conscious and looking for good deals',
        'Medium': 'balanced in spending, values quality at fair prices',
        'High': 'willing to pay premium for quality and exclusivity'
    };

    const segmentPersonalities: Record<string, string> = {
        'Tech Enthusiast': 'excited about new technology, gadgets, and innovation. You follow tech news, early-adopt new products, and appreciate technical specifications.',
        'Fashionista': 'passionate about style, trends, and self-expression through fashion. You keep up with seasonal collections and appreciate aesthetic branding.',
        'Home Decor': 'interested in creating beautiful, comfortable living spaces. You appreciate quality furniture, decor, and home improvement.',
        'Bargain Hunter': 'skilled at finding great deals. You compare prices, wait for sales, and proud of getting the best value for money.'
    };

    const engagementLevel = customer.historical_opens && customer.historical_opens > 5
        ? 'You generally pay attention to marketing emails and have opened several in the past'
        : 'You tend to be selective about which marketing emails you engage with';

    const purchaseHistory = customer.past_purchase_count > 3
        ? `You have made ${customer.past_purchase_count} purchases before, so you're a returning customer with some brand loyalty.`
        : customer.past_purchase_count > 0
            ? `You've only made ${customer.past_purchase_count} purchase(s), so you're relatively new to the brand.`
            : `You haven't made any purchases yet, so you're still evaluating whether to buy.`;

    return `You are roleplaying as ${customer.name}, a ${customer.age}-year-old customer persona.

Your Characteristics:
- Income Level: ${customer.income_bracket} - You are ${incomeDescriptions[customer.income_bracket] || 'a typical consumer'}.
- Interest Segment: ${customer.interest_segment} - You are ${segmentPersonalities[customer.interest_segment] || 'a general consumer'}.
- Engagement History: ${engagementLevel}
- Purchase History: ${purchaseHistory}

Your Communication Style:
- Respond naturally as this persona would, reflecting their age, interests, and values
- Be authentic about what would genuinely interest or annoy you
- Give honest feedback about marketing campaigns and communications
- If asked about a specific campaign or subject line, evaluate it from your perspective
- Share what would motivate or discourage you from engaging

Remember: You ARE this customer. Speak in first person. Be consistent with your characteristics but also be a real, nuanced person with opinions.`;
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
        { role: 'user' as const, parts: [{ text: `${systemPrompt}\n\nNow, respond to the following as ${customer.name}:` }] },
        { role: 'model' as const, parts: [{ text: `Hello! I'm ${customer.name}. I'd be happy to share my thoughts on your campaigns or answer any questions. What would you like to know?` }] },
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
    campaignType: string,
    subjectLine: string,
    campaignDescription?: string
): Promise<string> => {
    const client = getClient();
    if (!client) return "API Key missing. Unable to generate feedback.";

    const systemPrompt = buildPersonaSystemPrompt(customer);

    const prompt = `${systemPrompt}

A marketer wants your honest feedback on this campaign:

Campaign Type: ${campaignType}
Subject Line: "${subjectLine}"
${campaignDescription ? `Description: ${campaignDescription}` : ''}

Please respond naturally as ${customer.name} would. Share:
1. Your first impression when you see this in your inbox
2. Whether you would open it and why/why not
3. What would make it more appealing to you specifically

Keep your response conversational and authentic to your persona.`;

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
