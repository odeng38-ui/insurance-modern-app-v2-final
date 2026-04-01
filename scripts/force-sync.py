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

def force_sync_by_keyword(keyword, original_id):
    # 1. Look for all folders and find by keyword
    all_folders = [f for f in os.listdir(ROOT_DIR) if os.path.isdir(os.path.join(ROOT_DIR, f))]
    
    # Simple search for keyword match
    matching_folders = [f for f in all_folders if keyword.replace(" ", "") in f.replace("+", "").replace(" ", "")]
    
    if not matching_folders:
        print(f"No folders found for keyword: {keyword}")
        return
    
    print(f"Found {len(matching_folders)} matching folders: {matching_folders}")
    
    # Take the first one found or specifically the target
    folder_to_use = matching_folders[0]
    folder_path = os.path.join(ROOT_DIR, folder_to_use)
    files = [f for f in os.listdir(folder_path) if f.lower().endswith((".jpg", ".png", ".jpeg"))]
    
    print(f"Using folder: {folder_to_use} ({len(files)} images)")
    
    if len(files) > 0:
        # 2. Update DB
        safe_id = get_safe_id(original_id)
        url = f"{SUPABASE_URL}/rest/v1/insurance_cards?id=eq.{safe_id}"
        headers = {
            "apikey": SERVICE_ROLE_KEY,
            "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
            "Content-Type": "application/json",
            "Prefer": "return=minimal"
        }
        res = requests.patch(url, headers=headers, json={
            "images": sorted(files),
            "image_count": len(files)
        })
        if res.status_code in [200, 204]:
            print(f"SUCCESS: Force synced '{original_id}' with images from '{folder_to_use}'")
        else:
            print(f"Error {res.status_code}: {res.text}")

if __name__ == "__main__":
    # Force syncing the specific problematic item
    force_sync_by_keyword("암 관련 최근 보상 이슈 3가지", "암 관련 최근 보상 이슈 3가지")
