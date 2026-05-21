import json
import networkx as nx
from networkx.readwrite import json_graph
from pathlib import Path

data = json.loads(Path('graphify-out/graph.json').read_text())
G = json_graph.node_link_graph(data, edges='links')

terms = ['tech_categories', 'carousel_offers', 'carousel_coupons']
scored = []
for nid in G.nodes():
    label = nid.lower()
    score = sum(1 for t in terms if t in label)
    if score > 0:
        scored.append((score, nid))

start_nodes = [nid for _, nid in scored]
print('Nos encontrados:', start_nodes)

for nid in start_nodes:
    print(f'\n--- {nid} ---')
    print(f'Tipo: {G.nodes[nid].get("file_type", "?")}')
    print(f'Arestas: {G.degree(nid)}')
    for neighbor in G.neighbors(nid):
        edge_data = G[nid][neighbor]
        rel = list(edge_data.values())[0].get('relation', '?') if edge_data else '?'
        print(f'  -> {neighbor} ({rel})')