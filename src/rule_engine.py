def calculate_risk_score(features):
    score = 0

    if features.get("url_length", 0) > 75:
        score += 2
    if features.get("has_ip", 0) == 1:
        score += 3
    if features.get("has_https", 0) == 0:
        score += 2
    if features.get("keyword_count", 0) > 0:
        score += 2
    if features.get("has_login_form", 0) == 1:
        score += 2

    return score


def classify(score):
    if score >= 7:
        return "Phishing"
    elif score >= 4:
        return "Suspicious"
    else:
        return "Legitimate"
