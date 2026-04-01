import os
import requests
import json
from dotenv import load_dotenv

load_dotenv(".env.local")

SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
SERVICE_ROLE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
BUCKET_NAME = "card-images"

if not SUPABASE_URL or not SERVICE_ROLE_KEY:
    print("Error: Config missing")
    exit(1)

def list_bucket_objects():
    # Supabase list endpoint
    # POST /storage/v1/object/list/{bucket}/{prefix}
    url = f"{SUPABASE_URL}/storage/v1/object/list/{BUCKET_NAME}"
    headers = {
        "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
        "Content-Type": "application/json"
    }
    
    # We want to list all folders (safe_ids)
    payload = {
        "prefix": "",
        "limit": 1000,
        "offset": 0,
        "sortBy": {"column": "name", "order": "asc"}
    }
    
    res = requests.post(url, headers=headers, json=payload)
    if res.status_code == 200:
        objects = res.json()
        print(f"Total folders (products) in '{BUCKET_NAME}': {len(objects)}")
        
        total_files = 0
        for obj in objects:
            if obj.get('id') is None and obj.get('name'): # It's a folder-like object in Supabase response?
                # List files in this folder
                folder_name = obj['name']
                # Sub-list
                sub_url = f"{SUPABASE_URL}/storage/v1/object/list/{BUCKET_NAME}"
                sub_payload = {
                    "prefix": f"{folder_name}/",
                    "limit": 100,
                    "offset": 0
                }
                sub_res = requests.post(sub_url, headers=headers, json=sub_payload)
                if sub_res.status_code == 200:
                    files = sub_res.json()
                    total_files += len(files)
        
        print(f"Total images across all folders: {total_files}")
    else:
        print(f"Listing error {res.status_code}: {res.text}")

if __name__ == "__main__":
    list_bucket_objects()
