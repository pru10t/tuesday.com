import pandas as pd
import numpy as np
import random

def generate_balanced_ecommerce_data(n_samples=10000):
    print(f"Generating {n_samples} balanced e-commerce records...")
    np.random.seed(42)
    random.seed(42)

    # Name pools for realistic synthetic names
    first_names = [
        "Emma", "Liam", "Olivia", "Noah", "Ava", "Ethan", "Sophia", "Mason",
        "Isabella", "William", "Mia", "James", "Charlotte", "Benjamin", "Amelia",
        "Lucas", "Harper", "Henry", "Evelyn", "Alexander", "Abigail", "Michael",
        "Emily", "Daniel", "Elizabeth", "Jacob", "Sofia", "Logan", "Avery", "Jackson",
        "Ella", "Sebastian", "Scarlett", "Aiden", "Grace", "Matthew", "Chloe", "Samuel",
        "Victoria", "David", "Riley", "Joseph", "Aria", "Carter", "Lily", "Owen",
        "Aubrey", "Wyatt", "Zoey", "John", "Penelope", "Jack", "Layla", "Luke",
        "Camila", "Jayden", "Nora", "Dylan", "Hannah", "Grayson", "Sarah", "Levi",
        "Addison", "Isaac", "Eleanor", "Gabriel", "Natalie", "Julian", "Luna", "Mateo",
        "Savannah", "Anthony", "Brooklyn", "Jaxon", "Leah", "Lincoln", "Zoe", "Joshua"
    ]
    
    last_names = [
        "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
        "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson",
        "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson",
        "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker",
        "Young", "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores",
        "Green", "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell",
        "Carter", "Roberts", "Chen", "Kim", "Patel", "Shah", "Singh", "Kumar", "Ali",
        "Murphy", "Cook", "Rogers", "Morgan", "Peterson", "Cooper", "Reed", "Bailey"
    ]

    # 1. Base User Data
    # ---------------------------------------------------------
    user_ids = range(1001, 1001 + n_samples)
    
    # Generate unique names for each user
    names = [f"{random.choice(first_names)} {random.choice(last_names)}" for _ in range(n_samples)]
    
    # Age: Mixed distribution
    ages = np.concatenate([
        np.random.randint(18, 25, int(n_samples * 0.15)),
        np.random.randint(25, 45, int(n_samples * 0.50)),
        np.random.randint(45, 70, int(n_samples * 0.35))
    ])
    np.random.shuffle(ages)

    # Segments & Income
    segments = np.random.choice(['Tech Enthusiast', 'Fashionista', 'Home Decor', 'Bargain Hunter'], n_samples)
    income_brackets = np.random.choice(['Low', 'Medium', 'High'], n_samples, p=[0.3, 0.5, 0.2])
    past_purchases = np.random.poisson(lam=3, size=n_samples) 

    # 2. Campaign Data (The Stimulus)
    # ---------------------------------------------------------
    # We create a pool of campaigns to assign randomly
    campaign_pool = []
    
    subject_lines_map = {
        'Promo': [
            "Flash Sale: 50% Off Everything!", "Your Exclusive Discount Inside", 
            "Last Chance for Black Friday Deals", "Save Big on Your Favorites"
        ],
        'Newsletter': [
            "This Week's Top Trends", "5 Tips for Better Living", 
            "What's New at Our Store", "Curated Picks Just for You"
        ],
        'Welcome': [
            "Welcome to the Family!", "Thanks for Signing Up - Here's 10% Off", 
            "Getting Started with Your Account"
        ],
        'Cart Abandonment': [
            "You Left Something Behind", "Complete Your Purchase Now", 
            "Still Thinking About It?"
        ]
    }

    # Generate 50 unique campaigns
    for i in range(50):
        c_type = np.random.choice(['Promo', 'Newsletter', 'Welcome', 'Cart Abandonment'], p=[0.4, 0.3, 0.1, 0.2])
        subj = random.choice(subject_lines_map[c_type])
        c_id = f"CMP-{1000+i}"
        
        campaign_pool.append({
            'campaign_id': c_id,
            'campaign_type': c_type,
            'subject_line': subj,
            'subject_length': len(subj),
            'send_hour': np.random.randint(8, 22)
        })
    
    # Assign one campaign to each user row
    assigned_campaigns = [random.choice(campaign_pool) for _ in range(n_samples)]
    
    # Build Initial DataFrame
    df = pd.DataFrame({
        'user_id': user_ids,
        'name': names,
        'age': ages,
        'income_bracket': income_brackets,
        'interest_segment': segments,
        'past_purchase_count': past_purchases
    })
    
    camp_df = pd.DataFrame(assigned_campaigns)
    df = pd.concat([df, camp_df], axis=1)

    # 3. Simulate Interactions (The "Brain")
    # ---------------------------------------------------------
    
    # --- OPEN LOGIC (Target ~30-40%) ---
    df['prob_open'] = 0.30 # Base
    df.loc[df['campaign_type'] == 'Welcome', 'prob_open'] += 0.30
    df.loc[df['campaign_type'] == 'Cart Abandonment', 'prob_open'] += 0.20
    df.loc[(df['interest_segment'] == 'Bargain Hunter') & (df['campaign_type'] == 'Promo'), 'prob_open'] += 0.15
    df.loc[df['subject_length'] < 35, 'prob_open'] += 0.05
    
    # Add noise & Calculate
    df['prob_open'] += np.random.normal(0, 0.05, n_samples)
    df['prob_open'] = df['prob_open'].clip(0, 1)
    df['opened'] = (np.random.rand(n_samples) < df['prob_open']).astype(int)

    # --- CLICK LOGIC (Target ~5-10%) ---
    # Note: In real life, Click Rate is often calculated as % of Open. 
    # Here we model P(Click | Open).
    df['prob_click'] = 0.10 # Base conditional probability
    
    df.loc[df['campaign_type'] == 'Promo', 'prob_click'] += 0.15
    df.loc[df['past_purchase_count'] > 4, 'prob_click'] += 0.10
    
    df['prob_click'] = df['prob_click'].clip(0, 1)
    
    # Must Open to Click
    random_clicks = (np.random.rand(n_samples) < df['prob_click']).astype(int)
    df['clicked'] = df['opened'] * random_clicks

    # --- UNSUBSCRIBE LOGIC (Target ~5%) ---
    df['prob_unsub'] = 0.01 # Base
    
    # Triggers: Too many newsletters, old age, or boring content
    df.loc[df['campaign_type'] == 'Newsletter', 'prob_unsub'] += 0.04
    df.loc[df['age'] > 60, 'prob_unsub'] += 0.03
    df.loc[df['past_purchase_count'] == 0, 'prob_unsub'] += 0.02
    
    df['prob_unsub'] = df['prob_unsub'].clip(0, 1)
    df['unsubscribed'] = (np.random.rand(n_samples) < df['prob_unsub']).astype(int)

    # --- CONVERSION LOGIC ---
    # Conversion usually only happens if clicked
    df['prob_conv'] = 0.0
    df.loc[df['clicked'] == 1, 'prob_conv'] = 0.25 # 25% of clickers buy
    
    random_conv = (np.random.rand(n_samples) < df['prob_conv']).astype(int)
    df['converted'] = df['clicked'] * random_conv

    # 4. Save
    # ---------------------------------------------------------
    output_cols = [
        'user_id', 'name', 'age', 'income_bracket', 'interest_segment', 'past_purchase_count',
        'campaign_id', 'campaign_type', 'subject_line', 'subject_length', 'send_hour',
        'opened', 'clicked', 'unsubscribed', 'converted'
    ]
    
    final_df = df[output_cols]
    final_df.to_csv('ecommerce_marketing_data.csv', index=False)
    
    # Print Stats for Verification
    print("\n--- Data Generation Stats ---")
    print(f"Open Rate: {final_df['opened'].mean():.2%}")
    print(f"Click Rate (Total): {final_df['clicked'].mean():.2%}")
    print(f"Unsubscribe Rate: {final_df['unsubscribed'].mean():.2%}")
    print(f"Conversion Rate: {final_df['converted'].mean():.2%}")
    print("File saved: ecommerce_marketing_data.csv")

if __name__ == "__main__":
    generate_balanced_ecommerce_data()
