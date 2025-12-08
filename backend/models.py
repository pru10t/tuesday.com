from pydantic import BaseModel
from typing import List, Optional
from enum import Enum


class IncomeLevel(str, Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"


class InterestSegment(str, Enum):
    TECH_ENTHUSIAST = "Tech Enthusiast"
    FASHIONISTA = "Fashionista"
    HOME_DECOR = "Home Decor"
    BARGAIN_HUNTER = "Bargain Hunter"


class CampaignType(str, Enum):
    PROMO = "Promo"
    NEWSLETTER = "Newsletter"
    WELCOME = "Welcome"
    CART_ABANDONMENT = "Cart Abandonment"


class Customer(BaseModel):
    user_id: int
    name: str
    age: int
    income_bracket: str
    interest_segment: str
    past_purchase_count: int
    # Engagement history from data
    historical_opens: Optional[int] = None
    historical_clicks: Optional[int] = None
    historical_conversions: Optional[int] = None


class Campaign(BaseModel):
    type: CampaignType
    subject_line: str
    send_hour: int  # 8-21


class SimulationRequest(BaseModel):
    customer_ids: List[int]
    campaign: Campaign


class CustomerPrediction(BaseModel):
    customer_id: int
    customer_name: str
    age: int
    income_bracket: str
    interest_segment: str
    will_open: bool
    will_click: bool
    will_unsubscribe: bool
    will_convert: bool
    confidence_open: float
    confidence_click: float
    confidence_unsub: float
    confidence_convert: float


class SimulationSummary(BaseModel):
    total_customers: int
    predicted_opens: int
    predicted_clicks: int
    predicted_unsubscribes: int
    predicted_conversions: int
    open_rate: float
    click_rate: float
    unsubscribe_rate: float
    conversion_rate: float


class SimulationResponse(BaseModel):
    summary: SimulationSummary
    predictions: List[CustomerPrediction]


class CustomerListResponse(BaseModel):
    customers: List[Customer]
    total: int
    page: int
    page_size: int
