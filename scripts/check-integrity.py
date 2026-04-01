import os
import json

# Data path discovery
possible_index_paths = [
    r"C:\Users\HP\Desktop\보험자료\_json_data\index.json",
    r"C:\Users\HP\Desktop\자료\_json_data\index.json",
    r"C:\Users\HP\Desktop\ڷ\_json_data\index.json"
]
DATA_PATH = next((p for p in possible_index_paths if os.path.exists(p)), None)

if not DATA_PATH:
    print("Error: Index file not found.")
    exit(1)

ROOT_DIR = os.path.dirname(os.path.dirname(DATA_PATH))

# Try reading index
try:
    with open(DATA_PATH, 'r', encoding='utf-8') as f:
        items = json.load(f).get("items", [])
except:
    with open(DATA_PATH, 'r', encoding='cp949') as f:
        items = json.load(f).get("items", [])

print(f"Total items in index: {len(items)}")
print(f"Actual ROOT_DIR: {ROOT_DIR}")

# Audit
missing_folders = []
empty_folders = []
ok_count = 0

for item in items:
    card_id = item["id"]
    card_folder = os.path.join(ROOT_DIR, card_id)
    
    if not os.path.exists(card_folder):
        missing_folders.append(card_id)
    else:
        # Check if it has JPGs/PNGs
        images = [f for f in os.listdir(card_folder) if f.lower().endswith((".jpg", ".png", ".jpeg"))]
        if not images:
            empty_folders.append(card_id)
        else:
            ok_count += 1

print("-" * 30)
print(f"Success (Found images): {ok_count}")
print(f"Missing Folders: {len(missing_folders)}")
print(f"Empty Folders (No JPG): {len(empty_folders)}")

if missing_folders:
    print("\nSamples of missing folders:")
    for f in missing_folders[:5]:
        print(f"  - '{f}'")
        
if empty_folders:
    print("\nSamples of empty folders:")
    for f in empty_folders[:5]:
        print(f"  - '{f}'")
