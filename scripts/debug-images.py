import os
import requests
import json
import hashlib
from dotenv import load_dotenv

load_dotenv(".env.local")

SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
SERVICE_ROLE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

def check_specific_cards():
    titles = [
        "휴가철 자동차보험 활용팁", 
        "한국은 이미 고고당 주의보", 
        "침수차 보험 처리 자동차보험 보상"
    ]
    
    url = f"{SUPABASE_URL}/rest/v1/insurance_cards"
    headers = {
        "apikey": SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SERVICE_ROLE_KEY}"
    }
    
    for title in titles:
        print(f"\n--- Checking: {title} ---")
        params = {"title": f"ilike.%{title}%", "select": "*"}
        res = requests.get(url, headers=headers, params=params)
        if res.status_code == 200:
            data = res.json()
            if not data:
                print("   [!] Not found in DB")
                continue
            
            for card in data:
                print(f"   [+] DB ID: {card['id']}")
                print(f"   [+] DB Title: {card['title']}")
                print(f"   [+] DB Images: {card['images']}")
                
                if card['images']:
                    img = card['images'][0]
                    # The CardItem.tsx uses /storage/v1/object/public/card-images/STORAGE_ID/FILENAME
                    storage_url = f"{SUPABASE_URL}/storage/v1/object/public/card-images/{card['id']}/{img}"
                    print(f"   [*] Attempting HEAD: {storage_url}")
                    s_res = requests.head(storage_url)
                    print(f"   [?] Result Code: {s_res.status_code}")
                    if s_res.status_code != 200:
                        print(f"       [DEBUG] HEAD failed. Requesting GET to see error detail...")
                        g_res = requests.get(storage_url)
                        print(f"       [DEBUG] GET Result: {g_res.text[:100]}")
                else:
                    print("   [!] No images in DB entry list.")
        else:
            print(f"API Error {res.status_code}: {res.text}")

if __name__ == "__main__":
    check_specific_cards()
