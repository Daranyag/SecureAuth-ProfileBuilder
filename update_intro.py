import re

with open('frontend/src/pages/ProfileBuilder.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add state variable
if 'additionalIntroSentence' not in content:
    content = content.replace(
        "const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);",
        "const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);\n  const [additionalIntroSentence, setAdditionalIntroSentence] = useState('');"
    )

# 2. Add handleAddAdditionalSentence
func_to_add = '''
  const handleAddAdditionalSentence = () => {
    if (!additionalIntroSentence.trim()) return;
    const currentIntro = profile.generatedIntro || '';
    const newIntro = currentIntro ? currentIntro + '\\n\\n' + additionalIntroSentence.trim() : additionalIntroSentence.trim();
    setProfile(prev => ({ ...prev, generatedIntro: newIntro }));
    setHasUnsavedChanges(true);
    setAdditionalIntroSentence('');
  };
'''
if 'handleAddAdditionalSentence' not in content:
    idx = content.find('const handleLabelChange = (e) => {')
    if idx != -1:
        content = content[:idx] + func_to_add + '\n  ' + content[idx:]

# 3. Modify generateSmartIntro for Family
old_family = '''    const parentParts = [];
    if (fat && !shouldRemove(opts, ['Father Name', 'Father'], ['Family Details', 'Family'])) parentParts.push(`my father is ${fat}`);
    if (mot && !shouldRemove(opts, ['Mother Name', 'Mother'], ['Family Details', 'Family'])) parentParts.push(`my mother is ${mot}`);
    if (parentParts.length > 0) para4Parts.push(`In my family, ${parentParts.join(' and ')}.`);

    if (sib && !shouldRemove(opts, ['Siblings', 'Sibling Details'], ['Family Details', 'Family'])) para4Parts.push(`I have ${sib}.`);'''

new_family = '''    const fatLabel = (p.labels && p.labels.fatherName !== undefined) ? p.labels.fatherName : 'Father Name';
    if (fat && !shouldRemove(opts, ['Father Name', 'Father'], ['Family Details', 'Family'])) para4Parts.push(`My ${fatLabel} is ${fat}.`);
    
    const motLabel = (p.labels && p.labels.motherName !== undefined) ? p.labels.motherName : 'Mother Name';
    if (mot && !shouldRemove(opts, ['Mother Name', 'Mother'], ['Family Details', 'Family'])) para4Parts.push(`My ${motLabel} is ${mot}.`);

    const sibLabel = (p.labels && p.labels.siblings !== undefined) ? p.labels.siblings : 'Siblings';
    if (sib && !shouldRemove(opts, ['Siblings', 'Sibling Details'], ['Family Details', 'Family'])) para4Parts.push(`My ${sibLabel} is ${sib}.`);'''

content = content.replace(old_family, new_family)

# 4. Modify generateSmartIntro for Dream Job
old_dream = '''    if (hasGoal && hasDream) {
      if (v === 0) para3Parts.push(`My ultimate career goal is to excel as a ${goal}, and I dream of contributing my skills at ${dream}.`);
      else if (v === 1) para3Parts.push(`Looking ahead, I aim to establish myself as a ${goal} with aspirations to join ${dream}.`);
      else para3Parts.push(`I am driven by the goal of becoming a ${goal}, and it is my dream to be part of the team at ${dream}.`);
    } else if (hasGoal) {
      para3Parts.push(`My long-term career goal is to become a successful ${goal}.`);
    } else if (hasDream) {
      para3Parts.push(`It is my lifelong dream to work at ${dream}.`);
    }'''

new_dream = '''    const dreamLabel = (p.labels && p.labels.dreamJobRole !== undefined) ? p.labels.dreamJobRole : 'Dream Company';
    if (hasGoal && hasDream) {
      if (v === 0) para3Parts.push(`My ultimate career goal is to excel as a ${goal}, and my ${dreamLabel} is ${dream}.`);
      else if (v === 1) para3Parts.push(`Looking ahead, I aim to establish myself as a ${goal} with aspirations to join ${dream}, where my ${dreamLabel} is ${dream}.`);
      else para3Parts.push(`I am driven by the goal of becoming a ${goal}, and my ${dreamLabel} is ${dream}.`);
    } else if (hasGoal) {
      para3Parts.push(`My long-term career goal is to become a successful ${goal}.`);
    } else if (hasDream) {
      para3Parts.push(`My ${dreamLabel} is ${dream}.`);
    }'''

content = content.replace(old_dream, new_dream)

# 5. Add Additional Information UI after Intro Card
ui_to_inject = '''
              <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--panel-border)' }}>
                <h4 style={{ fontSize: '1rem', marginBottom: '12px', color: 'var(--text-primary)' }}>Additional Information</h4>
                <textarea
                  rows="3"
                  placeholder="Write any additional sentence or information you want to include in your self introduction. Example: I actively participate in coding competitions and enjoy learning emerging technologies."
                  value={additionalIntroSentence}
                  onChange={(e) => setAdditionalIntroSentence(e.target.value)}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--panel-border)', background: 'var(--input-bg)', color: 'var(--text-primary)', fontSize: '0.95rem', marginBottom: '12px', fontFamily: 'inherit', resize: 'vertical' }}
                />
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleAddAdditionalSentence}
                  style={{ padding: '10px 20px', fontSize: '0.95rem' }}
                >
                  Add To Introduction
                </button>
              </div>

              <div style={{ display: 'flex', gap: '16px', marginTop: '24px' }}>'''

# Look for the exact HTML string that matches the download button container
target_div = "              <div style={{ display: 'flex', gap: '16px', marginTop: '24px' }}>"
if 'Additional Information' not in content:
    content = content.replace(target_div, ui_to_inject)

with open('frontend/src/pages/ProfileBuilder.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
