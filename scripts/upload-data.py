import os
import json
import requests
import hashlib
from dotenv import load_dotenv

# Load environment variables
load_dotenv(".env.local")

SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
SERVICE_ROLE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SERVICE_ROLE_KEY:
    print("Error: Config missing")
    exit(1)

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
    r"C:\Users\HP\Desktop\자료\_json_data\index.json",
    r"C:\Users\HP\Desktop\ڷ\_json_data\index.json"
]
DATA_PATH = next((p for p in possible_index_paths if os.path.exists(p)), None)
ROOT_DIR = os.path.dirname(os.path.dirname(DATA_PATH))

def get_safe_id(id_str):
    return hashlib.md5(id_str.encode('utf-8')).hexdigest()

def upload_cards():
    if not DATA_PATH:
        print("Error: Index file not found.")
        return

    print(f"Syncing actual image filenames from: {ROOT_DIR}")
    
    # Try reading index correctly
    try:
        with open(DATA_PATH, 'r', encoding='utf-8') as f:
            items = json.load(f).get("items", [])
    except:
        with open(DATA_PATH, 'r', encoding='cp949') as f:
            items = json.load(f).get("items", [])

    print(f"Uploading {len(items)} items with ACTUAL filenames...")

    # For each item, find its folder and list actual jpg filenames
    final_payload = []
    for item in items:
        original_id = item["id"]
        safe_id = get_safe_id(original_id)
        card_folder = os.path.join(ROOT_DIR, original_id)
        
        # Detect real JPG/PNG files in the card's folder
        actual_images = []
        if os.path.exists(card_folder):
            actual_images = [f for f in os.listdir(card_folder) if f.lower().endswith((".jpg", ".png", ".jpeg"))]
        
        # If folder lookup fails by id, try a more flexible search if needed, 
        # but usually id matches folder name.
        
        final_payload.append({
            "id": safe_id,
            "title": item["title"],
            "category": item["category"],
            "tags": item["tags"],
            "summary": item["summary"],
            "content": f"{item['title']} " + " ".join(item.get("key_points", [])),
            "key_points": item.get("key_points", []),
            "image_count": len(actual_images),
            "images": sorted(actual_images) # Use REAL filenames (e.g., knowledge_67ee....jpg)
        })

    # Chunk and upload
    chunk_size = 50
    for i in range(0, len(final_payload), chunk_size):
        chunk = final_payload[i:i + chunk_size]
        res = requests.post(API_URL, headers=HEADERS, json=chunk)
        if res.status_code in [200, 201, 204]:
            print(f"Uploaded sync chunk {i//chunk_size + 1}")
        else:
            print(f"Error {res.status_code}: {res.text}")

if __name__ == "__main__":
    upload_cards()
