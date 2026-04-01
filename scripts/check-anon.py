import os
import requests
import json
from dotenv import load_dotenv

load_dotenv(".env.local")

SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
ANON_KEY = os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")

def check_anon_access():
    url = f"{SUPABASE_URL}/rest/v1/insurance_cards"
    headers = {
        "apikey": ANON_KEY,
        "Authorization": f"Bearer {ANON_KEY}"
    }
    
    # Try selection
    res = requests.get(f"{url}?select=id", headers=headers)
    if res.status_code == 200:
        data = res.json()
        print(f"ANON ACCESS SUCCESS: {len(data)} rows returned.")
    else:
        print(f"ANON ACCESS ERROR {res.status_code}: {res.text}")

if __name__ == "__main__":
    check_anon_access()
