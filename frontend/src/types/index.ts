// Customer data types matching backend API
export interface Customer {
    user_id: number;
    name: string;
    age: number;
    income_bracket: string;
    interest_segment: string;
    past_purchase_count: number;
    historical_opens?: number;
    historical_clicks?: number;
    historical_conversions?: number;
}

export interface Campaign {
    type: CampaignType;
    subject_line: string;
    send_hour: number;
}

export type CampaignType = 'Promo' | 'Newsletter' | 'Welcome' | 'Cart Abandonment';

export interface CampaignTypeInfo {
    value: CampaignType;
    label: string;
    description: string;
}

export interface CustomerPrediction {
    customer_id: number;
    customer_name: string;
    age: number;
    income_bracket: string;
    interest_segment: string;
    will_open: boolean;
    will_click: boolean;
    will_unsubscribe: boolean;
    will_convert: boolean;
    confidence_open: number;
    confidence_click: number;
    confidence_unsub: number;
    confidence_convert: number;
}

export interface SimulationSummary {
    total_customers: number;
    predicted_opens: number;
    predicted_clicks: number;
    predicted_unsubscribes: number;
    predicted_conversions: number;
    open_rate: number;
    click_rate: number;
    unsubscribe_rate: number;
    conversion_rate: number;
}

export interface SimulationResponse {
    summary: SimulationSummary;
    predictions: CustomerPrediction[];
}

export interface CustomerListResponse {
    customers: Customer[];
    total: number;
    page: number;
    page_size: number;
}
