import pandas as pd
from sklearn.ensemble import RandomForestClassifier
import joblib
import os

# Load dataset
file_path = 'data/final_dataset.csv'
if not os.path.exists(file_path):
    # Fallback to current directory if not in /data
    file_path = 'final_dataset.csv'

df = pd.read_csv(file_path)
X = df.drop('label', axis=1)
y = df['label']

# Train Model
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X, y)

# Save
joblib.dump(model, 'url_model.joblib')
print("✅ url_model.joblib has been created successfully!")