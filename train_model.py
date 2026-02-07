import pandas as pd
from sklearn.ensemble import RandomForestClassifier
import joblib

# Load dataset from your data folder
try:
    df = pd.read_csv('data/final_dataset.csv')
    X = df.drop('label', axis=1)
    y = df['label']

    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X, y)

    joblib.dump(model, 'url_model.joblib')
    print("Success: url_model.joblib created!")
except Exception as e:
    print(f"Error: {e}")