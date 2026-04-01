import os
import json
import requests
import hashlib
import re
from dotenv import load_dotenv

load_dotenv(".env.local")

SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
SERVICE_ROLE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
API_URL = f"{SUPABASE_URL}/rest/v1/insurance_cards"
HEADERS = {
    "apikey": SERVICE_ROLE_KEY,
    "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "resolution=merge-duplicates"
}

# Data path discovery
possible_index_paths = [
    r"C:\Users\HP\Desktop\보험자료\_json_data\index.json",
    r"C:\Users\HP\Desktop\자료\_json_data\index.json"
]
DATA_PATH = next((p for p in possible_index_paths if os.path.exists(p)), None)
ROOT_DIR = os.path.dirname(os.path.dirname(DATA_PATH))

def clean_name(name):
    # Normalize name for better matching: No space, No +, No special chars
    if not name: return ""
    return re.sub(r'[^a-zA-Z0-9가-힣]', '', name.replace("+", ""))

def get_safe_id(id_str):
    return hashlib.md5(id_str.encode('utf-8')).hexdigest()

def fuzzy_recovery_sync():
    print(f"Starting Fuzzy Recovery Sync from: {ROOT_DIR}")
    
    # 1. Index Load
    try:
        with open(DATA_PATH, 'r', encoding='utf-8') as f:
            items = json.load(f).get("items", [])
    except:
        with open(DATA_PATH, 'r', encoding='cp949') as f:
            items = json.load(f).get("items", [])

    # 2. Get Real Disk Folders to create a Map
    disk_folders = os.listdir(ROOT_DIR)
    folder_map = {clean_name(f): f for f in disk_folders if os.path.isdir(os.path.join(ROOT_DIR, f))}
    
    print(f"Indexed disk catalogs: {len(folder_map)} folders found.")

    # 3. Match and Prepare Payload
    payload = []
    found_count = 0
    missing_count = 0

    for item in items:
        original_id = item["id"]
        safe_id = get_safe_id(original_id)
        
        # Try direct match
        target_folder = os.path.join(ROOT_DIR, original_id)
        
        # Try fuzzy match if direct fails
        if not os.path.exists(target_folder):
            cleaned = clean_name(original_id)
            if cleaned in folder_map:
                target_folder = os.path.join(ROOT_DIR, folder_map[cleaned])

        actual_images = []
        if os.path.exists(target_folder):
            # Include all image formats just in case
            actual_images = [f for f in os.listdir(target_folder) if f.lower().endswith((".jpg", ".png", ".jpeg"))]
            found_count += 1
        else:
            missing_count += 1
            
        payload.append({
            "id": safe_id,
            "title": item["title"],
            "category": item["category"],
            "tags": item["tags"],
            "summary": item["summary"],
            "content": f"{item['title']} " + " ".join(item.get("key_points", [])),
            "key_points": item.get("key_points", []),
            "image_count": len(actual_images),
            "images": sorted(actual_images)
        })

    print(f"Recovery mapping complete: Found {found_count}, Still Missing {missing_count}")

    # 4. Upload recovery
    chunk_size = 50
    for i in range(0, len(payload), chunk_size):
        chunk = payload[i:i + chunk_size]
        res = requests.post(API_URL, headers=HEADERS, json=chunk)
        if res.status_code in [200, 201, 204]:
            print(f"Recovered chunk {i//chunk_size + 1}")
        else:
            print(f"Recovery error {res.status_code}: {res.text}")

if __name__ == "__main__":
    fuzzy_recovery_sync()
