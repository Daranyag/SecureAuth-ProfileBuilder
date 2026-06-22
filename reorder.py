import re

with open('frontend/src/pages/ProfileBuilder.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# We need to extract the family logic from para4Parts and put it into a new familyParts paragraph before para2Parts
# Currently, it is right after `// ── Paragraph 4: Family + Custom (optional) ────────────────────`
# Let's find that block.

family_logic = '''    const famBg = cln(p.familyBackground);
    const fat = cln(p.fatherName);
    const mot = cln(p.motherName);
    const sib = cln(p.siblings);

    if (famBg && !shouldRemove(opts, ['Family Background'], ['Family Details', 'Family'])) {
      if (v === 0) para4Parts.push(`On a personal note, I come from a ${famBg} background.`);
      else if (v === 1) para4Parts.push(`My personal foundation is rooted in a ${famBg} background.`);
      else para4Parts.push(`I was raised in a supportive ${famBg} environment.`);
    }

    const fatLabel = (p.labels && p.labels.fatherName !== undefined) ? p.labels.fatherName : 'Father Name';
    if (fat && !shouldRemove(opts, ['Father Name', 'Father'], ['Family Details', 'Family'])) para4Parts.push(`My ${fatLabel} is ${fat}.`);
    
    const motLabel = (p.labels && p.labels.motherName !== undefined) ? p.labels.motherName : 'Mother Name';
    if (mot && !shouldRemove(opts, ['Mother Name', 'Mother'], ['Family Details', 'Family'])) para4Parts.push(`My ${motLabel} is ${mot}.`);

    const sibLabel = (p.labels && p.labels.siblings !== undefined) ? p.labels.siblings : 'Siblings';
    if (sib && !shouldRemove(opts, ['Siblings', 'Sibling Details'], ['Family Details', 'Family'])) para4Parts.push(`My ${sibLabel} is ${sib}.`);'''

# Remove family logic from its original place
if family_logic in content:
    content = content.replace(family_logic, '')

# We need to inject it before `// ── Paragraph 2: Status-Specific Details ──────────────────────────────────`
# And we need to change `para4Parts` to `familyParts` inside the family_logic block.

family_logic_new = family_logic.replace('para4Parts', 'familyParts')

injection_block = '''    // ── Paragraph 1.5: Family ──────────────────────────────────────────────────
    const familyParts = [];
''' + family_logic_new + '''

    if (familyParts.length > 0) paragraphs.push(familyParts.join(' '));

    // ── Paragraph 2: Status-Specific Details ──────────────────────────────────'''

content = content.replace('    // ── Paragraph 2: Status-Specific Details ──────────────────────────────────', injection_block)

with open('frontend/src/pages/ProfileBuilder.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
