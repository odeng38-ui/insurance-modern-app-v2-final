import os
import requests
import re
from dotenv import load_dotenv

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
}

def apply_categories_from_sql():
    sql_path = "scripts/update_categories.sql"
    if not os.path.exists(sql_path):
        print(f"Error: {sql_path} not found.")
        return

    with open(sql_path, "r", encoding="utf-8") as f:
        sql_content = f.read()

    # Parse UPDATE statements using regex
    # Pattern: UPDATE insurance_cards SET category = 'CATEGORY' WHERE id IN ('id1', 'id2', ...);
    pattern = r"UPDATE insurance_cards SET category = '(.*?)' WHERE id IN \((.*?)\);"
    matches = re.findall(pattern, sql_content, re.DOTALL)

    print(f"Found {len(matches)} category update patterns in SQL.")

    import hashlib
    def get_safe_id(id_str):
        return hashlib.md5(id_str.encode('utf-8')).hexdigest()

    for category, id_list_str in matches:
        # Extract individual IDs, clean, and HASH them to match DB
        original_ids = [id_str.strip().strip("'") for id_str in id_list_str.split(",")]
        safe_ids = [get_safe_id(oid) for oid in original_ids]
        
        print(f"Applying category '{category}' to {len(safe_ids)} items (hashed)...")

        # Batch update via REST API
        chunk_size = 10
        for i in range(0, len(safe_ids), chunk_size):
            chunk = safe_ids[i:i + chunk_size]
            id_filter = ",".join(chunk) 
            url = f"{API_URL}"
            params = {"id": f"in.({id_filter})"}
            
            res = requests.patch(url, headers=HEADERS, params=params, json={"category": category})
            if res.status_code not in [200, 204]:
                print(f"Error updating '{category}' hashed chunk: {res.status_code} {res.text}")
            
    print("Database category synchronization complete!")

if __name__ == "__main__":
    apply_categories_from_sql()
