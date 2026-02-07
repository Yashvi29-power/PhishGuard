import re
from urllib.parse import urlparse

SUSPICIOUS_KEYWORDS = ["login", "verify", "secure", "update", "bank"]

def extract_url_features(url):
    features = {}

    features["url_length"] = len(url)
    features["has_ip"] = 1 if re.search(r"\d+\.\d+\.\d+\.\d+", url) else 0
    features["has_https"] = 1 if url.startswith("https") else 0
    features["dot_count"] = url.count(".")
    features["hyphen_count"] = url.count("-")

    keyword_count = 0
    for keyword in SUSPICIOUS_KEYWORDS:
        if keyword in url.lower():
            keyword_count += 1

    features["keyword_count"] = keyword_count

    return features
