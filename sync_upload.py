import os, json, hashlib, requests
from dotenv import load_dotenv
load_dotenv('.env.local')
U = os.environ.get('NEXT_PUBLIC_SUPABASE_URL')
S = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')
D = '_json_data'
def sync():
    files = [f for f in os.listdir(D) if f.endswith('.json')]
    h = {'apikey': S, 'Authorization': f'Bearer {S}', 'Content-Type': 'application/json'}
    # First, Wipe the existing data for a total clean sync
    requests.delete(f'{U}/rest/v1/insurance_cards?id=neq.0', headers=h) # Delete all records (all IDs are UUID-like, none are 0)
    print('Database Wiped.')
    recs = []
    for f in files:
        with open(os.path.join(D, f), 'r', encoding='utf-8') as jf:
            d = json.load(jf)
            t = d.get('title', 'Untitled')
            # Consistent sanitation for IDs and folder resolution
            clean_t = t.replace('&amp;', ' ').replace('&#039;', '').replace('+', ' ').strip()
            # ID based on Filename for absolute uniqueness if same title
            rid = hashlib.md5(f.encode('utf-8')).hexdigest()
            uid = f'{rid[:8]}-{rid[8:12]}-{rid[12:16]}-{rid[16:20]}-{rid[20:]}'
            recs.append({ 'id': uid, 'title': t, 'category': d.get('category', '전체'), 'summary': d.get('summary', ''), 'images': d.get('images', []), 'image_count': d.get('image_count', 0), 'tags': d.get('tags', []), 'key_points': d.get('key_points', []) })
    if recs:
        r = requests.post(f'{U}/rest/v1/insurance_cards', headers=h, json=recs)
        print(f'Success! {len(recs)} records are now live (Status: {r.status_code}).')
sync()
