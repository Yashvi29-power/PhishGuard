import requests
from bs4 import BeautifulSoup

def analyze_content(url):
    features = {
        "has_login_form": 0,
        "external_links": 0
    }

    try:
        response = requests.get(url, timeout=5)
        soup = BeautifulSoup(response.text, "html.parser")

        if soup.find("input", {"type": "password"}):
            features["has_login_form"] = 1

        links = soup.find_all("a", href=True)
        features["external_links"] = len(links)

    except Exception:
        pass

    return features
