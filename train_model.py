import pandas as pd
import joblib
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline

def train_models():
    print("Loading Dataset...")
    try:
        df = pd.read_csv('ecommerce_marketing_data.csv')
    except FileNotFoundError:
        print("Error: Run generation script first.")
        return

    # 1. Define Features & Targets
    # We drop 'user_id', 'campaign_id', 'subject_line' (using length instead), and targets
    feature_cols = ['age', 'income_bracket', 'interest_segment', 'past_purchase_count', 
                    'campaign_type', 'subject_length', 'send_hour']
    
    X = df[feature_cols]
    
    # 2. Create Preprocessing Pipeline (Handles Categorical Data automatically)
    # This is better than get_dummies because it remembers categories for new data
    categorical_features = ['income_bracket', 'interest_segment', 'campaign_type']
    
    preprocessor = ColumnTransformer(
        transformers=[
            ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_features)
        ],
        remainder='passthrough' # Keep numeric columns as is
    )

    # 3. Train Models
    # We use a Dictionary to store our 4 distinct models
    models = {}
    targets = ['opened', 'clicked', 'unsubscribed', 'converted']
    
    for target in targets:
        print(f"\nTraining Model for: {target.upper()}...")
        y = df[target]
        
        # Split
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        # Create Pipeline: Preprocessor -> Classifier
        # Using GradientBoosting for better performance on imbalanced data (like Unsubscribe)
        clf = Pipeline(steps=[
            ('preprocessor', preprocessor),
            ('classifier', GradientBoostingClassifier(n_estimators=100, learning_rate=0.1, max_depth=3, random_state=42))
        ])
        
        clf.fit(X_train, y_train)
        
        # Evaluate
        score = clf.score(X_test, y_test)
        print(f"Accuracy: {score:.4f}")
        models[f'{target}_model'] = clf

    # 4. Save Everything
    print("\nSaving Brain to 'ecommerce_brain.pkl'...")
    joblib.dump(models, 'ecommerce_brain.pkl')
    print("Done. You can now use this file for your Digital Twin simulation.")

if __name__ == "__main__":
    train_models()
