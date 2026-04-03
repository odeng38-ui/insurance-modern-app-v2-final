import os, json, hashlib, requests
from dotenv import load_dotenv
load_dotenv('.env.local')
U = os.environ.get('NEXT_PUBLIC_SUPABASE_URL')
S = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')
D = '_json_data'
def c(t): return t.replace('&#039;', '').replace('&amp;', ' ').strip() if t else ''
def u():
    if not U or not S: return
    files = [f for f in os.listdir(D) if f.endswith('.json')]
    print(f'Detected {len(files)} JSON files.')
    h = {'apikey': S, 'Authorization': f'Bearer {S}', 'Content-Type': 'application/json', 'Prefer': 'resolution=merge-duplicates'}
    recs = []
    for f in files:
        try:
            with open(os.path.join(D, f), 'r', encoding='utf-8') as jf:
                d = json.load(jf)
                t = c(d.get('title', 'Untitled'))
                seed = f'{t}_{f}'
                rid = hashlib.md5(seed.encode('utf-8')).hexdigest()
                uid = f'{rid[:8]}-{rid[8:12]}-{rid[12:16]}-{rid[16:20]}-{rid[20:]}'
                recs.append({ 'id': uid, 'title': t, 'category': d.get('category', '전체'), 'tags': [c(tg) for tg in d.get('tags', [])], 'summary': c(d.get('summary', '')), 'content': d.get('content', ''), 'key_points': [c(k) for k in d.get('key_points', [])], 'image_count': d.get('image_count', 0), 'images': d.get('images', []) })
        except: pass
    r = requests.post(f'{U}/rest/v1/insurance_cards', headers=h, json=recs)
    if r.status_code in [200, 201, 204]: print(f'Success! {len(recs)} records uploaded.')
u()