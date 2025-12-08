import type { Campaign, CustomerListResponse, SimulationResponse, CampaignTypeInfo } from '../types';

const API_BASE = 'http://localhost:8000';

export const api = {
    async getCustomers(
        page = 1,
        pageSize = 50,
        filters?: { segment?: string; income?: string; minAge?: number; maxAge?: number }
    ): Promise<CustomerListResponse> {
        const params = new URLSearchParams({
            page: String(page),
            page_size: String(pageSize),
        });

        if (filters?.segment) params.append('segment', filters.segment);
        if (filters?.income) params.append('income', filters.income);
        if (filters?.minAge) params.append('min_age', String(filters.minAge));
        if (filters?.maxAge) params.append('max_age', String(filters.maxAge));

        const res = await fetch(`${API_BASE}/customers?${params}`);
        if (!res.ok) throw new Error('Failed to fetch customers');
        return res.json();
    },

    async getCampaignTypes(): Promise<{ types: CampaignTypeInfo[] }> {
        const res = await fetch(`${API_BASE}/campaigns/types`);
        if (!res.ok) throw new Error('Failed to fetch campaign types');
        return res.json();
    },

    async getSegments(): Promise<{ segments: string[]; income_levels: string[] }> {
        const res = await fetch(`${API_BASE}/segments`);
        if (!res.ok) throw new Error('Failed to fetch segments');
        return res.json();
    },

    async simulate(customerIds: number[], campaign: Campaign): Promise<SimulationResponse> {
        const res = await fetch(`${API_BASE}/simulate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                customer_ids: customerIds,
                campaign,
            }),
        });
        if (!res.ok) throw new Error('Simulation failed');
        return res.json();
    },
};
