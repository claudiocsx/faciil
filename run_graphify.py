import json
from pathlib import Path
import sys

try:
    from graphify.extract import collect_files, extract
except ImportError:
    print("Graphify not properly installed")
    sys.exit(1)

code_files = []

root = Path('.')
for pattern in ['src/**/*.jsx', 'src/**/*.js', '*.js', 'public/sw.js']:
    code_files.extend(root.glob(pattern))

code_files = [f for f in code_files if f.is_file()][:30]

if code_files:
    result = extract(code_files)
    Path('graphify-out/.graphify_ast.json').write_text(json.dumps(result, indent=2))
    print(f'AST: {len(result["nodes"])} nodes, {len(result["edges"])} edges')
else:
    Path('graphify-out/.graphify_ast.json').write_text(json.dumps({'nodes':[],'edges':[],'input_tokens':0,'output_tokens':0}))
    print('No code files - skipping AST extraction')