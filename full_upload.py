import os, json, hashlib, requests
from dotenv import load_dotenv
load_dotenv('.env.local')
U = os.environ.get('NEXT_PUBLIC_SUPABASE_URL')
S = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')
D = '_json_data'
def u():
    files = [f for f in os.listdir(D) if f.endswith('.json')]
    print(f'Detected {len(files)} files.')
    h = {'apikey': S, 'Authorization': f'Bearer {S}', 'Content-Type': 'application/json'}
    recs = []
    for f in files:
        try:
            with open(os.path.join(D, f), 'r', encoding='utf-8') as jf:
                d = json.load(jf)
                t = d.get('title', 'Untitled')
                # Secure unique ID
                rid = hashlib.md5(f'{t}_{f}'.encode('utf-8')).hexdigest()
                uid = f'{rid[:8]}-{rid[8:12]}-{rid[12:16]}-{rid[16:20]}-{rid[20:]}'
                recs.append({ 'id': uid, 'title': t, 'category': d.get('category', '전체'), 'summary': d.get('summary', ''), 'images': d.get('images', []), 'image_count': d.get('image_count', 0), 'tags': d.get('tags', []), 'key_points': d.get('key_points', []) })
        except: pass
    if recs:
        # UPSERT logic via POST (relying on ID uniqueness)
        r = requests.post(f'{U}/rest/v1/insurance_cards', headers=h, json=recs)
        print(f'Success! {len(recs)} records are now live (Status: {r.status_code}).')
u()
