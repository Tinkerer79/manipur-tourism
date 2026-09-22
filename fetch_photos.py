#!/usr/bin/env python3
"""Fetch freely-licensed photos of Manipur destinations from Wikimedia Commons.
Downloads a web-width thumb for each destination that has a good match and
records author + licence in assets/ATTRIBUTIONS.txt."""
import json, os, sys, time, subprocess, urllib.parse, re

ROOT = os.path.dirname(os.path.abspath(__file__))
IMG = os.path.join(ROOT, 'assets', 'img')
os.makedirs(IMG, exist_ok=True)

QUERIES = {
    'ima-keithel': ['Ima Keithel market', 'Nupi Keithel', 'women market Imphal', 'Ima market Manipur stalls'],
    'kaina': ['Kaina hill shrine Manipur', 'Kaina temple Imphal Manipur'],
    'tamenglong': ['Tamenglong hills landscape', 'Tamenglong Manipur town view', 'Barak Tamenglong'],
    'barak-falls': ['Barak waterfalls Tamenglong', 'Barak falls Manipur', 'waterfall Tamenglong'],
    'moreh': ['Moreh India Myanmar gate', 'Moreh border town India', 'Friendship Gate Moreh Manipur'],
}

OK_LIC = re.compile(r'(cc0|public domain|cc by(?!-nc)(?!-nd)|cc by-sa|attribution|pd)', re.I)
BAD_LIC = re.compile(r'(nc|nd|fair use|non-free)', re.I)

API = 'https://commons.wikimedia.org/w/api.php'

def api(params):
    params = dict(params, format='json')
    url = API + '?' + urllib.parse.urlencode(params)
    for attempt in range(4):
        out = subprocess.run(['curl', '-s', '-m', '30', '-A', 'SanaLeibak-demo/1.0 (travel site asset fetch)', url],
                             capture_output=True, text=True)
        try:
            return json.loads(out.stdout)
        except Exception:
            time.sleep(4 * (attempt + 1))
    raise RuntimeError(f'api failed after retries: {url[:120]}')

def strip_html(s):
    return re.sub(r'<[^>]+>', '', s or '').strip()

def find_image(dest_id, queries):
    for q in queries:
        try:
            data = api({
                'action': 'query', 'prop': 'imageinfo',
                'iiprop': 'url|size|extmetadata', 'iiurlwidth': 1600,
                'generator': 'search', 'gsrsearch': f'{q} filetype:bitmap',
                'gsrlimit': 10, 'gsrnamespace': 6,
            })
        except Exception as e:
            print(f'  ! api error for "{q}": {e}')
            continue
        pages = (data.get('query') or {}).get('pages') or {}
        candidates = []
        for p in pages.values():
            ii = (p.get('imageinfo') or [None])[0]
            if not ii:
                continue
            w, h = ii.get('width', 0), ii.get('height', 0)
            meta = ii.get('extmetadata') or {}
            lic = strip_html((meta.get('LicenseShortName') or {}).get('value', ''))
            artist = strip_html((meta.get('Artist') or {}).get('value', '')) or 'Unknown author'
            title = p.get('title', '')
            if w < 900 or h < 500:
                continue
            if not (0.45 <= (w / h) <= 2.4):
                continue
            if not lic or BAD_LIC.search(lic) or not OK_LIC.search(lic):
                continue
            # avoid obviously irrelevant files (maps, diagrams, coats of arms)
            tl = title.lower()
            if any(bad in tl for bad in ('map', 'diagram', 'logo', 'coat_of_arms', 'seal', 'flag', 'chart', 'plan_')):
                continue
            score = 0
            if q.split()[0].lower() in tl:
                score += 2
            if 'jpg' in tl or 'jpeg' in tl:
                score += 1
            score += min(w / 2000, 1.5)
            candidates.append((score, ii.get('thumburl') or ii.get('url'), title, artist, lic))
        if candidates:
            candidates.sort(reverse=True)
            _, url, title, artist, lic = candidates[0]
            return url, title, artist, lic
        time.sleep(0.25)
    return None

def download(url, dest):
    subprocess.run(['curl', '-sL', '-m', '60', '-A', 'SanaLeibak-demo/1.0 (travel site asset fetch)',
                    '-o', dest, url], check=True)

def main():
    only = set(sys.argv[1:])
    lines = ['Photo attributions — Sana Leibak asset pipeline',
             'Source: Wikimedia Commons. Each file is used under the licence listed.',
             '']
    got, missed = [], []
    for dest_id, queries in QUERIES.items():
        if only and dest_id not in only:
            continue
        out_path = os.path.join(IMG, f'{dest_id}.jpg')
        if os.path.exists(out_path) and os.path.getsize(out_path) > 30000:
            print(f'= {dest_id}: already present')
            continue
        res = find_image(dest_id, queries)
        if not res:
            print(f'- {dest_id}: no suitable image (placeholder will be used)')
            missed.append(dest_id)
            continue
        url, title, artist, lic = res
        try:
            download(url, out_path)
        except Exception as e:
            print(f'  ! download failed for {dest_id}: {e}')
            missed.append(dest_id)
            continue
        size = os.path.getsize(out_path)
        print(f'+ {dest_id}: {title} [{lic}] ({size // 1024} KB)')
        lines.append(f'{dest_id}.jpg — {title} — by {artist} — licence: {lic} — {url}')
        got.append(dest_id)
        time.sleep(0.3)
    with open(os.path.join(ROOT, 'assets', 'ATTRIBUTIONS.txt'), 'a', encoding='utf-8') as f:
        f.write('\n'.join(lines) + '\n')
    print(f'\nDownloaded {len(got)}, missing {len(missed)}: {", ".join(missed)}')

if __name__ == '__main__':
    main()
