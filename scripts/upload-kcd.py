import pandas as pd
import os
import hashlib
import requests
from dotenv import load_dotenv

load_dotenv(".env.local")

SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
SERVICE_ROLE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

excel_path = r"data\제9차 한국표준질병ㆍ사인분류 DB masterfile_251223_20251223031826.xlsx"

def process_and_upload():
    print("Reading Excel KCD Master (61,005 rows)...")
    df = pd.read_excel(excel_path, sheet_name=1, skiprows=1)
    
    # Select columns
    df = df.iloc[:, [1, 2, 5, 6]]
    df.columns = ['level', 'code', 'name_ko', 'name_en']
    
    # Drop rows with null codes
    df = df.dropna(subset=['code'])
    df = df.fillna("")
    
    # Clean strings
    df['level'] = df['level'].astype(str).str.strip()
    df['code'] = df['code'].astype(str).str.strip()
    df['name_ko'] = df['name_ko'].astype(str).str.strip()
    df['name_en'] = df['name_en'].astype(str).str.strip()
    
    # Generate unique ID and Drop Duplicates
    print("Generating unique IDs and filtering duplicates...")
    df['id'] = (df['level'] + "_" + df['code'] + "_" + df['name_ko']).apply(
        lambda x: hashlib.md5(x.encode('utf-8')).hexdigest()
    )
    df = df.drop_duplicates(subset=['id'], keep='first')
    
    total_count = len(df)
    print(f"Unique records to upload: {total_count}")
    
    batch_size = 500
    headers = {
        "apikey": SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates" # Upsert mode if wanted
    }
    
    for i in range(0, total_count, batch_size):
        batch_df = df.iloc[i : i + batch_size]
        records = batch_df.to_dict(orient='records')
        
        res = requests.post(f"{SUPABASE_URL}/rest/v1/disease_codes", headers=headers, json=records)
        
        if res.status_code not in [200, 201, 204]:
            print(f"Error at batch {i}: {res.status_code} - {res.text}")
            break
        
        if (i + batch_size) % 5000 == 0 or (i + batch_size) >= total_count:
            print(f"Progress: {min(i + batch_size, total_count)} / {total_count} records synced.")

if __name__ == "__main__":
    process_and_upload()
