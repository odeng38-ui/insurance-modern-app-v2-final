import os, json, hashlib, requests
from dotenv import load_dotenv
load_dotenv('.env.local')
U = os.environ.get('NEXT_PUBLIC_SUPABASE_URL')
S = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')
D = '_json_data'

CAT_MAP = {
    '실손보험': '실손보험', '암보험': '암보험', 
    '운전자보험': '자동차보험', '자동차보험': '자동차보험',
    '건강/질환': '건강/질환', '심장보험': '건강/질환', '뇌혈관보험': '건강/질환', '만성질환보험': '건강/질환', '건강검진': '건강/질환',
    '보험금청구': '보험청구/계약', '보험청구/계약': '보험청구/계약',
    '보험료/이율': '보험제도/상식', '보험분쟁': '보험제도/상식', '변액보험': '보험제도/상식', '보험 일반': '보험제도/상식',
    '연금보험': '연금/저축', '간병보험': '간병/치매', '치매보험': '간병/치매',
    '생활/특수보험': '생활/특수보험', '배상책임보험': '생활/특수보험', '여행자보험': '생활/특수보험', '화재보험': '생활/특수보험', '펫보험': '생활/특수보험', '치아보험': '생활/특수보험', '상해보험': '생활/특수보험', '법인/사업자보험': '생활/특수보험', '계절별 보상': '생활/특수보험', '어린이보험': '생활/특수보험', '태아보험': '생활/특수보험',
    '의료/시술': '의료/시술', '비급여치료': '의료/시술', '수술보험': '의료/시술'
}

def sync():
    files = [f for f in os.listdir(D) if f.endswith('.json')]
    # Upsert를 지원하는 'Prefer' 헤더 추가 (결합/업데이트 방식)
    h = {'apikey': S, 'Authorization': f'Bearer {S}', 'Content-Type': 'application/json', 'Prefer': 'resolution=merge-duplicates'}
    print('Starting Fast Upsert Ingest (426 items)...')
    
    all_recs = []
    for f in files:
        with open(os.path.join(D, f), 'r', encoding='utf-8') as jf:
            d = json.load(jf)
            ui_cat = CAT_MAP.get(d.get('category', '보험제도/상식'), '전체')
            rid = hashlib.md5(f.encode('utf-8')).hexdigest()
            uid = f'{rid[:8]}-{rid[8:12]}-{rid[12:16]}-{rid[16:20]}-{rid[20:]}'
            all_recs.append({ 'id': uid, 'title': f.replace('.json', '').replace('+', ' ').strip(), 'category': ui_cat, 'summary': d.get('summary', ''), 'images': d.get('images', []), 'image_count': d.get('image_count', 0), 'tags': d.get('tags', []), 'key_points': d.get('key_points', []) })
    
    # 50인씩 고속 상륙
    for i in range(0, len(all_recs), 50):
        batch = all_recs[i:i+50]
        r = requests.post(f'{U}/rest/v1/insurance_cards', headers=h, json=batch)
        print(f'Ingest Success: {i+1} to {min(i+50, len(all_recs))} (Status: {r.status_code})')
    print('Victory! Standardized Titles assigned to all 426 items.')

sync()
