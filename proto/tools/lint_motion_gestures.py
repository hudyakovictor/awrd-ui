#!/usr/bin/env python3
from pathlib import Path
import json,re,sys
r=Path(__file__).parents[1];errs=[]
# Canonical files only; vendor/reference copies are separately inventoried.
for p in [r/'shared.css',r/'batch.css',r/'group.css']:
 s=p.read_text()
 if 'repeat: Infinity' in s:errs.append(f'{p}: infinite repeat')
 # numeric timings are allowed only in :root token declarations.
 body=re.sub(r':root\{[^}]+\}','',s)
 if re.search(r'(?<![\w-])(\d+ms|\d*\.\d+s)',body):errs.append(f'{p}: raw timing outside tokens')
g=json.loads((r/'tools/gesture_dictionary.json').read_text())
if len({x['gesture'] for x in g})!=len(g):errs.append('duplicate gesture')
if any(not x.get('alternative') for x in g):errs.append('gesture missing alternative')
print(json.dumps({'motionFiles':3,'gestures':len(g),'errors':errs},ensure_ascii=False));sys.exit(bool(errs))
