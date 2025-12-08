from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional

from models import (
    Customer, Campaign, SimulationRequest, SimulationResponse,
    SimulationSummary, CustomerPrediction, CustomerListResponse, CampaignType
)
from predictor import get_predictor

app = FastAPI(
    title="Digital Twin Campaign Backtester",
    description="Simulate email campaign performance using customer digital twins",
    version="1.0.0"
)

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "Digital Twin API", "status": "online"}


@app.get("/customers", response_model=CustomerListResponse)
async def get_customers(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=10000),
    segment: Optional[str] = None,
    income: Optional[str] = None,
    min_age: Optional[int] = None,
    max_age: Optional[int] = None
):
    """Get paginated list of customers with optional filters."""
    predictor = get_predictor()
    customers_df = predictor.get_unique_customers()
    
    # Apply filters
    if segment:
        customers_df = customers_df[customers_df['interest_segment'] == segment]
    if income:
        customers_df = customers_df[customers_df['income_bracket'] == income]
    if min_age:
        customers_df = customers_df[customers_df['age'] >= min_age]
    if max_age:
        customers_df = customers_df[customers_df['age'] <= max_age]
    
    total = len(customers_df)
    
    # Paginate
    start = (page - 1) * page_size
    end = start + page_size
    page_data = customers_df.iloc[start:end]
    
    customers = [
        Customer(
            user_id=int(row['user_id']),
            name=row['name'],
            age=int(row['age']),
            income_bracket=row['income_bracket'],
            interest_segment=row['interest_segment'],
            past_purchase_count=int(row['past_purchase_count']),
            historical_opens=int(row['historical_opens']),
            historical_clicks=int(row['historical_clicks']),
            historical_conversions=int(row['historical_conversions'])
        )
        for _, row in page_data.iterrows()
    ]
    
    return CustomerListResponse(
        customers=customers,
        total=total,
        page=page,
        page_size=page_size
    )


@app.get("/customers/{user_id}", response_model=Customer)
async def get_customer(user_id: int):
    """Get a single customer by ID."""
    predictor = get_predictor()
    customer = predictor.get_customer_by_id(user_id)
    
    if customer is None:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    return Customer(
        user_id=int(customer['user_id']),
        name=customer['name'],
        age=int(customer['age']),
        income_bracket=customer['income_bracket'],
        interest_segment=customer['interest_segment'],
        past_purchase_count=int(customer['past_purchase_count']),
        historical_opens=int(customer['historical_opens']),
        historical_clicks=int(customer['historical_clicks']),
        historical_conversions=int(customer['historical_conversions'])
    )


@app.get("/campaigns/types")
async def get_campaign_types():
    """Get available campaign types."""
    return {
        "types": [
            {"value": "Promo", "label": "Promotional", "description": "Sales and discount campaigns"},
            {"value": "Newsletter", "label": "Newsletter", "description": "Regular content updates"},
            {"value": "Welcome", "label": "Welcome", "description": "New subscriber onboarding"},
            {"value": "Cart Abandonment", "label": "Cart Abandonment", "description": "Recovery emails"}
        ]
    }


@app.post("/simulate", response_model=SimulationResponse)
async def simulate_campaign(request: SimulationRequest):
    """
    Run a campaign simulation against selected customers.
    
    Returns individual predictions and aggregate metrics.
    """
    if not request.customer_ids:
        raise HTTPException(status_code=400, detail="No customers selected")
    
    predictor = get_predictor()
    
    # Run predictions
    predictions = predictor.predict(
        customer_ids=request.customer_ids,
        campaign_type=request.campaign.type.value,
        subject_line=request.campaign.subject_line,
        send_hour=request.campaign.send_hour
    )
    
    if not predictions:
        raise HTTPException(status_code=404, detail="No customers found for given IDs")
    
    # Calculate summary metrics
    total = len(predictions)
    opens = sum(1 for p in predictions if p['will_open'])
    clicks = sum(1 for p in predictions if p['will_click'])
    unsubs = sum(1 for p in predictions if p['will_unsubscribe'])
    conversions = sum(1 for p in predictions if p['will_convert'])
    
    summary = SimulationSummary(
        total_customers=total,
        predicted_opens=opens,
        predicted_clicks=clicks,
        predicted_unsubscribes=unsubs,
        predicted_conversions=conversions,
        open_rate=round(opens / total, 4) if total > 0 else 0,
        click_rate=round(clicks / total, 4) if total > 0 else 0,
        unsubscribe_rate=round(unsubs / total, 4) if total > 0 else 0,
        conversion_rate=round(conversions / total, 4) if total > 0 else 0
    )
    
    customer_predictions = [
        CustomerPrediction(**p) for p in predictions
    ]
    
    return SimulationResponse(
        summary=summary,
        predictions=customer_predictions
    )


@app.get("/segments")
async def get_segments():
    """Get available customer segments for filtering."""
    return {
        "segments": ["Tech Enthusiast", "Fashionista", "Home Decor", "Bargain Hunter"],
        "income_levels": ["Low", "Medium", "High"]
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
