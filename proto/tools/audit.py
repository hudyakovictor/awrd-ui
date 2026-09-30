#!/usr/bin/env python3
import json,sys
from pathlib import Path
r=Path(__file__).parents[1];files=list((r/'fixtures').rglob('*.json'));tests=list((r/'tests').rglob('*.json'));errors=[]
for p in files:
 x=json.loads(p.read_text())
 if len(x['cases'])!=3:errors.append(f'{p}: modes')
 for c in x['cases']:
  if c['decisions']>7:errors.append(f'{p}: decisions')
  if c['sources']>4:errors.append(f'{p}: sources')
  if c['futureVisible']:errors.append(f'{p}: future')
 if len(x['telemetry'])<10:errors.append(f'{p}: telemetry')
 weights=[o['weight'] for o in x.get('scoring',{}).get('options',[])]
 if weights.count(100)!=1 or any(w>20 for w in weights if w<60):errors.append(f'{p}: scoring')
 if x.get('scoring',{}).get('speedIncluded') is not False:errors.append(f'{p}: speed')
routes=list((r/'lab').glob('*/*/index.html'))
if len(routes)!=len(files):errors.append(f'routes {len(routes)} != fixtures {len(files)}')
print(json.dumps({'fixtures':len(files),'tests':len(tests),'routes':len(routes),'errors':errors},ensure_ascii=False))
sys.exit(bool(errors))
