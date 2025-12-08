import joblib
import pandas as pd
import numpy as np
from pathlib import Path
from typing import Dict, List, Tuple

# Path to the trained models
BRAIN_PATH = Path(__file__).parent.parent / "ecommerce_brain.pkl"
DATA_PATH = Path(__file__).parent.parent / "ecommerce_marketing_data.csv"


class DigitalTwinPredictor:
    """Loads trained ML models and makes predictions for campaign simulations."""
    
    def __init__(self):
        self.models: Dict = {}
        self.customer_data: pd.DataFrame = None
        self._load_models()
        self._load_customer_data()
    
    def _load_models(self):
        """Load the trained models from pickle file."""
        if BRAIN_PATH.exists():
            self.models = joblib.load(BRAIN_PATH)
            print(f"✓ Loaded models: {list(self.models.keys())}")
        else:
            raise FileNotFoundError(f"Model file not found at {BRAIN_PATH}")
    
    def _load_customer_data(self):
        """Load customer data for retrieval and aggregation."""
        if DATA_PATH.exists():
            self.customer_data = pd.read_csv(DATA_PATH)
            print(f"✓ Loaded {len(self.customer_data)} customer records")
        else:
            raise FileNotFoundError(f"Data file not found at {DATA_PATH}")
    
    def get_unique_customers(self) -> pd.DataFrame:
        """Get unique customers with aggregated engagement history."""
        # Group by user to get unique customers with their stats
        agg = self.customer_data.groupby('user_id').agg({
            'name': 'first',
            'age': 'first',
            'income_bracket': 'first',
            'interest_segment': 'first',
            'past_purchase_count': 'first',
            'opened': 'sum',
            'clicked': 'sum',
            'converted': 'sum'
        }).reset_index()
        
        agg.columns = ['user_id', 'name', 'age', 'income_bracket', 'interest_segment', 
                       'past_purchase_count', 'historical_opens', 'historical_clicks',
                       'historical_conversions']
        return agg
    
    def get_customer_by_id(self, user_id: int) -> dict:
        """Get a single customer's data."""
        customers = self.get_unique_customers()
        customer = customers[customers['user_id'] == user_id]
        if len(customer) == 0:
            return None
        return customer.iloc[0].to_dict()
    
    def predict(
        self, 
        customer_ids: List[int], 
        campaign_type: str, 
        subject_line: str, 
        send_hour: int
    ) -> List[dict]:
        """
        Run predictions for a campaign against selected customers.
        
        Returns list of predictions with probabilities.
        """
        # Get customer data for selected IDs
        customers = self.get_unique_customers()
        selected = customers[customers['user_id'].isin(customer_ids)].copy()
        
        if len(selected) == 0:
            return []
        
        # Prepare features for prediction
        # Features: age, income_bracket, interest_segment, past_purchase_count, 
        #           campaign_type, subject_length, send_hour
        selected['campaign_type'] = campaign_type
        selected['subject_length'] = len(subject_line)
        selected['send_hour'] = send_hour
        
        feature_cols = ['age', 'income_bracket', 'interest_segment', 'past_purchase_count',
                        'campaign_type', 'subject_length', 'send_hour']
        X = selected[feature_cols]
        
        # Get predictions from each model
        predictions = []
        
        # Get probability predictions
        open_probs = self.models['opened_model'].predict_proba(X)[:, 1]
        click_probs = self.models['clicked_model'].predict_proba(X)[:, 1]
        unsub_probs = self.models['unsubscribed_model'].predict_proba(X)[:, 1]
        conv_probs = self.models['converted_model'].predict_proba(X)[:, 1]
        
        # Use realistic thresholds based on actual data distributions
        # Open rate ~44%, Click rate ~7%, Unsub rate ~3%, Convert rate ~2%
        # We use probabilistic sampling - if prob > random threshold, predict True
        np.random.seed(42)  # For reproducibility within session
        
        # Use probability as the decision - sample based on predicted probability
        open_preds = np.array([np.random.random() < p for p in open_probs])
        click_preds = np.array([np.random.random() < p for p in click_probs])
        unsub_preds = np.array([np.random.random() < p for p in unsub_probs])
        conv_preds = np.array([np.random.random() < p for p in conv_probs])
        
        # Build response
        for i, (_, row) in enumerate(selected.iterrows()):
            predictions.append({
                'customer_id': int(row['user_id']),
                'customer_name': row['name'],
                'age': int(row['age']),
                'income_bracket': row['income_bracket'],
                'interest_segment': row['interest_segment'],
                'will_open': bool(open_preds[i]),
                'will_click': bool(click_preds[i]),
                'will_unsubscribe': bool(unsub_preds[i]),
                'will_convert': bool(conv_preds[i]),
                'confidence_open': round(float(open_probs[i]), 3),
                'confidence_click': round(float(click_probs[i]), 3),
                'confidence_unsub': round(float(unsub_probs[i]), 3),
                'confidence_convert': round(float(conv_probs[i]), 3)
            })
        
        return predictions


# Singleton instance
_predictor = None

def get_predictor() -> DigitalTwinPredictor:
    """Get or create the singleton predictor instance."""
    global _predictor
    if _predictor is None:
        _predictor = DigitalTwinPredictor()
    return _predictor
