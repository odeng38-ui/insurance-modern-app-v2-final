import os
import requests
import json
from dotenv import load_dotenv

load_dotenv(".env.local")

SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
SERVICE_ROLE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

def check_db():
    url = f"{SUPABASE_URL}/rest/v1/insurance_cards"
    headers = {
        "apikey": SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SERVICE_ROLE_KEY}"
    }
    
    # Get all categories and their counts
    res = requests.get(f"{url}?select=category", headers=headers)
    if res.status_code == 200:
        data = res.json()
        counts = {}
        for d in data:
            cat = d['category']
            counts[cat] = counts.get(cat, 0) + 1
        print("Category Counts in DB:", counts)
    else:
        print(f"Error {res.status_code}: {res.text}")

if __name__ == "__main__":
    check_db()
