import os
import json
import hashlib
import requests
from dotenv import load_dotenv

load_dotenv(".env.local")

SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
SERVICE_ROLE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

DATA_DIR = "_json_data"

def upload_cards():
    if not SUPABASE_URL or not SERVICE_ROLE_KEY:
        print("Error: Missing Supabase Environment Variables!")
        return

    json_files = [f for f in os.listdir(DATA_DIR) if f.endswith(".json")]
    print(f"Detected {len(json_files)} JSON files in {DATA_DIR}...")

    headers = {
        "apikey": SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates"
    }

    records = []
    
    for filename in json_files:
        try:
            with open(os.path.join(DATA_DIR, filename), "r", encoding="utf-8") as f:
                data = json.load(f)
                
                # Generate a repeatable UUID-like string from title for 'id'
                # Supabase UUID column expects UUID, but let's use the title as ID if handled correctly
                # better yet, let's just let it generate UUID but avoid dupes by title? 
                # actually 'id' is PRIMARY KEY and it is UUID. 
                # I'll generate a UUID string from title MD5
                title = data.get("title", "Untitled")
                record_id = hashlib.md5(title.encode('utf-8')).hexdigest()
                # format hex to uuid: 8-4-4-4-12
                uuid_str = f"{record_id[:8]}-{record_id[8:12]}-{record_id[12:16]}-{record_id[16:20]}-{record_id[20:]}"

                record = {
                    "id": uuid_str,
                    "title": title,
                    "category": data.get("category", "전체"),
                    "tags": data.get("tags", []),
                    "summary": data.get("summary", ""),
                    "content": data.get("content", ""),
                    "key_points": data.get("key_points", []),
                    "image_count": data.get("image_count", 0),
                    "images": data.get("images", [])
                }
                records.append(record)
        except Exception as e:
            print(f"Error parsing {filename}: {e}")

    if not records:
        print("No valid records found.")
        return

    print(f"Uploading {len(records)} records to insurance_cards table...")
    
    # Bulk upload
    res = requests.post(f"{SUPABASE_URL}/rest/v1/insurance_cards", headers=headers, json=records)
    
    if res.status_code in [200, 201, 204]:
        print(f"Success! {len(records)} knowledge items have been synced to the database.")
    else:
        print(f"Upload failed: {res.status_code} - {res.text}")

if __name__ == "__main__":
    upload_cards()
