import os
import json
import hashlib
import requests
from dotenv import load_dotenv

load_dotenv(".env.local")

SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
SERVICE_ROLE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

DATA_DIR = "_json_data"

def clean_text(text):
    if not text: return ""
    return text.replace('&#039;', '').replace('&amp;', ' ').replace('+', ' ').strip()

def upload_cards():
    if not SUPABASE_URL or not SERVICE_ROLE_KEY:
        print("Error: Missing Supabase Environment Variables!")
        return

    json_files = [f for f in os.listdir(DATA_DIR) if f.endswith(".json")]
    print(f"Detected {len(json_files)} JSON files. Starting clean ingestion...")

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
                
                # CLEAN the data before anything else
                raw_title = data.get("title", "Untitled")
                clean_title = clean_text(raw_title)
                
                # Generate stable ID from clean title
                record_id = hashlib.md5(clean_title.encode('utf-8')).hexdigest()
                uuid_str = f"{record_id[:8]}-{record_id[8:12]}-{record_id[12:16]}-{record_id[16:20]}-{record_id[20:]}"

                record = {
                    "id": uuid_str,
                    "title": clean_title,
                    "category": data.get("category", "전체"),
                    "tags": [clean_text(t) for t in data.get("tags", [])],
                    "summary": clean_text(data.get("summary", "")),
                    "content": data.get("content", ""),
                    "key_points": [clean_text(k) for k in data.get("key_points", [])],
                    "image_count": data.get("image_count", 0),
                    "images": data.get("images", [])
                }
                records.append(record)
        except Exception as e:
            print(f"Error parsing {filename}: {e}")

    if not records:
        print("No valid records found.")
        return

    print(f"Uploading {len(records)} SANITIZED records to insurance_cards...")
    
    # Bulk upload
    res = requests.post(f"{SUPABASE_URL}/rest/v1/insurance_cards", headers=headers, json=records)
    
    if res.status_code in [200, 201, 204]:
        print(f"Success! {len(records)} clean records are now live in the database.")
    else:
        print(f"Upload failed: {res.status_code} - {res.text}")

if __name__ == "__main__":
    upload_cards()
