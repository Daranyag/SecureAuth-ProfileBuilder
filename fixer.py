import re

with open('frontend/src/pages/ProfileBuilder.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

def replacer(match):
    before = match.group(1)
    val_expr = match.group(2)
    after = match.group(3)
    
    m = re.search(r'\(p\.labels && p\.labels\.([a-zA-Z0-9_]+)\)\s*\|\|\s*\"(.*?)\"', val_expr, re.DOTALL)
    if m:
        var_name = m.group(1)
        raw_label = m.group(2)
        clean_label = raw_label.replace('\\n', '').strip()
        # Remove extra whitespace between words in case of multi-line strings
        clean_label = re.sub(r'\s+', ' ', clean_label)
        
        new_val_expr = f'(p.labels && p.labels.{var_name} !== undefined) ? p.labels.{var_name} : \"{clean_label}\"'
        return f'{before}value={{{new_val_expr}}}{after}'
    return match.group(0)

pattern = re.compile(r'(<input[^>]+?name=\"[a-zA-Z0-9_]+\"[^>]*?)value=\{([^}]+)\}([^>]*?onChange=\{handleLabelChange\})')
content = pattern.sub(replacer, content)

with open('frontend/src/pages/ProfileBuilder.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
