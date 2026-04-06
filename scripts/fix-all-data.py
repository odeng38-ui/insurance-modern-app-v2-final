import os, json, requests, re
from dotenv import load_dotenv

# 1. 환경 설정 및 Supabase 인증 정보 로드
load_dotenv('c:/Users/HP/.antigravity/Insurance_app/.env.local')
SUPABASE_URL = os.environ.get('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')

# 폴더 및 데이터 경로 설정
IMAGE_ROOT = 'c:/Users/HP/.antigravity/Insurance_app/public/images/cards'
JSON_DATA_DIR = 'c:/Users/HP/.antigravity/Insurance_app/_json_data'

def clean_text(t):
    if not t: return ""
    return t.replace('&#039;', '').replace('&amp;', ' ').strip()

def fix_all_data():
    if not SUPABASE_URL or not SUPABASE_KEY:
        print("Error: Supabase credentials missing (check .env.local).")
        return

    headers = {
        'apikey': SUPABASE_KEY,
        'Authorization': f'Bearer {SUPABASE_KEY}',
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
    }

    # 1. 현재 모든 폴더 리스트 확보
    all_folders = [f for f in os.listdir(IMAGE_ROOT) if os.path.isdir(os.path.join(IMAGE_ROOT, f))]
    print(f"Found {len(all_folders)} physical folders in {IMAGE_ROOT}.")

    # 2. 모든 JSON 데이터 인메모리 로드 (매칭용)
    json_metadata = []
    json_files = [f for f in os.listdir(JSON_DATA_DIR) if f.endswith('.json')]
    for jf in json_files:
        try:
            with open(os.path.join(JSON_DATA_DIR, jf), 'r', encoding='utf-8') as f:
                d = json.load(f)
                d['_filename'] = jf
                json_metadata.append(d)
        except Exception as e:
            print(f"Skipping {jf}: {e}")

    # 3. 데이터 동기화 리스트 생성
    final_records = []
    
    print("\nSynchronizing folders with metadata...")
    for folder in all_folders:
        folder_path = os.path.join(IMAGE_ROOT, folder)
        images = sorted([i for i in os.listdir(folder_path) if i.lower().endswith(('.jpg', '.jpeg', '.png', '.webp'))])
        
        # 매칭 시도 (제목 또는 파일명 기준)
        matched_data = None
        for data in json_metadata:
            title = data.get('title', '')
            folder_in_data = data.get('folder_name', '')
            
            # 1순위: 폴더명과 folder_name 필드 일치
            # 2순위: 폴더명과 제목이 정확히 일치
            if folder == folder_in_data or folder == title:
                matched_data = data
                break
            
            # Fuzzy match
            s_folder = re.sub(r'[^가-힣A-Za-z0-9]', '', folder)
            s_title = re.sub(r'[^가-힣A-Za-z0-9]', '', title)
            if s_folder == s_title and len(s_folder) > 2:
                matched_data = data
                break

        # 레코드 생성
        record = {
            'id': folder,           # ID를 폴더명으로 통일 (URL 파라마터로 사용)
            'title': folder,        # 제목도 폴더명으로 통일 (이미지 경로 빌드 시 사용)
            'images': images,
            'image_count': len(images),
            'category': '전체',
            'summary': '',
            'tags': [],
            'key_points': [],
            'content': ''           # content 필드 누락 방지
        }

        if matched_data:
            record['category'] = matched_data.get('category', '전체')
            record['summary'] = clean_text(matched_data.get('summary', ''))
            record['content'] = clean_text(matched_data.get('content', ''))
            record['tags'] = [clean_text(t) for t in matched_data.get('tags', [])]
            record['key_points'] = [clean_text(k) for k in matched_data.get('key_points', [])]
        
        final_records.append(record)

    # 4. DB 일괄 업데이트 (Supabase Upsert)
    print(f"\nUploading {len(final_records)} standardized records to Supabase...")
    
    # 50개씩 나눠서 업로드 (안정성)
    chunk_size = 50
    success_count = 0
    for i in range(0, len(final_records), chunk_size):
        chunk = final_records[i : i + chunk_size]
        try:
            r = requests.post(f"{SUPABASE_URL}/rest/v1/insurance_cards", headers=headers, json=chunk)
            if r.status_code in [200, 201, 204]:
                success_count += len(chunk)
                print(f"  [Progress] {success_count}/{len(final_records)} records synced.")
            else:
                print(f"  [Error] Chunk {i // chunk_size + 1} failed: {r.status_code} - {r.text}")
        except Exception as e:
            print(f"  [Exception] Chunk {i // chunk_size + 1} error: {e}")

    print(f"\nSync Completed! Total {success_count} records are now live with correct paths.")

if __name__ == '__main__':
    fix_all_data()
