import os
import requests
import hashlib
import re
from dotenv import load_dotenv

load_dotenv(".env.local")

SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
SERVICE_ROLE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
BUCKET_NAME = "card-images"

if not SUPABASE_URL or not SERVICE_ROLE_KEY:
    print("Error: Config missing")
    exit(1)

# Data path discovery
possible_index_paths = [
    r"C:\Users\HP\Desktop\보험자료\_json_data\index.json",
    r"C:\Users\HP\Desktop\자료\_json_data\index.json"
]
DATA_PATH = next((p for p in possible_index_paths if os.path.exists(p)), None)
ROOT_DIR = os.path.dirname(os.path.dirname(DATA_PATH))

def clean_name(name):
    if not name: return ""
    return re.sub(r'[^a-zA-Z0-9가-힣]', '', name.replace("+", ""))

def get_safe_id(id_str):
    return hashlib.md5(id_str.encode("utf-8")).hexdigest()

def upload_file(local_path, storage_path, content_type="image/jpeg"):
    url = f"{SUPABASE_URL}/storage/v1/object/{BUCKET_NAME}/{storage_path}"
    with open(local_path, "rb") as f:
        headers = {
            "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
            "Content-Type": content_type
        }
        res = requests.post(url, headers=headers, data=f)
        return res.status_code

def sync_images_to_storage():
    print(f"Starting Intelligent Image Upload from: {ROOT_DIR}")
    
    # Map disk folders for fuzzy matching
    disk_folders = os.listdir(ROOT_DIR)
    folder_map = {clean_name(f): f for f in disk_folders if os.path.isdir(os.path.join(ROOT_DIR, f))}
    
    import json
    try:
        with open(DATA_PATH, 'r', encoding='utf-8') as f:
            items = json.load(f).get("items", [])
    except:
        with open(DATA_PATH, 'r', encoding='cp949') as f:
            items = json.load(f).get("items", [])

    total_uploaded = 0
    total_skipped = 0

    for item in items:
        original_id = item["id"]
        safe_id = get_safe_id(original_id)
        
        # Try finding the folder
        target_folder = os.path.join(ROOT_DIR, original_id)
        if not os.path.exists(target_folder):
            cleaned = clean_name(original_id)
            if cleaned in folder_map:
                target_folder = os.path.join(ROOT_DIR, folder_map[cleaned])
        
        if not os.path.exists(target_folder):
            print(f"Skipping {original_id} - folder not found.")
            continue

        # Upload JPGs and PNGs
        file_list = [f for f in os.listdir(target_folder) if f.lower().endswith((".jpg", ".png", ".jpeg"))]
        for f in file_list:
            local_path = os.path.join(target_folder, f)
            # Path in storage: {safe_id}/{f}
            storage_path = f"{safe_id}/{f}"
            
            content_type = "image/jpeg"
            if f.lower().endswith(".png"):
                content_type = "image/png"
            
            status = upload_file(local_path, storage_path, content_type)
            if status in [200, 201]:
                total_uploaded += 1
            else:
                total_skipped += 1
        
        print(f"Processed: {original_id} ({len(file_list)} imgs)")

    print("-" * 30)
    print(f"Sync complete. Uploaded: {total_uploaded}, Failed/Skipped: {total_skipped}")

if __name__ == "__main__":
    sync_images_to_storage()
