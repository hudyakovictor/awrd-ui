#!/usr/bin/env python3
import argparse,json,re,sys
from pathlib import Path
ap=argparse.ArgumentParser();ap.add_argument('path');ap.add_argument('--level',type=int,required=True);ap.add_argument('--player-only',action='store_true');a=ap.parse_args()
lex=json.loads((Path(__file__).parent/'lexicon.json').read_text())
paths=[Path(a.path)] if Path(a.path).is_file() else list(Path(a.path).rglob('*.json'))
viol=[]
for p in paths:
 text=p.read_text().lower()
 for e in lex:
  if e['level']>a.level:
   for form in e['forms']:
    if re.search(r'(?<!\w)'+re.escape(form.lower())+r'(?!\w)',text):viol.append((str(p),e['term'],e['level']))
for v in viol:print(f'{v[0]}: term "{v[1]}" unlocks at level {v[2]}')
sys.exit(1 if viol else 0)
