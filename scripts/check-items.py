import os
import requests
import hashlib
from dotenv import load_dotenv

load_dotenv(".env.local")

SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
SERVICE_ROLE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

ROOT_DIR = r"C:\Users\HP\Desktop\보험자료"

def get_safe_id(id_str):
    return hashlib.md5(id_str.encode('utf-8')).hexdigest()

def check_specific_items(titles):
    print("--- Detailed Status Check ---")
    for title_id in titles:
        safe_id = get_safe_id(title_id)
        folder_path = os.path.join(ROOT_DIR, title_id)
        
        # 1. Local check
        if os.path.exists(folder_path):
            files = [f for f in os.listdir(folder_path) if f.lower().endswith((".jpg", ".png", ".jpeg"))]
            print(f"Title ID: {title_id}")
            print(f"  Local Folder: Found ({len(files)} images)")
            if len(files) > 0:
                print(f"  First Local Image: {files[0]}")
        else:
            print(f"Title ID: {title_id} -> LOCAL FOLDER NOT FOUND")
            
        # 2. DB check
        url = f"{SUPABASE_URL}/rest/v1/insurance_cards?id=eq.{safe_id}"
        headers = {
            "apikey": SERVICE_ROLE_KEY,
            "Authorization": f"Bearer {SERVICE_ROLE_KEY}"
        }
        res = requests.get(url, headers=headers)
        if res.status_code == 200:
            data = res.json()
            if data:
                print(f"  DB Entry: Found (Title: {data[0]['title']}, Category: {data[0]['category']})")
                print(f"  DB Images Array: {data[0]['images']}")
            else:
                print(f"  DB Entry: NOT FOUND (SafeID: {safe_id})")
        else:
            print(f"  DB Error: {res.status_code}")
        print("-" * 30)

if __name__ == "__main__":
    # Checking variants
    check_specific_items([
        "암 관련 최근 보상 이슈 3가지",
        "암+관련++최근+보상+이슈+3가지",
        "암 관련 최근 보상 이슈 3가지 (1)",
        "암 관련 최근 보상 이슈 3가지 (2)"
    ])
