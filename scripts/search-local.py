import os
import json
import re

possible_index_paths = [
    r"C:\Users\HP\Desktop\보험자료\_json_data\index.json",
    r"C:\Users\HP\Desktop\자료\_json_data\index.json"
]
DATA_PATH = next((p for p in possible_index_paths if os.path.exists(p)), None)
ROOT_DIR = os.path.dirname(os.path.dirname(DATA_PATH))

def find_folders():
    titles = [
        "휴가철 자동차보험 활용팁", 
        "한국은 이미 고고당 주의보", 
        "침수차 보험 처리 자동차보험 보상"
    ]
    
    # Load index items
    items = []
    try:
        with open(DATA_PATH, 'r', encoding='utf-8') as f:
            items = json.load(f).get("items", [])
    except:
        with open(DATA_PATH, 'r', encoding='cp949') as f:
            items = json.load(f).get("items", [])

    for title in titles:
        print(f"\n--- Searching Local for: {title} ---")
        match = [item for item in items if title in item['title']]
        if not match:
            print("Not in index.json")
            continue
            
        for item in match:
            original_id = item['id']
            print(f"ID in index: {original_id}")
            folder_path = os.path.join(ROOT_DIR, original_id)
            if os.path.exists(folder_path):
                print(f"Folder FOUND: {folder_path}")
                files = os.listdir(folder_path)
                print(f"Files: {files}")
            else:
                print(f"Folder MISSING at: {folder_path}")
                # Try fuzzy matching (as in upload-images.py)
                disk_folders = os.listdir(ROOT_DIR)
                def clean(n): return re.sub(r'[^a-zA-Z0-9가-힣]', '', n.replace("+", ""))
                target = clean(original_id)
                found = False
                for df in disk_folders:
                    if clean(df) == target:
                        print(f"Fuzzy match found: {df}")
                        print(f"Files: {os.listdir(os.path.join(ROOT_DIR, df))}")
                        found = True
                if not found:
                    print("No local folder found even with fuzzy matching.")

if __name__ == "__main__":
    find_folders()
