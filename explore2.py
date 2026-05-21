import json
from pathlib import Path

data = json.loads(Path('graphify-out/graph.json').read_text())
nodes = data['nodes']
edges = data['links']

for nid in ['components_storefront_tech_categories', 'components_storefront_carousel_offers', 'components_storefront_carousel_coupons']:
    for n in nodes:
        if n['id'] == nid:
            print(f"{n['id']}")
            print(f"  label: {n.get('label', nid)}")
            print(f"  source_file: {n.get('source_file', '?')}")
            break

print("\nArestas:")
for e in edges:
    src = e['source']
    tgt = e['target']
    if 'storefront_tech' in src or 'storefront_tech' in tgt or 'carousel' in src or 'carousel' in tgt:
        rel = e.get('relation', '?')
        print(f"  {src} --{rel}--> {tgt}")