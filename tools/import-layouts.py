"""Import a SelcaBooth ZIP export without installing packages.
Usage: python3 tools/import-layouts.py /path/to/layouts.zip
Existing assets are retained to keep imports reversible.
"""
import json, pathlib, sys, zipfile
root=pathlib.Path(__file__).resolve().parents[1]/'docs'
with zipfile.ZipFile(sys.argv[1]) as archive:
    candidates=[n for n in archive.namelist() if n.endswith('/layouts.json') or n=='layouts.json']
    if len(candidates)!=1: raise SystemExit('Expected exactly one layouts.json')
    base=candidates[0][:-len('layouts.json')]
    data=json.loads(archive.read(candidates[0]))
    enabled={l['id']:l for l in data['layouts'] if l.get('enabled',True)}
    order=[i for i in data.get('layoutOrder',[]) if i in enabled]
    order+= [i for i in enabled if i not in order]
    layouts=[]; paths=set()
    for id in order:
        l=enabled[id]
        item={k:l[k] for k in ['id','name','styleGroupId','canvas','photoSlots','decorations','imageLayers','background','cutMode']}
        item['assetReferences']=[{'assetId':a['assetId'],'relativePath':a['relativePath']} for a in l.get('assetReferences',[])]
        paths.update(a['relativePath'] for a in item['assetReferences'])
        paths.update(a['source'] for a in item['decorations'])
        layouts.append(item)
    for path in paths:
        rel=pathlib.PurePosixPath(path)
        if rel.is_absolute() or '..' in rel.parts or not path.startswith('assets/'):raise SystemExit('Invalid asset path: '+path)
        target=root/path;target.parent.mkdir(parents=True,exist_ok=True)
        target.write_bytes(archive.read(base+path))
    groups=[{'id':g['id'],'name':g['name']} for g in data['styleGroups'] if g.get('enabled',True) and any(l['styleGroupId']==g['id'] for l in layouts)]
    groupids={g['id'] for g in groups};layouts=[l for l in layouts if l['styleGroupId'] in groupids]
    payload={'groups':groups,'layouts':layouts}
    (root/'catalogue.js').write_text('window.SELCA_CATALOGUE = '+json.dumps(payload,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf-8')
    print(f'Imported {len(layouts)} layouts. Run node tools/validate.cjs and check the website before publishing.')
