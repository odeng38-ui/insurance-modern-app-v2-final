import os
import requests
import json
import hashlib
from dotenv import load_dotenv

load_dotenv(".env.local")

SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
SERVICE_ROLE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

ROOT_DIR = r"C:\Users\HP\Desktop\보험자료"

def get_safe_id(id_str):
    return hashlib.md5(id_str.encode('utf-8')).hexdigest()

def sync_by_fuzzy_folder_names():
    # 1. Get all folders in ROOT_DIR
    real_folders = [f for f in os.listdir(ROOT_DIR) if os.path.isdir(os.path.join(ROOT_DIR, f))]
    folder_map = {f.replace("+", " ").strip().lower(): f for f in real_folders}
    
    # 2. Get index.json
    try:
        index_path = os.path.join(ROOT_DIR, "_json_data", "index.json")
        with open(index_path, 'r', encoding='utf-8') as f:
            items = json.load(f).get("items", [])
    except:
        return print("Index not found.")

    print(f"Total folders found: {len(real_folders)}")
    
    final_payload = []
    
    # Search for "암주요치료비"
    targets = ["암주요치료비", "암진단금 높을수록 사망률이 떨어진다"]
    
    for item in items:
        title = item["title"]
        original_id = item["id"]
        safe_id = get_safe_id(original_id)
        
        # Try finding a matching folder
        matched_folder = None
        # Try 1: Exact match
        if os.path.exists(os.path.join(ROOT_DIR, original_id)):
            matched_folder = original_id
        # Try 2: Space normalized
        else:
            norm_id = original_id.replace("+", " ").strip().lower()
            if norm_id in folder_map:
                matched_folder = folder_map[norm_id]
        
        if matched_folder:
            folder_path = os.path.join(ROOT_DIR, matched_folder)
            files = [f for f in os.listdir(folder_path) if f.lower().endswith((".jpg", ".png", ".jpeg"))]
            
            if len(files) > 0:
                final_payload.append({
                    "id": safe_id,
                    "title": item["title"],
                    "images": sorted(files),
                    "image_count": len(files)
                })
                if item["title"] in ["암주요치료비", "암진단금 높을수록 사망률이 떨어진다"]:
                    print(f"SUCCSS: Found {len(files)} imgs for '{item['title']}' in folder '{matched_folder}'")

    if final_payload:
        print(f"Updating {len(final_payload)} items in DB with verified images...")
        chunk_size = 50
        for i in range(0, len(final_payload), chunk_size):
            chunk = final_payload[i:i + chunk_size]
            url = f"{SUPABASE_URL}/rest/v1/insurance_cards"
            headers = {
                "apikey": SERVICE_ROLE_KEY,
                "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
                "Content-Type": "application/json",
                "Prefer": "resolution=merge-duplicates"
            }
            res = requests.post(url, headers=headers, json=chunk)
            print(f"  Chunk {i//chunk_size + 1} res: {res.status_code}")

if __name__ == "__main__":
    sync_by_fuzzy_folder_names()
