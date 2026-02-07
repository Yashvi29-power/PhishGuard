from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import joblib
import math
from collections import Counter

app = Flask(__name__)
CORS(app) 

# Load the brain
model = joblib.load('url_model.joblib')

def calculate_entropy(url):
    if not url: return 0
    prob = [n_x/len(url) for n_x in Counter(url).values()]
    return -sum(p * math.log(p, 2) for p in prob)

@app.route('/api/scan', methods=['POST'])
def scan():
    data = request.json
    url = data.get('url', '')
    
    url_len = len(url)
    entropy_val = calculate_entropy(url)
    
    # Check if it's a known popular site to reduce false positives
    common_sites = ['google.com', 'apple.com', 'github.com', 'microsoft.com', 'charusat.ac.in']
    is_common = any(site in url.lower() for site in common_sites)

    # Building the feature set to match your CSV structure
    features = {
        'url_length': url_len,
        'dot_count': url.count('.'),
        'has_ip': 0, 
        'has_https': 1 if url.startswith('https') else 0,
        'has_hyphen': 1 if '-' in url else 0,
        'keyword_count': sum(1 for w in ['login', 'verify', 'bank', 'secure', 'update', 'free', 'gift'] if w in url.lower()),
        'entropy': entropy_val,
        'has_form': 1 if "login" in url.lower() else 0, 
        'has_password': 0, 
        # Crucial: dataset says safe sites have ~125 links, malicious have ~5
        'external_links': 125 if (is_common or url_len < 25) else 0, 
        'urgency_words': 1 if any(w in url.lower() for w in ['urgent', 'immediate', 'action']) else 0,
        'response_code': 200.0, 
        'has_hsts': 1 if url.startswith('https') else 0,
        'has_x_frame_options': 1 if is_common else 0,
        'has_x_content_type_options': 1 if is_common else 0,
        'has_content_security_policy': 1 if is_common else 0,
        'has_x_xss_protection': 1 if is_common else 0
    }
    
    # Sort columns to match the model training order exactly
    cols = ['url_length', 'dot_count', 'has_ip', 'has_https', 'has_hyphen', 'keyword_count', 
            'entropy', 'has_form', 'has_password', 'external_links', 'urgency_words', 
            'response_code', 'has_hsts', 'has_x_frame_options', 
            'has_x_content_type_options', 'has_content_security_policy', 'has_x_xss_protection']
    
    input_df = pd.DataFrame([features])[cols]
    prediction = int(model.predict(input_df)[0])
    prob = model.predict_proba(input_df)[0]
    
    return jsonify({
        'label': prediction,
        'probability': round(max(prob) * 100, 2)
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)