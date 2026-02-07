from src.url_analysis import analyze_url
from src.content_analysis import analyze_content
from src.rule_engine import calculate_risk_score, classify

def detect(url):
    url_features = analyze_url(url)
    content_features = analyze_content(url)

    all_features = {**url_features, **content_features}
    score = calculate_risk_score(all_features)
    result = classify(score)

    return result, score, all_features
